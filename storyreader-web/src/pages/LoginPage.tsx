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
            <svg
              className="w-4 h-4 transform group-hover:-translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
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
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span>Tự động lưu vị trí cuộn trang chính xác tới từng dòng</span>
                </li>
                <li className="flex items-center gap-3 text-xs text-slate-300">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 text-amber-400">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                    </svg>
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
                <svg className="w-3.5 h-3.5 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
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
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
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
                    className="w-full bg-[#0A0D14] border border-ink-border rounded-xl pl-10 pr-4 py-3 text-sm text-ink-text placeholder:text-ink-muted/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200"
                  />
                </div>
                {errors.email && (
                  <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
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
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </span>
                  <input
                    {...register("password", {
                      required: "Vui lòng nhập mật khẩu",
                    })}
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full bg-[#0A0D14] border border-ink-border rounded-xl pl-10 pr-11 py-3 text-sm text-ink-text placeholder:text-ink-muted/40 focus:outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-white transition-colors"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="flex items-center gap-1.5 text-red-400 text-xs mt-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                    </svg>
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
                    className="w-4 h-4 rounded border-ink-border bg-[#0A0D14] text-amber-500 focus:ring-amber-400/30 focus:ring-offset-0 transition-colors"
                  />
                  <span className="text-xs text-ink-muted hover:text-slate-300 transition-colors">
                    Duy trì đăng nhập trên trình duyệt này
                  </span>
                </label>
              </div>

              {/* Error message banner */}
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 animate-fadeIn">
                  <svg className="w-4 h-4 text-red-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <p className="text-xs text-red-300 leading-relaxed flex-1">{error}</p>
                </div>
              )}

              {/* Social notice banner */}
              {socialNotice && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 animate-fadeIn">
                  <svg className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
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
                    <svg className="animate-spin h-4 w-4 text-ink-bg" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Đang kiểm tra tài khoản...</span>
                  </>
                ) : (
                  <>
                    <span>Đăng nhập vào thư viện</span>
                    <svg
                      className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2.2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
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
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-[#0A0D14] border border-ink-border hover:border-ink-border-hover hover:bg-ink-elevated text-xs font-medium text-slate-300 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#EA4335"
                    d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.1-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.9.7 5.5 1.9 7.9l3.7-2.9z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                  />
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialClick("GitHub")}
                className="flex items-center justify-center gap-2.5 py-2.5 px-4 rounded-xl bg-[#0A0D14] border border-ink-border hover:border-ink-border-hover hover:bg-ink-elevated text-xs font-medium text-slate-300 transition-all cursor-pointer"
              >
                <svg className="w-4 h-4 fill-current text-white" viewBox="0 0 24 24">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
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
                  <span className="transform group-hover:translate-x-0.5 transition-transform">→</span>
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Security & Copyright Footer */}
        <div className="mt-6 text-center text-xs text-ink-muted/60 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
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
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
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
