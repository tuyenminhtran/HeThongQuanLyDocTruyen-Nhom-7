using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Controllers;

[ApiController]
[Route("api/subscriptions")]
public class SubscriptionsController : ControllerBase
{
    private readonly ISubscriptionService _subs;

    public SubscriptionsController(ISubscriptionService subs)
    {
        _subs = subs;
    }

    private Guid CurrentUserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("plans")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPlans() => Ok(await _subs.GetActivePlansAsync());

    [HttpGet("me")]
    [Authorize]
    public async Task<IActionResult> GetMine() => Ok(await _subs.GetMySubscriptionsAsync(CurrentUserId));

    [HttpGet("me/purchases")]
    [Authorize]
    public async Task<IActionResult> GetMyPurchases() => Ok(await _subs.GetMyPurchasesAsync(CurrentUserId));
}
