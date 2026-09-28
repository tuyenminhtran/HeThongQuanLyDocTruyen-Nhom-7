import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { getReadingHistory, getBookmarks, getPurchasedStories } from "../api/users";
import StoryCard from "../components/StoryCard";
import { Navigate } from "react-router-dom";

type Tab = "history" | "bookmarks" | "purchased";

export default function ProfilePage() {
  const { accessToken, displayName, email } = useAuthStore();
  const [activeTab, setActiveTab] = useState<Tab>("history");
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(displayName || "");

  // Protect route
  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  // Fetch data based on active tab
  const { data: stories, isLoading } = useQuery({
    queryKey: ["user-library", activeTab],
    queryFn: () => {
      if (activeTab === "history") return getReadingHistory();
      if (activeTab === "bookmarks") return getBookmarks();
      if (activeTab === "purchased") return getPurchasedStories();
      return Promise.resolve([]);
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call to update profile
    alert(`Đã cập nhật tên thành: ${editName}`);
    setIsEditingProfile(false);
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
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
            {email || "Chưa cập nhật email"}
          </p>
        </div>
        <button 
          onClick={() => setIsEditingProfile(true)}
          className="shrink-0 px-5 py-2.5 rounded-xl font-medium border border-ink-border text-ink-text hover:bg-ink-bg hover:text-gold transition-colors text-sm flex items-center gap-2 z-10"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
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
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-gold text-ink-bg hover:bg-gold-dim transition-colors"
                >
                  Lưu thay đổi
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
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {activeTab === "bookmarks" && (
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0111.186 0z" />
                </svg>
              )}
              {activeTab === "purchased" && (
                <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
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
