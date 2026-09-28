import { Link, useNavigate } from "react-router-dom";
import { useAuthStore, useIsAdmin } from "../store/authStore";
import { useState } from "react";

export default function Header() {
  const { accessToken, displayName, logout } = useAuthStore();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-ink-bg/80 backdrop-blur-xl border-b border-ink-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center shadow-md shadow-gold/10 group-hover:shadow-gold/25 transition-shadow">
              <svg
                className="w-5 h-5 text-ink-bg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <span className="font-serif text-xl text-ink-text tracking-wide group-hover:text-gold transition-colors">
              StoryReader
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              to="/"
              className="px-3 py-2 rounded-lg text-sm text-ink-muted hover:text-ink-text hover:bg-ink-card transition-all"
            >
              Trang chủ
            </Link>

            {accessToken ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin/stories"
                    className="px-3 py-2 rounded-lg text-sm text-ink-muted hover:text-ink-text hover:bg-ink-card transition-all"
                  >
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                      </svg>
                      Quản lý
                    </span>
                  </Link>
                )}

                {/* Divider */}
                <div className="w-px h-6 bg-ink-border mx-2" />

                {/* User menu */}
                <div className="flex items-center gap-3">
                  <Link to="/profile" className="flex items-center gap-2 group cursor-pointer hover:bg-ink-card px-2 py-1.5 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center group-hover:border-gold/40 transition-colors">
                      <span className="text-xs font-semibold text-gold uppercase">
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
                    className="px-3 py-1.5 rounded-lg text-sm text-ink-muted hover:text-red-400 hover:bg-red-400/10 transition-all"
                  >
                    Đăng xuất
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="w-px h-6 bg-ink-border mx-2" />
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm text-ink-muted hover:text-ink-text hover:bg-ink-card transition-all"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-gold text-ink-bg hover:bg-gold-dim transition-all shadow-sm hover:shadow-md hover:shadow-gold/10"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </nav>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-ink-muted hover:text-ink-text hover:bg-ink-card transition-all"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-ink-border/60 bg-ink-bg/95 backdrop-blur-xl">
          <div className="px-4 py-3 space-y-1">
            <Link
              to="/"
              onClick={() => setMobileOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm text-ink-muted hover:text-ink-text hover:bg-ink-card transition-all"
            >
              Trang chủ
            </Link>

            {accessToken ? (
              <>
                {isAdmin && (
                  <Link
                    to="/admin/stories"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2.5 rounded-lg text-sm text-ink-muted hover:text-ink-text hover:bg-ink-card transition-all"
                  >
                    Quản lý truyện
                  </Link>
                )}

                <div className="border-t border-ink-border/60 my-2" />

                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)} 
                  className="flex items-center gap-2 px-3 py-2 hover:bg-ink-card rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gold/20 to-gold/5 border border-gold/20 flex items-center justify-center">
                    <span className="text-xs font-semibold text-gold uppercase">
                      {displayName?.charAt(0) || "U"}
                    </span>
                  </div>
                  <span className="text-sm text-ink-text font-medium">
                    {displayName}
                  </span>
                </Link>

                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                    setMobileOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-400/10 transition-all"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <div className="border-t border-ink-border/60 my-2" />
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-ink-muted hover:text-ink-text hover:bg-ink-card transition-all"
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="block px-3 py-2.5 rounded-lg text-sm text-center font-medium bg-gold text-ink-bg hover:bg-gold-dim transition-all"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
