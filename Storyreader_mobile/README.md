# StoryReader Mobile App

Ứng dụng đọc truyện trực tuyến **StoryReader Mobile**, được xây dựng bằng **Flutter (Dart)** với Material 3 Dark Theme tùy chỉnh, đồng bộ 100% ngôn ngữ thiết kế, màu sắc, font chữ và trải nghiệm từ phiên bản Web `storyreader-web`, tích hợp trực tiếp vào hệ thống backend RESTful API của `StoryReader.Api`.

---

## 1. Yêu Cầu Môi Trường

- **Flutter SDK**: Phiên bản `>= 3.44.0` (Dart `>= 3.12.0`)
- **Android Studio / Xcode**:
  - Android SDK (API 34+) & Android Emulator hoặc thiết bị thật.
  - Xcode 15+ & iOS Simulator (nếu chạy trên macOS).
- **Hệ điều hành Backend**:
  - Docker & Docker Compose (chạy PostgreSQL & Redis).
  - .NET SDK 8.0+ (chạy `StoryReader.Api`).

---

## 2. Cấu Hình & Chạy Backend

1. **Khởi động Docker containers (Database & Cache):**
   ```bash
   cd c:\Users\PC\Desktop\HeThongQuanLyDocTruyen-Nhom-7
   docker compose up -d
   ```
   *Lưu ý:* Đảm bảo PostgreSQL đang chạy trên cổng `5432` và Redis đang chạy trên cổng `6379`.

2. **Chạy Backend RESTful API:**
   ```bash
   dotnet run --project StoryReader.Api\StoryReader.Api.csproj
   ```
   Backend mặc định lắng nghe tại:
   - HTTP: `http://localhost:5066`
   - HTTPS: `https://localhost:7244`

---

## 3. Cấu Hình Base URL cho Mobile App

