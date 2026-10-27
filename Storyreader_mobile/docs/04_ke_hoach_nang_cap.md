# 04. ĐỀ XUẤT KIẾN TRÚC MỤC TIÊU VÀ KẾ HOẠCH NÂNG CẤP CHI TIẾT (GIAI ĐOẠN 1 - 4)

## 1. Đề Xuất Kiến Trúc Mục Tiêu (Target Architecture)

Tuân thủ nghiêm ngặt ràng buộc kỹ thuật: **Giữ nguyên toàn bộ stack hiện có** (Flutter, Dart, Riverpod 2.x, GoRouter 14.x, Dio 5.x, Flutter Secure Storage, SharedPreferences, Google Fonts, CachedNetworkImage), không thay đổi framework.

Mô hình kiến trúc phân tầng chuẩn di động (Clean Layered Architecture):

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  - Screens (Home, StoryDetail, Reader, Library, Profile)    │
│  - Reusable Components (StoryCard, ChapterFolder, Dialog)   │
│  - Design System Tokens (AppTheme, AppColors, AppTextStyles)│
│  - Localization Strings (AppStrings - Tiếng Việt 100%)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Watches / Dispatches
┌──────────────────────────────▼──────────────────────────────┐
│                   STATE / DOMAIN LAYER                      │
│  - Riverpod StateNotifiers / AsyncNotifiers / Providers      │
│  - Business logic, Chapter Grouping Algorithm               │
│  - Reading Progress Sync Queue Controller                   │
└──────────────────────────────┬──────────────────────────────┘
                               │ Invokes
┌──────────────────────────────▼──────────────────────────────┐
│                     REPOSITORY LAYER                        │
│  - StoryRepository, AuthRepository, ChapterRepository       │
│  - LibraryRepository, ProfileRepository, DiscussionRepo     │
│  - Chiến lược Cache-First / Network-Fallback                │
└──────────────────────────────┬──────────────────────────────┘
                               │ Coordinates
               ┌───────────────┴───────────────┐
               ▼                               ▼
┌─────────────────────────────┐ ┌─────────────────────────────┐
│      REMOTE DATA SOURCE     │ │      LOCAL DATA SOURCE      │
│  - DioClient tập trung      │ │  - SecureStorage (Token)    │
│  - Interceptor (Token, 401) │ │  - SharedPreferences (Prefs)│
│  - Retry Policy             │ │  - Offline Chapter Store    │
│  - Typed API Response/DTOs  │ │  - Offline Sync Queue       │
└─────────────────────────────┘ └─────────────────────────────┘
```

---

## 2. Kế Hoạch Thực Hiện Chi Tiết Theo Từng Giai Đoạn

### GIAI ĐOẠN 1 – TẦNG DỮ LIỆU & LOGIC CỦA MOBILE (Chưa sửa giao diện mới)
**Mục tiêu**: Xây dựng nền móng dữ liệu vững chắc, chuẩn hóa toàn bộ DTOs và API client, đảm bảo không bao giờ crash do null/dữ liệu thiếu, sẵn sàng phục vụ UI.

1. **Chuẩn hóa API Client (`DioClient`)**:
   - Cấu hình Timeout thông minh (kết nối 15s, nhận dữ liệu 30s).
   - Tự động gắn header `Authorization: Bearer <Token>`.
   - Interceptor bắt mã lỗi 401: Xóa sạch phiên đăng nhập trong secure storage, thông báo hết hạn phiên đăng nhập và kích hoạt điều hướng về màn hình Đăng nhập.
   - Cơ chế tự động thử lại (Retry) tối đa 2 lần với các lỗi rớt mạng hoặc 5xx tạm thời.
   - Chuẩn hóa phân lớp lỗi (`ApiException` / `NetworkException` / `AuthException`) kèm thông báo tiếng Việt thân thiện, rõ ràng.
2. **Cập nhật & Hoàn thiện Toàn bộ DTOs**:
   - `StoryListItem`: Bổ sung `type: StoryType` (Novel=0, Comic=1), `totalChapters`, `latestChapterNumber`.
   - `StoryDetail`: Bổ sung `type`, ánh xạ danh sách `chapters` kèm `partName`.
   - `ChapterListItem`: Bổ sung `partName: String?`.
   - `ChapterContent`: Bổ sung `storyType`, `imageUrls: List<String>`, `partName: String?`.
   - Bổ sung DTOs cho Bình luận (`DiscussionItemDto`, `CreateDiscussionDto`) và Thông báo (`NotificationItemDto`).
   - Xây dựng parser chịu lỗi (safe parsing, fallback giá trị mặc định cho null/kiểu dữ liệu không khớp).
3. **Quản lý Xác thực & Phiên làm việc (Auth Layer)**:
   - Lưu trữ an toàn Token trong `FlutterSecureStorage`.
   - Tự động nạp token và khôi phục trạng thái đăng nhập khi mở lại ứng dụng.
   - Đăng xuất an toàn: xóa sạch token, thông tin hồ sơ và cache nhạy cảm.
4. **Xây dựng Tầng Repository**:
   - `StoryRepository`: Lấy danh sách truyện có phân trang + lọc thể loại + tìm kiếm; Lấy chi tiết truyện; Quản lý theo dõi (Toggle Follow).
   - `ChapterRepository`: Lấy nội dung chương; Quản lý tiến độ đọc; Thuật toán nhóm chương theo phần/tập (`groupChaptersByPart`).
   - `DiscussionRepository`: Đọc bình luận chương; Gửi bình luận mới.
   - `ProfileRepository`: Xem thông tin tài khoản, đổi tên, đổi mật khẩu, lấy lịch sử đọc, danh sách bookmark, truyện đã mua.
   - `SubscriptionRepository`: Lấy danh sách gói VIP và khởi tạo thanh toán.
5. **Kiểm thử Đơn vị (Unit Tests)**:
   - Viết các bộ test cho toàn bộ parser DTO (trường hợp đủ trường, thiếu trường, null, sai kiểu).
   - Viết test cho thuật toán phân nhóm chương theo thư mục cha-con (`PartName`).
   - Viết test cho tầng Repository với Mocktail/Mock HTTP response.

---

### GIAI ĐOẠN 2 – GIAO DIỆN NGƯỜI DÙNG (UI/UX CHUYÊN NGHIỆP)
**Mục tiêu**: Nâng cấp toàn diện giao diện di động, trải nghiệm mượt mà, chuẩn công thái học di động, wow người dùng từ cái nhìn đầu tiên.

1. **Design System & Localization**:
   - Bảng màu sang trọng: Dark mode nền đen mực (`#0B0F19`), ánh vàng hoàng kim cao cấp (`#F59E0B` / `#D97706`), màu xám bạc ánh kim (`#94A3B8`). Light mode dịu mắt không gây mỏi.
   - Typography: Kết hợp *Noto Serif* cho các tiêu đề/truyện và *Inter* cho giao diện điều khiển.
   - Vùng chạm tối thiểu ≥ 48dp cho tất cả các nút, icon, tab, ô nhập liệu.
   - Hệ thống thông báo tiếng Việt tập trung (`app_strings.dart`).
