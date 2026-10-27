# 01. TỔNG QUAN CÔNG NGHỆ VÀ TRẠNG THÁI HIỆN TẠI (MOBILE)

## 1. Công nghệ nền tảng của Storyreader_mobile
- **Framework**: Flutter (Channel stable, phiên bản Flutter 3.44.5)
- **Ngôn ngữ**: Dart SDK `^3.12.2` (môi trường thực tế: Dart 3.12.2)
- **Kiến trúc tổ chức mã nguồn hiện tại**: Cấu trúc theo tính năng kết hợp phân tầng cơ bản (`core/`, `data/`, `features/`, `providers/`, `widgets/`).
- **State Management**: `flutter_riverpod: ^2.6.1`
- **Điều hướng (Routing)**: `go_router: ^14.6.2` (có route guard kiểm tra xác thực và quyền Admin)
- **HTTP Client**: `dio: ^5.7.0` (có interceptor gắn Bearer Token và bắt mã lỗi 401)
- **Lưu trữ cục bộ & Secure Storage**:
  - `flutter_secure_storage: ^9.2.2`: Lưu JWT access token an toàn trên Keystore (Android) / Keychain (iOS)
  - `shared_preferences: ^2.3.3`: Lưu cấu hình người dùng (theme, cỡ chữ đọc truyện, tùy chọn)
- **Giao diện & Tiện ích UI**:
  - `google_fonts: ^6.2.1`: Sử dụng font *Cinzel* / *Noto Serif* cho truyện cổ điển/tiên hiệp và *Inter* cho giao diện hiện đại
  - `cached_network_image: ^3.4.1`: Cache ảnh bìa truyện trên thiết bị
  - `cupertino_icons: ^1.0.8`: Icon chuẩn iOS bổ trợ
- **Các thư viện phụ trợ khác**:
  - `jwt_decoder: ^2.0.1`: Giải mã payload của JWT token phía client
  - `url_launcher: ^6.3.1`: Mở đường dẫn thanh toán và web bên ngoài
  - `intl: ^0.19.0`: Định dạng ngày tháng, số tiền VND (Currency format)
  - `flutter_lints: ^6.0.0` & `flutter_test`: Bộ công cụ phân tích tĩnh mã nguồn và kiểm thử

---

## 2. Kết quả kiểm tra hiện trạng ứng dụng (Chạy thực tế)
Quá trình kiểm tra được thực hiện độc lập, không thay đổi mã nguồn:

### a) `flutter analyze`
- **Kết quả**: Thành công hoàn toàn (`No issues found!`).
- **Thời gian phân tích**: ~135 giây. Toàn bộ mã nguồn hiện tại không có lỗi biên dịch tĩnh hoặc cú pháp nghiêm trọng.

### b) `flutter test`
- **Kết quả**: Vượt qua toàn bộ 12 test case trong 2 file kiểm thử:
  - `test/admin_flows_test.dart`: 11 test cases (kiểm tra luồng admin danh mục, người dùng, dashboard, xử lý lỗi server).
  - `test/widget_test.dart`: 1 smoke test (`EmptyState` widget).
- **Trạng thái**: `All tests passed! (12/12)`.

### c) `flutter build apk --debug`
- **Kết quả**: Biên dịch thành công tệp APK Debug:
  - Tệp sinh ra: `build/app/outputs/flutter-apk/app-debug.apk`
  - Thời gian biên dịch: 230.8 giây qua Gradle.
  - Cảnh báo (Warning) từ Gradle: Cảnh báo về Java source/target options 8 trong một số dependency cũ của plugin, nhưng không ảnh hưởng tới tiến trình build thành công.

---

## 3. Đánh giá sơ bộ và các điểm nghẽn kỹ thuật cần nâng cấp
1. **Tầng Dữ liệu (Data Layer)**:
   - Các class model hiện tại (`StoryListItem`, `ChapterListItem`, `StoryDetail`, `ChapterContent`) chưa hỗ trợ đầy đủ các trường của Backend:
     - Thiếu `Type` (Novel = 0, Comic = 1).
     - Thiếu `PartName` (cấu trúc phần/tập cha-con dạng thư mục cho cả Novel và Comic).
     - Thiếu `TotalChapters`, `LatestChapterNumber`.
     - Thiếu các trường quản lý xuất bản (`RenderAsImages`).
   - Chưa có tầng Repository độc lập giữa Presentation và API Client.
   - Xử lý lỗi từ Dio còn phân tán, chưa có cơ chế chuẩn hóa lỗi tiếng Việt thống nhất và tự động retry mạng khi gặp sự cố chập chờn.
2. **Tầng Giao diện (Presentation Layer)**:
   - Chưa có Design System hoàn chỉnh đồng nhất màu sắc/spacing giữa chế độ Sáng (Light) và Tối (Dark).
   - Chưa có màn hình quản lý Thư viện / Bookmark / Lịch sử đọc chuyên biệt trong thanh điều hướng chính (hiện tại mới nhét trong trang Profile).
   - Chưa có tính năng bình luận chương (Discussions) dù Backend API đã có sẵn.
   - Chưa hỗ trợ giao diện phân loại chương dạng thư mục cha - con (`Folder / PartName`) có thể thu gọn/mở rộng như trên Web.
3. **Trình đọc truyện (Reader)**:
   - Trình đọc Comic hiện đang render qua `Image.network` nằm trong `SingleChildScrollView -> Column`, có nguy cơ tràn bộ nhớ RAM (OOM) nếu chương truyện có hàng chục ảnh kích thước lớn. Cần chuyển sang ListView ảo hóa với `cached_network_image`, zoom mượt và cơ chế tải lại ảnh lỗi.
   - Chưa lưu tiến độ cuộn (scroll offset / percentage) của độc giả cục bộ khi offline.
   - Chưa có bộ nhớ đệm Offline để độc giả tải trước chương truyện hoặc xem lại chương đã nạp khi mất kết nối Internet.
