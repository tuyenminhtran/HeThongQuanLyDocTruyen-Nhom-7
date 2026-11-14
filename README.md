# Hệ Thống Quản Lý Đọc Truyện — StoryReader (Nhóm 7)

Nền tảng đọc truyện chữ (Novel), truyện tranh (Manga/Comic) và nghe truyện Audio tiếng Việt đa nền tảng (Web + Mobile + REST API).

---

## 1. Kiến trúc & Công nghệ thực tế

| Thành phần | Thư mục | Công nghệ / Thư viện chính |
| :--- | :--- | :--- |
| **Backend API** | [`StoryReader.Api`](./StoryReader.Api) | **.NET 8.0** (ASP.NET Core Web API), **Entity Framework Core 8.0.10**, **ASP.NET Core Identity** (`AppUser` + `IdentityRole<Guid>`), **JWT Bearer + Refresh Token** (`jti` revocation), **SkiaSharp 2.88.8** (render chữ sang ảnh PNG watermark chống copy), **IAppCacheService** (**Redis 7** + `IMemoryCache` fallback), **Rate Limiting**, **Swashbuckle / Swagger** |
| **Web Frontend** | [`storyreader-web`](./storyreader-web) | **React 19** (`^19.2.8`), **TypeScript 6** (`~6.0.2`), **Vite 8** (`^8.3.0`), **Tailwind CSS 3.4** (`^3.4.19`), **TanStack Query**, **Zustand**, **React Router**, **React Hook Form**, **Axios** (tự động refresh token 401) |
| **Mobile App** | [`Storyreader_mobile`](./Storyreader_mobile) | **Flutter** (Dart SDK `^3.12.2`), `flutter_riverpod`, `go_router`, `dio` (tự động refresh token 401), `audioplayers` (`Audio TTS`), `flutter_secure_storage`, `cached_network_image`, `jwt_decoder`, `url_launcher`, `intl` |
| **Cơ sở dữ liệu & Hạ tầng** | [`docker-compose.yml`](./docker-compose.yml) | **PostgreSQL 16** (cổng `5432`, **22 bảng**), **Redis 7** (cổng `6379`, active qua `StackExchangeRedisCache` cho TTS Audio cache, JWT blacklist, dedupe report & view buffer) |
| **Công cụ & Dữ liệu** | [`tools`](./tools), [`scripts`](./scripts), [`db`](./db) | Crawler MangaDex API (`tools/crawl_manga.js`), script nạp truyện chữ (`tools/add_novels.js`, `scripts/import_story.ps1`), PostgreSQL dump mẫu (`db/dump.sql`) |

---

## 2. Tính năng nổi bật đã hoàn thiện

### Dành cho Độc giả (User Portal)
- **Trang chủ & Xếp hạng (`/`, `/rankings`):** Tìm kiếm theo từ khóa (tiêu đề/tác giả), lọc theo thể loại, sắp xếp theo mới cập nhật / phổ biến / mới nhất / A-Z, chỉ đếm các chương đã đến lịch công bố.
- **Đọc truyện chữ & truyện tranh (`/stories/:id`, `/chapters/:id`):**
  - *Truyện chữ (Novel):* Giao diện đọc văn bản tùy biến Theme (Tối / Sáng / Sepia), cỡ chữ, font Serif/Sans-serif; hoặc chế độ ảnh PNG watermark chống copy (tạo bởi `SkiaSharp`).
  - *Truyện tranh (Comic / Manga):* Chế độ cuộn dọc Webtoon (`loading="lazy"`), hiển thị số trang ảnh.
  - *Lịch sử & Theo dõi (`/history`, `/following`):* Tự động lưu tiến độ đọc (`ReadingProgress`), theo dõi truyện để nhận thông báo khi ra chương mới (`Notifications`).
- **Trình đọc Audio Tiếng Việt (`/api/tts` + `AudioReaderPlayer`):**
  - Đọc từng câu truyện chữ tiếng Việt tự nhiên qua Backend TTS Proxy (`GET /api/tts`) với cache server `IMemoryCache` và cơ chế dự phòng **Web Speech API** trên trình duyệt.
  - Hỗ trợ chọn tốc độ (`0.8x` – `2.0x`), chuyển chương tự động, lưu vị trí câu đang đọc, phím tắt (`A` mở Audio, `Esc` đóng Audio) và tự động ẩn trên chương truyện tranh / chương ảnh PNG.
