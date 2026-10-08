namespace StoryReader.Api.Models.Dtos;

public record RegisterDto(string Email, string Password, string DisplayName);
public record LoginDto(string Email, string Password);
public record AuthResultDto(string AccessToken, DateTime ExpiresAt, string? Email = null, string? DisplayName = null, string? Role = null);
