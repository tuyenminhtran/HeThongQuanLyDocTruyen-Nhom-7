# BÁO CÁO TIẾN ĐỘ DỰ ÁN — HỆ THỐNG ĐỌC TRUYỆN STORYREADER (NHÓM 7)

Tài liệu ghi nhận lịch sử hoàn thiện chức năng, sửa lỗi và xác minh thực tế trên toàn bộ hệ thống (Backend `.NET 8`, Web Frontend `React 19 + Tailwind CSS 3`, Mobile `Flutter`, PostgreSQL 16 & Docker).

---

## 1. Bảng tổng hợp các giai đoạn hoàn thiện

| Giai đoạn | Hạng mục chính | Trạng thái | Ghi chú kỹ thuật |
| :--- | :--- | :---: | :--- |
| **Giai đoạn 1** | Hạ tầng Docker (`postgres:16`, `redis:7`), ASP.NET Core Identity & JWT Auth, EF Core Migrations (20 bảng) | Hoàn thành | Seed sẵn Admin (`admin@storynest.local`) & Reader VIP (`reader@storyreader.vn`) |
| **Giai đoạn 2** | Quản lý Truyện (`Novel` & `Comic`), Chương phân tập (`PartName`), Render PNG watermark (`SkiaSharp`), Crawler MangaDex (`tools/crawl_manga.js`) | Hoàn thành | Hỗ trợ cả truyện chữ, truyện tranh Webtoon và ảnh chống copy |
| **Giai đoạn 3** | Chính sách Trả phí / Hỗn hợp / Gói VIP, luồng giao dịch `Transactions -> Purchases / UserSubscriptions`, trang `/pricing`, Admin Force Activate (PB28) | Hoàn thành | Xác thực callback payment ngoài Dev bằng header `X-Payment-Callback-Secret` |
| **Giai đoạn 4** | Đồng bộ Mobile App (`Storyreader_mobile`) Light Theme & thanh điều hướng, API hồ sơ, lịch sử đọc, theo dõi & thông báo | Hoàn thành | Đồng bộ hai nhánh `Darling` và `main` |
| **Giai đoạn 5** | Tính năng Nghe Truyện Audio Tiếng Việt (`AudioReaderPlayer` + Backend TTS Proxy `/api/tts` + `IMemoryCache` + Web Speech API fallback) | Hoàn thành | Tự động tách câu tiếng Việt, phím tắt `A`/`Esc`, lưu vị trí câu & tốc độ đọc |
| **Giai đoạn 6** | Rà soát & sửa toàn diện cổng Admin, quyền đọc trả phí, bảo mật chống spam Report, worker tự động xuất bản chương (`ScheduledChapterPublisherWorker`), xUnit test (`StoryReader.Tests`) & Code Splitting / ESLint Web | Hoàn thành | Đã chạy 13 xUnit tests (`StoryReader.Tests`), 0 lỗi/cảnh báo ESLint trên toàn `storyreader-web`, tách chunk `React.lazy` & kiểm thử E2E trên trình duyệt |
| **Giai đoạn 7** | Khôi phục & Đồng bộ toàn diện Flutter Mobile (`Storyreader_mobile`) đạt ngang hàng 1-1 với Web & Backend: Trả phí/VIP, Audio TTS (`/api/tts`), Báo cáo bình luận, Admin `Lịch Đăng` & `Báo Cáo BL`, CORS Pinterest & sửa lỗi UTF-8 | Hoàn thành | Khôi phục 34 tệp bị hồi quy sau merge `1fe109d`, bổ sung 54 bài test Flutter (54/54 pass, 0 vấn đề `flutter analyze`), 13/13 `StoryReader.Tests` pass |
| **Giai đoạn 8** | Vá toàn diện 8/8 lỗ hổng bảo mật (`BAO_CAO_AN_TOAN_BAO_MAT_POSTMAN.md`), kích hoạt **Redis 7** (`IAppCacheService`), JWT Refresh/Revocation (`/api/auth/refresh`, `/logout`), VNPay HMAC-SHA512, Rate Limiting & Buffer ViewCount (`ChapterViewFlushWorker`) | Hoàn thành | Migration `AddSecurityHardeningTables` nâng tổng CSDL lên **22 bảng**; `20/20` `StoryReader.Tests` pass, `55/55` Flutter tests & `dart analyze` pass, Web lint/build sạch, smoke test `/health` xác nhận `redis:up` & thu hồi JWT thực tế |

---

## 2. Chi tiết các nâng cấp & sửa lỗi nổi bật gần nhất

