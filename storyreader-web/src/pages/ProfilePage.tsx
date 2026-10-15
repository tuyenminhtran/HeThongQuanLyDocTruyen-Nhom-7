import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { getReadingHistory, getBookmarks, getPurchasedStories, updateUserProfile } from "../api/users";
import StoryCard from "../components/StoryCard";
import { Navigate } from "react-router-dom";

type Tab = "history" | "bookmarks" | "purchased";

export default function ProfilePage() {
  const { accessToken, displayName, email, setDisplayName } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("history");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(displayName || "");
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Fetch data based on active tab
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
      queryClient.invalidateQueries({ queryKey: ["user-library"] });
    },
    onError: () => {
      setUpdateError("Không thể cập nhật tên hiển thị. Vui lòng thử lại.");
    },
  });

  // Protect route
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;
    updateMutation.mutate(editName.trim());
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
      {/* Header Profile */}
      <div className="flex flex-col md:flex-row gap-6 items-center md:items-start mb-12 bg-ink-card border border-ink-border rounded-2xl p-6 md:p-8 shadow-xl shadow-black/20 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[100px] rounded-full pointer-events-none" />

        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border-2 border-gold/20 flex items-center justify-center shrink-0">
          <span className="text-3xl font-serif text-gold uppercase">
            {displayName?.charAt(0) || "U"}
          </span>
        </div>
        <div className="text-center md:text-left flex-1">
          <h1 className="font-serif text-2xl md:text-3xl text-ink-text mb-2">
            {displayName || "Người dùng"}
          </h1>
          <p className="text-ink-muted flex items-center justify-center md:justify-start gap-2">
            <i className="fa-solid fa-envelope text-sm" />
            {email || "Chưa cập nhật email"}
          </p>
        </div>
        <button 
          onClick={() => setIsEditingProfile(true)}
          className="shrink-0 px-5 py-2.5 rounded-xl font-medium border border-ink-border text-ink-text hover:bg-ink-bg hover:text-gold transition-colors text-sm flex items-center gap-2 z-10"
        >
          <i className="fa-solid fa-pen-to-square text-xs" />
          Chỉnh sửa
        </button>
      </div>

      {/* Edit Profile Modal */}
      {isEditingProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
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
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-gold text-ink-bg hover:bg-gold-dim disabled:opacity-50 transition-colors flex items-center gap-2"
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

      {/* Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 border-b border-ink-border pb-px">
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "history"
              ? "border-gold text-gold"
              : "border-transparent text-ink-muted hover:text-ink-text"
          }`}
        >
          Lịch sử đọc
        </button>
        <button
          onClick={() => setActiveTab("bookmarks")}
          className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "bookmarks"
              ? "border-gold text-gold"
              : "border-transparent text-ink-muted hover:text-ink-text"
          }`}
        >
          Đã lưu (Bookmark)
        </button>
        <button
          onClick={() => setActiveTab("purchased")}
          className={`px-6 py-3 font-medium whitespace-nowrap border-b-2 transition-colors ${
            activeTab === "purchased"
              ? "border-gold text-gold"
              : "border-transparent text-ink-muted hover:text-ink-text"
          }`}
        >
          Truyện đã mua
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
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-full bg-ink-card border border-ink-border flex items-center justify-center mb-5 text-ink-muted">
              {activeTab === "history" && (
                <i className="fa-solid fa-clock-rotate-left text-3xl" />
              )}
              {activeTab === "bookmarks" && (
                <i className="fa-solid fa-bookmark text-3xl" />
              )}
              {activeTab === "purchased" && (
                <i className="fa-solid fa-bag-shopping text-3xl" />
              )}
            </div>
            <p className="text-ink-muted text-lg font-serif">
              {activeTab === "history" && "Chưa có lịch sử đọc"}
              {activeTab === "bookmarks" && "Chưa lưu truyện nào"}
              {activeTab === "purchased" && "Chưa mua truyện nào"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
