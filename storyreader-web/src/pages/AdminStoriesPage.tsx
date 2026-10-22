import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  searchStories,
  getStoryDetail,
  createStory,
  updateStory,
  deleteStory,
  addChapter,
  updateChapter,
  deleteChapter,
  type StoryListItem,
  type ChapterListItem,
  type CreateStoryInput,
  type CreateChapterInput,
  type StoryDetail,
} from "../api/stories";
import { getChapterContent } from "../api/chapters";
import { useIsAdmin } from "../store/authStore";
import { getGenres } from "../api/genres";

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
    control,
    formState: { errors },
  } = useForm<CreateStoryInput>({
    defaultValues: {
      accessPolicy: 0,
      freeChapterCount: 0,
      price: null,
      genreIds: [],
      type: 0,
    },
  });

  const accessPolicy = useWatch({ control, name: "accessPolicy" });
  const { data: genres } = useQuery({ queryKey: ["genres"], queryFn: getGenres });

  const mutation = useMutation({
    mutationFn: (data: CreateStoryInput) =>
      createStory({
        ...data,
        type: Number(data.type) || 0,
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
            <i className="fa-solid fa-xmark text-lg" />
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

          {/* Story Type */}
          <div>
            <label className={labelClass}>Hình thức truyện</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-ink-border bg-ink-bg cursor-pointer hover:border-gold/50 transition-colors">
                <input
                  type="radio"
                  value={0}
                  {...register("type", { valueAsNumber: true })}
                  className="text-gold focus:ring-gold"
                />
                <div>
                  <span className="text-sm font-medium text-ink-text block">Truyện chữ</span>
                  <span className="text-xs text-ink-muted">Tiểu thuyết, văn bản</span>
                </div>
              </label>
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-ink-border bg-ink-bg cursor-pointer hover:border-gold/50 transition-colors">
                <input
                  type="radio"
                  value={1}
                  {...register("type", { valueAsNumber: true })}
                  className="text-gold focus:ring-gold"
                />
                <div>
                  <span className="text-sm font-medium text-ink-text block">Truyện tranh</span>
                  <span className="text-xs text-ink-muted">Manga, Comic (ảnh)</span>
                </div>
              </label>
            </div>
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

          {/* Genres */}
          <div>
            <label className={labelClass}>Thể loại</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-3 bg-ink-bg border border-ink-border rounded-xl">
              {genres && genres.length > 0 ? (
                genres.map((g) => (
                  <label key={g.id} className="flex items-center gap-2 text-xs text-ink-text cursor-pointer hover:text-gold transition-colors select-none">
                    <input
                      type="checkbox"
                      value={g.id}
                      {...register("genreIds")}
                      className="rounded border-ink-border text-gold focus:ring-gold/30 bg-ink-card cursor-pointer"
                    />
                    <span className="truncate">{g.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-xs text-ink-muted col-span-3">Đang tải thể loại...</p>
              )}
            </div>
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
              <i className="fa-solid fa-circle-exclamation text-red-400 text-lg shrink-0" />
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
                <i className="fa-solid fa-spinner fa-spin text-sm" />
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
   EDIT STORY MODAL
   ══════════════════════════════════════════════════════════════════════ */
function EditStoryModal({
  story,
  open,
  onClose,
  onUpdated,
}: {
  story: StoryDetail;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { data: genres } = useQuery({ queryKey: ["genres"], queryFn: getGenres });
  const defaultGenreIds = genres
    ? genres.filter((g) => story.genres?.includes(g.name)).map((g) => g.id)
    : [];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateStoryInput & { status: number }>({
    values: {
      title: story.title,
      author: story.author,
      type: story.type ?? 0,
      status: story.status ?? 0,
      coverImageUrl: story.coverImageUrl ?? "",
      description: story.description ?? "",
      accessPolicy: story.accessPolicy ?? 0,
      price: story.price ?? null,
      freeChapterCount: story.freeChapterCount ?? 0,
      genreIds: defaultGenreIds,
    },
  });

  const accessPolicy = useWatch({ control, name: "accessPolicy" });

  const mutation = useMutation({
    mutationFn: (data: CreateStoryInput & { status: number }) =>
      updateStory(story.id, {
        ...data,
        type: Number(data.type) || 0,
        status: Number(data.status) || 0,
        price: Number(data.accessPolicy) === 0 ? null : data.price ? Number(data.price) : null,
        freeChapterCount:
          Number(data.accessPolicy) === 0 ? 0 : Number(data.freeChapterCount) || 0,
      }),
    onSuccess: () => {
      onUpdated();
      onClose();
    },
  });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg bg-ink-card border border-ink-border rounded-2xl shadow-2xl shadow-black/50 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-border">
          <h2 className="font-serif text-lg text-ink-text">Chỉnh sửa thông tin truyện</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink-text hover:bg-ink-bg transition-all"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

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
              className={inputClass}
            />
            {errors.author && (
              <p className="text-red-400 text-xs mt-1">{errors.author.message}</p>
            )}
          </div>

          {/* Story Type */}
          <div>
            <label className={labelClass}>Hình thức truyện</label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-ink-border bg-ink-bg cursor-pointer hover:border-gold/50 transition-colors">
                <input
                  type="radio"
                  value={0}
                  {...register("type", { valueAsNumber: true })}
                  className="text-gold focus:ring-gold"
                />
                <div>
                  <span className="text-sm font-medium text-ink-text block">Truyện chữ</span>
                  <span className="text-xs text-ink-muted">Tiểu thuyết, văn bản</span>
                </div>
              </label>
              <label className="flex items-center gap-2.5 p-3 rounded-xl border border-ink-border bg-ink-bg cursor-pointer hover:border-gold/50 transition-colors">
                <input
                  type="radio"
                  value={1}
                  {...register("type", { valueAsNumber: true })}
                  className="text-gold focus:ring-gold"
                />
                <div>
                  <span className="text-sm font-medium text-ink-text block">Truyện tranh</span>
                  <span className="text-xs text-ink-muted">Manga, Comic (ảnh)</span>
                </div>
              </label>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className={labelClass}>Trạng thái phát hành</label>
            <select
              {...register("status", { valueAsNumber: true })}
              className={inputClass}
            >
              <option value={0}>Đang phát hành</option>
              <option value={1}>Hoàn thành</option>
              <option value={2}>Tạm ngưng</option>
            </select>
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
              rows={3}
              className={inputClass + " resize-none"}
            />
          </div>

          {/* Genres */}
          <div>
            <label className={labelClass}>Thể loại</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-3 bg-ink-bg border border-ink-border rounded-xl">
              {genres && genres.length > 0 ? (
                genres.map((g) => (
                  <label key={g.id} className="flex items-center gap-2 text-xs text-ink-text cursor-pointer hover:text-gold transition-colors select-none">
                    <input
                      type="checkbox"
                      value={g.id}
                      {...register("genreIds")}
                      className="rounded border-ink-border text-gold focus:ring-gold/30 bg-ink-card cursor-pointer"
                    />
                    <span className="truncate">{g.name}</span>
                  </label>
                ))
              ) : (
                <p className="text-xs text-ink-muted col-span-3">Đang tải thể loại...</p>
              )}
            </div>
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

          {/* Price & Free chapters */}
          {Number(accessPolicy) !== 0 && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>Giá (VNĐ)</label>
                <input
                  {...register("price", {
                    valueAsNumber: true,
                  })}
                  type="number"
                  min={0}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Số chương miễn phí</label>
                <input
                  {...register("freeChapterCount", { valueAsNumber: true })}
                  type="number"
                  min={0}
                  className={inputClass}
                />
              </div>
            </div>
          )}

          {mutation.isError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <i className="fa-solid fa-circle-exclamation text-red-400 text-lg shrink-0" />
              <p className="text-red-400 text-sm">
                Không thể cập nhật truyện. Vui lòng kiểm tra lại.
              </p>
            </div>
          )}

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
              className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gold text-ink-bg hover:bg-gold-dim disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {mutation.isPending && (
                <i className="fa-solid fa-spinner fa-spin text-sm" />
              )}
              {mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════
   EDIT CHAPTER MODAL
   ══════════════════════════════════════════════════════════════════════ */
function EditChapterModal({
  story,
  chapter,
  onClose,
  onUpdated,
}: {
  story: StoryDetail;
  chapter: ChapterListItem;
  onClose: () => void;
  onUpdated: () => void;
}) {
  const { data: chapterDetail, isLoading: isLoadingContent } = useQuery({
    queryKey: ["chapterContent", chapter.id],
    queryFn: () => getChapterContent(chapter.id),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateChapterInput>({
    values: {
      chapterNumber: chapter.chapterNumber,
      title: chapter.title,
      content: chapterDetail?.content || "",
      publishAt: null,
    },
  });

  const mutation = useMutation({
    mutationFn: (data: CreateChapterInput) =>
      updateChapter(story.id, chapter.id, {
        ...data,
        chapterNumber: Number(data.chapterNumber),
        publishAt: null,
      }),
    onSuccess: () => {
      onUpdated();
      onClose();
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-ink-card border border-ink-border rounded-2xl shadow-2xl shadow-black/50 max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-ink-border shrink-0">
          <div>
            <h2 className="font-serif text-lg text-ink-text">Chỉnh sửa chương #{chapter.chapterNumber}</h2>
            <p className="text-xs text-ink-muted mt-0.5">{story.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-ink-muted hover:text-ink-text hover:bg-ink-bg transition-all"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {isLoadingContent ? (
          <div className="p-12 text-center text-ink-muted flex items-center justify-center gap-2">
            <i className="fa-solid fa-spinner fa-spin text-gold text-lg" />
            <span>Đang tải nội dung chương...</span>
          </div>
        ) : (
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
                  className={inputClass}
                />
                {errors.title && (
                  <p className="text-red-400 text-xs mt-1">{errors.title.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className={labelClass}>
                {story.type === 1 ? (
                  <span className="flex items-center justify-between">
                    <span>
                      Danh sách URL ảnh các trang <span className="text-red-400">*</span>
                    </span>
                    <span className="text-xs text-gold font-normal">
                      (Mỗi dòng 1 link ảnh)
                    </span>
                  </span>
                ) : (
                  <span>
                    Nội dung chương <span className="text-red-400">*</span>
                  </span>
                )}
              </label>
              <textarea
                {...register("content", { required: "Vui lòng nhập nội dung" })}
                rows={story.type === 1 ? 8 : 10}
                className={
                  inputClass +
                  (story.type === 1
                    ? " font-mono text-xs leading-relaxed"
                    : " resize-none font-serif leading-relaxed")
                }
              />
            </div>

            {story.type !== 1 && (
              <div className="p-3.5 rounded-xl border border-gold/30 bg-gold/5 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="renderAsImagesEdit"
                  {...register("renderAsImages")}
                  className="mt-1 h-4 w-4 rounded border-ink-border text-gold focus:ring-gold bg-ink-bg cursor-pointer"
                />
                <label htmlFor="renderAsImagesEdit" className="cursor-pointer text-xs text-ink-text leading-relaxed">
                  <span className="font-semibold text-gold block text-sm flex items-center gap-1.5">
                    <i className="fa-solid fa-shield-halved text-xs" />
                    Chống sao chép (Render lại thành ảnh)
                  </span>
                  Tự động chuyển đổi nội dung chữ thành các trang ảnh có watermark để người đọc xem qua Webtoon và không thể sao chép văn bản.
                </label>
              </div>
            )}

            {mutation.isError && (
              <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <i className="fa-solid fa-circle-exclamation text-red-400 text-lg shrink-0" />
                <p className="text-red-400 text-sm">
                  Không thể lưu chỉnh sửa chương. Vui lòng thử lại.
                </p>
              </div>
            )}

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
                className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gold text-ink-bg hover:bg-gold-dim disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {mutation.isPending && (
                  <i className="fa-solid fa-spinner fa-spin text-sm" />
                )}
                {mutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </form>
        )}
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
            <i className="fa-solid fa-xmark text-lg" />
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
              {story.type === 1 ? (
                <span className="flex items-center justify-between">
                  <span>
                    Danh sách URL ảnh các trang <span className="text-red-400">*</span>
                  </span>
                  <span className="text-xs text-gold font-normal">
                    (Mỗi dòng 1 link ảnh trang truyện)
                  </span>
                </span>
              ) : (
                <span>
                  Nội dung chương <span className="text-red-400">*</span>
                </span>
              )}
            </label>
            <textarea
              {...register("content", {
                required:
                  story.type === 1
                    ? "Vui lòng nhập ít nhất một link ảnh"
                    : "Vui lòng nhập nội dung chương",
              })}
              placeholder={
                story.type === 1
                  ? "Dán các link ảnh trang truyện tại đây, mỗi trang một dòng:\nhttps://example.com/trang-1.jpg\nhttps://example.com/trang-2.jpg\nhttps://example.com/trang-3.jpg"
                  : "Nhập nội dung chương..."
              }
              rows={story.type === 1 ? 8 : 10}
              className={
                inputClass +
                (story.type === 1
                  ? " font-mono text-xs leading-relaxed"
                  : " resize-none font-serif leading-relaxed")
              }
            />
            {errors.content && (
              <p className="text-red-400 text-xs mt-1">
                {errors.content.message}
              </p>
            )}
          </div>

          {story.type !== 1 && (
            <div className="p-3.5 rounded-xl border border-gold/30 bg-gold/5 flex items-start gap-3">
              <input
                type="checkbox"
                id="renderAsImagesAdd"
                {...register("renderAsImages")}
                className="mt-1 h-4 w-4 rounded border-ink-border text-gold focus:ring-gold bg-ink-bg cursor-pointer"
              />
              <label htmlFor="renderAsImagesAdd" className="cursor-pointer text-xs text-ink-text leading-relaxed">
                <span className="font-semibold text-gold block text-sm flex items-center gap-1.5">
                  <i className="fa-solid fa-shield-halved text-xs" />
                  Chống sao chép (Bảo vệ bản quyền bằng ảnh)
                </span>
                Hệ thống sẽ tự động chuyển đổi toàn bộ văn bản chữ thành các trang ảnh sắc nét có watermark. Người đọc xem ở chế độ Webtoon mượt mà và không thể copy chữ.
              </label>
            </div>
          )}

          {/* Success message */}
          {mutation.isSuccess && (
            <div className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
              <i className="fa-solid fa-circle-check text-green-400 text-lg shrink-0" />
              <p className="text-green-400 text-sm">
                Thêm chương thành công! Bạn có thể tiếp tục thêm chương khác.
              </p>
            </div>
          )}

          {mutation.isError && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
              <i className="fa-solid fa-circle-exclamation text-red-400 text-lg shrink-0" />
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
                <i className="fa-solid fa-spinner fa-spin text-sm" />
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
  const queryClient = useQueryClient();
  const [showAddChapter, setShowAddChapter] = useState(false);
  const [showEditStory, setShowEditStory] = useState(false);
  const [editingChapter, setEditingChapter] = useState<ChapterListItem | null>(null);

  const { data: story, isLoading } = useQuery({
    queryKey: ["storyDetail", storyId],
    queryFn: () => getStoryDetail(storyId),
  });

  const deleteStoryMutation = useMutation({
    mutationFn: () => deleteStory(storyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      onClose();
    },
    onError: () => {
      alert("Không thể xóa truyện này. Vui lòng thử lại sau.");
    },
  });

  const deleteChapterMutation = useMutation({
    mutationFn: (chapterId: string) => deleteChapter(storyId, chapterId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["storyDetail", storyId] });
      queryClient.invalidateQueries({ queryKey: ["stories"] });
    },
    onError: () => {
      alert("Không thể xóa chương này. Vui lòng thử lại sau.");
    },
  });

  const handleDeleteStory = () => {
    if (!story) return;
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa vĩnh viễn truyện "${story.title}"?\nToàn bộ ${story.chapters.length} chương liên quan sẽ bị xóa.`
      )
    ) {
      deleteStoryMutation.mutate();
    }
  };

  const handleDeleteChapter = (c: ChapterListItem) => {
    if (
      confirm(
        `Bạn có chắc chắn muốn xóa chương #${c.chapterNumber}: "${c.title}"?`
      )
    ) {
      deleteChapterMutation.mutate(c.id);
    }
  };

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
              <i className="fa-solid fa-spinner fa-spin text-2xl text-gold" />
            </div>
          ) : !story ? (
            <div className="p-6 text-ink-muted">Không tìm thấy truyện.</div>
          ) : (
            <>
              {/* Header */}
              <div className="sticky top-0 z-10 bg-ink-card/95 backdrop-blur-sm border-b border-ink-border px-6 py-4 flex items-center justify-between gap-3">
                <h2 className="font-serif text-lg text-ink-text truncate flex-1 min-w-0">
                  {story.title}
                </h2>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setShowEditStory(true)}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gold/15 text-gold border border-gold/30 hover:bg-gold/25 transition-all flex items-center gap-1.5"
                    title="Chỉnh sửa thông tin truyện"
                  >
                    <i className="fa-solid fa-pen-to-square text-xs" />
                    Sửa
                  </button>
                  <button
                    onClick={handleDeleteStory}
                    disabled={deleteStoryMutation.isPending}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all flex items-center gap-1.5"
                    title="Xóa truyện"
                  >
                    <i className="fa-solid fa-trash-can text-xs" />
                    Xóa
                  </button>
                  <button
                    onClick={onClose}
                    className="p-1.5 rounded-lg text-ink-muted hover:text-ink-text hover:bg-ink-bg transition-all"
                  >
                    <i className="fa-solid fa-xmark text-lg" />
                  </button>
                </div>
              </div>

              {/* Story info */}
              <div className="p-6">
                <div className="flex gap-5 mb-6">
                  <div className="w-28 aspect-[2/3] shrink-0 rounded-xl overflow-hidden border border-ink-border bg-ink-bg">
                    <img
                      src={story.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"}
                      alt={story.title}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80";
                      }}
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
                      {story.type === 1 ? (
                        <span className="text-xs px-2.5 py-1 rounded-full border text-sky-400 bg-sky-400/10 border-sky-400/20 font-medium">
                          Truyện tranh (Manga)
                        </span>
                      ) : (
                        <span className="text-xs px-2.5 py-1 rounded-full border text-amber-400 bg-amber-400/10 border-amber-400/20 font-medium">
                          Truyện chữ
                        </span>
                      )}
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
                    <p className="text-sm text-ink-muted leading-relaxed whitespace-pre-line">
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
                      className="text-xs font-medium text-gold hover:text-gold-dim transition-colors flex items-center gap-1.5"
                    >
                      <i className="fa-solid fa-plus text-xs" />
                      Thêm chương
                    </button>
                  </div>

                  {story.chapters.length === 0 ? (
                    <div className="text-center py-8 text-ink-muted/60">
                      <i className="fa-solid fa-file-lines text-3xl mx-auto mb-2 opacity-50 block" />
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
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              {c.requiresAccess && (
                                <span className="text-xs text-gold bg-gold/10 border border-gold/20 rounded-full px-2 py-0.5">
                                  Trả phí
                                </span>
                              )}
                              <button
                                onClick={() => setEditingChapter(c)}
                                className="p-1.5 rounded-lg text-ink-muted hover:text-gold hover:bg-ink-bg transition-colors"
                                title="Chỉnh sửa chương"
                              >
                                <i className="fa-solid fa-pen-to-square text-xs" />
                              </button>
                              <button
                                onClick={() => handleDeleteChapter(c)}
                                disabled={deleteChapterMutation.isPending}
                                className="p-1.5 rounded-lg text-ink-muted hover:text-red-400 hover:bg-ink-bg transition-colors"
                                title="Xóa chương"
                              >
                                <i className="fa-solid fa-trash-can text-xs" />
                              </button>
                            </div>
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

      {/* Edit Story modal */}
      {showEditStory && story && (
        <EditStoryModal
          open={showEditStory}
          story={story}
          onClose={() => setShowEditStory(false)}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ["storyDetail", storyId] });
            queryClient.invalidateQueries({ queryKey: ["stories"] });
          }}
        />
      )}

      {/* Edit Chapter modal */}
      {editingChapter && story && (
        <EditChapterModal
          story={story}
          chapter={editingChapter}
          onClose={() => setEditingChapter(null)}
          onUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ["storyDetail", storyId] });
            queryClient.invalidateQueries({ queryKey: ["stories"] });
          }}
        />
      )}

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
              src={story.coverImageUrl || "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80"}
              alt=""
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80";
              }}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm text-ink-text font-medium truncate group-hover:text-gold transition-colors">
                {story.title}
              </p>
              {story.type === 1 ? (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20 shrink-0 font-medium">
                  Tranh
                </span>
              ) : (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 font-medium">
                  Chữ
                </span>
              )}
            </div>
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
        <span className="text-sm text-ink-muted inline-flex items-center gap-1.5">
          <i className="fa-solid fa-eye text-xs text-ink-muted/70" />
          {story.viewCount.toLocaleString()}
        </span>
      </td>

      {/* Action */}
      <td className="py-3 px-4 text-right">
        <i className="fa-solid fa-angle-right text-ink-muted group-hover:text-gold transition-colors inline-block text-sm" />
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
          <i className="fa-solid fa-ban text-2xl text-red-400" />
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
            <i className="fa-solid fa-plus text-xs" />
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
            <i className="fa-solid fa-magnifying-glass text-sm" />
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
              <i className="fa-solid fa-xmark text-sm" />
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
                    <i className="fa-solid fa-book-open text-4xl mx-auto mb-3 text-ink-muted/30 block" />
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
