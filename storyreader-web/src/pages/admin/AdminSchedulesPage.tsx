import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getScheduledChapters,
  publishChapterNow,
  rescheduleChapter,
  cancelSchedule,
  type ScheduledChapterItem,
} from "../../api/adminSchedules";
import { searchStories, type StoryListItem } from "../../api/stories";

function formatDateTime(dateStr: string | null): string {
  if (!dateStr) return "Chưa hẹn giờ";
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

function getTimeRemaining(publishAt: string | null): { text: string; color: string } {
  if (!publishAt) return { text: "Không có lịch", color: "text-ink-muted" };
  const target = new Date(publishAt).getTime();
  const now = Date.now();
  const diffMs = target - now;

  if (diffMs <= 0) {
    return { text: "Đến giờ xuất bản", color: "text-emerald-400" };
  }

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    const hours = diffHours % 24;
    return {
      text: `Còn ${diffDays} ngày ${hours > 0 ? `${hours} giờ` : ""}`,
      color: "text-ink-text",
    };
  }
  if (diffHours > 0) {
    const mins = diffMin % 60;
    return {
      text: `Còn ${diffHours} giờ ${mins > 0 ? `${mins} phút` : ""}`,
      color: "text-amber-400",
    };
  }
  return {
    text: `Còn ${diffMin} phút`,
    color: "text-rose-400 font-semibold",
  };
}

