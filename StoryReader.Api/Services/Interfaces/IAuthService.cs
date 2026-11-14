using StoryReader.Api.Models.Dtos;

namespace StoryReader.Api.Services.Interfaces;

public interface IAuthService
{
    Task<AuthResultDto> RegisterAsync(RegisterDto dto);
    Task<AuthResultDto> LoginAsync(LoginDto dto);
    Task<AuthResultDto> RefreshAsync(string refreshToken);
    Task RevokeSessionAsync(string? jti, DateTime? accessTokenExpiresAtUtc, string? refreshToken = null);
    Task RevokeAllUserSessionsAsync(Guid userId);
    Task<bool> IsTokenRevokedAsync(string? jti, Guid userId, long? issuedAtUnixSeconds);
}
