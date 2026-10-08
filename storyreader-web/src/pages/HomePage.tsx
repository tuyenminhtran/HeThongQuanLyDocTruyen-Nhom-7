import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { searchStories, type StoryListItem } from "../api/stories";
import StoryCard from "../components/StoryCard";

function LeaderboardItem({ story, rank }: { story: StoryListItem; rank: number }) {
  const formattedRank = rank < 10 ? `0${rank}` : `${rank}`;
  const rankColors =
    rank === 1
      ? "bg-gradient-to-br from-amber-400 to-amber-600 text-black shadow-md shadow-amber-500/30"
      : rank === 2
      ? "bg-slate-300 text-slate-900"
      : rank === 3
      ? "bg-amber-700 text-amber-100"
      : "bg-ink-elevated text-ink-muted border border-ink-border";

  return (
    <Link
      to={`/stories/${story.id}`}
      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-ink-elevated/70 border border-transparent hover:border-ink-border transition-all duration-200 group"
    >
      <div
        className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${rankColors}`}
      >
        {formattedRank}
      </div>
      <div className="w-11 h-14 rounded-lg overflow-hidden shrink-0 border border-ink-border shadow-sm relative book-spine">
        <img
          src={story.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"}
          alt={story.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="text-xs sm:text-sm font-semibold text-ink-text truncate group-hover:text-gold transition-colors">
          {story.title}
        </h4>
        <div className="flex items-center justify-between text-[11px] text-ink-muted mt-1">
          <span className="truncate max-w-[90px]">{story.author}</span>
          <span className="flex items-center gap-1 font-medium text-slate-400">
            <svg className="w-3 h-3 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {story.viewCount >= 1000 ? `${(story.viewCount / 1000).toFixed(0)}k` : story.viewCount}
          </span>
        </div>
      </div>
    </Link>
  );
}

// Danh sách dữ liệu mẫu đầy đủ để giao diện luôn hiển thị đẹp mắt kể cả khi Backend API chưa chạy
const MOCK_STORIES: StoryListItem[] = [
  {
    id: "mock-1",
    title: "Đồ Đệ Của Ta Đều Là Đại Nhân Vật",
    coverImageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80",
    author: "Nhiệt Huyết Manh Manh",
    status: 0,
    accessPolicy: 0,
    viewCount: 1540000,
  },
  {
    id: "mock-2",
    title: "Ta Có Thể Đốn Ngộ Vô Hạn",
    coverImageUrl: "https://images.unsplash.com/photo-1618336753974-aae8e304ec9f?w=500&q=80",
    author: "Đường Gia Tam Thiếu",
    status: 0,
    accessPolicy: 0,
    viewCount: 1250000,
  },
  {
    id: "mock-3",
    title: "Bỏ Làm Simp Chúa, Ta Chuyển Sang Tu Tiên",
    coverImageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80",
    author: "Hắc Bạch Vô Song",
    status: 0,
    accessPolicy: 1,
    viewCount: 980000,
  },
  {
    id: "mock-4",
    title: "Toàn Cầu Băng Phong: Ta Trốn Trong Nhà Tị Nạn",
    coverImageUrl: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=500&q=80",
    author: "Tiêu Tương",
    status: 0,
    accessPolicy: 2,
    viewCount: 890000,
  },
  {
    id: "mock-5",
    title: "Vạn Cổ Chí Tôn",
    coverImageUrl: "https://images.unsplash.com/photo-1542396601-dca920ea2807?w=500&q=80",
    author: "Thái Nhất Sinh Thủy",
    status: 1,
    accessPolicy: 0,
    viewCount: 760000,
  },
  {
    id: "mock-6",
    title: "Bách Luyện Thành Thần",
    coverImageUrl: "https://images.unsplash.com/photo-1635322966219-b75ed372eb01?w=500&q=80",
    author: "Ân Tứ Giải Thoát",
    status: 0,
    accessPolicy: 0,
    viewCount: 605000,
  },
  {
    id: "mock-7",
    title: "Đại Phụng Đả Canh Nhân",
    coverImageUrl: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?w=500&q=80",
    author: "Mại Báo Tiểu Lang Quân",
    status: 1,
    accessPolicy: 1,
    viewCount: 1000000,
  },
  {
    id: "mock-8",
    title: "Tinh Giáp Hồn Tướng",
    coverImageUrl: "https://images.unsplash.com/photo-1579547621309-5e57ab324182?w=500&q=80",
    author: "Bạch Mã Đao Khách",
    status: 0,
    accessPolicy: 0,
    viewCount: 2000000,
  },
  {
    id: "mock-9",
    title: "Mairimashita! Iruma-kun",
    coverImageUrl: "https://images.unsplash.com/photo-1601814933824-fd0b574dd592?w=500&q=80",
    author: "Nishi Osamu",
    status: 0,
    accessPolicy: 0,
    viewCount: 295000,
  },
  {
    id: "mock-10",
    title: "Đăng Thiên Lộ",
    coverImageUrl: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=500&q=80",
    author: "Phong Ăn Vân",
    status: 0,
    accessPolicy: 0,
    viewCount: 22000,
  },
  {
    id: "mock-11",
    title: "Ma Đạo Đệ Nhất Kiếm",
    coverImageUrl: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=500&q=80",
    author: "Tiêu Đỉnh",
    status: 0,
    accessPolicy: 2,
    viewCount: 25000,
  },
  {
    id: "mock-12",
    title: "Mỗi Tuần Ta Có Một Nghề Nghiệp Mới",
    coverImageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&q=80",
    author: "Chỉ Thao Quá Lang",
    status: 0,
    accessPolicy: 0,
    viewCount: 982000,
  },
];

export default function HomePage() {
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<number | "all">("all");
  const [accessFilter, setAccessFilter] = useState<number | "all">("all");
  const [visibleCount, setVisibleCount] = useState(12);

  useEffect(() => {
    setVisibleCount(12);
  }, [keyword, statusFilter, accessFilter]);

  const { data: apiStories, isLoading } = useQuery({
    queryKey: ["stories", keyword],
    queryFn: () => searchStories(keyword || undefined),
  });

  // Sử dụng dữ liệu thật từ API nếu có, ngược lại dùng mock data
  const stories = apiStories && apiStories.length > 0 ? apiStories : MOCK_STORIES;

  const filteredStories = stories.filter((story) => {
    if (statusFilter !== "all" && story.status !== statusFilter) return false;
    if (accessFilter !== "all" && story.accessPolicy !== accessFilter) return false;
    if (keyword && !story.title.toLowerCase().includes(keyword.toLowerCase())) return false;
    return true;
  });

  // Top 5 truyện đề cử (lấy theo lượt đọc cao nhất)
  const recommendedStories = [...stories]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  // Top 5 truyện cho sidebar Leaderboard
  const topViewedStories = [...stories]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-10">
      {/* ========================================================= */}
      {/* PHẦN TRUYỆN ĐỀ CỬ                                       */}
      {/* ========================================================= */}
      {!keyword && (
        <section className="space-y-4">
          {/* Tiêu đề mục Truyện Đề Cử */}
          <div className="flex items-center justify-between border-b border-ink-border pb-3">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-6 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-sm shadow-amber-500/30" />
              <h2 className="font-serif text-xl md:text-2xl font-bold text-white flex items-center gap-2">
                <span>Truyện đề cử</span>
              </h2>
            </div>
            <span className="text-xs text-ink-muted hidden sm:inline-block">
              Tuyển tập tác phẩm nổi bật được cộng đồng yêu thích
            </span>
          </div>

          {/* Hàng 5 Card Truyện Đề Cử */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {recommendedStories.map((story, idx) => (
              <Link
                key={story.id}
                to={`/stories/${story.id}`}
                className="group relative overflow-hidden rounded-xl border border-ink-border bg-ink-card shadow-book hover:shadow-card-hover hover:border-gold/60 transition-all duration-300 book-spine"
                style={{ aspectRatio: "2/3" }}
              >
                {/* Ảnh bìa */}
                <img
                  src={story.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"}
                  alt={story.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />

                {/* Subtle inner border */}
                <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-xl pointer-events-none" />

                {/* Badge HOT / TOP góc trên trái */}
                <div className="absolute top-2.5 left-2.5 z-20">
                  {idx < 3 ? (
                    <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-md shadow-red-600/30">
                      HOT
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-black/70 text-slate-200 shadow-sm border border-white/10">
                      TOP {idx + 1}
                    </span>
                  )}
                </div>

                {/* Badge VIP / Trả phí góc trên phải */}
                {story.accessPolicy > 0 && (
                  <div className="absolute top-2.5 right-2.5 z-20">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-gradient-to-r from-amber-500 to-amber-600 text-ink-bg shadow-sm">
                      {story.accessPolicy === 2 ? "VIP" : "PRO"}
                    </span>
                  </div>
                )}

                {/* Lớp phủ tối mờ (Gradient Overlay) phía dưới ảnh */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-3 z-10">
                  <h3 className="font-serif text-[13px] font-bold text-white group-hover:text-gold transition-colors line-clamp-2 leading-snug drop-shadow-sm">
                    {story.title}
                  </h3>
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-300 font-medium">
                    <span className="text-[10px] text-amber-400 bg-black/50 px-1.5 py-0.5 rounded border border-amber-400/20">
                      Chương mới
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-300">
                      👁️ {story.viewCount >= 1000 ? `${(story.viewCount / 1000).toFixed(0)}k` : story.viewCount}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* THANH TÌM KIẾM VÀ BỘ LỌC                                 */}
      {/* ========================================================= */}
      <div className="bg-ink-card/80 backdrop-blur-xl border border-ink-border rounded-2xl p-5 shadow-lg">
        <div className="relative max-w-2xl mx-auto mb-4">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
            <svg className="w-5 h-5 text-gold/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </span>
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tìm truyện theo tên hoặc tác giả..."
            className="w-full bg-ink-bg border border-ink-border rounded-xl pl-12 pr-10 py-3 text-ink-text placeholder:text-ink-muted focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all text-sm font-medium"
          />
          {keyword && (
            <button
              onClick={() => setKeyword("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-ink-muted font-medium">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="bg-ink-bg border border-ink-border rounded-lg px-3 py-1.5 text-ink-text focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="all">Tất cả</option>
              <option value={0}>Đang phát hành</option>
              <option value={1}>Hoàn thành</option>
              <option value={2}>Tạm ngưng</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-ink-muted font-medium">Phân loại:</span>
            <select
              value={accessFilter}
              onChange={(e) => setAccessFilter(e.target.value === "all" ? "all" : Number(e.target.value))}
              className="bg-ink-bg border border-ink-border rounded-lg px-3 py-1.5 text-ink-text focus:outline-none focus:border-gold cursor-pointer"
            >
              <option value="all">Tất cả</option>
              <option value={0}>Miễn phí</option>
              <option value={1}>Trả phí</option>
              <option value={2}>VIP</option>
            </select>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VÙNG CHÍNH: CỘT TRUYỆN BÊN TRÁI + SIDEBAR BÊN PHẢI       */}
      {/* ========================================================= */}
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Cột trái: Danh sách toàn bộ truyện */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-6 pb-2 border-b border-ink-border">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-6 rounded-full bg-gradient-to-b from-amber-400 to-amber-600 shadow-sm shadow-amber-500/30" />
              <h2 className="font-serif text-xl font-bold text-white flex items-center gap-2">
                <span>{keyword ? "Kết quả tìm kiếm" : "Khám Phá Truyện"}</span>
              </h2>
            </div>
            <span className="text-xs text-ink-muted bg-ink-card border border-ink-border rounded-full px-3 py-1 font-medium">
              {filteredStories.length} tác phẩm
            </span>
          </div>

          {/* Loading Skeleton */}
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
            <div className="flex flex-col items-center justify-center py-16 bg-ink-card/40 border border-ink-border rounded-2xl text-center">
              <div className="w-20 h-20 rounded-full bg-ink-card border border-ink-border flex items-center justify-center mb-5 shadow-lg shadow-gold/5">
                <svg className="w-10 h-10 text-gold/70" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
              </div>
              <p className="text-white text-lg font-serif font-semibold">Không tìm thấy truyện nào</p>
              <p className="text-ink-muted text-sm mt-1">Hãy thử đổi từ khóa tìm kiếm hoặc chọn bộ lọc khác</p>
            </div>
          )}

          {/* Lưới truyện chính */}
          {!isLoading && filteredStories.length > 0 && (
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
                    className="px-8 py-3 rounded-xl font-semibold border border-ink-border text-ink-text hover:border-gold hover:text-gold hover:bg-ink-card transition-all shadow-sm text-sm"
                  >
                    Tải thêm truyện ({filteredStories.length - visibleCount} còn lại)
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Cột phải: Bảng xếp hạng (Sidebar) */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-6">
          <div className="bg-ink-card border border-ink-border rounded-2xl p-5 shadow-lg">
            {/* Header Bảng Xếp Hạng */}
            <div className="flex border-b border-ink-border pb-3 mb-4 text-sm font-bold text-ink-text gap-4">
              <span className="text-amber-400 border-b-2 border-amber-400 pb-3 -mb-3.5 cursor-pointer font-serif">
                Top Bảng Xếp Hạng
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-12 bg-ink-bg rounded-lg animate-pulse" />
                ))}
              </div>
            ) : topViewedStories.length > 0 ? (
              <div className="flex flex-col gap-2">
                {topViewedStories.map((story, idx) => (
                  <LeaderboardItem key={story.id} story={story} rank={idx + 1} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-muted text-center py-4">Chưa có dữ liệu</p>
            )}
          </div>

          {/* Banner Premium */}
          <div className="bg-gradient-to-br from-amber-500/15 via-ink-card to-amber-600/10 border border-amber-500/30 rounded-2xl p-6 text-center relative overflow-hidden group shadow-lg">
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-amber-500/10 rounded-full blur-2xl" />
            <div className="relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center mx-auto mb-3 text-ink-bg shadow-md shadow-amber-500/30">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
              </div>
              <h3 className="font-serif text-amber-400 font-bold text-lg mb-1.5">Gói Thành Viên VIP</h3>
              <p className="text-xs text-ink-muted mb-4 leading-relaxed">
                Đọc không giới hạn toàn bộ truyện VIP không quảng cáo, mở khóa chương sớm
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
