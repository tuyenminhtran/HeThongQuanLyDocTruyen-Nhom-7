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
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white shadow-2xl flex items-center gap-3 backdrop-blur-md animate-fadeIn">
          <i className="fa-solid fa-circle-check text-emerald-400 text-sm" />
          <span className="text-xs font-medium">{notificationMsg}</span>
          <button
            onClick={() => setNotificationMsg(null)}
            className="text-slate-400 hover:text-white ml-2 text-xs cursor-pointer"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-slate-900 font-bold">
            Kiểm duyệt Bình luận
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Xử lý và kiểm duyệt các bình luận do người dùng báo cáo vi phạm tiêu chuẩn cộng đồng.
          </p>
        </div>
      </div>

      {/* Metrics Row - Clean, Professional SaaS Style */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-ink-card border border-ink-border rounded-xl p-4 transition-colors hover:border-slate-300 shadow-xs">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chờ xử lý</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-xs border border-rose-100">
              <i className="fa-solid fa-flag" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats?.reportedCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Báo cáo chưa duyệt</div>
        </div>

        <div className="bg-ink-card border border-ink-border rounded-xl p-4 transition-colors hover:border-slate-300 shadow-xs">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Đã ẩn</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs border border-amber-100">
              <i className="fa-solid fa-eye-slash" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats?.hiddenCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Bình luận tạm ẩn</div>
        </div>

        <div className="bg-ink-card border border-ink-border rounded-xl p-4 transition-colors hover:border-slate-300 shadow-xs">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tài khoản bị khóa</span>
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-xs border border-purple-100">
              <i className="fa-solid fa-user-slash" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats?.restrictedUsersCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Vi phạm tiêu chuẩn</div>
        </div>

        <div className="bg-ink-card border border-ink-border rounded-xl p-4 transition-colors hover:border-slate-300 shadow-xs">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Hợp lệ</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs border border-emerald-100">
              <i className="fa-solid fa-check" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats?.visibleCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Bình luận giữ lại</div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-ink-card border border-ink-border rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
        {/* Navigation Tabs & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-ink-border pb-3">
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
            <button
              onClick={() => { setStatusFilter("reported"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "reported"
                  ? "bg-slate-100 text-slate-900 font-semibold border border-slate-200 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Chờ xử lý
              {(stats?.reportedCount ?? 0) > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-rose-100 text-rose-700 font-bold border border-rose-200">
                  {stats?.reportedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setStatusFilter("hidden"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "hidden"
                  ? "bg-slate-100 text-slate-900 font-semibold border border-slate-200 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Đã ẩn
              {(stats?.hiddenCount ?? 0) > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-700 font-bold border border-amber-200">
                  {stats?.hiddenCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setStatusFilter("visible"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "visible"
                  ? "bg-slate-100 text-slate-900 font-semibold border border-slate-200 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Hợp lệ
            </button>
            <button
              onClick={() => { setStatusFilter("all"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "all"
                  ? "bg-slate-100 text-slate-900 font-semibold border border-slate-200 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
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
              className="w-full px-3 py-1.5 pl-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
          </div>
        </div>

        {/* Content List */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <i className="fa-solid fa-circle-notch fa-spin text-xl text-orange-600 mb-2" />
            <p className="text-xs">Đang tải danh sách bình luận...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600">
            <i className="fa-solid fa-circle-exclamation text-xl mb-1.5" />
            <p className="text-xs">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <i className="fa-regular fa-folder-open text-base" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Không có bình luận nào</p>
            <p className="text-xs text-slate-500 mt-1">Chưa có bình luận hoặc báo cáo vi phạm cần xử lý trong mục này.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((comment: ReportedCommentItem) => (
              <div
                key={comment.id}
                className="bg-white border border-slate-200 rounded-xl p-4 transition-all space-y-3 hover:border-slate-300 shadow-xs"
              >
                {/* Header: User Info & Story Location */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs shrink-0">
                      {comment.userName ? comment.userName.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 text-xs">{comment.userName || "Độc giả"}</span>
                        {comment.isUserRestricted && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-medium">
                            Đã khóa
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{comment.userEmail || "Không có email"}</div>
                    </div>
                  </div>

                  {/* Story & Chapter Location + Badge */}
                  <div className="flex items-center gap-3 text-xs">
                    <div className="text-right">
                      <a
                        href={`/stories/${comment.storyId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-slate-900 hover:text-orange-600 transition-colors line-clamp-1 max-w-[200px]"
                      >
                        {comment.storyTitle}
                      </a>
                      <a
                        href={`/chapters/${comment.chapterId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-500 hover:text-orange-600 transition-colors flex items-center justify-end gap-1 text-[11px] mt-0.5"
                      >
                        <span>Chương {comment.chapterNumber}: {comment.chapterTitle}</span>
                        <i className="fa-solid fa-arrow-up-right-from-square text-[9px]" />
                      </a>
                    </div>

                    <div className="shrink-0">
                      {comment.status === 2 && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                          Bị báo cáo ({comment.reportCount || 1})
                        </span>
                      )}
                      {comment.status === 1 && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                          Đã ẩn
                        </span>
                      )}
                      {comment.status === 0 && (
                        <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          Hợp lệ
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Comment Content */}
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div className="text-[11px] text-slate-500 mb-1 flex items-center justify-between">
                    <span className="font-medium text-slate-600">Nội dung bình luận</span>
                    <span className="font-mono text-[10px] text-slate-400">{formatDate(comment.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-800 font-normal leading-relaxed break-words">
                    "{comment.content}"
                  </p>
                </div>

                {/* Report Reason (if any) */}
                {comment.reportReason && (
                  <div className="flex items-start gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg">
                    <i className="fa-solid fa-circle-exclamation text-xs mt-0.5 shrink-0 text-rose-600" />
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
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
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
                    className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
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
