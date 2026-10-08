import { useState } from "react";
import { useAuthStore } from "../store/authStore";

export default function PricingPage() {
  const { accessToken } = useAuthStore();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      id: "basic",
      name: "Gói Đọc Thử",
      price: billingCycle === "monthly" ? "19.000đ" : "190.000đ",
      period: billingCycle === "monthly" ? "/tháng" : "/năm",
      description: "Phù hợp cho người mới bắt đầu khám phá nền tảng.",
      features: [
        "Đọc tối đa 10 truyện VIP mỗi tháng",
        "Mở khóa các chương ẩn",
        "Không có quảng cáo",
        "Lưu lịch sử đọc cơ bản",
      ],
      recommended: false,
    },
    {
      id: "premium",
      name: "Gói Premium",
      price: billingCycle === "monthly" ? "49.000đ" : "490.000đ",
      period: billingCycle === "monthly" ? "/tháng" : "/năm",
      description: "Trải nghiệm đọc truyện không giới hạn mọi lúc mọi nơi.",
      features: [
        "Đọc KHÔNG GIỚI HẠN toàn bộ truyện VIP",
        "Tải truyện đọc offline",
        "Huy hiệu VIP trên avatar",
        "Tùy chỉnh giao diện đọc chuyên sâu",
        "Hỗ trợ tác giả yêu thích",
      ],
      recommended: true,
    },
    {
      id: "coin",
      name: "Mua Xu Lẻ",
      price: "Từ 10.000đ",
      period: "",
      description: "Dành cho người đọc ít, chỉ mua những truyện muốn xem.",
      features: [
        "10.000đ = 1.000 xu",
        "Xu không có thời hạn sử dụng",
        "Thanh toán dễ dàng qua Momo, ZaloPay",
        "Mở khóa từng chương tùy thích",
      ],
      recommended: false,
      isCoin: true,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <h1 className="font-serif text-3xl md:text-5xl text-ink-text mb-4">
          Nâng cấp trải nghiệm đọc
        </h1>
        <p className="text-ink-muted text-lg">
          Chọn gói phù hợp nhất với bạn để mở khóa toàn bộ kho tàng truyện chất lượng cao trên StoryReader.
        </p>

        {/* Toggle Billing Cycle */}
        <div className="mt-8 inline-flex items-center bg-ink-card border border-ink-border rounded-full p-1">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all ${
              billingCycle === "monthly"
                ? "bg-gold text-ink-bg shadow-md"
                : "text-ink-muted hover:text-ink-text"
            }`}
          >
            Theo tháng
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${
              billingCycle === "yearly"
                ? "bg-gold text-ink-bg shadow-md"
                : "text-ink-muted hover:text-ink-text"
            }`}
          >
            Theo năm
            <span className={`px-2 py-0.5 rounded-full text-xs ${billingCycle === "yearly" ? "bg-ink-bg/20 text-ink-bg" : "bg-gold/20 text-gold"}`}>
              Giảm 15%
            </span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative flex flex-col bg-ink-card border rounded-3xl p-8 transition-transform hover:-translate-y-1 ${
              plan.recommended
                ? "border-gold shadow-2xl shadow-gold/10 scale-105 z-10"
                : "border-ink-border shadow-xl shadow-black/20"
            }`}
          >
            {plan.recommended && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-gold text-ink-bg text-xs font-bold uppercase tracking-wider rounded-full shadow-lg">
                Phổ biến nhất
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="font-serif text-xl text-ink-text mb-2">{plan.name}</h3>
              <p className="text-ink-muted text-sm min-h-[40px]">{plan.description}</p>
            </div>
            
            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-ink-text">{plan.price}</span>
                <span className="text-ink-muted">{plan.period}</span>
              </div>
            </div>
            
            <ul className="flex-1 space-y-4 mb-8">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-gold shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span className="text-sm text-ink-text/80">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              className={`w-full py-3.5 rounded-xl font-medium text-sm transition-all ${
                plan.recommended
                  ? "bg-gradient-to-r from-gold to-gold-dim text-ink-bg hover:shadow-lg hover:shadow-gold/20"
                  : "bg-ink-bg border border-ink-border text-ink-text hover:border-gold hover:text-gold"
              }`}
              onClick={() => {
                if (!accessToken) {
                  alert("Vui lòng đăng nhập trước khi thanh toán!");
                  return;
                }
                alert(plan.isCoin ? "Chuyển đến trang mua xu..." : `Đang xử lý đăng ký ${plan.name}...`);
              }}
            >
              {plan.isCoin ? "Nạp Xu Ngay" : "Đăng Ký Ngay"}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ or Trust badges */}
      <div className="mt-24 border-t border-ink-border pt-16 max-w-3xl mx-auto text-center">
        <h2 className="font-serif text-2xl text-ink-text mb-8">Thanh toán an toàn & tiện lợi</h2>
        <div className="flex flex-wrap justify-center gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          {/* Mock Logos */}
          <div className="text-xl font-bold font-sans tracking-tight">MOMO</div>
          <div className="text-xl font-bold font-sans tracking-tight text-blue-500">ZaloPay</div>
          <div className="text-xl font-bold font-sans tracking-tight text-red-500">VNPay</div>
          <div className="text-xl font-bold font-sans tracking-tight text-green-500">Visa / Mastercard</div>
        </div>
      </div>
    </div>
  );
}
