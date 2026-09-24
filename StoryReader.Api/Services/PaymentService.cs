using Microsoft.EntityFrameworkCore;
using StoryReader.Api.Data;
using StoryReader.Api.Models.Entities;
using StoryReader.Api.Services.Interfaces;

namespace StoryReader.Api.Services;

/// <summary>
/// Khung xử lý thanh toán. Việc build URL redirect và verify chữ ký thực tế phụ thuộc
/// vào SDK của VNPay/Momo — thay phần TODO bằng lời gọi SDK tương ứng khi tích hợp thật.
/// </summary>
public class PaymentService : IPaymentService
{
    private readonly AppDbContext _db;

    public PaymentService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<(Guid transactionId, string paymentUrl)> InitiateStoryPurchaseAsync(Guid userId, Guid storyId)
    {
        var story = await _db.Stories.FindAsync(storyId)
            ?? throw new InvalidOperationException("Story not found");

        if (story.AccessPolicy == AccessPolicy.Free)
            throw new InvalidOperationException("Truyện này miễn phí, không cần mua.");

        var alreadyOwned = await _db.Purchases.AnyAsync(p => p.UserId == userId && p.StoryId == storyId);
        if (alreadyOwned)
            throw new InvalidOperationException("Bạn đã sở hữu quyền đọc truyện này.");

        var hasActiveSubscription = await _db.UserSubscriptions
            .AnyAsync(s => s.UserId == userId && s.EndAt > DateTime.UtcNow);
        if (hasActiveSubscription)
            throw new InvalidOperationException("Bạn đang có gói đọc theo tháng còn hiệu lực, không cần mua riêng truyện này.");

        var tx = new Transaction
        {
            UserId = userId,
            Type = TransactionType.StoryPurchase,
            TargetId = storyId,
            Amount = story.Price ?? 0,
            Provider = "VNPay",
            ProviderTransactionRef = Guid.NewGuid().ToString("N")
        };
        _db.Transactions.Add(tx);
        await _db.SaveChangesAsync();

        var paymentUrl = $"https://sandbox.vnpayment.vn/pay?ref={tx.ProviderTransactionRef}&amount={tx.Amount}";
        return (tx.Id, paymentUrl);
    }

    public async Task<(Guid transactionId, string paymentUrl)> InitiateSubscriptionAsync(Guid userId, Guid planId)
    {
        var plan = await _db.SubscriptionPlans.FindAsync(planId)
            ?? throw new InvalidOperationException("Plan not found");

        if (!plan.IsActive)
            throw new InvalidOperationException("Gói này hiện không còn được cung cấp.");

        var tx = new Transaction
        {
            UserId = userId,
            Type = TransactionType.Subscription,
            TargetId = planId,
            Amount = plan.Price,
            Provider = "VNPay",
            ProviderTransactionRef = Guid.NewGuid().ToString("N")
        };
        _db.Transactions.Add(tx);
        await _db.SaveChangesAsync();

        var paymentUrl = $"https://sandbox.vnpayment.vn/pay?ref={tx.ProviderTransactionRef}&amount={tx.Amount}";
        return (tx.Id, paymentUrl);
    }

    public async Task HandleGatewayCallbackAsync(string providerTransactionRef, bool success)
    {
        var tx = await _db.Transactions
            .FirstOrDefaultAsync(t => t.ProviderTransactionRef == providerTransactionRef);

        if (tx is null || tx.Status != TransactionStatus.Pending)
            return;

        tx.Status = success ? TransactionStatus.Success : TransactionStatus.Failed;
        tx.CompletedAt = DateTime.UtcNow;

        if (success)
        {
            if (tx.Type == TransactionType.StoryPurchase)
            {
                var alreadyOwned = await _db.Purchases
                    .AnyAsync(p => p.UserId == tx.UserId && p.StoryId == tx.TargetId);

                if (!alreadyOwned)
                {
                    _db.Purchases.Add(new Purchase
                    {
                        UserId = tx.UserId,
                        StoryId = tx.TargetId,
                        PricePaid = tx.Amount,
                        TransactionId = tx.Id
                    });
                }
            }
            else if (tx.Type == TransactionType.Subscription)
            {
                var plan = await _db.SubscriptionPlans.FindAsync(tx.TargetId);
                if (plan is not null)
                {
                    var currentActive = await _db.UserSubscriptions
                        .Where(s => s.UserId == tx.UserId && s.EndAt > DateTime.UtcNow)
                        .OrderByDescending(s => s.EndAt)
                        .FirstOrDefaultAsync();

                    var startAt = currentActive?.EndAt ?? DateTime.UtcNow;

                    _db.UserSubscriptions.Add(new UserSubscription
                    {
                        UserId = tx.UserId,
                        PlanId = plan.Id,
                        StartAt = startAt,
                        EndAt = startAt.AddDays(plan.DurationDays),
                        TransactionId = tx.Id
                    });
                }
            }
        }

        await _db.SaveChangesAsync();
    }
}