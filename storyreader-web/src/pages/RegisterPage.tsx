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
    if (!password) return { text: "Chưa nhập", color: "text-slate-400" };
    if (passwordScore === 1) return { text: "Yếu", color: "text-rose-500 font-semibold" };
    if (passwordScore === 2) return { text: "Khá", color: "text-amber-500 font-semibold" };
    return { text: "Mạnh", color: "text-emerald-600 font-semibold" };
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
            <Link to="/" className="inline-block group mb-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-serif text-2xl font-black shadow-md shadow-orange-500/20 mx-auto group-hover:scale-105 transition-transform">
                S
              </div>
            </Link>
            <h1 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
              Tạo tài khoản mới
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Đăng ký miễn phí để lưu tủ sách và theo dõi chương truyện mới
            </p>
          </div>

          {/* Segmented Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-5 text-center text-xs font-semibold">
            <Link
              to="/login"
              className="py-2 text-slate-600 hover:text-slate-900 transition-colors"
            >
              Đăng nhập
            </Link>
            <span className="py-2 rounded-lg bg-orange-600 text-white shadow-xs">
              Đăng ký mới
            </span>
          </div>

          {/* Register Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tên hiển thị / Biệt danh
              </label>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
              {errors.displayName && (
                <p className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
                  <i className="fa-solid fa-circle-exclamation text-xs shrink-0" />
                  <span>{errors.displayName.message}</span>
                </p>
              )}
            </div>

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
                      message: "Định dạng email không hợp lệ",
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
                {password.length > 0 && (
                  <span className={`text-[11px] ${strengthLabel.color}`}>
                    Độ mạnh: {strengthLabel.text}
                  </span>
                )}
              </div>
              <div className="relative group">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
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
                          : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`rounded-full transition-colors ${
                        passwordScore >= 2
                          ? passwordScore === 2
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                          : "bg-slate-200"
                      }`}
                    />
                    <div
                      className={`rounded-full transition-colors ${
                        passwordScore >= 3 ? "bg-emerald-500" : "bg-slate-200"
                      }`}
                    />
                  </div>
                </div>
              )}

              {errors.password && (
                <p className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
                  <i className="fa-solid fa-circle-exclamation text-xs shrink-0" />
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Xác nhận mật khẩu
                </label>
                {confirmPassword.length > 0 && (
                  <span
                    className={`text-[11px] font-semibold flex items-center gap-1 ${
                      confirmPassword === password
                        ? "text-emerald-600"
                        : "text-rose-500"
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
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-orange-500 transition-colors">
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
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
              </div>
              {errors.confirmPassword && (
                <p className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5">
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
                  className="w-4 h-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500/30 mt-0.5 transition-colors"
                />
                <span className="text-xs text-slate-600 leading-relaxed">
                  Tôi đồng ý với{" "}
                  <span className="text-orange-600 font-medium">Điều khoản dịch vụ</span> &{" "}
                  <span className="text-orange-600 font-medium">Chính sách bảo mật</span>
                </span>
              </label>
              {errors.agreeTerms && (
                <p className="text-red-500 text-xs mt-1 ml-6">{errors.agreeTerms.message}</p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5">
                <i className="fa-solid fa-circle-exclamation text-red-500 text-xs shrink-0 mt-0.5" />
                <p className="text-xs text-red-700 leading-relaxed flex-1">{error}</p>
              </div>
            )}

            {/* Social Notice */}
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
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-white px-2.5 text-slate-400 tracking-wider">
                Hoặc đăng ký nhanh bằng
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
              Đã có tài khoản?{" "}
              <Link
                to="/login"
                className="text-orange-600 font-bold hover:text-orange-700 transition-colors"
              >
                Đăng nhập ngay
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
    </div>
  );
}