### A. Luồng Truyện Trả Phí, Hội Viên VIP & Thanh Toán
- Bắt buộc truyện `Paid` / `Mixed` phải có `Price > 0` tại cả DTO (`IValidatableObject`), Service và form Admin; tự động chuẩn hóa `Free` -> `Price = null, FreeChapterCount = 0`.
- Bổ sung `HasPurchased`, `HasActiveVip`, `HasFullAccess` trong `StoryDetailDto` giúp UI `/stories/:id` nhận diện chính xác người mua lẻ, thành viên VIP và Quản trị viên (Admin không bị chặn hay hiển thị nút mua thừa).
- Ngăn mua trùng truyện đã sở hữu hoặc mua lẻ khi đang còn hạn gói VIP; hiển thị thông báo lỗi cụ thể từ Backend trên màn hình đọc và chi tiết truyện.
- Đảm bảo khóa bình luận (`IsRestricted`) đồng thời chặn quyền đọc truyện trả phí trong `ChapterAccessService`.

### B. Trình Đọc Audio Tiếng Việt & Bảo Vệ Định Dạng Chương
- Backend `/api/tts` proxy đọc tiếng Việt qua Google Translate TTS có `IMemoryCache` giảm tải gọi trùng lặp; Frontend tự động chuyển Web Speech API nếu offline.
- Tắt nút **Nghe Audio** và phím tắt `A` khi chương là truyện tranh (`Type = 1`) hoặc chương tiểu thuyết đang xuất ở dạng ảnh PNG chống copy (`imageUrls.length > 0`).
- Thêm checkbox **Render chữ thành ảnh PNG chống copy** (mặc định tắt với chương Novel mới) trên `AdminStoriesPage` để giữ nguyên văn bản thuần cho Audio TTS và tùy biến nền/cỡ chữ.

### C. Cổng Quản Trị Admin & Tương Tác Độc Giả
- **Kiểm duyệt bình luận (`/admin/reports`):** Sửa lỗi gọi `restrictMutation` truyền nhầm `userId` thay vì `comment.id` (khiến API `restrict-user` trả 404); reset `ReportCount = 0` và `ReportReason = null` khi Admin duyệt hợp lệ; chặn 1 tài khoản spam bấm Report nhiều lần lên cùng bình luận (`IMemoryCache`).
- **Lịch đăng chương (`/admin/schedules`, `StoryService` & Worker nền):** Chuẩn hóa `DateTimeKind.Utc` cho `PublishAt` để tránh lỗi Npgsql `timestamp with time zone`; không gửi thông báo tới follower đối với chương hẹn giờ tương lai; bổ sung `ScheduledChapterPublisherWorker` (`BackgroundService`, chu kỳ 1 phút) tự động cập nhật `Story.UpdatedAt` & gửi thông báo idempotent khi chương tới hạn (bên cạnh thao tác **Đăng ngay** / **Hủy lịch (Xuất bản)** của Admin); lọc bỏ chương tương lai chưa tới giờ công bố khỏi bộ đếm chương trên Trang chủ & Hồ sơ (`ProfileController`).
- **Chất lượng mã nguồn & Automated Test:** Xây dựng bộ kiểm thử tự động `StoryReader.Tests` (xUnit + EF Core InMemory) bao phủ `ChapterAccessService`, `PaymentService`, `ScheduledChapterPublisherWorker`, `StoryService`, `ChapterPublicationHelper` và `DiscussionsController.Report`; dọn sạch toàn bộ 23 cảnh báo/lỗi ESLint trên `storyreader-web` và tách chunk động `React.lazy` + `Suspense` giảm kích thước JS bundle chính xuống ~407 kB.
- **Tối ưu truy vấn & Giao diện Light Theme:** Thay N+1 `GetRolesAsync` bằng join SQL đơn trên `AdminUsersController`; khắc phục triệt để lỗi chữ mờ / chữ trắng trên nền thẻ trắng (`#FFFFFF`) tại Dashboard, Users, Transactions, Categories, Stories; phân biệt chính xác huy hiệu `VIP` và CTA `Gói VIP` trên Header; sửa chuyển hướng `from` khi đăng ký tài khoản mới (`RegisterPage`).

