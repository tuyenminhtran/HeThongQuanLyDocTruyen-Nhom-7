# StoryReader Mobile App

> **Hệ thống Quản lý Đọc truyện Trực tuyến - Đồ án Công nghệ Phần mềm (Nhóm 7)**  
> Ứng dụng di động đa nền tảng (Flutter / Dart) dành cho độc giả đọc truyện chữ (Novel) và truyện tranh (Comic/Webtoon/Manga).

---

## 1. Giới thiệu Tổng quan
`Storyreader_mobile` là phân hệ ứng dụng di động kết nối trực tiếp với backend ASP.NET Core (`StoryReader.Api`). Ứng dụng được thiết kế theo tiêu chuẩn công thái học di động, giao diện Midnight Gold hiện đại và kiến trúc Clean Architecture hướng dữ liệu, mang đến trải nghiệm đọc sách mượt mà, chuyên nghiệp tương đương các ứng dụng thương mại.

---

## 2. Các Tính năng Nổi bật

### 2.1. Trình đọc Truyện tranh Chuyên biệt (Comic / Webtoon Viewer)
- **Cuộn dọc liên tục (Infinite Webtoon Stream)**: Tối ưu hóa bộ nhớ với `ListView.builder` và `CachedNetworkImage`, hỗ trợ đọc mượt mà cả những chương có hơn 50 ảnh chất lượng cao.
- **Pinch-to-zoom đa điểm**: Tích hợp `InteractiveViewer` cho phép phóng to ảnh từ 1.0x đến 3.5x bằng 2 ngón tay để quan sát chi tiết nét vẽ.
- **Cơ chế tải lại từng ảnh độc lập**: Nếu một trang ảnh bị sự cố mạng, độc giả có thể bấm "Thử lại" ngay tại trang đó mà không cần tải lại toàn bộ chương.
- **Chỉ báo trang nổi**: Hiển thị vị trí trang hiện tại theo thời gian thực (`X / Tổng số trang`).

### 2.2. Trình đọc Truyện chữ Đẳng cấp (Novel Reader)
- **Typography sách in cao cấp**: Tự động chia tách đoạn văn bản, thụt đầu dòng, căn đều hai bên (justify) chống mỏi mắt.
- **Tùy biến phông chữ đa dạng**: Hỗ trợ chuyển đổi nhanh giữa 3 bộ phông chữ: **Lora (Serif cổ điển)**, **Inter (Sans-serif hiện đại)**, **Noto Serif (Truyền thống)**.
- **Tùy biến cỡ chữ & giãn dòng**: Cỡ chữ từ 14pt đến 32pt; khoảng cách dòng linh hoạt 1.5, 1.8, 2.2.
- **3 Chế độ nền đọc**: **Midnight Dark** (Tối sâu tiết kiệm pin), **Sepia** (Giấy ngà bảo vệ mắt ban đêm), **Paper Light** (Trang sách sáng).

### 2.3. Cây Thư mục Chương Cha - Con (Collapsible Part Folders)
- Tự động gom nhóm các chương theo `partName` của backend (Ví dụ: *Quyển 1: Khởi đầu*, *Quyển 2: Xuống núi*).
- Cho phép người đọc chạm để mở/đóng từng tập, đảo chiều thứ tự chương (Mới nhất / Cũ nhất), và tìm kiếm chương theo số hoặc tên.

### 2.4. Tủ sách Cá nhân (My Library)
- Gồm 3 tab riêng biệt:
  - **Đang theo dõi**: Danh sách các bộ truyện độc giả đã đánh dấu bookmark, đồng bộ tức thì với server.
  - **Lịch sử đọc**: Lưu vết các chương truyện đã đọc kèm tiến độ cuộn trang.
  - **Đã mua**: Quản lý các bộ truyện đã mua bản quyền trọn bộ.

### 2.5. Thảo luận & Bình luận Chương Trực tiếp
- Đọc và gửi bình luận ngay trong chương đọc (`GET /api/chapters/{id}/discussions` và `POST /api/chapters/{id}/discussions`).
- Định dạng thời gian tương đối ("Vừa xong", "15 phút trước", "Hôm qua").
- Tự động kiểm tra quyền đăng nhập trước khi tham gia thảo luận.

### 2.6. Chế độ Ngoại tuyến (Offline-First Cache) & Đồng bộ
- Tự động lưu nội dung chương vào bộ nhớ cục bộ (`ReadingCacheService`). Khi mất mạng, độc giả vẫn có thể mở lại các chương đã tải để đọc tiếp.
- Lưu lại phần trăm đọc `%` và vị trí cuộn `scrollOffset`, tự động đồng bộ lên server khi có mạng trở lại.

### 2.7. Hệ thống Theme Toàn Ứng dụng
- Hỗ trợ đầy đủ **Chế độ Tối (Dark)**, **Chế độ Sáng (Light)**, và **Theo cài đặt Hệ thống (System)**.
- Đạt chuẩn Touch Target công thái học ($\ge 48\times 48\text{ dp}$ cho mọi nút bấm).

---

## 3. Cấu trúc Thư mục (Architecture)

