import { Link, useNavigate } from "react-router-dom";
import { useAuthStore, useIsAdmin } from "../store/authStore";
import { useState } from "react";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { accessToken, displayName, logout } = useAuthStore();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ink-bg/90 backdrop-blur-xl border-b border-ink-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group focus:outline-none">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:shadow-gold-glow transition-all duration-300 group-hover:scale-105 text-ink-bg">
              <i className="fa-solid fa-book-open text-base" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-white group-hover:text-gold transition-colors">
                StoryReader
              </span>
              <span className="text-[10px] text-ink-muted -mt-1 font-sans tracking-widest uppercase">
                Đọc Truyện Online
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1.5">
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
                <div className="w-px h-5 bg-ink-border mx-2" />

                {/* Notification Bell */}
                <NotificationBell />

                {/* User menu */}
                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-ink-card border border-transparent hover:border-ink-border transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center group-hover:border-gold transition-colors">
                      <span className="text-xs font-bold text-amber-400 uppercase">
                        {displayName?.charAt(0) || "U"}
                      </span>
                    </div>
                    <span className="text-sm text-ink-text font-medium max-w-[130px] truncate group-hover:text-gold transition-colors">
                      {displayName}
                    </span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                    }}
                    className="px-3 py-1.5 rounded-xl text-sm font-medium text-ink-muted hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-px h-5 bg-ink-border mx-2" />
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-medium text-ink-muted hover:text-white hover:bg-ink-card transition-all"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-ink-bg hover:brightness-110 transition-all shadow-md shadow-amber-500/20"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </nav>

          {/* Mobile actions (Bell + Hamburger) */}
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

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ink-border bg-ink-card/95 backdrop-blur-2xl">
          <div className="px-4 py-4 space-y-1.5">
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
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 flex items-center justify-center">
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
                    className="block px-4 py-2.5 rounded-xl text-sm text-center font-semibold bg-gradient-to-r from-amber-500 to-amber-600 text-ink-bg"
                  >
                    Đăng ký
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
