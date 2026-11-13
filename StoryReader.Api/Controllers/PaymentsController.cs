using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
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

    /// <summary>Endpoint public để cổng thanh toán gọi callback (hoặc nút mô phỏng trong Development).
    /// Ngoài môi trường Development bắt buộc xác thực header X-Payment-Callback-Secret khớp Payments:CallbackSecret.</summary>
    [HttpPost("callback")]
    [AllowAnonymous]
    public async Task<IActionResult> Callback([FromQuery] string providerRef, [FromQuery] bool success)
    {
        if (string.IsNullOrWhiteSpace(providerRef))
            return BadRequest(new { message = "Thiếu mã tham chiếu giao dịch." });

        if (!_env.IsDevelopment())
        {
            var expectedSecret = _config["Payments:CallbackSecret"];
            var providedSecret = Request.Headers["X-Payment-Callback-Secret"].FirstOrDefault();
            if (string.IsNullOrWhiteSpace(expectedSecret) ||
                string.IsNullOrWhiteSpace(providedSecret) ||
                !CryptographicOperations.FixedTimeEquals(
                    Encoding.UTF8.GetBytes(expectedSecret),
                    Encoding.UTF8.GetBytes(providedSecret)))
            {
                return Unauthorized(new { message = "Chữ ký callback thanh toán không hợp lệ." });
            }
        }

        await _payments.HandleGatewayCallbackAsync(providerRef, success);
        return Ok(new { message = "Đã xử lý callback giao dịch." });
    }
}
