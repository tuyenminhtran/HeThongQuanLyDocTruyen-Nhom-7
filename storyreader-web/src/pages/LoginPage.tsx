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
    setSocialNotice(`Cổng đăng nhập ${provider} đang được chuẩn bị. Vui lòng sử dụng Email & Mật khẩu bên dưới.`);
    setTimeout(() => setSocialNotice(null), 4000);
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <div className="mb-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-orange-600 transition-colors group"
          >
            <i className="fa-solid fa-arrow-left text-[11px] transform group-hover:-translate-x-1 transition-transform" />
            <span>Quay lại trang chủ</span>
          </Link>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-md p-6 sm:p-8">
          {/* Brand Header */}
          <div className="text-center mb-6">
            <h1 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
              Đăng nhập tài khoản
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Đồng bộ tủ sách và tiếp tục chương truyện đang đọc
            </p>
          </div>

          {/* Segmented Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5 text-center text-xs font-semibold">
            <span className="py-2 rounded-lg bg-orange-600 text-white shadow-xs">
              Đăng nhập
            </span>
            <Link
              to="/register"
              className="py-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              Đăng ký mới
            </Link>
          </div>

          {/* Quick Demo Fill Buttons */}
          <div className="mb-5 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <span className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
              <i className="fa-solid fa-bolt text-orange-500 text-xs" />
              Thử nghiệm nhanh:
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => fillDemoAccount("reader")}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 transition-colors cursor-pointer shadow-2xs"
              >
                Độc giả
              </button>
              <button
                type="button"
                onClick={() => fillDemoAccount("admin")}
                className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer shadow-2xs"
              >
                Admin
              </button>
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Địa chỉ Email
              </label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
              {errors.email && (
                <p className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
                  <i className="fa-solid fa-circle-exclamation text-xs shrink-0" />
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs text-orange-600 hover:text-orange-700 font-medium transition-colors cursor-pointer"
                >
                  Quên mật khẩu?
                </button>
              </div>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
                  <i className="fa-solid fa-lock text-xs" />
                </span>
                <input
                  {...register("password", {
                    required: "Vui lòng nhập mật khẩu",
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
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
                <p className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
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
                  className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500/30 transition-colors"
                />
                <span className="text-xs text-slate-600 hover:text-slate-900 transition-colors">
                  Duy trì đăng nhập
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5">
                <i className="fa-solid fa-circle-exclamation text-red-500 text-xs shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-relaxed flex-1">{error}</p>
              </div>
            )}

            {/* Notice Message */}
            {socialNotice && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                <i className="fa-solid fa-circle-info text-amber-600 text-xs shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed flex-1">{socialNotice}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-orange-600 hover:bg-orange-700 active:scale-[0.99] text-white font-bold py-3 px-5 rounded-xl shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin text-xs" />
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
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-2.5 text-slate-400 tracking-wider">
                Hoặc tiếp tục với
              </span>
            </div>
          </div>

          {/* Social Logins */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => handleSocialClick("Google")}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <i className="fa-brands fa-google text-red-500 text-xs" />
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialClick("GitHub")}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <i className="fa-brands fa-github text-slate-900 text-xs" />
              <span>GitHub</span>
            </button>
          </div>

          {/* Bottom Switch Link */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                className="text-orange-600 font-bold hover:text-orange-700 transition-colors"
              >
                Đăng ký ngay
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 text-center text-[11px] text-slate-400 flex items-center justify-center gap-3">
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-lock text-emerald-600 text-[10px]" />
            Bảo mật SSL 256-bit
          </span>
          <span>•</span>
          <span>StoryReader © 2026</span>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-sm w-full p-6 shadow-xl relative">
            <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mb-3">
              <i className="fa-solid fa-key text-sm" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-serif">Khôi phục mật khẩu</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Vui lòng liên hệ quản trị viên qua email hỗ trợ <strong className="text-orange-600">admin@storynest.local</strong> hoặc sử dụng tài khoản thử nghiệm trên giao diện đăng nhập.
            </p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors cursor-pointer"
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
