import { useState } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  searchStories,
  getStoryDetail,
  createStory,
  addChapter,
  type StoryListItem,
  type CreateStoryInput,
  type CreateChapterInput,
  type StoryDetail,
} from "../api/stories";
import { useIsAdmin } from "../store/authStore";

/* ────────────────────────── Access labels ────────────────────────── */
const accessPolicyLabel: Record<number, string> = {
  0: "Miễn phí",
  1: "Trả phí",
  2: "Mixed",
};
const accessPolicyColor: Record<number, string> = {
  0: "text-green-400 bg-green-400/10 border-green-400/20",
  1: "text-gold bg-gold/10 border-gold/20",
  2: "text-blue-400 bg-blue-400/10 border-blue-400/20",
};
const statusLabel: Record<number, string> = {
  0: "Đang phát hành",
  1: "Hoàn thành",
  2: "Tạm ngưng",
};
const statusColor: Record<number, string> = {
  0: "text-sky-400 bg-sky-400/10 border-sky-400/20",
  1: "text-green-400 bg-green-400/10 border-green-400/20",
  2: "text-ink-muted bg-ink-muted/10 border-ink-muted/20",
};

/* ────────────────────────── Shared input class ────────────────────────── */
const inputClass =
  "w-full bg-ink-bg border border-ink-border rounded-xl px-4 py-2.5 text-ink-text placeholder:text-ink-muted/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-200 text-sm";
const labelClass = "block text-sm text-ink-muted mb-1.5";

/* ══════════════════════════════════════════════════════════════════════
   CREATE STORY MODAL
   ══════════════════════════════════════════════════════════════════════ */
function CreateStoryModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateStoryInput>({
    defaultValues: {
      accessPolicy: 0,
      freeChapterCount: 0,
      price: null,
      genreIds: [],
    },
  });

  const accessPolicy = watch("accessPolicy");

  const mutation = useMutation({
    mutationFn: (data: CreateStoryInput) =>
      createStory({
        ...data,
        price: data.accessPolicy === 0 ? null : data.price ? Number(data.price) : null,
        freeChapterCount:
          data.accessPolicy === 0 ? 0 : Number(data.freeChapterCount) || 0,
      }),
    onSuccess: (result) => {
      reset();
      onCreated(result.id);
      onClose();
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-ink-card border border-ink-border rounded-2xl shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-border">
          <h2 className="font-serif text-lg text-ink-text">Tạo truyện mới</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink-text hover:bg-ink-bg transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="p-6 space-y-4"
        >
          {/* Title */}
          <div>
            <label className={labelClass}>
              Tên truyện <span className="text-red-400">*</span>
            </label>
            <input
              {...register("title", { required: "Vui lòng nhập tên truyện" })}
              placeholder="Nhập tên truyện"
              className={inputClass}
            />
            {errors.title && (
              <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>
            )}
          </div>

          {/* Author */}
          <div>
            <label className={labelClass}>
              Tác giả <span className="text-red-400">*</span>
            </label>
            <input
              {...register("author", { required: "Vui lòng nhập tên tác giả" })}
              placeholder="Nhập tên tác giả"
              className={inputClass}
            />
            {errors.author && (
              <p className="text-red-400 text-xs mt-1">{errors.author.message}</p>
            )}
          </div>

          {/* Cover URL */}
          <div>
            <label className={labelClass}>URL ảnh bìa</label>
            <input
              {...register("coverImageUrl")}
              placeholder="https://example.com/cover.jpg"
              className={inputClass}
            />
          </div>

          {/* Description */}
          <div>
            <label className={labelClass}>Mô tả</label>
            <textarea
              {...register("description")}
              placeholder="Nhập mô tả nội dung truyện..."
              rows={3}
              className={inputClass + " resize-none"}
            />
          </div>

          {/* Access Policy */}
          <div>
            <label className={labelClass}>Chính sách truy cập</label>
            <select
              {...register("accessPolicy", { valueAsNumber: true })}
              className={inputClass}
            >
              <option value={0}>Miễn phí</option>
              <option value={1}>Trả phí</option>
              <option value={2}>Mixed (một phần miễn phí)</option>
            </select>
          </div>

          {/* Price & Free chapters — only when paid */}
          {Number(accessPolicy) !== 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>
                  Giá (VNĐ) <span className="text-red-400">*</span>
                </label>
                <input
                  {...register("price", {
                    valueAsNumber: true,
                    validate: (v) =>
                      Number(accessPolicy) === 0 ||
                      (v != null && Number(v) > 0) ||
                      "Vui lòng nhập giá",
                  })}
                  type="number"
                  min={0}
                  placeholder="VD: 50000"
                  className={inputClass}
                />
                {errors.price && (
                  <p className="text-red-400 text-xs mt-1">
                    {errors.price.message}
                  </p>
                )}
              </div>
              <div>
                <label className={labelClass}>Số chương miễn phí</label>
                <input
                  {...register("freeChapterCount", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  placeholder="VD: 3"
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {/* Error */}
          {mutation.isError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-red-400 text-sm">
                Không tạo được truyện. Kiểm tra lại dữ liệu.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm text-ink-muted hover:text-ink-text hover:bg-ink-bg border border-ink-border transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gold text-ink-bg hover:bg-gold-dim disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {mutation.isPending && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {mutation.isPending ? "Đang tạo..." : "Tạo truyện"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   ADD CHAPTER MODAL
   ══════════════════════════════════════════════════════════════════════ */
function AddChapterModal({
  story,
  onClose,
}: {
  story: StoryDetail;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateChapterInput>({
    defaultValues: {
      chapterNumber: story.chapters.length + 1,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateChapterInput) =>
      addChapter(story.id, {
        ...data,
        chapterNumber: Number(data.chapterNumber),
        publishAt: null,
      }),
    onSuccess: () => {
      reset();
      queryClient.invalidateQueries({ queryKey: ["storyDetail", story.id] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-ink-card border border-ink-border rounded-2xl shadow-2xl shadow-black/50 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-border shrink-0">
          <div>
            <h2 className="font-serif text-lg text-ink-text">Thêm chương mới</h2>
            <p className="text-xs text-ink-muted mt-0.5">{story.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink-text hover:bg-ink-bg transition-all"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="p-6 space-y-4 overflow-y-auto flex-1"
        >
          <div className="grid grid-cols-4 gap-3">
            <div className="col-span-1">
              <label className={labelClass}>
                Chương số <span className="text-red-400">*</span>
              </label>
              <input
                {...register("chapterNumber", {
                  required: "Bắt buộc",
                  valueAsNumber: true,
                  min: { value: 1, message: "≥ 1" },
                })}
                type="number"
                className={inputClass}
              />
              {errors.chapterNumber && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.chapterNumber.message}
                </p>
              )}
            </div>
            <div className="col-span-3">
              <label className={labelClass}>
                Tiêu đề chương <span className="text-red-400">*</span>
              </label>
              <input
                {...register("title", { required: "Vui lòng nhập tiêu đề" })}
                placeholder="Nhập tiêu đề chương"
                className={inputClass}
              />
              {errors.title && (
                <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className={labelClass}>
              Nội dung <span className="text-red-400">*</span>
            </label>
            <textarea
              {...register("content", {
                required: "Vui lòng nhập nội dung chương",
              })}
              placeholder="Nhập nội dung chương..."
              rows={10}
              className={inputClass + " resize-none font-serif leading-relaxed"}
            />
            {errors.content && (
              <p className="text-red-400 text-xs mt-1">
                {errors.content.message}
              </p>
            )}
          </div>

          {/* Success message */}
          {mutation.isSuccess && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-green-400 text-sm">
                Thêm chương thành công! Bạn có thể tiếp tục thêm chương khác.
              </p>
            </div>
          )}

          {mutation.isError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <svg className="w-5 h-5 text-red-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
              <p className="text-red-400 text-sm">
                Không thể thêm chương. Kiểm tra lại số chương có bị trùng không.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm text-ink-muted hover:text-ink-text hover:bg-ink-bg border border-ink-border transition-all"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gold text-ink-bg hover:bg-gold-dim disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              {mutation.isPending && (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {mutation.isPending ? "Đang thêm..." : "Thêm chương"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   STORY DETAIL PANEL (slide-in from the right side)
   ══════════════════════════════════════════════════════════════════════ */
function StoryDetailPanel({
  storyId,
  onClose,
}: {
  storyId: string;
  onClose: () => void;
}) {
  const [showAddChapter, setShowAddChapter] = useState(false);

  const { data: story, isLoading } = useQuery({
    queryKey: ["storyDetail", storyId],
    queryFn: () => getStoryDetail(storyId),
  });

  return (
    <>
      <div className="fixed inset-0 z-40 flex justify-end">
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        />
        <div className="relative w-full max-w-xl bg-ink-card border-l border-ink-border shadow-2xl shadow-black/50 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <svg className="animate-spin h-8 w-8 text-gold" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : !story ? (
            <div className="p-6 text-ink-muted">Không tìm thấy truyện.</div>
          ) : (
            <>
              {/* Header */}
              <div className="sticky top-0 z-10 bg-ink-card/95 backdrop-blur-sm border-b border-ink-border px-6 py-4 flex items-center justify-between">
                <h2 className="font-serif text-lg text-ink-text truncate pr-4">
                  {story.title}
                </h2>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-ink-muted hover:text-ink-text hover:bg-ink-bg transition-all shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Story info */}
              <div className="p-6">
                <div className="flex gap-5 mb-6">
                  <div className="w-28 aspect-[2/3] shrink-0 rounded-xl overflow-hidden border border-ink-border bg-ink-bg">
                    <img
                      src={story.coverImageUrl || "https://placehold.co/300x450?text=No+Cover"}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0 space-y-2">
                    <p className="text-sm text-ink-muted">
                      Tác giả:{" "}
                      <span className="text-ink-text">{story.author}</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border ${statusColor[story.status] ?? statusColor[0]}`}
                      >
                        {statusLabel[story.status] ?? "N/A"}
                      </span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-full border ${accessPolicyColor[story.accessPolicy] ?? accessPolicyColor[0]}`}
                      >
                        {accessPolicyLabel[story.accessPolicy] ?? "N/A"}
                      </span>
                    </div>
                    {story.price != null && story.price > 0 && (
                      <p className="text-sm text-ink-muted">
                        Giá:{" "}
                        <span className="text-gold font-medium">
                          {story.price.toLocaleString()}đ
                        </span>
                      </p>
                    )}
                    {story.genres.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {story.genres.map((g) => (
                          <span
                            key={g}
                            className="text-xs px-2 py-0.5 rounded-md bg-ink-bg border border-ink-border text-ink-muted"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {story.description && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-ink-text mb-2">
                      Mô tả
                    </h3>
                    <p className="text-sm text-ink-muted leading-relaxed">
                      {story.description}
                    </p>
                  </div>
                )}

                {/* Chapters */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-ink-text flex items-center gap-2">
                      Danh sách chương
                      <span className="text-xs text-ink-muted bg-ink-bg border border-ink-border rounded-full px-2 py-0.5">
                        {story.chapters.length}
                      </span>
                    </h3>
                    <button
                      onClick={() => setShowAddChapter(true)}
                      className="text-xs font-medium text-gold hover:text-gold-dim transition-colors flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Thêm chương
                    </button>
                  </div>

                  {story.chapters.length === 0 ? (
                    <div className="text-center py-8 text-ink-muted/60">
                      <svg className="w-10 h-10 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      <p className="text-sm">Chưa có chương nào</p>
                    </div>
                  ) : (
                    <div className="border border-ink-border rounded-xl overflow-hidden divide-y divide-ink-border">
                      {story.chapters
                        .sort((a, b) => a.chapterNumber - b.chapterNumber)
                        .map((c) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between px-4 py-3 hover:bg-ink-bg/50 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs font-mono text-ink-muted bg-ink-bg border border-ink-border rounded-md px-2 py-0.5 shrink-0">
                                #{c.chapterNumber}
                              </span>
                              <span className="text-sm text-ink-text truncate">
                                {c.title}
                              </span>
                            </div>
                            {c.requiresAccess && (
                              <span className="text-xs text-gold bg-gold/10 border border-gold/20 rounded-full px-2 py-0.5 shrink-0 ml-2">
                                Trả phí
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Add chapter modal */}
      {showAddChapter && story && (
        <AddChapterModal
          story={story}
          onClose={() => setShowAddChapter(false)}
        />
      )}
    </>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   STORY TABLE ROW
   ══════════════════════════════════════════════════════════════════════ */
function StoryRow({
  story,
  onSelect,
}: {
  story: StoryListItem;
  onSelect: () => void;
}) {
  return (
    <tr
      onClick={onSelect}
      className="border-b border-ink-border/60 hover:bg-ink-card/50 transition-colors cursor-pointer group"
    >
      {/* Cover + Title */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-14 rounded-lg overflow-hidden border border-ink-border bg-ink-bg shrink-0">
            <img
              src={story.coverImageUrl || "https://placehold.co/60x84?text=N"}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="text-sm text-ink-text font-medium truncate group-hover:text-gold transition-colors">
              {story.title}
            </p>
            <p className="text-xs text-ink-muted truncate">{story.author}</p>
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="py-3 px-4 hidden sm:table-cell">
        <span
          className={`text-xs px-2.5 py-1 rounded-full border ${statusColor[story.status] ?? statusColor[0]}`}
        >
          {statusLabel[story.status] ?? "N/A"}
        </span>
      </td>

      {/* Access Policy */}
      <td className="py-3 px-4 hidden md:table-cell">
        <span
          className={`text-xs px-2.5 py-1 rounded-full border ${accessPolicyColor[story.accessPolicy] ?? accessPolicyColor[0]}`}
        >
          {accessPolicyLabel[story.accessPolicy] ?? "N/A"}
        </span>
      </td>

      {/* Views */}
      <td className="py-3 px-4 text-right hidden lg:table-cell">
        <span className="text-sm text-ink-muted">
          {story.viewCount.toLocaleString()}
        </span>
      </td>

      {/* Action */}
      <td className="py-3 px-4 text-right">
        <svg
          className="w-5 h-5 text-ink-muted group-hover:text-gold transition-colors inline-block"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </td>
    </tr>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════════════ */
export default function AdminStoriesPage() {
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchKeyword, setSearchKeyword] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  const { data: stories, isLoading } = useQuery({
    queryKey: ["stories", searchKeyword],
    queryFn: () => searchStories(searchKeyword || undefined),
  });

  // Guard: redirect non-admin users
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <p className="text-ink-text font-serif text-lg">Bạn không có quyền truy cập</p>
        <p className="text-ink-muted text-sm">Trang này chỉ dành cho quản trị viên.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gold text-ink-bg hover:bg-gold-dim transition-all"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const refreshList = () =>
    queryClient.invalidateQueries({ queryKey: ["stories"] });

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-2xl text-ink-text">Quản lý truyện</h1>
            <p className="text-sm text-ink-muted mt-1">
              Quản lý toàn bộ truyện và chương trong hệ thống
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gold text-ink-bg hover:bg-gold-dim transition-all shadow-sm hover:shadow-md hover:shadow-gold/10 flex items-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tạo truyện mới
          </button>
        </div>

        {/* Stats bar */}
        {stories && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="bg-ink-card border border-ink-border rounded-xl px-4 py-3">
              <p className="text-xs text-ink-muted">Tổng truyện</p>
              <p className="text-xl font-semibold text-ink-text mt-1">
                {stories.length}
              </p>
            </div>
            <div className="bg-ink-card border border-ink-border rounded-xl px-4 py-3">
              <p className="text-xs text-ink-muted">Miễn phí</p>
              <p className="text-xl font-semibold text-green-400 mt-1">
                {stories.filter((s) => s.accessPolicy === 0).length}
              </p>
            </div>
            <div className="bg-ink-card border border-ink-border rounded-xl px-4 py-3">
              <p className="text-xs text-ink-muted">Trả phí</p>
              <p className="text-xl font-semibold text-gold mt-1">
                {stories.filter((s) => s.accessPolicy === 1).length}
              </p>
            </div>
            <div className="bg-ink-card border border-ink-border rounded-xl px-4 py-3">
              <p className="text-xs text-ink-muted">Tổng lượt xem</p>
              <p className="text-xl font-semibold text-ink-text mt-1">
                {stories
                  .reduce((sum, s) => sum + s.viewCount, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {/* Search bar */}
        <div className="relative mb-6">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </span>
          <input
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="Tìm truyện theo tên hoặc tác giả..."
            className="w-full bg-ink-card border border-ink-border rounded-xl pl-12 pr-4 py-3 text-sm text-ink-text placeholder:text-ink-muted/50 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all duration-200"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-text transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Table */}
        <div className="bg-ink-card border border-ink-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-border bg-ink-bg/50">
                <th className="text-left text-xs font-medium text-ink-muted uppercase tracking-wider px-4 py-3">
                  Truyện
                </th>
                <th className="text-left text-xs font-medium text-ink-muted uppercase tracking-wider px-4 py-3 hidden sm:table-cell">
                  Trạng thái
                </th>
                <th className="text-left text-xs font-medium text-ink-muted uppercase tracking-wider px-4 py-3 hidden md:table-cell">
                  Chính sách
                </th>
                <th className="text-right text-xs font-medium text-ink-muted uppercase tracking-wider px-4 py-3 hidden lg:table-cell">
                  Lượt xem
                </th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody>
              {isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-ink-border/60">
                    <td className="py-3 px-4" colSpan={5}>
                      <div className="animate-pulse flex items-center gap-3">
                        <div className="w-10 h-14 rounded-lg bg-ink-bg" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-ink-bg rounded w-1/3" />
                          <div className="h-3 bg-ink-bg rounded w-1/5" />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}

              {!isLoading && stories && stories.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <svg className="w-12 h-12 mx-auto mb-3 text-ink-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                    </svg>
                    <p className="text-ink-muted text-sm">Không tìm thấy truyện nào</p>
                    <p className="text-ink-muted/50 text-xs mt-1">
                      Hãy tạo truyện đầu tiên hoặc thử tìm kiếm khác
                    </p>
                  </td>
                </tr>
              )}

              {stories?.map((story) => (
                <StoryRow
                  key={story.id}
                  story={story}
                  onSelect={() => setSelectedStoryId(story.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Story Modal */}
      <CreateStoryModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={(id) => {
          refreshList();
          setSelectedStoryId(id);
        }}
      />

      {/* Story Detail Panel */}
      {selectedStoryId && (
        <StoryDetailPanel
          storyId={selectedStoryId}
          onClose={() => setSelectedStoryId(null)}
        />
      )}
    </>
  );
}
