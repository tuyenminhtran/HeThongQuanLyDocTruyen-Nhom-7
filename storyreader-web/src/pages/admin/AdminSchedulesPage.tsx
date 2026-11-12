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
  if (!publishAt) return { text: "Không có lịch", color: "text-slate-400" };
  const target = new Date(publishAt).getTime();
  const now = Date.now();
  const diffMs = target - now;

  if (diffMs <= 0) {
    return { text: "Đến giờ xuất bản", color: "text-emerald-600 font-medium" };
  }

  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHours = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) {
    const hours = diffHours % 24;
    return {
      text: `Còn ${diffDays} ngày ${hours > 0 ? `${hours} giờ` : ""}`,
      color: "text-slate-700",
    };
  }
  if (diffHours > 0) {
    const mins = diffMin % 60;
    return {
      text: `Còn ${diffHours} giờ ${mins > 0 ? `${mins} phút` : ""}`,
      color: "text-amber-600 font-medium",
    };
  }
  return {
    text: `Còn ${diffMin} phút`,
    color: "text-rose-600 font-semibold",
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
        <div className="fixed top-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white shadow-2xl flex items-center gap-3 backdrop-blur-md animate-fadeIn">
          <i className="fa-solid fa-circle-check text-emerald-400 text-sm" />
          <span className="text-xs font-medium">{actionSuccessMsg}</span>
          <button
            onClick={() => setActionSuccessMsg(null)}
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
            Lịch Đăng Truyện
          </h1>
          <p className="text-sm text-ink-muted mt-1">
            Lập lịch và tự động xuất bản các chương truyện theo thời gian hẹn.
          </p>
        </div>
      </div>

      {/* Metrics Row - Clean, Professional SaaS Style */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-ink-card border border-ink-border rounded-xl p-4 transition-colors hover:border-slate-300 shadow-xs">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Chờ xuất bản</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center text-xs border border-amber-100">
              <i className="fa-regular fa-clock" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats?.pendingCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Chương đang đếm ngược</div>
        </div>

        <div className="bg-ink-card border border-ink-border rounded-xl p-4 transition-colors hover:border-slate-300 shadow-xs">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Đã xuất bản hôm nay</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs border border-emerald-100">
              <i className="fa-solid fa-cloud-arrow-up" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats?.publishedTodayCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Chương hoàn tất xuất bản</div>
        </div>

        <div className="bg-ink-card border border-ink-border rounded-xl p-4 transition-colors hover:border-slate-300 shadow-xs">
          <div className="flex items-center justify-between text-ink-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Bộ truyện có lịch</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center text-xs border border-sky-100">
              <i className="fa-solid fa-book-bookmark" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 tracking-tight">
            {stats?.storiesCount ?? 0}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Tác phẩm có chương hẹn giờ</div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-ink-card border border-ink-border rounded-xl p-4 sm:p-5 space-y-4 shadow-xs">
        {/* Navigation Tabs, Dropdown & Search */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-ink-border pb-3">
          {/* Tabs */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
            <button
              onClick={() => { setStatusFilter("pending"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "pending"
                  ? "bg-slate-100 text-slate-900 font-semibold border border-slate-200 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Chờ đăng
              {(stats?.pendingCount ?? 0) > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-700 font-bold border border-amber-200">
                  {stats?.pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setStatusFilter("published"); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === "published"
                  ? "bg-slate-100 text-slate-900 font-semibold border border-slate-200 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              Đã xuất bản
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

          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5">
            <select
              value={storyFilter}
              onChange={(e) => { setStoryFilter(e.target.value); setPage(1); }}
              aria-label="Chọn truyện để lọc lịch đăng"
              className="w-full sm:w-56 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
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
                className="w-full px-3 py-1.5 pl-8 rounded-lg bg-slate-50 border border-slate-200 text-slate-900 text-xs placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
            </div>
          </div>
        </div>

        {/* Table Content */}
        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <i className="fa-solid fa-circle-notch fa-spin text-xl text-orange-600 mb-2" />
            <p className="text-xs">Đang tải danh sách lịch đăng...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center text-rose-600">
            <i className="fa-solid fa-circle-exclamation text-xl mb-1.5" />
            <p className="text-xs">Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 p-12 text-center text-slate-400">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <i className="fa-regular fa-calendar-xmark text-base" />
            </div>
            <p className="text-sm font-semibold text-slate-800">Không có chương nào trong danh sách</p>
            <p className="text-xs text-slate-500 mt-1">Chưa có chương truyện nào được lên lịch hẹn trong mục này.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-[11px] uppercase text-slate-500 font-semibold tracking-wider">
                <tr>
                  <th className="py-3 px-4">Truyện</th>
                  <th className="py-3 px-4">Chương</th>
                  <th className="py-3 px-4">Lịch Hẹn Xuất Bản</th>
                  <th className="py-3 px-4">Thời Gian Còn Lại</th>
                  <th className="py-3 px-4">Trạng Thái</th>
                  <th className="py-3 px-4 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((chap) => {
                  const remaining = getTimeRemaining(chap.publishAt);
                  return (
                    <tr key={chap.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Cột Truyện */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={chap.storyCoverImageUrl || "https://placehold.co/40x55?text=Cover"}
                            alt={chap.storyTitle}
                            className="w-8 h-10 rounded object-cover border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <a
                              href={`/stories/${chap.storyId}`}
                              target="_blank"
                              rel="noreferrer"
                              className="font-medium text-slate-900 hover:text-orange-600 transition-colors line-clamp-1"
                            >
                              {chap.storyTitle}
                            </a>
                            <span className="inline-block text-[10px] text-slate-500">
                              {chap.storyType === 1 ? "Truyện tranh" : "Truyện chữ"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Cột Chương */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">
                          Chương {chap.chapterNumber}
                        </div>
                        <div className="text-[11px] text-slate-500 line-clamp-1">{chap.title}</div>
                      </td>

                      {/* Cột Thời Gian Hẹn */}
                      <td className="py-3 px-4 font-mono text-slate-800">
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
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                            <i className="fa-solid fa-check text-[9px]" />
                            Đã xuất bản
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
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
                            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
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
                              className="p-1 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-md p-6 shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-semibold text-sm text-slate-900 flex items-center gap-2">
                <i className="fa-regular fa-calendar-check text-orange-600" />
                Cập nhật Lịch Đăng Chương
              </h3>
              <button
                onClick={() => setSelectedChapter(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <i className="fa-solid fa-xmark text-base" />
              </button>
            </div>

            <div className="text-xs space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
              <div className="font-semibold text-slate-900">
                {selectedChapter.storyTitle}
              </div>
              <div className="text-slate-500">
                Chương {selectedChapter.chapterNumber}: {selectedChapter.title}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-600">
                Thời gian xuất bản mới:
              </label>
              <input
                type="datetime-local"
                value={newPublishAt}
                onChange={(e) => setNewPublishAt(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:border-orange-500 focus:bg-white transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <div className="text-[11px] text-slate-500 font-medium">Chọn nhanh mốc thời gian:</div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setQuickTime(1)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 font-medium cursor-pointer transition-colors"
                >
                  +1 giờ
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime(6)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 font-medium cursor-pointer transition-colors"
                >
                  +6 giờ
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime(24)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 font-medium cursor-pointer transition-colors"
                >
                  +1 ngày
                </button>
                <button
                  type="button"
                  onClick={() => setQuickTime(72)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs text-slate-700 font-medium cursor-pointer transition-colors"
                >
                  +3 ngày
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedChapter(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100 text-xs font-medium transition-colors cursor-pointer"
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
                className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs disabled:opacity-50"
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
