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

        var tx = new Transaction
        {
            UserId = userId,
            Type = TransactionType.StoryPurchase,
            Amount = story.Price ?? 0,
            Provider = "VNPay",
            ProviderTransactionRef = Guid.NewGuid().ToString("N")
        };
        _db.Transactions.Add(tx);
        await _db.SaveChangesAsync();

        // TODO: gọi SDK VNPay/Momo để sinh URL thanh toán thật, kèm tx.ProviderTransactionRef làm mã đơn hàng.
        var paymentUrl = $"https://sandbox.vnpayment.vn/pay?ref={tx.ProviderTransactionRef}&amount={tx.Amount}";
        return (tx.Id, paymentUrl);
    }

    public async Task<(Guid transactionId, string paymentUrl)> InitiateSubscriptionAsync(Guid userId, Guid planId)
    {
        var plan = await _db.SubscriptionPlans.FindAsync(planId)
            ?? throw new InvalidOperationException("Plan not found");

        var tx = new Transaction
        {
            UserId = userId,
            Type = TransactionType.Subscription,
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
            return; // đã xử lý trước đó hoặc không tồn tại -> idempotent, bỏ qua.

        tx.Status = success ? TransactionStatus.Success : TransactionStatus.Failed;
        tx.CompletedAt = DateTime.UtcNow;

        if (success)
        {
            // Giao dịch thành công nhưng lỗi khi cấp quyền (crash giữa chừng) có thể được
            // phát hiện lại bằng cách quét Transaction Status=Success mà chưa có Purchase/UserSubscription
            // tương ứng (theo TransactionId) — nên chạy định kỳ một reconciliation job.
            if (tx.Type == TransactionType.StoryPurchase)
            {
                // storyId cần được lưu kèm transaction trong hệ thống thật (thêm cột hoặc bảng phụ);
                // ở đây giả định đã có sẵn qua metadata truyền vào khi Initiate.
            }
        }

        await _db.SaveChangesAsync();
    }
}
