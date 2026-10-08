import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-ink-border/60 bg-ink-card/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Main footer */}
        <div className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 group mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-ink-bg"
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
              <span className="font-serif text-lg text-ink-text tracking-wide">
                StoryReader
              </span>
            </Link>
            <p className="text-sm text-ink-muted leading-relaxed">
              Nền tảng đọc truyện trực tuyến với hàng ngàn tác phẩm hấp dẫn từ
              nhiều thể loại khác nhau.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-ink-text mb-4 uppercase tracking-wider">
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
                  Truyện phổ biến
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-sm text-ink-muted hover:text-gold transition-colors"
                >
                  Thể loại
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-sm font-semibold text-ink-text mb-4 uppercase tracking-wider">
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
                  Đăng ký
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-ink-text mb-4 uppercase tracking-wider">
              Liên hệ
            </h3>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm text-ink-muted">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                contact@storyreader.vn
              </li>
              <li className="flex items-center gap-2 text-sm text-ink-muted">
                <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                </svg>
                storyreader.vn
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-ink-border/40 py-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-xs text-ink-muted/70">
            © {currentYear} StoryReader. Tất cả quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-ink-muted/70 hover:text-ink-muted transition-colors cursor-pointer">
              Điều khoản sử dụng
            </span>
            <span className="text-xs text-ink-muted/40">•</span>
            <span className="text-xs text-ink-muted/70 hover:text-ink-muted transition-colors cursor-pointer">
              Chính sách bảo mật
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
