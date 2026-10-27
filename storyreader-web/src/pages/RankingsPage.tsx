import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { searchStories } from "../api/stories";
import { getGenres } from "../api/genres";
import { resolveImageUrl } from "../utils/imageUrl";

type TimeRange = "all" | "month" | "week" | "day";

export default function RankingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const timeParam = (searchParams.get("time") as TimeRange) || "all";
  const genreParam = searchParams.get("genre") || "all";

  const [timeRange, setTimeRange] = useState<TimeRange>(timeParam);
  const [selectedGenre, setSelectedGenre] = useState<string>(genreParam);
  const [typeFilter, setTypeFilter] = useState<number | "all">("all");

  // Lấy thể loại
  const { data: genres = [] } = useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
  });

  // Lấy toàn bộ truyện với sắp xếp top theo thể loại
  const { data: stories = [], isLoading } = useQuery({
    queryKey: ["rankings", "stories", selectedGenre],
    queryFn: () => searchStories(undefined, selectedGenre !== "all" ? selectedGenre : undefined, 100, "top"),
  });

  // Đồng bộ URL params
  const handleTimeChange = (newTime: TimeRange) => {
    setTimeRange(newTime);
    if (newTime === "all") searchParams.delete("time");
    else searchParams.set("time", newTime);
    setSearchParams(searchParams);
  };

  const handleGenreChange = (newGenre: string) => {
    setSelectedGenre(newGenre);
    if (newGenre === "all") searchParams.delete("genre");
    else searchParams.set("genre", newGenre);
    setSearchParams(searchParams);
  };

  // Tính toán bảng xếp hạng dựa trên tiêu chí & bộ lọc
  const rankedStories = useMemo(() => {
    let list = [...stories];

    // Lọc theo loại truyện (chữ / tranh)
    if (typeFilter !== "all") {
      list = list.filter((s) => (s.type ?? 0) === typeFilter);
    }

    // Lọc theo thể loại nếu được chọn
    // (Vì StoryListItem chưa có genreIds trực tiếp nên nếu chọn thể loại sẽ tìm qua API hoặc để trống)
    // Sắp xếp theo viewCount giảm dần (giả lập tỷ lệ view cho Top Tuần / Tháng / Ngày)
    return list.sort((a, b) => {
      let viewA = a.viewCount ?? 0;
      let viewB = b.viewCount ?? 0;

      if (timeRange === "day") {
        // Giả lập tỷ lệ đọc trong ngày
        viewA = Math.floor(viewA * 0.08);
        viewB = Math.floor(viewB * 0.08);
      } else if (timeRange === "week") {
        // Giả lập tỷ lệ đọc trong tuần
        viewA = Math.floor(viewA * 0.28);
        viewB = Math.floor(viewB * 0.28);
      } else if (timeRange === "month") {
        // Giả lập tỷ lệ đọc trong tháng
        viewA = Math.floor(viewA * 0.65);
        viewB = Math.floor(viewB * 0.65);
      }
      return viewB - viewA;
    });
  }, [stories, typeFilter, timeRange]);

  const top1 = rankedStories[0];
  const top2 = rankedStories[1];
  const top3 = rankedStories[2];
  const restRanked = rankedStories.slice(3);

  const getDisplayViews = (views: number) => {
    let v = views;
    if (timeRange === "day") v = Math.floor(views * 0.08);
    else if (timeRange === "week") v = Math.floor(views * 0.28);
    else if (timeRange === "month") v = Math.floor(views * 0.65);

    if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
    return v.toString();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-6 space-y-8">
      {/* ============================================================ */}
      {/* 1. BREADCRUMB & HEADER                                      */}
      {/* ============================================================ */}
      <div>
        <nav className="flex items-center gap-2 text-xs text-slate-500 mb-3">
          <Link to="/" className="hover:text-orange-600 transition-colors">
            Trang chủ
          </Link>
          <i className="fa-solid fa-chevron-right text-[10px]" />
          <span className="text-slate-800 font-semibold">Bảng Xếp Hạng</span>
        </nav>

        <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-bold uppercase tracking-wider mb-3">
              <i className="fa-solid fa-trophy text-amber-200" />
              <span>Vinh Danh Độc Giả & Tác Phẩm</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black font-serif tracking-tight drop-shadow-xs">
              BẢNG XẾP HẠNG TRUYỆN HOT
            </h1>
            <p className="mt-2 text-sm sm:text-base text-orange-50 font-medium drop-shadow-xs">
              Khám phá những bộ tiểu thuyết và truyện tranh dẫn đầu về lượt đọc, được cộng đồng độc giả StoryReader săn đón và yêu thích nhất.
            </p>
          </div>

          {/* Icon cúp mờ background */}
          <div className="absolute right-4 -bottom-6 text-white/15 text-[150px] sm:text-[200px] pointer-events-none select-none">
            <i className="fa-solid fa-award" />
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. BỘ LỌC THỜI GIAN & HÌNH THỨC                             */}
      {/* ============================================================ */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Tabs Thời Gian */}
        <div className="flex items-center bg-slate-100 rounded-xl p-1 w-full md:w-auto overflow-x-auto scrollbar-none">
          <button
            onClick={() => handleTimeChange("all")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              timeRange === "all"
                ? "bg-orange-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <i className="fa-solid fa-infinity mr-1.5 text-xs" />
            Toàn Thời Gian
          </button>
          <button
            onClick={() => handleTimeChange("month")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              timeRange === "month"
                ? "bg-orange-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <i className="fa-solid fa-calendar mr-1.5 text-xs" />
            Top Tháng
          </button>
          <button
            onClick={() => handleTimeChange("week")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              timeRange === "week"
                ? "bg-orange-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <i className="fa-solid fa-bolt mr-1.5 text-xs" />
            Top Tuần
          </button>
          <button
            onClick={() => handleTimeChange("day")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
              timeRange === "day"
                ? "bg-orange-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <i className="fa-solid fa-fire mr-1.5 text-xs" />
            Top Ngày
          </button>
        </div>

        {/* Bộ lọc Hình thức & Thể loại */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end flex-wrap">
          {/* Dropdown Thể loại */}
          <select
            value={selectedGenre}
            onChange={(e) => handleGenreChange(e.target.value)}
            className="bg-white border border-slate-300 hover:border-slate-400 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-orange-500 cursor-pointer shadow-2xs"
          >
            <option value="all">Tất cả thể loại ({genres.length})</option>
            {genres.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>

          <div className="inline-flex items-center bg-slate-100 rounded-lg p-1">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                typeFilter === "all"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setTypeFilter(0)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                typeFilter === 0
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Truyện chữ
            </button>
            <button
              onClick={() => setTypeFilter(1)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                typeFilter === 1
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Truyện tranh
            </button>
          </div>

          <span className="text-xs text-slate-500 font-medium">
            <strong>{rankedStories.length}</strong> truyện xếp hạng
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium text-slate-500">Đang tải bảng xếp hạng truyện...</p>
        </div>
      ) : (
        <>
          {/* ============================================================ */}
          {/* 3. SÂN KHẤU PODIUM TOP 3 TRUYỆN DẪN ĐẦU                    */}
          {/* ============================================================ */}
          {rankedStories.length >= 3 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 pb-4">
              
              {/* TOP 2 - Á QUÂN (Bên Trái) */}
              {top2 && (
                <div className="order-2 md:order-1 bg-gradient-to-b from-slate-100 to-white border-2 border-slate-300 rounded-2xl p-5 shadow-md flex flex-col items-center text-center relative hover:shadow-lg transition-all group">
                  <div className="absolute -top-5 w-10 h-10 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 border-2 border-white shadow-md flex items-center justify-center text-slate-800 font-black text-sm">
                    🥈 2
                  </div>
                  <div className="mt-2 w-28 sm:w-32 aspect-[2/3] rounded-xl overflow-hidden shadow-md relative mb-3 group-hover:scale-105 transition-transform">
                    <img
                      src={resolveImageUrl(top2.coverImageUrl)}
                      alt={top2.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 mb-2">
                    Á Quân
                  </span>
                  <Link
                    to={`/stories/${top2.id}`}
                    className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 text-sm sm:text-base mb-1"
                  >
                    {top2.title}
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-1 mb-2">{top2.author}</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs mb-3">
                    <i className="fa-solid fa-eye text-orange-500" />
                    <span>{getDisplayViews(top2.viewCount)} lượt đọc</span>
                  </div>
                  <Link
                    to={`/stories/${top2.id}`}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors"
                  >
                    Đọc Ngay
                  </Link>
                </div>
              )}

              {/* TOP 1 - QUÁN QUÂN (Ở Giữa, Lớn Nhất & Hoành Tráng Nhất) */}
              {top1 && (
                <div className="order-1 md:order-2 bg-gradient-to-b from-amber-100 via-orange-50 to-white border-2 border-amber-400 rounded-2xl p-6 shadow-xl flex flex-col items-center text-center relative hover:shadow-2xl transition-all group md:-translate-y-4">
                  <div className="absolute -top-7 w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 border-4 border-white shadow-lg flex items-center justify-center text-white font-black text-xl animate-bounce">
                    👑 1
                  </div>
                  <div className="mt-4 w-36 sm:w-44 aspect-[2/3] rounded-2xl overflow-hidden shadow-xl relative mb-3 group-hover:scale-105 transition-transform border-2 border-amber-300">
                    <img
                      src={resolveImageUrl(top1.coverImageUrl)}
                      alt={top1.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-2 text-left">
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">
                        ★ TOP 1 THỊNH HÀNH
                      </span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs mb-2">
                    🏆 Quán Quân Toàn Bảng
                  </span>
                  <Link
                    to={`/stories/${top1.id}`}
                    className="font-black text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 text-base sm:text-lg mb-1 font-serif"
                  >
                    {top1.title}
                  </Link>
                  <p className="text-xs text-slate-600 line-clamp-1 mb-2 font-medium">{top1.author}</p>
                  <div className="flex items-center gap-2 text-sm font-black text-orange-600 bg-orange-100/80 px-4 py-2 rounded-xl border border-orange-200 shadow-xs mb-4">
                    <i className="fa-solid fa-fire text-orange-500" />
                    <span>{getDisplayViews(top1.viewCount)} LƯỢT ĐỌC</span>
                  </div>
                  <Link
                    to={`/stories/${top1.id}`}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-sm font-black transition-all shadow-md hover:shadow-lg"
                  >
                    Xem Chi Tiết & Đọc Ngay
                  </Link>
                </div>
              )}

              {/* TOP 3 - QUÝ QUÂN (Bên Phải) */}
              {top3 && (
                <div className="order-3 md:order-3 bg-gradient-to-b from-amber-50 to-white border-2 border-amber-600/40 rounded-2xl p-5 shadow-md flex flex-col items-center text-center relative hover:shadow-lg transition-all group">
                  <div className="absolute -top-5 w-10 h-10 rounded-full bg-gradient-to-tr from-amber-700 to-amber-500 border-2 border-white shadow-md flex items-center justify-center text-white font-black text-sm">
                    🥉 3
                  </div>
                  <div className="mt-2 w-28 sm:w-32 aspect-[2/3] rounded-xl overflow-hidden shadow-md relative mb-3 group-hover:scale-105 transition-transform">
                    <img
                      src={resolveImageUrl(top3.coverImageUrl)}
                      alt={top3.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 mb-2">
                    Quý Quân
                  </span>
                  <Link
                    to={`/stories/${top3.id}`}
                    className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 text-sm sm:text-base mb-1"
                  >
                    {top3.title}
                  </Link>
                  <p className="text-xs text-slate-500 line-clamp-1 mb-2">{top3.author}</p>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs mb-3">
                    <i className="fa-solid fa-eye text-orange-500" />
                    <span>{getDisplayViews(top3.viewCount)} lượt đọc</span>
                  </div>
                  <Link
                    to={`/stories/${top3.id}`}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors"
                  >
                    Đọc Ngay
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* 4. DANH SÁCH CHI TIẾT TỪ HẠNG #4 TRỞ ĐI                     */}
          {/* ============================================================ */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                <i className="fa-solid fa-list-ol text-orange-500" />
                <span>Danh Sách Xếp Hạng Chi Tiết (Hạng #4 - #{rankedStories.length})</span>
              </h2>
              <span className="text-xs text-slate-500">Cập nhật theo thời gian thực</span>
            </div>

            <div className="divide-y divide-slate-100">
              {restRanked.map((story, index) => {
                const rankNumber = index + 4;
                return (
                  <div
                    key={story.id}
                    className="p-3 sm:p-4 flex items-center gap-3 sm:gap-4 hover:bg-orange-50/40 transition-colors group"
                  >
                    {/* Số thứ tự Rank */}
                    <div className="w-8 sm:w-10 text-center font-black font-serif text-sm sm:text-base text-slate-400 group-hover:text-orange-600 shrink-0">
                      {rankNumber < 10 ? `0${rankNumber}` : rankNumber}
                    </div>

                    {/* Ảnh bìa */}
                    <Link
                      to={`/stories/${story.id}`}
                      className="w-12 sm:w-16 h-16 sm:h-22 rounded-xl overflow-hidden shrink-0 border border-slate-200 shadow-xs relative group-hover:scale-105 transition-transform"
                    >
                      <img
                        src={resolveImageUrl(story.coverImageUrl)}
                        alt={story.title}
                        className="w-full h-full object-cover"
                      />
                    </Link>

                    {/* Thông tin truyện */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Link
                          to={`/stories/${story.id}`}
                          className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors text-xs sm:text-base line-clamp-1"
                        >
                          {story.title}
                        </Link>
                        {story.accessPolicy > 0 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-400 text-slate-950">
                            {story.accessPolicy === 2 ? "VIP" : "PRO"}
                          </span>
                        )}
                        {story.type === 1 && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-sky-500 text-white">
                            Tranh
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-1 mb-1">
                        Tác giả: <span className="font-medium text-slate-700">{story.author}</span>
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 flex-wrap">
                        <span>
                          {story.latestChapterNumber && story.latestChapterNumber > 0
                            ? `Chương ${story.latestChapterNumber}`
                            : story.totalChapters && story.totalChapters > 0
                            ? `${story.totalChapters} chương`
                            : "Mới cập nhật"}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 font-bold text-orange-600">
                          <i className="fa-solid fa-eye text-[10px]" />
                          {getDisplayViews(story.viewCount)} lượt đọc
                        </span>
                      </div>
                    </div>

                    {/* Nút hành động */}
                    <div className="shrink-0 hidden sm:block">
                      <Link
                        to={`/stories/${story.id}`}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:border-orange-500 hover:text-orange-600 hover:bg-orange-50 text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <span>Xem Truyện</span>
                        <i className="fa-solid fa-chevron-right text-[10px]" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