export default function AdminSchedulesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"pending" | "published" | "all">("pending");
  const [storyFilter, setStoryFilter] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  const [selectedChapter, setSelectedChapter] = useState<ScheduledChapterItem | null>(null);
  const [newPublishAt, setNewPublishAt] = useState<string>("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Lấy danh sách lịch đăng
  const { data, isLoading, error } = useQuery({
    queryKey: ["adminSchedules", statusFilter, storyFilter, keyword, page],
    queryFn: () =>
      getScheduledChapters({
        status: statusFilter,
        storyId: storyFilter || undefined,
        search: keyword.trim() || undefined,
        page,
        pageSize,
      }),
  });

  // Lấy danh mục truyện để hiển thị bộ lọc dropdown
  const { data: storiesData } = useQuery({
    queryKey: ["storiesDropdown"],
    queryFn: () => searchStories(),
  });

  // Mutation: Đăng ngay
  const publishNowMutation = useMutation({
    mutationFn: (chapterId: string) => publishChapterNow(chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
      showNotification("Đã xuất bản chương thành công");
    },
  });

  // Mutation: Đổi lịch
  const rescheduleMutation = useMutation({
    mutationFn: ({ chapterId, publishAt }: { chapterId: string; publishAt: string | null }) =>
      rescheduleChapter(chapterId, publishAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
      setSelectedChapter(null);
      showNotification("Đã cập nhật lịch đăng chương thành công");
    },
  });

  // Mutation: Hủy lịch
  const cancelMutation = useMutation({
    mutationFn: (chapterId: string) => cancelSchedule(chapterId, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
      showNotification("Đã hủy lịch hẹn và xuất bản chương");
    },
  });

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 3500);
  };

  const handleOpenRescheduleModal = (chap: ScheduledChapterItem) => {
    setSelectedChapter(chap);
    if (chap.publishAt) {
      const d = new Date(chap.publishAt);
      const localIso = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setNewPublishAt(localIso);
    } else {
      const tomorrow = new Date(Date.now() + 24 * 3600 * 1000);
      const localIso = new Date(tomorrow.getTime() - tomorrow.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
      setNewPublishAt(localIso);
    }
  };

  const setQuickTime = (hoursFromNow: number) => {
    const target = new Date(Date.now() + hoursFromNow * 3600 * 1000);
    const localIso = new Date(target.getTime() - target.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
    setNewPublishAt(localIso);
  };

  const stats = data?.stats;
  const items = data?.items || [];
  const totalCount = data?.totalCount || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="space-y-6">
      {/* Toast Notification (Floating) */}
      {actionSuccessMsg && (
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900/95 border border-ink-border text-ink-text shadow-2xl flex items-center gap-3 backdrop-blur-md animate-fadeIn">
          <i className="fa-solid fa-circle-check text-emerald-400 text-sm" />
          <span className="text-xs font-medium">{actionSuccessMsg}</span>
          <button
            onClick={() => setActionSuccessMsg(null)}
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
            Lịch Đăng Truyện
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Lập lịch và tự động xuất bản các chương truyện theo thời gian hẹn.
          </p>
        </div>
      </div>

      {/* Metrics Row - Clean, Professional SaaS Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-ink-card border border-ink-border rounded-xl p-4 transition-colors hover:border-ink-border-light">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Chờ xuất bản</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs">
              <i className="fa-regular fa-clock" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ink-text tracking-tight">
            {stats?.pendingCount ?? 0}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">Chương đang đếm ngược</div>
        </div>

        <div className="bg-ink-card border border-ink-border rounded-xl p-4 transition-colors hover:border-ink-border-light">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Đã xuất bản hôm nay</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-cloud-arrow-up" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ink-text tracking-tight">
            {stats?.publishedTodayCount ?? 0}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">Chương hoàn tất xuất bản</div>
        </div>

        <div className="bg-ink-card border border-ink-border rounded-xl p-4 transition-colors hover:border-ink-border-light">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Bộ truyện có lịch</span>
            <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-book-bookmark" />
            </div>
          </div>
          <div className="text-2xl font-bold text-ink-text tracking-tight">
            {stats?.storiesCount ?? 0}
          </div>
          <div className="text-[11px] text-ink-muted mt-1">Tác phẩm có chương hẹn giờ</div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-ink-card border border-ink-border rounded-xl p-4 sm:p-5 space-y-4">
        {/* Navigation Tabs, Dropdown & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-ink-border pb-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
            <button
              onClick={() => { setStatusFilter("pending"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "pending"
                  ? "bg-ink-border text-ink-text font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink-text hover:bg-ink-bg"
              }`}
            >
              Chờ đăng
              {(stats?.pendingCount ?? 0) > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-500/20 text-amber-400 font-bold">
                  {stats?.pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setStatusFilter("published"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "published"
                  ? "bg-ink-border text-ink-text font-semibold shadow-xs"
                  : "text-ink-muted hover:text-ink-text hover:bg-ink-bg"
              }`}
            >
              Đã xuất bản
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

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <select
              value={storyFilter}
              onChange={(e) => { setStoryFilter(e.target.value); setPage(1); }}
              aria-label="Chọn truyện để lọc lịch đăng"
              className="w-full sm:w-56 px-3 py-1.5 rounded-lg bg-ink-bg border border-ink-border text-ink-text text-xs focus:outline-none focus:border-gold/50"
            >
              <option value="">-- Tất cả các truyện --</option>
              {storiesData?.map((s: StoryListItem) => (
                <option key={s.id} value={s.id}>
                  {s.title}
                </option>
              ))}
            </select>

            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="Tìm tiêu đề chương, truyện..."
                value={keyword}
                onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
                className="w-full px-3 py-1.5 pl-8 rounded-lg bg-ink-bg border border-ink-border text-ink-text text-xs placeholder:text-ink-muted/50 focus:outline-none focus:border-gold/50"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted text-xs" />
            </div>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-12 text-center text-ink-muted">
            <i className="fa-solid fa-circle-notch fa-spin text-xl text-gold mb-2" />
            <p className="text-xs">Đang tải danh sách lịch đăng...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-6 text-center text-rose-400">
            <i className="fa-solid fa-circle-exclamation text-xl mb-1.5" />
            <p className="text-xs">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-ink-border p-12 text-center text-ink-muted">
            <div className="w-10 h-10 rounded-full bg-ink-bg border border-ink-border flex items-center justify-center mx-auto mb-3 text-ink-muted/60">
              <i className="fa-regular fa-calendar-xmark text-base" />
            </div>
            <p className="text-sm font-semibold text-ink-text">Không có chương nào trong danh sách</p>
            <p className="text-xs text-ink-muted mt-1">Chưa có chương truyện nào được lên lịch hẹn trong mục này.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-ink-bg border-b border-ink-border text-[11px] uppercase text-ink-muted font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Truyện</th>
                  <th className="py-3 px-4">Chương</th>
                  <th className="py-3 px-4">Lịch Hẹn Xuất Bản</th>
                  <th className="py-3 px-4">Thời Gian Còn Lại</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ink-border/50">
                {items.map((chap) => {
                  const remaining = getTimeRemaining(chap.publishAt);
                  return (
                    <tr key={chap.id} className="hover:bg-ink-bg/50 transition-colors">
                      {/* Cột Truyện */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={chap.storyCoverImageUrl || "https://placehold.co/40x55?text=Cover"}
                            alt={chap.storyTitle}
                            className="w-8 h-10 rounded object-cover border border-ink-border shrink-0"
                          />
                          <div className="min-w-0">
                            <a
                              href={`/stories/${chap.storyId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-ink-text hover:text-gold transition-colors line-clamp-1"
                            >
                              {chap.storyTitle}
                            </a>
                            <span className="inline-block text-[10px] text-ink-muted">
                              {chap.storyType === 1 ? "Truyện tranh" : "Truyện chữ"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cột Chương */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-ink-text">
                          Chương {chap.chapterNumber}
                        </div>
                        <div className="text-[11px] text-ink-muted line-clamp-1">{chap.title}</div>
                      </td>

                      {/* Cột Thời Gian Hẹn */}
                      <td className="py-3 px-4 font-mono text-ink-text">
                        {formatDateTime(chap.publishAt)}
                      </td>

                      {/* Cột Đếm Ngược */}
                      <td className="py-3 px-4">
                        <span className={`flex items-center gap-1.5 ${remaining.color}`}>
                          <i className="fa-regular fa-clock text-[10px]" />
                          {remaining.text}
                        </span>
                      </td>

                      {/* Cột Trạng Thái */}
                      <td className="py-3 px-4">
                        {chap.isPublished ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                            <i className="fa-solid fa-check text-[9px]" />
                            Đã xuất bản
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium">
                            <i className="fa-regular fa-clock text-[9px]" />
                            Chờ đến giờ
                          </span>
                        )}
                      </td>

                      {/* Cột Thao Tác */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!chap.isPublished && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Bạn có chắc muốn xuất bản ngay "Chương ${chap.chapterNumber}: ${chap.title}"?`)) {
                                  publishNowMutation.mutate(chap.id);
                                }
                              }}
                              disabled={publishNowMutation.isPending}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                              title="Xuất bản ngay lập tức"
                            >
                              <i className="fa-solid fa-bolt text-[10px]" />
                              Đăng ngay
                            </button>
                          )}

                          <button
                            onClick={() => handleOpenRescheduleModal(chap)}
                            className="px-2.5 py-1 rounded-lg bg-ink-bg hover:bg-ink-border text-ink-text border border-ink-border text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                            title="Đổi ngày giờ xuất bản"
                          >
                            <i className="fa-regular fa-calendar text-[10px]" />
                            Đổi lịch
                          </button>

                          {!chap.isPublished && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Hủy lịch hẹn sẽ cho phép độc giả đọc chương này ngay lập tức. Tiếp tục?`)) {
                                  cancelMutation.mutate(chap.id);
                                }
                              }}
                              className="p-1 rounded-lg bg-ink-bg hover:bg-rose-500/20 text-ink-muted hover:text-rose-400 border border-ink-border text-xs transition-colors cursor-pointer"
                              title="Hủy lịch hẹn (xuất bản ngay)"
                            >
                              <i className="fa-solid fa-ban text-xs" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="pt-2 border-t border-ink-border flex items-center justify-between text-xs text-ink-muted">
            <div>
              Trang <span className="font-semibold text-ink-text">{page}</span> / {totalPages} (Tổng số {totalCount} chương)
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

      {/* Modal Đổi Lịch Hẹn */}
      {selectedChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-ink-card border border-ink-border rounded-xl w-full max-w-md p-5 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-ink-border pb-3">
              <h3 className="font-semibold text-sm text-ink-text flex items-center gap-2">
                <i className="fa-regular fa-calendar-check text-amber-500" />
                Cập nhật Lịch Đăng Chương
              </h3>
              <button
                onClick={() => setSelectedChapter(null)}
                className="text-ink-muted hover:text-ink-text cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-base" />
              </button>
            </div>

            <div className="text-xs space-y-1 bg-ink-bg p-3 rounded-lg border border-ink-border">
              <div className="font-medium text-ink-text">
                {selectedChapter.storyTitle}
              </div>
              <div className="text-ink-muted">
                Chương {selectedChapter.chapterNumber}: {selectedChapter.title}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-ink-muted">
                Thời gian xuất bản mới:
              </label>
              <input
                type="datetime-local"
                value={newPublishAt}
                onChange={(e) => setNewPublishAt(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-ink-bg border border-ink-border text-ink-text text-xs focus:outline-none focus:border-gold"
              />
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] text-ink-muted">Chọn nhanh mốc thời gian:</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickTime(1)}
                  className="px-2 py-1 rounded bg-ink-bg hover:bg-ink-border border border-ink-border text-[11px] text-ink-muted hover:text-ink-text cursor-pointer transition-colors"
                >
                  +1 giờ
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime(6)}
                  className="px-2 py-1 rounded bg-ink-bg hover:bg-ink-border border border-ink-border text-[11px] text-ink-muted hover:text-ink-text cursor-pointer transition-colors"
                >
                  +6 giờ
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime(24)}
                  className="px-2 py-1 rounded bg-ink-bg hover:bg-ink-border border border-ink-border text-[11px] text-ink-muted hover:text-ink-text cursor-pointer transition-colors"
                >
                  +1 ngày
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime(72)}
                  className="px-2 py-1 rounded bg-ink-bg hover:bg-ink-border border border-ink-border text-[11px] text-ink-muted hover:text-ink-text cursor-pointer transition-colors"
                >
                  +3 ngày
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-ink-border">
              <button
                type="button"
                onClick={() => setSelectedChapter(null)}
                className="px-3 py-1.5 rounded-lg border border-ink-border bg-ink-bg text-ink-muted hover:text-ink-text text-xs transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!newPublishAt) {
                    alert("Vui lòng chọn ngày giờ xuất bản hợp lệ.");
                    return;
                  }
                  const isoStr = new Date(newPublishAt).toISOString();
                  rescheduleMutation.mutate({
                    chapterId: selectedChapter.id,
                    publishAt: isoStr,
                  });
                }}
                disabled={rescheduleMutation.isPending}
                className="px-4 py-1.5 rounded-lg bg-orange-600 hover:bg-orange-700 text-white text-xs font-medium transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                Lưu lịch hẹn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
