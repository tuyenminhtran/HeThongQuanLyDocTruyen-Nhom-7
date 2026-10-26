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

  // Password Strength Evaluation
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
    if (passwordScore === 1) return { text: "Yếu", color: "text-rose-400" };
    if (passwordScore === 2) return { text: "Khá", color: "text-amber-400" };
    return { text: "Mạnh", color: "text-emerald-400" };
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
    setSocialNotice(`Cổng đăng ký nhanh qua ${provider} đang được chuẩn bị. Vui lòng hoàn tất mẫu đăng ký bên dưới.`);
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
              Tạo tài khoản mới
            </h1>
            <p className="text-xs text-ink-muted mt-1">
              Đăng ký miễn phí để lưu tủ sách và theo dõi chương truyện mới
            </p>
          </div>

          {/* Segmented Switcher */}
          <div className="grid grid-cols-2 p-1 bg-ink-bg border border-ink-border rounded-xl mb-5 text-center text-xs font-semibold">
            <Link
              to="/login"
              className="py-2 text-ink-muted hover:text-white transition-colors"
            >
              Đăng nhập
            </Link>
            <span className="py-2 rounded-lg bg-amber-500 text-ink-bg shadow-sm">
              Đăng ký mới
            </span>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Tên hiển thị / Biệt danh
              </label>
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
                  className="w-full bg-ink-bg border border-ink-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-text placeholder:text-ink-muted/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
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
                      message: "Định dạng email không hợp lệ",
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
                {password.length > 0 && (
                  <span className={`text-[11px] font-medium ${strengthLabel.color}`}>
                    Độ mạnh: {strengthLabel.text}
                  </span>
                )}
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

              {/* Password strength mini-bar */}
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="grid grid-cols-3 gap-1.5 h-1">
                    <div
                      className={`rounded-full transition-colors ${
                        passwordScore >= 1
                          ? passwordScore === 1
                            ? "bg-rose-500"
                            : passwordScore === 2
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                          : "bg-ink-border"
                      }`}
                    />
                    <div
                      className={`rounded-full transition-colors ${
                        passwordScore >= 2
                          ? passwordScore === 2
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                          : "bg-ink-border"
                      }`}
                    />
                    <div
                      className={`rounded-full transition-colors ${
                        passwordScore >= 3 ? "bg-emerald-500" : "bg-ink-border"
                      }`}
                    />
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

            {/* Confirm Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-slate-300">
                  Xác nhận mật khẩu
                </label>
                {confirmPassword.length > 0 && (
                  <span
                    className={`text-[11px] font-medium flex items-center gap-1 ${
                      confirmPassword === password
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }`}
                  >
                    {confirmPassword === password ? (
                      <>
                        <i className="fa-solid fa-check text-[10px]" />
                        Khớp
                      </>
                    ) : (
                      "Chưa khớp"
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
                    required: "Vui lòng xác nhận mật khẩu",
                    validate: (value) =>
                      value === password || "Mật khẩu xác nhận không khớp",
                  })}
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full bg-ink-bg border border-ink-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-text placeholder:text-ink-muted/40 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/30 transition-all"
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
            <div className="pt-0.5">
              <label className="flex items-start gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register("agreeTerms", {
                    required: "Vui lòng đồng ý với điều khoản để tiếp tục",
                  })}
                  className="w-4 h-4 rounded border-ink-border bg-ink-bg text-amber-500 focus:ring-amber-400/30 focus:ring-offset-0 mt-0.5 transition-colors"
                />
                <span className="text-xs text-ink-muted leading-relaxed">
                  Tôi đồng ý với{" "}
                  <span className="text-amber-400">Điều khoản dịch vụ</span> &{" "}
                  <span className="text-amber-400">Chính sách bảo mật</span>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-red-400 text-xs mt-1 ml-6">{errors.agreeTerms.message}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5">
                <i className="fa-solid fa-circle-exclamation text-red-400 text-xs shrink-0 mt-0.5" />
                <p className="text-xs text-red-300 leading-relaxed flex-1">{error}</p>
              </div>
            )}

            {/* Social Notice */}
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
                  <span className="text-sm">Đang tạo tài khoản...</span>
                </>
              ) : (
                <>
                  <span className="text-sm">Đăng ký thành viên</span>
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
                Hoặc đăng ký nhanh bằng
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
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-amber-400 font-semibold hover:text-amber-300 transition-colors"
              >
                Đăng nhập ngay
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
    </div>
  );
}