- **Mô hình Truyện Trả Phí & Hội Viên VIP (`/pricing`):**
  - Hỗ trợ 3 chính sách: **Miễn phí (`Free`)**, **Trả phí (`Paid`)**, **Hỗn hợp (`Mixed` với `FreeChapterCount` chương đầu đọc thử)**.
  - Thanh toán mua lẻ trọn bộ (`Purchase`) hoặc đăng ký gói VIP định kỳ (`UserSubscription`) với quy trình ghi nhận giao dịch `Pending -> Success/Failed`, hỗ trợ xác thực webhook **VNPay HMAC-SHA512** (`/api/payments/vnpay-ipn`, `/api/payments/callback`) và endpoint mô phỏng Dev riêng biệt (`/api/payments/dev-confirm` kiểm tra quyền sở hữu giao dịch).
  - *Header thông minh:* Hiển thị huy hiệu **VIP** khi tài khoản đang có gói VIP còn hiệu lực, hoặc **Gói VIP** để mời nâng cấp.
- **Bảo mật phiên & Chống lạm dụng:** Hỗ trợ **Refresh Token Rotation** (`POST /api/auth/refresh`) & thu hồi phiên ngay khi đăng xuất / đổi mật khẩu / khóa tài khoản qua **Redis JWT Blacklist** (`POST /api/auth/logout`); tích hợp **Rate Limiting** (`auth`, `discussion`, `payment`, `tts`), `DiscussionReports` bền vững, bộ đệm lượt xem `ChapterViewBufferService` (`ChapterViewFlushWorker`) và health-check `/health`.
- **Tương tác & Cộng đồng:** Bình luận theo chương, báo cáo bình luận vi phạm (tự động ẩn khi đạt ngưỡng báo cáo và chống 1 người spam báo cáo trùng lặp), chuông thông báo thời gian thực (`NotificationBell`).

### Dành cho Quản trị viên (`/admin` — Yêu cầu quyền `Admin`)
- **Dashboard (`/admin`):** Thống kê doanh thu hôm nay (% tăng trưởng), người dùng mới, lượt theo dõi, tổng lượt xem chương, giao dịch gần đây và hoạt động hệ thống.
- **Quản lý Truyện & Chương (`/admin/stories`):** Thêm/sửa/xóa truyện (`Novel` hoặc `Comic`), upload ảnh bìa hoặc URL, nhóm chương theo Tập/Phần (`PartName`), chọn xuất bản ngay hoặc hẹn giờ tương lai (`PublishAt`), tùy chọn bật/tắt render PNG chống copy cho từng chương Novel.
- **Lịch đăng chương (`/admin/schedules`):** Theo dõi chương hẹn giờ / sắp ra mắt / đã xuất bản, hỗ trợ **Đăng ngay**, **Đổi lịch**, hoặc **Hủy hẹn giờ**; tích hợp worker chạy nền `ScheduledChapterPublisherWorker` (`BackgroundService`) tự động quét mỗi phút để xuất bản đúng hạn, cập nhật `UpdatedAt` của truyện và gửi thông báo tới người theo dõi.
- **Kiểm duyệt Bình luận bị báo cáo (`/admin/reports`):** Duyệt hợp lệ (reset lượt báo cáo), Ẩn bình luận, Xóa vĩnh viễn, hoặc Khóa quyền bình luận của tài khoản vi phạm ngay trên dòng báo cáo.
- **Quản lý Người dùng (`/admin/users`):** Tìm kiếm tài khoản, xem vai trò (`Admin` / `VIP` / `Member`), Khóa / Mở khóa quyền truy cập & bình luận.
- **Quản lý Giao dịch (`/admin/transactions`):** Lọc giao dịch `Pending` / `Success` / `Failed`, hỗ trợ **Kích hoạt bù (PB28)** hoặc đánh dấu thất bại khi cổng thanh toán gặp sự cố.
- **Quản lý Thể loại (`/admin/categories`):** Thêm, sửa, xóa danh mục thể loại truyện.