File cấu hình tập trung tại:  
[`lib/core/constants/api_constants.dart`](file:///lib/core/constants/api_constants.dart)

Mặc định ứng dụng tự động nhận diện nền tảng:
- **Android Emulator**: `http://10.0.2.2:5066/api` (Android emulator định tuyến `10.0.2.2` về `localhost` của máy host).
- **iOS Simulator / Web / Desktop**: `http://localhost:5066/api`
- **Thiết bị thật (Android / iOS qua Wi-Fi)**:  
  Cần mở file `lib/core/constants/api_constants.dart` và gán IP mạng LAN của máy tính đang chạy backend:
  ```dart
  static String baseUrl = 'http://192.168.1.xxx:5066/api';
  ```

### Lưu ý về bảo mật mạng (Cleartext HTTP):
- **Android**: Đã cấu hình `android:usesCleartextTraffic="true"` trong `AndroidManifest.xml` để cho phép kết nối `http://` cục bộ mà không bị chặn bởi chính sách bảo mật Android 9+.
- **iOS**: Đã cấu hình ngoại lệ `NSAppTransportSecurity` (`NSAllowsArbitraryLoads = true`) trong `ios/Runner/Info.plist` cho môi trường phát triển cục bộ.

---

## 4. Hướng Dẫn Cài Đặt & Khởi Chạy Ứng Dụng

Di chuyển vào thư mục `Storyreader_mobile`:
```bash
cd Storyreader_mobile
```

1. **Tải các gói thư viện phụ thuộc:**
   ```bash
   flutter pub get
   ```

2. **Kiểm tra mã nguồn và linter (0 lỗi):**
   ```bash
   flutter analyze
   ```

3. **Khởi chạy ứng dụng:**
   - Trên Android Emulator đang mở:
     ```bash
     flutter run -d emulator
     ```
   - Hoặc để Flutter tự chọn thiết bị khả dụng:
     ```bash
     flutter run
     ```

---

## 5. Bảng Đối Chiếu: Trang Web ↔ Màn Hình Mobile

| Trang Web (`storyreader-web`) | Màn Mobile (`Storyreader_mobile`) | Đường dẫn Route | Mô tả & Chức năng |
|---|---|---|---|
| **Header (App Header)** | [`AppHeader`](file:///lib/widgets/app_header.dart) | Chung toàn app | Thanh điều hướng sticky trên cùng, nền mờ kính 80%, logo 36x36 viền vàng, menu xổ xuống hỗ trợ Auth, Gói VIP, Trang quản trị |
| **Footer (App Footer)** | [`AppFooter`](file:///lib/widgets/app_footer.dart) | Cuối trang cuộn | Giới thiệu, Khám phá, Tài khoản, Liên hệ, bản quyền © StoryReader |
| **Trang chủ (`HomePage.tsx`)** | [`HomeScreen`](file:///lib/features/home/home_screen.dart) | `/` | Tìm kiếm debounce 400ms, bộ lọc Trạng thái & Thu phí, lưới truyện 2 cột tải phân trang (12 truyện/lần), khối Top Đọc Nhiều Nhất, banner Premium |
| **Chi tiết truyện (`StoryDetailPage.tsx`)** | [`StoryDetailScreen`](file:///lib/features/story_detail/story_detail_screen.dart) | `/stories/:id` | Bìa truyện lớn bo 16, tags thể loại, mô tả, nút "Mua ngay" (`POST /payments/story/{id}`) hoặc "Đọc từ đầu", danh sách chương, khối Đánh giá & Bình luận |
| **Đọc chương (`ChapterReadPage.tsx`)** | [`ChapterReadScreen`](file:///lib/features/chapter_read/chapter_read_screen.dart) | `/chapters/:id` | 3 theme đọc (Dark, Light, Sepia), tùy chỉnh cỡ chữ A-/A+ (14-32px), lưu trữ SharedPreferences, xử lý lỗi khóa chương 403 yêu cầu mua |
| **Đăng nhập (`LoginPage.tsx`)** | [`LoginScreen`](file:///lib/features/auth/login_screen.dart) | `/login` | Đăng nhập bằng email/password, validate form, hiển thị lỗi API, giải mã vai trò JWT |
| **Đăng ký (`RegisterPage.tsx`)** | [`RegisterScreen`](file:///lib/features/auth/register_screen.dart) | `/register` | Tên hiển thị, email, mật khẩu & xác nhận mật khẩu, validate tức thì |
| **Bảng giá VIP (`PricingPage.tsx`)** | [`PricingScreen`](file:///lib/features/pricing/pricing_screen.dart) | `/pricing` | Chuyển đổi Theo tháng / Theo năm (-15%), 3 gói: Đọc Thử (19k), Premium (49k - Phổ biến nhất), Nạp Xu Lẻ (từ 10k), cổng thanh toán |
| **Trang cá nhân (`ProfilePage.tsx`)** | [`ProfileScreen`](file:///lib/features/profile/profile_screen.dart) | `/profile` | Avatar chữ cái đầu, đổi tên hiển thị, 3 tab: Lịch sử đọc, Đã lưu (Bookmark), Truyện đã mua |
| **Quản trị (`AdminLayout.tsx`)** | [`AdminLayoutScreen`](file:///lib/features/admin/admin_layout_screen.dart) | `/admin` | Khung quản trị với Drawer và Tab Bar, kiểm tra quyền Admin role từ JWT claim |
| **Admin Dashboard (`DashboardPage.tsx`)** | [`AdminDashboardScreen`](file:///lib/features/admin/admin_dashboard_screen.dart) | `/admin` (Tab 0) | Thẻ thống kê: Doanh thu, Người dùng, Truyện mới, Lượt đọc, cùng danh sách giao dịch & hoạt động gần đây |
| **Quản lý Truyện (`AdminStoriesPage.tsx`)** | [`AdminStoriesScreen`](file:///lib/features/admin/admin_stories_screen.dart) | `/admin/stories` (Tab 1) | Quản lý danh sách truyện, modal Thêm truyện mới (`POST /stories`), modal Thêm chương (`POST /stories/{id}/chapters`), xem danh sách chương theo truyện |
| **Quản lý Thể loại (`AdminCategoriesPage.tsx`)** | [`AdminCategoriesScreen`](file:///lib/features/admin/admin_categories_screen.dart) | `/admin/categories` (Tab 2) | Danh sách thể loại truyện, tìm kiếm, modal Thêm/Sửa/Xóa thể loại |
| **Quản lý Người dùng (`AdminUsersPage.tsx`)** | [`AdminUsersScreen`](file:///lib/features/admin/admin_users_screen.dart) | `/admin/users` (Tab 3) | Danh sách tài khoản, trạng thái Hoạt động / Đã khóa, phân quyền User / Admin |

---

## 6. Danh Sách Phần Mock / Giả Lập (Đúng Hành Vi Bản Web)

Theo đúng yêu cầu "Giống web 100%": những phần trên Web đang mock/giả lập dữ liệu thì Mobile cũng giả lập tương tự và được tách riêng vào các repository để dễ dàng thay bằng API thật sau này:

1. **Thư viện người dùng (`lib/data/repositories/user_mock_repository.dart`):**
   - **Lịch sử đọc, Đã lưu (Bookmark), Truyện đã mua**: Giống như web lấy một tập hợp truyện từ API `/stories` để hiển thị trong 3 tab của `ProfileScreen`.
   - *Đánh dấu code:* `// TODO: thay bằng API thật khi backend hỗ trợ GET /users/me/history, bookmarks, purchases`.

2. **Khối Đánh giá & Bình luận (`StoryDetailScreen`):**
   - Khối bình luận mẫu (bình luận từ người dùng *Anh Tuấn*, *Minh Phượng*) và form gửi bình luận lưu vào state cục bộ giống như web.
   - *Đánh dấu code:* `// TODO: thay bằng API thật GET/POST /chapters/{chapterId}/discussions khi backend hỗ trợ thảo luận cấp truyện`.

3. **Gói cước VIP (`PricingScreen`):**
   - Dữ liệu 3 gói hiển thị tĩnh theo thiết kế web. Nút thanh toán thông báo hoặc tạo đơn qua `/payments/subscription/{planId}` khi chọn gói.
   - *Đánh dấu code:* `// TODO: thay bằng API thật GET /subscriptions/plans`.

4. **Thống kê Admin Dashboard, Quản lý Thể loại, Quản lý Người dùng:**
   - Số liệu tổng quan (Doanh thu 12.8M, Người dùng 1,420, v.v.), danh sách thể loại mẫu và người dùng mẫu được giả lập giao diện bảng điều khiển như web.
   - *Đánh dấu code:* `// TODO: thay bằng API thật khi backend hoàn thiện endpoints quản trị danh mục/người dùng`.
   - **Lưu ý:** Phần **Quản lý Truyện và Thêm Chương** được kết nối **100% API THẬT** (`GET /stories`, `POST /stories`, `POST /stories/{id}/chapters`).

---

## 7. Cấu Trúc Mã Nguồn Dự Án

```
Storyreader_mobile/
├── android/                    # Cấu hình Android native (usesCleartextTraffic, permissions)
├── ios/                        # Cấu hình iOS native (ATS exception, bundle identifier)
├── lib/
│   ├── core/
│   │   ├── constants/          # AppColors (bảng màu Ink & Gold), ApiConstants (Base URL)
│   │   ├── network/            # DioClient cấu hình Interceptor, Token Bearer & tự động bắt 401
│   │   ├── router/             # GoRouter cấu hình điều hướng & route guard (Auth / Admin)
│   │   ├── storage/            # FlutterSecureStorage (Token) & SharedPreferences (Theme/Font)
│   │   └── theme/              # AppTheme Material 3 Dark tùy biến theo web tokens
│   ├── data/
│   │   ├── api/                # AuthApi, StoryApi, ChapterApi, PaymentApi
│   │   ├── models/             # AuthModel, StoryModel, ChapterModel, PaymentModel
│   │   └── repositories/       # UserMockRepository (Mock data giống web)
│   ├── features/
│   │   ├── admin/              # Layout, Dashboard, Quản lý Truyện, Thể Loại, Người Dùng
│   │   ├── auth/               # Màn hình Đăng nhập (Login), Đăng ký (Register)
│   │   ├── chapter_read/       # Trình đọc chương (Dark, Light, Sepia, cỡ chữ động)
│   │   ├── home/               # Trang chủ (Tìm kiếm, Lọc, Lưới truyện, Top xem nhiều)
│   │   ├── pricing/            # Trang gói VIP (Theo tháng/năm, tính năng, cổng thanh toán)
│   │   ├── profile/            # Trang cá nhân (Hồ sơ, Lịch sử, Bookmark, Truyện đã mua)
│   │   └── story_detail/       # Chi tiết truyện (Giới thiệu, Mua truyện, Danh sách chương)
│   ├── providers/              # AuthNotifier, StoryNotifier, ReaderNotifier (Riverpod)
│   ├── widgets/                # AppHeader, AppFooter, StoryCard, LoadingSkeleton, EmptyState
│   └── main.dart               # Entry point, ProviderScope, khởi tạo App & 401 handler
├── test/                       # Smoke tests
└── pubspec.yaml                # Cấu hình dependencies (dio, riverpod, go_router, google_fonts...)
```
