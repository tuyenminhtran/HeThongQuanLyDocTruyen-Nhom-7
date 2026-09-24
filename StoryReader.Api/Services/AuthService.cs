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
        var user = new AppUser { UserName = dto.Email, Email = dto.Email, DisplayName = dto.DisplayName };
        var result = await _users.CreateAsync(user, dto.Password);
        if (!result.Succeeded)
            throw new InvalidOperationException(string.Join("; ", result.Errors.Select(e => e.Description)));

        await _users.AddToRoleAsync(user, "Member");
        return await IssueTokenAsync(user);
    }

    public async Task<AuthResultDto> LoginAsync(LoginDto dto)
    {
        var user = await _users.FindByEmailAsync(dto.Email)
            ?? throw new InvalidOperationException("Email hoặc mật khẩu không đúng.");

        if (user.IsRestricted)
            throw new InvalidOperationException("Tài khoản đang bị hạn chế.");

        var valid = await _users.CheckPasswordAsync(user, dto.Password);
        if (!valid)
            throw new InvalidOperationException("Email hoặc mật khẩu không đúng.");

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

        return new AuthResultDto(new JwtSecurityTokenHandler().WriteToken(token), expires);
    }
}
