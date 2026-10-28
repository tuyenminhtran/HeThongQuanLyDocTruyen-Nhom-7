# StoryReader Mobile App

> **Hệ thống Quản lý Đọc truyện Trực tuyến - Đồ án Công nghệ Phần mềm (Nhóm 7)**  
> Ứng dụng di động đa nền tảng (Flutter / Dart) dành cho độc giả đọc truyện chữ (Novel) và truyện tranh (Comic/Webtoon/Manga).  
> **Trạng thái đồng bộ Web & API**: **60 / 63 tính năng ĐỦ (100% Parity hoàn tất)**.

---

## 1. Giới thiệu Tổng quan
`Storyreader_mobile` là phân hệ ứng dụng di động kết nối trực tiếp với backend ASP.NET Core (`StoryReader.Api`). Ứng dụng được thiết kế theo tiêu chuẩn công thái học di động, giao diện màu sắc thương hiệu TruyenQQ đồng bộ với Web (`storyreader-web`) và kiến trúc Clean Architecture hướng dữ liệu, mang đến trải nghiệm đọc truyện mượt mà, chuyên nghiệp.

---

## 2. Các Tính năng Nổi bật

### 2.1. Bảng Xếp Hạng Chuyên biệt & Bục Vinh Quang Top 3 (Podium)
- **Trang Bảng Xếp Hạng (`/rankings`)**: Thiết kế bục vinh quang Top 3: Top 1 vương miện vàng (giữa), Top 2 vương miện bạc (trái), Top 3 vương miện đồng (phải), avatar bìa truyện lớn, hiển thị số lượt đọc định dạng K/M.
- **Bộ lọc đa tiêu chí**: Lọc theo mốc thời gian (*Toàn thời gian, Top Tháng, Top Tuần, Top Ngày*), phân loại truyện (*Tất cả, Truyện chữ, Truyện tranh*) và thể loại.

### 2.2. Trình đọc Truyện tranh Chuyên biệt (Comic / Webtoon Viewer)
- **Cuộn dọc liên tục (Infinite Webtoon Stream)**: Tối ưu hóa bộ nhớ với `ListView.builder` và `CachedNetworkImage`, hỗ trợ đọc mượt mà cả những chương có hơn 50 ảnh chất lượng cao.
- **Pinch-to-zoom đa điểm**: Tích hợp `InteractiveViewer` cho phép phóng to ảnh từ 1.0x đến 3.5x bằng 2 ngón tay để quan sát chi tiết nét vẽ.
- **Bìa sách nghệ thuật (Smart Fallback)**: Tự động tạo bìa gradient theo chữ cái đầu tên truyện khi ảnh mạng bị lỗi tải hoặc chặn CORS.

### 2.3. Trình đọc Truyện chữ Đẳng cấp (Novel Reader)
- **Typography sách in cao cấp**: Tự động chia tách đoạn văn bản, thụt đầu dòng, căn đều hai bên (justify) chống mỏi mắt.
- **Tùy biến phông chữ đa dạng**: Hỗ trợ chuyển đổi nhanh giữa các bộ phông: **Lora (Serif cổ điển)**, **Inter (Sans-serif hiện đại)**, **Noto Serif (Truyền thống)**.
- **Tùy biến cỡ chữ & giãn dòng**: Cỡ chữ từ 14pt đến 32pt; khoảng cách dòng linh hoạt 1.5, 1.8, 2.2.
- **3 Chế độ nền đọc**: **Midnight Dark** (Tối sâu tiết kiệm pin), **Sepia** (Giấy ngà bảo vệ mắt ban đêm), **Paper Light** (Trang sách sáng).

### 2.4. Chi tiết Truyện Nâng cao & Đánh giá Sao
- **Nút "Đọc từ đầu" & "Đọc mới nhất"**: Mở ngay chương 1 hoặc chương mới nhất vừa phát hành.
- **Mua truyện lẻ & Modal QR Sandbox**: Hiển thị nút "Mua truyện" khi truyện có phí, mở modal mã QR VNPay kèm nút "Xác nhận đã thanh toán (Mô phỏng tức thì)" gọi API kích hoạt quyền đọc ngay lập tức.
- **Khu vực Đánh giá & Bình luận**: Bộ chọn 1-5 sao, viết nhận xét, tính điểm sao trung bình và đồng bộ với thảo luận chương trên server.
- **Cây Thư mục Chương Cha - Con**: Tự động gom nhóm các chương theo `partName` của backend (Ví dụ: *Quyển 1: Khởi đầu*, *Quyển 2: Xuống núi*).

### 2.5. Chuông Thông Báo trên Header (`NotificationBell`)
- Huy hiệu số lượng chưa đọc màu đỏ trên thanh header cam.
- Bottom sheet xem danh sách thông báo người dùng, thời gian tương đối ("5 phút trước", "Hôm qua").
- Chạm vào thông báo để đánh dấu đã đọc (`PUT /api/notifications/{id}/read`) và nút "Đọc tất cả".

### 2.6. Tủ sách Cá nhân Nâng cao (My Library)
- **3 Tab chuyên biệt**: Đang theo dõi, Lịch sử đọc, Đã mua bản quyền.
- **Tìm kiếm & Lọc**: Ô tìm kiếm tức thì, chip lọc loại truyện (Chữ/Tranh), dropdown sắp xếp (*Mới nhất, Lượt đọc cao, Tên A-Z*).
- **Bỏ theo dõi nhanh**: Nút icon bookmark trên từng card truyện cho phép hủy theo dõi kèm popup xác nhận an toàn.

