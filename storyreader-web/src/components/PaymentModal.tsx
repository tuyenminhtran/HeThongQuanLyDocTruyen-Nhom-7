import { useState } from "react";

export type PaymentMethod = "momo" | "zalopay" | "vnpay" | "vietqr";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  amount: number;
  itemType?: "story" | "subscription" | "coin";
  onSuccess?: () => void;
}

export default function PaymentModal({
  isOpen,
  onClose,
  itemName,
  amount,
  itemType = "subscription",
  onSuccess,
}: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>("momo");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  if (!isOpen) return null;

  const formattedAmount = amount.toLocaleString("vi-VN") + "đ";
  const orderCode = `SN${Math.floor(100000 + Math.random() * 900000)}`;

  // Tạo URL mã QR theo phương thức (sử dụng QuickChart QR API hoặc VietQR format)
  const qrContent = encodeURIComponent(
    `STORYNEST ${orderCode} ${method.toUpperCase()} ${amount}`
  );
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${qrContent}&color=000000`;

  const handleConfirmPayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsPaid(true);
      if (onSuccess) onSuccess();
    }, 1500);
  };

  const handleFinish = () => {
    setIsPaid(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-ink-card border border-ink-border rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-8 text-ink-text">
        {/* Nút đóng */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-ink-muted hover:text-ink-text p-1.5 rounded-full hover:bg-ink-bg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {isPaid ? (
          /* Trạng thái thanh toán thành công */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h3 className="text-2xl font-serif font-bold text-ink-text">Thanh toán thành công!</h3>
            <p className="text-ink-muted text-sm max-w-sm mx-auto">
              Đơn hàng <span className="text-gold font-mono">{orderCode}</span> của bạn đã được xác nhận. {itemType === "subscription" ? "Tài khoản của bạn đã được nâng cấp VIP." : "Truyện đã được mở khóa."}
            </p>
            <div className="p-4 bg-ink-bg border border-ink-border rounded-2xl text-left space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-muted">Dịch vụ:</span>
                <span className="font-semibold text-ink-text">{itemName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Số tiền:</span>
                <span className="font-semibold text-gold">{formattedAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-muted">Hình thức:</span>
                <span className="font-semibold uppercase text-ink-text">{method}</span>
              </div>
            </div>
            <button
              onClick={handleFinish}
              className="w-full py-3.5 rounded-xl font-bold bg-gold text-ink-bg hover:bg-gold-dim transition-all shadow-lg shadow-gold/20"
            >
              Hoàn tất & Tiếp tục
            </button>
          </div>
        ) : (
          /* Giao diện chọn ví & quét mã QR */
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-ink-text">Thanh toán đơn hàng</h2>
              <p className="text-xs text-ink-muted mt-1">
                Chọn ví điện tử bạn muốn dùng để thanh toán an toàn
              </p>
            </div>

            {/* Chi tiết đơn hàng */}
            <div className="p-3.5 bg-ink-bg border border-ink-border rounded-2xl flex items-center justify-between">
              <div>
                <p className="text-xs text-ink-muted">Gói / Dịch vụ</p>
                <p className="font-semibold text-sm text-ink-text truncate max-w-[220px]">{itemName}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-ink-muted">Tổng thanh toán</p>
                <p className="text-lg font-bold text-gold">{formattedAmount}</p>
              </div>
            </div>

            {/* Chọn phương thức ví điện tử */}
            <div>
              <label className="text-xs font-semibold text-ink-muted uppercase tracking-wider block mb-2.5">
                Phương thức thanh toán
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {/* MoMo */}
                <button
                  type="button"
                  onClick={() => setMethod("momo")}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    method === "momo"
                      ? "border-[#A50064] bg-[#A50064]/10 text-white shadow-md ring-2 ring-[#A50064]/30"
                      : "border-ink-border bg-ink-bg text-ink-muted hover:border-gray-500"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#A50064] text-white flex items-center justify-center font-bold text-xs shadow mb-1.5">
                    MoMo
                  </div>
                  <span className="text-xs font-medium">Ví MoMo</span>
                </button>

                {/* ZaloPay */}
                <button
                  type="button"
                  onClick={() => setMethod("zalopay")}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    method === "zalopay"
                      ? "border-[#0068FF] bg-[#0068FF]/10 text-white shadow-md ring-2 ring-[#0068FF]/30"
                      : "border-ink-border bg-ink-bg text-ink-muted hover:border-gray-500"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#0068FF] text-white flex items-center justify-center font-bold text-xs shadow mb-1.5">
                    Zalo
                  </div>
                  <span className="text-xs font-medium">ZaloPay</span>
                </button>

                {/* VNPay */}
                <button
                  type="button"
                  onClick={() => setMethod("vnpay")}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    method === "vnpay"
                      ? "border-[#E11B22] bg-[#E11B22]/10 text-white shadow-md ring-2 ring-[#E11B22]/30"
                      : "border-ink-border bg-ink-bg text-ink-muted hover:border-gray-500"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-[#E11B22] text-white flex items-center justify-center font-bold text-xs shadow mb-1.5">
                    VNP
                  </div>
                  <span className="text-xs font-medium">VNPay</span>
                </button>

                {/* VietQR / Ngân hàng */}
                <button
                  type="button"
                  onClick={() => setMethod("vietqr")}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${
                    method === "vietqr"
                      ? "border-emerald-500 bg-emerald-500/10 text-white shadow-md ring-2 ring-emerald-500/30"
                      : "border-ink-border bg-ink-bg text-ink-muted hover:border-gray-500"
                  }`}
                >
                  <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow mb-1.5">
                    QR
                  </div>
                  <span className="text-xs font-medium">VietQR</span>
                </button>
              </div>
            </div>

            {/* Khung mã QR & Hướng dẫn quét */}
            <div className="bg-ink-bg border border-ink-border rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
              <div className="bg-white p-2.5 rounded-xl shadow shrink-0">
                <img
                  src={qrUrl}
                  alt="Mã QR thanh toán"
                  className="w-32 h-32 object-contain"
                />
              </div>

              <div className="text-xs space-y-1.5 text-ink-muted flex-1">
                <p className="font-semibold text-ink-text text-sm">
                  Quét mã qua ứng dụng {method === "momo" ? "Ví MoMo" : method === "zalopay" ? "ZaloPay" : method === "vnpay" ? "Ví VNPay / Mobile Banking" : "Ngân hàng bất kỳ"}
                </p>
                <p>1. Mở app ví điện tử trên điện thoại.</p>
                <p>2. Chọn tính năng <span className="text-gold font-semibold">Quét mã QR</span>.</p>
                <p>3. Quét mã bên cạnh và xác nhận thanh toán.</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Mã đơn hàng: <span className="font-mono text-gold">{orderCode}</span>
                </p>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-xl font-bold bg-gradient-to-r from-gold to-gold-dim text-ink-bg hover:opacity-95 transition-all shadow-lg shadow-gold/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-ink-bg" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Đang kiểm tra giao dịch...
                  </>
                ) : (
                  "Tôi đã chuyển tiền / Xác nhận thanh toán"
                )}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl text-xs text-ink-muted hover:text-ink-text transition-colors"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
