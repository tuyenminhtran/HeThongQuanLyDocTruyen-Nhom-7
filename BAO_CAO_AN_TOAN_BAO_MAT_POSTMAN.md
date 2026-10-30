# 🛡️ BÁO CÁO ĐÁNH GIÁ AN TOÀN BẢO MẬT TOÀN DIỆN & KỊCH BẢN KIỂM THỬ POSTMAN
> **Hệ Thống Quản Lý Đọc Truyện (StoryReader / StoryNest - Nhóm 7)**  
> *Phiên bản thẩm định bảo mật: Tháng 10/2026*  
> *Tiêu chuẩn áp dụng: OWASP API Security Top 10 (2023), OWASP ASVS 4.0, PCI-DSS Guidance*

---

## 📑 MỤC LỤC
1. [Tóm Tắt Kết Quả Quét & Đánh Giá Tổng Thể](#1-tóm-tắt-kết-quả-quét--đánh-giá-tổng-thể)
2. [Bảng Tổng Hợp Lỗ Hổng Theo Mức Độ Rủi Ro (Risk Matrix)](#2-bảng-tổng-hợp-lỗ-hổng-theo-mức-độ-rủi-ro-risk-matrix)
3. [Phân Tích Chi Tiết Từng Lỗ Hổng & Kịch Bản Khai Thác Qua Postman](#3-phân-tích-chi-tiết-từng-lỗ-hổng--kịch-bản-khai-thác-qua-postman)
   - 3.1. [VULN-01 (CRITICAL): Khóa bí mật JWT mặc định cho phép giả mạo quyền Admin](#31-vuln-01-critical-khóa-bí-mật-jwt-mặc-định-cho-phép-giả-mạo-quyền-admin)
   - 3.2. [VULN-02 (HIGH): Giả mạo Callback thanh toán để mua truyện / VIP 0 đồng](#32-vuln-02-high-giả-mạo-callback-thanh-toán-để-mua-truyện--vip-0-đồng)
   - 3.3. [VULN-03 (HIGH): Báo cáo bình luận lặp lại gây Censorship DoS (Ẩn bình luận tùy ý)](#33-vuln-03-high-báo-cáo-bình-luận-lặp-lại-gây-censorship-dos-ẩn-bình-luận-tùy-ý)
   - 3.4. [VULN-04 (HIGH): Thiếu Rate Limit tại bình luận và ghi nhận ViewCount gây kiệt quệ tài nguyên](#34-vuln-04-high-thiếu-rate-limit-tại-bình-luận-và-ghi-nhận-viewcount-gây-kiệt-quệ-tài-nguyên)
   - 3.5. [VULN-05 (MEDIUM): Thiếu kiểm tra phân quyền Admin trong API khóa tài khoản từ bình luận](#35-vuln-05-medium-thiếu-kiểm-tra-phân-quyền-admin-trong-api-khóa-tài-khoản-từ-bình-luận)
   - 3.6. [VULN-06 (MEDIUM): Thiếu DataAnnotation Validation tại các DTO (Giá âm, Số chương âm)](#36-vuln-06-medium-thiếu-dataannotation-validation-tại-các-dto-giá-âm-số-chương-âm)
   - 3.7. [VULN-07 (LOW): Chính sách CORS môi trường phát triển cho phép mọi nguồn kèm thông tin xác thực](#37-vuln-07-low-chính-sách-cors-môi-trường-phát-triển-cho-phép-mọi-nguồn-kèm-thông-tin-xác-thực)
   - 3.8. [VULN-08 (LOW): Thiếu cơ chế Token Blacklist/Revocation khi người dùng đăng xuất](#38-vuln-08-low-thiếu-cơ-chế-token-blacklistrevocation-khi-người-dùng-đăng-xuất)
4. [Bộ Test Case Postman Mẫu (Postman Collection Snippets)](#4-bộ-test-case-postman-mẫu-postman-collection-snippets)
5. [Hướng Dẫn Triển Khai Bản Vá Khắc Phục (Hardening Guide)](#5-hướng-dẫn-triển-khai-bản-vá-khắc-phục-hardening-guide)

---

## 1. TÓM TẮT KẾT QUẢ QUÉT & ĐÁNH GIÁ TỔNG THỂ

Qua quá trình rà quét mã nguồn toàn diện trên cả 2 phân hệ **Backend (.NET 8 Web API)** và **Frontend (React 19 + TypeScript)**, hệ thống StoryReader có nền tảng bảo mật ban đầu khá tốt:
- ✅ **Chống SQL Injection:** 100% truy vấn dữ liệu được điều phối qua Entity Framework Core LINQ với Parameterized Queries, không có chuỗi ghép SQL thô (`FromSqlRaw`, `string.Format`).
- ✅ **Chống Stored/DOM XSS:** Frontend React 19 không sử dụng `dangerouslySetInnerHTML`, toàn bộ nội dung hiển thị được encode ký tự HTML tự động; các liên kết không chứa pseudo-protocol nguy hiểm (`javascript:`).
- ✅ **Bảo mật File Upload:** API tải ảnh bìa `UploadCover` được bảo vệ bằng quyền Admin, kiểm tra dung lượng $\le 10\text{MB}$, giới hạn whitelist extension (`.jpg, .png, .webp`), dùng SkiaSharp để giải mã kiểm tra header nhị phân của ảnh thực tế và lưu file bằng UUID ngẫu nhiên (chống Path Traversal).
- ✅ **Xác thực Identity:** Mật khẩu được băm qua ASP.NET Identity (PBKDF2/HMAC-SHA256) với Salt ngẫu nhiên, có cơ chế lockout tài khoản sau 5 lần nhập sai liên tiếp.

Tuy nhiên, khi đối chiếu theo góc nhìn kiểm thử thâm nhập (Penetration Testing) thông qua công cụ như **Postman / Burp Suite**, hệ thống tồn tại **8 điểm yếu logic nghiệp vụ và xác thực** cần khắc phục trước khi đưa vào môi trường Production hoặc báo cáo hội đồng.

---

## 2. BẢNG TỔNG HỢP LỖ HỔNG THEO MỨC ĐỘ RỦI RO (RISK MATRIX)

| Mã lỗi | Lỗ hổng bảo mật | Phân loại OWASP | Mức độ | Ảnh hưởng |
| :--- | :--- | :--- | :---: | :--- |
| **VULN-01** | Khóa JWT bí mật mặc định nằm trong mã nguồn | **API2:2023 - Broken Authentication** | 🔴 **CRITICAL** | Kẻ tấn công tự sinh JWT giả mạo quyền Admin tối cao |
| **VULN-02** | Giả mạo Callback thanh toán cổng VNPay | **API5:2023 - Broken Function Level Authorization** | 🟠 **HIGH** | Mua truyện trả phí hoặc gói VIP 0 đồng qua Postman |
| **VULN-03** | Báo cáo bình luận lặp lại gây Censorship DoS | **API4:2023 - Unrestricted Resource Consumption** | 🟠 **HIGH** | 1 người dùng gửi 5 request ẩn bình luận của người khác |
| **VULN-04** | Thiếu Rate Limit tại bình luận và ViewCount | **API4:2023 - Unrestricted Resource Consumption** | 🟠 **HIGH** | Spam bình luận rác và bot lượt xem làm nghẽn DB |
| **VULN-05** | Khóa tài khoản từ báo cáo không kiểm tra Admin | **API1:2023 - Broken Object Level Authorization** | 🟡 **MEDIUM** | Admin có thể vô tình bị khóa bởi tính năng duyệt báo cáo |
| **VULN-06** | Thiếu DataAnnotation Validation tại DTOs | **API3:2023 - Broken Object Property Authorization** | 🟡 **MEDIUM** | Nhập giá âm (`Price: -50000`) hoặc số chương âm |
| **VULN-07** | CORS môi trường dev cho phép mọi Origin kèm Credentials | **API8:2023 - Security Misconfiguration** | 🔵 **LOW** | Rủi ro rò rỉ dữ liệu qua Cross-Origin nếu chạy sai môi trường |
| **VULN-08** | Thiếu cơ chế Token Blacklist/Revocation khi Logout | **API2:2023 - Broken Authentication** | 🔵 **LOW** | Token cũ vẫn hoạt động đến khi hết hạn sau khi đăng xuất |

---

## 3. PHÂN TÍCH CHI TIẾT TỪNG LỖ HỔNG & KỊCH BẢN KHAI THÁC QUA POSTMAN

---

### 3.1. VULN-01 (CRITICAL): Khóa bí mật JWT mặc định cho phép giả mạo quyền Admin
- **Mã OWASP:** API2:2023 – Broken Authentication
- **Vị trí tệp:** [StoryReader.Api/appsettings.json](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/appsettings.json#L15), [StoryReader.Api/Program.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Program.cs#L61-L80)
- **Mô tả điểm yếu:**
  Trong file cấu hình `appsettings.json`, khóa bí mật được lưu tĩnh:
  ```json
  "Jwt": {
    "Key": "CHANGE_ME_TO_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS"
  }
  ```
  Nếu kẻ tấn công tiếp cận được mã nguồn mở của dự án trên GitHub, họ hoàn toàn biết trước chuỗi khóa này. Sử dụng thư viện JWT chuẩn (hoặc trang `jwt.io`), kẻ tấn công có thể tự ký một AccessToken với Claim:
  - `sub`: ID của tài khoản Admin mẫu (`b61658d5-104c-4ab2-ab8e-416d24762567`).
  - `role`: `Admin`.
- **Kịch bản kiểm thử trên Postman:**
  1. Mở trang `jwt.io`, đặt Payload:
     ```json
     {
       "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier": "b61658d5-104c-4ab2-ab8e-416d24762567",
       "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/email": "admin@storynest.local",
       "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": "Admin",
       "iss": "StoryReaderApi",
       "aud": "StoryReaderClients",
       "exp": 1893456000
     }
     ```
  2. Ký bằng Secret Key: `CHANGE_ME_TO_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARS`.
  3. Mở Postman, gửi request:
     - **Method:** `DELETE`
     - **URL:** `http://localhost:5066/api/stories/{any-story-id}`
     - **Header:** `Authorization: Bearer <token_vừa_tạo>`
  4. **Kết quả:** Hệ thống chấp nhận token và xóa câu chuyện mà không cần đăng nhập hợp lệ!
- **Khắc phục:**
  - Chuyển `Jwt:Key` sang biến môi trường (`Environment Variable`) hoặc `User Secrets` (.NET Secret Manager) khi chạy thực tế.
  - Kiểm tra độ dài tối thiểu $\ge 64$ ký tự ngẫu nhiên entropy cao, không commit key thật lên Git.

---

### 3.2. VULN-02 (HIGH): Giả mạo Callback thanh toán để mua truyện / VIP 0 đồng
- **Mã OWASP:** API5:2023 – Broken Function Level Authorization
- **Vị trí tệp:** [StoryReader.Api/Controllers/PaymentsController.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Controllers/PaymentsController.cs#L38-L44), [StoryReader.Api/Services/PaymentService.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Services/PaymentService.cs#L54-L105)
- **Mô tả điểm yếu:**
  Khi người dùng tạo giao dịch mua truyện `POST /api/payments/story/{storyId}`, server trả về URL thanh toán:
  `https://sandbox.vnpayment.vn/pay?ref={tx.ProviderTransactionRef}&amount=...`
  Đồng thời, endpoint tiếp nhận kết quả:
  ```csharp
  [HttpPost("callback")]
  [AllowAnonymous]
  public async Task<IActionResult> Callback([FromQuery] string providerRef, [FromQuery] bool success)
  {
      await _payments.HandleGatewayCallbackAsync(providerRef, success);
      return Ok();
  }
  ```
  Endpoint này cho phép truy cập nặc danh (`[AllowAnonymous]`) và **hoàn toàn không có chữ ký số (Checksum HMAC-SHA512)** hoặc kiểm tra IP từ VNPay/Momo. Người dùng sau khi lấy được mã `providerRef` của chính mình có thể không cần thanh toán mà dùng Postman gửi request báo thành công giả.
- **Kịch bản kiểm thử trên Postman:**
  1. Đăng nhập tài khoản độc giả thường, lấy JWT token.
  2. Gửi request tạo thanh toán:
     - **POST** `http://localhost:5066/api/payments/story/{storyId_tra_phi}`
     - Nhận về `paymentUrl`, sao chép giá trị tham số `ref` (ví dụ: `8a7b3c2d1e...`).
  3. Mở tab mới trên Postman (không cần token):
     - **POST** `http://localhost:5066/api/payments/callback?providerRef=8a7b3c2d1e...&success=true`
  4. Kiểm tra lại: Tài khoản độc giả đã sở hữu vĩnh viễn truyện VIP mà không mất một đồng nào!
- **Khắc phục:**
  - Tích hợp kiểm tra mã kiểm tra toàn vẹn dữ liệu (Secure Hash / Checksum HMAC) do cổng thanh toán sinh ra dựa trên `SecretKey` bí mật giữa merchant và cổng thanh toán.
  - Không cho phép client gọi trực tiếp endpoint `callback` mà chỉ cho phép IP từ server VNPay hoặc sử dụng Webhook có chữ ký số.

---

### 3.3. VULN-03 (HIGH): Báo cáo bình luận lặp lại gây Censorship DoS (Ẩn bình luận tùy ý)
- **Mã OWASP:** API4:2023 – Unrestricted Resource Consumption
- **Vị trí tệp:** [StoryReader.Api/Controllers/DiscussionsController.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Controllers/DiscussionsController.cs#L81-L125)
- **Mô tả điểm yếu:**
  Trong cơ chế kiểm duyệt cộng đồng:
  ```csharp
  d.ReportCount++;
  if (d.ReportCount >= 5)
  {
      d.Status = DiscussionStatus.Hidden; // Tự động ẩn bình luận nếu bị báo cáo >= 5 lần
  }
  ```
  Hệ thống **chưa lưu vết người dùng nào đã báo cáo bình luận nào**. Do đó, 1 tài khoản độc giả duy nhất có thể gửi liên tục 5 request báo cáo cho cùng một bình luận.
- **Kịch bản kiểm thử trên Postman:**
  1. Đăng nhập bằng tài khoản độc giả A.
  2. Tìm một bình luận bất kỳ của người khác (`discussionId`).
  3. Dùng tính năng **Runner** trong Postman hoặc gửi lặp lại 5 lần:
     - **POST** `http://localhost:5066/api/chapters/{chapterId}/discussions/{discussionId}/report`
     - **Body:** `{"reason": "Spam"}`
  4. Ngay sau lần thứ 5, bình luận của nạn nhân bị chuyển sang trạng thái `Hidden` và biến mất khỏi trang đọc truyện!
- **Khắc phục:**
  - Tạo bảng trung gian `DiscussionReports (DiscussionId, UserId, Reason, CreatedAt)` với Khóa chính phức hợp `(DiscussionId, UserId)`.
  - Mỗi tài khoản chỉ được phép báo cáo 1 lần duy nhất cho mỗi bình luận.

---

### 3.4. VULN-04 (HIGH): Thiếu Rate Limit tại bình luận và ghi nhận ViewCount gây kiệt quệ tài nguyên
- **Mã OWASP:** API4:2023 – Unrestricted Resource Consumption
- **Vị trí tệp:** [StoryReader.Api/Controllers/DiscussionsController.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Controllers/DiscussionsController.cs#L49), [StoryReader.Api/Controllers/ChaptersController.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Controllers/ChaptersController.cs#L39-L44)
- **Mô tả điểm yếu:**
  1. **Spam bình luận:** `DiscussionsController.Post` không gắn policy Rate Limiting (`[EnableRateLimiting]`). Kẻ xấu có thể dùng script Postman Runner gửi hàng chục ngàn bình luận rác trong vài giây.
  2. **Bot lượt xem (View Buffing & DB I/O Amplification):** Mỗi khi gọi `GET /api/chapters/{id}`, hệ thống thực thi:
     ```csharp
     chapter.ViewCount++;
     chapter.Story.ViewCount++;
     await _db.SaveChangesAsync(); // Ghi đĩa PostgreSQL trực tiếp
     ```
     Nếu kẻ tấn công dùng Postman gửi 1.000 request `GET` song song (Concurrency), PostgreSQL sẽ bị tắc nghẽn Connection Pool do quá nhiều lệnh `UPDATE` đồng thời.
- **Kịch bản kiểm thử trên Postman:**
  - Dùng Postman Collection Runner, lặp 500 lần request `POST /api/chapters/{chapterId}/discussions` với nội dung text ngẫu nhiên $\rightarrow$ CSDL bị tràn ngập bình luận rác.
- **Khắc phục:**
  - Bổ sung Rate Limiter: Tối đa 5 bình luận/phút cho mỗi tài khoản.
  - Sử dụng Redis để gom lượt xem (`INCR chapter:{id}:views`), định kỳ 5 phút chạy Background Task cập nhật 1 lần vào PostgreSQL (Batch Update).

---

### 3.5. VULN-05 (MEDIUM): Thiếu kiểm tra phân quyền Admin trong API khóa tài khoản từ bình luận
- **Mã OWASP:** API1:2023 – Broken Object Level Authorization
- **Vị trí tệp:** [StoryReader.Api/Controllers/AdminReportedCommentsController.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Controllers/AdminReportedCommentsController.cs#L148-L160)
- **Mô tả điểm yếu:**
  Trong `AdminReportedCommentsController`, API `RestrictUser`:
  ```csharp
  [HttpPost("{id:guid}/restrict-user")]
  public async Task<IActionResult> RestrictUser(Guid id)
  {
      var d = await _db.Discussions.Include(x => x.User).FirstOrDefaultAsync(x => x.Id == id);
      if (d is null || d.User is null) return NotFound();
      d.User.IsRestricted = true; // KHÔNG KIỂM TRA d.User có phải Admin hay không!
      d.Status = DiscussionStatus.Hidden;
      await _db.SaveChangesAsync();
      ...
  }
  ```
  So với `AdminUsersController.ToggleRestriction` (có kiểm tra `IsInRoleAsync(user, "Admin")`), endpoint này bỏ sót kiểm tra. Nếu một Quản trị viên khác để lại bình luận và bị ai đó báo cáo, Admin xử lý bấm nhầm "Khóa tài khoản" sẽ khóa luôn tài khoản Admin của đồng nghiệp.
- **Khắc phục:**
  Thêm điều kiện: `if (await _userManager.IsInRoleAsync(d.User, "Admin")) return BadRequest("Không thể khóa tài khoản Quản trị viên.");`

---

### 3.6. VULN-06 (MEDIUM): Thiếu DataAnnotation Validation tại các DTO (Giá âm, Số chương âm)
- **Mã OWASP:** API3:2023 – Broken Object Property Level Authorization
- **Vị trí tệp:** [StoryReader.Api/Models/Dtos/StoryDtos.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Models/Dtos/StoryDtos.cs)
- **Mô tả điểm yếu:**
  Các DTO `CreateStoryDto`, `UpdateStoryDto`, `CreateChapterDto` sử dụng Record C# mà không có thuộc tính ràng buộc dữ liệu:
  - `Price`: Cho phép truyền số âm (ví dụ: `-100.000 VND`).
  - `FreeChapterCount`: Cho phép truyền số âm hoặc vượt quá $1.000.000$.
  - `ChapterNumber`: Cho phép số âm hoặc số $0$.
  - `Title`, `Content`: Không giới hạn kích thước tối đa, có thể gửi payload hàng chục Megabyte gây tràn bộ nhớ RAM (OOM).
- **Khắc phục:**
  Bổ sung các thuộc tính: `[Required]`, `[Range(0, 10000000)]`, `[MaxLength(200)]`, `[MinLength(1)]`.

---

### 3.7. VULN-07 (LOW): Chính sách CORS môi trường phát triển cho phép mọi nguồn kèm thông tin xác thực
- **Mã OWASP:** API8:2023 – Security Misconfiguration
- **Vị trí tệp:** [StoryReader.Api/Program.cs](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/StoryReader.Api/Program.cs#L150-L166)
- **Mô tả:**
  Đoạn mã:
  ```csharp
  if (builder.Environment.IsDevelopment())
  {
      p.SetIsOriginAllowed(_ => true)
       .AllowAnyHeader()
       .AllowAnyMethod()
       .AllowCredentials();
  }
  ```
  Nếu ứng dụng được đóng gói deploy lên server mà quên cấu hình biến môi trường `ASPNETCORE_ENVIRONMENT=Production`, cấu hình này sẽ cho phép bất kỳ website độc hại nào gửi cross-origin request có đính kèm cookie/thông tin xác thực của người dùng.
- **Khắc phục:** Luôn chỉ định danh sách Origin rõ ràng kể cả trong môi trường phát triển (`localhost:5173`, `localhost:3000`).

---

### 3.8. VULN-08 (LOW): Thiếu cơ chế Token Blacklist/Revocation khi người dùng đăng xuất
- **Mã OWASP:** API2:2023 – Broken Authentication
- **Vị trí tệp:** [storyreader-web/src/store/authStore.ts](file:///d:/HeThongQuanLyDocTruyen-Nhom-7/storyreader-web/src/store/authStore.ts#L36)
- **Mô tả:**
  Hàm `logout()` trên Frontend chỉ đơn thuần xóa token khỏi `localStorage` của trình duyệt. Token đó vẫn còn nguyên giá trị ký số hợp lệ trong 30 phút trên máy chủ. Nếu token bị rò rỉ trước đó (qua mạng LAN công cộng, lịch sử proxy), kẻ tấn công dùng Postman vẫn có thể sử dụng token này để gọi API bình thường.
- **Khắc phục:** Bổ sung bảng `RevokedTokens` trong Redis với TTL bằng thời gian sống còn lại của Token để kiểm tra nhanh trong middleware xác thực.

---

## 4. BỘ TEST CASE POSTMAN MẪU (POSTMAN COLLECTION SNIPPETS)

Dưới đây là các kịch bản kiểm thử Postman bạn có thể dùng để chứng minh an toàn bảo mật trước hội đồng chấm đồ án:

### Test Case 1: Thử nghiệm khai thác Callback thanh toán 0 đồng
- **Endpoint:** `POST {{baseUrl}}/api/payments/callback?providerRef=FAKE_REF_123&success=true`
- **Headers:** `Content-Type: application/json`
- **Kỳ vọng bảo mật (Sau khi vá):** `400 Bad Request` hoặc `401 Unauthorized` với thông báo `"Chữ ký số checksum không hợp lệ"`.

### Test Case 2: Kiểm tra phân quyền truy cập endpoint Admin
- **Endpoint:** `GET {{baseUrl}}/api/admin/users`
- **Headers:**
  - Trường hợp 1 (Khách): Không truyền Header `Authorization` $\rightarrow$ Trả về `401 Unauthorized`.
  - Trường hợp 2 (Độc giả thường): `Authorization: Bearer <member_token>` $\rightarrow$ Trả về `403 Forbidden`.
  - Trường hợp 3 (Quản trị viên): `Authorization: Bearer <admin_token>` $\rightarrow$ Trả về `200 OK`.

### Test Case 3: Thử nghiệm tấn công Spam báo cáo bình luận (Anti-Spam Report)
- **Endpoint:** `POST {{baseUrl}}/api/chapters/{{chapterId}}/discussions/{{discussionId}}/report`
- **Headers:** `Authorization: Bearer <member_token>`
- **Body:** `{"reason": "Spam testing"}`
- **Kỳ vọng bảo mật:**
  - Lần 1: `200 OK` ("Báo cáo thành công").
  - Lần 2 (Gửi lặp lại cùng user): `400 Bad Request` ("Bạn đã báo cáo bình luận này rồi").

---

## 5. HƯỚNG DẪN TRIỂN KHAI BẢN VÁ KHẮC PHỤC (HARDENING GUIDE)

Để giúp dự án đạt điểm tối đa về chất lượng kỹ thuật công nghệ thông tin, dưới đây là các bước vá lỗi cụ thể:

### Bước 1: Khắc phục VULN-03 (Chống Spam báo cáo bình luận)
Thêm bảng `DiscussionReport` và kiểm tra tồn tại trước khi tăng `ReportCount`:
```csharp
var alreadyReported = await _db.DiscussionReports
    .AnyAsync(r => r.DiscussionId == discussionId && r.UserId == CurrentUserId.Value);

if (alreadyReported)
    return BadRequest(new { message = "Bạn đã gửi báo cáo cho bình luận này trước đó rồi." });
```

### Bước 2: Khắc phục VULN-05 (Bảo vệ tài khoản Admin trong module bình luận)
Trong `AdminReportedCommentsController.cs`:
```csharp
if (await _userManager.IsInRoleAsync(d.User, "Admin"))
{
    return BadRequest(new { message = "Không thể khóa tài khoản của Quản trị viên hệ thống." });
}
```

### Bước 3: Khắc phục VULN-06 (Ràng buộc dữ liệu DTOs)
Bổ sung Validation Attributes cho các trường số liệu:
```csharp
public record CreateStoryDto(
    [Required(ErrorMessage = "Tiêu đề không được để trống")]
    [MaxLength(200, ErrorMessage = "Tiêu đề tối đa 200 ký tự")]
    string Title,

    [Required] string CoverImageUrl,
    [MaxLength(2000)] string Description,
    [MaxLength(100)] string Author,
    AccessPolicy AccessPolicy,
    
    [Range(0, 10000000, ErrorMessage = "Giá truyện phải từ 0 đến 10.000.000 VNĐ")]
    decimal? Price,
    
    [Range(0, 5000, ErrorMessage = "Số chương miễn phí không hợp lệ")]
    int FreeChapterCount,
    
    List<Guid> GenreIds,
    StoryType Type = StoryType.Novel
);
```

### Bước 4: Khắc phục VULN-04 (Áp dụng Rate Limiting cho tương tác)
Thêm Policy vào `Program.cs`:
```csharp
opt.AddPolicy("discussion", httpContext =>
    RateLimitPartition.GetFixedWindowLimiter(
        partitionKey: httpContext.User.FindFirstValue(ClaimTypes.NameIdentifier) ?? httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        factory: _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 5,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        }));
```
Gắn `[EnableRateLimiting("discussion")]` vào `DiscussionsController`.
