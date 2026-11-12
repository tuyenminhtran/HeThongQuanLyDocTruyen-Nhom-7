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
    setTimeout(() => setNotificationMsg(null), 3500);
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
      showNotification("Đã duyệt bình luận hợp lệ");
    },
  });

  // Mutation: Ẩn bình luận
  const hideMutation = useMutation({
    mutationFn: hideReportedComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReportedComments"] });
      showNotification("Đã ẩn bình luận khỏi chương truyện");
    },
  });

  // Mutation: Xóa vĩnh viễn
  const deleteMutation = useMutation({
    mutationFn: deleteReportedComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReportedComments"] });
      showNotification("Đã xóa vĩnh viễn bình luận");
    },
  });

  // Mutation: Khóa tài khoản
  const restrictMutation = useMutation({
    mutationFn: restrictUserFromComment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminReportedComments"] });
      showNotification("Đã khóa quyền bình luận của người dùng");
    },
  });

  const stats = data?.stats;
  const items = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Toast Notification (Floating) */}
      {notificationMsg && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900/95 border border-ink-border text-ink-text shadow-2xl flex items-center gap-3 backdrop-blur-md animate-fadeIn">
          <i className="fa-solid fa-circle-check text-emerald-400 text-sm" />
          <span className="text-xs font-medium">{notificationMsg}</span>
          <button
            onClick={() => setNotificationMsg(null)}
            className="text-ink-muted hover:text-ink-text ml-2 text-xs cursor-pointer"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink-text font-bold">
            Kiểm duyệt Bình luận
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Xử lý và kiểm duyệt các bình luận do người dùng báo cáo vi phạm.
          </p>
        </div>
      </div>

      {/* Metrics Row - Clean, Professional SaaS Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-ink-card border border-ink-border rounded-xl p-4 transition-colors hover:border-ink-border-light">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Chờ xử lý</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-flag" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ink-text tracking-tight">
            {stats?.reportedCount ?? 0}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">Báo cáo chưa duyệt</div>
        </div>

        <div className="bg-ink-card border border-ink-border rounded-xl p-4 transition-colors hover:border-ink-border-light">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Đã ẩn</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-eye-slash" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ink-text tracking-tight">
            {stats?.hiddenCount ?? 0}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">Bình luận tạm ẩn</div>
        </div>

        <div className="bg-ink-card border border-ink-border rounded-xl p-4 transition-colors hover:border-ink-border-light">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Tài khoản bị khóa</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-user-slash" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ink-text tracking-tight">
            {stats?.restrictedUsersCount ?? 0}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">Vi phạm tiêu chuẩn</div>
        </div>

        <div className="bg-ink-card border border-ink-border rounded-xl p-4 transition-colors hover:border-ink-border-light">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Hợp lệ</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-check" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ink-text tracking-tight">
            {stats?.visibleCount ?? 0}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">Bình luận giữ lại</div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-ink-card border border-ink-border rounded-xl p-4 sm:p-5 space-y-4">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-border pb-3">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
            <button
              onClick={() => { setStatusFilter("reported"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "reported"
                  ? "bg-ink-border text-ink-text font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink-text hover:bg-ink-bg"
              }`}
            >
              Chờ xử lý
              {(stats?.reportedCount ?? 0) > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-500/20 text-rose-400 font-bold">
                  {stats?.reportedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setStatusFilter("hidden"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "hidden"
                  ? "bg-ink-border text-ink-text font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink-text hover:bg-ink-bg"
              }`}
            >
              Đã ẩn
              {(stats?.hiddenCount ?? 0) > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-400 font-bold">
                  {stats?.hiddenCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setStatusFilter("visible"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "visible"
                  ? "bg-ink-border text-ink-text font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink-text hover:bg-ink-bg"
              }`}
            >
              Hợp lệ
            </button>
            <button
              onClick={() => { setStatusFilter("all"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "all"
                  ? "bg-ink-border text-ink-text font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink-text hover:bg-ink-bg"
              }`}
            >
              Tất cả
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Tìm kiếm nội dung, người gửi..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 pl-8 rounded-lg bg-ink-bg border border-ink-border text-ink-text text-xs placeholder:text-ink-muted/50 focus:outline-none focus:border-gold/50"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted text-xs" />
          </div>
        </div>

        {/* Content List */}
        {isLoading ? (
          <div className="p-12 text-center text-ink-muted">
            <i className="fa-solid fa-circle-notch fa-spin text-xl text-gold mb-2" />
            <p className="text-xs">Đang tải danh sách bình luận...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-6 text-center text-rose-400">
            <i className="fa-solid fa-circle-exclamation text-xl mb-1.5" />
            <p className="text-xs">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-border p-12 text-center text-ink-muted">
            <div className="w-10 h-10 rounded-full bg-ink-bg border border-ink-border flex items-center justify-center mx-auto mb-3 text-ink-muted/60">
              <i className="fa-regular fa-folder-open text-base" />
            </div>
            <p className="text-sm font-semibold text-ink-text">Không có bình luận nào</p>
            <p className="text-xs text-ink-muted mt-1">Chưa có bình luận hoặc báo cáo vi phạm cần xử lý trong mục này.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((comment: ReportedCommentItem) => (
              <div
                key={comment.id}
                className="bg-ink-bg border border-ink-border rounded-xl p-4 transition-all space-y-3 hover:border-ink-border-light"
              >
                {/* Header: User Info & Story Location */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-ink-border/50 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-ink-border flex items-center justify-center font-bold text-amber-400 text-xs shrink-0">
                      {comment.userName ? comment.userName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ink-text text-xs">{comment.userName || "Độc giả"}</span>
                        {comment.isUserRestricted && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-medium">
                            Đã khóa
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-ink-muted">{comment.userEmail || "Không có email"}</div>
                    </div>
                  </div>

                  {/* Story & Chapter Location + Badge */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="text-right">
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
                        className="text-ink-muted hover:text-amber-400 transition-colors flex items-center justify-end gap-1 text-[11px] mt-0.5"
                      >
                        <span>Chương {comment.chapterNumber}: {comment.chapterTitle}</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" />
                      </a>
                    </div>

                    <div className="shrink-0">
                      {comment.status === 2 && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 font-semibold">
                          Bị báo cáo ({comment.reportCount || 1})
                        </span>
                      )}
                      {comment.status === 1 && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium">
                          Đã ẩn
                        </span>
                      )}
                      {comment.status === 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                          Hợp lệ
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="p-3 rounded-lg bg-ink-card border border-ink-border">
                  <div className="text-[11px] text-ink-muted mb-1 flex items-center justify-between">
                    <span className="font-medium text-ink-muted">Nội dung bình luận</span>
                    <span className="font-mono text-[10px]">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-xs text-ink-text font-normal leading-relaxed break-words">
                    "{comment.content}"
                  </p>
                </div>

                {/* Report Reason (if any) */}
                {comment.reportReason && (
                  <div className="flex items-start gap-2 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-lg">
                    <i className="fa-solid fa-circle-exclamation text-xs mt-0.5 shrink-0" />
                    <div>
                      <span className="font-semibold">Lý do báo cáo: </span>
                      <span>{comment.reportReason}</span>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-2 pt-1">
                  {comment.status !== 0 && (
                    <button
                      onClick={() => approveMutation.mutate(comment.id)}
                      disabled={approveMutation.isPending}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <i className="fa-solid fa-check text-xs" />
                      Duyệt hợp lệ
                    </button>
                  )}

                  {comment.status !== 1 && (
                    <button
                      onClick={() => hideMutation.mutate(comment.id)}
                      disabled={hideMutation.isPending}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <i className="fa-solid fa-eye-slash text-xs" />
                      Ẩn bình luận
                    </button>
                  )}

                  {!comment.isUserRestricted && (
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn khóa quyền bình luận của người dùng "${comment.userName || comment.userEmail}"?`)) {
                          restrictMutation.mutate(comment.userId);
                        }
                      }}
                      disabled={restrictMutation.isPending}
                      className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-user-slash text-xs" />
                      Khóa tài khoản
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (confirm("Bạn có chắc chắn muốn xóa vĩnh viễn bình luận này?")) {
                        deleteMutation.mutate(comment.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/30 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-trash text-xs" />
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-2 flex items-center justify-between text-xs text-ink-muted border-t border-ink-border">
            <div>
              Trang <span className="font-semibold text-ink-text">{page}</span> / {totalPages} (Tổng số {totalCount} bình luận)
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-2.5 py-1.5 rounded-lg bg-ink-bg border border-ink-border disabled:opacity-40 hover:bg-ink-border transition-colors cursor-pointer"
              >
                Trước
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-2.5 py-1.5 rounded-lg bg-ink-bg border border-ink-border disabled:opacity-40 hover:bg-ink-border transition-colors cursor-pointer"
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
