using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Dtos;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Services;

public class SubscriptionService : ISubscriptionService
{
    private readonly AppDbContext _db;

    public SubscriptionService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<IEnumerable<SubscriptionPlanDto>> GetActivePlansAsync()
    {
        return await _db.SubscriptionPlans.AsNoTracking()
            .Where(p => p.IsActive)
            .Select(p => new SubscriptionPlanDto(p.Id, p.Name, p.Price, p.DurationDays, p.Scope))
            .ToListAsync();
    }

    public async Task<IEnumerable<MySubscriptionDto>> GetMySubscriptionsAsync(Guid userId)
    {
        return await _db.UserSubscriptions.AsNoTracking()
            .Include(s => s.Plan)
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.StartAt)
            .Select(s => new MySubscriptionDto(s.PlanId, s.Plan.Name, s.StartAt, s.EndAt, s.EndAt > DateTime.UtcNow))
            .ToListAsync();
    }

    public async Task<IEnumerable<MyPurchaseDto>> GetMyPurchasesAsync(Guid userId)
    {
        return await _db.Purchases.AsNoTracking()
            .Include(p => p.Story)
            .Where(p => p.UserId == userId)
            .OrderByDescending(p => p.PurchasedAt)
            .Select(p => new MyPurchaseDto(p.StoryId, p.Story.Title, p.PricePaid, p.PurchasedAt))
            .ToListAsync();
    }
}
