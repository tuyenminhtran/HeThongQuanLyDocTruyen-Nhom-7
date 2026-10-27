import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { searchStories, type StoryListItem } from "../api/stories";
import { getGenres } from "../api/genres";
import StoryCard from "../components/StoryCard";
import { resolveImageUrl } from "../utils/imageUrl";

function LeaderboardItem({ story, rank }: { story: StoryListItem; rank: number }) {
  const formattedRank = rank < 10 ? `0${rank}` : `${rank}`;
  return (
    <Link
      to={`/stories/${story.id}`}
      className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors group"
    >
      <span
        className={`w-7 text-center font-bold text-base font-serif shrink-0 ${
          rank === 1
            ? "text-orange-600 text-lg"
            : rank === 2
            ? "text-slate-400 font-bold"
            : rank === 3
            ? "text-amber-600 font-bold"
            : "text-slate-400 font-normal"
        }`}
      >
        {formattedRank}
      </span>
      <img
        src={resolveImageUrl(story.coverImageUrl)}
        alt={story.title}
        onError={(e) => {
          e.currentTarget.onerror = null;
          e.currentTarget.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80";
        }}
        className="w-10 h-13 object-cover rounded-lg shrink-0 border border-slate-200"
      />
      <div className="flex-1 min-w-0">
        <h4 className="text-xs sm:text-sm font-bold text-slate-800 truncate group-hover:text-orange-600 transition-colors">
          {story.title}
        </h4>
        <p className="text-xs text-slate-500 mt-0.5 flex items-center justify-between">
          <span>{story.latestChapterNumber && story.latestChapterNumber > 0 ? "Chương " + story.latestChapterNumber : story.totalChapters && story.totalChapters > 0 ? "Chương " + story.totalChapters : "Chương Mới"}</span>
          <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
            <i className="fa-solid fa-eye text-orange-500 text-[10px]" />
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
  const genreParam = searchParams.get("genre") || "all";

  const [genreFilter, setGenreFilter] = useState<string>(genreParam);
  const [statusFilter, setStatusFilter] = useState<number | "all">("all");
  const [accessFilter, setAccessFilter] = useState<number | "all">("all");
  const [typeFilter, setTypeFilter] = useState<number | "all">("all");
  const [pageSize, setPageSize] = useState<number>(50);

  const pageParam = parseInt(searchParams.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState<number>(isNaN(pageParam) || pageParam < 1 ? 1 : pageParam);

  useEffect(() => {
    setGenreFilter(genreParam);
  }, [genreParam]);

  useEffect(() => {
    const p = parseInt(searchParams.get("page") || "1", 10);
    const validP = isNaN(p) || p < 1 ? 1 : p;
    if (validP !== currentPage) {
      setCurrentPage(validP);
    }
  }, [searchParams]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    if (newPage === 1) {
      searchParams.delete("page");
    } else {
      searchParams.set("page", String(newPage));
    }
    setSearchParams(searchParams);
    const target = document.getElementById("story-grid-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleGenreChange = (newGenre: string) => {
    setGenreFilter(newGenre);
    if (newGenre === "all") {
      searchParams.delete("genre");
    } else {
      searchParams.set("genre", newGenre);
    }
    searchParams.delete("page");
    setCurrentPage(1);
    setSearchParams(searchParams);
  };

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

  // Top 6 truyện đề cử (lấy theo lượt đọc cao nhất)
  const recommendedStories = stories
    ? [...stories].sort((a, b) => b.viewCount - a.viewCount).slice(0, 6)
    : [];

  // Derived data for sidebar leaderboard
  const topViewedStories = stories
    ? [...stories].sort((a, b) => b.viewCount - a.viewCount).slice(0, 10)
    : [];

  const handleClearSearch = () => {
    searchParams.delete("q");
    searchParams.delete("genre");
    searchParams.delete("page");
    setSearchParams(searchParams);
    setGenreFilter("all");
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredStories.length / pageSize) || 1;
  const safePage = Math.min(Math.max(1, currentPage), totalPages);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, filteredStories.length);
  const displayedStories = filteredStories.slice(startIndex, endIndex);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-5 space-y-6">
      
      {/* ========================================================= */}
      {/* 1. THÔNG BÁO CHÀO MỪNG & MẠNG XÃ HỘI (TRUYENQQ BANNER)   */}
      {/* ========================================================= */}
      <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-sky-950 shadow-xs">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center shrink-0">
            <i className="fa-solid fa-bullhorn text-[11px]" />
          </span>
          <span>
            <strong>Thông báo:</strong> Chào mừng bạn đến với <strong>StoryReader</strong> - Hệ thống đọc truyện trực tuyến số 1 cho độc giả Việt!
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2.5 py-1 rounded-md bg-blue-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer">
            <i className="fa-brands fa-facebook" /> Facebook
          </span>
          <span className="px-2.5 py-1 rounded-md bg-sky-500 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-sky-600 transition-colors shadow-2xs cursor-pointer">
            <i className="fa-brands fa-telegram" /> Telegram
          </span>
          <span className="px-2.5 py-1 rounded-md bg-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-indigo-700 transition-colors shadow-2xs cursor-pointer">
            <i className="fa-brands fa-discord" /> Discord
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. THÔNG BÁO TÌM KIẾM HOẶC LỌC THỂ LOẠI                    */}
      {/* ========================================================= */}
      {(keyword || genreFilter !== "all") && (
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-xl px-5 py-3 shadow-xs">
          <div className="flex items-center gap-2.5 text-sm">
            <i className={`fa-solid ${keyword ? "fa-magnifying-glass" : "fa-filter"} text-orange-500`} />
            <span className="text-slate-600">
              {keyword ? "Kết quả tìm kiếm cho:" : "Đang lọc theo thể loại:"}
            </span>
            <strong className="text-slate-900 font-bold bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
              {keyword ? `"${keyword}"` : genres?.find((g) => g.id === genreFilter)?.name || genreFilter}
            </strong>
          </div>
          <button
            onClick={handleClearSearch}
            className="text-xs font-medium text-slate-500 hover:text-rose-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark" />
            <span>Xóa bộ lọc</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PHẦN "★ TRUYỆN HAY" (CHUẨN BỐ CỤC TRUYENQQ)           */}
      {/* ========================================================= */}
      {!keyword && genreFilter === "all" && (
        <section className="space-y-3">
          <div className="flex items-center justify-between pb-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
              <i className="fa-solid fa-star text-rose-500 text-base" />
              <span className="text-rose-600 font-serif">Truyện Hay</span>
            </h2>
          </div>

          {/* Hàng 6 Card Truyện Đề Cử Trắng Tinh Tế */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5">
            {recommendedStories.map((story, idx) => (
              <Link
                key={story.id}
                to={`/stories/${story.id}`}
                className="group block"
              >
                {/* Ảnh bìa */}
                <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-slate-100 border border-slate-200 group-hover:border-orange-400 shadow-xs group-hover:shadow-md transition-all duration-300">
                  <img
                    src={resolveImageUrl(story.coverImageUrl)}
                    alt={story.title}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Badge thời gian / HOT (Góc trên bên trái) */}
                  <div className="absolute top-2 left-2 z-10">
                    {idx < 2 ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-600 text-white shadow-xs">
                        HOT
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-500 text-white shadow-xs">
                        Mới
                      </span>
                    )}
                  </div>

                  {/* Icon Bookmark (Góc trên bên phải như TruyenQQ) */}
                  <div className="absolute top-2 right-2 z-10">
                    <span className="w-6 h-6 rounded-md bg-black/40 text-white text-xs flex items-center justify-center hover:bg-orange-500 transition-colors backdrop-blur-xs">
                      <i className="fa-regular fa-bookmark text-[11px]" />
                    </span>
                  </div>

                  {/* Phí VIP nếu có */}
                  {story.accessPolicy > 0 && (
                    <div className="absolute bottom-2 left-2 z-10">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-400 text-slate-950 shadow-xs">
                        {story.accessPolicy === 2 ? "VIP" : "PRO"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tiêu đề truyện nằm bên dưới ảnh (Cực kỳ rõ nét, không bị chìm) */}
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-1 mt-2 text-center">
                  {story.title}
                </h3>
                <p className="text-[11px] text-slate-500 text-center mt-0.5">
                  {story.latestChapterNumber && story.latestChapterNumber > 0 ? "Chương " + story.latestChapterNumber : story.totalChapters && story.totalChapters > 0 ? "Chương " + story.totalChapters : "Mới cập nhật"}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 4. THANH BỘ LỌC (TRẮNG TINH, GỌN GÀNG, ĐẦY ĐỦ DROPDOWNS) */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Pills chọn Hình thức */}
        <div className="inline-flex items-center bg-slate-100 rounded-lg p-1 shrink-0">
          <button
            onClick={() => {
              setTypeFilter("all");
              handlePageChange(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === "all"
                ? "bg-orange-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => {
              setTypeFilter(0);
              handlePageChange(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === 0
                ? "bg-orange-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Truyện chữ
          </button>
          <button
            onClick={() => {
              setTypeFilter(1);
              handlePageChange(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
              typeFilter === 1
                ? "bg-orange-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Truyện tranh
          </button>
        </div>

        {/* Các Dropdowns lọc */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Thể loại */}
          <select
            value={genreFilter}
            onChange={(e) => handleGenreChange(e.target.value)}
            className="bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer shadow-2xs"
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
            onChange={(e) => {
              setStatusFilter(e.target.value === "all" ? "all" : Number(e.target.value));
              handlePageChange(1);
            }}
            className="bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer shadow-2xs"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value={0}>Đang phát hành</option>
            <option value={1}>Hoàn thành</option>
            <option value={2}>Tạm ngưng</option>
          </select>

          {/* Phí */}
          <select
            value={accessFilter}
            onChange={(e) => {
              setAccessFilter(e.target.value === "all" ? "all" : Number(e.target.value));
              handlePageChange(1);
            }}
            className="bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer shadow-2xs"
          >
            <option value="all">Tất cả mức phí</option>
            <option value={0}>Miễn phí</option>
            <option value={1}>Trả phí</option>
            <option value={2}>Hỗn hợp</option>
          </select>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. MAIN CONTENT: LƯỚI TRUYỆN + BẢNG XẾP HẠNG SIDEBAR      */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row gap-6">

        {/* Cột trái: Lưới truyện */}
        <div className="flex-1 min-w-0">
          <div id="story-grid-section" className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-2 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                {keyword
                  ? "Kết quả tìm kiếm"
                  : genreFilter !== "all"
                  ? `Thể loại: ${genres?.find((g) => g.id === genreFilter)?.name || ""}`
                  : "Truyện Mới Cập Nhật"}
              </h2>
              <span className="text-xs text-slate-600 bg-white border border-slate-200 rounded-full px-2.5 py-0.5 shadow-2xs">
                {filteredStories.length} tác phẩm
              </span>
            </div>

            {/* Bộ chọn số lượng hiển thị mỗi trang */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 self-end sm:self-auto">
              <span className="text-[11px] text-slate-400">Hiển thị:</span>
              {[24, 36, 50].map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    setPageSize(sz);
                    handlePageChange(1);
                  }}
                  className={`px-2 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    pageSize === sz
                      ? "bg-orange-600 text-white shadow-xs"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                  title={`${sz} truyện mỗi trang`}
                >
                  {sz}
                </button>
              ))}
              <span className="text-[11px] text-slate-400">/ trang</span>
            </div>
          </div>

          {/* Loading Skeleton */}
          {isLoading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[2/3] bg-slate-200 rounded-xl" />
                  <div className="mt-2.5 h-4 bg-slate-200 rounded-md w-3/4" />
                  <div className="mt-1.5 h-3 bg-slate-200 rounded-md w-1/2" />
                </div>
              ))}
            </div>
          )}

          {/* Không tìm thấy kết quả */}
          {!isLoading && filteredStories.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 bg-white border border-slate-200 rounded-2xl text-center shadow-xs">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                <i className="fa-solid fa-book-open text-2xl" />
              </div>
              <p className="text-slate-800 text-base font-bold">Không tìm thấy truyện phù hợp</p>
              <p className="text-slate-500 text-xs mt-1">Hãy thử chọn bộ lọc khác hoặc tìm kiếm với từ khóa khác</p>
            </div>
          )}

          {/* Lưới truyện hiển thị */}
          {!isLoading && filteredStories && filteredStories.length > 0 && (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-4 gap-y-6">
                {displayedStories.map((story) => (
                  <StoryCard key={story.id} story={story} />
                ))}
              </div>

              {/* Thanh Phân Trang (Pagination Navigation) */}
              {totalPages > 1 && (
                <div className="mt-8 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-500 text-center sm:text-left">
                    Hiển thị <strong>{startIndex + 1} - {endIndex}</strong> / <strong>{filteredStories.length}</strong> truyện (Trang <strong>{safePage}</strong>/{totalPages})
                  </div>

                  <div className="flex items-center gap-1 flex-wrap justify-center">
                    {/* Nút Về đầu */}
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={safePage === 1}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Trang đầu"
                    >
                      <i className="fa-solid fa-angles-left text-[10px]" />
                    </button>

                    {/* Nút Trước */}
                    <button
                      onClick={() => handlePageChange(safePage - 1)}
                      disabled={safePage === 1}
                      className="px-2.5 h-8 rounded-lg flex items-center justify-center gap-1 text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <i className="fa-solid fa-chevron-left text-[10px]" />
                      <span className="hidden sm:inline">Trước</span>
                    </button>

                    {/* Danh sách các số trang */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => p === 1 || p === totalPages || Math.abs(p - safePage) <= 1)
                      .map((p, idx, arr) => {
                        const prev = arr[idx - 1];
                        const showEllipsis = prev && p - prev > 1;
                        return (
                          <div key={p} className="flex items-center">
                            {showEllipsis && <span className="px-1 text-slate-400 text-xs">...</span>}
                            <button
                              onClick={() => handlePageChange(p)}
                              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                p === safePage
                                  ? "bg-orange-600 text-white shadow-xs"
                                  : "border border-slate-200 text-slate-700 hover:bg-slate-100"
                              }`}
                            >
                              {p}
                            </button>
                          </div>
                        );
                      })}

                    {/* Nút Sau */}
                    <button
                      onClick={() => handlePageChange(safePage + 1)}
                      disabled={safePage === totalPages}
                      className="px-2.5 h-8 rounded-lg flex items-center justify-center gap-1 text-xs font-medium border border-slate-200 text-slate-700 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    >
                      <span className="hidden sm:inline">Sau</span>
                      <i className="fa-solid fa-chevron-right text-[10px]" />
                    </button>

                    {/* Nút Về cuối */}
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={safePage === totalPages}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                      title="Trang cuối"
                    >
                      <i className="fa-solid fa-angles-right text-[10px]" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Cột phải: Bảng xếp hạng Sidebar */}
        <div className="w-full lg:w-[300px] shrink-0 space-y-5">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
            {/* Header Bảng Xếp Hạng */}
            <div className="flex border-b border-slate-200 pb-2.5 mb-3 text-xs font-bold text-slate-800 gap-4">
              <span className="text-orange-600 border-b-2 border-orange-600 pb-3 -mb-3 font-bold">Top Tháng</span>
              <span className="text-slate-500 hover:text-slate-900 cursor-pointer">Top Tuần</span>
              <span className="text-slate-500 hover:text-slate-900 cursor-pointer">Top Ngày</span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-slate-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : topViewedStories.length > 0 ? (
              <div className="flex flex-col gap-1">
                {topViewedStories.map((story, idx) => (
                  <LeaderboardItem key={story.id} story={story} rank={idx + 1} />
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 text-center py-4">Chưa có dữ liệu</p>
            )}
          </div>

          {/* Banner Đăng ký VIP Sidebar */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-5 text-center shadow-xs">
            <span className="inline-block p-2.5 rounded-full bg-amber-100 text-amber-600 text-base mb-2 shadow-2xs">
              <i className="fa-solid fa-crown" />
            </span>
            <h3 className="font-serif text-slate-900 font-bold text-base mb-1">Gói Hội Viên VIP</h3>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Đọc toàn bộ truyện trả phí không giới hạn chỉ từ 49.000đ/tháng
            </p>
            <Link
              to="/pricing"
              className="inline-block w-full py-2.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs transition-colors shadow-xs"
            >
              Nâng cấp VIP ngay
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
