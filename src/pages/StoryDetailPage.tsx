import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStoryDetail } from "../api/stories";
import { buyStory } from "../api/payments";
import { useAuthStore } from "../store/authStore";
import { useState } from "react";
import { getFallbackStoryDetail } from "../data/mockDetails";
import PaymentModal from "../components/PaymentModal";

const accessPolicyLabel: Record<number, string> = {
  0: "Miễn phí",
  1: "Trả phí",
  2: "Mixed",
};

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const isLoggedIn = useAuthStore((s) => !!s.accessToken);
  const queryClient = useQueryClient();
  const [buyError, setBuyError] = useState<string | null>(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

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
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-48 md:w-64 aspect-[2/3] shrink-0 bg-ink-card rounded-xl border border-ink-border mx-auto md:mx-0" />
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-ink-card rounded-md w-2/3" />
            <div className="h-4 bg-ink-card rounded-md w-1/3" />
            <div className="h-24 bg-ink-card rounded-md w-full mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <p className="text-ink-muted text-lg font-serif mb-2">Không tìm thấy truyện</p>
        <Link to="/" className="text-gold hover:text-gold-dim transition-colors">
          &larr; Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
      {/* Top Section */}
      <div className="flex flex-col md:flex-row gap-8 md:gap-12 mb-16">
        {/* Cover */}
        <div className="w-56 md:w-72 aspect-[2/3] shrink-0 rounded-2xl overflow-hidden border border-ink-border bg-ink-card shadow-2xl shadow-black/40 mx-auto md:mx-0 relative group">
          <img
            src={story.coverImageUrl || "https://placehold.co/400x600?text=No+Cover"}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col pt-2 md:pt-4">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-ink-card border border-ink-border text-ink-muted">
              {story.status === 0 ? "Đang ra" : story.status === 1 ? "Hoàn thành" : "Tạm ngưng"}
            </span>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-ink-card border border-ink-border text-ink-muted">
              {accessPolicyLabel[story.accessPolicy] || "N/A"}
            </span>
          </div>

          <h1 className="font-serif text-3xl md:text-4xl text-ink-text leading-tight mb-2">
            {story.title}
          </h1>
          <p className="text-ink-muted text-lg mb-6">
            Tác giả: <span className="text-ink-text font-medium">{story.author}</span>
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {story.genres?.map((genre) => (
              <span
                key={genre}
                className="text-sm px-3 py-1 rounded-lg bg-gold/10 border border-gold/20 text-gold"
              >
                {genre}
              </span>
            ))}
          </div>

          <div className="text-ink-text/80 leading-relaxed space-y-4 mb-8">
            <h3 className="font-serif text-xl text-ink-text">Giới thiệu</h3>
            <p className="whitespace-pre-line">{story.description}</p>
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
                    onClick={() => setPaymentModalOpen(true)}
                    className="px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-gold to-gold/90 text-ink-bg hover:shadow-lg hover:shadow-gold/20 transition-all flex items-center justify-center gap-2"
                  >
                    Mua truyện qua Ví điện tử
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
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl text-ink-text flex items-center gap-3">
            Danh sách chương
            <span className="text-sm font-sans font-normal text-ink-muted bg-ink-card border border-ink-border rounded-full px-3 py-1">
              {story.chapters.length} chương
            </span>
          </h2>
        </div>

        {story.chapters.length === 0 ? (
          <div className="text-center py-12 bg-ink-card border border-ink-border rounded-2xl">
            <svg className="w-12 h-12 mx-auto mb-3 text-ink-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <p className="text-ink-muted">Truyện này chưa có chương nào.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {story.chapters.map((c) => (
              <Link
                key={c.id}
                to={`/chapters/${c.id}`}
                className="flex items-center justify-between p-4 rounded-xl border border-ink-border bg-ink-card hover:border-gold/50 hover:shadow-md hover:shadow-gold/5 transition-all group"
              >
                <div className="min-w-0 pr-4">
                  <p className="text-sm text-ink-muted mb-0.5 font-mono group-hover:text-gold/70 transition-colors">
                    Chương {c.chapterNumber}
                  </p>
                  <p className="text-ink-text font-medium truncate group-hover:text-gold transition-colors">
                    {c.title}
                  </p>
                </div>
                {c.requiresAccess && (
                  <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-gold/10 text-gold" title="Chương cần mua">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
                  {[1,2,3,4,5].map(star => (
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
                  {[1,2,3,4,5].map(star => (
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
                  {[1,2,3,4].map(star => (
                    <svg key={star} className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                  <svg className="w-3.5 h-3.5 text-ink-border" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <p className="text-sm text-ink-text/80">Khá ổn, nhịp độ hơi chậm đoạn đầu nhưng về sau rất cuốn.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal thanh toán ví điện tử */}
      <PaymentModal
        isOpen={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        itemName={story.title}
        amount={story.price || 49000}
        itemType="story"
      />
    </div>
  );
}
