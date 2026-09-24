namespace StoryReader.Api.Models.Entities;

public class SubscriptionPlan
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DurationDays { get; set; }
    /// <summary>Free-text description of content scope covered by this plan (e.g. "all paid stories").</summary>
    public string Scope { get; set; } = "all";
    public bool IsActive { get; set; } = true;

    public ICollection<UserSubscription> UserSubscriptions { get; set; } = new List<UserSubscription>();
}

public class UserSubscription
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public Guid PlanId { get; set; }
    public SubscriptionPlan Plan { get; set; } = null!;

    public DateTime StartAt { get; set; } = DateTime.UtcNow;
    public DateTime EndAt { get; set; }
    public bool IsActive => EndAt > DateTime.UtcNow;

    public Guid TransactionId { get; set; }
    public Transaction Transaction { get; set; } = null!;
}

/// <summary>Grants a user permanent reading access to one specific story (one-off purchase).</summary>
public class Purchase
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public Guid StoryId { get; set; }
    public Story Story { get; set; } = null!;
    public decimal PricePaid { get; set; }
    public DateTime PurchasedAt { get; set; } = DateTime.UtcNow;

    public Guid TransactionId { get; set; }
    public Transaction Transaction { get; set; } = null!;
}

public enum TransactionType { Subscription, StoryPurchase }
public enum TransactionStatus { Pending, Success, Failed }

/// <summary>Every payment attempt (subscription or single-story purchase) is recorded here first,
/// then a Purchase or UserSubscription row is created only once the gateway confirms success.</summary>
public class Transaction
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public TransactionType Type { get; set; }
    public TransactionStatus Status { get; set; } = TransactionStatus.Pending;

    /// <summary>StoryId khi Type = StoryPurchase, hoặc PlanId khi Type = Subscription.</summary>
    public Guid TargetId { get; set; }

    public decimal Amount { get; set; }
    public string Provider { get; set; } = string.Empty; // "VNPay" | "Momo"
    public string ProviderTransactionRef { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }
}