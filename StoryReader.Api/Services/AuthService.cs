using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Dtos;
using StoryReader.Api.Models.Entities;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _users;
    private readonly IConfiguration _config;
    private readonly AppDbContext _db;
    private readonly IAppCacheService _cache;

    public AuthService(
        UserManager<AppUser> users,
        IConfiguration config,
        AppDbContext db,
        IAppCacheService cache)
    {
        _users = users;
        _config = config;
        _db = db;
        _cache = cache;
    }

    public async Task<AuthResultDto> RegisterAsync(RegisterDto dto)
    {
        var email = dto.Email?.Trim() ?? string.Empty;
        var displayName = dto.DisplayName?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(email) || !new EmailAddressAttribute().IsValid(email) || email.Length > 100)
            throw new InvalidOperationException("Địa chỉ email không hợp lệ.");

        if (string.IsNullOrWhiteSpace(displayName) || displayName.Length > 50)
            throw new InvalidOperationException("Tên hiển thị không được để trống và tối đa 50 ký tự.");

        if (string.IsNullOrWhiteSpace(dto.Password) || dto.Password.Length < 6 || dto.Password.Length > 128)
            throw new InvalidOperationException("Mật khẩu phải từ 6 đến 128 ký tự.");

        var user = new AppUser { UserName = email, Email = email, DisplayName = displayName };
        var result = await _users.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));

        await _users.AddToRoleAsync(user, "Member");
        return await IssueTokenPairAsync(user);
    }

    public async Task<AuthResultDto> LoginAsync(LoginDto dto)
    {
        var email = dto.Email?.Trim() ?? string.Empty;
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(dto.Password))
            throw new InvalidOperationException("Email hoặc mật khẩu không đúng.");

        var user = await _users.FindByEmailAsync(email)
            ?? throw new InvalidOperationException("Email hoặc mật khẩu không đúng.");

        if (user.IsRestricted)
            throw new InvalidOperationException("Tài khoản đang bị hạn chế.");

        if (await _users.IsLockedOutAsync(user))
            throw new InvalidOperationException("Tài khoản tạm thời bị khóa do nhập sai mật khẩu nhiều lần. Vui lòng thử lại sau 15 phút.");

        var valid = await _users.CheckPasswordAsync(user, dto.Password);
        if (!valid)
        {
            await _users.AccessFailedAsync(user);
            throw new InvalidOperationException("Email hoặc mật khẩu không đúng.");
        }

        await _users.ResetAccessFailedCountAsync(user);
        return await IssueTokenPairAsync(user);
    }

    public async Task<AuthResultDto> RefreshAsync(string refreshToken)
    {
        var raw = refreshToken?.Trim();
        if (string.IsNullOrWhiteSpace(raw))
            throw new InvalidOperationException("Refresh token không hợp lệ.");

        var tokenHash = ComputeSha256Hex(raw);
        var stored = await _db.RefreshTokens
            .Include(rt => rt.User)
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);

        if (stored is null)
            throw new InvalidOperationException("Phiên làm việc không tồn tại hoặc đã hết hạn.");

        if (stored.RevokedAt is not null)
        {
            // Phát hiện dùng lại token đã xoay vòng -> thu hồi toàn bộ phiên của user để chống đánh cắp phiên
            await RevokeAllUserSessionsAsync(stored.UserId);
            throw new InvalidOperationException("Phiên làm việc đã bị thu hồi. Vui lòng đăng nhập lại.");
        }

        if (stored.ExpiresAt <= DateTime.UtcNow)
            throw new InvalidOperationException("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");

        if (stored.User is null || stored.User.IsRestricted)
            throw new InvalidOperationException("Tài khoản đang bị hạn chế hoặc không tồn tại.");

        var (newRawRefresh, newHash, newRefreshExpires) = GenerateRefreshTokenData();
        stored.RevokedAt = DateTime.UtcNow;
        stored.ReplacedByTokenHash = newHash;

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = stored.UserId,
            TokenHash = newHash,
            ExpiresAt = newRefreshExpires
        });

        await _db.SaveChangesAsync();
        return await BuildAccessResultAsync(stored.User, newRawRefresh);
    }

    public async Task RevokeSessionAsync(string? jti, DateTime? accessTokenExpiresAtUtc, string? refreshToken = null)
    {
        if (!string.IsNullOrWhiteSpace(jti))
        {
            var ttl = accessTokenExpiresAtUtc.HasValue
                ? accessTokenExpiresAtUtc.Value - DateTime.UtcNow
                : TimeSpan.FromMinutes(GetAccessTokenMinutes());

            if (ttl > TimeSpan.Zero)
            {
                await _cache.SetStringAsync(RevokedJtiKey(jti.Trim()), "1", ttl);
            }
        }

        if (!string.IsNullOrWhiteSpace(refreshToken))
        {
            var tokenHash = ComputeSha256Hex(refreshToken.Trim());
            var stored = await _db.RefreshTokens
                .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash && rt.RevokedAt == null);

            if (stored is not null)
            {
                stored.RevokedAt = DateTime.UtcNow;
                await _db.SaveChangesAsync();
            }
        }
    }

    public async Task RevokeAllUserSessionsAsync(Guid userId)
    {
        var cutoffUnix = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture);
        var blacklistTtl = TimeSpan.FromMinutes(GetAccessTokenMinutes() + 5);
        await _cache.SetStringAsync(RevokedUserBeforeKey(userId), cutoffUnix, blacklistTtl);

        var activeTokens = await _db.RefreshTokens
            .Where(rt => rt.UserId == userId && rt.RevokedAt == null)
            .ToListAsync();

        if (activeTokens.Count > 0)
        {
            var now = DateTime.UtcNow;
            foreach (var token in activeTokens)
            {
                token.RevokedAt = now;
            }
            await _db.SaveChangesAsync();
        }
    }

    public async Task<bool> IsTokenRevokedAsync(string? jti, Guid userId, long? issuedAtUnixSeconds)
    {
        if (!string.IsNullOrWhiteSpace(jti))
        {
            var revokedJti = await _cache.GetStringAsync(RevokedJtiKey(jti.Trim()));
            if (revokedJti is not null)
                return true;
        }

        var cutoffStr = await _cache.GetStringAsync(RevokedUserBeforeKey(userId));
        if (!string.IsNullOrWhiteSpace(cutoffStr) &&
            long.TryParse(cutoffStr, NumberStyles.Integer, CultureInfo.InvariantCulture, out var cutoffUnix))
        {
            if (issuedAtUnixSeconds is null || issuedAtUnixSeconds <= cutoffUnix)
                return true;
        }

        return false;
    }

    private async Task<AuthResultDto> IssueTokenPairAsync(AppUser user)
    {
        var (rawRefresh, refreshHash, refreshExpires) = GenerateRefreshTokenData();

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = refreshHash,
            ExpiresAt = refreshExpires
        });
        await _db.SaveChangesAsync();

        return await BuildAccessResultAsync(user, rawRefresh);
    }

    private async Task<AuthResultDto> BuildAccessResultAsync(AppUser user, string rawRefreshToken)
    {
        var roles = await _users.GetRolesAsync(user);
        var now = DateTimeOffset.UtcNow;
        var jti = Guid.NewGuid().ToString("N");

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Name, user.DisplayName),
            new(JwtRegisteredClaimNames.Jti, jti),
            new(JwtRegisteredClaimNames.Iat, now.ToUnixTimeSeconds().ToString(CultureInfo.InvariantCulture), ClaimValueTypes.Integer64)
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var minutes = GetAccessTokenMinutes();
        var expires = now.UtcDateTime.AddMinutes(minutes);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            notBefore: now.UtcDateTime,
            expires: expires,
            signingCredentials: creds);

        var primaryRole = roles.FirstOrDefault() ?? "Member";
        return new AuthResultDto(
            new JwtSecurityTokenHandler().WriteToken(token),
            expires,
            user.Email,
            user.DisplayName,
            primaryRole,
            rawRefreshToken
        );
    }

    private (string rawToken, string tokenHash, DateTime expiresAt) GenerateRefreshTokenData()
    {
        var rawToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(48))
            .TrimEnd('=')
            .Replace('+', '-')
            .Replace('/', '_');
        var refreshDays = int.TryParse(_config["Jwt:RefreshTokenDays"], out var parsed) && parsed > 0
            ? parsed
            : 30;

        return (rawToken, ComputeSha256Hex(rawToken), DateTime.UtcNow.AddDays(refreshDays));
    }

    private int GetAccessTokenMinutes() =>
        int.TryParse(_config["Jwt:AccessTokenMinutes"], out var parsed) && parsed > 0 ? parsed : 30;

    private static string ComputeSha256Hex(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }

    private static string RevokedJtiKey(string jti) => $"revoked:jti:{jti}";
    private static string RevokedUserBeforeKey(Guid userId) => $"revoked:user-before:{userId}";
}