2. **Các Màn hình Chính**:
   - **Trang chủ (Home)**:
     - Hero Banner nổi bật những bộ truyện đặc sắc nhất.
     - Thanh tìm kiếm tức thì có debounce.
     - Bộ lọc thể loại vuốt ngang mượt mà kèm lọc riêng Truyện Chữ / Truyện Tranh.
     - Danh sách truyện mới cập nhật và xem nhiều với thẻ truyện (Story Card) hiển thị ảnh bìa sắc nét, số chương, lượt xem, tag thể loại.
   - **Chi tiết Truyện (Story Detail)**:
     - Header ảnh bìa mờ hiệu ứng cinematic.
     - Khối thông tin tác giả, trạng thái, phân loại Novel / Comic, nút Đọc từ đầu / Đọc tiếp.
     - **Danh mục chương dạng Thư mục Cha - Con (Folder Collapsible)**: Từng Phần/Tập (Part) có thể bấm mở rộng/thu gọn trực quan, hiển thị rõ số lượng chương con và đánh dấu chương khóa/mở.
     - Khối bình luận truyện và nút theo dõi nổi bật.
   - **Tủ sách & Thư viện (Library Screen)**:
     - Tab Truyện đang theo dõi (Bookmarks).
     - Tab Lịch sử đọc (tiếp tục đọc nhanh chương dở).
     - Tab Truyện đã mua bản quyền.
   - **Đăng nhập & Đăng ký (Auth)**:
     - Giao diện form tối giản, tinh tế, validate trường tức thì, ẩn hiện mật khẩu, ghi nhớ đăng nhập.
   - **Hồ sơ & Cài đặt (Profile)**:
     - Thông tin tài khoản, badge thành viên (Thành viên thường, VIP, Admin).
     - Quản lý đổi tên hiển thị, đổi mật khẩu.
     - Chuyển đổi giao diện Sáng / Tối (Theme Mode Switch).
