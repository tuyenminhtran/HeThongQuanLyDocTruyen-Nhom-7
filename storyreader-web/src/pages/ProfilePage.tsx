import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import {
  getUserProfile,
  getReadingHistory,
  getBookmarks,
  getPurchasedStories,
  updateUserProfile,
  changePassword,
} from "../api/users";
import StoryCard from "../components/StoryCard";
import { Navigate, Link } from "react-router-dom";

type Tab = "history" | "bookmarks" | "purchased";

export default function ProfilePage() {
  const { accessToken, displayName, email, setDisplayName } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("history");

  // Modal chỉnh sửa tên hiển thị
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(displayName || "");
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Modal đổi mật khẩu
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Lấy thông tin tài khoản chi tiết
  const { data: profile } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getUserProfile,
    enabled: !!accessToken,
  });

  // Fetch data theo từng tab
  const { data: stories, isLoading } = useQuery({
    queryKey: ["user-library", activeTab],
    queryFn: () => {
      if (activeTab === "history") return getReadingHistory();
      if (activeTab === "bookmarks") return getBookmarks();
      if (activeTab === "purchased") return getPurchasedStories();
      return Promise.resolve([]);
    },
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

  // Chặn truy cập nếu chưa đăng nhập
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-12 bg-ink-card border border-ink-border rounded-2xl p-6 md:p-8 shadow-xl shadow-black/20 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border-2 border-gold/30 flex items-center justify-center shrink-0 shadow-lg shadow-gold/10 relative">
          <span className="text-3xl font-serif text-gold uppercase font-bold">
            {(profile?.displayName || displayName)?.charAt(0) || "U"}
          </span>
          {isVip && (
            <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1.5 rounded-full text-xs shadow-md" title="Hội viên VIP">
              <i className="fa-solid fa-crown text-[10px]" />
            </span>
          )}
          {isAdmin && (
            <span className="absolute -bottom-1 -right-1 bg-red-500 text-white p-1.5 rounded-full text-xs shadow-md" title="Quản trị viên">
              <i className="fa-solid fa-shield-halved text-[10px]" />
            </span>
          )}
        </div>

        <div className="text-center md:text-left flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 mb-2">
            <h1 className="font-serif text-2xl md:text-3xl text-ink-text font-bold truncate">
              {profile?.displayName || displayName || "Người dùng"}
            </h1>

            {/* Badges */}
            {isAdmin ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1.5">
                <i className="fa-solid fa-shield-halved text-[10px]" />
                Quản trị viên
              </span>
            ) : isVip ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1.5">
                <i className="fa-solid fa-crown text-[10px] text-amber-400" />
                VIP ({profile?.activePlanName})
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-ink-bg border border-ink-border text-ink-muted">
                Thành viên tiêu chuẩn
              </span>
            )}
          </div>

          <p className="text-ink-muted text-sm flex items-center justify-center md:justify-start gap-2 mb-3">
            <i className="fa-solid fa-envelope text-xs" />
            {profile?.email || email || "Chưa cập nhật email"}
          </p>

          {/* Chi tiết gói VIP hoặc Nút nâng cấp */}
          {isVip && profile?.subscriptionEndAt ? (
            <div className="inline-flex items-center gap-2 text-xs text-amber-300/90 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl">
              <i className="fa-regular fa-calendar-check text-amber-400" />
              <span>Hạn dùng VIP đến: <strong>{new Date(profile.subscriptionEndAt).toLocaleDateString("vi-VN")}</strong></span>
            </div>
          ) : !isAdmin ? (
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 text-xs font-semibold text-gold hover:text-gold-dim bg-gold/10 hover:bg-gold/15 border border-gold/30 px-3.5 py-1.5 rounded-xl transition-all shadow-sm"
            >
              <i className="fa-solid fa-bolt text-xs" />
              <span>Nâng cấp VIP đọc không giới hạn</span>
            </Link>
          ) : null}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0 z-10">
          <button 
            onClick={() => {
              setEditName(profile?.displayName || displayName || "");
              setUpdateError(null);
              setIsEditingProfile(true);
            }}
            className="px-4 py-2.5 rounded-xl font-medium border border-ink-border text-ink-text hover:bg-ink-bg hover:text-gold transition-colors text-xs sm:text-sm flex items-center gap-2"
          >
            <i className="fa-solid fa-pen-to-square text-xs" />
            Chỉnh sửa tên
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
            className="px-4 py-2.5 rounded-xl font-medium border border-ink-border text-ink-text hover:bg-ink-bg hover:text-sky-400 transition-colors text-xs sm:text-sm flex items-center gap-2"
          >
            <i className="fa-solid fa-key text-xs" />
            Đổi mật khẩu
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-ink-card border border-ink-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="font-serif text-xl text-ink-text mb-4">Cập nhật hồ sơ</h2>
            <form onSubmit={handleSaveProfile}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-ink-muted mb-1.5">Tên hiển thị</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full bg-ink-bg border border-ink-border rounded-xl px-4 py-2.5 text-sm text-ink-text focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
                  required
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-ink-muted mb-1.5">Email (Không thể đổi)</label>
                <input
                  type="email"
                  value={email || ""}
                  disabled
                  className="w-full bg-ink-bg/50 border border-ink-border/50 rounded-xl px-4 py-2.5 text-sm text-ink-muted cursor-not-allowed"
                />
              </div>
              {updateError && (
                <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
                  {updateError}
                </div>
              )}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-ink-border text-ink-text hover:bg-ink-bg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 rounded-xl text-sm font-bold bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {updateMutation.isPending && (
                    <i className="fa-solid fa-spinner fa-spin text-xs" />
                  )}
                  {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-ink-card border border-ink-border rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="font-serif text-xl text-ink-text mb-4">Đổi mật khẩu tài khoản</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1.5">Mật khẩu hiện tại</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Nhập mật khẩu đang dùng"
                  className="w-full bg-ink-bg border border-ink-border rounded-xl px-4 py-2.5 text-sm text-ink-text focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1.5">Mật khẩu mới (ít nhất 6 ký tự)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nhập mật khẩu mới"
                  className="w-full bg-ink-bg border border-ink-border rounded-xl px-4 py-2.5 text-sm text-ink-text focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1.5">Xác nhận mật khẩu mới</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full bg-ink-bg border border-ink-border rounded-xl px-4 py-2.5 text-sm text-ink-text focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30"
                  required
                />
              </div>

              {passwordError && (
                <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                  <i className="fa-solid fa-triangle-exclamation" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 flex items-center gap-2">
                  <i className="fa-solid fa-circle-check" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangingPassword(false)}
                  className="px-4 py-2 rounded-xl text-sm font-medium border border-ink-border text-ink-text hover:bg-ink-bg transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="px-5 py-2 rounded-xl text-sm font-bold bg-orange-600 text-white hover:bg-orange-700 disabled:opacity-50 transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  {changePasswordMutation.isPending && (
                    <i className="fa-solid fa-spinner fa-spin text-xs" />
                  )}
                  {changePasswordMutation.isPending ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 border-b border-ink-border pb-px">
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "history"
              ? "border-gold text-gold"
              : "border-transparent text-ink-muted hover:text-ink-text"
          }`}
        >
          <i className="fa-solid fa-clock-rotate-left text-xs" />
          <span>Lịch sử đọc</span>
        </button>
        <button
          onClick={() => setActiveTab("bookmarks")}
          className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "bookmarks"
              ? "border-gold text-gold"
              : "border-transparent text-ink-muted hover:text-ink-text"
          }`}
        >
          <i className="fa-solid fa-bookmark text-xs" />
          <span>Đã lưu (Bookmark)</span>
        </button>
        <button
          onClick={() => setActiveTab("purchased")}
          className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "purchased"
              ? "border-gold text-gold"
              : "border-transparent text-ink-muted hover:text-ink-text"
          }`}
        >
          <i className="fa-solid fa-bag-shopping text-xs" />
          <span>Truyện đã mua</span>
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] bg-ink-card rounded-xl border border-ink-border" />
                <div className="mt-2.5 h-4 bg-ink-card rounded-md w-3/4" />
                <div className="mt-1.5 h-3 bg-ink-card rounded-md w-1/2" />
              </div>
            ))}
          </div>
        ) : stories && stories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-x-5 gap-y-8">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-ink-card border border-ink-border flex items-center justify-center mb-5 text-ink-muted">
              {activeTab === "history" && (
                <i className="fa-solid fa-clock-rotate-left text-3xl opacity-60" />
              )}
              {activeTab === "bookmarks" && (
                <i className="fa-solid fa-bookmark text-3xl opacity-60" />
              )}
              {activeTab === "purchased" && (
                <i className="fa-solid fa-bag-shopping text-3xl opacity-60" />
              )}
            </div>
            <p className="text-ink-muted text-base font-serif mb-2">
              {activeTab === "history" && "Chưa có lịch sử đọc truyện"}
              {activeTab === "bookmarks" && "Bạn chưa đánh dấu theo dõi truyện nào"}
              {activeTab === "purchased" && "Bạn chưa mua truyện trả phí nào"}
            </p>
            <Link
              to="/"
              className="mt-3 px-5 py-2 rounded-xl text-xs font-semibold bg-gold/10 text-gold border border-gold/20 hover:bg-gold hover:text-ink-bg transition-all"
            >
              Khám phá truyện ngay
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
