import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore, useIsAdmin } from "../store/authStore";
import { useState, useEffect } from "react";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { accessToken, displayName, logout } = useAuthStore();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");

  // Đồng bộ keyword khi URL param thay đổi
  useEffect(() => {
    setKeyword(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (trimmed) {
      navigate(`/?q=${encodeURIComponent(trimmed)}`);
    } else {
      navigate("/");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-ink-bg/95 backdrop-blur-md border-b border-ink-border transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0 focus:outline-none">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 text-slate-950 font-bold group-hover:scale-105 transition-transform">
              <i className="fa-solid fa-book-open text-sm" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-lg font-bold tracking-tight text-white group-hover:text-gold transition-colors">
                StoryReader
              </span>
              <span className="text-[9px] text-ink-muted -mt-1 font-sans tracking-widest uppercase">
                Đọc Truyện Online
              </span>
            </div>
          </Link>

          {/* Thanh tìm kiếm trên Header (Desktop) */}
          <div className="flex-1 max-w-md hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm tên truyện, tác giả..."
                className="w-full bg-ink-card border border-ink-border hover:border-ink-border-hover focus:border-gold rounded-xl pl-9 pr-8 py-2 text-xs sm:text-sm text-ink-text placeholder:text-ink-muted/60 focus:outline-none focus:ring-1 focus:ring-gold/30 transition-all"
              />
              <i className="fa-solid fa-magnifying-glass text-ink-muted text-xs absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              {keyword && (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword("");
                    navigate("/");
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-white p-1"
                >
                  <i className="fa-solid fa-xmark text-xs" />
                </button>
              )}
            </form>
          </div>

          {/* Desktop nav menu */}
          <nav className="hidden md:flex items-center gap-1.5 shrink-0">
            <Link
              to="/"
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-ink-muted hover:text-white hover:bg-ink-card transition-all"
            >
              Trang chủ
            </Link>
            <Link
              to="/pricing"
              className="px-3.5 py-2 rounded-xl text-sm font-semibold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/15 border border-amber-500/20 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <i className="fa-solid fa-crown text-amber-400 text-xs" />
              Gói VIP
            </Link>

            {accessToken ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-3.5 py-2 rounded-xl text-sm font-medium text-ink-muted hover:text-white hover:bg-ink-card transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <i className="fa-solid fa-sliders text-xs" />
                      Quản trị
                    </span>
                  </Link>
                )}

                {/* Divider */}
                <div className="w-px h-5 bg-ink-border mx-1.5" />

                {/* Notification Bell */}
                <NotificationBell />

                {/* User menu */}
                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-ink-card border border-transparent hover:border-ink-border transition-all group"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center group-hover:border-gold transition-colors">
                      <span className="text-xs font-bold text-amber-400 uppercase">
                        {displayName?.charAt(0) || "U"}
                      </span>
                    </div>
                    <span className="text-sm text-ink-text font-medium max-w-[120px] truncate group-hover:text-gold transition-colors">
                      {displayName}
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-medium text-ink-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-px h-5 bg-ink-border mx-1.5" />
                <Link
                  to="/login"
                  className="px-3.5 py-2 rounded-xl text-sm font-medium text-ink-muted hover:text-white hover:bg-ink-card transition-all"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:brightness-110 transition-all shadow-md shadow-amber-500/20"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </nav>

          {/* Mobile actions (Search icon + Bell + Hamburger) */}
          <div className="flex items-center gap-2 md:hidden">
            {accessToken && <NotificationBell />}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-xl text-ink-muted hover:text-white hover:bg-ink-card transition-all border border-transparent hover:border-ink-border w-10 h-10 flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <i className="fa-solid fa-xmark text-lg" />
              ) : (
                <i className="fa-solid fa-bars text-lg" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ink-border bg-ink-card/95 backdrop-blur-2xl">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Search Input */}
            <form onSubmit={(e) => { handleSearchSubmit(e); setMobileOpen(false); }} className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Tìm kiếm truyện, tác giả..."
                className="w-full bg-ink-bg border border-ink-border rounded-xl pl-9 pr-4 py-2 text-sm text-ink-text placeholder:text-ink-muted focus:outline-none focus:border-gold"
              />
              <i className="fa-solid fa-magnifying-glass text-ink-muted text-xs absolute left-3 top-1/2 -translate-y-1/2" />
            </form>

            <div className="space-y-1">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-ink-muted hover:text-white hover:bg-ink-elevated transition-all"
              >
                Trang chủ
              </Link>
              <Link
                to="/pricing"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm text-amber-400 bg-amber-500/10 border border-amber-500/20 font-semibold"
              >
                <i className="fa-solid fa-crown text-amber-400 text-xs" />
                Gói VIP
              </Link>

              {accessToken ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3.5 py-2.5 rounded-xl text-sm font-medium text-ink-muted hover:text-white hover:bg-ink-elevated transition-all"
                    >
                      Trang quản trị
                    </Link>
                  )}

                  <div className="border-t border-ink-border my-2" />

                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)} 
                    className="flex items-center gap-3 px-3.5 py-2.5 hover:bg-ink-elevated rounded-xl transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center">
                      <span className="text-xs font-bold text-amber-400 uppercase">
                        {displayName?.charAt(0) || "U"}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm text-ink-text font-semibold">
                        {displayName}
                      </span>
                      <span className="text-xs text-ink-muted">Xem trang cá nhân</span>
                    </div>
                  </Link>

                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                      setMobileOpen(false);
                    }}
                    className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <>
                  <div className="border-t border-ink-border my-2" />
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      to="/login"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 rounded-xl text-sm text-center font-medium text-ink-muted hover:text-white bg-ink-elevated border border-ink-border"
                    >
                      Đăng nhập
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileOpen(false)}
                      className="block px-4 py-2.5 rounded-xl text-sm text-center font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950"
                    >
                      Đăng ký
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
