import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import {
  getUserProfile,
  getBookmarks,
  getReadingHistory,
  getPurchasedStories,
  updateUserProfile,
  changePassword,
} from "../api/users";
import StoryCard from "../components/StoryCard";
import { Navigate, Link } from "react-router-dom";

export default function ProfilePage() {
  const { accessToken, displayName, email, setDisplayName } = useAuthStore();
  const queryClient = useQueryClient();

  // Modals
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(displayName || "");
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Profile data
  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
    enabled: !!accessToken,
  });

  // Library counts
  const { data: bookmarks = [] } = useQuery({
    queryKey: ["user-library", "bookmarks"],
    queryFn: getBookmarks,
    enabled: !!accessToken,
  });

  const { data: history = [] } = useQuery({
    queryKey: ["user-library", "history"],
    queryFn: getReadingHistory,
    enabled: !!accessToken,
  });

  const { data: purchased = [], isLoading: isPurchasedLoading } = useQuery({
    queryKey: ["user-library", "purchased"],
    queryFn: getPurchasedStories,
    enabled: !!accessToken,
  });

  const updateMutation = useMutation({
    mutationFn: (newName: string) => updateUserProfile(newName),
    onSuccess: (data) => {
      const updated = data.displayName || editName;
      setDisplayName(updated);
      setUpdateError(null);
      setIsEditingProfile(false);
      queryClient.invalidateQueries({ queryKey: ["userProfile"] });
    },
    onError: (err: any) => {
      setUpdateError(err.response?.data?.message || "Không thể cập nhật tên hiển thị. Vui lòng thử lại.");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: () => changePassword(currentPassword, newPassword),
    onSuccess: () => {
      setPasswordSuccess("Đổi mật khẩu thành công!");
      setPasswordError(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        setIsChangingPassword(false);
        setPasswordSuccess(null);
      }, 1500);
    },
    onError: (err: any) => {
      setPasswordError(err.response?.data?.message || "Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.");
    },
  });

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateMutation.mutate(editName.trim());
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(null);

    if (newPassword.length < 6) {
      setPasswordError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Xác nhận mật khẩu mới không khớp.");
      return;
    }
    changePasswordMutation.mutate();
  };

  const isVip = profile?.role === "VIP" || !!profile?.activePlanName;
  const isAdmin = profile?.role === "Admin";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      
      {/* 1. Profile Header Card (Giao diện trắng tinh tế chuẩn TruyenQQ) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-orange-500/20 relative">
            <span className="text-3xl font-black font-sans uppercase">
              {(profile?.displayName || displayName)?.charAt(0) || "U"}
            </span>
            {isVip && (
              <span className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1.5 rounded-full text-xs shadow-md border-2 border-white" title="Hội viên VIP">
                <i className="fa-solid fa-crown text-[11px]" />
              </span>
            )}
            {isAdmin && (
              <span className="absolute -bottom-1 -right-1 bg-red-600 text-white p-1.5 rounded-full text-xs shadow-md border-2 border-white" title="Quản trị viên">
                <i className="fa-solid fa-shield-halved text-[11px]" />
              </span>
            )}
          </div>

          {/* User Details */}
          <div className="text-center md:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-2">
              <h1 className="font-serif text-2xl sm:text-3xl text-slate-900 font-bold truncate">
                {profile?.displayName || displayName || "Bạn đọc"}
              </h1>

              {/* Role Badges */}
              {isAdmin ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1.5 shadow-2xs">
                  <i className="fa-solid fa-shield-halved text-[10px]" />
                  Quản trị viên
                </span>
              ) : isVip ? (
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1.5 shadow-2xs">
                  <i className="fa-solid fa-crown text-amber-500 text-xs" />
                  VIP ({profile?.activePlanName || "Đang hoạt động"})
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                  Thành viên tiêu chuẩn
                </span>
              )}
            </div>

            <p className="text-slate-500 text-xs sm:text-sm flex items-center justify-center md:justify-start gap-2 mb-3">
              <i className="fa-regular fa-envelope text-slate-400" />
              <span>{profile?.email || email || "Chưa cập nhật email"}</span>
              {profile?.createdAt && (
                <>
                  <span className="text-slate-300">•</span>
                  <span className="text-slate-400">Tham gia: {new Date(profile.createdAt).toLocaleDateString("vi-VN")}</span>
                </>
              )}
            </p>

            {/* VIP Status or Upgrade Prompt */}
            {isVip && profile?.subscriptionEndAt ? (
              <div className="inline-flex items-center gap-2 text-xs text-amber-900 bg-amber-50 border border-amber-300 px-3.5 py-1.5 rounded-xl font-medium">
                <i className="fa-regular fa-calendar-check text-amber-600" />
                <span>Hạn dùng VIP đến: <strong>{new Date(profile.subscriptionEndAt).toLocaleDateString("vi-VN")}</strong></span>
                <Link to="/pricing" className="ml-2 font-bold text-amber-700 hover:text-amber-800 underline">
                  Gia hạn gói
                </Link>
              </div>
            ) : !isAdmin ? (
              <Link
                to="/pricing"
                className="inline-flex items-center gap-2 text-xs font-bold text-amber-900 bg-gradient-to-r from-amber-300 to-amber-400 hover:brightness-105 border border-amber-400 px-4 py-2 rounded-xl transition-all shadow-xs"
              >
                <i className="fa-solid fa-crown text-xs" />
                <span>Nâng cấp VIP đọc không giới hạn</span>
              </Link>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={() => {
                setEditName(profile?.displayName || displayName || "");
                setUpdateError(null);
                setIsEditingProfile(true);
              }}
              className="px-4 py-2.5 rounded-xl font-semibold border border-slate-300 hover:border-orange-500 hover:text-orange-600 bg-white text-slate-700 transition-colors text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <i className="fa-solid fa-pen-to-square text-xs" />
              <span>Chỉnh sửa tên</span>
            </button>

            <button
              onClick={() => {
                setPasswordError(null);
                setPasswordSuccess(null);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setIsChangingPassword(true);
              }}
              className="px-4 py-2.5 rounded-xl font-semibold border border-slate-300 hover:border-slate-400 bg-white text-slate-700 transition-colors text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <i className="fa-solid fa-key text-xs" />
              <span>Đổi mật khẩu</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Thống Kê Hoạt Động & Lối Tắt (3 Khối riêng biệt) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Khối 1: Truyện Theo Dõi */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-orange-300 transition-colors group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Đang Theo Dõi
              </span>
              <span className="text-3xl font-black text-slate-900 font-mono">
                {bookmarks.length}
              </span>
              <span className="text-xs text-slate-500 ml-1.5">truyện</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-base">
              <i className="fa-solid fa-bookmark" />
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100">
            <Link
              to="/following"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center justify-between group-hover:translate-x-0.5 transition-transform"
            >
              <span>Xem trang Theo Dõi riêng biệt</span>
              <i className="fa-solid fa-arrow-right text-[10px]" />
            </Link>
          </div>
        </div>

        {/* Khối 2: Lịch Sử Đọc */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-orange-300 transition-colors group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Lịch Sử Đã Đọc
              </span>
              <span className="text-3xl font-black text-slate-900 font-mono">
                {history.length}
              </span>
              <span className="text-xs text-slate-500 ml-1.5">truyện</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center text-base">
              <i className="fa-solid fa-clock-rotate-left" />
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100">
            <Link
              to="/history"
              className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center justify-between group-hover:translate-x-0.5 transition-transform"
            >
              <span>Xem toàn bộ lịch sử đọc</span>
              <i className="fa-solid fa-arrow-right text-[10px]" />
            </Link>
          </div>
        </div>

        {/* Khối 3: Truyện Đã Mua */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-orange-300 transition-colors">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Truyện Đã Mua
              </span>
              <span className="text-3xl font-black text-slate-900 font-mono">
                {purchased.length}
              </span>
              <span className="text-xs text-slate-500 ml-1.5">truyện bản quyền</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-base">
              <i className="fa-solid fa-bag-shopping" />
            </div>
          </div>
          <div className="pt-4 mt-2 border-t border-slate-100">
            <span className="text-xs text-slate-500">
              Quyền sở hữu vĩnh viễn trọn đời
            </span>
          </div>
        </div>
      </div>

      {/* 3. Phần: Danh Sách Truyện Đã Mua Bản Quyền */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 font-serif flex items-center gap-2">
              <i className="fa-solid fa-bag-shopping text-emerald-600 text-base" />
              <span>Truyện Bạn Đã Mở Khóa / Mua Bản Quyền</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Các tác phẩm trả phí bạn đã mua lẻ hoặc được tặng quyền đọc vĩnh viễn
            </p>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            {purchased.length} tác phẩm
          </span>
        </div>

        {isPurchasedLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse space-y-2">
                <div className="aspect-[2/3] bg-slate-200 rounded-xl" />
                <div className="h-4 bg-slate-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : purchased.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
            {purchased.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="py-12 text-center max-w-md mx-auto space-y-3">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto text-2xl">
              <i className="fa-solid fa-bag-shopping" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Chưa có truyện trả phí nào</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Bạn chưa mua lẻ tác phẩm nào. Bạn có thể mua từng truyện hoặc đăng ký gói VIP để đọc không giới hạn toàn bộ hệ thống!
            </p>
            <div className="pt-2">
              <Link
                to="/pricing"
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs transition-colors shadow-xs inline-flex items-center gap-1.5"
              >
                <i className="fa-solid fa-crown text-xs" />
                <span>Xem Gói VIP Ưu Đãi</span>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Modal Chỉnh Sửa Tên Hiển Thị */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
            <h3 className="font-serif text-xl font-bold text-slate-900 mb-4">
              Cập nhật tên hiển thị
            </h3>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Tên hiển thị mới
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">
                  Email (Không thể thay đổi)
                </label>
                <input
                  type="email"
                  value={email || ""}
                  disabled
                  className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              {updateError && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3">
                  {updateError}
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {updateMutation.isPending && <i className="fa-solid fa-spinner fa-spin text-xs" />}
                  <span>{updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Đổi Mật Khẩu */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
            <h3 className="font-serif text-xl font-bold text-slate-900 mb-4">
              Đổi mật khẩu tài khoản
            </h3>
            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu hiện tại
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu đang dùng"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mật khẩu mới (ít nhất 6 ký tự)
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-2 text-sm text-slate-900 focus:outline-none focus:border-orange-500 focus:bg-white"
                  required
                />
              </div>

              {passwordError && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center gap-2">
                  <i className="fa-solid fa-circle-check text-emerald-600" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold border border-slate-300 hover:bg-slate-100 transition-colors cursor-pointer text-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-colors shadow-xs cursor-pointer flex items-center gap-2"
                >
                  {changePasswordMutation.isPending && <i className="fa-solid fa-spinner fa-spin text-xs" />}
                  <span>{changePasswordMutation.isPending ? "Đang xử lý..." : "Cập nhật mật khẩu"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
