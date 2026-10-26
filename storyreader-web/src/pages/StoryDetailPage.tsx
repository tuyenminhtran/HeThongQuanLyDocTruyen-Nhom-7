import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getStoryDetail, getIsFollowing, toggleFollowStory } from "../api/stories";
import { buyStory, simulatePaymentCallback } from "../api/payments";
import { postChapterDiscussion } from "../api/discussions";
import { useAuthStore, useIsAdmin } from "../store/authStore";
import { resolveImageUrl } from "../utils/imageUrl";
import { useState, useMemo, useEffect } from "react";
import { groupChaptersByPart } from "../utils/chapterGrouping";
import type { ChapterListItem } from "../api/stories";
import { getFallbackStoryDetail } from "../data/mockDetails";
import { fireConfetti } from "../utils/confetti";

interface StoryReview {
  id: string;
  userName: string;
  rating: number;
  content: string;
  createdAt: string;
}

const accessPolicyLabel: Record<number, string> = {
  0: "Miễn phí",
  1: "Trả phí",
  2: "Hỗn hợp",
};

function ChapterCard({ chapter, storyId }: { chapter: ChapterListItem; storyId: string }) {
  return (
    <Link
      to={`/chapters/${chapter.id}`}
      state={{ storyId }}
      className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 bg-white hover:border-orange-400 hover:bg-orange-50/40 shadow-2xs transition-all group"
    >
      <div className="min-w-0 pr-3">
        <p className="text-xs text-orange-600 mb-0.5 font-mono font-bold">
          Chương {chapter.chapterNumber}
        </p>
        <p className="text-slate-800 text-sm font-semibold truncate group-hover:text-orange-600 transition-colors">
          {chapter.title}
        </p>
      </div>
      {chapter.requiresAccess && (
        <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-lg bg-amber-50 border border-amber-300 text-amber-600" title="Chương VIP / Cần mở khóa">
          <i className="fa-solid fa-lock text-xs" />
        </div>
      )}
    </Link>
  );
}

