using StoryReader.Api.Models.Dtos;

namespace StoryReader.Api.Services.Interfaces;

public interface ISubscriptionService
{
    Task<IEnumerable<SubscriptionPlanDto>> GetActivePlansAsync();
    Task<IEnumerable<MySubscriptionDto>> GetMySubscriptionsAsync(Guid userId);
    Task<IEnumerable<MyPurchaseDto>> GetMyPurchasesAsync(Guid userId);
}
