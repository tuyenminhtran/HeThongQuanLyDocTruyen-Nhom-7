import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReadingHistory } from "../api/users";
import { useAuthStore } from "../store/authStore";
import { Link, Navigate } from "react-router-dom";

export default function HistoryPage() {
  const { accessToken } = useAuthStore();
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState<number | "all">("all");

  const { data: historyStories = [], isLoading } = useQuery({
    queryKey: ["user-library", "history"],
    queryFn: getReadingHistory,
    enabled: !!accessToken,
  });

  const filteredStories = useMemo(() => {
    let result = [...historyStories];

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

    return result;
  }, [historyStories, keyword, typeFilter]);

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-6">
      {/* 1. Header Trang Lịch Sử */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-orange-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold text-orange-400">
              <i className="fa-solid fa-clock-rotate-left" />
              <span>Tiến Trình Đọc</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-black tracking-tight text-white">
              Lịch Sử Đọc Truyện
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-xl">
              Xem lại danh sách và tiếp tục thưởng thức những chương truyện bạn đang đọc dở dang.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl px-5 py-3 text-center sm:text-right shrink-0">
            <span className="text-xs uppercase tracking-wider text-slate-400 block font-medium">
              Đã đọc
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white font-mono">
              {historyStories.length}
            </span>
            <span className="text-xs text-slate-400 block">tác phẩm</span>
          </div>
        </div>
      </div>

      {/* 2. Bộ lọc & Tìm kiếm */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full sm:max-w-md">
          <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm theo tên truyện đã đọc..."
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

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              typeFilter === "all"
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Tất cả ({historyStories.length})
          </button>
          <button
            onClick={() => setTypeFilter(0)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              typeFilter === 0
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Truyện chữ
          </button>
          <button
            onClick={() => setTypeFilter(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              typeFilter === 1
                ? "bg-slate-900 text-white shadow-2xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Truyện tranh
          </button>
        </div>
      </div>

      {/* 3. Lưới Truyện Lịch Sử */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
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

                  <div className="absolute top-2 left-2 z-10">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold text-white shadow-xs ${
                        story.type === 1 ? "bg-sky-500" : "bg-emerald-500"
                      }`}
                    >
                      {story.type === 1 ? "Truyện tranh" : "Truyện chữ"}
                    </span>
                  </div>
                </div>

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

              <div className="pt-3 mt-2 border-t border-slate-100">
                <Link
                  to={`/stories/${story.id}`}
                  className="w-full block py-2 px-3 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold text-center transition-colors shadow-2xs"
                >
                  Đọc tiếp <i className="fa-solid fa-arrow-right text-[10px] ml-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center shadow-xs max-w-xl mx-auto space-y-4">
          <div className="w-20 h-20 rounded-full bg-slate-100 text-slate-500 border border-slate-200 flex items-center justify-center mx-auto text-3xl shadow-sm">
            <i className="fa-solid fa-clock-rotate-left" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 font-serif">
            {keyword ? "Không tìm thấy lịch sử phù hợp" : "Bạn chưa đọc truyện nào gần đây"}
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed max-w-md mx-auto">
            Khám phá kho truyện phong phú và chọn một tác phẩm yêu thích để bắt đầu thưởng thức nhé!
          </p>
          <div className="pt-2 flex justify-center">
            <Link
              to="/"
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors"
            >
              Khám phá truyện ngay
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
