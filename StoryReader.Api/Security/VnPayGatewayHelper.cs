using System.Globalization;
using System.Net;
using System.Security.Cryptography;
using System.Text;

namespace StoryReader.Api.Security;

/// <summary>Hỗ trợ tạo chữ ký và xác thực callback VNPay chuẩn HMAC-SHA512 (v2.1.0).</summary>
public static class VnPayGatewayHelper
{
    public const string DefaultSandboxBaseUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";

    /// <summary>Tính mã HMAC-SHA512 dạng hex thường theo thứ tự khóa tăng dần chuẩn VNPay.</summary>
    public static string ComputeHmacSha512(string secretKey, string rawData)
    {
        var keyBytes = Encoding.UTF8.GetBytes(secretKey);
        var dataBytes = Encoding.UTF8.GetBytes(rawData);
        using var hmac = new HMACSHA512(keyBytes);
        var hashBytes = hmac.ComputeHash(dataBytes);
        return Convert.ToHexString(hashBytes).ToLowerInvariant();
    }

    /// <summary>Tạo URL thanh toán VNPay có đính kèm tham số ref (tương thích ngược Web/Mobile) và vnp_SecureHash.</summary>
    public static string BuildSignedPaymentUrl(
        string baseUrl,
        string tmnCode,
        string hashSecret,
        string providerRef,
        decimal amountVnd,
        string orderInfo,
        string returnUrl,
        string clientIp = "127.0.0.1",
        DateTime? nowUtc = null)
    {
        var vnpTime = (nowUtc ?? DateTime.UtcNow).AddHours(7);
        var amountInSubUnits = ((long)Math.Round(amountVnd * 100m, MidpointRounding.AwayFromZero))
            .ToString(CultureInfo.InvariantCulture);

        var vnpParams = new SortedDictionary<string, string>(StringComparer.Ordinal)
        {
            ["vnp_Version"] = "2.1.0",
            ["vnp_Command"] = "pay",
            ["vnp_TmnCode"] = tmnCode,
            ["vnp_Amount"] = amountInSubUnits,
            ["vnp_CreateDate"] = vnpTime.ToString("yyyyMMddHHmmss", CultureInfo.InvariantCulture),
            ["vnp_CurrCode"] = "VND",
            ["vnp_IpAddr"] = clientIp,
            ["vnp_Locale"] = "vn",
            ["vnp_OrderInfo"] = orderInfo,
            ["vnp_OrderType"] = "other",
            ["vnp_ReturnUrl"] = returnUrl,
            ["vnp_TxnRef"] = providerRef
        };

        var signData = BuildCanonicalQueryString(vnpParams);
        var secureHash = ComputeHmacSha512(hashSecret, signData);
        return $"{baseUrl.TrimEnd('?')}?ref={Uri.EscapeDataString(providerRef)}&amount={amountVnd.ToString(CultureInfo.InvariantCulture)}&{signData}&vnp_SecureHash={secureHash}";
    }

    /// <summary>Xác thực toàn bộ bộ tham số VNPay IPN/Return bằng so sánh thời gian hằng (chống timing attack).</summary>
    public static bool VerifySignature(IEnumerable<KeyValuePair<string, string>> parameters, string hashSecret)
    {
        if (string.IsNullOrWhiteSpace(hashSecret))
            return false;

        string? providedHash = null;
        var sorted = new SortedDictionary<string, string>(StringComparer.Ordinal);

        foreach (var (key, value) in parameters)
        {
            if (string.IsNullOrEmpty(value))
                continue;

            if (key.Equals("vnp_SecureHash", StringComparison.OrdinalIgnoreCase))
            {
                providedHash = value.Trim();
                continue;
            }

            if (key.Equals("vnp_SecureHashType", StringComparison.OrdinalIgnoreCase) ||
                !key.StartsWith("vnp_", StringComparison.OrdinalIgnoreCase))
            {
                continue;
            }

            sorted[key] = value;
        }

        if (string.IsNullOrWhiteSpace(providedHash) || sorted.Count == 0)
            return false;

        var rawData = BuildCanonicalQueryString(sorted);
        var expectedHash = ComputeHmacSha512(hashSecret, rawData);

        var expectedBytes = Encoding.UTF8.GetBytes(expectedHash.ToLowerInvariant());
        var providedBytes = Encoding.UTF8.GetBytes(providedHash.ToLowerInvariant());

        return expectedBytes.Length == providedBytes.Length &&
               CryptographicOperations.FixedTimeEquals(expectedBytes, providedBytes);
    }

    private static string BuildCanonicalQueryString(SortedDictionary<string, string> sortedParams)
    {
        var sb = new StringBuilder();
        foreach (var (key, value) in sortedParams)
        {
            if (string.IsNullOrEmpty(value))
                continue;

            if (sb.Length > 0)
                sb.Append('&');

            sb.Append(WebUtility.UrlEncode(key));
            sb.Append('=');
            sb.Append(WebUtility.UrlEncode(value));
        }
        return sb.ToString();
    }
}