### D. Đồng Bộ & Nâng Cấp Toàn Diện Mobile (`Storyreader_mobile`)
- **Khôi phục & Làm sạch mã nguồn:** Khôi phục 34 tệp Mobile bị ghi đè nhầm trong lần hợp nhất `1fe109d`, giữ nguyên & gộp gọn cơ chế proxy CORS ảnh Pinterest (`images.weserv.nl` khi `kIsWeb`) vào `ApiConstants.resolveImageUrl`, đồng thời sửa sạch toàn bộ chuỗi lỗi mã hóa UTF-8 (mojibake) tại `app_colors.dart` và `app_header.dart`.
- **Đồng bộ Trả phí, VIP & Thông báo lỗi 403:** Parse thêm `hasPurchased`, `hasActiveVip`, `hasFullAccess` trong `StoryDetail`; bỏ giá cố định `25.000 VNĐ`, dùng `formatVnd(story.price)`; ẩn nút mua và hiện huy hiệu trạng thái khi người dùng đã mua/có VIP/là Admin; bắt đúng `AppException` mã 403 từ `ChapterRepository` bằng `.asData?.value` (tránh crash khi provider lỗi) để hiện thông điệp máy chủ.
- **Nghe Truyện Audio Tiếng Việt trên Mobile:** Xây dựng `tts_chunker.dart` (`<= 180` ký tự/đoạn) + `AudioReaderBar` sử dụng `audioplayers` gọi `/api/tts?text=...&lang=vi`, hỗ trợ tốc độ `0.8x–2.0x`, lưu vị trí câu & tốc độ trong `SharedPreferences`, tự ẩn ở chương Comic / PNG.
- **Báo cáo Bình luận & Đầy đủ Cổng Admin:** Thêm `reportDiscussion` trên `DiscussionRepository` + modal chọn/nhập lý do trong `ChapterDiscussionsSheet`; bổ sung tab/route `/admin/schedules` (`AdminSchedulesScreen`) & `/admin/reports` (`AdminReportedCommentsScreen`), cùng chỉnh sửa/xóa truyện & chương, chọn `StoryType`, `PartName`, hẹn giờ `PublishAt` và cờ `renderAsImages` trong `AdminStoriesScreen`.

### E. Gia cố Bảo mật, Phiên đăng nhập & Kích hoạt Redis 7 (Vá 8/8 lỗ hổng OWASP API)
- **Kiểm soát cấu hình & CORS (`VULN-01`, `VULN-07`):** Xóa khóa `Jwt:Key` mặc định khỏi [StoryReader.Api/appsettings.json](./StoryReader.Api/appsettings.json), bổ sung [.env.example](./.env.example) và `SecurityConfigValidator.Validate` chặn khởi chạy ngoài Development nếu thiếu/dùng khóa yếu (`CHANGE_ME`, `DevOnly`, `< 32` ký tự) hoặc thiếu bí mật thanh toán; thay `SetIsOriginAllowed(_ => true)` bằng kiểm tra `Uri.IsLoopback` ở Dev và danh sách `Cors:AllowedOrigins` ở Production.
- **Kích hoạt Redis 7 & Buffer lượt xem (`VULN-03`, `VULN-04`):** Đăng ký `StackExchangeRedisCache` nối tới `redis:7` qua `ResilientAppCacheService` (`IAppCacheService`) tự fallback sang `IMemoryCache`; bổ sung bảng `DiscussionReports` (`(DiscussionId, UserId)`) chống spam báo cáo bền vững qua restart; gắn Rate Limiting 4 policy (`auth` 20/phút, `discussion` 6/phút, `payment` 10/phút, `tts` 60/phút); tách ghi nhận lượt xem sang `ChapterViewBufferService` (dedupe 2 phút/viewerKey) + `ChapterViewFlushWorker` flush mỗi 5 giây.
- **Xoay vòng Refresh Token & Thu hồi JWT (`VULN-08`):** Bổ sung claim `jti`/`iat`, bảng `RefreshTokens` (băm SHA-256) với phát hiện token reuse, endpoint `POST /api/auth/refresh` & `POST /api/auth/logout` (blacklist `jti` vào Redis/Cache); tự động thu hồi toàn bộ phiên khi đổi mật khẩu hoặc Admin khóa tài khoản; đồng bộ tự làm mới token khi gặp 401 trên cả Web (`client.ts` / `authStore.ts`) và Mobile (`DioClient` / `AuthProvider`).
- **Bảo mật Callback Thanh toán & Validation (`VULN-02`, `VULN-06`):** `POST /api/payments/callback` luôn bắt buộc `X-Payment-Callback-Secret` hoặc chữ ký VNPay HMAC-SHA512 ngay cả ở Development; bổ sung `/api/payments/vnpay-ipn` (đối chiếu HMAC-SHA512 & số tiền) và `/api/payments/dev-confirm` (yêu cầu đăng nhập Dev, kiểm tra sở hữu `tx.UserId == CurrentUserId` chống BOLA); giới hạn `[MaxLength(500000)]` cho nội dung chương.

---

## 3. Hướng dẫn kiểm thử nhanh các tài khoản Seed

| Vai trò | Email | Mật khẩu |
| :--- | :--- | :--- |
| **Admin** | `admin@storynest.local` | `Admin@123456` |
| **Reader (VIP sẵn 30 ngày)** | `reader@storyreader.vn` | `Reader@123456` |
| **Tài khoản Free** | Đăng ký mới tại `/register` | Tự chọn (>= 6 ký tự) |
