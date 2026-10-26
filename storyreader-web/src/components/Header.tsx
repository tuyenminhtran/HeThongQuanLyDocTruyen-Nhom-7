import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuthStore, useIsAdmin } from "../store/authStore";
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { getGenres } from "../api/genres";
import NotificationBell from "./NotificationBell";

export default function Header() {
  const { accessToken, displayName, logout } = useAuthStore();
  const isAdmin = useIsAdmin();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [keyword, setKeyword] = useState(searchParams.get("q") || "");
  const [showGenreMenu, setShowGenreMenu] = useState(false);
  const genreMenuRef = useRef<HTMLDivElement>(null);

  const { data: genres } = useQuery({
    queryKey: ["genres"],
    queryFn: getGenres,
  });

  // Đồng bộ keyword khi URL param thay đổi
  useEffect(() => {
    setKeyword(searchParams.get("q") || "");
  }, [searchParams]);

  // Click ngoài đóng dropdown thể loại
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (genreMenuRef.current && !genreMenuRef.current.contains(event.target as Node)) {
        setShowGenreMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-200">
      {/* ============================================================ */}
      {/* 1. THANH TRÊN (WHITE TOP BAR) - LOGO, SEARCH, AUTH BUTTONS   */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex justify-between items-center h-16 gap-4">
          
          {/* Logo */}
          <div className="flex items-center shrink-0">
            <Link to="/" className="flex flex-col group focus:outline-none">
              <span className="font-serif text-2xl font-black tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
                Story<span className="text-orange-500">Reader</span>
              </span>
              <span className="text-[10px] text-slate-500 -mt-1 font-sans tracking-widest uppercase font-semibold">
                Đọc Truyện Online
              </span>
            </Link>
          </div>

          {/* Thanh tìm kiếm hình Pill bo tròn chuẩn TruyenQQ (Desktop) */}
          <div className="flex-1 max-w-lg hidden md:block mx-2">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Bạn muốn tìm truyện gì..."
                className="w-full bg-slate-50 border border-slate-300 hover:border-slate-400 focus:bg-white focus:border-orange-500 rounded-full pl-5 pr-11 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 shadow-xs transition-all"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-orange-500 hover:bg-orange-50 transition-colors"
                aria-label="Tìm kiếm"
              >
                <i className="fa-solid fa-magnifying-glass text-sm" />
              </button>
              {keyword && (
                <button
                  type="button"
                  onClick={() => {
                    setKeyword("");
                    navigate("/");
                  }}
                  className="absolute right-9 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <i className="fa-solid fa-xmark text-xs" />
                </button>
              )}
            </form>
          </div>

          {/* Right Area: Buttons for Guest or Logged In User */}
          <div className="hidden md:flex items-center gap-2.5 shrink-0">
            {accessToken ? (
              <div className="flex items-center gap-3">
                {/* VIP member badge */}
                <Link
                  to="/pricing"
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-300 hover:bg-amber-100 transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <i className="fa-solid fa-crown text-amber-500 text-xs" />
                  <span>VIP</span>
                </Link>

                {/* Quản trị (Admin) */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:text-orange-600 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                  >
                    <i className="fa-solid fa-sliders text-xs" />
                    <span>Quản trị</span>
                  </Link>
                )}

                {/* Notification Bell */}
                <NotificationBell />

                {/* Profile Link with Avatar */}
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl hover:bg-slate-100 border border-slate-200 transition-colors group"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {displayName?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <span className="text-xs font-semibold text-slate-800 max-w-[110px] truncate group-hover:text-orange-600 transition-colors">
                    {displayName}
                  </span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                  title="Đăng xuất"
                >
                  <i className="fa-solid fa-arrow-right-from-bracket text-xs" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {/* Đăng ký (Nút xanh da trời chuẩn TruyenQQ) */}
                <Link
                  to="/register"
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-sky-500 hover:bg-sky-600 text-white shadow-xs transition-colors"
                >
                  Đăng ký
                </Link>
                {/* Đăng nhập (Nút xanh dương chuẩn TruyenQQ) */}
                <Link
                  to="/login"
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors"
                >
                  Đăng nhập
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger & bell */}
          <div className="flex items-center gap-2 md:hidden">
            {accessToken && <NotificationBell />}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 w-10 h-10 flex items-center justify-center focus:outline-none"
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

      {/* ============================================================ */}
      {/* 2. THANH ĐIỀU HƯỚNG MÀU CAM RỰC RỠ (TRUYENQQ SIGNATURE BAR)  */}
      {/* ============================================================ */}
      <nav className="bg-[#f37021] text-white shadow-md relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="flex items-center justify-between overflow-x-auto scrollbar-none py-2 gap-1 sm:gap-2 text-xs sm:text-sm font-semibold whitespace-nowrap">
            
            <div className="flex items-center gap-1 sm:gap-2">
              <Link
                to="/"
                className="px-3 py-1.5 rounded-md hover:bg-black/10 transition-colors flex items-center gap-1.5"
              >
                <i className="fa-solid fa-house text-xs" />
                <span>Trang Chủ</span>
              </Link>

              {/* Thể loại Dropdown */}
              <div className="relative" ref={genreMenuRef}>
                <button
                  type="button"
                  onClick={() => setShowGenreMenu(!showGenreMenu)}
                  className="px-3 py-1.5 rounded-md hover:bg-black/10 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Thể Loại</span>
                  <i className={`fa-solid fa-chevron-down text-[10px] transform transition-transform ${showGenreMenu ? "rotate-180" : ""}`} />
                </button>

                {showGenreMenu && (
                  <div className="absolute left-0 mt-2 w-72 sm:w-96 bg-white border border-slate-200 rounded-xl shadow-xl p-4 z-50 text-slate-800 text-xs animate-fadeIn">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 pb-1 border-b border-slate-100">
                      Tất cả thể loại
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      <Link
                        to="/"
                        onClick={() => setShowGenreMenu(false)}
                        className="p-1.5 rounded hover:bg-orange-50 hover:text-orange-600 font-medium transition-colors"
                      >
                        Tất cả
                      </Link>
                      {genres?.map((g) => (
                        <Link
                          key={g.id}
                          to={`/?genre=${g.id}`}
                          onClick={() => setShowGenreMenu(false)}
                          className="p-1.5 rounded hover:bg-orange-50 hover:text-orange-600 font-medium transition-colors truncate"
                        >
                          {g.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Xếp Hạng */}
              <Link
                to="/?sort=top"
                className="px-3 py-1.5 rounded-md hover:bg-black/10 transition-colors flex items-center gap-1"
              >
                <span>Xếp Hạng</span>
                <i className="fa-solid fa-arrow-trend-up text-xs" />
              </Link>

              {/* Tìm truyện */}
              <Link
                to="/?filter=advance"
                className="px-3 py-1.5 rounded-md hover:bg-black/10 transition-colors flex items-center gap-1"
              >
                <span>Tìm Truyện</span>
              </Link>

              {/* Lịch sử / Tủ sách */}
              <Link
                to={accessToken ? "/profile" : "/login"}
                className="px-3 py-1.5 rounded-md hover:bg-black/10 transition-colors flex items-center gap-1"
              >
                <span>Lịch Sử</span>
              </Link>

              {/* Theo dõi */}
              <Link
                to={accessToken ? "/profile?tab=bookmarks" : "/login"}
                className="px-3 py-1.5 rounded-md hover:bg-black/10 transition-colors flex items-center gap-1"
              >
                <span>Theo Dõi</span>
              </Link>
            </div>

            {/* Bên phải thanh cam: Gói VIP nổi bật */}
            <div className="flex items-center gap-2">
              <Link
                to="/pricing"
                className="px-3 py-1 rounded-md bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 transition-colors flex items-center gap-1.5 shadow-xs text-xs"
              >
                <i className="fa-solid fa-crown text-xs" />
                <span>Nâng cấp VIP</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* ============================================================ */}
      {/* 3. MENU MOBILE KHI BẤM NÚT HAMBURGER                          */}
      {/* ============================================================ */}
      {mobileOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white">
          <div className="px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <form onSubmit={(e) => { handleSearchSubmit(e); setMobileOpen(false); }} className="relative">
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Bạn muốn tìm truyện gì..."
                className="w-full bg-slate-50 border border-slate-300 rounded-full pl-4 pr-10 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-500">
                <i className="fa-solid fa-magnifying-glass text-sm" />
              </button>
            </form>

            <div className="space-y-1 pt-1">
              <Link
                to="/"
                onClick={() => setMobileOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                Trang chủ
              </Link>
              <Link
                to="/pricing"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-amber-700 bg-amber-50 font-semibold"
              >
                <i className="fa-solid fa-crown text-amber-500 text-xs" />
                Gói VIP
              </Link>

              {accessToken ? (
                <>
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      Trang quản trị
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    Tủ sách & Hồ sơ ({displayName})
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      navigate("/login");
                      setMobileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
                  >
                    Đăng xuất
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100">
                  <Link
                    to="/register"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 rounded-lg text-sm text-center font-semibold bg-sky-500 text-white"
                  >
                    Đăng ký
                  </Link>
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-2 rounded-lg text-sm text-center font-semibold bg-blue-600 text-white"
                  >
                    Đăng nhập
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
