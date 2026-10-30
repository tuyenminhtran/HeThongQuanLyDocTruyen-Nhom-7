using System.ComponentModel.DataAnnotations;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using StoryReader.Api.Models.Dtos;
using StoryReader.Api.Models.Entities;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Services;

public class AuthService : IAuthService
{
    private readonly UserManager<AppUser> _users;
    private readonly IConfiguration _config;

    public AuthService(UserManager<AppUser> users, IConfiguration config)
    {
        _users = users;
        _config = config;
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
        return await IssueTokenAsync(user);
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
        return await IssueTokenAsync(user);
    }

    private async Task<AuthResultDto> IssueTokenAsync(AppUser user)
    {
        var roles = await _users.GetRolesAsync(user);
        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.Name, user.DisplayName)
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var minutes = int.Parse(_config["Jwt:AccessTokenMinutes"]!);
        var expires = DateTime.UtcNow.AddMinutes(minutes);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        var primaryRole = roles.FirstOrDefault() ?? "Member";
        return new AuthResultDto(
            new JwtSecurityTokenHandler().WriteToken(token),
            expires,
            user.Email,
            user.DisplayName,
            primaryRole
        );
    }
}