```
Storyreader_mobile/
├── lib/
│   ├── core/                      # Các thành phần cốt lõi
│   │   ├── constants/             # Màu sắc, chuỗi Tiếng Việt, Endpoint API
│   │   ├── network/               # DioClient, interceptor, AppException
│   │   ├── router/                # GoRouter điều hướng các màn hình
│   │   ├── storage/               # SecureStorage (token) & SharedPreferences
│   │   ├── theme/                 # AppTheme (Dark & Light theme)
│   │   └── utils/                 # Phân nhóm chương (chapter_grouping, sequence)
│   ├── data/                      # Tầng dữ liệu & Kho lưu trữ
│   │   ├── api/                   # API client kết nối StoryReader.Api
│   │   ├── local/                 # ReadingCacheService (Offline cache & sync)
│   │   ├── models/                # DTOs an toàn (Story, Chapter, Discussion, v.v.)
│   │   └── repositories/          # Repositories (Story, Chapter, Auth, Profile...)
│   ├── features/                  # Các màn hình chức năng
│   │   ├── admin/                 # Quản trị hệ thống (Thể loại, Người dùng, Thống kê)
│   │   ├── auth/                  # Đăng nhập & Đăng ký
│   │   ├── chapter_read/          # Trình đọc Comic, Novel, Cài đặt, Bình luận
│   │   ├── home/                  # Trang chủ (Banner Hero, Tìm kiếm, Lọc thể loại)
│   │   ├── library/               # Tủ sách (Theo dõi, Lịch sử, Đã mua)
│   │   ├── pricing/               # Gói thành viên VIP
│   │   ├── profile/               # Hồ sơ cá nhân & Cài đặt Theme
│   │   └── story_detail/          # Chi tiết truyện & Cây thư mục chương
│   ├── providers/                 # Quản lý trạng thái (Riverpod Providers)
│   ├── widgets/                   # Widgets tái sử dụng (StoryCard, Skeleton, Header...)
│   └── main.dart                  # Điểm khởi chạy ứng dụng
├── test/                          # Unit & Widget tests tự động
├── docs/                          # Tài liệu kiến trúc & API trích xuất
├── API_REQUESTS.md                # Danh sách đề xuất API mở rộng cho backend
└── README.md                      # Hướng dẫn này
```

---

## 4. Hướng dẫn Cài đặt & Khởi chạy

### 4.1. Yêu cầu Môi trường
- Flutter SDK $\ge 3.29.0$
- Dart SDK $\ge 3.7.0$
- Backend `StoryReader.Api` đang chạy tại cổng `5066`.

### 4.2. Cấu hình Địa chỉ IP Backend ([api_constants.dart](file:///c:/Users/PC/Desktop/HeThongQuanLyDocTruyen-Nhom-7/Storyreader_mobile/lib/core/constants/api_constants.dart))
Tùy vào thiết bị bạn đang chạy app:
- **Android Emulator**: Sử dụng mặc định `http://10.0.2.2:5066/api`.
- **iOS Simulator / Windows Desktop / Web**: Sử dụng `http://localhost:5066/api`.
- **Điện thoại thật (Physical Device qua Wi-Fi)**: Đổi thành `http://<IP_LAN_MAY_TINH>:5066/api` (Ví dụ: `http://192.168.1.15:5066/api`).

### 4.3. Các lệnh Thao tác
Cài đặt thư viện dependencies:
```bash
cd Storyreader_mobile
flutter pub get
```

Chạy kiểm tra tĩnh (Linter):
```bash
flutter analyze
```

Chạy toàn bộ bộ kiểm thử tự động (Unit & Widget Tests):
```bash
flutter test
```

Khởi chạy ứng dụng trên thiết bị/máy ảo:
```bash
flutter run
```

Biên dịch gói cài đặt Android APK (Debug / Release):
```bash
flutter build apk --debug
# hoặc
flutter build apk --release
```
Tệp APK sau khi build sẽ nằm tại: `build/app/outputs/flutter-apk/app-debug.apk`.

---

## 5. Danh sách Kiểm thử Tự động (Test Suites)
Hệ thống bao gồm 32 bài test tự động bao phủ toàn diện các chức năng:
1. `data_layer_test.dart`: Kiểm thử Safe Parsing JSON, Enums (StoryType, AccessPolicy, ReleaseStatus), phân nhóm chương (`groupChaptersByPart`), cơ chế Offline Cache & Sync.
2. `ui_components_test.dart`: Kiểm thử hiển thị Badge Comic/Chữ, Badge VIP/Miễn phí, bộ chuyển đổi Theme Mode (Sáng/Tối/Hệ thống).
3. `reader_flow_test.dart`: Kiểm thử Trình đọc Novel, Trình đọc Comic (zoom, indicator), Bottom Sheet Cài đặt đọc sách, Model Bình luận chương.
4. `admin_flows_test.dart`: Kiểm thử các luồng quản trị (CRUD thể loại, quản lý người dùng, dashboard, xử lý lỗi mạng).
5. `chapter_navigation_test.dart`: Kiểm thử chuyển chương kế tiếp / chương trước và mở mục lục.

---
*Đồ án Công nghệ Phần mềm - Nhóm 7 (2026)*
