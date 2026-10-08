namespace StoryReader.Api.Models.Dtos;

public record SubscriptionPlanDto(Guid Id, string Name, decimal Price, int DurationDays, string Scope);
public record MySubscriptionDto(Guid PlanId, string PlanName, DateTime StartAt, DateTime EndAt, bool IsActive);
public record MyPurchaseDto(Guid StoryId, string StoryTitle, decimal PricePaid, DateTime PurchasedAt);
