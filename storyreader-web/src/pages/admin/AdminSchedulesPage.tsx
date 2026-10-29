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
  if (!dateStr) return "Chưa đặt lịch";
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

function getTimeRemaining(targetDateStr: string | null): { text: string; isPast: boolean; color: string } {
  if (!targetDateStr) return { text: "Không có lịch", isPast: false, color: "text-ink-muted" };
  const target = new Date(targetDateStr).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return { text: "Đã đến giờ xuất bản", isPast: true, color: "text-emerald-400" };
  }

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return { text: `Còn ${days} ngày ${hours % 24} giờ`, isPast: false, color: "text-amber-400" };
  }
  if (hours > 0) {
    return { text: `Còn ${hours} giờ ${mins} phút`, isPast: false, color: "text-amber-400" };
  }
  return { text: `Còn ${mins} phút`, isPast: false, color: "text-orange-400" };
}

export default function AdminSchedulesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"pending" | "published" | "all">("pending");
  const [storyFilter, setStoryFilter] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const pageSize = 15;

  // State Modal Đổi Lịch Hẹn
  const [selectedChapter, setSelectedChapter] = useState<ScheduledChapterItem | null>(null);
  const [newPublishAt, setNewPublishAt] = useState<string>("");
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // Lấy danh sách truyện để làm bộ lọc
  const { data: storiesData } = useQuery({
    queryKey: ["allStoriesForFilter"],
    queryFn: () => searchStories(undefined, undefined, 100),
  });

  // Lấy danh sách chương theo lịch
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

  // Mutation: Xuất bản ngay
  const publishNowMutation = useMutation({
    mutationFn: publishChapterNow,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
      showNotification("Đã xuất bản chương truyện thành công!");
    },
  });

  // Mutation: Đổi lịch
  const rescheduleMutation = useMutation({
    mutationFn: ({ chapterId, publishAt }: { chapterId: string; publishAt: string | null }) =>
      rescheduleChapter(chapterId, publishAt),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
      setSelectedChapter(null);
      showNotification("Đã cập nhật lịch đăng chương thành công!");
    },
  });

  // Mutation: Hủy lịch
  const cancelMutation = useMutation({
    mutationFn: (chapterId: string) => cancelSchedule(chapterId, false),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminSchedules"] });
      showNotification("Đã hủy lịch hẹn và xuất bản chương ngay!");
    },
  });

  const showNotification = (msg: string) => {
    setActionSuccessMsg(msg);
    setTimeout(() => setActionSuccessMsg(null), 4000);
  };

  const handleOpenRescheduleModal = (chap: ScheduledChapterItem) => {
    setSelectedChapter(chap);
    if (chap.publishAt) {
      // Chuyển sang format YYYY-MM-DDTHH:mm cho input datetime-local
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl text-ink-text font-bold">
            Quản lý Đăng Truyện Theo Lịch
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Xếp lịch xuất bản trước cho các chương truyện chữ và truyện tranh, hệ thống sẽ tự động mở khóa theo đúng giờ hẹn.
          </p>
        </div>
      </div>

      {/* Thông báo thành công */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-3 animate-fadeIn">
          <i className="fa-solid fa-circle-check text-lg" />
          <span className="font-medium">{actionSuccessMsg}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-ink-card p-4 rounded-2xl border border-ink-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xl shrink-0">
            <i className="fa-solid fa-hourglass-half animate-pulse" />
          </div>
          <div>
            <div className="text-2xl font-bold text-ink-text">{stats?.pendingCount ?? 0}</div>
            <div className="text-xs text-ink-muted">Chương đang chờ đăng</div>
          </div>
        </div>

        <div className="bg-ink-card p-4 rounded-2xl border border-ink-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl shrink-0">
            <i className="fa-solid fa-cloud-arrow-up" />
          </div>
          <div>
            <div className="text-2xl font-bold text-ink-text">{stats?.publishedTodayCount ?? 0}</div>
            <div className="text-xs text-ink-muted">Chương lên sóng hôm nay</div>
          </div>
        </div>

        <div className="bg-ink-card p-4 rounded-2xl border border-ink-border flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 text-xl shrink-0">
            <i className="fa-solid fa-book-bookmark" />
          </div>
          <div>
            <div className="text-2xl font-bold text-ink-text">{stats?.storiesCount ?? 0}</div>
            <div className="text-xs text-ink-muted">Bộ truyện có lịch hẹn</div>
          </div>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-ink-card p-4 rounded-2xl border border-ink-border space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 bg-ink-bg p-1 rounded-xl border border-ink-border text-xs font-medium">
            <button
              onClick={() => { setStatusFilter("pending"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "pending"
                  ? "bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30"
                  : "text-ink-muted hover:text-ink-text"
              }`}
            >
              <i className="fa-regular fa-clock" />
              Chờ đăng ({stats?.pendingCount ?? 0})
            </button>
            <button
              onClick={() => { setStatusFilter("published"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "published"
                  ? "bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30"
                  : "text-ink-muted hover:text-ink-text"
              }`}
            >
              <i className="fa-solid fa-check" />
              Đã xuất bản
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

          {/* Chọn theo truyện */}
          <select
            value={storyFilter}
            onChange={(e) => { setStoryFilter(e.target.value); setPage(1); }}
            aria-label="Chọn truyện để lọc lịch đăng"
            className="px-3 py-1.5 rounded-xl bg-ink-bg border border-ink-border text-ink-text text-xs focus:outline-none focus:border-gold/50"
          >
            <option value="">-- Tất cả các truyện --</option>
            {storiesData?.map((s: StoryListItem) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>

          {/* Tìm kiếm */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề chương hoặc truyện..."
              value={keyword}
              onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
              className="w-full px-3 py-1.5 pl-8 rounded-xl bg-ink-bg border border-ink-border text-ink-text text-xs focus:outline-none focus:border-gold/50"
            />
            <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted text-xs" />
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-ink-card rounded-2xl border border-ink-border overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-ink-muted">
            <i className="fa-solid fa-spinner fa-spin text-2xl mb-3 text-gold" />
            <p className="text-sm">Đang tải danh sách lịch đăng truyện...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-400">
            <i className="fa-solid fa-triangle-exclamation text-2xl mb-2" />
            <p className="text-sm">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-ink-muted">
            <i className="fa-solid fa-calendar-xmark text-3xl mb-3 opacity-40" />
            <p className="text-sm font-medium">Không tìm thấy chương nào theo bộ lọc này.</p>
            <p className="text-xs opacity-75 mt-1">Khi bạn thêm chương mới và chọn ngày giờ hẹn, chương sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-ink-bg border-b border-ink-border text-xs uppercase text-ink-muted font-semibold tracking-wider">
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
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={chap.storyCoverImageUrl || "https://placehold.co/40x55?text=Cover"}
                            alt={chap.storyTitle}
                            className="w-9 h-12 rounded object-cover border border-ink-border shrink-0"
                          />
                          <div className="min-w-0">
                            <a
                              href={`/stories/${chap.storyId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-ink-text hover:text-gold transition-colors line-clamp-1 text-xs sm:text-sm"
                            >
                              {chap.storyTitle}
                            </a>
                            <span
                              className={`inline-block mt-1 text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                chap.storyType === 1
                                  ? "bg-sky-500/15 text-sky-400 border border-sky-500/30"
                                  : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              }`}
                            >
                              {chap.storyType === 1 ? "Truyện tranh" : "Truyện chữ"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cột Chương */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-ink-text text-xs sm:text-sm">
                          Chương {chap.chapterNumber}
                        </div>
                        <div className="text-xs text-ink-muted line-clamp-1">{chap.title}</div>
                      </td>

                      {/* Cột Thời Gian Hẹn */}
                      <td className="py-3.5 px-4 text-xs font-mono">
                        <div className="text-ink-text font-medium">{formatDateTime(chap.publishAt)}</div>
                      </td>

                      {/* Cột Đếm Ngược */}
                      <td className="py-3.5 px-4">
                        <span className={`text-xs font-medium flex items-center gap-1.5 ${remaining.color}`}>
                          <i className="fa-regular fa-clock text-[10px]" />
                          {remaining.text}
                        </span>
                      </td>

                      {/* Cột Trạng Thái */}
                      <td className="py-3.5 px-4">
                        {chap.isPublished ? (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-medium">
                            <i className="fa-solid fa-circle-check text-[10px]" />
                            Đã lên sóng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30 font-medium animate-pulse">
                            <i className="fa-solid fa-hourglass-half text-[10px]" />
                            Đang chờ đến giờ
                          </span>
                        )}
                      </td>

                      {/* Cột Thao Tác */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Nút Đăng Ngay */}
                          {!chap.isPublished && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Bạn có chắc muốn xuất bản ngay "Chương ${chap.chapterNumber}: ${chap.title}"?`)) {
                                  publishNowMutation.mutate(chap.id);
                                }
                              }}
                              disabled={publishNowMutation.isPending}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                              title="Xuất bản ngay lập tức"
                            >
                              <i className="fa-solid fa-bolt text-[10px]" />
                              Đăng ngay
                            </button>
                          )}

                          {/* Nút Đổi Lịch */}
                          <button
                            onClick={() => handleOpenRescheduleModal(chap)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
                            title="Đổi ngày giờ xuất bản"
                          >
                            <i className="fa-solid fa-calendar-pen text-[10px]" />
                            Đổi lịch
                          </button>

                          {/* Nút Hủy Lịch */}
                          {!chap.isPublished && (
                            <button
                              onClick={() => {
                                if (window.confirm(`Hủy lịch hẹn sẽ cho phép độc giả đọc chương này ngay lập tức. Tiếp tục?`)) {
                                  cancelMutation.mutate(chap.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-ink-bg hover:bg-rose-500/20 text-ink-muted hover:text-rose-400 border border-ink-border text-xs transition-colors cursor-pointer"
                              title="Hủy lịch hẹn (xuất bản ngay)"
                            >
                              <i className="fa-solid fa-ban" />
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
          <div className="p-4 border-t border-ink-border flex items-center justify-between text-xs text-ink-muted">
            <div>
              Trang <span className="font-semibold text-ink-text">{page}</span> / {totalPages} (Tổng số {totalCount} chương)
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

      {/* ============================================================ */}
      {/* MODAL ĐỔI LỊCH HẸN (RESCHEDULE MODAL)                          */}
      {/* ============================================================ */}
      {selectedChapter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
          <div className="bg-ink-card border border-ink-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-ink-border pb-3">
              <h3 className="font-bold text-base text-ink-text flex items-center gap-2">
                <i className="fa-solid fa-calendar-check text-amber-500" />
                Cập nhật Lịch Đăng Chương
              </h3>
              <button
                onClick={() => setSelectedChapter(null)}
                className="text-ink-muted hover:text-ink-text cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            <div className="text-xs text-ink-muted space-y-1">
              <p>
                Truyện: <strong className="text-ink-text">{selectedChapter.storyTitle}</strong>
              </p>
              <p>
                Chương:{" "}
                <strong className="text-ink-text">
                  Chương {selectedChapter.chapterNumber}: {selectedChapter.title}
                </strong>
              </p>
            </div>

            {/* Input Datetime Local */}
            <div>
              <label className="block text-xs font-semibold text-ink-muted mb-1.5">
                Chọn ngày và giờ xuất bản (Giờ máy tính):
              </label>
              <input
                type="datetime-local"
                value={newPublishAt}
                onChange={(e) => setNewPublishAt(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-ink-bg border border-ink-border text-ink-text text-sm focus:outline-none focus:border-gold/50"
              />
            </div>

            {/* Gợi ý thời gian nhanh */}
            <div>
              <span className="block text-[11px] text-ink-muted mb-1 font-medium">Đặt nhanh:</span>
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setQuickTime(1)}
                  className="px-2.5 py-1 rounded-lg bg-ink-bg border border-ink-border hover:bg-gold/15 hover:text-gold transition-colors cursor-pointer"
                >
                  Sau 1 giờ
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime(3)}
                  className="px-2.5 py-1 rounded-lg bg-ink-bg border border-ink-border hover:bg-gold/15 hover:text-gold transition-colors cursor-pointer"
                >
                  Sau 3 giờ
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime(24)}
                  className="px-2.5 py-1 rounded-lg bg-ink-bg border border-ink-border hover:bg-gold/15 hover:text-gold transition-colors cursor-pointer"
                >
                  Ngày mai (+24h)
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-ink-border">
              <button
                type="button"
                onClick={() => setSelectedChapter(null)}
                className="px-4 py-2 rounded-xl bg-ink-bg border border-ink-border text-ink-muted hover:text-ink-text text-xs font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={rescheduleMutation.isPending || !newPublishAt}
                onClick={() => {
                  if (selectedChapter && newPublishAt) {
                    const utcDate = new Date(newPublishAt).toISOString();
                    rescheduleMutation.mutate({
                      chapterId: selectedChapter.id,
                      publishAt: utcDate,
                    });
                  }
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-md transition-all cursor-pointer flex items-center gap-1.5"
              >
                {rescheduleMutation.isPending ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-floppy-disk" />
                    Lưu lịch hẹn
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
