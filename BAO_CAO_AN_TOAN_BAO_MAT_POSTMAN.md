# 🛡️ BÁO CÁO ĐÁNH GIÁ AN TOÀN BẢO MẬT TOÀN DIỆN & KỊCH BẢN KIỂM THỬ POSTMAN
> **Hệ Thống Quản Lý Đọc Truyện (StoryReader / StoryNest - Nhóm 7)**  
> *Trạng thái thẩm định: **Đã vá toàn diện 8/8 lỗ hổng & Xác minh tự động***  
> *Tiêu chuẩn áp dụng: OWASP API Security Top 10 (2023), OWASP ASVS 4.0, PCI-DSS Guidance*

---

## 📑 MỤC LỤC
1. [Tóm Tắt Kết Quả Quét & Đánh Giá Tổng Thể](#1-tóm-tắt-kết-quả-quét--đánh-giá-tổng-thể)
2. [Bảng Tổng Hợp Lỗ Hổng Theo Mức Độ Rủi Ro (Risk Matrix)](#2-bảng-tổng-hợp-lỗ-hổng-theo-mức-độ-rủi-ro-risk-matrix)
3. [Phân Tích Chi Tiết Từng Lỗ Hổng, Kịch Bản Postman & Bản Vá Thực Tế](#3-phân-tích-chi-tiết-từng-lỗ-hổng-kịch-bản-postman--bản-vá-thực-tế)
   - 3.1. [VULN-01 (CRITICAL): Khóa bí mật JWT mặc định](#31-vuln-01-critical-khóa-bí-mật-jwt-mặc-định)
   - 3.2. [VULN-02 (HIGH): Giả mạo Callback thanh toán để mua truyện / VIP 0 đồng](#32-vuln-02-high-giả-mạo-callback-thanh-toán-để-mua-truyện--vip-0-đồng)
   - 3.3. [VULN-03 (HIGH): Báo cáo bình luận lặp lại gây Censorship DoS](#33-vuln-03-high-báo-cáo-bình-luận-lặp-lại-gây-censorship-dos)
   - 3.4. [VULN-04 (HIGH): Thiếu Rate Limit tại bình luận, thanh toán, TTS và ghi nhận ViewCount](#34-vuln-04-high-thiếu-rate-limit-tại-bình-luận-thanh-toán-tts-và-ghi-nhận-viewcount)
   - 3.5. [VULN-05 (MEDIUM): Kiểm tra phân quyền Admin trong API khóa tài khoản từ bình luận](#35-vuln-05-medium-kiểm-tra-phân-quyền-admin-trong-api-khóa-tài-khoản-từ-bình-luận)
   - 3.6. [VULN-06 (MEDIUM): Ràng buộc DataAnnotation Validation tại các DTOs](#36-vuln-06-medium-ràng-buộc-dataannotation-validation-tại-các-dtos)
   - 3.7. [VULN-07 (LOW): Chính sách CORS môi trường phát triển & Production](#37-vuln-07-low-chính-sách-cors-môi-trường-phát-triển--production)
   - 3.8. [VULN-08 (LOW): Cơ chế Refresh Token Rotation & Token Blacklist/Revocation qua Redis](#38-vuln-08-low-cơ-chế-refresh-token-rotation--token-blacklistrevocation-qua-redis)
4. [Bộ Test Case Postman Xác Minh Bảo Mật (Post-Fix Verification)](#4-bộ-test-case-postman-xác-minh-bảo-mật-post-fix-verification)
5. [Kết Quả Xác Minh Tự Động & Kiểm Thử Sống (Postgres 16 + Redis 7)](#5-kết-quả-xác-minh-tự-động--kiểm-thử-sống-postgres-16--redis-7)

---

## 1. TÓM TẮT KẾT QUẢ QUÉT & ĐÁNH GIÁ TỔNG THỂ

Qua hai vòng rà soát mã nguồn và kiểm thử thâm nhập (Postman / automated unit test) trên toàn bộ **Backend (.NET 8 Web API)**, **Web Frontend (React 19 + TypeScript)** và **Mobile App (Flutter)**, hệ thống StoryReader hiện đảm bảo các lớp phòng thủ:
- ✅ **Chống SQL Injection:** 100% truy vấn dữ liệu được điều phối qua Entity Framework Core LINQ với Parameterized Queries, không ghép chuỗi SQL thô.
- ✅ **Chống Stored/DOM XSS:** Frontend React 19 không sử dụng `dangerouslySetInnerHTML`, tự động escape HTML trên toàn bộ nội dung truyện/bình luận.
- ✅ **Bảo mật File Upload:** API tải ảnh bìa yêu cầu quyền Admin, giới hạn dung lượng, kiểm tra extension và giải mã nhị phân bằng `SkiaSharp` trước khi lưu tên UUID ngẫu nhiên.
- ✅ **Xác thực Identity & Chống Brute-Force:** Mật khẩu băm qua ASP.NET Core Identity kèm Lockout tài khoản (15 phút sau 5 lần sai), **Refresh Token Rotation** (lưu SHA-256 hash trong bảng `RefreshTokens`), phát hiện token reuse và **JWT Blacklist (`jti`) trên Redis 7** khi đăng xuất / đổi mật khẩu / khóa tài khoản.
- ✅ **Toàn bộ 8/8 điểm yếu phát hiện từ vòng quét đầu (`VULN-01` → `VULN-08`) đã được vá hoàn chỉnh** trên mã nguồn, đồng bộ CSDL lên **22 bảng PostgreSQL** (`DiscussionReports`, `RefreshTokens`), kích hoạt **Redis 7** làm Distributed Cache (`IAppCacheService` với cơ chế tự fallback `IMemoryCache`), và được kiểm chứng bằng unit test + smoke test sống.

---

## 2. BẢNG TỔNG HỢP LỖ HỔNG THEO MỨC ĐỘ RỦI RO (RISK MATRIX)

| Mã lỗi | Lỗ hổng bảo mật ban đầu | Phân loại OWASP | Mức độ | Trạng thái | Tóm tắt bản vá đã triển khai |
| :--- | :--- | :--- | :---: | :---: | :--- |
| **VULN-01** | Khóa JWT bí mật mặc định nằm trong `appsettings.json` | **API2:2023 - Broken Authentication** | 🔴 **CRITICAL** | **ĐÃ KHẮC PHỤC ✅** | Xóa `Jwt:Key` khỏi `appsettings.json`, thêm `.env.example` và `SecurityConfigValidator.Validate` chặn khởi chạy khi thiếu/yếu secret |
| **VULN-02** | Giả mạo Callback thanh toán cổng VNPay | **API5:2023 - Broken Function Level Authorization** | 🟠 **HIGH** | **ĐÃ KHẮC PHỤC ✅** | `/api/payments/callback` luôn bắt buộc `X-Payment-Callback-Secret` hoặc VNPay HMAC-SHA512; thêm `/vnpay-ipn` (khớp HMAC + Amount) và `/dev-confirm` (JWT + BOLA check) |
| **VULN-03** | Báo cáo bình luận lặp lại gây Censorship DoS | **API4:2023 - Unrestricted Resource Consumption** | 🟠 **HIGH** | **ĐÃ KHẮC PHỤC ✅** | Thêm bảng bền vững `DiscussionReports` (`(DiscussionId, UserId)` PK) kết hợp cache Redis/Memory; Admin duyệt (`Approve`) sẽ xóa sạch vết báo cáo & reset `ReportCount = 0` |
| **VULN-04** | Thiếu Rate Limit & ghi DB mỗi lần xem chương | **API4:2023 - Unrestricted Resource Consumption** | 🟠 **HIGH** | **ĐÃ KHẮC PHỤC ✅** | Áp dụng 4 policy Rate Limit (`auth`, `discussion`, `payment`, `tts`); tách ghi nhận lượt xem qua `ChapterViewBufferService` (dedupe 2 phút) + `ChapterViewFlushWorker` flush 5 giây |
| **VULN-05** | Khóa tài khoản từ báo cáo không kiểm tra Admin | **API1:2023 - Broken Object Level Authorization** | 🟡 **MEDIUM** | **ĐÃ KHẮC PHỤC ✅** | `AdminReportedCommentsController.RestrictUser` chặn khóa `Admin` và tự động gọi `RevokeAllUserSessionsAsync` thu hồi toàn bộ phiên của tài khoản bị khóa |
| **VULN-06** | Thiếu DataAnnotation Validation tại DTOs | **API3:2023 - Broken Object Property Level Authorization** | 🟡 **MEDIUM** | **ĐÃ KHẮC PHỤC ✅** | Bổ sung `[Range]`, `[Required]`, `[MaxLength]` (gồm `[MaxLength(500000)]` trên `Content` chương), `[MaxLength]` trên `AuthDtos` và `IValidatableObject` |
| **VULN-07** | CORS môi trường Dev cho phép mọi Origin (`_ => true`) | **API8:2023 - Security Misconfiguration** | 🔵 **LOW** | **ĐÃ KHẮC PHỤC ✅** | Thay bằng kiểm tra `Uri.IsLoopback` ở Development và danh sách `Cors:AllowedOrigins` chặt chẽ ngoài Development |
| **VULN-08** | Thiếu Refresh Token & JWT Blacklist khi Logout | **API2:2023 - Broken Authentication** | 🔵 **LOW** | **ĐÃ KHẮC PHỤC ✅** | Bổ sung `jti`/`iat`, bảng `RefreshTokens`, `/api/auth/refresh`, `/api/auth/logout`, thu hồi phiên khi đổi mật khẩu/khóa user và tự refresh 401 trên Web & Mobile |

---

## 3. PHÂN TÍCH CHI TIẾT TỪNG LỖ HỔNG, KỊCH BẢN POSTMAN & BẢN VÁ THỰC TẾ

### 3.1. VULN-01 (CRITICAL): Khóa bí mật JWT mặc định
- **Mã OWASP:** API2:2023 – Broken Authentication
- **Trạng thái:** **ĐÃ KHẮC PHỤC ✅**
- **Vấn đề ban đầu:** File cấu hình gốc `appsettings.json` từng chứa chuỗi `Jwt:Key` tĩnh dễ đoán, khiến kẻ tấn công có thể dùng `jwt.io` giả mạo JWT Admin.
- **Bản vá đã triển khai:**
  - Làm rỗng `"Jwt:Key": ""` và `"Payments:CallbackSecret": ""` trong [appsettings.json](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/appsettings.json#L13-L28); chuyển khóa phát triển cục bộ sang [appsettings.Development.json](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/appsettings.Development.json#L11-L20).
  - Bổ sung tệp mẫu biến môi trường [.env.example](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/.env.example#L1-L27) phục vụ Staging/Production.
  - Tạo [SecurityConfigValidator.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Security/SecurityConfigValidator.cs#L7-L66) và gọi tại [Program.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Program.cs#L19): từ chối khởi chạy ngay lập tức nếu `Jwt:Key` rỗng/nhỏ hơn 32 ký tự, hoặc chứa `CHANGE_ME` / `DevOnly` ngoài Development, hoặc thiếu `Payments:CallbackSecret` / `Payments:VnPay:HashSecret` ($\ge 16$ ký tự) trên Production/Staging.

---

### 3.2. VULN-02 (HIGH): Giả mạo Callback thanh toán để mua truyện / VIP 0 đồng
- **Mã OWASP:** API5:2023 – Broken Function Level Authorization
- **Trạng thái:** **ĐÃ KHẮC PHỤC ✅**
- **Vấn đề ban đầu:** `POST /api/payments/callback` từng đặt `[AllowAnonymous]` mà không xác thực bí mật webhook khi chạy ở chế độ Development, giúp bất kỳ ai có `providerRef` đều có thể kích hoạt đơn hàng miễn phí.
- **Bản vá đã triển khai:**
  - Tại [PaymentsController.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Controllers/PaymentsController.cs#L65-L144):
    - `POST /api/payments/callback`: **Luôn yêu cầu** header `X-Payment-Callback-Secret` (so sánh hằng thời gian `CryptographicOperations.FixedTimeEquals`) **hoặc** chữ ký số VNPay `vnp_SecureHash` HMAC-SHA512 **ngay cả trong Development**. Không có xác thực hợp lệ sẽ trả `401 Unauthorized`.
    - Bổ sung `[HttpGet/Post("vnpay-ipn")]`: xác thực chữ ký HMAC-SHA512 chuẩn VNPay (`v2.1.0`) qua [VnPayGatewayHelper.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Security/VnPayGatewayHelper.cs#L9-L118) và đối chiếu khớp số tiền giao dịch qua `PaymentService.HandleVnPayCallbackAsync`.
    - Tách riêng `POST /api/payments/dev-confirm`: yêu cầu `[Authorize]`, chỉ hoạt động ở Development khi `Payments:EnableDevSimulation = true`, và kiểm tra quyền sở hữu (`tx.UserId == CurrentUserId` — chống BOLA) trong [PaymentService.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Services/PaymentService.cs).
  - Đồng bộ Web ([payments.ts](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/storyreader-web/src/api/payments.ts)) và Mobile ([subscription_repository.dart](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/Storyreader_mobile/lib/data/repositories/subscription_repository.dart)) gọi `/api/payments/dev-confirm` cho luồng mô phỏng Dev.

---

### 3.3. VULN-03 (HIGH): Báo cáo bình luận lặp lại gây Censorship DoS
- **Mã OWASP:** API4:2023 – Unrestricted Resource Consumption
- **Trạng thái:** **ĐÃ KHẮC PHỤC ✅**
- **Vấn đề ban đầu:** Một tài khoản có thể gửi nhiều request báo cáo cùng 1 bình luận để đẩy `ReportCount >= 5` và ẩn bình luận của người khác.
- **Bản vá đã triển khai:**
  - Bổ sung thực thể `DiscussionReport` ([Engagement.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Models/Entities/Engagement.cs#L32-L41)) với khóa chính phức hợp `(DiscussionId, UserId)` trong bảng PostgreSQL `DiscussionReports` (được áp dụng qua Migration `20261114052123_AddSecurityHardeningTables`).
  - Tại [DiscussionsController.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Controllers/DiscussionsController.cs#L88): kiểm tra cả cache `IAppCacheService` lẫn bảng `DiscussionReports` bền vững (chống spam kể cả sau khi restart server hoặc flush cache), chặn tự báo cáo bình luận của chính mình và chặn báo cáo trùng lặp (`400 Bad Request`).
  - Khi Admin duyệt hợp lệ tại `AdminReportedCommentsController.Approve`, hệ thống xóa bản ghi `DiscussionReports` tương ứng, reset `ReportCount = 0` và dọn cache để quy trình kiểm duyệt sạch sẽ.

---

### 3.4. VULN-04 (HIGH): Thiếu Rate Limit tại bình luận, thanh toán, TTS và ghi nhận ViewCount
- **Mã OWASP:** API4:2023 – Unrestricted Resource Consumption
- **Trạng thái:** **ĐÃ KHẮC PHỤC ✅**
- **Bản vá đã triển khai:**
  - Cấu hình 4 Rate Limiter cố định theo cửa sổ 1 phút (`QueueLimit = 0`, trả `429 Too Many Requests`) tại [Program.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Program.cs#L128-L170):
    - `"auth"`: 20 req/phút theo IP ([AuthController.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Controllers/AuthController.cs#L14)).
    - `"discussion"`: 6 req/phút theo UserId/IP ([DiscussionsController.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Controllers/DiscussionsController.cs#L55)).
    - `"payment"`: 10 req/phút theo UserId/IP ([PaymentsController.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Controllers/PaymentsController.cs#L32)).
    - `"tts"`: 60 req/phút theo UserId/IP ([TtsController.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Controllers/TtsController.cs#L11)).
  - Chống View Buffing & giảm tải DB I/O: thay `SaveChangesAsync()` trực tiếp mỗi lượt đọc chương bằng [ChapterViewBufferService.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Services/ChapterViewBufferService.cs) (chống trùng theo `viewerKey` trong cửa sổ 2 phút thông qua `IAppCacheService` trên **Redis 7**) kết hợp worker nền [ChapterViewFlushWorker.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Services/ChapterViewFlushWorker.cs#L10) gom batch ghi PostgreSQL mỗi **5 giây** (`ExecuteUpdateAsync` kèm fallback cho InMemory test).

---

### 3.5. VULN-05 (MEDIUM): Kiểm tra phân quyền Admin trong API khóa tài khoản từ bình luận
- **Mã OWASP:** API1:2023 – Broken Object Level Authorization
- **Trạng thái:** **ĐÃ KHẮC PHỤC ✅**
- **Bản vá đã triển khai:** Tại [AdminReportedCommentsController.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Controllers/AdminReportedCommentsController.cs#L184) (`RestrictUser`), kiểm tra `_userManager.IsInRoleAsync(d.User, "Admin")` để từ chối khóa tài khoản Quản trị viên; đồng thời gọi `_auth.RevokeAllUserSessionsAsync(d.User.Id)` khi khóa tài khoản người dùng vi phạm (áp dụng nhất quán cả ở `AdminUsersController`).

---

### 3.6. VULN-06 (MEDIUM): Ràng buộc DataAnnotation Validation tại các DTOs
- **Mã OWASP:** API3:2023 – Broken Object Property Level Authorization
- **Trạng thái:** **ĐÃ KHẮC PHỤC ✅**
- **Bản vá đã triển khai:**
  - Tại [StoryDtos.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Models/Dtos/StoryDtos.cs#L21-L131): áp dụng `[Required]`, `[MaxLength]`, `[Range]` cho `Title`, `CoverImageUrl`, `Description`, `Author`, `Price` (`0..50_000_000`), `FreeChapterCount` (`0..10_000`), `ChapterNumber` (`1..100_000`), `[MaxLength(500000)]` cho `Content` chương (`CreateChapterDto`, `UpdateChapterDto`), `[MaxLength(100)]` cho `PartName`, cùng `IValidatableObject` bắt buộc truyện `Paid`/`Mixed` phải có `Price > 0`.
  - Tại [AuthDtos.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Models/Dtos/AuthDtos.cs#L5-L34): giới hạn độ dài `Email`, `Password`, `DisplayName`, `RefreshToken`.

---

### 3.7. VULN-07 (LOW): Chính sách CORS môi trường phát triển & Production
- **Mã OWASP:** API8:2023 – Security Misconfiguration
- **Trạng thái:** **ĐÃ KHẮC PHỤC ✅**
- **Bản vá đã triển khai:** Tại [Program.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Program.cs#L210): loại bỏ wildcard `SetIsOriginAllowed(_ => true)`. Ở Development chỉ chấp nhận origin loopback (`Uri.IsLoopback`) hoặc nằm trong `Cors:AllowedOrigins`; ngoài Development chỉ cho phép đúng danh sách cấu hình `Cors:AllowedOrigins`.

---

### 3.8. VULN-08 (LOW): Cơ chế Refresh Token Rotation & Token Blacklist/Revocation qua Redis
- **Mã OWASP:** API2:2023 – Broken Authentication
- **Trạng thái:** **ĐÃ KHẮC PHỤC ✅**
- **Bản vá đã triển khai:**
  - **Backend ([AuthService.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Services/AuthService.cs), [AuthController.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Controllers/AuthController.cs#L53-L80)):** Mỗi JWT gắn thêm `jti` (UUID) và `iat` (Unix timestamp); sinh Refresh Token ngẫu nhiên lưu dạng băm SHA-256 trong bảng `RefreshTokens` ([RefreshToken.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Models/Entities/RefreshToken.cs)); endpoint `POST /api/auth/refresh` xoay vòng token mới và tự thu hồi toàn bộ chuỗi phiên của user nếu phát hiện dùng lại token cũ (reuse detection); `POST /api/auth/logout` đưa `jti` vào blacklist trên **Redis 7** (`storyreader:revoked:jti:{jti}`) với TTL đúng bằng thời gian sống còn lại của JWT và thu hồi Refresh Token.
  - **Middleware ([Program.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Program.cs#L89)):** `OnTokenValidated` kiểm tra `IsRestricted` và `IsTokenRevokedAsync(jti, userId, iat)` cho mọi request xác thực (bao gồm trường hợp đổi mật khẩu tại `ProfileController` hoặc bị Admin khóa).
  - **Web & Mobile Sync:** Client React ([client.ts](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/storyreader-web/src/api/client.ts), [authStore.ts](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/storyreader-web/src/store/authStore.ts)) và Flutter ([dio_client.dart](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/Storyreader_mobile/lib/core/network/dio_client.dart), [auth_provider.dart](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/Storyreader_mobile/lib/providers/auth_provider.dart)) tự động gọi `/api/auth/refresh` khi gặp `401` (coalescing chống gọi trùng) và gọi `/api/auth/logout` khi người dùng đăng xuất.

---

## 4. BỘ TEST CASE POSTMAN XÁC MINH BẢO MẬT (POST-FIX VERIFICATION)

Các kịch bản kiểm thử Postman chứng minh bản vá hoạt động thực tế khi bảo vệ trước hội đồng:

### Test Case 1: Kiểm tra hạ tầng Health & Redis 7
- **Method & URL:** `GET {{baseUrl}}/health`
- **Kỳ vọng:** `200 OK` với JSON `{"status":"healthy","database":"up","cache":"redis:up", ...}`.

### Test Case 2: Chặn giả mạo Callback thanh toán 0 đồng (`VULN-02`)
- **Method & URL:** `POST {{baseUrl}}/api/payments/callback?providerRef=FAKE_REF_123&success=true` (không truyền header `X-Payment-Callback-Secret` hoặc chữ ký `vnp_SecureHash`).
- **Kỳ vọng:** `401 Unauthorized` (kể cả khi server chạy ở Development).
- **Biến thể kiểm tra BOLA Dev Simulation:** User B dùng JWT gọi `POST {{baseUrl}}/api/payments/dev-confirm?providerRef=<ref_của_User_A>&success=true` $\rightarrow$ trả về `403 Forbidden`, giao dịch giữ nguyên `Pending`.
- **Biến thể VNPay IPN:** `GET {{baseUrl}}/api/payments/vnpay-ipn?vnp_TxnRef=...&vnp_Amount=100&vnp_SecureHash=INVALID` $\rightarrow$ từ chối sai chữ ký (`401 Unauthorized`, `RspCode: "97"`).

### Test Case 3: Chống Spam báo cáo bình luận & Reset khi Admin duyệt (`VULN-03`)
- **Endpoint:** `POST {{baseUrl}}/api/chapters/{{chapterId}}/discussions/{{discussionId}}/report`
- **Headers:** `Authorization: Bearer <member_token>`, Body: `{"reason": "Spam testing"}`
- **Kỳ vọng:** Lần 1 trả `200 OK`; lần 2 (kể cả sau restart/flush cache) trả `400 Bad Request` (`DiscussionReports` đã lưu vết `(DiscussionId, UserId)`).

### Test Case 4: Refresh Token Rotation & Thu hồi JWT sau Logout (`VULN-08`)
1. `POST {{baseUrl}}/api/auth/login` $\rightarrow$ nhận `accessToken` + `refreshToken`.
2. `POST {{baseUrl}}/api/auth/refresh` với `{ "refreshToken": "..." }` $\rightarrow$ nhận cặp token mới; thử gửi lại `refreshToken` cũ $\rightarrow$ bị từ chối & thu hồi toàn bộ phiên đang hoạt động.
3. `POST {{baseUrl}}/api/auth/logout` kèm `Authorization: Bearer <accessToken_mới>` và `{ "refreshToken": "<refreshToken_mới>" }` $\rightarrow$ `200 OK`.
4. Dùng lại `<accessToken_mới>` gọi `GET {{baseUrl}}/api/profile` $\rightarrow$ **trả về `401 Unauthorized`** (được xác minh ngay qua Redis key `storyreader:revoked:jti:*`).

### Test Case 5: Kiểm tra phân quyền Admin & Chống khóa nhầm Admin (`VULN-05`)
- `GET {{baseUrl}}/api/admin/users`: Không token $\rightarrow$ `401`; Token Member $\rightarrow$ `403`; Token Admin $\rightarrow$ `200`.
- `POST {{baseUrl}}/api/admin/reported-comments/{adminCommentId}/restrict-user`: Trả `400 Bad Request`, không cho phép khóa tài khoản Admin.

### Test Case 6: Kiểm tra Rate Limit (`VULN-04`)
- Dùng Postman Collection Runner gửi $\ge 7$ request liên tiếp trong 1 phút tới `POST {{baseUrl}}/api/chapters/{{chapterId}}/discussions` $\rightarrow$ Từ request thứ 7 trả `429 Too Many Requests`.

---

## 5. KẾT QUẢ XÁC MINH TỰ ĐỘNG & KIỂM THỬ SỐNG (POSTGRES 16 + REDIS 7)

Toàn bộ các thay đổi bảo mật và kiến trúc đã được kiểm chứng thực tế sau chỉnh sửa:
1. **PostgreSQL Migration & Docker:**
   - Container `postgres:16` (cổng `5432`) và `redis:7` (cổng `6379`) chạy ổn định (`redis-cli ping -> PONG`).
   - Database `storyreader` đã áp dụng migration `20261114052123_AddSecurityHardeningTables` với đầy đủ **22 bảng** (xác nhận qua `psql \dt`).
2. **Backend Automated Tests (`StoryReader.Tests` — xUnit):**
   - **20/20 bài test pass** (`0 Failed, 0 Skipped, 0 Warnings`), bao phủ đầy đủ các test cũ và bộ [SecurityHardeningTests.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Tests/SecurityHardeningTests.cs) + [DiscussionsControllerTests.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Tests/DiscussionsControllerTests.cs) kiểm tra `SecurityConfigValidator`, `VnPayGatewayHelper`, `PaymentsController.Callback`, `ConfirmDevSimulationAsync` BOLA, `HandleVnPayCallbackAsync`, `AuthService` Refresh Rotation + Reuse Detection + `jti` Revocation, `ChapterViewBufferService` dedupe/flush, và `CreateChapterDto`/`UpdateChapterDto` MaxLength.
3. **Live API Smoke Check với PostgreSQL 16 + Redis 7:**
   - `GET /health` $\rightarrow$ `{"status":"healthy","database":"up","cache":"redis:up"}`.
   - `POST /api/payments/callback` (không secret) $\rightarrow$ `401`.
   - `/api/auth/login` $\rightarrow$ `/api/profile` (`200`) $\rightarrow$ `/api/auth/refresh` (xoay vòng token mới) $\rightarrow$ `/api/auth/logout` (`200`) $\rightarrow$ gọi lại `/api/profile` bằng JWT cũ $\rightarrow$ **`401`**, đồng thời xác nhận khóa `storyreader:revoked:jti:*` tồn tại thực tế trong `redis:7`.
4. **Web & Mobile Quality Checks:**
   - **Web (`storyreader-web`):** `npm run lint` (0 lỗi/cảnh báo) & `npm run build` (`tsc -b && vite build`) thành công.
   - **Mobile (`Storyreader_mobile`):** `dart analyze lib test` (`No issues found!`) & `flutter test --no-pub` (**55/55 bài test pass**).
