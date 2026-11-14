using System.Globalization;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using StoryReader.Api.Security;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _payments;
    private readonly IWebHostEnvironment _env;
    private readonly IConfiguration _config;

    public PaymentsController(IPaymentService payments, IWebHostEnvironment env, IConfiguration config)
    {
        _payments = payments;
        _env = env;
        _config = config;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("story/{storyId:guid}")]
    [EnableRateLimiting("payment")]
    public async Task<IActionResult> BuyStory(Guid storyId)
    {
        try
        {
            var (txId, url) = await _payments.InitiateStoryPurchaseAsync(CurrentUserId, storyId);
            return Ok(new { transactionId = txId, paymentUrl = url });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("subscription/{planId:guid}")]
    [EnableRateLimiting("payment")]
    public async Task<IActionResult> BuySubscription(Guid planId)
    {
        try
        {
            var (txId, url) = await _payments.InitiateSubscriptionAsync(CurrentUserId, planId);
            return Ok(new { transactionId = txId, paymentUrl = url });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    /// <summary>
    /// Webhook callback chính thức từ cổng thanh toán.
    /// Luôn yêu cầu X-Payment-Callback-Secret hợp lệ hoặc chữ ký VNPay HMAC-SHA512 (kể cả trong Development) để chặn VULN-02.
    /// </summary>
    [HttpPost("callback")]
    [AllowAnonymous]
    public async Task<IActionResult> Callback([FromQuery] string? providerRef, [FromQuery] bool success = true)
    {
        if (HasValidVnPayParams(out var vnPayParams))
        {
            return await ProcessSignedVnPayCallbackAsync(vnPayParams);
        }

        if (!IsValidCallbackSecret())
        {
            return Unauthorized(new { message = "Chữ ký callback thanh toán không hợp lệ." });
        }

        if (string.IsNullOrWhiteSpace(providerRef))
            return BadRequest(new { message = "Thiếu mã tham chiếu giao dịch." });

        await _payments.HandleGatewayCallbackAsync(providerRef, success);
        return Ok(new { message = "Đã xử lý callback giao dịch." });
    }

    /// <summary>Webhook IPN chuẩn VNPay Sandbox xác thực toàn bộ tham số qua HMAC-SHA512 (vnp_SecureHash).</summary>
    [HttpGet("vnpay-ipn")]
    [HttpPost("vnpay-ipn")]
    [AllowAnonymous]
    public async Task<IActionResult> VnPayIpn()
    {
        if (!HasValidVnPayParams(out var vnPayParams))
        {
            return Unauthorized(new { RspCode = "97", Message = "Invalid signature or missing VNPay parameters" });
        }

        return await ProcessSignedVnPayCallbackAsync(vnPayParams);
    }

    /// <summary>
    /// Endpoint dành riêng cho nút mô phỏng thanh toán trong Development:
    /// yêu cầu đăng nhập JWT hợp lệ và kiểm tra giao dịch thuộc đúng người dùng hiện tại.
    /// </summary>
    [HttpPost("dev-confirm")]
    [Authorize]
    public async Task<IActionResult> DevConfirm([FromQuery] string? providerRef, [FromQuery] bool success = true)
    {
        var allowDevSim = _env.IsDevelopment() || _config.GetValue<bool>("Payments:EnableDevSimulation");
        if (!allowDevSim)
        {
            return NotFound(new { message = "Chức năng mô phỏng thanh toán không khả dụng trên môi trường này." });
        }

        if (string.IsNullOrWhiteSpace(providerRef))
            return BadRequest(new { message = "Thiếu mã tham chiếu giao dịch." });

        try
        {
            await _payments.ConfirmDevSimulationAsync(CurrentUserId, providerRef, success);
            return Ok(new { message = "Đã hoàn tất xác nhận giao dịch mô phỏng." });
        }
        catch (UnauthorizedAccessException ex)
        {
            return StatusCode(StatusCodes.Status403Forbidden, new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    private bool IsValidCallbackSecret()
    {
        var expectedSecret = _config["Payments:CallbackSecret"];
        var providedSecret = Request.Headers["X-Payment-Callback-Secret"].FirstOrDefault();

        if (string.IsNullOrWhiteSpace(expectedSecret) || string.IsNullOrWhiteSpace(providedSecret))
            return false;

        var expectedBytes = Encoding.UTF8.GetBytes(expectedSecret.Trim());
        var providedBytes = Encoding.UTF8.GetBytes(providedSecret.Trim());
        return expectedBytes.Length == providedBytes.Length &&
               CryptographicOperations.FixedTimeEquals(expectedBytes, providedBytes);
    }

    private bool HasValidVnPayParams(out Dictionary<string, string> parameters)
    {
        parameters = new Dictionary<string, string>(StringComparer.Ordinal);
        foreach (var kv in Request.Query)
        {
            if (!string.IsNullOrEmpty(kv.Value.ToString()))
                parameters[kv.Key] = kv.Value.ToString();
        }

        return parameters.ContainsKey("vnp_SecureHash") && parameters.ContainsKey("vnp_TxnRef");
    }

    private async Task<IActionResult> ProcessSignedVnPayCallbackAsync(Dictionary<string, string> vnPayParams)
    {
        var hashSecret = _config["Payments:VnPay:HashSecret"]?.Trim();
        if (string.IsNullOrWhiteSpace(hashSecret) || !VnPayGatewayHelper.VerifySignature(vnPayParams, hashSecret))
        {
            return Unauthorized(new { message = "Chữ ký VNPay HMAC-SHA512 không hợp lệ.", RspCode = "97" });
        }

        var txnRef = vnPayParams.GetValueOrDefault("vnp_TxnRef");
        var amountRaw = vnPayParams.GetValueOrDefault("vnp_Amount");
        var responseCode = vnPayParams.GetValueOrDefault("vnp_ResponseCode");
        var txStatus = vnPayParams.GetValueOrDefault("vnp_TransactionStatus");

        if (string.IsNullOrWhiteSpace(txnRef) ||
            !long.TryParse(amountRaw, NumberStyles.Integer, CultureInfo.InvariantCulture, out var amountSubUnits) ||
            amountSubUnits <= 0)
        {
            return BadRequest(new { message = "Tham số giao dịch VNPay không hợp lệ.", RspCode = "01" });
        }

        var amountVnd = amountSubUnits / 100m;
        var isSuccess = string.Equals(responseCode, "00", StringComparison.Ordinal) &&
                        (string.IsNullOrEmpty(txStatus) || string.Equals(txStatus, "00", StringComparison.Ordinal));

        var (matchedAmount, processed) = await _payments.HandleVnPayCallbackAsync(txnRef, amountVnd, isSuccess);
        if (!processed || !matchedAmount)
        {
            return BadRequest(new { message = "Không tìm thấy giao dịch hoặc số tiền không khớp.", RspCode = "04" });
        }

        return Ok(new { message = "Confirm Success", RspCode = "00" });
    }
}
