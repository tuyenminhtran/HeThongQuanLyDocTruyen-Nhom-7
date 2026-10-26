import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getChapterContent } from "../api/chapters";
import { groupChaptersByPart, type ChapterGroup } from "../utils/chapterGrouping";
import { getStoryDetail, type ChapterListItem } from "../api/stories";
import { getChapterDiscussions, postChapterDiscussion, hideDiscussion } from "../api/discussions";
import { useAuthStore, useIsAdmin } from "../store/authStore";
import { AxiosError } from "axios";
import { useState, useEffect, useCallback, useMemo } from "react";

type Theme = "dark" | "light" | "sepia";
type FontFamily = "serif" | "sans";

export default function ChapterReadPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const stateStoryId = (location.state as { storyId?: string } | null)?.storyId;

  const [fontSize, setFontSize] = useState(() => {
    return Number(localStorage.getItem("storyreader-font-size")) || 20;
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("storyreader-theme") as Theme) || "light";
  });

  const [fontFamily, setFontFamily] = useState<FontFamily>(() => {
    return (localStorage.getItem("storyreader-font-family") as FontFamily) || "serif";
  });

  const [copyWarning, setCopyWarning] = useState<string | null>(null);
  const [showChapterList, setShowChapterList] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [commentText, setCommentText] = useState("");
  const queryClient = useQueryClient();
  const isLoggedIn = useAuthStore((s) => !!s.accessToken);
  const isAdmin = useIsAdmin();

  // Tự động cuộn lên đầu trang mỗi khi vào trang hoặc chuyển chương
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [id]);

  const showCopyToast = useCallback((msg: string) => {
    setCopyWarning(msg);
    setTimeout(() => {
      setCopyWarning((prev) => (prev === msg ? null : prev));
    }, 2500);
  }, []);

  const { data: discussions, isLoading: isDiscussionsLoading } = useQuery({
    queryKey: ["discussions", id],
    queryFn: () => getChapterDiscussions(id!),
    enabled: !!id,
  });

  const postCommentMutation = useMutation({
    mutationFn: (text: string) => postChapterDiscussion(id!, text),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["discussions", id] });
    },
    onError: () => {
      alert("Không thể gửi bình luận. Tài khoản có thể đang bị hạn chế tương tác.");
    },
  });

  const hideCommentMutation = useMutation({
    mutationFn: (discussionId: string) => hideDiscussion(id!, discussionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discussions", id] });
    },
  });

  const handlePostComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    postCommentMutation.mutate(commentText.trim());
  };

  useEffect(() => {
    localStorage.setItem("storyreader-font-size", fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("storyreader-theme", theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("storyreader-font-family", fontFamily);
  }, [fontFamily]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: chapter, isLoading, error } = useQuery({
    queryKey: ["chapter", id],
    queryFn: () => getChapterContent(id!),
    enabled: !!id,
    retry: false,
  });

  const activeStoryId = stateStoryId || chapter?.storyId;

  // Cài đặt lớp bảo vệ chống sao chép thông minh trực tiếp
  useEffect(() => {
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      if (e.clipboardData) {
        e.clipboardData.setData(
          "text/plain",
          `Nội dung chương "${chapter?.title || "truyện"}" thuộc bản quyền của tác giả trên hệ thống StoryNest. Vui lòng không sao chép trái phép!`
        );
      }
      showCopyToast("Nội dung đã được bảo vệ bản quyền trên StoryNest. Đã khóa sao chép!");
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Chặn Ctrl+C / Cmd+C
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        showCopyToast("Đã chặn phím tắt sao chép (Ctrl+C). Nội dung được bảo vệ!");
      }
      // Chặn Ctrl+U (Xem nguồn), Ctrl+S (Lưu trang), Ctrl+P (In ấn)
      if ((e.ctrlKey || e.metaKey) && ["u", "s", "p"].includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    };

    document.addEventListener("copy", handleCopy);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("copy", handleCopy);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [chapter?.title, showCopyToast]);

  // Fetch story details to know full chapter list & adjacent chapters
  const { data: story } = useQuery({
    queryKey: ["storyDetail", activeStoryId],
    queryFn: () => getStoryDetail(activeStoryId!),
    enabled: !!activeStoryId,
  });

  const sortedChapters = story?.chapters
    ? [...story.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber)
    : [];

  const readChapterGroups = useMemo<ChapterGroup[]>(() => groupChaptersByPart(sortedChapters), [sortedChapters]);
  const [readExpandedFolders, setReadExpandedFolders] = useState<Set<string>>(new Set());

  // Auto-expand folder that contains current chapter, or expand all
  useEffect(() => {
    if (readChapterGroups.length > 0) {
      const activeGroup = readChapterGroups.find((g: ChapterGroup) => g.chapters.some((c) => c.id === id));
      if (activeGroup) {
        setReadExpandedFolders(new Set([activeGroup.partName]));
      } else {
        setReadExpandedFolders(new Set(readChapterGroups.map((g: ChapterGroup) => g.partName)));
      }
    }
  }, [readChapterGroups, id, showChapterList]);

  const toggleReadFolder = (partName: string) => {
    setReadExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(partName)) next.delete(partName);
      else next.add(partName);
      return next;
    });
  };

  const currentIndex = sortedChapters.findIndex((c) => c.id === id);
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex >= 0 && currentIndex < sortedChapters.length - 1
      ? sortedChapters[currentIndex + 1]
      : null;

  const goToChapter = useCallback(
    (chapterId: string) => {
      setShowChapterList(false);
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      navigate(`/chapters/${chapterId}`, {
        state: { storyId: activeStoryId },
      });
    },
    [navigate, activeStoryId]
  );

  // Keyboard navigation: ArrowLeft -> Prev, ArrowRight -> Next
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.key === "ArrowLeft" && prevChapter) {
        goToChapter(prevChapter.id);
      } else if (e.key === "ArrowRight" && nextChapter) {
        goToChapter(nextChapter.id);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [prevChapter, nextChapter, goToChapter]);

  // Theme styling
  const themeClasses: Record<Theme, string> = {
    dark: "bg-[#12161f] text-[#E2E8F0]",
    light: "bg-white text-[#1A1D20]",
    sepia: "bg-[#F4ECD8] text-[#433422]",
  };

  const borderClasses: Record<Theme, string> = {
    dark: "border-[#2a3242]",
    light: "border-gray-200",
    sepia: "border-[#D6C5A5]",
  };

  const cardClasses: Record<Theme, string> = {
    dark: "bg-[#181d28] border-[#2a3242] text-[#E2E8F0]",
    light: "bg-white border-gray-200 text-[#1A1D20] shadow-xs",
    sepia: "bg-[#EFE5CD] border-[#D6C5A5] text-[#433422]",
  };

  // Phân loại hình thức nội dung
  const isComic = chapter?.storyType === 1;
  const isProtectedNovel = !isComic && !!(chapter?.imageUrls && chapter.imageUrls.length > 0);
  const hasImages = isComic || isProtectedNovel;

  // Bộ lọc triệt tiêu nền đen và viền, chuyển thành chữ đen hòa tan hoàn toàn vào trang đọc
  const getProtectedImageStyle = () => {
    if (!isProtectedNovel) return {};
    if (theme === "light" || theme === "sepia") {
      return {
        filter: "invert(1) grayscale(1) brightness(1.22) contrast(1.25)",
        mixBlendMode: "multiply" as const,
      };
    }
    // Nền tối: khớp hoàn hảo 100% với nền trang #12161f
    return {
      filter: "contrast(1.05)",
      mixBlendMode: "normal" as const,
    };
  };

  if (isLoading) {
    return (
      <div className={`min-h-[calc(100vh-65px)] ${themeClasses[theme]} transition-colors duration-300`}>
        <div className="max-w-3xl mx-auto px-6 py-20 animate-pulse">
          <div className={`h-10 rounded-lg w-3/4 mb-12 mx-auto ${theme === 'dark' ? 'bg-[#181d28]' : 'bg-black/10'}`} />
          <div className="space-y-6">
            <div className={`h-4 rounded w-full ${theme === 'dark' ? 'bg-[#181d28]' : 'bg-black/10'}`} />
            <div className={`h-4 rounded w-[95%] ${theme === 'dark' ? 'bg-[#181d28]' : 'bg-black/10'}`} />
            <div className={`h-4 rounded w-[98%] ${theme === 'dark' ? 'bg-[#181d28]' : 'bg-black/10'}`} />
            <div className={`h-4 rounded w-[90%] ${theme === 'dark' ? 'bg-[#181d28]' : 'bg-black/10'}`} />
            <div className={`h-4 rounded w-full ${theme === 'dark' ? 'bg-[#181d28]' : 'bg-black/10'}`} />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    const status = (error as AxiosError).response?.status;
    if (status === 403) {
      return (
        <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4 py-16 text-center ${themeClasses[theme]} transition-colors duration-300`}>
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center text-gold shadow-xl shadow-gold/10">
              <i className="fa-solid fa-lock text-3xl" />
            </div>
            <div className="absolute -top-1 -right-1 px-2 py-0.5 rounded-full bg-gold text-ink-bg text-[10px] font-bold tracking-wider uppercase">
              VIP
            </div>
          </div>
          <h2 className="font-serif text-2xl mb-3">
            Chương này đã bị khóa
          </h2>
          <p className="opacity-70 mb-8 max-w-md mx-auto">
            Bạn cần phải mua truyện hoặc đăng ký gói thành viên để tiếp tục đọc chương này.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => {
                if (activeStoryId) {
                  navigate(`/stories/${activeStoryId}`);
                } else {
                  navigate(-1);
                }
              }}
              className={`px-5 py-2.5 rounded-xl font-medium border ${borderClasses[theme]} hover:bg-black/5 transition-all text-sm`}
            >
              Quay lại
            </button>
            {isLoggedIn ? (
              <>
                {activeStoryId && (
                  <Link
                    to={`/stories/${activeStoryId}`}
                    className="px-5 py-2.5 rounded-xl font-semibold bg-gold text-ink-bg hover:bg-gold-dim transition-all shadow-md shadow-gold/20 text-sm flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-cart-shopping text-xs" />
                    <span>Mua truyện</span>
                  </Link>
                )}
                <Link
                  to="/pricing"
                  className="px-5 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 transition-all shadow-md text-sm flex items-center gap-1.5"
                >
                  <i className="fa-solid fa-crown text-xs" />
                  <span>Gói VIP</span>
                </Link>
              </>
            ) : (
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl font-semibold bg-gold text-ink-bg hover:bg-gold-dim transition-all shadow-md shadow-gold/20 text-sm"
              >
                Đăng nhập
              </Link>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className={`min-h-[calc(100vh-65px)] ${themeClasses[theme]} transition-colors duration-300 text-center py-20 px-4`}>
        <p className="text-red-400 font-medium">Không thể tải nội dung chương. Vui lòng thử lại sau.</p>
        <button onClick={() => navigate(-1)} className="mt-4 opacity-70 hover:opacity-100 underline">
          Quay lại
        </button>
      </div>
    );
  }

  if (!chapter) return null;

  return (
    <div className={`min-h-[calc(100vh-65px)] ${themeClasses[theme]} transition-colors duration-300`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">
        {/* Floating Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <button
            onClick={() => {
              if (activeStoryId) {
                navigate(`/stories/${activeStoryId}`);
              } else {
                navigate(-1);
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold border ${borderClasses[theme]} ${cardClasses[theme]} hover:border-orange-500 hover:text-orange-600 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs`}
            title="Quay lại trang truyện"
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            <span>Quay lại truyện</span>
          </button>

          <div className={`backdrop-blur-md border ${borderClasses[theme]} rounded-full flex items-center p-1.5 shadow-xs ${
            theme === 'dark'
              ? 'bg-[#181d28]/90 text-white'
              : theme === 'sepia'
              ? 'bg-[#EFE5CD]/90 text-[#433422]'
              : 'bg-white/90 text-gray-800'
          }`}>

            {/* Theme toggles */}
            <button
              onClick={() => setTheme('light')}
              className={`w-7 h-7 rounded-full flex items-center justify-center mx-1 border transition-all ${
                theme === 'light'
                  ? 'border-gold ring-2 ring-gold/40 scale-105'
                  : 'border-gray-300 hover:border-gray-400'
              } bg-white shadow-xs`}
              title="Nền sáng"
            />
            <button
              onClick={() => setTheme('sepia')}
              className={`w-7 h-7 rounded-full flex items-center justify-center mx-1 border transition-all ${
                theme === 'sepia'
                  ? 'border-gold ring-2 ring-gold/40 scale-105'
                  : 'border-[#D6C5A5] hover:border-[#b8a480]'
              } bg-[#F4ECD8] shadow-xs`}
              title="Nền vàng dịu"
            />
            <button
              onClick={() => setTheme('dark')}
              className={`w-7 h-7 rounded-full flex items-center justify-center mx-1 border transition-all ${
                theme === 'dark'
                  ? 'border-gold ring-2 ring-gold/40 scale-105'
                  : 'border-gray-600 hover:border-gray-400'
              } bg-[#12161f] shadow-xs`}
              title="Nền tối"
            />

            {/* Chế độ Truyện chữ: Hỗ trợ đổi cỡ chữ và font */}
            {!hasImages && (
              <>
                <div className={`w-px h-5 mx-1 ${theme === 'dark' ? 'bg-[#2a3242]' : theme === 'sepia' ? 'bg-[#D6C5A5]' : 'bg-gray-200'}`} />
                {/* Font Family switch */}
                <button
                  onClick={() => {
                    const nextFont = fontFamily === "serif" ? "sans" : "serif";
                    setFontFamily(nextFont);
                  }}
                  className={`px-2.5 py-1 mx-1 rounded-lg text-xs font-medium border transition-colors ${
                    theme === "dark"
                      ? "border-[#2a3242] text-white hover:bg-white/10"
                      : "border-gray-200 text-gray-700 hover:bg-black/5"
                  }`}
                  title="Chuyển đổi kiểu font chữ"
                >
                  {fontFamily === "serif" ? "Có chân" : "Không chân"}
                </button>

                {/* Font size toggles */}
                <button
                  onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                  className="w-8 h-8 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-serif font-bold text-sm"
                  title="Thu nhỏ chữ"
                >
                  A-
                </button>
                <span className="text-xs font-mono opacity-60 w-5 text-center">{fontSize}</span>
                <button
                  onClick={() => setFontSize(Math.min(32, fontSize + 2))}
                  className="w-8 h-8 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors font-serif font-bold text-base"
                  title="Phóng to chữ"
                >
                  A+
                </button>

                {/* Shield badge */}
                <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20 ml-1">
                  <i className="fa-solid fa-shield-halved text-[10px]" />
                  <span>Đã bảo vệ</span>
                </div>
              </>
            )}

            {/* Chế độ Ảnh bảo vệ bản quyền */}
            {isProtectedNovel && (
              <div
                className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-medium border border-amber-500/20 ml-2"
                title="Nội dung được bảo vệ chống sao chép"
              >
                <i className="fa-solid fa-shield-halved text-[11px]" />
                <span>Bảo vệ bản quyền</span>
              </div>
            )}

            {/* Chế độ Truyện tranh Manga / Comic */}
            {isComic && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-sky-500/10 text-sky-600 dark:text-sky-400 rounded-full text-xs font-medium border border-sky-500/20 ml-2">
                <i className="fa-solid fa-image text-[11px]" />
                <span>Truyện tranh ({chapter?.imageUrls?.length ?? 0} trang)</span>
              </div>
            )}
          </div>
        </div>

        {/* Header */}
        <div className={`text-center mb-10 border-b ${borderClasses[theme]} pb-8`}>
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-gold font-medium tracking-widest uppercase text-sm">
              Chương {chapter.chapterNumber}
            </span>
            {isComic && (
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-medium">
                Manga / Comic
              </span>
            )}
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance">
            {chapter.title}
          </h1>
        </div>

        {/* Chapter Body */}
        {hasImages ? (
          /* Chế độ Xem Trang Ảnh (Truyện tranh hoặc Ảnh chống copy) */
          <div className="max-w-3xl mx-auto flex flex-col items-center select-none space-y-3 py-2">
            {chapter.imageUrls && chapter.imageUrls.length > 0 ? (
              chapter.imageUrls.map((url, idx) => (
                <div key={idx} className="w-full relative group">
                  <img
                    src={url}
                    alt={`Trang ${idx + 1}`}
                    loading="lazy"
                    className={`w-full h-auto object-cover mx-auto block transition-all duration-200 ${
                      isProtectedNovel
                        ? "border-0 shadow-none"
                        : "rounded-lg shadow-md"
                    }`}
                    style={getProtectedImageStyle()}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=800&q=80";
                    }}
                  />
                  {isComic && (
                    <span className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white/90 text-xs px-2.5 py-1 rounded-full font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      Trang {idx + 1} / {chapter.imageUrls!.length}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-16 opacity-50">
                <i className="fa-solid fa-image text-4xl mb-3 opacity-40 block" />
                <p className="text-sm">Chương này chưa có hình ảnh nào được tải lên.</p>
              </div>
            )}
          </div>
        ) : (
          /* Chế độ Text Reader cho Truyện chữ: Tự do đổi màu nền, đổi cỡ chữ, đổi font mà vẫn chống copy 100% */
          <div
            className={`${
              fontFamily === "serif" ? "font-serif" : "font-sans"
            } mx-auto relative select-none cursor-default py-4`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight: 1.9,
              maxWidth: "780px",
              userSelect: "none",
              WebkitUserSelect: "none",
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              showCopyToast("Nội dung đã được bảo vệ bản quyền chống sao chép!");
            }}
            onDragStart={(e) => e.preventDefault()}
          >
            {/* Watermark chìm mờ bảo vệ bản quyền */}
            <div
              className="pointer-events-none select-none absolute inset-0 flex flex-col justify-around items-center opacity-[0.03] dark:opacity-[0.04] overflow-hidden"
              aria-hidden="true"
            >
              <div className="text-2xl sm:text-3xl font-black rotate-[-25deg] tracking-widest uppercase">
                STORYNEST • BẢN QUYỀN ĐỌC TRUYỆN
              </div>
              <div className="text-2xl sm:text-3xl font-black rotate-[-25deg] tracking-widest uppercase">
                STORYNEST • PROTECTED CONTENT
              </div>
              <div className="text-2xl sm:text-3xl font-black rotate-[-25deg] tracking-widest uppercase">
                STORYNEST • BẢN QUYỀN ĐỌC TRUYỆN
              </div>
            </div>

            {chapter.content.split("\n").map((paragraph, index) =>
              paragraph.trim() ? (
                <p key={index} className="mb-6 indent-8 text-justify relative z-10">
                  {paragraph}
                </p>
              ) : (
                <br key={index} />
              )
            )}
          </div>
        )}

        {/* Bottom Chapter Navigation Bar */}
        <div className={`mt-16 pt-8 border-t ${borderClasses[theme]}`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto">
            {/* Prev button */}
            <button
              onClick={() => prevChapter && goToChapter(prevChapter.id)}
              disabled={!prevChapter}
              className={`w-full sm:w-auto px-5 py-3 rounded-xl border flex items-center justify-center gap-2 font-medium text-sm transition-all ${
                prevChapter
                  ? `${borderClasses[theme]} hover:border-gold hover:text-gold ${cardClasses[theme]}`
                  : "opacity-40 border-transparent cursor-not-allowed"
              }`}
            >
              <i className="fa-solid fa-chevron-left text-xs" />
              <span>Chương trước</span>
            </button>

            {/* Quick Table of Contents button */}
            {sortedChapters.length > 0 && (
              <button
                onClick={() => setShowChapterList(true)}
                className={`w-full sm:w-auto px-5 py-3 rounded-xl border ${borderClasses[theme]} ${cardClasses[theme]} hover:border-gold hover:text-gold transition-all text-sm font-medium flex items-center justify-center gap-2`}
              >
                <i className="fa-solid fa-list-ul text-gold text-xs" />
                <span>Mục lục ({sortedChapters.length})</span>
              </button>
            )}

            {/* Next button */}
            <button
              onClick={() => nextChapter && goToChapter(nextChapter.id)}
              disabled={!nextChapter}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-all shadow-md ${
                nextChapter
                  ? "bg-gold text-ink-bg hover:bg-gold-dim shadow-gold/20"
                  : "opacity-40 bg-gray-500/20 text-ink-muted cursor-not-allowed"
              }`}
            >
              <span>Chương sau</span>
              {nextChapter?.requiresAccess && (
                <i className="fa-solid fa-lock text-xs ml-1" />
              )}
              <i className="fa-solid fa-chevron-right text-xs" />
            </button>
          </div>

          <p className="text-center text-xs opacity-50 mt-4 flex items-center justify-center gap-1.5">
            <span>Mẹo: Bạn có thể nhấn phím mũi tên</span>
            <span className="inline-flex items-center gap-1 font-mono bg-black/20 px-1.5 py-0.5 rounded border border-white/10 text-[11px]">
              <i className="fa-solid fa-arrow-left text-[10px]" /> / <i className="fa-solid fa-arrow-right text-[10px]" />
            </span>
            <span>trên bàn phím để chuyển chương nhanh.</span>
          </p>
        </div>

        {/* Footer Nav */}
        <div className="mt-16 pb-10 flex flex-col items-center justify-center text-center">
          <div className="flex gap-2 items-center text-gold/50 mb-3">
            <div className="w-2 h-2 rounded-full bg-current" />
            <div className="w-2 h-2 rounded-full bg-current" />
            <div className="w-2 h-2 rounded-full bg-current" />
          </div>
          <p className="text-xs uppercase tracking-widest opacity-50 mb-6">
            Hết chương {chapter.chapterNumber}
          </p>
          <button
            onClick={() => {
              if (activeStoryId) {
                navigate(`/stories/${activeStoryId}`);
              } else {
                navigate(-1);
              }
            }}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium border ${borderClasses[theme]} ${cardClasses[theme]} hover:border-gold hover:text-gold transition-all inline-flex items-center gap-2 shadow-sm`}
          >
            <i className="fa-solid fa-arrow-left text-xs" />
            <span>Quay lại chi tiết truyện</span>
          </button>
        </div>

        {/* Discussions Section */}
        <div className={`mt-8 pt-8 border-t ${borderClasses[theme]}`}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-xl font-bold flex items-center gap-2">
              <i className="fa-regular fa-comments text-gold text-lg" />
              Thảo luận chương ({discussions?.length || 0})
            </h3>
          </div>

          {/* Comment Form */}
          {isLoggedIn ? (
            <form onSubmit={handlePostComment} className="mb-8">
              <div className={`p-4 rounded-2xl border ${borderClasses[theme]} ${cardClasses[theme]}`}>
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Chia sẻ cảm nghĩ của bạn về chương này..."
                  rows={3}
                  className="w-full bg-transparent resize-none text-sm placeholder:opacity-50 focus:outline-none"
                />
                <div className="flex items-center justify-between pt-2 border-t border-current/10 mt-2">
                  <span className="text-xs opacity-50">Tôn trọng cộng đồng khi bình luận</span>
                  <button
                    type="submit"
                    disabled={postCommentMutation.isPending || !commentText.trim()}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-gold text-ink-bg hover:bg-gold-dim disabled:opacity-40 transition-all flex items-center gap-2 shadow-sm"
                  >
                    {postCommentMutation.isPending && (
                      <i className="fa-solid fa-spinner fa-spin text-xs" />
                    )}
                    Gửi bình luận
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className={`p-6 rounded-2xl border ${borderClasses[theme]} ${cardClasses[theme]} text-center mb-8`}>
              <p className="text-sm opacity-70 mb-3">Vui lòng đăng nhập để tham gia thảo luận chương này.</p>
              <Link
                to="/login"
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-gold text-ink-bg hover:bg-gold-dim transition-all inline-block shadow-sm"
              >
                Đăng nhập ngay
              </Link>
            </div>
          )}

          {/* Comment List */}
          <div className="space-y-3">
            {isDiscussionsLoading ? (
              <div className="py-6 text-center opacity-60 flex items-center justify-center gap-2 text-sm">
                <i className="fa-solid fa-spinner fa-spin text-gold" />
                <span>Đang tải bình luận...</span>
              </div>
            ) : discussions && discussions.length > 0 ? (
              discussions.map((d) => (
                <div
                  key={d.id}
                  className={`p-4 rounded-2xl border ${borderClasses[theme]} ${cardClasses[theme]} transition-all`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gold/15 text-gold border border-gold/25 font-bold text-xs flex items-center justify-center shrink-0">
                        {(d.user || "U").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <span className="text-xs font-semibold block">{d.user || "Độc giả"}</span>
                        <span className="text-[10px] opacity-50 block">
                          {new Date(d.createdAt).toLocaleDateString("vi-VN", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                    {isAdmin && (
                      <button
                        onClick={() => {
                          if (confirm("Admin: Bạn có chắc muốn ẩn bình luận này không?")) {
                            hideCommentMutation.mutate(d.id);
                          }
                        }}
                        className="text-xs text-rose-400 hover:text-rose-300 opacity-60 hover:opacity-100 p-1"
                        title="Ẩn bình luận vi phạm"
                      >
                        <i className="fa-solid fa-eye-slash" />
                      </button>
                    )}
                  </div>
                  <p className="text-sm opacity-90 leading-relaxed whitespace-pre-line pl-10">
                    {d.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="py-8 text-center opacity-50 text-xs">
                Chưa có bình luận nào cho chương này. Hãy là người đầu tiên để lại ý kiến!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Thông báo Toast khi người đọc cố gắng sao chép hoặc bôi đen */}
      {copyWarning && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-gray-900/95 dark:bg-black/95 text-white text-xs sm:text-sm font-medium shadow-2xl border border-white/10 flex items-center gap-2.5 backdrop-blur-md animate-bounce pointer-events-none">
          <i className="fa-solid fa-shield-halved text-amber-400 text-sm" />
          <span>{copyWarning}</span>
        </div>
      )}

      {/* Nút Cuộn Lên Đầu Trang */}
      {showScrollTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 w-11 h-11 rounded-full bg-orange-600 hover:bg-orange-700 text-white shadow-xl flex items-center justify-center transition-all hover:scale-110 cursor-pointer"
          title="Cuộn lên đầu trang"
        >
          <i className="fa-solid fa-arrow-up text-sm" />
        </button>
      )}

      {/* Chapter Selection Drawer / Modal */}
      {showChapterList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowChapterList(false)}
          />
          <div className={`relative w-full max-w-lg ${cardClasses[theme]} border ${borderClasses[theme]} rounded-2xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden`}>
            <div className={`flex items-center justify-between p-4 border-b ${borderClasses[theme]}`}>
              <div>
                <h3 className="font-serif font-bold text-lg">Danh sách chương</h3>
                <p className="text-xs opacity-60">{story?.title || "Mục lục"}</p>
              </div>
              <button
                onClick={() => setShowChapterList(false)}
                className="p-1.5 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              >
                <i className="fa-solid fa-xmark text-lg" />
              </button>
            </div>

            <div className="p-3 overflow-y-auto space-y-2">
              {readChapterGroups.map((group: ChapterGroup) => {
                if (!group.isFolder) {
                  return (
                    <div key={group.partName} className="space-y-1">
                      {group.chapters.map((c: ChapterListItem) => {
                        const isCurrent = c.id === id;
                        return (
                          <button
                            key={c.id}
                            onClick={() => goToChapter(c.id)}
                            className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 cursor-pointer ${
                              isCurrent
                                ? "bg-gold/15 text-gold border border-gold/30 font-medium"
                                : "hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100"
                            }`}
                          >
                            <div className="min-w-0">
                              <span className="text-xs opacity-60 font-mono block">Chương {c.chapterNumber}</span>
                              <span className="text-sm truncate block">{c.title}</span>
                            </div>
                            {c.requiresAccess && (
                              <span className="text-xs text-gold bg-gold/10 px-2 py-0.5 rounded-full shrink-0 border border-gold/20">
                                VIP
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                }

                const isExpanded = readExpandedFolders.has(group.partName);
                return (
                  <div key={group.partName} className={`rounded-xl border ${borderClasses[theme]} overflow-hidden`}>
                    <button
                      type="button"
                      onClick={() => toggleReadFolder(group.partName)}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <i className={`fa-solid ${isExpanded ? "fa-folder-open text-gold" : "fa-folder text-gold/70"} text-sm shrink-0`} />
                        <span className="text-xs font-bold truncate">{group.partName}</span>
                        <span className="text-[10px] opacity-60 font-mono">({group.chapters.length})</span>
                      </div>
                      <i className={`fa-solid fa-chevron-down text-xs opacity-50 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                    </button>

                    {isExpanded && (
                      <div className={`p-1.5 space-y-1 border-t ${borderClasses[theme]} bg-black/5 dark:bg-white/5`}>
                        {group.chapters.map((c: ChapterListItem) => {
                          const isCurrent = c.id === id;
                          return (
                            <button
                              key={c.id}
                              onClick={() => goToChapter(c.id)}
                              className={`w-full text-left p-2.5 rounded-lg transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                isCurrent
                                  ? "bg-gold/20 text-gold border border-gold/40 font-semibold"
                                  : "hover:bg-black/5 dark:hover:bg-white/5 opacity-80 hover:opacity-100"
                              }`}
                            >
                              <div className="min-w-0">
                                <span className="text-[11px] opacity-60 font-mono block">Chương {c.chapterNumber}</span>
                                <span className="text-xs truncate block">{c.title}</span>
                              </div>
                              {c.requiresAccess && (
                                <span className="text-[10px] text-gold bg-gold/10 px-1.5 py-0.5 rounded-full shrink-0 border border-gold/20">
                                  VIP
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