export default function StoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isAdmin = useIsAdmin();
  const isLoggedIn = useAuthStore((s) => !!s.accessToken);
  const displayName = useAuthStore((s) => s.displayName);
  const queryClient = useQueryClient();
  const [buyError, setBuyError] = useState<string | null>(null);
  const [chapterSearch, setChapterSearch] = useState("");
  const [sortAsc, setSortAsc] = useState(true);

  // State cho Modal thanh toán mua truyện
  const [paymentModal, setPaymentModal] = useState<{ transactionId: string; paymentUrl: string; ref: string } | null>(null);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // State cho Đánh giá & Bình luận thật
  const [commentText, setCommentText] = useState("");
  const [selectedRating, setSelectedRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentNotice, setCommentNotice] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isPostingComment, setIsPostingComment] = useState(false);

  const [reviews, setReviews] = useState<StoryReview[]>(() => {
    try {
      const saved = localStorage.getItem(`story_reviews_${id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

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
      fireConfetti();
      queryClient.invalidateQueries({ queryKey: ["story", id] });
      queryClient.invalidateQueries({ queryKey: ["user-library"] });
      queryClient.invalidateQueries({ queryKey: ["adminDashboardOverview"] });
    } catch {
      alert("Không thể hoàn tất thanh toán. Vui lòng thử lại.");
    } finally {
      setIsSimulatingPayment(false);
    }
  };

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentNotice(null);

    if (!isLoggedIn) {
      navigate("/login", { state: { from: `/stories/${id}` } });
      return;
    }

    const text = commentText.trim();
    if (!text) {
      setCommentNotice({ type: "error", text: "Vui lòng nhập nội dung đánh giá của bạn." });
      return;
    }

    setIsPostingComment(true);
    try {
      const newRev: StoryReview = {
        id: Date.now().toString(),
        userName: displayName || "Bạn đọc",
        rating: selectedRating,
        content: text,
        createdAt: new Date().toISOString(),
      };

      const updated = [newRev, ...reviews];
      setReviews(updated);
      try {
        localStorage.setItem(`story_reviews_${id}`, JSON.stringify(updated));
      } catch {
        // ignore
      }

      // Nếu truyện có chapter, gửi lên backend Discussions API luôn
      if (story?.chapters && story.chapters.length > 0) {
        try {
          await postChapterDiscussion(story.chapters[0].id, `[Đánh giá ${selectedRating} sao] ${text}`);
        } catch {
          // ignore
        }
      }

      setCommentText("");
      setSelectedRating(5);
      setCommentNotice({ type: "success", text: "Cảm ơn bạn! Đánh giá đã được đăng thành công." });
      setTimeout(() => setCommentNotice(null), 4000);
    } catch {
      setCommentNotice({ type: "error", text: "Có lỗi xảy ra khi gửi bình luận. Vui lòng thử lại." });
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeleteReview = (reviewId: string) => {
    const updated = reviews.filter((r) => r.id !== reviewId);
    setReviews(updated);
    try {
      localStorage.setItem(`story_reviews_${id}`, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const formatCommentTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
      if (diffSec < 60) return "Vừa xong";
      if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
      if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
      if (diffSec < 604800) return `${Math.floor(diffSec / 86400)} ngày trước`;
      return date.toLocaleDateString("vi-VN");
    } catch {
      return "Vừa xong";
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
        <div className="w-20 h-20 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mb-4 text-slate-400">
          <i className="fa-solid fa-book-open text-3xl opacity-50" />
        </div>
        <p className="text-slate-900 text-xl font-serif font-bold mb-2">Không tìm thấy truyện</p>
        <p className="text-slate-500 text-sm mb-6">Tác phẩm này có thể đã bị gỡ hoặc không tồn tại</p>
        <Link
          to="/"
          className="px-6 py-2.5 rounded-xl bg-orange-600 text-white font-bold text-sm hover:bg-orange-700 transition-all shadow-sm"
        >
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  const filteredChapters = useMemo(() => {
    return (story?.chapters || [])
      .filter((c) =>
        c.title.toLowerCase().includes(chapterSearch.toLowerCase()) ||
        c.chapterNumber.toString().includes(chapterSearch) ||
        (c.partName && c.partName.toLowerCase().includes(chapterSearch.toLowerCase()))
      )
      .sort((a, b) => (sortAsc ? a.chapterNumber - b.chapterNumber : b.chapterNumber - a.chapterNumber));
  }, [story?.chapters, chapterSearch, sortAsc]);

  const chapterGroups = useMemo(() => groupChaptersByPart(filteredChapters), [filteredChapters]);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (chapterGroups.length > 0) {
      setExpandedFolders(new Set(chapterGroups.map((g) => g.partName)));
    }
  }, [story?.id, chapterSearch]);

  const toggleFolder = (partName: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(partName)) next.delete(partName);
      else next.add(partName);
      return next;
    });
  };

  const hasMultipleFolders = chapterGroups.some((g) => g.isFolder);
  const allExpanded = chapterGroups.length > 0 && chapterGroups.every((g) => expandedFolders.has(g.partName));

  return (
    <div className="relative min-h-screen">
      {/* Ambient background blur */}
      <div className="absolute top-0 inset-x-0 h-96 overflow-hidden pointer-events-none opacity-20 blur-3xl z-0">
        <img
          src={resolveImageUrl(story.coverImageUrl)}
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
              src={resolveImageUrl(story.coverImageUrl)}
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

                {isAdmin && (
                  <Link
                    to={`/admin/stories?storyId=${story.id}&edit=true`}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 transition-all shadow-xs cursor-pointer ml-auto"
                    title="Chỉnh sửa tên truyện, mô tả, ảnh bìa trong trang Admin"
                  >
                    <i className="fa-solid fa-pen-to-square text-xs" />
                    Sửa truyện (Admin)
                  </Link>
                )}

                <span className={`text-xs text-ink-muted flex items-center gap-1.5 ${isAdmin ? "ml-3" : "ml-auto"}`}>
                  <i className="fa-solid fa-eye text-xs" />
                  <span>{(story.viewCount ?? 0).toLocaleString()} lượt đọc</span>
                </span>
              </div>

              {/* Title & Author */}
              <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-2 leading-tight">
                {story.title}
              </h1>
              <p className="text-slate-600 text-sm sm:text-base mb-4 flex items-center gap-2">
                <i className="fa-solid fa-pen-nib text-xs text-orange-500" />
                <span>Tác giả: <strong className="text-slate-800">{story.author || "Đang cập nhật"}</strong></span>
              </p>

              {/* Genres */}
              {story.genres && story.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {story.genres.map((genre) => (
                    <span
                      key={genre}
                      className="text-xs font-semibold px-3 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 hover:bg-orange-100 transition-colors"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-6 shadow-xs">
                <h3 className="font-serif text-base font-bold text-slate-900 mb-2 flex items-center gap-2">
                  <i className="fa-solid fa-circle-info text-orange-500 text-sm" />
                  Giới thiệu
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
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
                    className="px-8 py-3 rounded-xl font-bold bg-orange-600 text-white hover:bg-orange-700 transition-all shadow-md flex items-center gap-2"
                  >
                    <i className="fa-solid fa-book-open-reader text-sm" />
                    <span>Đọc từ đầu</span>
                  </Link>
                )}

                <button
                  onClick={handleToggleFollow}
                  disabled={followMutation.isPending}
                  className={`px-5 py-3 rounded-xl font-semibold transition-all flex items-center gap-2 border ${
                    isFollowing
                      ? "bg-red-50 border-red-300 text-red-600 hover:bg-red-100"
                      : "bg-white border-slate-300 text-slate-700 hover:border-orange-500 hover:text-orange-600 shadow-2xs"
                  }`}
                  title={isFollowing ? "Bỏ theo dõi truyện này" : "Nhận thông báo khi có chương mới"}
                >
                  <i className={`${isFollowing ? "fa-solid text-red-500" : "fa-regular"} fa-heart text-sm`} />
                  <span>{isFollowing ? "Đang theo dõi" : "Theo dõi truyện"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Chapters Section */}
        <div className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-slate-200">
            <h2 className="font-serif text-2xl text-slate-900 font-bold flex items-center gap-3">
              Danh sách chương
              <span className="text-xs font-sans font-semibold text-slate-600 bg-slate-100 border border-slate-200 rounded-full px-3 py-1">
                {story.chapters.length} chương
              </span>
            </h2>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Toggle all folders button */}
              {hasMultipleFolders && (
                <button
                  type="button"
                  onClick={() => {
                    if (allExpanded) {
                      setExpandedFolders(new Set());
                    } else {
                      setExpandedFolders(new Set(chapterGroups.map((g) => g.partName)));
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:text-orange-600 hover:border-orange-400 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <i className={`fa-solid ${allExpanded ? "fa-folder-minus" : "fa-folder-tree"} text-xs`} />
                  <span>{allExpanded ? "Thu gọn" : "Mở tất cả"}</span>
                </button>
              )}

              {/* Chapter filter/search */}
              <div className="relative">
                <input
                  value={chapterSearch}
                  onChange={(e) => setChapterSearch(e.target.value)}
                  placeholder="Tìm chương..."
                  className="bg-white border border-slate-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500 w-36 sm:w-48 shadow-2xs"
                />
                <i className="fa-solid fa-magnifying-glass text-slate-400 text-xs absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>

              {/* Sort button */}
              <button
                onClick={() => setSortAsc(!sortAsc)}
                className="w-8 h-8 rounded-xl border border-slate-300 bg-white text-slate-600 hover:text-slate-900 hover:border-slate-400 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                title={sortAsc ? "Thứ tự: Cũ nhất trước" : "Thứ tự: Mới nhất trước"}
              >
                <i className={`fa-solid ${sortAsc ? "fa-arrow-down-1-9" : "fa-arrow-up-9-1"} text-xs`} />
              </button>
            </div>
          </div>

          {filteredChapters.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-2xl shadow-xs">
              <i className="fa-solid fa-book-open text-3xl mx-auto mb-3 text-slate-300 block" />
              <p className="text-slate-500">Chưa tìm thấy chương phù hợp.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {chapterGroups.map((group) => {
                if (!group.isFolder) {
                  return (
                    <div key={group.partName} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {group.chapters.map((c) => (
                        <ChapterCard key={c.id} chapter={c} storyId={story.id} />
                      ))}
                    </div>
                  );
                }

                const isExpanded = expandedFolders.has(group.partName);
                return (
                  <div
                    key={group.partName}
                    className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs transition-all"
                  >
                    {/* Folder Cha Header */}
                    <button
                      type="button"
                      onClick={() => toggleFolder(group.partName)}
                      className="w-full flex items-center justify-between px-5 py-3.5 bg-slate-50 hover:bg-orange-50/50 transition-colors cursor-pointer text-left group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                          <i className={`fa-solid ${isExpanded ? "fa-folder-open text-orange-600" : "fa-folder text-orange-500"} text-sm`} />
                        </div>
                        <div className="min-w-0">
                          <span className="font-serif font-bold text-slate-900 group-hover:text-orange-600 transition-colors text-base block truncate">
                            {group.partName}
                          </span>
                          <span className="text-xs text-slate-500 font-sans">
                            {group.chapters.length} chương
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-semibold text-orange-600 hidden sm:inline">
                          {isExpanded ? "Thu gọn" : "Xem chương"}
                        </span>
                        <div className={`w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}>
                          <i className="fa-solid fa-chevron-down text-xs text-slate-600" />
                        </div>
                      </div>
                    </button>

                    {/* Danh sách chương con */}
                    {isExpanded && (
                      <div className="p-4 border-t border-slate-100 bg-slate-50/30">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {group.chapters.map((c) => (
                            <ChapterCard key={c.id} chapter={c} storyId={story.id} />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div className="border-t border-slate-200 pt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-2xl text-slate-900 font-bold">
              Đánh giá &amp; Bình luận ({reviews.length})
            </h2>
          </div>

          {/* Alert thông báo khi gửi bình luận */}
          {commentNotice && (
            <div
              className={`p-4 mb-6 rounded-2xl text-sm font-medium flex items-center gap-3 transition-all ${
                commentNotice.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              <i
                className={`fa-solid ${
                  commentNotice.type === "success" ? "fa-circle-check text-emerald-600" : "fa-circle-exclamation text-rose-600"
                } text-base shrink-0`}
              />
              <span>{commentNotice.text}</span>
            </div>
          )}

          {/* Comment input form */}
          <form onSubmit={handlePostReview} className="bg-white border border-slate-200 rounded-2xl p-5 mb-8 shadow-xs">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-orange-100 border border-orange-200 flex items-center justify-center shrink-0">
                <span className="text-sm font-bold text-orange-600 uppercase">
                  {displayName ? displayName.charAt(0) : "U"}
                </span>
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder={
                    isLoggedIn
                      ? "Chia sẻ cảm nghĩ, đánh giá của bạn về tác phẩm này..."
                      : "Đăng nhập để viết đánh giá và bình luận về truyện này..."
                  }
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 resize-none transition-all"
                />
                <div className="flex flex-wrap justify-between items-center gap-3 mt-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">Đánh giá:</span>
                    <div className="flex gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setSelectedRating(star)}
                          className="cursor-pointer hover:scale-110 transition-transform p-0.5"
                          title={`${star} sao`}
                        >
                          <i
                            className={`${
                              star <= (hoverRating || selectedRating) ? "fa-solid fa-star" : "fa-regular fa-star text-slate-300"
                            } text-base`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={isPostingComment}
                    className="px-5 py-2 rounded-xl bg-orange-600 text-white font-semibold text-sm hover:bg-orange-700 disabled:opacity-60 transition-colors shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    {isPostingComment && <i className="fa-solid fa-spinner fa-spin text-xs" />}
                    <span>Gửi đánh giá</span>
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comment List (bỏ toàn bộ 2 mockup cũ) */}
          {reviews.length === 0 ? (
            <div className="text-center py-12 px-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mx-auto mb-3">
                <i className="fa-regular fa-comments text-xl" />
              </div>
              <p className="text-slate-700 font-semibold text-sm">Chưa có bình luận nào cho truyện này.</p>
              <p className="text-slate-400 text-xs mt-1">Hãy là người đầu tiên chia sẻ cảm nghĩ của bạn!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((rev) => (
                <div key={rev.id} className="flex gap-3 sm:gap-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
                  <div className="w-10 h-10 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 font-bold shrink-0 uppercase text-sm">
                    {rev.userName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-sm">{rev.userName}</span>
                        <span className="text-xs text-slate-400">• {formatCommentTime(rev.createdAt)}</span>
                      </div>
                      {displayName === rev.userName && (
                        <button
                          onClick={() => handleDeleteReview(rev.id)}
                          className="text-xs text-slate-400 hover:text-rose-600 transition-colors cursor-pointer p-1"
                          title="Xóa bình luận này"
                        >
                          <i className="fa-regular fa-trash-can" />
                        </button>
                      )}
                    </div>
                    <div className="flex gap-0.5 text-amber-400 text-xs mb-2">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <i
                          key={s}
                          className={s <= rev.rating ? "fa-solid fa-star" : "fa-regular fa-star text-slate-200"}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line break-words">
                      {rev.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* MODAL THANH TOÁN MUA TRUYỆN */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-md p-6 sm:p-8 shadow-2xl relative text-slate-800">
            <button
              onClick={() => setPaymentModal(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-800 p-2 rounded-xl transition-colors cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-lg" />
            </button>

            {paymentSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-300 flex items-center justify-center mx-auto text-2xl shadow-xs">
                  <i className="fa-solid fa-circle-check" />
                </div>
                <h3 className="font-serif text-2xl text-slate-900 font-bold">Mua Truyện Thành Công!</h3>
                <p className="text-sm text-slate-600">
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
                    className="px-6 py-2.5 rounded-xl text-sm font-bold bg-orange-600 text-white hover:bg-orange-700 transition-all shadow-xs"
                  >
                    Bắt đầu đọc ngay
                  </button>
                  <button
                    onClick={() => setPaymentModal(null)}
                    className="px-5 py-2.5 rounded-xl text-sm font-medium border border-slate-300 text-slate-700 hover:bg-slate-100 transition-all"
                  >
                    Đóng
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="text-orange-600 text-xs font-bold uppercase tracking-wider block mb-1">
                    Thanh toán mua truyện
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-slate-900 font-bold truncate">
                    {story.title}
                  </h3>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Tác phẩm:</span>
                    <span className="font-bold text-slate-900 truncate max-w-[200px]">{story.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Quyền lợi:</span>
                    <span className="text-emerald-600 font-semibold">Mở khóa vĩnh viễn</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Giá bán:</span>
                    <span className="text-orange-600 font-bold text-base">{story.price?.toLocaleString()}đ</span>
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
                    className="w-full py-2.5 rounded-xl font-medium text-xs border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
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
