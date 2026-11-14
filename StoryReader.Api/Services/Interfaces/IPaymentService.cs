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

    /// <summary>
    /// Chỉ dùng trong môi trường Development để người dùng tự xác nhận giao dịch mô phỏng của chính mình.
    /// </summary>
    Task ConfirmDevSimulationAsync(Guid userId, string providerTransactionRef, bool success);

    /// <summary>Xác thực giao dịch cho VNPay IPN: đối chiếu số tiền rồi hoàn tất cấp quyền.</summary>
    Task<(bool matchedAmount, bool processed)> HandleVnPayCallbackAsync(string providerTransactionRef, decimal amountVndFromGateway, bool success);

    /// <summary>
    /// Cho phép Admin xử lý sự cố thanh toán (PB28): Cấp bù quyền đọc hoặc kích hoạt gói khi giao dịch gặp lỗi.
    /// </summary>
    Task ForceActivateTransactionAsync(Guid transactionId);
}