---

## 3. Tài khoản Seed mặc định

Hệ thống tự động seed dữ liệu nền khi Backend khởi chạy (`StoryReader.Api/Data/DataSeeder.cs`):

| Vai trò | Email | Mật khẩu | Trạng thái mặc định |
| :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin@storynest.local` | `Admin@123456` | Full quyền truy cập truyện trả phí & cổng `/admin` |
| **Độc giả mẫu (VIP)** | `reader@storyreader.vn` | `Reader@123456` | Có sẵn gói VIP 30 ngày + 1 giao dịch mua truyện mẫu |

---

## 4. Hướng dẫn cài đặt và chạy nhanh (Local Development)

### Yêu cầu môi trường
- **Docker Desktop** (để chạy PostgreSQL 16 & Redis 7)
- **.NET 8 SDK** (`dotnet --version` >= 8.0)
- **Node.js 20+** & **npm**
- *(Tùy chọn)* **Flutter SDK** nếu chạy ứng dụng Mobile

### Bước 1: Khởi chạy Database & Container
```bash
docker compose up -d
```
Kiểm tra container đang chạy (`postgres:16` ở cổng `5432`, `redis:7` ở cổng `6379`):
```bash
docker compose ps
```

### Bước 2: Khởi chạy Backend API (.NET 8)
- Môi trường Development sử dụng khóa phát triển trong `StoryReader.Api/appsettings.Development.json`. Khi triển khai Staging/Production, thiết lập các biến môi trường theo mẫu [`.env.example`](./.env.example) (`SecurityConfigValidator` sẽ chặn khởi chạy nếu khóa JWT hoặc bí mật thanh toán yếu/thiếu).
```bash
dotnet restore StoryReader.Api
dotnet run --project StoryReader.Api --urls http://localhost:5066
```
- API chạy tại: `http://localhost:5066`
- Health-check Database & Redis: `http://localhost:5066/health`
- Swagger UI (Development): `http://localhost:5066/swagger`
- EF Core tự động chạy Migration (`MigrateAsync()`) / tạo schema **22 bảng** và seed tài khoản + truyện mẫu khi khởi động.

### Bước 3: Khởi chạy Web Frontend (Vite + React 19)
```bash
cd storyreader-web
npm install
npm run dev
```
- Web App chạy tại: `http://localhost:5173`
- Kiểm tra chất lượng & build production:
  ```bash
  dotnet test StoryReader.Tests
  npm run lint --prefix storyreader-web
  npm run build --prefix storyreader-web
  Push-Location Storyreader_mobile; dart analyze lib test; flutter test --no-pub; Pop-Location
  ```

### Bước 4: Nạp thêm dữ liệu truyện (Tùy chọn)
- Nạp thêm bộ truyện tranh tiếng Việt từ MangaDex API:
  ```bash
  node tools/crawl_manga.js "One Piece" --import
  ```
- Nạp bộ truyện chữ từ thư mục `Docx` qua REST API:
  ```powershell
  ./scripts/import_story.ps1
  ```

---

## 5. Tài liệu dự án liên quan
- [KIEN_TRUC_CONG_NGHE_VA_FLOW.md](./KIEN_TRUC_CONG_NGHE_VA_FLOW.md) — Kiến trúc hệ thống, lược đồ CSDL 22 bảng thực tế và các sơ đồ luồng xử lý.
- [BAO_CAO_AN_TOAN_BAO_MAT_POSTMAN.md](./BAO_CAO_AN_TOAN_BAO_MAT_POSTMAN.md) — Báo cáo thẩm định & xác minh khắc phục 8/8 lỗ hổng bảo mật OWASP API + kịch bản Postman.
- [BO_CAU_HOI_VAN_DAP_DO_AN.md](./BO_CAU_HOI_VAN_DAP_DO_AN.md) — Bộ câu hỏi & trả lời vấn đáp bám sát mã nguồn thực tế.
- [TIEN_DO.md](./TIEN_DO.md) — Nhật ký tiến độ triển khai và kiểm thử toàn hệ thống.
