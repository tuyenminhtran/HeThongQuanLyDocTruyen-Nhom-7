import { useForm, useWatch } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { register as registerApi } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { useState, useMemo } from "react";

interface RegisterForm {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  agreeTerms: boolean;
}

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: {
      agreeTerms: true,
    },
  });
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [socialNotice, setSocialNotice] = useState<string | null>(null);

  const password = useWatch({ control, name: "password" }) || "";
  const confirmPassword = useWatch({ control, name: "confirmPassword" }) || "";

  // Dynamic Password Strength Evaluation
  const passwordCriteria = useMemo(() => {
    return {
      length: password.length >= 6,
      hasNumberOrSpecial: /[\d\W]/.test(password),
      hasMixedCase: /[a-z]/.test(password) && /[A-Z]/.test(password),
    };
  }, [password]);

  const passwordScore = useMemo(() => {
    if (!password) return 0;
    let score = 0;
    if (passwordCriteria.length) score += 1;
    if (passwordCriteria.hasNumberOrSpecial) score += 1;
    if (passwordCriteria.hasMixedCase) score += 1;
    return score;
  }, [password, passwordCriteria]);

  const strengthLabel = useMemo(() => {
    if (!password) return { text: "Chưa nhập", color: "text-ink-muted" };
    if (passwordScore === 1) return { text: "Mức độ: Yếu", color: "text-rose-400" };
    if (passwordScore === 2) return { text: "Mức độ: Khá", color: "text-amber-400" };
    return { text: "Mức độ: Rất an toàn", color: "text-emerald-400" };
  }, [password, passwordScore]);

  const onSubmit = async (data: RegisterForm) => {
    setError(null);
    setSocialNotice(null);
    setLoading(true);
    try {
      const result = await registerApi(
        data.email,
        data.password,
        data.displayName
      );
      setAuth(result.accessToken, data.email, data.displayName);
      navigate("/");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      if (!axiosErr?.response) {
        setError("Không thể kết nối đến máy chủ backend (cổng 5066).");
      } else {
        setError(
          axiosErr.response?.data?.message ||
          "Đăng ký thất bại. Email có thể đã tồn tại hoặc mật khẩu chưa đạt yêu cầu."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = (provider: string) => {
    setSocialNotice(`Cổng đăng ký nhanh qua ${provider} đang được kết nối. Vui lòng hoàn tất mẫu đăng ký bên dưới.`);
    setTimeout(() => setSocialNotice(null), 5000);
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 right-1/4 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-[450px] h-[300px] bg-purple-600/10 blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(#1A2234_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none" />

      {/* Main card container */}
      <div className="relative w-full max-w-5xl z-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-4 px-1">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium text-ink-muted hover:text-amber-400 transition-colors group"
          >
            <i className="fa-solid fa-arrow-left text-xs transform group-hover:-translate-x-1 transition-transform" />
            <span>Trang chủ StoryReader</span>
          </Link>
          <span className="text-xs text-ink-muted/60 hidden sm:inline-block">
            Tạo tài khoản miễn phí
          </span>
        </div>

        {/* Master Box with Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-ink-card/90 backdrop-blur-xl border border-ink-border rounded-3xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/5">
          {/* Left Column: Member Perks & Community Showcase (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 xl:p-10 bg-gradient-to-br from-[#0F1420] via-[#111724] to-[#0A0D15] border-r border-ink-border/80 relative">
            <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold mb-6 shadow-sm">
                <i className="fa-solid fa-crown text-amber-400 text-xs" />
                Gia nhập cộng đồng StoryReader
              </div>

              {/* Title & Tagline */}
              <h2 className="font-serif text-2xl xl:text-3xl text-white font-bold leading-tight tracking-tight">
                Khám phá hàng ngàn thế giới diệu kỳ.
              </h2>
              <p className="text-ink-muted text-sm mt-3 leading-relaxed">
                Chỉ mất 30 giây để thiết lập tài khoản và đắm chìm vào những bộ truyện tiên hiệp, ngôn tình, huyền huyễn hấp dẫn nhất.
              </p>

              {/* Exclusive Perks Card */}
              <div className="mt-7 p-5 rounded-2xl bg-ink-elevated/70 border border-ink-border/80 backdrop-blur-md shadow-lg space-y-3.5">
                <span className="text-xs font-bold text-amber-400 tracking-wider uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  Đặc quyền độc giả thành viên
                </span>

                <div className="space-y-3 pt-1">
                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <i className="fa-solid fa-check text-xs" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Lưu trữ tủ sách không giới hạn</h4>
                      <p className="text-[11px] text-ink-muted">Tự do đánh dấu, phân loại và nhận thông báo chương mới tức thì.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <i className="fa-solid fa-check text-xs" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Tương tác & Thảo luận sôi nổi</h4>
                      <p className="text-[11px] text-ink-muted">Bình luận theo từng câu chữ, bầu chọn hoa và kết bạn cùng độc giả chung gu.</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                      <i className="fa-solid fa-check text-xs" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Đồng bộ đa thiết bị</h4>
                      <p className="text-[11px] text-ink-muted">Chuyển đổi liền mạch giữa máy tính, điện thoại mà không gián đoạn cảm xúc.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Quote & Stats */}
            <div className="pt-6 border-t border-ink-border/60">
              <div className="flex items-center justify-between text-xs text-ink-muted">
                <span className="font-medium text-slate-300">52,000+ thành viên đã đăng ký</span>
                <span className="text-amber-400 font-semibold">100% Miễn phí</span>
              </div>
            </div>
          </div>

          {/* Right Column: Register Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            {/* Segmented Tab Switcher */}
            <div className="flex items-center p-1 bg-ink-bg border border-ink-border rounded-xl mb-7 max-w-xs">
              <Link
                to="/login"
                className="flex-1 py-2 text-xs sm:text-sm font-medium text-ink-muted hover:text-white text-center transition-colors"
              >
                Đăng nhập
              </Link>
              <button
                type="button"
                className="flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-ink-bg shadow-md shadow-amber-500/20"
              >
                Đăng ký mới
              </button>
            </div>

            {/* Header Titles */}
            <div className="mb-6">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Khởi tạo tài khoản
              </h1>
              <p className="text-sm text-ink-muted mt-1.5">
                Nhập vài thông tin cơ bản để tham gia ngay hôm nay.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Display Name */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Tên hiển thị / Biệt danh
                  </label>
                  <span className="text-[11px] text-ink-muted/80">Hiện khi bình luận</span>
                </div>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-amber-400 transition-colors">
                    <i className="fa-solid fa-user text-xs" />
                  </span>
                  <input
                    {...register("displayName", {
                      required: "Vui lòng nhập tên hiển thị",
                      minLength: {
                        value: 2,
                        message: "Tên hiển thị cần tối thiểu 2 ký tự",
                      },
                    })}
                    placeholder="Ví dụ: Độc Cô Cầu Bại"
                    className="w-full bg-ink-bg border border-ink-border rounded-xl pl-10 pr-4 py-3 text-sm text-ink-text placeholder:text-ink-muted/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200"
                  />
                </div>
                {errors.displayName && (
                  <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5">
                    <i className="fa-solid fa-circle-exclamation text-xs shrink-0" />
                    <span>{errors.displayName.message}</span>
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Địa chỉ Email
                </label>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-amber-400 transition-colors">
                    <i className="fa-solid fa-envelope text-xs" />
                  </span>
                  <input
                    {...register("email", {
                      required: "Vui lòng nhập địa chỉ email",
                      pattern: {
                        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                        message: "Định dạng email không hợp lệ",
                      },
                    })}
                    type="email"
                    placeholder="ban@example.com"
                    className="w-full bg-ink-bg border border-ink-border rounded-xl pl-10 pr-4 py-3 text-sm text-ink-text placeholder:text-ink-muted/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200"
                  />
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5">
                    <i className="fa-solid fa-circle-exclamation text-xs shrink-0" />
                    <span>{errors.email.message}</span>
                  </p>
                )}
              </div>

              {/* Password with Strength Meter */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Mật khẩu bảo vệ
                  </label>
                  <span className={`text-[11px] font-medium ${strengthLabel.color}`}>
                    {strengthLabel.text}
                  </span>
                </div>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-amber-400 transition-colors">
                    <i className="fa-solid fa-lock text-xs" />
                  </span>
                  <input
                    {...register("password", {
                      required: "Vui lòng nhập mật khẩu",
                      minLength: {
                        value: 6,
                        message: "Mật khẩu cần tối thiểu 6 ký tự",
                      },
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full bg-ink-bg border border-ink-border rounded-xl pl-10 pr-11 py-3 text-sm text-ink-text placeholder:text-ink-muted/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-white transition-colors"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <i className="fa-solid fa-eye-slash text-xs" />
                    ) : (
                      <i className="fa-solid fa-eye text-xs" />
                    )}
                  </button>
                </div>

                {/* Real-time Password Strength Visual Bar */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1.5 animate-fadeIn">
                    <div className="grid grid-cols-3 gap-1.5 h-1.5">
                      <div
                        className={`rounded-full transition-all duration-300 ${passwordScore >= 1 ? (passwordScore === 1 ? "bg-rose-500" : passwordScore === 2 ? "bg-amber-500" : "bg-emerald-500") : "bg-ink-border"
                          }`}
                      />
                      <div
                        className={`rounded-full transition-all duration-300 ${passwordScore >= 2 ? (passwordScore === 2 ? "bg-amber-500" : "bg-emerald-500") : "bg-ink-border"
                          }`}
                      />
                      <div
                        className={`rounded-full transition-all duration-300 ${passwordScore >= 3 ? "bg-emerald-500" : "bg-ink-border"
                          }`}
                      />
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-ink-muted/80 pt-0.5">
                      <span className={passwordCriteria.length ? "text-emerald-400 flex items-center gap-1" : "flex items-center gap-1"}>
                        {passwordCriteria.length ? <i className="fa-solid fa-check text-[10px]" /> : <span className="text-[10px]">•</span>} Tối thiểu 6 ký tự
                      </span>
                      <span className={passwordCriteria.hasNumberOrSpecial ? "text-emerald-400 flex items-center gap-1" : "flex items-center gap-1"}>
                        {passwordCriteria.hasNumberOrSpecial ? <i className="fa-solid fa-check text-[10px]" /> : <span className="text-[10px]">•</span>} Chữ số hoặc ký tự đặc biệt
                      </span>
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5">
                    <i className="fa-solid fa-circle-exclamation text-xs shrink-0" />
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Confirm Password with Live Match Status */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Xác nhận mật khẩu
                  </label>
                  {confirmPassword.length > 0 && (
                    <span
                      className={`text-[11px] font-medium flex items-center gap-1 ${confirmPassword === password
                          ? "text-emerald-400"
                          : "text-rose-400"
                        }`}
                    >
                      {confirmPassword === password ? (
                        <>
                          <i className="fa-solid fa-check text-xs" />
                          Khớp hoàn toàn
                        </>
                      ) : (
                        "Chưa trùng khớp"
                      )}
                    </span>
                  )}
                </div>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-amber-400 transition-colors">
                    <i className="fa-solid fa-shield-halved text-xs" />
                  </span>
                  <input
                    {...register("confirmPassword", {
                      required: "Vui lòng nhập lại mật khẩu",
                      validate: (value) =>
                        value === password || "Mật khẩu xác nhận không khớp",
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập lại chính xác mật khẩu"
                    className="w-full bg-ink-bg border border-ink-border rounded-xl pl-10 pr-4 py-3 text-sm text-ink-text placeholder:text-ink-muted/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5">
                    <i className="fa-solid fa-circle-exclamation text-xs shrink-0" />
                    <span>{errors.confirmPassword.message}</span>
                  </p>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register("agreeTerms", {
                      required: "Vui lòng đồng ý với điều khoản để tiếp tục",
                    })}
                    className="w-4 h-4 rounded border-ink-border bg-ink-bg text-amber-500 focus:ring-amber-400/30 focus:ring-offset-0 mt-0.5 transition-colors"
                  />
                  <span className="text-xs text-ink-muted leading-relaxed">
                    Tôi đồng ý với{" "}
                    <span className="text-amber-400 hover:underline">Điều khoản dịch vụ</span> và{" "}
                    <span className="text-amber-400 hover:underline">Chính sách bảo mật</span> của StoryReader.
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-red-400 text-xs mt-1 ml-6">{errors.agreeTerms.message}</p>
                )}
              </div>

              {/* Error message banner */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 animate-fadeIn">
                  <i className="fa-solid fa-circle-exclamation text-red-400 text-sm shrink-0 mt-0.5" />
                  <p className="text-xs text-red-300 leading-relaxed flex-1">{error}</p>
                </div>
              )}

              {/* Social notice banner */}
              {socialNotice && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 animate-fadeIn">
                  <i className="fa-solid fa-circle-info text-amber-400 text-sm shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-300 leading-relaxed flex-1">{socialNotice}</p>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 active:scale-[0.99] text-ink-bg font-bold py-3.5 px-6 rounded-xl shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin text-sm text-ink-bg" />
                    <span>Đang khởi tạo tài khoản...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng ký thành viên mới</span>
                    <i className="fa-solid fa-arrow-right text-xs transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Alternative Register Section */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ink-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-ink-card px-3 text-ink-muted/70 tracking-wider">
                  Hoặc đăng ký nhanh bằng
                </span>
              </div>
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSocialClick("Google")}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-ink-bg border border-ink-border hover:border-ink-border-hover hover:bg-ink-elevated text-xs font-medium text-slate-300 transition-all cursor-pointer"
              >
                <i className="fa-brands fa-google text-red-500 text-sm" />
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialClick("GitHub")}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-ink-bg border border-ink-border hover:border-ink-border-hover hover:bg-ink-elevated text-xs font-medium text-slate-300 transition-all cursor-pointer"
              >
                <i className="fa-brands fa-github text-white text-sm" />
                <span>GitHub</span>
              </button>
            </div>

            {/* Bottom Login Prompt */}
            <div className="mt-7 pt-5 border-t border-ink-border text-center">
              <p className="text-xs sm:text-sm text-ink-muted">
                Đã có tài khoản từ trước?{" "}
                <Link
                  to="/login"
                  className="text-amber-400 font-semibold hover:text-amber-300 transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Đăng nhập ngay</span>
                  <i className="fa-solid fa-arrow-right text-xs transform group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Security & Copyright Footer */}
        <div className="mt-6 text-center text-xs text-ink-muted/60 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-lock text-emerald-400 text-xs" />
            Bảo mật SSL 256-bit chuẩn quốc tế
          </span>
          <span>•</span>
          <span>StoryReader Online © 2026</span>
        </div>
      </div>
    </div>
  );
}
