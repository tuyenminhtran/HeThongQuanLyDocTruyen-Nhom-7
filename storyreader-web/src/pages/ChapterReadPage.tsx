import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getChapterContent } from "../api/chapters";
import { AxiosError } from "axios";
import { useState, useEffect } from "react";

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

  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / totalHeight) * 100)));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: chapter, isLoading, error } = useQuery({
    queryKey: ["chapter", id],
    queryFn: () => getChapterContent(id!),
    enabled: !!id,
    retry: false,
  });

  // Theme styling
  const themeClasses = {
    dark: "bg-ink-bg text-ink-text",
    light: "bg-[#F8F9FA] text-[#1A1D20]",
    sepia: "bg-[#F4ECD8] text-[#433422]",
  };

  const borderClasses = {
    dark: "border-ink-border",
    light: "border-gray-200",
    sepia: "border-[#D6C5A5]",
  };

  if (isLoading) {
    return (
      <div className={`min-h-[calc(100vh-65px)] ${themeClasses[theme]} transition-colors duration-300 flex items-center justify-center`}>
        <div className="max-w-2xl w-full mx-auto px-6 py-20 animate-pulse text-center">
          <div className="w-12 h-12 border-3 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <p className="text-sm font-medium opacity-60">Đang tải nội dung chương...</p>
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
          <h2 className="font-serif text-3xl font-bold mb-3 tracking-tight">
            Chương này đã bị khóa
          </h2>
          <p className="opacity-75 mb-8 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
            Nội dung này thuộc chương trả phí. Vui lòng đăng nhập hoặc nâng cấp gói VIP hội viên để đọc không giới hạn.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className={`px-5 py-2.5 rounded-xl font-medium border ${borderClasses[theme]} hover:opacity-80 transition-all text-sm`}
            >
              ← Quay lại
            </button>
            <Link
              to="/pricing"
              className="px-6 py-2.5 rounded-xl font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 transition-all shadow-lg shadow-gold/25 text-sm"
            >
              Xem Gói VIP
            </Link>
            <Link
              to="/login"
              className={`px-5 py-2.5 rounded-xl font-medium border border-gold/40 text-gold hover:bg-gold/10 transition-all text-sm`}
            >
              Đăng nhập
            </Link>
          </div>
        </div>
      );
    }
    return (
      <div className={`min-h-[calc(100vh-65px)] ${themeClasses[theme]} transition-colors duration-300 text-center py-20 px-4`}>
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        </div>
        <p className="text-red-400 font-medium">Không thể tải nội dung chương. Vui lòng thử lại sau.</p>
        <button onClick={() => navigate(-1)} className="mt-4 text-sm text-gold hover:underline">
          ← Quay lại trang trước
        </button>
      </div>
    );
  }

  if (!chapter) return null;

  return (
    <div className={`min-h-[calc(100vh-65px)] ${themeClasses[theme]} transition-colors duration-300 relative`}>
      {/* Top Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-black/10 z-50 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-150 shadow-sm shadow-gold"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
        {/* Floating Dock Toolbar */}
        <div className="sticky top-20 z-40 flex justify-end mb-8">
          <div className={`backdrop-blur-xl border ${borderClasses[theme]} rounded-full flex items-center px-3 py-1.5 shadow-2xl ${theme === 'dark' ? 'bg-ink-card/90 shadow-black/50' : 'bg-white/90 shadow-slate-300/50'}`}>
            <button
              onClick={() => navigate(-1)}
              className="w-8 h-8 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 hover:text-gold transition-colors"
              title="Quay lại truyện"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
            </button>
            
            <div className={`w-px h-5 mx-2 ${theme === 'dark' ? 'bg-ink-border' : 'bg-gray-300'}`} />
            
            {/* Theme toggles */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setTheme('light')}
                className={`w-6 h-6 rounded-full border transition-all ${theme === 'light' ? 'border-gold ring-2 ring-gold/40 scale-110' : 'border-gray-300 opacity-60 hover:opacity-100'} bg-[#F8F9FA]`}
                title="Giao diện Sáng"
              />
              <button
                onClick={() => setTheme('sepia')}
                className={`w-6 h-6 rounded-full border transition-all ${theme === 'sepia' ? 'border-gold ring-2 ring-gold/40 scale-110' : 'border-[#D6C5A5] opacity-60 hover:opacity-100'} bg-[#F4ECD8]`}
                title="Giao diện Vàng ấm (Sepia)"
              />
              <button
                onClick={() => setTheme('dark')}
                className={`w-6 h-6 rounded-full border transition-all ${theme === 'dark' ? 'border-gold ring-2 ring-gold/40 scale-110' : 'border-gray-600 opacity-60 hover:opacity-100'} bg-ink-bg`}
                title="Giao diện Tối"
              />
            </div>

            <div className={`w-px h-5 mx-2 ${theme === 'dark' ? 'bg-ink-border' : 'bg-gray-300'}`} />
            
            {/* Font size toggles */}
            <button
              onClick={() => setFontSize(Math.max(14, fontSize - 2))}
              className="w-7 h-7 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 hover:text-gold transition-colors font-serif font-bold text-xs"
              title="Thu nhỏ chữ (A-)"
            >
              A-
            </button>
            <span className="text-[11px] font-mono font-medium opacity-60 px-1">{fontSize}</span>
            <button
              onClick={() => setFontSize(Math.min(32, fontSize + 2))}
              className="w-7 h-7 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 hover:text-gold transition-colors font-serif font-bold text-sm"
              title="Phóng to chữ (A+)"
            >
              A+
            </button>
          </div>
        </div>

        {/* Chapter Header */}
        <div className={`text-center mb-12 border-b ${borderClasses[theme]} pb-10`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-semibold uppercase tracking-widest mb-4">
            <span>Chương {chapter.chapterNumber}</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold leading-tight max-w-3xl mx-auto">
            {chapter.title}
          </h1>
        </div>

        {/* Chapter Body */}
        <div
          className="font-serif mx-auto transition-all leading-relaxed"
          style={{
            fontSize: `${fontSize}px`,
            lineHeight: 1.85,
            maxWidth: "780px",
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
        
        {/* Footer Chapter End Ornament */}
        <div className="mt-20 pb-12 flex flex-col items-center justify-center">
          <div className="flex gap-2 items-center text-gold/40 mb-6">
            <span className="w-8 h-px bg-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-2.5 h-2.5 rotate-45 border border-current" />
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            <span className="w-8 h-px bg-current" />
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
    </div>
  );
}
