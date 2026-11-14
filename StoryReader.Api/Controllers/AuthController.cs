using System.Globalization;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using StoryReader.Api.Models.Dtos;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Controllers;

[ApiController]
[Route("api/auth")]
[EnableRateLimiting("auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        try
        {
            return Ok(await _auth.RegisterAsync(dto));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        try
        {
            return Ok(await _auth.LoginAsync(dto));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>Cấp lại Access Token mới từ Refresh Token hợp lệ (xoay vòng token chống đánh cắp phiên).</summary>
    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenDto dto)
    {
        try
        {
            return Ok(await _auth.RefreshAsync(dto.RefreshToken));
        }
        catch (InvalidOperationException ex)
        {
            return Unauthorized(new { message = ex.Message });
        }
    }

    /// <summary>Đăng xuất chủ động: thu hồi tức thì Access Token (jti blacklist) và Refresh Token (VULN-08).</summary>
    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout([FromBody] LogoutRequestDto? dto = null)
    {
        var jti = User.FindFirstValue(JwtRegisteredClaimNames.Jti);
        DateTime? expiresAtUtc = null;
        var expClaim = User.FindFirstValue(JwtRegisteredClaimNames.Exp);
        if (!string.IsNullOrWhiteSpace(expClaim) &&
            long.TryParse(expClaim, NumberStyles.Integer, CultureInfo.InvariantCulture, out var expUnix))
        {
            expiresAtUtc = DateTimeOffset.FromUnixTimeSeconds(expUnix).UtcDateTime;
        }

        await _auth.RevokeSessionAsync(jti, expiresAtUtc, dto?.RefreshToken);
        return Ok(new { message = "Đã đăng xuất và thu hồi phiên đăng nhập." });
    }
}