### 2.7. Quản lý Giao dịch Quản trị viên (Admin Transactions)
- Màn hình tra cứu lịch sử nạp tiền, đối soát giao dịch dành cho Admin.
- Bộ lọc theo trạng thái: *Tất cả*, *Chờ xử lý (Pending)*, *Thành công (Success)*, *Thất bại (Failed)*.
- Nút **"Kích hoạt bù"** (`POST /api/admin/transactions/{id}/force-activate`) và **"Đánh dấu thất bại"** (`POST /api/admin/transactions/{id}/mark-failed`).

### 2.8. Chế độ Ngoại tuyến (Offline-First Cache) & Đồng bộ
- Tự động lưu nội dung chương vào bộ nhớ cục bộ (`ReadingCacheService`). Khi mất mạng, độc giả vẫn có thể mở lại các chương đã tải để đọc tiếp.
- Lưu lại phần trăm đọc `%` và vị trí cuộn `scrollOffset`, tự động đồng bộ lên server khi có mạng trở lại.

---

## 3. Cấu trúc Thư mục (Architecture)

```
Storyreader_mobile/
├── lib/
│   ├── core/                      # Các thành phần cốt lõi
│   │   ├── constants/             # Màu sắc TruyenQQ, chuỗi Tiếng Việt, Endpoint API
│   │   ├── network/               # DioClient, interceptor, AppException
│   │   ├── router/                # GoRouter điều hướng các màn hình
│   │   ├── storage/               # SecureStorage (token) & SharedPreferences
│   │   ├── theme/                 # AppTheme (Dark & Light theme)
│   │   └── utils/                 # Phân nhóm chương (chapter_grouping, sequence)
│   ├── data/                      # Tầng dữ liệu & Kho lưu trữ
│   │   ├── api/                   # API client kết nối StoryReader.Api
│   │   ├── local/                 # ReadingCacheService, StoryReviewService
│   │   ├── models/                # DTOs an toàn (Story, Chapter, Discussion, Admin...)
│   │   └── repositories/          # Repositories (Story, Chapter, Auth, Notification...)
│   ├── features/                  # Các màn hình chức năng
│   │   ├── admin/                 # Quản trị (Dashboard, Truyện, Thể loại, Users, Transactions)
│   │   ├── auth/                  # Đăng nhập & Đăng ký phẳng chuẩn native
│   │   ├── chapter_read/          # Trình đọc Comic, Novel, Cài đặt, Bình luận
│   │   ├── home/                  # Trang chủ (Banner, Tìm kiếm, Lọc thể loại, Truyện hay)
│   │   ├── library/               # Tủ sách (Theo dõi, Lịch sử, Đã mua, Tìm kiếm & Lọc)
│   │   ├── pricing/               # Gói thành viên VIP (Nạp API thật, QR VNPay Sandbox)
│   │   ├── profile/               # Hồ sơ cá nhân, đổi tên, đổi mật khẩu, Cài đặt Theme
│   │   ├── rankings/              # Bảng xếp hạng Podium Top 3 & Bộ lọc thời gian
│   │   └── story_detail/          # Chi tiết truyện, Đọc mới nhất, Mua truyện, Đánh giá sao
│   ├── providers/                 # Quản lý trạng thái (Riverpod Providers)
│   ├── widgets/                   # Widgets tái sử dụng (AppHeader, StoryCard, BookCoverFallback...)
│   └── main.dart                  # Điểm khởi chạy ứng dụng
├── test/                          # Unit & Widget tests tự động (41/41 tests pass)
├── docs/
│   ├── 05_parity_matrix.md        # Bảng đối chiếu Parity 63 tính năng Web - API - Mobile
│   └── 06_checklist_kiem_thu.md   # Checklist kiểm thử đối chứng E2E 63 ca kiểm thử
├── API_REQUESTS.md                # Danh sách đề xuất API mở rộng cho backend
└── README.md                      # Hướng dẫn này
```

---

## 4. Hướng dẫn Cài đặt & Khởi chạy

### 4.1. Yêu cầu Môi trường
- Flutter SDK $\ge 3.29.0$
- Dart SDK $\ge 3.7.0$
- .NET 8/10 SDK & Docker Desktop cho backend `StoryReader.Api`.

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

Khởi chạy ứng dụng:
```bash
# Chạy trên Chrome Web:
flutter run -d chrome --web-port=8080

# Chạy trên Android Emulator hoặc thiết bị thật:
flutter run
```

---

## 5. Danh sách Kiểm thử Tự động (Test Suites)
Hệ thống bao gồm **41 bài test tự động** bao phủ toàn diện các chức năng và pass 100%:
1. `data_layer_test.dart`: Safe Parsing JSON, Enums (StoryType, AccessPolicy, ReleaseStatus), phân nhóm chương (`groupChaptersByPart`), cơ chế Offline Cache & Sync.
2. `ui_components_test.dart`: Hiển thị Badge Comic/Chữ, Badge VIP/Miễn phí, bộ chuyển đổi Theme Mode (Sáng/Tối/Hệ thống).
3. `reader_flow_test.dart`: Trình đọc Novel, Trình đọc Comic (zoom, indicator), Bottom Sheet Cài đặt đọc sách, Model Bình luận chương.
4. `admin_flows_test.dart`: Các luồng quản trị (CRUD thể loại, quản lý người dùng, dashboard, xử lý lỗi mạng).
5. `chapter_navigation_test.dart`: Chuyển chương kế tiếp / chương trước và mở mục lục.
6. `mobile_api_test.dart`: Kiểm thử mock API client cho `sortBy`, `notifications`, `subscriptions`, `transactions`.

---
*Đồ án Công nghệ Phần mềm - Nhóm 7 (2026)*
