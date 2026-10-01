import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { searchStories, type StoryListItem } from "../api/stories";
import StoryCard from "../components/StoryCard";

function LeaderboardItem({ story, rank }: { story: StoryListItem; rank: number }) {
  const isTop3 = rank <= 3;
  return (
    <Link
      to={`/stories/${story.id}`}
      className="flex items-center gap-3 p-2 rounded-lg hover:bg-ink-card/80 transition-colors group"
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold font-serif
          ${
            rank === 1
              ? "bg-yellow-500/20 text-yellow-500 border border-yellow-500/30"
              : rank === 2
              ? "bg-slate-300/20 text-slate-300 border border-slate-300/30"
              : rank === 3
              ? "bg-amber-600/20 text-amber-600 border border-amber-600/30"
              : "bg-ink-bg text-ink-muted border border-ink-border"
          }
        `}
      >
        {rank}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium text-ink-text truncate group-hover:text-gold transition-colors">
          {story.title}
        </h4>
        <p className="text-xs text-ink-muted mt-0.5 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {story.viewCount.toLocaleString()}
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

  useEffect(() => {
    setVisibleCount(12);
  }, [keyword, statusFilter, accessFilter]);

  const { data: stories, isLoading } = useQuery({
    queryKey: ["stories", keyword],
    queryFn: () => searchStories(keyword || undefined),
  });

  const filteredStories = stories?.filter(story => {
    if (statusFilter !== "all" && story.status !== statusFilter) return false;
    if (accessFilter !== "all" && story.accessPolicy !== accessFilter) return false;
    return true;
  });

  // Derived data for sidebars
  const topViewedStories = stories
    ? [...stories].sort((a, b) => b.viewCount - a.viewCount).slice(0, 10)
    : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
      {/* Search & Filter section - Full Width */}
      <div className="mb-10">
        <div className="relative max-w-3xl mx-auto mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </span>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm truyện theo tên hoặc tác giả..."
            className="w-full bg-ink-card border border-ink-border rounded-2xl pl-12 pr-4 py-3.5 text-ink-text placeholder:text-ink-muted/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 shadow-lg shadow-black/10 transition-all duration-200"
          />
          {keyword && (
            <button
              onClick={() => setKeyword("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-text transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center justify-center gap-4 max-w-3xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-muted">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="bg-ink-bg border border-ink-border rounded-xl px-3 py-1.5 text-sm text-ink-text focus:outline-none focus:border-gold"
            >
              <option value="all">Tất cả</option>
              <option value={0}>Đang phát hành</option>
              <option value={1}>Hoàn thành</option>
              <option value={2}>Tạm ngưng</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-ink-muted">Thu phí:</span>
            <select
              value={accessFilter}
              onChange={(e) => setAccessFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="bg-ink-bg border border-ink-border rounded-xl px-3 py-1.5 text-sm text-ink-text focus:outline-none focus:border-gold"
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
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-serif text-xl text-ink-text">
              {keyword ? "Kết quả tìm kiếm" : "Tất cả truyện"}
            </h2>
            <div className="flex-1 h-px bg-ink-border/50" />
            {filteredStories && (
              <span className="text-xs text-ink-muted bg-ink-card border border-ink-border rounded-full px-3 py-1">
                {filteredStories.length} {keyword ? "kết quả" : "truyện"}
              </span>
            )}
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

          {/* Empty state */}
          {!isLoading && filteredStories && filteredStories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-ink-card/30 border border-ink-border rounded-2xl">
              <div className="w-20 h-20 rounded-full bg-ink-card border border-ink-border flex items-center justify-center mb-5">
                <svg className="w-10 h-10 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <p className="text-ink-muted text-lg font-serif">Không tìm thấy truyện nào</p>
              <p className="text-ink-muted/60 text-sm mt-1">Hãy thử đổi từ khóa hoặc bộ lọc khác</p>
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
                    className="px-8 py-3 rounded-xl font-medium border border-ink-border text-ink-text hover:border-gold hover:text-gold hover:bg-ink-card transition-all shadow-sm"
                  >
                    Tải thêm truyện ({filteredStories.length - visibleCount} còn lại)
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Area: Sidebar Leaderboards */}
        <div className="w-full lg:w-[300px] shrink-0 space-y-8">
          
          {/* Top Views */}
          <div className="bg-ink-card border border-ink-border rounded-2xl p-5 shadow-lg shadow-black/10">
            <h3 className="font-serif text-lg text-ink-text mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1A3.75 3.75 0 0012 18z" />
              </svg>
              Đọc Nhiều Nhất
            </h3>
            
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

          {/* Promo / Banner (Optional) */}
          <div className="bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 rounded-2xl p-6 text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://placehold.co/300x200/262019/3A322A?text=Pattern')] opacity-10 mix-blend-overlay group-hover:scale-110 transition-transform duration-700" />
            <div className="relative z-10">
              <h3 className="font-serif text-gold font-medium mb-2">Đăng ký Premium</h3>
              <p className="text-sm text-ink-text/80 mb-4">
                Đọc toàn bộ truyện trả phí không giới hạn chỉ với 50.000đ/tháng
              </p>
              <Link
                to="/pricing"
                className="inline-block px-5 py-2 rounded-xl bg-gold text-ink-bg font-medium text-sm hover:bg-gold-dim transition-colors shadow-lg shadow-gold/20"
              >
                Xem chi tiết
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
