using System.ComponentModel.DataAnnotations;

namespace StoryReader.Api.Models.Dtos;

public record RegisterDto(
    [Required(ErrorMessage = "Email không được để trống.")]
    [MaxLength(100, ErrorMessage = "Email tối đa 100 ký tự.")]
    string Email,

    [Required(ErrorMessage = "Mật khẩu không được để trống.")]
    [MaxLength(128, ErrorMessage = "Mật khẩu tối đa 128 ký tự.")]
    string Password,

    [Required(ErrorMessage = "Tên hiển thị không được để trống.")]
    [MaxLength(50, ErrorMessage = "Tên hiển thị tối đa 50 ký tự.")]
    string DisplayName);

public record LoginDto(
    [Required(ErrorMessage = "Email không được để trống.")]
    [MaxLength(100)]
    string Email,

    [Required(ErrorMessage = "Mật khẩu không được để trống.")]
    [MaxLength(128)]
    string Password);

public record RefreshTokenDto(
    [Required(ErrorMessage = "Thiếu refreshToken.")]
    [MaxLength(256)]
    string RefreshToken);

public record LogoutRequestDto(
    [MaxLength(256)]
    string? RefreshToken = null);

public record AuthResultDto(
    string AccessToken,
    DateTime ExpiresAt,
    string? Email = null,
    string? DisplayName = null,
    string? Role = null,
    string? RefreshToken = null);
