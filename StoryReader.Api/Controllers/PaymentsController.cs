using System.Security.Claims;
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

    public PaymentsController(IPaymentService payments)
    {
        _payments = payments;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost("story/{storyId:guid}")]
    public async Task<IActionResult> BuyStory(Guid storyId)
    {
        var (txId, url) = await _payments.InitiateStoryPurchaseAsync(CurrentUserId, storyId);
        return Ok(new { transactionId = txId, paymentUrl = url });
    }

    [HttpPost("subscription/{planId:guid}")]
    public async Task<IActionResult> BuySubscription(Guid planId)
    {
        var (txId, url) = await _payments.InitiateSubscriptionAsync(CurrentUserId, planId);
        return Ok(new { transactionId = txId, paymentUrl = url });
    }

    /// <summary>Endpoint public để cổng thanh toán gọi callback (không yêu cầu JWT của user).
    /// Trong triển khai thật cần xác thực chữ ký request đến từ đúng cổng thanh toán.</summary>
    [HttpPost("callback")]
    [AllowAnonymous]
    public async Task<IActionResult> Callback([FromQuery] string providerRef, [FromQuery] bool success)
    {
        await _payments.HandleGatewayCallbackAsync(providerRef, success);
        return Ok();
    }
}
