import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router-dom";
import { searchStories, type StoryListItem } from "../api/stories";
import StoryCard from "../components/StoryCard";

function LeaderboardItem({ story, rank }: { story: StoryListItem; rank: number }) {
  const formattedRank = rank < 10 ? `0${rank}` : `${rank}`;
  return (
    <Link
      to={`/stories/${story.id}`}
      className="flex items-center gap-3 p-2 rounded-xl hover:bg-ink-bg/60 transition-colors group"
    >
      <span
        className={`w-7 text-center font-bold text-base font-serif shrink-0 ${rank === 1
            ? "text-gold text-lg"
            : rank === 2
              ? "text-slate-300"
              : rank === 3
                ? "text-amber-600"
                : "text-ink-muted"
          }`}
      >
        {formattedRank}
      </span>
      <img
        src={story.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"}
        alt={story.title}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80";
        }}
        className="w-10 h-13 object-cover rounded-lg shrink-0 border border-ink-border"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-ink-text truncate group-hover:text-gold transition-colors">
          {story.title}
        </h4>
        <p className="text-xs text-ink-muted mt-0.5 flex items-center justify-between">
          <span>Chương Mới</span>
          <span className="flex items-center gap-1.5">
            <i className="fa-solid fa-eye text-gold/80 text-xs" />
            <span>{(story.viewCount ?? 0) >= 1000 ? `${((story.viewCount ?? 0) / 1000).toFixed(0)}K` : (story.viewCount ?? 0)}</span>
          </span>
        </p>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | "all">("all");
  const [accessFilter, setAccessFilter] = useState<number | "all">("all");
  const [visibleCount, setVisibleCount] = useState(12);
  const [prevFilterKey, setPrevFilterKey] = useState(`${keyword}-${statusFilter}-${accessFilter}`);
  const currentFilterKey = `${keyword}-${statusFilter}-${accessFilter}`;
  if (prevFilterKey !== currentFilterKey) {
    setPrevFilterKey(currentFilterKey);
    setVisibleCount(12);
  }

  const { data: stories, isLoading } = useQuery({
    queryKey: ["stories", keyword],
    queryFn: () => searchStories(keyword || undefined),
  });

  const filteredStories = stories
    ? stories.filter(story => {
        if (statusFilter !== "all" && story.status !== statusFilter) return false;
        if (accessFilter !== "all" && story.accessPolicy !== accessFilter) return false;
        return true;
      })
    : [];

  // Top 5 truyện đề cử (lấy theo lượt đọc cao nhất)
  const recommendedStories = stories
    ? [...stories].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5)
    : [];

  // Derived data for sidebars
  const topViewedStories = stories
    ? [...stories].sort((a, b) => b.viewCount - a.viewCount).slice(0, 10)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-8">
      {/* ========================================================= */}
      {/* PHẦN TRUYỆN ĐỀ CỬ (GIỐNG GIAO DIỆN NETTRUYEN)           */}
      {/* ========================================================= */}
      {!keyword && (
        <section className="space-y-3">
          {/* Tiêu đề mục Truyện Đề Cử */}
          <div className="flex items-center justify-between border-b border-ink-border/80 pb-2">
            <h2 className="font-serif text-xl md:text-2xl font-bold text-gold flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
              <span>Truyện đề cử</span>
              <i className="fa-solid fa-angle-right text-lg text-gold" />
            </h2>
          </div>

          {/* Hàng 5 Card Truyện Đề Cử */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {recommendedStories.map((story, idx) => (
              <Link
                key={story.id}
                to={`/stories/${story.id}`}
                className="group relative overflow-hidden rounded-xl border border-ink-border bg-ink-card shadow-md hover:shadow-xl hover:border-gold/70 transition-all duration-300"
                style={{ aspectRatio: "3/4" }}
              >
                {/* Ảnh bìa */}
                <img
                  src={story.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"}
                  alt={story.title}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80";
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badge HOT góc trên trái */}
                <div className="absolute top-2 left-2 z-10">
                  {idx < 3 ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md">
                      HOT
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-black/75 text-gray-200 shadow-md border border-white/10">
                      TOP {idx + 1}
                    </span>
                  )}
                </div>

                {/* Badge VIP / Trả phí góc trên phải */}
                {story.accessPolicy > 0 && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-500 text-black shadow-md">
                      {story.accessPolicy === 2 ? "VIP" : "PRO"}
                    </span>
                  </div>
                )}

                {/* Lớp phủ tối mờ (Gradient Overlay) phía dưới ảnh */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent flex flex-col justify-end p-2.5">
                  <h3 className="text-[13px] font-bold text-white group-hover:text-gold transition-colors line-clamp-2 leading-snug drop-shadow-sm">
                    {story.title}
                  </h3>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-300 font-medium">
                    <span className="bg-black/60 px-1.5 py-0.5 rounded text-gold border border-gold/30">
                      Chapter {Math.floor(story.viewCount / 2000) || 120}
                    </span>
                    <span className="text-[10px] text-gray-400 italic">
                      {idx % 2 === 0 ? "1 ngày trước" : "3 ngày trước"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* THANH TÌM KIẾM VÀ BỘ LỌC (GIỮ NGUYÊN BẢN CŨ)             */}
      {/* ========================================================= */}
      <div className="bg-ink-card border border-ink-border rounded-2xl p-5 shadow-lg">
        <div className="relative max-w-2xl mx-auto mb-3">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold/80">
            <i className="fa-solid fa-magnifying-glass text-sm" />
          </span>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm truyện theo tên hoặc tác giả..."
            className="w-full bg-ink-bg border border-ink-border rounded-xl pl-12 pr-10 py-3 text-ink-text placeholder:text-ink-muted focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all text-sm font-medium"
          />
          {keyword && (
            <button
              onClick={() => setKeyword("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-white transition-colors"
            >
              <i className="fa-solid fa-xmark text-base" />
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-ink-muted">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="bg-ink-bg border border-ink-border rounded-lg px-3 py-1.5 text-ink-text focus:outline-none focus:border-gold"
            >
              <option value="all">Tất cả</option>
              <option value={0}>Đang phát hành</option>
              <option value={1}>Hoàn thành</option>
              <option value={2}>Tạm ngưng</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-ink-muted">Phân loại:</span>
            <select
              value={accessFilter}
              onChange={(e) => setAccessFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="bg-ink-bg border border-ink-border rounded-lg px-3 py-1.5 text-ink-text focus:outline-none focus:border-gold"
            >
              <option value="all">Tất cả</option>
              <option value={0}>Miễn phí</option>
              <option value={1}>Trả phí</option>
              <option value={2}>Mixed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Layout: Grid + Sidebar */}
      <div className="flex flex-col lg:flex-row gap-10">

        {/* Left Area: Stories Grid */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-ink-border">
            <h2 className="font-serif text-xl font-bold text-gold flex items-center gap-2">
              <span>{keyword ? "Kết quả tìm kiếm" : "StoryNest - Truyện gì cũng có!"}</span>
              <i className="fa-solid fa-angle-right text-base text-gold" />
            </h2>
            <span className="text-xs text-ink-muted bg-ink-card border border-ink-border rounded-full px-3 py-1">
              {filteredStories.length} kết quả
            </span>
          </div>

          {/* Loading skeleton */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-5 gap-y-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] bg-ink-card rounded-xl border border-ink-border" />
                  <div className="mt-2.5 h-4 bg-ink-card rounded-md w-3/4" />
                  <div className="mt-1.5 h-3 bg-ink-card rounded-md w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Khi không tìm thấy kết quả */}
          {!isLoading && filteredStories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-ink-card/30 border border-ink-border rounded-2xl text-center">
              <div className="w-20 h-20 rounded-full bg-ink-card border border-ink-border flex items-center justify-center mb-5">
                <i className="fa-solid fa-book-open text-3xl text-ink-muted/50" />
              </div>
              <p className="text-white text-lg font-serif font-semibold">Không tìm thấy truyện nào</p>
              <p className="text-ink-muted text-sm mt-1">Hãy thử đổi từ khóa tìm kiếm hoặc chọn bộ lọc khác</p>
            </div>
          )}

          {/* Story grid */}
          {!isLoading && filteredStories && filteredStories.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-5 gap-y-8">
                {filteredStories.slice(0, visibleCount).map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>

              {visibleCount < filteredStories.length && (
                <div className="mt-12 text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="px-8 py-3 rounded-xl font-medium border border-ink-border text-ink-text hover:border-gold hover:text-gold hover:bg-ink-card transition-all shadow-sm text-sm"
                  >
                    Tải thêm truyện ({filteredStories.length - visibleCount} còn lại)
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Cột phải: Bảng xếp hạng (Sidebar) */}
        <div className="w-full lg:w-[300px] shrink-0 space-y-6">
          <div className="bg-ink-card border border-ink-border rounded-2xl p-5 shadow-lg">
            {/* Header Bảng Xếp Hạng */}
            <div className="flex border-b border-ink-border pb-3 mb-4 text-sm font-bold text-ink-text gap-4">
              <span className="text-gold border-b-2 border-gold pb-3 -mb-3.5">Top Tháng</span>
              <span className="text-ink-muted hover:text-ink-text cursor-pointer">Top Tuần</span>
              <span className="text-ink-muted hover:text-ink-text cursor-pointer">Top Ngày</span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-ink-bg rounded-lg animate-pulse" />
                ))}
              </div>
            ) : topViewedStories.length > 0 ? (
              <div className="flex flex-col gap-1">
                {topViewedStories.map((story, idx) => (
                  <LeaderboardItem key={story.id} story={story} rank={idx + 1} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted text-center py-4">Chưa có dữ liệu</p>
            )}
          </div>

          {/* Banner Premium */}
          <div className="bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 rounded-2xl p-6 text-center relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="font-serif text-gold font-medium mb-2">Đăng ký Premium</h3>
              <p className="text-sm text-ink-text/80 mb-4">
                Đọc toàn bộ truyện trả phí không giới hạn chỉ với 49.000đ/tháng
              </p>
              <Link
                to="/pricing"
                className="inline-block w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-ink-bg font-bold text-sm hover:brightness-110 transition-all shadow-md shadow-amber-500/25"
              >
                Khám phá ngay
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
