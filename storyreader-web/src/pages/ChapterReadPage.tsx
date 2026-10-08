import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getChapterContent } from "../api/chapters";
import { AxiosError } from "axios";
import { useState, useEffect } from "react";
import { getFallbackChapterContent } from "../data/mockDetails";

type Theme = "dark" | "light" | "sepia";

export default function ChapterReadPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [fontSize, setFontSize] = useState(() => {
    return Number(localStorage.getItem("storyreader-font-size")) || 20;
  });
  
  const [theme, setTheme] = useState<Theme>(() => {
    return (localStorage.getItem("storyreader-theme") as Theme) || "dark";
  });

  useEffect(() => {
    localStorage.setItem("storyreader-font-size", fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem("storyreader-theme", theme);
  }, [theme]);

  const { data: apiChapter, isLoading, error } = useQuery({
    queryKey: ["chapter", id],
    queryFn: async () => {
      try {
        return await getChapterContent(id!);
      } catch (err) {
        if ((err as AxiosError)?.response?.status === 403) throw err;
        return null;
      }
    },
    enabled: !!id,
    retry: false,
  });

  const chapter = apiChapter || (id ? getFallbackChapterContent(id) : null);

  // Theme styling
  const themeClasses = {
    dark: "bg-ink-bg text-ink-text",
    light: "bg-[#F8F9FA] text-[#1A1D20]",
    sepia: "bg-[#F4ECD8] text-[#433422]",
  };

  const borderClasses = {
    dark: "border-ink-border",
    light: "border-gray-300",
    sepia: "border-[#D6C5A5]",
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
        <div className={`flex flex-col items-center justify-center min-h-[calc(100vh-65px)] px-4 text-center ${themeClasses[theme]} transition-colors duration-300`}>
          <div className="w-20 h-20 bg-gold/10 border border-gold/20 rounded-full flex items-center justify-center mb-6 text-gold">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
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
    if (!chapter) {
      return (
        <div className={`min-h-[calc(100vh-65px)] ${themeClasses[theme]} transition-colors duration-300 text-center py-20 px-4`}>
          <p className="text-red-400 font-medium">Không thể tải nội dung chương. Vui lòng thử lại sau.</p>
          <button onClick={() => navigate(-1)} className="mt-4 opacity-70 hover:opacity-100 underline">
            Quay lại
          </button>
        </div>
      );
    }
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

        {/* Content */}
        <div
          className="font-serif mx-auto opacity-90"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: 1.8,
            maxWidth: "800px",
          }}
        >
          {chapter.content.split('\n').map((paragraph, index) => (
            paragraph.trim() ? (
              <p key={index} className="mb-6 indent-8 text-justify">
                {paragraph}
              </p>
            ) : (
              <br key={index} />
            )
          ))}
        </div>
        
        {/* Footer Nav */}
        <div className="mt-20 pb-10 flex justify-center">
          <div className="flex gap-2 items-center text-gold/50">
            <div className="w-2 h-2 rounded-full bg-current" />
            <div className="w-2 h-2 rounded-full bg-current" />
            <div className="w-2 h-2 rounded-full bg-current" />
          </div>
        </div>
      </div>
    </div>
  );
}
