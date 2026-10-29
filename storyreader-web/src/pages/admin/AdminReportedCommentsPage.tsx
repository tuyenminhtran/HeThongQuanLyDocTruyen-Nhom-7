import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getReportedComments,
  approveReportedComment,
  hideReportedComment,
  deleteReportedComment,
  restrictUserFromComment,
  type ReportedCommentItem,
} from "../../api/adminReportedComments";

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

export default function AdminReportedCommentsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"reported" | "hidden" | "visible" | "all">("reported");
  const [keyword, setKeyword] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 4000);
  };

  // Lấy danh sách bình luận
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminReportedComments", statusFilter, keyword, page],
    queryFn: () =>
      getReportedComments({
        status: statusFilter,
        search: keyword.trim() || undefined,
        page,
        pageSize,
      }),
  });

  // Mutation: Duyệt bình luận (Hợp lệ)
  const approveMutation = useMutation({
    mutationFn: approveReportedComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReportedComments"] });
      showNotification("Đã duyệt bình luận hợp lệ và gỡ bỏ cảnh báo!");
    },
  });

  // Mutation: Ẩn bình luận
  const hideMutation = useMutation({
    mutationFn: hideReportedComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReportedComments"] });
      showNotification("Đã ẩn bình luận vi phạm khỏi chương truyện!");
    },
  });

  // Mutation: Xóa vĩnh viễn
  const deleteMutation = useMutation({
    mutationFn: deleteReportedComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReportedComments"] });
      showNotification("Đã xóa vĩnh viễn bình luận khỏi hệ thống!");
    },
  });

  // Mutation: Khóa tài khoản
  const restrictMutation = useMutation({
    mutationFn: restrictUserFromComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReportedComments"] });
      showNotification("Đã khóa quyền bình luận của tài khoản vi phạm!");
    },
  });

  const stats = data?.stats;
  const items = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-serif text-ink-text flex items-center gap-2.5">
            <i className="fa-solid fa-flag text-rose-500" />
            Quản lý Bình luận bị Báo cáo
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Kiểm duyệt và xử lý các bình luận bị độc giả báo cáo vi phạm tiêu chuẩn cộng đồng, ngôn từ xúc phạm hoặc quảng cáo rác.
          </p>
        </div>
      </div>

      {/* Thông báo thao tác */}
      {notificationMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 animate-fadeIn">
          <i className="fa-solid fa-circle-check text-lg" />
          <span className="font-medium">{notificationMsg}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-ink-card p-4 rounded-2xl border border-ink-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 text-xl shrink-0">
            <i className="fa-solid fa-triangle-exclamation animate-bounce" />
          </div>
          <div>
            <div className="text-2xl font-bold text-ink-text">{stats?.reportedCount ?? 0}</div>
            <div className="text-xs text-ink-muted">Báo cáo chờ xử lý</div>
          </div>
        </div>

        <div className="bg-ink-card p-4 rounded-2xl border border-ink-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl shrink-0">
            <i className="fa-solid fa-eye-slash" />
          </div>
          <div>
            <div className="text-2xl font-bold text-ink-text">{stats?.hiddenCount ?? 0}</div>
            <div className="text-xs text-ink-muted">Bình luận đã ẩn</div>
          </div>
        </div>

        <div className="bg-ink-card p-4 rounded-2xl border border-ink-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 text-xl shrink-0">
            <i className="fa-solid fa-user-slash" />
          </div>
          <div>
            <div className="text-2xl font-bold text-ink-text">{stats?.restrictedUsersCount ?? 0}</div>
            <div className="text-xs text-ink-muted">Tài khoản bị khóa quyền</div>
          </div>
        </div>

        <div className="bg-ink-card p-4 rounded-2xl border border-ink-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl shrink-0">
            <i className="fa-solid fa-comments" />
          </div>
          <div>
            <div className="text-2xl font-bold text-ink-text">{stats?.visibleCount ?? 0}</div>
            <div className="text-xs text-ink-muted">Bình luận hợp lệ</div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-ink-card p-4 rounded-2xl border border-ink-border space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-ink-bg p-1 rounded-xl border border-ink-border text-xs font-medium">
            <button
              onClick={() => { setStatusFilter("reported"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "reported"
                  ? "bg-rose-500/20 text-rose-400 font-bold border border-rose-500/30"
                  : "text-ink-muted hover:text-ink-text"
              }`}
            >
              <i className="fa-solid fa-flag" />
              Chờ xử lý ({stats?.reportedCount ?? 0})
            </button>
            <button
              onClick={() => { setStatusFilter("hidden"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "hidden"
                  ? "bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30"
                  : "text-ink-muted hover:text-ink-text"
              }`}
            >
              <i className="fa-solid fa-eye-slash" />
              Đã ẩn ({stats?.hiddenCount ?? 0})
            </button>
            <button
              onClick={() => { setStatusFilter("visible"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "visible"
                  ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30"
                  : "text-ink-muted hover:text-ink-text"
              }`}
            >
              <i className="fa-solid fa-check" />
              Hợp lệ
            </button>
            <button
              onClick={() => { setStatusFilter("all"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "all"
                  ? "bg-gold/20 text-gold font-bold border border-gold/30"
                  : "text-ink-muted hover:text-ink-text"
              }`}
            >
              Tất cả
            </button>
          </div>

          {/* Search Box */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm kiếm nội dung bình luận, người gửi, email hoặc tên truyện..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 pl-8 rounded-xl bg-ink-bg border border-ink-border text-ink-text text-xs focus:outline-none focus:border-gold/50"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted text-xs" />
          </div>
        </div>
      </div>

      {/* Main Content List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="bg-ink-card rounded-2xl border border-ink-border p-12 text-center text-ink-muted">
            <i className="fa-solid fa-spinner fa-spin text-2xl mb-3 text-gold" />
            <p className="text-sm">Đang tải danh sách bình luận bị báo cáo...</p>
          </div>
        ) : error ? (
          <div className="bg-ink-card rounded-2xl border border-ink-border p-8 text-center text-rose-400">
            <i className="fa-solid fa-triangle-exclamation text-2xl mb-2" />
            <p className="text-sm">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-ink-card rounded-2xl border border-ink-border p-12 text-center text-ink-muted">
            <i className="fa-solid fa-shield-check text-4xl mb-3 text-emerald-400/60" />
            <p className="text-base font-bold text-ink-text">Không có bình luận nào cần xử lý!</p>
            <p className="text-xs opacity-75 mt-1">Cộng đồng người đọc StoryReader đang thảo luận rất lành mạnh và văn minh.</p>
          </div>
        ) : (
          items.map((comment: ReportedCommentItem) => (
            <div
              key={comment.id}
              className={`bg-ink-card rounded-2xl border p-5 transition-all space-y-4 shadow-xs ${
                comment.status === 2
                  ? "border-rose-500/40 bg-rose-950/10"
                  : comment.status === 1
                  ? "border-amber-500/30 bg-amber-950/10"
                  : "border-ink-border hover:border-gold/30"
              }`}
            >
              {/* Row 1: Header (User Info + Location + Status Badge) */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-border/50 pb-3">
                {/* Người gửi */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 border border-ink-border flex items-center justify-center font-bold text-amber-400 text-sm shrink-0">
                    {comment.userName ? comment.userName.charAt(0).toUpperCase() : "U"}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink-text text-sm">{comment.userName || "Độc giả"}</span>
                      {comment.isUserRestricted && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold flex items-center gap-1">
                          <i className="fa-solid fa-user-lock" />
                          Tài khoản bị khóa
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-ink-muted">{comment.userEmail || "Không có email"}</div>
                  </div>
                </div>

                {/* Vị trí truyện + chương */}
                <div className="flex items-center gap-3 text-xs">
                  <img
                    src={comment.storyCoverImageUrl || "https://placehold.co/40x55?text=Cover"}
                    alt={comment.storyTitle}
                    className="w-7 h-9 rounded object-cover border border-ink-border shrink-0"
                  />
                  <div>
                    <a
                      href={`/stories/${comment.storyId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="font-medium text-ink-text hover:text-gold transition-colors line-clamp-1 max-w-[200px]"
                    >
                      {comment.storyTitle}
                    </a>
                    <a
                      href={`/chapters/${comment.chapterId}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-ink-muted hover:text-amber-400 transition-colors flex items-center gap-1 mt-0.5"
                    >
                      <span>Chương {comment.chapterNumber}: {comment.chapterTitle}</span>
                      <i className="fa-solid fa-arrow-up-right-from-square text-[10px]" />
                    </a>
                  </div>

                  {/* Status Badge */}
                  <div className="ml-2 shrink-0">
                    {comment.status === 2 && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 font-bold animate-pulse">
                        <i className="fa-solid fa-flag text-[10px]" />
                        Bị Báo Cáo ({comment.reportCount || 1})
                      </span>
                    )}
                    {comment.status === 1 && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-medium">
                        <i className="fa-solid fa-eye-slash text-[10px]" />
                        Đã Ẩn
                      </span>
                    )}
                    {comment.status === 0 && (
                      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-medium">
                        <i className="fa-solid fa-check text-[10px]" />
                        Hợp Lệ
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Row 2: Nội dung bình luận */}
              <div className="p-3.5 rounded-xl bg-ink-bg border border-ink-border/80">
                <div className="text-xs text-ink-muted mb-1 flex items-center justify-between">
                  <span className="font-semibold text-ink-muted uppercase tracking-wider text-[10px]">
                    Nội dung bình luận:
                  </span>
                  <span className="font-mono text-[11px]">{formatDate(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-ink-text font-normal leading-relaxed break-words">
                  "{comment.content}"
                </p>
              </div>

              {/* Row 3: Lý do báo cáo (nếu có) */}
              {comment.reportReason && (
                <div className="flex items-start gap-2.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/25 p-2.5 rounded-xl">
                  <i className="fa-solid fa-triangle-exclamation text-sm shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Lý do báo cáo: </span>
                    <span>{comment.reportReason}</span>
                  </div>
                </div>
              )}

              {/* Row 4: Hành động xử lý */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                {/* Nút Duyệt / Giữ lại */}
                {comment.status !== 0 && (
                  <button
                    onClick={() => approveMutation.mutate(comment.id)}
                    disabled={approveMutation.isPending}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-check" />
                    Duyệt hợp lệ
                  </button>
                )}

                {/* Nút Ẩn bình luận */}
                {comment.status !== 1 && (
                  <button
                    onClick={() => hideMutation.mutate(comment.id)}
                    disabled={hideMutation.isPending}
                    className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-eye-slash" />
                    Ẩn bình luận
                  </button>
                )}

                {/* Nút Khóa tài khoản người dùng */}
                {!comment.isUserRestricted && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Bạn có chắc muốn KHÓA quyền bình luận của người dùng "${comment.userName}"?`)) {
                        restrictMutation.mutate(comment.id);
                      }
                    }}
                    disabled={restrictMutation.isPending}
                    className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-user-lock" />
                    Khóa tài khoản
                  </button>
                )}

                {/* Nút Xóa vĩnh viễn */}
                <button
                  onClick={() => {
                    if (window.confirm("Bình luận sẽ bị XÓA VĨNH VIỄN khỏi database. Bạn có chắc chắn?")) {
                      deleteMutation.mutate(comment.id);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-trash" />
                  Xóa
                </button>
              </div>
            </div>
          ))
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-ink-card p-4 rounded-2xl border border-ink-border flex items-center justify-between text-xs text-ink-muted">
            <div>
              Trang <span className="font-semibold text-ink-text">{page}</span> / {totalPages} (Tổng số {totalCount} bình luận)
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2.5 py-1.5 rounded-lg bg-ink-bg border border-ink-border disabled:opacity-40 hover:bg-ink-card transition-colors cursor-pointer"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2.5 py-1.5 rounded-lg bg-ink-bg border border-ink-border disabled:opacity-40 hover:bg-ink-card transition-colors cursor-pointer"
              >
                Sau
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
