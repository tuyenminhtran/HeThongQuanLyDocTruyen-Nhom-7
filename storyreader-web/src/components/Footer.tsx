import { Link } from "react-router-dom";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10">
        {/* Main footer */}
        <div className="py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block group mb-3">
              <span className="font-serif text-xl font-black tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
                Story<span className="text-orange-500">Reader</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Nền tảng đọc truyện trực tuyến số 1 với hàng ngàn tác phẩm hấp dẫn, mang đến trải nghiệm đọc mượt mà và trọn vẹn nhất.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider font-sans">
              Khám phá
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/"
                  className="text-slate-600 hover:text-orange-600 transition-colors"
                >
                  Trang chủ
                </Link>
              </li>
              <li>
                <Link
                  to="/"
                  className="text-slate-600 hover:text-orange-600 transition-colors"
                >
                  Truyện mới cập nhật
                </Link>
              </li>
              <li>
                <Link
                  to="/rankings"
                  className="text-slate-600 hover:text-orange-600 transition-colors"
                >
                  Bảng xếp hạng
                </Link>
              </li>
              <li>
                <Link
                  to="/pricing"
                  className="text-orange-600 font-semibold hover:text-orange-700 transition-colors"
                >
                  Gói thành viên VIP
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider font-sans">
              Tài khoản
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-orange-600 transition-colors"
                >
                  Đăng nhập
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="text-slate-600 hover:text-orange-600 transition-colors"
                >
                  Đăng ký tài khoản
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-slate-600 hover:text-orange-600 transition-colors"
                >
                  Tủ sách & Lịch sử
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wider font-sans">
              Liên hệ & Hỗ trợ
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2 text-slate-600">
                <i className="fa-solid fa-envelope text-orange-500 shrink-0" />
                <span>contact@storyreader.vn</span>
              </li>
              <li className="flex items-center gap-2 text-slate-600">
                <i className="fa-solid fa-globe text-orange-500 shrink-0" />
                <span>storyreader.vn</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-slate-200 py-4 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-slate-500">
          <p>
            © {currentYear} StoryReader. Nền tảng đọc truyện trực tuyến văn minh.
          </p>
          <div className="flex items-center gap-3">
            <span className="hover:text-orange-600 transition-colors cursor-pointer">
              Điều khoản dịch vụ
            </span>
            <span>•</span>
            <span className="hover:text-orange-600 transition-colors cursor-pointer">
              Chính sách bảo mật
            </span>
            <span>•</span>
            <Link
              to="/secret"
              className="text-slate-400 hover:text-orange-600 transition-colors flex items-center gap-1 group/secret"
              title="Căn phòng bí mật của Nhóm 7 (Secret Credits)"
            >
              <i className="fa-solid fa-gamepad text-xs group-hover/secret:rotate-12 transition-transform" />
              <span>Nhóm 7 Lounge</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
