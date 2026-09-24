using StoryReader.Api.Models.Dtos;

namespace StoryReader.Api.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResultDto> RegisterAsync(RegisterDto dto);
    Task<AuthResultDto> LoginAsync(LoginDto dto);
}
