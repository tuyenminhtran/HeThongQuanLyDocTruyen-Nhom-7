import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import {
  getSubscriptionPlans,
  buySubscription,
  simulatePaymentCallback,
  type SubscriptionPlan,
} from "../api/payments";
import { getUserProfile } from "../api/users";
import { fireConfetti } from "../utils/confetti";
import Meteors from "../components/ui/Meteors";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
}

// Fallback plans nếu chưa kết nối được CSDL
const fallbackPlans: SubscriptionPlan[] = [
  { id: "p1", name: "Gói 1 tháng", price: 49000, durationDays: 30, scope: "all" },
  { id: "p2", name: "Gói 3 tháng", price: 129000, durationDays: 90, scope: "all" },
  { id: "p3", name: "Gói 12 tháng", price: 399000, durationDays: 365, scope: "all" },
];

export default function PricingPage() {
  const { accessToken } = useAuthStore();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Modal thanh toán
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [paymentInfo, setPaymentInfo] = useState<{ transactionId: string; paymentUrl: string; ref: string } | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Lấy thông tin user hiện tại để xem đã là VIP chưa
  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
    enabled: !!accessToken,
  });

  // Lấy danh sách gói từ Backend API
  const { data: apiPlans, isLoading } = useQuery({
    queryKey: ["subscriptionPlans"],
    queryFn: getSubscriptionPlans,
  });

  const rawPlans = (apiPlans && apiPlans.length > 0) ? apiPlans : fallbackPlans;
  const plans = [...rawPlans].sort((a, b) => a.durationDays - b.durationDays);

  // Mutation khởi tạo thanh toán
  const buyMutation = useMutation({
    mutationFn: (planId: string) => buySubscription(planId),
    onSuccess: (data, planId) => {
      const plan = plans.find((p) => p.id === planId) || null;
      setSelectedPlan(plan);

      // Trích xuất mã ref từ paymentUrl
      let ref = "";
      try {
        const urlObj = new URL(data.paymentUrl);
        ref = urlObj.searchParams.get("ref") || "";
      } catch {
        ref = data.transactionId;
      }

      setPaymentInfo({
        transactionId: data.transactionId,
        paymentUrl: data.paymentUrl,
        ref: ref,
      });
      setPaymentSuccess(false);
    },
    onError: (err: any) => {
      alert(err.response?.data?.message || "Không thể khởi tạo giao dịch. Vui lòng thử lại sau.");
    },
  });

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (!accessToken) {
      navigate("/login");
      return;
    }
    buyMutation.mutate(plan.id);
  };

  const handleConfirmSimulation = async () => {
    if (!paymentInfo?.ref) return;
    try {
      setIsSimulating(true);
      await simulatePaymentCallback(paymentInfo.ref, true);
      setPaymentSuccess(true);
      // Bắn pháo hoa rực rỡ chúc mừng hội viên VIP
      fireConfetti();
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardOverview"] });
    } catch {
      alert("Không thể hoàn tất mô phỏng thanh toán. Vui lòng thử lại.");
    } finally {
      setIsSimulating(false);
    }
  };

  const getPlanDetails = (plan: SubscriptionPlan) => {
    const isRecommended = plan.durationDays === 90;
    const isBestValue = plan.durationDays >= 365;

    let savings = "";
    if (plan.durationDays === 90) savings = "Tiết kiệm 18.000đ";
    if (plan.durationDays >= 365) savings = "Tiết kiệm 189.000đ";

    const features = [
      "Đọc KHÔNG GIỚI HẠN toàn bộ truyện VIP và truyện có phí",
      "Truy cập sớm các chương truyện mới nhất",
      "Chế độ đọc không quảng cáo",
      "Lưu tiến độ đọc và đánh dấu không giới hạn",
      isRecommended || isBestValue ? "Huy hiệu VIP Hoàng Kim trên hồ sơ cá nhân" : "Huy hiệu VIP trên hồ sơ cá nhân",
      isBestValue ? "Ưu tiên hỗ trợ và bình luận nổi bật" : "Bình luận trao đổi trong các chương truyện",
    ];

    return { isRecommended, isBestValue, savings, features };
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-16 relative overflow-hidden">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs font-semibold uppercase tracking-wider mb-4 shadow-sm">
          <i className="fa-solid fa-crown text-xs" />
          Hội Viên VIP StoryReader
        </div>
        <h1 className="font-serif text-3xl md:text-5xl text-ink-text mb-4">
          Nâng cấp trải nghiệm đọc truyện
        </h1>
        <p className="text-ink-muted text-base sm:text-lg leading-relaxed">
          Mở khóa toàn bộ kho tàng truyện chữ, truyện tranh độc quyền và các chương VIP với mức phí ưu đãi nhất.
        </p>

        {/* Trạng thái VIP hiện tại nếu có */}
        {profile?.activePlanName && (
          <div className="mt-6 inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-medium shadow-sm">
            <i className="fa-solid fa-circle-check text-emerald-400" />
            <span>
              Bạn hiện đang là hội viên <strong>{profile.activePlanName}</strong>
              {profile.subscriptionEndAt && ` (hết hạn: ${new Date(profile.subscriptionEndAt).toLocaleDateString("vi-VN")})`}
            </span>
          </div>
        )}
      </div>

      {/* Pricing Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto pt-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-96 bg-white border border-slate-200 rounded-3xl animate-pulse shadow-sm" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch pt-6 relative z-10">
          {plans.map((plan) => {
            const { isRecommended, isBestValue, savings, features } = getPlanDetails(plan);

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl p-8 pt-10 transition-all duration-300 hover:-translate-y-1.5 ${
                  isRecommended
                    ? "bg-white border-2 border-orange-500 shadow-xl shadow-orange-500/15 md:scale-105 z-20"
                    : isBestValue
                    ? "bg-white border-2 border-sky-400 shadow-xl shadow-sky-500/10 z-10"
                    : "bg-white border border-slate-200 shadow-md hover:border-slate-300"
                }`}
              >
                {/* Lớp chứa sao băng riêng biệt có bo góc để không cắt badge nổi */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
                  {isRecommended && <Meteors number={12} />}
                </div>

                {/* Badge Khuyên dùng / Tiết kiệm - Nổi trên đầu card không bị cắt */}
                {isRecommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md shadow-orange-500/30 flex items-center gap-1.5 z-30 whitespace-nowrap">
                    <i className="fa-solid fa-star text-xs text-white" />
                    <span>Phổ biến nhất</span>
                  </div>
                )}

                {isBestValue && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-sky-500 to-blue-600 text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md shadow-blue-500/30 flex items-center gap-1.5 z-30 whitespace-nowrap">
                    <i className="fa-solid fa-gem text-xs text-white" />
                    <span>Tiết kiệm nhất</span>
                  </div>
                )}

                <div className="mb-6 relative z-10">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-serif text-2xl text-slate-900 font-bold">{plan.name}</h3>
                    {savings && (
                      <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {savings}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    Thời hạn sử dụng: {plan.durationDays} ngày đọc không giới hạn
                  </p>
                </div>

                <div className="mb-8 pb-6 border-b border-slate-200 relative z-10">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                      {formatCurrency(plan.price)}
                    </span>
                    <span className="text-slate-500 text-xs font-medium">/{plan.durationDays} ngày</span>
                  </div>
                </div>

                <ul className="flex-1 space-y-3.5 mb-8 relative z-10">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center shrink-0 mt-0.5">
                        <i className="fa-solid fa-check text-orange-600 text-xs" />
                      </div>
                      <span className="text-xs sm:text-sm text-slate-600 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  disabled={buyMutation.isPending}
                  className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 relative z-10 cursor-pointer ${
                    isRecommended
                      ? "bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-500/20"
                      : isBestValue
                      ? "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20"
                      : "bg-slate-100 border border-slate-300 text-slate-800 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  {buyMutation.isPending && selectedPlan?.id === plan.id ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin text-sm" />
                      <span>Đang tạo giao dịch...</span>
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-bolt text-xs" />
                      <span>Đăng Ký Ngay</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL THANH TOÁN (DEMO & VNPay GATEWAY) */}
      {paymentInfo && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 sm:p-8 shadow-2xl relative overflow-hidden text-slate-800">
            <button
              onClick={() => {
                setPaymentInfo(null);
                setSelectedPlan(null);
              }}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-2 rounded-xl transition-colors z-20 cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg" />
            </button>

            {paymentSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto text-2xl shadow-xs animate-bounce">
                  <i className="fa-solid fa-circle-check" />
                </div>
                <h3 className="font-serif text-2xl text-slate-900 font-bold">Thanh Toán Thành Công!</h3>
                <p className="text-sm text-slate-600">
                  Chúc mừng bạn đã trở thành hội viên <strong>{selectedPlan.name}</strong>. Gói VIP của bạn đã được kích hoạt thành công trên hệ thống.
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setPaymentInfo(null);
                      setSelectedPlan(null);
                      navigate("/profile");
                    }}
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white transition-all shadow-xs cursor-pointer"
                  >
                    Xem hồ sơ VIP
                  </button>
                  <button
                    onClick={() => {
                      setPaymentInfo(null);
                      setSelectedPlan(null);
                      navigate("/");
                    }}
                    className="px-6 py-2.5 rounded-xl text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                  >
                    Về trang chủ đọc truyện
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="text-orange-600 text-xs font-bold uppercase tracking-wider block mb-1">
                    Cổng thanh toán điện tử
                  </span>
                  <h3 className="font-serif text-2xl text-slate-900 font-bold">Thanh toán {selectedPlan.name}</h3>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gói dịch vụ:</span>
                    <span className="font-bold text-slate-900">{selectedPlan.name} ({selectedPlan.durationDays} ngày)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tổng thanh toán:</span>
                    <span className="text-orange-600 font-bold text-base">{formatCurrency(selectedPlan.price)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Mã tham chiếu:</span>
                    <span className="font-mono text-slate-600">{paymentInfo.ref.slice(0, 16)}...</span>
                  </div>
                </div>

                {/* Mã QR thanh toán mô phỏng */}
                <div className="text-center p-4 bg-white rounded-2xl shadow-inner max-w-[220px] mx-auto">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(paymentInfo.paymentUrl)}`}
                    alt="Mã QR thanh toán VNPay"
                    className="w-full h-auto mx-auto block"
                  />
                  <span className="text-[11px] text-slate-800 font-medium mt-2 block font-sans">
                    Quét mã VNPay / Ngân hàng
                  </span>
                </div>

                {/* Action buttons */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleConfirmSimulation}
                    disabled={isSimulating}
                    className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 hover:from-emerald-400 hover:to-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    {isSimulating ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin" />
                        <span>Đang xử lý kích hoạt...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check-double" />
                        <span>Xác nhận đã thanh toán (Mô phỏng tức thì)</span>
                      </>
                    )}
                  </button>

                  <a
                    href={paymentInfo.paymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-xl font-medium text-xs border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square" />
                    <span>Mở cổng thanh toán VNPay Sandbox</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trust badges */}
      <div className="mt-24 border-t border-ink-border pt-16 max-w-3xl mx-auto text-center relative z-10">
        <h2 className="font-serif text-2xl text-ink-text mb-8">Thanh toán an toàn & tiện lợi</h2>
        <div className="flex flex-wrap justify-center gap-8 items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="text-xl font-bold font-sans tracking-tight">MOMO</div>
          <div className="text-xl font-bold font-sans tracking-tight text-blue-500">ZaloPay</div>
          <div className="text-xl font-bold font-sans tracking-tight text-red-500">VNPay</div>
          <div className="text-xl font-bold font-sans tracking-tight text-green-500">Visa / Mastercard</div>
        </div>
      </div>
    </div>
  );
}
