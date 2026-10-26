import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBookmarks } from "../api/users";
import { toggleFollowStory } from "../api/stories";
import { useAuthStore } from "../store/authStore";
import { Link, Navigate } from "react-router-dom";

export default function FollowingPage() {
  const { accessToken } = useAuthStore();
  const queryClient = useQueryClient();

  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState<number | "all">("all");
  const [statusFilter, setStatusFilter] = useState<number | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "views" | "title">("newest");
  const [unfollowingId, setUnfollowingId] = useState<string | null>(null);

  // Lấy danh sách truyện đang theo dõi
  const { data: followedStories = [], isLoading } = useQuery({
    queryKey: ["user-library", "bookmarks"],
    queryFn: getBookmarks,
    enabled: !!accessToken,
  });

  const unfollowMutation = useMutation({
    mutationFn: (storyId: string) => toggleFollowStory(storyId),
    onMutate: (storyId) => {
      setUnfollowingId(storyId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-library", "bookmarks"] });
      queryClient.invalidateQueries({ queryKey: ["isFollowing"] });
      setUnfollowingId(null);
    },
    onError: () => {
      alert("Không thể bỏ theo dõi lúc này. Vui lòng thử lại.");
      setUnfollowingId(null);
    },
  });

  // Lọc và sắp xếp truyện
  const filteredStories = useMemo(() => {
    let result = [...followedStories];

    if (keyword.trim()) {
      const q = keyword.trim().toLowerCase();
      result = result.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          (s.author && s.author.toLowerCase().includes(q))
      );
    }

    if (typeFilter !== "all") {
      result = result.filter((s) => (s.type ?? 0) === typeFilter);
    }

    if (statusFilter !== "all") {
      result = result.filter((s) => s.status === statusFilter);
    }

    if (sortBy === "views") {
      result.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
    } else if (sortBy === "title") {
      result.sort((a, b) => a.title.localeCompare(b.title, "vi"));
    }

    return result;
  }, [followedStories, keyword, typeFilter, statusFilter, sortBy]);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      {/* 1. Header Trang Theo Dõi */}
      <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg shadow-orange-500/15 relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold text-white">
              <i className="fa-solid fa-bookmark text-amber-200" />
              <span>Tủ Sách Theo Dõi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight">
              Truyện Đang Theo Dõi
            </h1>
            <p className="text-white/80 text-xs sm:text-sm max-w-xl">
              Cập nhật nhanh nhất các chương mới và quản lý những tác phẩm bạn yêu thích tại đây.
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md border border-white/25 rounded-2xl px-5 py-3 text-center sm:text-right shrink-0">
            <span className="text-xs uppercase tracking-wider text-white/80 block font-medium">
              Đang theo dõi
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {followedStories.length}
            </span>
            <span className="text-xs text-white/90 block">tác phẩm</span>
          </div>
        </div>
      </div>

      {/* 2. Thanh Công Cụ & Bộ Lọc Nhanh */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Ô tìm kiếm trong danh sách theo dõi */}
          <div className="relative flex-1 max-w-md">
            <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Tìm theo tên truyện hoặc tác giả..."
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:bg-white focus:border-orange-500 rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
            {keyword && (
              <button
                onClick={() => setKeyword("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-xs" />
              </button>
            )}
          </div>

          {/* Sắp xếp */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium shrink-0">Sắp xếp:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="newest">Mới cập nhật</option>
              <option value="views">Lượt đọc cao nhất</option>
              <option value="title">Tên truyện A - Z</option>
            </select>
          </div>
        </div>

        {/* Lọc nhanh theo Hình thức & Trạng thái */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                typeFilter === "all"
                  ? "bg-orange-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tất cả ({followedStories.length})
            </button>
            <button
              onClick={() => setTypeFilter(0)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                typeFilter === 0
                  ? "bg-orange-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Truyện chữ
            </button>
            <button
              onClick={() => setTypeFilter(1)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                typeFilter === 1
                  ? "bg-orange-600 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Truyện tranh
            </button>

            <div className="w-px h-4 bg-slate-200 mx-1 hidden sm:block" />

            <button
              onClick={() => setStatusFilter("all")}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === "all"
                  ? "bg-slate-800 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tất cả trạng thái
            </button>
            <button
              onClick={() => setStatusFilter(0)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 0
                  ? "bg-slate-800 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Đang ra
            </button>
            <button
              onClick={() => setStatusFilter(1)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === 1
                  ? "bg-slate-800 text-white shadow-2xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Hoàn thành
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">
              Hiển thị: <strong>{filteredStories.length}</strong> tác phẩm
            </span>
          </div>
        </div>
      </div>

      {/* 3. Lưới Truyện Theo Dõi */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-white border border-slate-200 rounded-2xl p-3 space-y-3">
              <div className="aspect-[2/3] bg-slate-200 rounded-xl" />
              <div className="h-4 bg-slate-200 rounded-md w-3/4" />
              <div className="h-3 bg-slate-200 rounded-md w-1/2" />
            </div>
          ))}
        </div>
      ) : filteredStories.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredStories.map((story) => (
            <div
              key={story.id}
              className="bg-white border border-slate-200 hover:border-orange-400 rounded-2xl p-3 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                {/* Ảnh bìa */}
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-slate-100 mb-2.5">
                  <Link to={`/stories/${story.id}`}>
                    <img
                      src={story.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"}
                      alt={story.title}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />
                  </Link>

                  {/* Badge Hình thức */}
                  <div className="absolute top-2 left-2 z-10">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-xs ${
                        story.type === 1 ? "bg-sky-500" : "bg-emerald-500"
                      }`}
                    >
                      {story.type === 1 ? "Truyện tranh" : "Truyện chữ"}
                    </span>
                  </div>

                  {/* Nút Bỏ theo dõi nhanh góc trên */}
                  <button
                    onClick={() => {
                      if (window.confirm(`Bạn có chắc muốn bỏ theo dõi "${story.title}" không?`)) {
                        unfollowMutation.mutate(story.id);
                      }
                    }}
                    disabled={unfollowingId === story.id}
                    className="absolute top-2 right-2 z-10 w-7 h-7 rounded-lg bg-black/50 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer backdrop-blur-xs"
                    title="Bỏ theo dõi truyện này"
                  >
                    {unfollowingId === story.id ? (
                      <i className="fa-solid fa-spinner fa-spin text-xs" />
                    ) : (
                      <i className="fa-solid fa-heart-crack text-xs" />
                    )}
                  </button>

                  {/* Lượt xem */}
                  <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-black/70 to-transparent flex items-end justify-between px-2.5 py-1.5 text-white text-[11px] font-medium">
                    <span className="flex items-center gap-1">
                      <i className="fa-solid fa-eye text-amber-300 text-[10px]" />
                      <span>{story.viewCount ?? 0}</span>
                    </span>
                    <span className="text-[10px] text-white/80">
                      {story.status === 1 ? "Hoàn thành" : "Đang ra"}
                    </span>
                  </div>
                </div>

                {/* Tiêu đề & tác giả */}
                <Link to={`/stories/${story.id}`}>
                  <h3
                    className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors text-xs sm:text-sm line-clamp-2 leading-snug"
                    title={story.title}
                  >
                    {story.title}
                  </h3>
                </Link>
                <p className="text-[11px] text-slate-500 truncate mt-1">
                  {story.author || "Đang cập nhật"}
                </p>
              </div>

              {/* Nút hành động */}
              <div className="pt-3 mt-2 border-t border-slate-100 flex items-center gap-2">
                <Link
                  to={`/stories/${story.id}`}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white text-xs font-semibold text-center transition-colors shadow-2xs"
                >
                  Đọc ngay
                </Link>
                <button
                  onClick={() => {
                    if (window.confirm(`Bạn có chắc muốn bỏ theo dõi "${story.title}" không?`)) {
                      unfollowMutation.mutate(story.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="Bỏ theo dõi"
                >
                  <i className="fa-regular fa-trash-can text-xs" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Trạng thái chưa có truyện theo dõi */
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs max-w-xl mx-auto space-y-4">
          <div className="w-20 h-20 rounded-full bg-orange-100 text-orange-600 border border-orange-200 flex items-center justify-center mx-auto text-3xl shadow-sm">
            <i className="fa-regular fa-bookmark" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-serif">
            {keyword ? "Không tìm thấy truyện theo dõi phù hợp" : "Chưa có truyện nào trong danh sách theo dõi"}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
            {keyword
              ? "Hãy thử tìm kiếm với từ khóa khác hoặc xóa bộ lọc."
              : "Nhấn nút 'Theo Dõi' ở bất kỳ bộ truyện nào bạn yêu thích để dễ dàng đón đọc các chương mới nhất tại đây!"}
          </p>
          <div className="pt-2 flex justify-center gap-3">
            {keyword ? (
              <button
                onClick={() => setKeyword("")}
                className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
              >
                Xóa tìm kiếm
              </button>
            ) : (
              <Link
                to="/"
                className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
              >
                Khám phá truyện ngay
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
