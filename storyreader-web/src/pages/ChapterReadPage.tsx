import { useParams, useLocation, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getChapterContent } from "../api/chapters";
import { getStoryDetail } from "../api/stories";
import { useAuthStore } from "../store/authStore";
import { AxiosError } from "axios";
import { useState, useEffect, useCallback } from "react";

type Theme = "dark" | "light" | "sepia";

export default function ChapterReadPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { accessToken } = useAuthStore();

  const stateStoryId = (location.state as { storyId?: string } | null)?.storyId;

  const [fontSize, setFontSize] = useState(() => {
    return Number(localStorage.getItem("storyreader-font-size")) || 20;
  });

  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("storyreader-theme") as Theme) || "dark";
  });

  const [showChapterList, setShowChapterList] = useState(false);

  useEffect(() => {
    localStorage.setItem("storyreader-font-size", fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("storyreader-theme", theme);
  }, [theme]);

  const { data: chapter, isLoading, error } = useQuery({
    queryKey: ["chapter", id],
    queryFn: () => getChapterContent(id!),
    enabled: !!id,
    retry: false,
  });

  const activeStoryId = stateStoryId || chapter?.storyId;

  // Fetch story details to know full chapter list & adjacent chapters
  const { data: story } = useQuery({
    queryKey: ["storyDetail", activeStoryId],
    queryFn: () => getStoryDetail(activeStoryId!),
    enabled: !!activeStoryId,
  });

  const sortedChapters = story?.chapters
    ? [...story.chapters].sort((a, b) => a.chapterNumber - b.chapterNumber)
    : [];

  const currentIndex = sortedChapters.findIndex((c) => c.id === id);
  const prevChapter = currentIndex > 0 ? sortedChapters[currentIndex - 1] : null;
  const nextChapter =
    currentIndex >= 0 && currentIndex < sortedChapters.length - 1
      ? sortedChapters[currentIndex + 1]
      : null;

  const goToChapter = useCallback(
    (chapterId: string) => {
      setShowChapterList(false);
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
    dark: "bg-ink-bg text-ink-text",
    light: "bg-[#F8F9FA] text-[#1A1D20]",
    sepia: "bg-[#F4ECD8] text-[#433422]",
  };

  const borderClasses: Record<Theme, string> = {
    dark: "border-ink-border",
    light: "border-gray-200",
    sepia: "border-[#D6C5A5]",
  };

  const cardClasses: Record<Theme, string> = {
    dark: "bg-ink-card border-ink-border text-ink-text",
    light: "bg-white border-gray-200 text-[#1A1D20] shadow-sm",
    sepia: "bg-[#EFE5CD] border-[#D6C5A5] text-[#433422]",
  };

  if (isLoading) {
    return (
      <div className={`min-h-[calc(100vh-65px)] ${themeClasses[theme]} transition-colors duration-300`}>
        <div className="max-w-3xl mx-auto px-6 py-20 animate-pulse">
          <div className={`h-10 rounded-lg w-3/4 mb-12 mx-auto ${theme === 'dark' ? 'bg-ink-card' : 'bg-black/10'}`} />
          <div className="space-y-6">
            <div className={`h-4 rounded w-full ${theme === 'dark' ? 'bg-ink-card' : 'bg-black/10'}`} />
            <div className={`h-4 rounded w-[95%] ${theme === 'dark' ? 'bg-ink-card' : 'bg-black/10'}`} />
            <div className={`h-4 rounded w-[98%] ${theme === 'dark' ? 'bg-ink-card' : 'bg-black/10'}`} />
            <div className={`h-4 rounded w-[90%] ${theme === 'dark' ? 'bg-ink-card' : 'bg-black/10'}`} />
            <div className={`h-4 rounded w-full ${theme === 'dark' ? 'bg-ink-card' : 'bg-black/10'}`} />
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
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
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
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className={`px-6 py-2.5 rounded-xl font-medium border ${borderClasses[theme]} hover:bg-black/5 transition-all`}
            >
              Quay lại
            </button>
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-xl font-medium bg-gold text-white hover:bg-gold-dim transition-all shadow-lg shadow-gold/20"
            >
              Đăng nhập
            </Link>
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
        <div className="sticky top-20 z-10 flex justify-end mb-6 -mt-4">
          <div className={`backdrop-blur-md border ${borderClasses[theme]} rounded-full flex items-center p-1.5 shadow-lg shadow-black/10 ${theme === 'dark' ? 'bg-ink-card/80' : 'bg-white/80'}`}>
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/5 transition-colors"
              title="Quay lại"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>

            <div className={`w-px h-6 mx-1 ${theme === 'dark' ? 'bg-ink-border' : 'bg-gray-300'}`} />

            {/* Theme toggles */}
            <button
              onClick={() => setTheme('light')}
              className={`w-8 h-8 rounded-full flex items-center justify-center mx-1 border ${theme === 'light' ? 'border-gold ring-2 ring-gold/30' : 'border-transparent hover:border-gray-300'} bg-[#F8F9FA]`}
              title="Nền sáng"
            />
            <button
              onClick={() => setTheme('sepia')}
              className={`w-8 h-8 rounded-full flex items-center justify-center mx-1 border ${theme === 'sepia' ? 'border-gold ring-2 ring-gold/30' : 'border-transparent hover:border-[#D6C5A5]'} bg-[#F4ECD8]`}
              title="Nền vàng"
            />
            <button
              onClick={() => setTheme('dark')}
              className={`w-8 h-8 rounded-full flex items-center justify-center mx-1 border ${theme === 'dark' ? 'border-gold ring-2 ring-gold/30' : 'border-transparent hover:border-gray-600'} bg-ink-bg`}
              title="Nền tối"
            />

            <div className={`w-px h-6 mx-1 ${theme === 'dark' ? 'bg-ink-border' : 'bg-gray-300'}`} />

            {/* Font size toggles */}
            <button
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              className="w-10 h-10 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/5 transition-colors font-serif font-bold text-sm"
              title="Thu nhỏ chữ"
            >
              A-
            </button>
            <span className="text-xs font-mono opacity-60 w-6 text-center">{fontSize}</span>
            <button
              onClick={() => setFontSize(Math.min(32, fontSize + 2))}
              className="w-10 h-10 rounded-full flex items-center justify-center opacity-60 hover:opacity-100 hover:bg-black/5 transition-colors font-serif font-bold text-lg"
              title="Phóng to chữ"
            >
              A+
            </button>
          </div>
        </div>

        {/* Header */}
        <div className={`text-center mb-12 border-b ${borderClasses[theme]} pb-10`}>
          <h3 className="text-gold font-medium tracking-widest uppercase text-sm mb-4">
            Chương {chapter.chapterNumber}
          </h3>
          <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance">
            {chapter.title}
          </h1>
        </div>

        {/* Chapter Body */}
        <div
          className="font-serif mx-auto opacity-90"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: 1.85,
            maxWidth: "780px",
          }}
        >
          {chapter.content.split("\n").map((paragraph, index) =>
            paragraph.trim() ? (
              <p key={index} className="mb-6 indent-8 text-justify">
                {paragraph}
              </p>
            ) : (
              <br key={index} />
            )
          )}
        </div>

        {/* Bottom Chapter Navigation Bar */}
        <div className={`mt-16 pt-8 border-t ${borderClasses[theme]}`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-2xl mx-auto">
            {/* Prev button */}
            <button
              onClick={() => prevChapter && goToChapter(prevChapter.id)}
              disabled={!prevChapter}
              className={`w-full sm:w-auto px-5 py-3 rounded-xl border flex items-center justify-center gap-2 font-medium text-sm transition-all ${prevChapter
                  ? `${borderClasses[theme]} hover:border-gold hover:text-gold ${cardClasses[theme]}`
                  : "opacity-40 border-transparent cursor-not-allowed"
                }`}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span>Chương trước</span>
            </button>

            {/* Quick Table of Contents button */}
            {sortedChapters.length > 0 && (
              <button
                onClick={() => setShowChapterList(true)}
                className={`w-full sm:w-auto px-5 py-3 rounded-xl border ${borderClasses[theme]} ${cardClasses[theme]} hover:border-gold hover:text-gold transition-all text-sm font-medium flex items-center justify-center gap-2`}
              >
                <svg className="w-4 h-4 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
                <span>Mục lục ({sortedChapters.length})</span>
              </button>
            )}

            {/* Next button */}
            <button
              onClick={() => nextChapter && goToChapter(nextChapter.id)}
              disabled={!nextChapter}
              className={`w-full sm:w-auto px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-medium text-sm transition-all shadow-md ${nextChapter
                  ? "bg-gold text-ink-bg hover:bg-gold-dim shadow-gold/20"
                  : "opacity-40 bg-gray-500/20 text-ink-muted cursor-not-allowed"
                }`}
            >
              <span>Chương sau</span>
              {nextChapter?.requiresAccess && (
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              )}
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>

          <p className="text-center text-xs opacity-50 mt-4">
            Mẹo: Bạn có thể nhấn phím mũi tên ⬅ hoặc ➡ trên bàn phím để chuyển chương nhanh.
          </p>
        </div>

        {/* Footer Nav */}
        <div className="mt-20 pb-10 flex justify-center">
          <div className="flex gap-2 items-center text-gold/50">
            <div className="w-2 h-2 rounded-full bg-current" />
            <div className="w-2 h-2 rounded-full bg-current" />
            <div className="w-2 h-2 rounded-full bg-current" />
          </div>
          <p className="text-xs uppercase tracking-widest opacity-50 mb-6">Hết chương {chapter.chapterNumber}</p>
          <button
            onClick={() => navigate(-1)}
            className={`px-5 py-2 rounded-xl text-sm font-medium border ${borderClasses[theme]} hover:border-gold hover:text-gold transition-all`}
          >
            ← Quay lại chi tiết truyện
          </button>
        </div>
      </div>

      {/* Chapter Selection Drawer / Modal */}
      {showChapterList && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowChapterList(false)}
          />
          <div className="relative w-full max-w-lg bg-ink-card border border-ink-border rounded-2xl shadow-2xl max-h-[80vh] flex flex-col overflow-hidden text-ink-text">
            <div className="flex items-center justify-between p-4 border-b border-ink-border">
              <div>
                <h3 className="font-serif font-bold text-lg">Danh sách chương</h3>
                <p className="text-xs text-ink-muted">{story?.title || "Mục lục"}</p>
              </div>
              <button
                onClick={() => setShowChapterList(false)}
                className="p-1.5 rounded-lg text-ink-muted hover:text-ink-text hover:bg-ink-bg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-3 overflow-y-auto divide-y divide-ink-border/40 space-y-1">
              {sortedChapters.map((c) => {
                const isCurrent = c.id === id;
                return (
                  <button
                    key={c.id}
                    onClick={() => goToChapter(c.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between gap-3 ${isCurrent
                        ? "bg-gold/15 text-gold border border-gold/30 font-medium"
                        : "hover:bg-ink-bg/60 text-ink-text"
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
          </div>
        </div>
      )}
    </div>
  );
}
