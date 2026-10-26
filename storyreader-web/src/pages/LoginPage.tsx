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
      setAuth(result.accessToken, result.email || data.email, result.displayName || data.email);
      navigate(from);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      if (!axiosErr?.response) {
        setError("Không thể kết nối đến máy chủ backend (cổng 5066).");
      } else {
        setError(axiosErr.response?.data?.message || "Email hoặc mật khẩu không chính xác.");
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
    setSocialNotice(`Cổng đăng nhập ${provider} đang được kết nối. Vui lòng sử dụng Email & Mật khẩu bên dưới.`);
    setTimeout(() => setSocialNotice(null), 4000);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-medium text-ink-muted hover:text-amber-400 transition-colors group"
          >
            <i className="fa-solid fa-arrow-left text-[11px] transform group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại trang chủ</span>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="bg-ink-card border border-ink-border rounded-2xl shadow-xl shadow-black/40 p-6 sm:p-8">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <Link to="/" className="inline-block group mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-ink-bg font-serif text-2xl font-black shadow-md shadow-amber-500/20 mx-auto group-hover:scale-105 transition-transform">
                S
              </div>
            </Link>
            <h1 className="font-serif text-2xl font-bold text-white tracking-tight">
              Đăng nhập tài khoản
            </h1>
            <p className="text-xs text-ink-muted mt-1">
              Đồng bộ tủ sách và tiếp tục chương truyện đang đọc
            </p>
          </div>

          {/* Segmented Switcher */}
          <div className="grid grid-cols-2 p-1 bg-ink-bg border border-ink-border rounded-xl mb-5 text-center text-xs font-semibold">
            <span className="py-2 rounded-lg bg-amber-500 text-ink-bg shadow-sm">
              Đăng nhập
            </span>
            <Link
              to="/register"
              className="py-2 text-ink-muted hover:text-white transition-colors"
            >
              Đăng ký mới
            </Link>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="mb-5 p-2.5 rounded-xl bg-ink-bg border border-ink-border/80 flex items-center justify-between text-xs">
            <span className="text-[11px] text-ink-muted flex items-center gap-1.5 font-medium">
              <i className="fa-solid fa-bolt text-amber-400 text-xs" />
              Thử nghiệm nhanh:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fillDemoAccount("reader")}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-ink-card hover:bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:border-amber-400 transition-colors cursor-pointer"
              >
                Độc giả
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("admin")}
                className="px-2.5 py-1 rounded-md text-[11px] font-medium bg-ink-card hover:bg-slate-700/50 text-slate-300 hover:text-white border border-ink-border transition-colors cursor-pointer"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
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
                  className="w-full bg-ink-bg border border-ink-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-text placeholder:text-ink-muted/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
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
                <label className="text-xs font-medium text-slate-300">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors cursor-pointer"
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
                  className="w-full bg-ink-bg border border-ink-border rounded-xl pl-10 pr-10 py-2.5 text-sm text-ink-text placeholder:text-ink-muted/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-white transition-colors cursor-pointer"
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

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-ink-border bg-ink-bg text-amber-500 focus:ring-amber-400/30 focus:ring-offset-0 transition-colors"
                />
                <span className="text-xs text-ink-muted hover:text-slate-300 transition-colors">
                  Duy trì đăng nhập
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5">
                <i className="fa-solid fa-circle-exclamation text-red-400 text-xs shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 leading-relaxed flex-1">{error}</p>
              </div>
            )}

            {/* Notice Message */}
            {socialNotice && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5">
                <i className="fa-solid fa-circle-info text-amber-400 text-xs shrink-0 mt-0.5" />
                <p className="text-xs text-amber-300 leading-relaxed flex-1">{socialNotice}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-110 active:scale-[0.99] text-ink-bg font-bold py-3 px-5 rounded-xl shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin text-xs text-ink-bg" />
                  <span className="text-sm">Đang xác thực...</span>
                </>
              ) : (
                <>
                  <span className="text-sm">Đăng nhập</span>
                  <i className="fa-solid fa-arrow-right text-xs" />
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-ink-border" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-ink-card px-2.5 text-ink-muted/70 tracking-wider">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleSocialClick("Google")}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-ink-bg border border-ink-border hover:border-ink-border-hover hover:bg-ink-elevated text-xs font-medium text-slate-300 transition-all cursor-pointer"
            >
              <i className="fa-brands fa-google text-red-400 text-xs" />
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialClick("GitHub")}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-ink-bg border border-ink-border hover:border-ink-border-hover hover:bg-ink-elevated text-xs font-medium text-slate-300 transition-all cursor-pointer"
            >
              <i className="fa-brands fa-github text-white text-xs" />
              <span>GitHub</span>
            </button>
          </div>

          {/* Bottom Switch Link */}
          <div className="mt-6 pt-4 border-t border-ink-border text-center">
            <p className="text-xs text-ink-muted">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-amber-400 font-semibold hover:text-amber-300 transition-colors"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 text-center text-[11px] text-ink-muted/60 flex items-center justify-center gap-3">
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-lock text-emerald-400 text-[10px]" />
            Bảo mật SSL 256-bit
          </span>
          <span>•</span>
          <span>StoryReader © 2026</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-ink-card border border-ink-border rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <i className="fa-solid fa-key text-sm text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-white font-serif">Khôi phục mật khẩu</h3>
            <p className="text-xs text-ink-muted mt-2 leading-relaxed">
              Vui lòng liên hệ quản trị viên qua email hỗ trợ <strong className="text-amber-400">admin@storynest.local</strong> hoặc sử dụng tài khoản thử nghiệm trên giao diện đăng nhập.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-ink-bg font-semibold text-xs transition-colors cursor-pointer"
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
