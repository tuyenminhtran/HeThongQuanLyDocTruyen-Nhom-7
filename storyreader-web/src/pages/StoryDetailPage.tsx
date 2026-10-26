import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStoryDetail, getIsFollowing, toggleFollowStory } from "../api/stories";
import { buyStory, simulatePaymentCallback } from "../api/payments";
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
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => !!s.accessToken);
  const queryClient = useQueryClient();
  const [buyError, setBuyError] = useState<string | null>(null);
  const [chapterSearch, setChapterSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // State cho Modal thanh toán mua truyện
  const [paymentModal, setPaymentModal] = useState<{ transactionId: string; paymentUrl: string; ref: string } | null>(null);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const { data: apiStory, isLoading } = useQuery({
    queryKey: ["story", id],
    queryFn: async () => {
      try {
        return await getStoryDetail(id!);
      } catch {
        return null;
      }
    },
    enabled: !!id,
  });

  const { data: isFollowing = false } = useQuery({
    queryKey: ["isFollowing", id],
    queryFn: () => getIsFollowing(id!),
    enabled: !!id && isLoggedIn,
  });

  const followMutation = useMutation({
    mutationFn: () => toggleFollowStory(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["isFollowing", id] });
    },
  });

  const handleToggleFollow = () => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }
    followMutation.mutate();
  };

  // Sử dụng dữ liệu API nếu có, ngược lại dùng fallback data để đảm bảo luôn hiển thị
  const story = apiStory || (id ? getFallbackStoryDetail(id) : null);

  const buyMutation = useMutation({
    mutationFn: () => buyStory(id!),
    onSuccess: (result) => {
      setBuyError(null);
      let ref = "";
      try {
        const urlObj = new URL(result.paymentUrl);
        ref = urlObj.searchParams.get("ref") || "";
      } catch {
        ref = result.transactionId;
      }

      setPaymentModal({
        transactionId: result.transactionId,
        paymentUrl: result.paymentUrl,
        ref: ref,
      });
      setPaymentSuccess(false);
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || "Không thể khởi tạo giao dịch. Vui lòng thử lại.";
      setBuyError(msg);
    },
  });

  const handleConfirmSimulation = async () => {
    if (!paymentModal?.ref) return;
    try {
      setIsSimulatingPayment(true);
      await simulatePaymentCallback(paymentModal.ref, true);
      setPaymentSuccess(true);
      queryClient.invalidateQueries({ queryKey: ["story", id] });
      queryClient.invalidateQueries({ queryKey: ["user-library"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardOverview"] });
    } catch {
      alert("Không thể hoàn tất thanh toán. Vui lòng thử lại.");
    } finally {
      setIsSimulatingPayment(false);
    }
  };

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
        <div className="w-20 h-20 rounded-full bg-ink-card border border-ink-border flex items-center justify-center mb-4 text-ink-muted">
          <i className="fa-solid fa-book-open text-3xl opacity-50" />
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
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80";
              }}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-2xl pointer-events-none" />
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              {/* Type & Policy Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gold/15 text-gold border border-gold/30">
                  {story.type === 1 ? "Truyện tranh (Comic)" : "Truyện chữ (Novel)"}
                </span>

                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    story.accessPolicy === 0
                      ? "text-green-400 bg-green-400/10 border-green-400/20"
                      : story.accessPolicy === 1
                      ? "text-gold bg-gold/10 border-gold/20"
                      : "text-blue-400 bg-blue-400/10 border-blue-400/20"
                  }`}
                >
                  {accessPolicyLabel[story.accessPolicy] ?? "Không xác định"}
                </span>

                <span className="text-xs text-ink-muted flex items-center gap-1.5 ml-auto">
                  <i className="fa-solid fa-eye text-xs" />
                  <span>{(story.viewCount ?? 0).toLocaleString()} lượt đọc</span>
                </span>
              </div>

              {/* Title & Author */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-2 leading-tight">
                {story.title}
              </h1>
              <p className="text-ink-muted text-sm sm:text-base mb-4 flex items-center gap-2">
                <i className="fa-solid fa-pen-nib text-xs text-gold" />
                <span>Tác giả: <strong>{story.author || "Đang cập nhật"}</strong></span>
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
                  <i className="fa-solid fa-circle-info text-gold text-sm" />
                  Giới thiệu
                </h3>
                <p className="text-sm text-ink-text/80 leading-relaxed whitespace-pre-line">
                  {story.description}
                </p>
              </div>
            </div>

            {/* Pricing & CTA */}
            <div className="mt-auto pt-6 border-t border-ink-border/50">
              {story.accessPolicy !== 0 && (
                <div className="mb-5 bg-ink-card border border-ink-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-gold font-bold text-xl">
                      {story.price?.toLocaleString()}đ
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5">
                      {story.freeChapterCount > 0 ? `${story.freeChapterCount} chương đầu đọc miễn phí` : "Mua một lần mở khóa vĩnh viễn"}
                    </p>
                  </div>
                  {isLoggedIn ? (
                    <button
                      onClick={() => buyMutation.mutate()}
                      disabled={buyMutation.isPending}
                      className="px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-gold to-gold/90 text-ink-bg hover:shadow-lg hover:shadow-gold/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      {buyMutation.isPending && (
                        <i className="fa-solid fa-spinner fa-spin text-sm" />
                      )}
                      {buyMutation.isPending ? "Đang xử lý..." : "Mua truyện ngay"}
                    </button>
                  ) : (
                    <Link
                      to="/login"
                      className="px-6 py-2.5 rounded-xl font-medium border border-gold text-gold hover:bg-gold/10 transition-all text-center text-sm"
                    >
                      Đăng nhập để mua
                    </Link>
                  )}
                </div>
              )}

              {buyError && (
                <div className="mb-4 flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                  <i className="fa-solid fa-circle-exclamation text-red-400 shrink-0 text-base" />
                  <p className="text-red-400 text-sm">{buyError}</p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                {story.chapters.length > 0 && (
                  <Link
                    to={`/chapters/${story.chapters[0].id}`}
                    state={{ storyId: story.id }}
                    className="px-8 py-3 rounded-xl font-medium bg-ink-text text-ink-bg hover:bg-white transition-all shadow-lg flex items-center gap-2"
                  >
                    <i className="fa-solid fa-book-open-reader text-sm" />
                    <span>Đọc từ đầu</span>
                  </Link>
                )}

                <button
                  onClick={handleToggleFollow}
                  disabled={followMutation.isPending}
                  className={`px-5 py-3 rounded-xl font-medium transition-all flex items-center gap-2 border ${
                    isFollowing
                      ? "bg-red-500/15 border-red-500/30 text-red-400 hover:bg-red-500/25"
                      : "bg-ink-card border-ink-border text-ink-text hover:border-gold hover:text-gold"
                  }`}
                  title={isFollowing ? "Bỏ theo dõi truyện này" : "Nhận thông báo khi có chương mới"}
                >
                  <i className={`${isFollowing ? "fa-solid text-red-400" : "fa-regular"} fa-heart text-sm`} />
                  <span>{isFollowing ? "Đang theo dõi" : "Theo dõi truyện"}</span>
                </button>
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
                <i className="fa-solid fa-magnifying-glass text-ink-muted text-xs absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Sort button */}
              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="w-8 h-8 rounded-xl border border-ink-border bg-ink-card text-ink-muted hover:text-white transition-colors flex items-center justify-center"
                title={sortAsc ? "Thứ tự: Cũ nhất trước" : "Thứ tự: Mới nhất trước"}
              >
                <i className={`fa-solid ${sortAsc ? "fa-arrow-down-1-9" : "fa-arrow-up-9-1"} text-xs`} />
              </button>
            </div>
          </div>

          {filteredChapters.length === 0 ? (
            <div className="text-center py-12 bg-ink-card/50 border border-ink-border rounded-2xl">
              <i className="fa-solid fa-book-open text-3xl mx-auto mb-3 text-ink-muted/30 block" />
              <p className="text-ink-muted">Chưa tìm thấy chương phù hợp.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredChapters.map((c) => (
                <Link
                  key={c.id}
                  to={`/chapters/${c.id}`}
                  state={{ storyId: story.id }}
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
                      <i className="fa-solid fa-lock text-xs" />
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
                    {[1, 2, 3, 4, 5].map(star => (
                      <i key={star} className="fa-solid fa-star text-sm cursor-pointer hover:scale-110 transition-transform" />
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
                      <i key={star} className="fa-solid fa-star text-xs" />
                    ))}
                  </div>
                  <p className="text-sm text-ink-text/80">Truyện rất hay, mong tác giả ra nhanh chương mới. Cốt truyện hấp dẫn và sâu sắc!</p>
                </div>
              </div>
            </div>

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
                      <i key={star} className="fa-solid fa-star text-xs" />
                    ))}
                    <i className="fa-regular fa-star text-xs text-ink-border" />
                  </div>
                  <p className="text-sm text-ink-text/80">Bản dịch rất mượt, giao diện đọc truyện đẹp và không bị mỏi mắt khi đọc lâu.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL THANH TOÁN MUA TRUYỆN */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-ink-card border border-ink-border rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative">
            <button
              onClick={() => setPaymentModal(null)}
              className="absolute top-5 right-5 text-ink-muted hover:text-white p-2 rounded-xl transition-colors"
            >
              <i className="fa-solid fa-xmark text-lg" />
            </button>

            {paymentSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-2xl">
                  <i className="fa-solid fa-circle-check" />
                </div>
                <h3 className="font-serif text-2xl text-white font-bold">Mua Truyện Thành Công!</h3>
                <p className="text-sm text-ink-muted">
                  Bạn đã mở khóa toàn bộ quyền đọc tác phẩm <strong>{story.title}</strong>. Chúc bạn có những giây phút thưởng thức truyện vui vẻ!
                </p>
                <div className="pt-4 flex justify-center gap-3">
                  <button
                    onClick={() => {
                      setPaymentModal(null);
                      if (story.chapters.length > 0) {
                        navigate(`/chapters/${story.chapters[0].id}`, { state: { storyId: story.id } });
                      }
                    }}
                    className="px-6 py-2.5 rounded-xl text-sm font-semibold bg-gold text-ink-bg hover:bg-gold-dim transition-all"
                  >
                    Bắt đầu đọc ngay
                  </button>
                  <button
                    onClick={() => setPaymentModal(null)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium border border-ink-border text-ink-text hover:bg-ink-bg transition-all"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="text-gold text-xs font-semibold uppercase tracking-wider block mb-1">
                    Thanh toán mua truyện
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-white font-bold truncate">
                    {story.title}
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-ink-bg border border-ink-border space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Tác phẩm:</span>
                    <span className="font-semibold text-white truncate max-w-[200px]">{story.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Quyền lợi:</span>
                    <span className="text-emerald-400 font-medium">Mở khóa vĩnh viễn</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Giá bán:</span>
                    <span className="text-gold font-bold text-base">{story.price?.toLocaleString()}đ</span>
                  </div>
                </div>

                {/* Mã QR thanh toán VNPay */}
                <div className="text-center p-4 bg-white rounded-2xl shadow-inner max-w-[200px] mx-auto">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(paymentModal.paymentUrl)}`}
                    alt="Mã QR thanh toán VNPay"
                    className="w-full h-auto mx-auto block"
                  />
                  <span className="text-[11px] text-slate-800 font-medium mt-2 block font-sans">
                    Quét mã VNPay / Ngân hàng
                  </span>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-2">
                  <button
                    onClick={handleConfirmSimulation}
                    disabled={isSimulatingPayment}
                    className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-slate-950 hover:from-emerald-400 hover:to-emerald-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                  >
                    {isSimulatingPayment ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin" />
                        <span>Đang xử lý mở khóa...</span>
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-check-double" />
                        <span>Xác nhận đã thanh toán (Mô phỏng tức thì)</span>
                      </>
                    )}
                  </button>

                  <a
                    href={paymentModal.paymentUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-2.5 rounded-xl font-medium text-xs border border-ink-border text-ink-muted hover:text-white hover:bg-ink-bg transition-all flex items-center justify-center gap-2"
                  >
                    <i className="fa-solid fa-arrow-up-right-from-square" />
                    <span>Mở cổng VNPay Sandbox</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
