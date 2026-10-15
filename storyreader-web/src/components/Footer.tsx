import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-border bg-ink-card/60 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Main footer */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 group mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 text-ink-bg">
                <i className="fa-solid fa-book-open text-sm" />
              </div>
              <span className="font-serif text-lg font-bold tracking-tight text-white group-hover:text-gold transition-colors">
                StoryReader
              </span>
            </Link>
            <p className="text-sm text-ink-muted leading-relaxed">
              Nền tảng đọc truyện trực tuyến với hàng ngàn tác phẩm hấp dẫn, mang đến trải nghiệm đọc mượt mà và trọn vẹn nhất.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 mb-4 uppercase tracking-wider font-sans">
              Khám phá
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/"
                  className="text-sm text-ink-muted hover:text-gold transition-colors"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-ink-muted hover:text-gold transition-colors"
                >
                  Truyện mới cập nhật
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-ink-muted hover:text-gold transition-colors"
                >
                  Bảng xếp hạng
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-sm text-amber-400/90 hover:text-amber-300 transition-colors"
                >
                  Gói thành viên VIP
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 mb-4 uppercase tracking-wider font-sans">
              Tài khoản
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  to="/login"
                  className="text-sm text-ink-muted hover:text-gold transition-colors"
                >
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-sm text-ink-muted hover:text-gold transition-colors"
                >
                  Đăng ký tài khoản
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-sm text-ink-muted hover:text-gold transition-colors"
                >
                  Tủ sách & Hồ sơ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold text-slate-300 mb-4 uppercase tracking-wider font-sans">
              Liên hệ & Hỗ trợ
            </h3>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2.5 text-sm text-ink-muted">
                <i className="fa-solid fa-envelope text-gold/80 shrink-0 text-sm" />
                <span>contact@storyreader.vn</span>
              </li>
              <li className="flex items-center gap-2.5 text-sm text-ink-muted">
                <i className="fa-solid fa-globe text-gold/80 shrink-0 text-sm" />
                <span>storyreader.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-ink-border py-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-ink-muted">
            © {currentYear} StoryReader. Nền tảng đọc truyện trực tuyến văn minh.
          </p>
          <div className="flex items-center gap-4 text-xs text-ink-muted">
            <span className="hover:text-gold transition-colors cursor-pointer">
              Điều khoản sử dụng
            </span>
            <span className="text-ink-border">•</span>
            <span className="hover:text-gold transition-colors cursor-pointer">
              Chính sách bảo mật
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
