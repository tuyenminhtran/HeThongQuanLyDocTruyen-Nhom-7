import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStoryDetail } from "../api/stories";
import { buyStory } from "../api/payments";
import { useAuthStore } from "../store/authStore";
import { useState } from "react";
import { getFallbackStoryDetail } from "../data/mockDetails";

const accessPolicyLabel: Record<number, string> = {
  0: "Miễn phí",
  1: "Trả phí",
  2: "Hỗn hợp",
};

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const isLoggedIn = useAuthStore((s) => !!s.accessToken);
  const queryClient = useQueryClient();
  const [buyError, setBuyError] = useState<string | null>(null);
  const [chapterSearch, setChapterSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  const { data: apiStory, isLoading } = useQuery({
    queryKey: ["story", id],
    queryFn: async () => {
      try {
        return await getStoryDetail(id!);
      } catch (err) {
        return null;
      }
    },
    enabled: !!id,
  });

  // Sử dụng dữ liệu API nếu có, ngược lại dùng fallback data để đảm bảo luôn hiển thị
  const story = apiStory || (id ? getFallbackStoryDetail(id) : null);

  const buyMutation = useMutation({
    mutationFn: () => buyStory(id!),
    onSuccess: (result) => {
      setBuyError(null);
      alert(
        `Đã tạo giao dịch. Trong thực tế bạn sẽ được chuyển tới:\n${result.paymentUrl}`
      );
      queryClient.invalidateQueries({ queryKey: ["story", id] });
    },
    onError: () => setBuyError("Không thể khởi tạo giao dịch. Vui lòng thử lại."),
  });

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 animate-pulse">
        <div className="flex flex-col md:flex-row gap-10">
          <div className="w-56 md:w-72 aspect-[2/3] shrink-0 bg-ink-card rounded-2xl border border-ink-border mx-auto md:mx-0" />
          <div className="flex-1 space-y-5">
            <div className="h-10 bg-ink-card rounded-xl w-3/4" />
            <div className="h-5 bg-ink-card rounded-lg w-1/3" />
            <div className="h-28 bg-ink-card rounded-xl w-full mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-ink-card border border-ink-border flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-ink-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
          </svg>
        </div>
        <p className="text-white text-xl font-serif font-bold mb-2">Không tìm thấy truyện</p>
        <p className="text-ink-muted text-sm mb-6">Tác phẩm này có thể đã bị gỡ hoặc không tồn tại</p>
        <Link
          to="/"
          className="px-6 py-2.5 rounded-xl bg-gold text-ink-bg font-semibold text-sm hover:brightness-110 transition-all shadow-md shadow-gold/20"
        >
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const filteredChapters = (story.chapters || [])
    .filter((c) =>
      c.title.toLowerCase().includes(chapterSearch.toLowerCase()) ||
      c.chapterNumber.toString().includes(chapterSearch)
    )
    .sort((a, b) => (sortAsc ? a.chapterNumber - b.chapterNumber : b.chapterNumber - a.chapterNumber));

  return (
    <div className="relative min-h-screen">
      {/* Ambient background blur */}
      <div className="absolute top-0 inset-x-0 h-96 overflow-hidden pointer-events-none opacity-20 blur-3xl z-0">
        <img
          src={story.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"}
          alt=""
          className="w-full h-full object-cover scale-150"
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
        {/* Top Section */}
        <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-16">
          {/* Cover */}
          <div className="w-56 md:w-72 aspect-[2/3] shrink-0 rounded-2xl overflow-hidden border border-ink-border bg-ink-card shadow-book mx-auto md:mx-0 relative group book-spine">
            <img
              src={story.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col pt-2">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                {story.status === 0 ? "Đang ra" : story.status === 1 ? "Hoàn thành" : "Tạm ngưng"}
              </span>
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-400">
                {accessPolicyLabel[story.accessPolicy] || "Miễn phí"}
              </span>
              {((story as any).viewCount != null) && (
                <span className="text-xs text-ink-muted flex items-center gap-1 font-medium ml-auto">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {(story as any).viewCount >= 1000 ? `${((story as any).viewCount / 1000).toFixed(0)}k` : (story as any).viewCount} lượt xem
                </span>
              )}
            </div>

            <h1 className="font-serif text-2xl sm:text-4xl text-white font-bold leading-tight mb-2 tracking-tight">
              {story.title}
            </h1>
            <p className="text-ink-muted text-base mb-5 flex items-center gap-2">
              <svg className="w-4 h-4 text-gold/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
              Tác giả: <span className="text-slate-200 font-semibold">{story.author}</span>
            </p>

            {/* Genres */}
            {story.genres && story.genres.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {story.genres.map((genre) => (
                  <span
                    key={genre}
                    className="text-xs font-medium px-3 py-1 rounded-lg bg-ink-card border border-ink-border text-ink-text hover:border-gold/50 transition-colors"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            <div className="bg-ink-card/60 backdrop-blur-sm border border-ink-border rounded-2xl p-5 mb-6">
              <h3 className="font-serif text-base font-bold text-white mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                Giới thiệu
              </h3>
              <p className="text-sm text-ink-text/80 leading-relaxed whitespace-pre-line">
                {story.description}
              </p>
            </div>

            {/* Pricing & CTA */}
            <div className="mt-auto pt-6 border-t border-ink-border/50">
              {story.accessPolicy !== 0 && (
                <div className="mb-5 bg-ink-card border border-ink-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-ink-text font-medium text-lg">
                      {story.price?.toLocaleString()}đ
                    </p>
                    <p className="text-sm text-ink-muted mt-0.5">
                      {story.freeChapterCount} chương đầu đọc miễn phí
                    </p>
                  </div>
                  {isLoggedIn ? (
                    <button
                      onClick={() => buyMutation.mutate()}
                      disabled={buyMutation.isPending}
                      className="px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-gold to-gold/90 text-ink-bg hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                    >
                      {buyMutation.isPending && (
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                      )}
                      {buyMutation.isPending ? "Đang xử lý..." : "Mua ngay"}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="px-6 py-2.5 rounded-xl font-medium border border-gold text-gold hover:bg-gold/10 transition-all text-center"
                    >
                      Đăng nhập để mua
                    </Link>
                  )}
                </div>
              )}

              {buyError && (
                <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  <p className="text-red-400 text-sm">{buyError}</p>
                </div>
              )}

              <div className="flex items-center gap-4">
                {story.chapters.length > 0 && (
                  <Link
                    to={`/chapters/${story.chapters[0].id}`}
                    className="px-8 py-3 rounded-xl font-medium bg-ink-text text-ink-bg hover:bg-white transition-all shadow-lg"
                  >
                    Đọc từ đầu
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-ink-border">
            <h2 className="font-serif text-2xl text-white font-bold flex items-center gap-3">
              Danh sách chương
              <span className="text-xs font-sans font-medium text-ink-muted bg-ink-card border border-ink-border rounded-full px-3 py-1">
                {story.chapters.length} chương
              </span>
            </h2>

            <div className="flex items-center gap-3">
              {/* Chapter filter/search */}
              <div className="relative">
                <input
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  placeholder="Tìm chương..."
                  className="bg-ink-card border border-ink-border rounded-xl pl-8 pr-3 py-1.5 text-xs text-ink-text placeholder:text-ink-muted focus:outline-none focus:border-gold w-36 sm:w-48"
                />
                <svg className="w-3.5 h-3.5 text-ink-muted absolute left-2.5 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </div>

              {/* Sort button */}
              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="p-1.5 rounded-xl border border-ink-border bg-ink-card text-ink-muted hover:text-white transition-colors"
                title={sortAsc ? "Thứ tự: Cũ nhất trước" : "Thứ tự: Mới nhất trước"}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
                </svg>
              </button>
            </div>
          </div>

          {filteredChapters.length === 0 ? (
            <div className="text-center py-12 bg-ink-card/50 border border-ink-border rounded-2xl">
              <svg className="w-12 h-12 mx-auto mb-3 text-ink-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
              </svg>
              <p className="text-ink-muted">Chưa tìm thấy chương phù hợp.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredChapters.map((c) => (
                <Link
                  key={c.id}
                  to={`/chapters/${c.id}`}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-ink-border bg-ink-card hover:border-gold/50 hover:bg-ink-elevated transition-all group"
                >
                  <div className="min-w-0 pr-3">
                    <p className="text-xs text-amber-400/80 mb-0.5 font-mono font-medium">
                      Chương {c.chapterNumber}
                    </p>
                    <p className="text-ink-text text-sm font-medium truncate group-hover:text-gold transition-colors">
                      {c.title}
                    </p>
                  </div>
                  {c.requiresAccess && (
                    <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400" title="Chương VIP / Cần mở khóa">
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                      </svg>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="border-t border-ink-border pt-10">
          <h2 className="font-serif text-2xl text-ink-text mb-6">Đánh giá & Bình luận</h2>

          {/* Comment input */}
          <div className="bg-ink-card border border-ink-border rounded-2xl p-5 mb-8">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-gold uppercase">
                  U
                </span>
              </div>
              <div className="flex-1">
                <textarea
                  placeholder="Viết đánh giá của bạn về truyện này..."
                  rows={3}
                  className="w-full bg-ink-bg border border-ink-border rounded-xl px-4 py-3 text-sm text-ink-text placeholder:text-ink-muted/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 resize-none transition-all"
                />
                <div className="flex justify-between items-center mt-3">
                  <div className="flex gap-1 text-gold">
                    {/* Mock stars */}
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <button className="px-5 py-2 rounded-xl bg-gold text-ink-bg font-medium text-sm hover:bg-gold-dim transition-colors">
                    Gửi đánh giá
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comment List */}
          <div className="space-y-6">
            {/* Mock Comment 1 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-ink-bg border border-ink-border flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-ink-muted">A</span>
              </div>
              <div className="flex-1">
                <div className="bg-ink-card border border-ink-border rounded-2xl rounded-tl-none p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-ink-text text-sm">Anh Tuấn</span>
                    <span className="text-xs text-ink-muted">2 giờ trước</span>
                  </div>
                  <div className="flex gap-1 text-gold mb-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <svg key={star} className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-sm text-ink-text/80">Truyện rất hay, mong tác giả ra nhanh chương mới. Plot twist đoạn cuối quá bất ngờ!</p>
                </div>
              </div>
            </div>

            {/* Mock Comment 2 */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-ink-bg border border-ink-border flex items-center justify-center shrink-0">
                <span className="text-sm font-semibold text-ink-muted">M</span>
              </div>
              <div className="flex-1">
                <div className="bg-ink-card border border-ink-border rounded-2xl rounded-tl-none p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-ink-text text-sm">Minh Phượng</span>
                    <span className="text-xs text-ink-muted">1 ngày trước</span>
                  </div>
                  <div className="flex gap-1 text-gold mb-2">
                    {[1, 2, 3, 4].map(star => (
                      <svg key={star} className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                    <svg className="w-3.5 h-3.5 text-ink-border" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
