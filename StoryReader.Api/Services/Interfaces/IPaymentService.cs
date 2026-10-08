using StoryReader.Api.Models.Entities;

namespace StoryReader.Api.Services.Interfaces;

public interface IPaymentService
{
    /// <summary>Tạo một Transaction ở trạng thái Pending và trả về URL để redirect sang cổng thanh toán.</summary>
    Task<(Guid transactionId, string paymentUrl)> InitiateStoryPurchaseAsync(Guid userId, Guid storyId);
    Task<(Guid transactionId, string paymentUrl)> InitiateSubscriptionAsync(Guid userId, Guid planId);

    /// <summary>
    /// Webhook callback từ cổng thanh toán. Nếu thành công: cập nhật Transaction, tạo Purchase/UserSubscription.
    /// Idempotent — gọi lại nhiều lần với cùng providerRef không tạo trùng bản ghi.
    /// </summary>
    Task HandleGatewayCallbackAsync(string providerTransactionRef, bool success);
}
