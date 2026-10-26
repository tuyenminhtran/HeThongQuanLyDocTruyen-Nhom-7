import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchStories, type StoryListItem } from "../api/stories";
import { getGenres } from "../api/genres";
import StoryCard from "../components/StoryCard";

function LeaderboardItem({ story, rank }: { story: StoryListItem; rank: number }) {
  const formattedRank = rank < 10 ? `0${rank}` : `${rank}`;
  return (
    <Link
      to={`/stories/${story.id}`}
      className="flex items-center gap-3 p-2 rounded-xl hover:bg-ink-elevated/70 transition-colors group"
    >
      <span
        className={`w-7 text-center font-bold text-base font-serif shrink-0 ${
          rank === 1
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
  const [searchParams, setSearchParams] = useSearchParams();
  const keyword = searchParams.get("q") || "";

  const [genreFilter, setGenreFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<number | "all">("all");
  const [accessFilter, setAccessFilter] = useState<number | "all">("all");
  const [typeFilter, setTypeFilter] = useState<number | "all">("all");
  const [visibleCount, setVisibleCount] = useState(12);

  // Lấy danh sách thể loại từ backend
  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
  });

  const { data: stories, isLoading } = useQuery({
    queryKey: ["stories", keyword, genreFilter],
    queryFn: () => searchStories(keyword || undefined, genreFilter !== "all" ? genreFilter : undefined),
  });

  const filteredStories = stories
    ? stories.filter((story) => {
        if (statusFilter !== "all" && story.status !== statusFilter) return false;
        if (accessFilter !== "all" && story.accessPolicy !== accessFilter) return false;
        if (typeFilter !== "all" && (story.type ?? 0) !== typeFilter) return false;
        return true;
      })
    : [];

  // Top 5 truyện đề cử (lấy theo lượt đọc cao nhất)
  const recommendedStories = stories
    ? [...stories].sort((a, b) => b.viewCount - a.viewCount).slice(0, 5)
    : [];

  // Derived data for sidebar leaderboard
  const topViewedStories = stories
    ? [...stories].sort((a, b) => b.viewCount - a.viewCount).slice(0, 10)
    : [];

  const handleClearSearch = () => {
    searchParams.delete("q");
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-8">
      
      {/* ========================================================= */}
      {/* THÔNG BÁO TÌM KIẾM (NẾU CÓ TỪ KHÓA TỪ HEADER)            */}
      {/* ========================================================= */}
      {keyword && (
        <div className="flex items-center justify-between bg-ink-card border border-ink-border rounded-2xl px-5 py-3 shadow-sm">
          <div className="flex items-center gap-2.5 text-sm">
            <i className="fa-solid fa-magnifying-glass text-gold" />
            <span className="text-ink-muted">Kết quả tìm kiếm cho từ khóa:</span>
            <strong className="text-white font-medium bg-ink-elevated px-2.5 py-0.5 rounded-lg border border-ink-border">
              "{keyword}"
            </strong>
          </div>
          <button
            onClick={handleClearSearch}
            className="text-xs font-medium text-ink-muted hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-ink-elevated transition-colors"
          >
            <i className="fa-solid fa-xmark" />
            <span>Xóa tìm kiếm</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* PHẦN TRUYỆN ĐỀ CỬ (ĐẶT LÊN ĐẦU TRANG, KHÔNG BỊ CHIA CẮT) */}
      {/* ========================================================= */}
      {!keyword && genreFilter === "all" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-ink-border/80 pb-2">
            <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <span className="text-gold">Truyện đề cử</span>
              <i className="fa-solid fa-fire text-amber-500 text-sm" />
            </h2>
          </div>

          {/* Hàng 5 Card Truyện Đề Cử */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
            {recommendedStories.map((story, idx) => (
              <Link
                key={story.id}
                to={`/stories/${story.id}`}
                className="group relative overflow-hidden rounded-xl border border-ink-border bg-ink-card shadow-sm hover:shadow-xl hover:border-gold/70 transition-all duration-300"
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

                {/* Badge HOT / TOP */}
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

                {/* Badge VIP / Trả phí */}
                {story.accessPolicy > 0 && (
                  <div className="absolute top-2 right-2 z-10">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-yellow-500 text-black shadow-md">
                      {story.accessPolicy === 2 ? "VIP" : "PRO"}
                    </span>
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent flex flex-col justify-end p-2.5">
                  <h3 className="text-[13px] font-bold text-white group-hover:text-gold transition-colors line-clamp-2 leading-snug drop-shadow-sm">
                    {story.title}
                  </h3>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-gray-300 font-medium">
                    <span className="bg-black/60 px-1.5 py-0.5 rounded text-gold border border-gold/30 text-[10px]">
                      {story.type === 1 ? "Truyện tranh" : "Truyện chữ"}
                    </span>
                    <span className="text-[10px] text-gray-400 italic">
                      {idx % 2 === 0 ? "Mới cập nhật" : "Đọc nhiều"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* THANH BỘ LỌC TINH GỌN (PILLS & DROPDOWNS HIỆN ĐẠI)       */}
      {/* ========================================================= */}
      <div className="bg-ink-card border border-ink-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Pills chọn Hình thức */}
        <div className="inline-flex items-center bg-ink-bg border border-ink-border rounded-xl p-1 shrink-0">
          <button
            onClick={() => setTypeFilter("all")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              typeFilter === "all"
                ? "bg-gold text-slate-950 font-bold shadow-sm"
                : "text-ink-muted hover:text-white"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setTypeFilter(0)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              typeFilter === 0
                ? "bg-gold text-slate-950 font-bold shadow-sm"
                : "text-ink-muted hover:text-white"
            }`}
          >
            Truyện chữ
          </button>
          <button
            onClick={() => setTypeFilter(1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              typeFilter === 1
                ? "bg-gold text-slate-950 font-bold shadow-sm"
                : "text-ink-muted hover:text-white"
            }`}
          >
            Truyện tranh
          </button>
        </div>

        {/* Các Dropdowns lọc */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Thể loại */}
          <select
            value={genreFilter}
            onChange={(e) => setGenreFilter(e.target.value)}
            className="bg-ink-bg border border-ink-border hover:border-ink-border-hover rounded-xl px-3 py-1.5 text-xs text-ink-text focus:outline-none focus:border-gold cursor-pointer"
          >
            <option value="all">Tất cả thể loại</option>
            {genres?.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          {/* Trạng thái */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="bg-ink-bg border border-ink-border hover:border-ink-border-hover rounded-xl px-3 py-1.5 text-xs text-ink-text focus:outline-none focus:border-gold cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value={0}>Đang phát hành</option>
            <option value={1}>Hoàn thành</option>
            <option value={2}>Tạm ngưng</option>
          </select>

          {/* Phí */}
          <select
            value={accessFilter}
            onChange={(e) => setAccessFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
            className="bg-ink-bg border border-ink-border hover:border-ink-border-hover rounded-xl px-3 py-1.5 text-xs text-ink-text focus:outline-none focus:border-gold cursor-pointer"
          >
            <option value="all">Tất cả mức phí</option>
            <option value={0}>Miễn phí</option>
            <option value={1}>Trả phí</option>
            <option value={2}>Hỗn hợp</option>
          </select>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN CONTENT: LƯỚI TRUYỆN + BẢNG XẾP HẠNG SIDEBAR        */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row gap-8">

        {/* Lưới truyện bên trái */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-5 pb-2 border-b border-ink-border">
            <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
              <span>
                {keyword
                  ? "Danh sách kết quả tìm kiếm"
                  : genreFilter !== "all"
                  ? `Thể loại: ${genres?.find((g) => g.id === genreFilter)?.name || ""}`
                  : "Danh sách truyện"}
              </span>
            </h2>
            <span className="text-xs text-ink-muted bg-ink-card border border-ink-border rounded-full px-3 py-1">
              {filteredStories.length} tác phẩm
            </span>
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] bg-ink-card rounded-xl border border-ink-border" />
                  <div className="mt-2.5 h-4 bg-ink-card rounded-md w-3/4" />
                  <div className="mt-1.5 h-3 bg-ink-card rounded-md w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Không tìm thấy kết quả */}
          {!isLoading && filteredStories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-ink-card/50 border border-ink-border rounded-2xl text-center">
              <div className="w-16 h-16 rounded-full bg-ink-bg border border-ink-border flex items-center justify-center mb-4 text-ink-muted">
                <i className="fa-solid fa-book-open text-2xl opacity-50" />
              </div>
              <p className="text-white text-base font-serif font-semibold">Không tìm thấy truyện phù hợp</p>
              <p className="text-ink-muted text-xs mt-1">Hãy thử chọn bộ lọc khác hoặc tìm kiếm với từ khóa khác</p>
            </div>
          )}

          {/* Lưới truyện hiển thị */}
          {!isLoading && filteredStories && filteredStories.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-6">
                {filteredStories.slice(0, visibleCount).map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>

              {visibleCount < filteredStories.length && (
                <div className="mt-10 text-center">
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 12)}
                    className="px-8 py-2.5 rounded-xl font-medium border border-ink-border text-ink-text hover:border-gold hover:text-gold hover:bg-ink-card transition-all text-xs sm:text-sm shadow-sm"
                  >
                    Xem thêm truyện ({filteredStories.length - visibleCount} còn lại)
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Cột phải: Bảng xếp hạng (Sidebar) */}
        <div className="w-full lg:w-[300px] shrink-0 space-y-6">
          <div className="bg-ink-card border border-ink-border rounded-2xl p-4 shadow-sm">
            {/* Header Bảng Xếp Hạng */}
            <div className="flex border-b border-ink-border pb-3 mb-3 text-xs font-bold text-ink-text gap-4">
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
              <p className="text-xs text-ink-muted text-center py-4">Chưa có dữ liệu</p>
            )}
          </div>

          {/* Banner Đăng ký VIP Sidebar */}
          <div className="bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/30 rounded-2xl p-5 text-center relative overflow-hidden group shadow-sm">
            <div className="relative z-10">
              <span className="inline-block p-2 rounded-full bg-amber-500/20 text-amber-400 text-sm mb-2">
                <i className="fa-solid fa-crown" />
              </span>
              <h3 className="font-serif text-white font-bold text-base mb-1.5">Gói Hội Viên VIP</h3>
              <p className="text-xs text-ink-muted mb-4 leading-relaxed">
                Đọc toàn bộ truyện trả phí không giới hạn chỉ từ 49.000đ/tháng
              </p>
              <Link
                to="/pricing"
                className="inline-block w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-bold text-xs hover:brightness-110 transition-all shadow-md shadow-amber-500/20"
              >
                Nâng cấp VIP ngay
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
