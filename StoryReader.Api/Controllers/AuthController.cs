using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoryReader.Api.Models.Dtos;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth)
    {
        _auth = auth;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto) => Ok(await _auth.RegisterAsync(dto));

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginDto dto) => Ok(await _auth.LoginAsync(dto));
}