3. **Đủ 4 trạng thái cho mọi màn hình**:
   - `Loading`: Skeleton Shimmer animation nhẹ nhàng, không giật màn hình.
   - `Empty`: Minh họa rỗng đẹp mắt kèm gợi ý khám phá truyện mới.
   - `Error`: Thông báo lỗi tiếng Việt dễ hiểu kèm nút "Thử lại".
   - `Success`: Hiển thị nội dung hoàn chỉnh kèm tính năng kéo để làm mới (Pull-to-refresh).

---

### GIAI ĐOẠN 3 – TRÌNH ĐỌC CHUYÊN SÂU, OFFLINE & ĐỒNG BỘ
**Mục tiêu**: Đưa trải nghiệm đọc truyện chữ và truyện tranh trên di động đạt chuẩn các ứng dụng đọc truyện hàng đầu thị trường.

1. **Trình đọc Truyện chữ (Novel Reader)**:
   - Thanh công cụ đọc trực quan (tự ẩn khi cuộn, hiện khi chạm nhẹ vào màn hình).
   - Tùy chỉnh kích thước font chữ linh hoạt (A- / A+), giãn dòng, font chữ (Serif / Sans-serif).
   - 3 Chế độ màu nền bảo vệ mắt: Nền Đen (Dark), Nền Trắng (Light), Nền Giấy Cổ (Sepia).
   - Mục lục chương dạng Drawer kéo ra nhanh chóng, có tìm kiếm chương.
   - Tự động ghi nhớ vị trí dòng đang đọc (scroll offset).
2. **Trình đọc Truyện tranh & Webtoon (Comic Reader)**:
   - Chế độ cuộn dọc liền mạch (Webtoon Continuous Scroll) không ngắt trang.
   - Tối ưu hóa bộ nhớ: Sử dụng danh sách ảo hóa (virtualized list), giải phóng RAM khi ảnh cuộn ra ngoài màn hình, tránh OOM.
   - Bộ nhớ đệm ảnh thông minh (Disk cache) giúp tải ảnh siêu tốc.
   - Hỗ trợ thao tác Zoom đa điểm (Pinch to zoom / InteractiveViewer) để xem chi tiết tranh vẽ.
   - Tự động tải trước (preload) 2-3 trang ảnh tiếp theo.
   - Nút chạm để tải lại riêng cho các ảnh bị lỗi mạng.
3. **Bình luận & Thảo luận ngay trong chương**:
   - Modal bottom sheet hoặc khu vực cuối chương hiển thị bình luận độc giả.
   - Ô gửi bình luận trực tiếp không cần rời màn hình đọc.
4. **Cơ chế Ngoại tuyến & Đồng bộ (Offline & Sync)**:
   - Lưu trữ nội dung các chương đã đọc vào bộ nhớ máy, cho phép đọc lại khi mất mạng Internet.
   - Hàng đợi đồng bộ tiến độ đọc (Sync Queue): Nếu mất mạng khi đọc, vị trí đọc và lịch sử sẽ được lưu vào hàng đợi và tự động đồng bộ lên máy chủ ngay khi có kết nối mạng trở lại.
   - Hiển thị banner trạng thái mạng nhẹ nhàng ("Đang ở chế độ ngoại tuyến").

---

### GIAI ĐOẠN 4 – KIỂM THỬ TOÀN DIỆN & HOÀN THIỆN
**Mục tiêu**: Tối ưu hiệu năng, loại bỏ mã thừa, kiểm thử toàn diện, viết tài liệu hướng dẫn và bàn giao chuẩn mực.

1. **Tối ưu hóa & Dọn dẹp**:
   - Dọn dẹp toàn bộ import thừa, mã chết hoặc biến không sử dụng.
   - Rà soát chống rebuild thừa và rò rỉ bộ nhớ (dispose Controllers, Timer, Streams).
2. **Kiểm thử & Biên dịch**:
   - Chạy kiểm tra tĩnh `flutter analyze`: Phải đạt 0 lỗi, 0 cảnh báo.
   - Bổ sung kiểm thử tự động (Unit Test & Widget Test) cho các luồng quan trọng: Đăng nhập -> Duyệt truyện -> Đọc chương -> Nhóm thư mục -> Đồng bộ tiến độ.
   - Thử nghiệm biên dịch bản Release (`flutter build apk --release`).
3. **Hoàn thiện Tài liệu**:
   - Cập nhật `Storyreader_mobile/README.md` chi tiết: Hướng dẫn môi trường, cấu hình IP/BaseURL cho Android/iOS/Web, cách kết nối với Backend Docker/dotnet run, danh sách tính năng và cấu trúc dự án.
4. **Kiểm tra Ràng buộc Tuyệt đối**:
   - Chạy `git status` và `git diff --stat main...HEAD`.
   - Xác nhận 100% tất cả các tệp thay đổi và tạo mới đều nằm trong thư mục `Storyreader_mobile/`.
