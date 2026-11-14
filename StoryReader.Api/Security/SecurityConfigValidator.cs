using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace StoryReader.Api.Security;

/// <summary>Kiểm tra các tham số bảo mật bắt buộc trước khi khởi chạy ứng dụng ngoài môi trường Development.</summary>
public static class SecurityConfigValidator
{
    public const string DefaultPlaceholderJwtKey = "CHANGE_ME_TO_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS";
    private const int MinimumJwtKeyLength = 32;
    private const int MinimumCallbackSecretLength = 16;

    public static void Validate(IConfiguration configuration, IHostEnvironment environment)
    {
        var jwtKey = configuration["Jwt:Key"]?.Trim();
        var connStr = configuration.GetConnectionString("Default")?.Trim();

        if (string.IsNullOrWhiteSpace(jwtKey))
        {
            throw new InvalidOperationException(
                "Thiếu cấu hình Jwt:Key. Vui lòng thiết lập qua biến môi trường Jwt__Key, dotnet user-secrets hoặc appsettings.Development.json.");
        }

        if (jwtKey.Length < MinimumJwtKeyLength)
        {
            throw new InvalidOperationException(
                $"Jwt:Key phải dài tối thiểu {MinimumJwtKeyLength} ký tự để đảm bảo an toàn HMAC-SHA256.");
        }

        if (environment.IsDevelopment())
        {
            return;
        }

        if (string.Equals(jwtKey, DefaultPlaceholderJwtKey, StringComparison.Ordinal) ||
            jwtKey.StartsWith("CHANGE_ME", StringComparison.OrdinalIgnoreCase) ||
            jwtKey.Contains("DevOnly", StringComparison.OrdinalIgnoreCase))
        {
            throw new InvalidOperationException(
                "Không được phép chạy Production/Staging với Jwt:Key mặc định hoặc khóa Development.");
        }

        if (string.IsNullOrWhiteSpace(connStr))
        {
            throw new InvalidOperationException(
                "Thiếu chuỗi kết nối ConnectionStrings:Default trong môi trường Production/Staging.");
        }

        var callbackSecret = configuration["Payments:CallbackSecret"]?.Trim();
        var vnPaySecret = configuration["Payments:VnPay:HashSecret"]?.Trim();

        var hasCallbackSecret = !string.IsNullOrWhiteSpace(callbackSecret) &&
            callbackSecret.Length >= MinimumCallbackSecretLength &&
            !callbackSecret.StartsWith("CHANGE_ME", StringComparison.OrdinalIgnoreCase);

        var hasVnPaySecret = !string.IsNullOrWhiteSpace(vnPaySecret) &&
            vnPaySecret.Length >= MinimumCallbackSecretLength &&
            !vnPaySecret.StartsWith("CHANGE_ME", StringComparison.OrdinalIgnoreCase);

        if (!hasCallbackSecret && !hasVnPaySecret)
        {
            throw new InvalidOperationException(
                $"Production/Staging yêu cầu thiết lập Payments:CallbackSecret hoặc Payments:VnPay:HashSecret (tối thiểu {MinimumCallbackSecretLength} ký tự).");
        }
    }
}
