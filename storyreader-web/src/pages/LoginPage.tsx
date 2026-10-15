import { useForm } from "react-hook-form";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { login } from "../api/auth";
import { useAuthStore } from "../store/authStore";
import { useState } from "react";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginForm>();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/";
  const setAuth = useAuthStore((s) => s.setAuth);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [socialNotice, setSocialNotice] = useState<string | null>(null);
  const [showForgotModal, setShowForgotModal] = useState(false);

  const onSubmit = async (data: LoginForm) => {
    setError(null);
    setSocialNotice(null);
    setLoading(true);
    try {
      const result = await login(data.email, data.password);
      setAuth(result.accessToken, data.email, data.email);
      navigate(from);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      if (!axiosErr?.response) {
        setError("Không thể kết nối đến máy chủ backend (cổng 5066).");
      } else {
        setError(axiosErr.response?.data?.message || "Email hoặc mật khẩu không đúng.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (role: "reader" | "admin") => {
    if (role === "admin") {
      setValue("email", "admin@storynest.local");
      setValue("password", "Admin@123456");
    } else {
      setValue("email", "reader@storyreader.vn");
      setValue("password", "Reader@123456");
    }
    setError(null);
  };

  const handleSocialClick = (provider: string) => {
    setSocialNotice(`Cổng đăng nhập nhanh qua ${provider} đang được chuẩn bị. Vui lòng sử dụng Email & Mật khẩu trong phiên bản này.`);
    setTimeout(() => setSocialNotice(null), 5000);
  };

  return (
    <div className="relative min-h-[calc(100vh-65px)] flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-amber-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[300px] bg-blue-600/10 blur-[140px] rounded-full pointer-events-none" />
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
            Phiên bản Web 2.0
          </span>
        </div>

        {/* Master Box with Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 bg-ink-card/90 backdrop-blur-xl border border-ink-border rounded-3xl overflow-hidden shadow-2xl shadow-black/80 ring-1 ring-white/5">
          {/* Left Column: Reader Showcase & Atmosphere (Desktop only) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-8 xl:p-10 bg-gradient-to-br from-[#0F1420] via-[#111724] to-[#0A0D15] border-r border-ink-border/80 relative">
            {/* Subtle decorative motif */}
            <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-xs font-semibold mb-6 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                Thư viện truyện số 1 độc giả yêu thích
              </div>

              {/* Title & Tagline */}
              <h2 className="font-serif text-2xl xl:text-3xl text-white font-bold leading-tight tracking-tight">
                Mở lại trang sách bạn đang đọc dở.
              </h2>
              <p className="text-ink-muted text-sm mt-3 leading-relaxed">
                Đăng nhập để đồng bộ tủ sách cá nhân, tiếp tục chương truyện dang dở và chia sẻ cảm xúc cùng cộng đồng.
              </p>

              {/* Featured Reading Card */}
              <div className="mt-7 p-4 rounded-2xl bg-ink-elevated/70 border border-ink-border/80 backdrop-blur-md shadow-lg">
                <div className="flex gap-3.5 items-center">
                  <div className="w-14 h-20 rounded-lg overflow-hidden shrink-0 border border-amber-500/30 shadow-md relative book-spine">
                    <img
                      src="https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80"
                      alt="Bìa truyện đề cử"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 mb-1">
                      Đang đọc nhiều nhất
                    </span>
                    <h4 className="text-sm font-semibold text-white truncate">
                      Vạn Cổ Thần Thoại
                    </h4>
                    <p className="text-xs text-ink-muted truncate">
                      Chương 482: Hồi Sinh Thần Kiếm
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-ink-bg rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full w-[72%]" />
                      </div>
                      <span className="text-[10px] text-amber-400 font-medium">72%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Value propositions */}
              <ul className="mt-6 space-y-3">
                <li className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                    <i className="fa-solid fa-clock-rotate-left text-xs" />
                  </div>
                  <span>Tự động lưu vị trí cuộn trang chính xác tới từng dòng</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                    <i className="fa-solid fa-shield-halved text-xs" />
                  </div>
                  <span>Chế độ đọc Obsidian chuẩn OLED chống mỏi mắt</span>
                </li>
              </ul>
            </div>

            {/* Social Proof Footer */}
            <div className="pt-6 border-t border-ink-border/60 flex items-center justify-between">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full bg-slate-700 border-2 border-[#0F1420] flex items-center justify-center text-[10px] font-bold text-amber-300">NV</div>
                <div className="w-8 h-8 rounded-full bg-amber-700 border-2 border-[#0F1420] flex items-center justify-center text-[10px] font-bold text-white">TL</div>
                <div className="w-8 h-8 rounded-full bg-indigo-700 border-2 border-[#0F1420] flex items-center justify-center text-[10px] font-bold text-white">MK</div>
                <div className="w-8 h-8 rounded-full bg-emerald-800 border-2 border-[#0F1420] flex items-center justify-center text-[10px] font-bold text-white">+5k</div>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-ink-muted">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>14,800+ độc giả trực tuyến</span>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Login Form */}
          <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
            {/* Segmented Tab Switcher */}
            <div className="flex items-center p-1 bg-ink-bg border border-ink-border rounded-xl mb-7 max-w-xs">
              <button
                type="button"
                className="flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 text-ink-bg shadow-md shadow-amber-500/20"
              >
                Đăng nhập
              </button>
              <Link
                to="/register"
                className="flex-1 py-2 text-xs sm:text-sm font-medium text-ink-muted hover:text-white text-center transition-colors"
              >
                Đăng ký mới
              </Link>
            </div>

            {/* Header Titles */}
            <div className="mb-6">
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Đăng nhập tài khoản
              </h1>
              <p className="text-sm text-ink-muted mt-1.5">
                Nhập thông tin tài khoản StoryReader để tiếp tục hành trình đọc truyện.
              </p>
            </div>

            {/* Quick Demo Fill Buttons (For effortless testing) */}
            <div className="mb-5 p-3 rounded-xl bg-ink-elevated/50 border border-ink-border flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-ink-muted flex items-center gap-1.5">
                <i className="fa-solid fa-wand-magic-sparkles text-amber-400 text-xs shrink-0" />
                Điền nhanh tài khoản thử nghiệm:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount("reader")}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-ink-card border border-ink-border text-amber-400 hover:border-amber-400/50 hover:bg-amber-400/10 transition-colors"
                >
                  Độc giả mẫu
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount("admin")}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-ink-card border border-ink-border text-slate-300 hover:text-white hover:border-slate-500 hover:bg-slate-800 transition-colors"
                >
                  Quản trị viên
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        message: "Email không đúng định dạng",
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

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Mật khẩu
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-xs text-amber-400/90 hover:text-amber-300 transition-colors font-medium"
                  >
                    Quên mật khẩu?
                  </button>
                </div>
                <div className="relative group">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted group-focus-within:text-amber-400 transition-colors">
                    <i className="fa-solid fa-lock text-xs" />
                  </span>
                  <input
                    {...register("password", {
                      required: "Vui lòng nhập mật khẩu",
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
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
                {errors.password && (
                  <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5">
                    <i className="fa-solid fa-circle-exclamation text-xs shrink-0" />
                    <span>{errors.password.message}</span>
                  </p>
                )}
              </div>

              {/* Remember Me Option */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-ink-border bg-ink-bg text-amber-500 focus:ring-amber-400/30 focus:ring-offset-0 transition-colors"
                  />
                  <span className="text-xs text-ink-muted hover:text-slate-300 transition-colors">
                    Duy trì đăng nhập trên trình duyệt này
                  </span>
                </label>
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
                    <span>Đang kiểm tra tài khoản...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập vào thư viện</span>
                    <i className="fa-solid fa-arrow-right text-xs transform group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Alternative Login Section */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-ink-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-ink-card px-3 text-ink-muted/70 tracking-wider">
                  Hoặc đăng nhập nhanh bằng
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

            {/* Bottom Register Prompt */}
            <div className="mt-7 pt-5 border-t border-ink-border text-center">
              <p className="text-xs sm:text-sm text-ink-muted">
                Lần đầu ghé thăm StoryReader?{" "}
                <Link
                  to="/register"
                  className="text-amber-400 font-semibold hover:text-amber-300 transition-colors inline-flex items-center gap-1 group"
                >
                  <span>Tạo tài khoản miễn phí</span>
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

      {/* Forgot Password Modal Dialog */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-ink-card border border-ink-border rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <i className="fa-solid fa-key text-base text-amber-400" />
            </div>
            <h3 className="text-lg font-bold text-white font-serif">Khôi phục mật khẩu</h3>
            <p className="text-xs text-ink-muted mt-2 leading-relaxed">
              Nếu bạn quên mật khẩu đăng nhập, vui lòng liên hệ quản trị viên qua email hỗ trợ <strong className="text-amber-400">support@storyreader.vn</strong> hoặc dùng tài khoản thử nghiệm có sẵn để tiếp tục trải nghiệm.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-ink-bg font-semibold text-xs transition-colors"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
