# BỘ CÂU HỎI VẤN ĐÁP & BẢO VỆ ĐỒ ÁN — STORYREADER (NHÓM 7)

Tài liệu tổng hợp câu hỏi thường gặp của Hội đồng phản biện khi chấm đồ án, bám sát **100% thiết kế và mã nguồn thực tế** trong dự án.

---

## PHẦN 1: KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ (ARCHITECTURE & TECH STACK)

### Câu 1: Hãy trình bày kiến trúc tổng thể và các công nghệ cốt lõi của hệ thống?
**Trả lời:**
Hệ thống áp dụng kiến trúc **Client-Server tách biệt (Decoupled RESTful API)** gồm 3 phần:
- **Backend (`StoryReader.Api`):** Xây dựng trên **.NET 8.0 (ASP.NET Core Web API)** theo mô hình phân lớp (`Controllers -> Services -> AppDbContext -> PostgreSQL 16`). Sử dụng **EF Core 8.0.10**, **ASP.NET Core Identity**, **JWT Bearer Authentication**, **SkiaSharp 2.88.8** (render văn bản sang PNG watermark) và **IMemoryCache**.
- **Web Frontend (`storyreader-web`):** Xây dựng bằng **React 19** (`^19.2.8`), **TypeScript 6**, **Vite 8**, **Tailwind CSS 3.4**, quản lý server state với **TanStack Query** và auth state với **Zustand**.
- **Mobile App (`Storyreader_mobile`):** Xây dựng bằng **Flutter** (Dart SDK `^3.12.2`), dùng **Riverpod**, **GoRouter** và **Dio**, dùng chung toàn bộ REST API với Web.

---

### Câu 2: Vì sao nhóm tách riêng bảng `Stories` (Truyện) và `Chapters` (Chương), đồng thời hỗ trợ cả Truyện chữ và Truyện tranh trên cùng một mô hình?
**Trả lời:**
1. **Tối ưu truy vấn danh sách:** Trang chủ (`GET /api/stories`) chỉ cần lấy metadata nhẹ của `Stories` và số lượng chương đã phát hành (`TotalChapters`), không phải tải hàng megabyte nội dung `Chapters.Content`.
2. **Thống nhất nghiệp vụ đọc & trả phí:** Trường `Stories.Type` phân biệt `0 = Novel` (Truyện chữ) và `1 = Comic` (Truyện tranh). Nhờ vậy, các nghiệp vụ `FreeChapterCount`, mua lẻ (`Purchases`), VIP (`UserSubscriptions`), theo dõi (`StoryFollows`), tiến độ đọc (`ReadingProgresses`) và lịch đăng (`PublishAt`) dùng chung một cấu trúc bảng sạch sẽ, không dư thừa.

---

## PHẦN 2: BẢO MẬT, XÁC THỰC & PHÂN QUYỀN (SECURITY & ACCESS CONTROL)

### Câu 3: Hệ thống xác thực người dùng và phân quyền như thế nào?
**Trả lời:**
1. **Lưu mật khẩu an toàn:** Sử dụng `ASP.NET Core Identity` (`UserManager<AppUser>`) băm mật khẩu chuẩn PBKDF2 kèm salt ngẫu nhiên.
2. **Stateless JWT Bearer Token:** Khi đăng nhập/đăng ký (`POST /api/auth/login`, `POST /api/auth/register`), server cấp Access Token ký bằng `HMAC-SHA256` chứa `NameIdentifier`, `Email`, `displayName` và `Role` (`Admin` / `Member`).
3. **Phân quyền ở Backend & Frontend:**
   - Các API quản trị đều gắn `[Authorize(Roles = "Admin")]`.
   - Tài khoản bị Admin khóa (`IsRestricted = true`) bị chặn bình luận, chặn mua gói/mua truyện và bị từ chối quyền đọc chương trả phí trong `ChapterAccessService`.

---

### Câu 4: Cơ chế kiểm tra quyền đọc chương trả phí (`Paid` / `Mixed`) hoạt động ra sao để tránh người dùng sửa JS/URL vượt rào?
**Trả lời:**
Toàn bộ kiểm tra quyền đọc nằm ở **Backend** tại `ChapterAccessService.CanReadChapterAsync`:
1. Khi client gọi `GET /api/chapters/{id}`, API kiểm tra tuần tự trên PostgreSQL:
   - Nếu `User.IsRestricted == true`: trả `403 Forbidden`.
   - Nếu chương chưa tới giờ `PublishAt` và người gọi không phải `Admin`: trả `403 Forbidden`.
   - Nếu `Story.AccessPolicy == Free` hoặc `ChapterNumber <= Story.FreeChapterCount`: cho đọc ngay.
   - Ngược lại, bắt buộc người dùng phải thuộc 1 trong 3 trường hợp: có role `Admin`, có bản ghi sở hữu trong bảng `Purchases`, hoặc có gói `UserSubscriptions` còn hạn (`EndAt > DateTime.UtcNow`).
2. Nếu không đủ điều kiện, server tuyệt đối không trả về `Content` hay `ImageUrls` mà trả mã lỗi `403 Forbidden`.

---

### Câu 5: Cơ chế chống sao chép nội dung chữ và bảo vệ ảnh chương hoạt động thế nào?
**Trả lời:**
1. **Chế độ render ảnh watermark (`TextToImageService` + `SkiaSharp`):** Khi Admin bật tùy chọn *"Render chữ thành ảnh PNG chống copy"* cho chương Novel, Backend ngắt dòng văn bản và vẽ thành các trang ảnh PNG nền tối kèm watermark mờ và tên file chứa token ngẫu nhiên (`page_001_{randomHex}.png`), ngăn việc bôi đen copy text hoặc đoán đường dẫn ảnh.
2. **Chế độ văn bản thuần + Nghe Audio:** Đối với các chương tiểu thuyết không bật xuất PNG, người dùng vừa có thể tùy chỉnh Theme Sáng/Tối/Sepia, cỡ chữ, vừa sử dụng trình đọc Audio TTS.

---

### Câu 6: Hệ thống xử lý chống spam báo cáo bình luận vi phạm ra sao?
**Trả lời:**
- Tại `DiscussionsController.Report`: mỗi lượt báo cáo được đánh dấu trên `IMemoryCache` theo khóa `discussion-report:{discussionId}:{userId}` trong 24 giờ, nên một người dùng không thể bấm Report 5 lần liên tiếp để tự ẩn bình luận hợp lệ của người khác.
- Tại cổng Admin (`AdminReportedCommentsController.Approve`): khi Admin xác nhận bình luận hợp lệ, hệ thống đưa `Status` về `Visible`, đồng thời reset `ReportCount = 0` và `ReportReason = null` để tránh một báo cáo mới làm nhảy lại ngưỡng tự ẩn.

---

## PHẦN 3: NGHIỆP VỤ THANH TOÁN, VIP & HẸN GIỜ XUẤT BẢN

### Câu 7: Luồng thanh toán mua truyện lẻ (`StoryPurchase`) và gói VIP (`Subscription`) đảm bảo tính toàn vẹn dữ liệu thế nào?
**Trả lời:**
Trong `PaymentService`:
1. Mọi yêu cầu thanh toán đều tạo trước 1 bản ghi trong bảng `Transactions` với `Status = Pending`, lưu `TargetId` (`StoryId` hoặc `PlanId`), `Amount` lấy trực tiếp từ database (không tin số tiền client gửi) và mã `ProviderTransactionRef` duy nhất.
2. Ngoài môi trường Development, endpoint `POST /api/payments/callback` yêu cầu header `X-Payment-Callback-Secret` và đối chiếu theo thời gian hằng (`CryptographicOperations.FixedTimeEquals`) chống giả mạo callback.
3. Khi callback báo thành công (`HandleGatewayCallbackAsync`) hoặc Admin kích hoạt bù (`ForceActivateTransactionAsync` - PB28), giao dịch chuyển sang `Success` và mới tạo bản ghi quyền lợi trong `Purchases` (có unique index `(UserId, StoryId)`) hoặc cộng dồn ngày sử dụng vào `UserSubscriptions`.

---

### Câu 8: Khi người dùng đang có gói VIP hoặc đã mua truyện, nếu mua lại hoặc chưa đủ điều kiện thì xử lý thế nào?
**Trả lời:**
`PaymentService` chặn từ backend với thông báo tiếng Việt rõ ràng (`HTTP 400`):
- Truyện `Free`, truyện `Paid/Mixed` chưa có giá hợp lệ (`Price <= 0`), hoặc tài khoản `Admin` đều bị chặn tạo giao dịch thừa.
- Nếu đã mua truyện rồi hoặc đang có gói VIP còn hiệu lực (`EndAt > UtcNow`), hệ thống từ chối tạo giao dịch mua lẻ trùng lặp.
- Gói VIP mới khi mua thành công sẽ nối tiếp hạn từ `currentActive.EndAt` hiện tại (gia hạn nối đuôi, không làm mất ngày còn lại của người dùng).

---

### Câu 9: Cơ chế hẹn giờ đăng chương (`PublishAt`) xử lý múi giờ và thông báo người theo dõi ra sao?
**Trả lời:**
1. PostgreSQL `timestamp with time zone` qua Npgsql yêu cầu `DateTimeKind.Utc`. Mọi điểm lưu `PublishAt` (`StoryService.AddChapterAsync`, `UpdateChapterAsync`, `AdminSchedulesController.Reschedule`) đều qua `ChapterPublicationHelper.NormalizeUtc` để tránh lỗi 500 khi nhận timestamp `Local`/`Unspecified`.
2. Chương hẹn giờ tương lai (`PublishAt > UtcNow`) bị ẩn khỏi danh sách chương công khai, bị ẩn khỏi bộ đếm tổng số chương / chương mới nhất trên Trang chủ và Hồ sơ (`ProfileController`, `StoryService.SearchAsync`), và **không gửi thông báo sớm** cho follower.
3. Chỉ khi chương tới giờ phát hành hoặc Admin bấm **Đăng ngay** / **Hủy hẹn giờ để xuất bản**, hệ thống mới cập nhật `Story.UpdatedAt` và gọi `ChapterPublicationHelper.NotifyFollowersAsync` (kèm kiểm tra trùng `LinkUrl` để không gửi thông báo lặp).

---

## PHẦN 4: AUDIO TEXT-TO-SPEECH (TTS), CACHING & HIỆU NĂNG

### Câu 10: Tính năng Nghe Truyện Audio Tiếng Việt hoạt động như thế nào và xử lý ra sao khi offline?
**Trả lời:**
1. `AudioReaderPlayer.tsx` tách nội dung văn bản thành các câu hợp lý (`< 180` ký tự, bỏ qua dòng chỉ có dấu phân cách).
2. Ở chế độ mặc định (`Google Engine`), player gọi `GET /api/tts?text=...`. Backend `TtsController` đứng làm proxy gọi Google Translate TTS tiếng Việt (`tl=vi`) để tránh trình duyệt bị chặn CORS/Referer, đồng thời cache mảng byte MP3 trên `IMemoryCache` để các đoạn đọc lại hoặc nhiều người cùng nghe không gọi lại mạng ngoài.
3. Nếu trình duyệt không có mạng hoặc proxy lỗi, player tự động Fallback sang **Web Speech API** (`window.speechSynthesis`). Trên chương truyện tranh (`Type = 1`) hoặc chương ảnh PNG chống copy, giao diện tự động ẩn nút nghe Audio.

---

### Câu 11: Vai trò của `IMemoryCache` và container `redis:7` trong dự án hiện tại là gì?
**Trả lời:**
*(Trả lời trung thực theo mã nguồn thực tế)*:
- Hiện tại, ứng dụng single-instance của nhóm dùng **`IMemoryCache` tích hợp sẵn của ASP.NET Core** (đã kích hoạt `AddMemoryCache()` trong `Program.cs`) để cache audio TTS tại `TtsController` và chống spam báo cáo tại `DiscussionsController`, giúp hệ thống gọn nhẹ, không phụ thuộc thêm service ngoài khi demo local.
- Trong [`docker-compose.yml`](./docker-compose.yml), nhóm cũng đã khai báo sẵn container **`redis:7`** (cổng `6379`) để khi hệ thống nâng cấp lên nhiều node API (Load Balancing) chỉ cần chuyển `IDistributedCache` sang StackExchange.Redis là dùng chung cache toàn cụm.

---

### Câu 12: Tại sao nhóm dùng TanStack Query ở Frontend thay vì `useEffect` + `useState` thuần?
**Trả lời:**
- Tự động cache kết quả API theo `queryKey` (ví dụ `["stories"]`, `["storyDetail", id]`, `["adminSchedules"]`), tránh gọi lại mạng thừa khi chuyển trang.
- Khi Admin cập nhật truyện, duyệt báo cáo hay kích hoạt giao dịch, chỉ cần `queryClient.invalidateQueries` để giao diện đồng bộ tức thì mà không phải tự quản lý nhiều biến state thủ công.

---

### Câu 13: Trình đọc truyện tranh Webtoon được tối ưu thế nào khi chương có nhiều trang ảnh?
**Trả lời:**
1. Ảnh trang truyện dùng `loading="lazy"` của trình duyệt nên chỉ tải các ảnh gần vùng cuộn màn hình.
2. Ảnh được phân phối từ CDN (ví dụ MangaDex CDN) hoặc URL ngoài, giảm tải băng thông trực tiếp cho Backend `.NET`.

---

## PHẦN 5: CRAWLER DỮ LIỆU, DOCKER & MỞ RỘNG (DEVOPS & SCALABILITY)

### Câu 14: Hãy giải thích luồng hoạt động của script cào truyện tranh (`tools/crawl_manga.js`)?
**Trả lời:**
1. Tìm kiếm bộ truyện trên MangaDex API v5 (lọc bỏ bản Doujinshi).
2. Lấy Metadata, URL ảnh bìa và danh sách chương tiếng Việt (`translatedLanguage[]=vi`).
3. Với mỗi chương (tối đa 5 chương mẫu), gọi `/at-home/server/{chapId}` để lấy hash + danh sách file ảnh, ghép thành các URL CDN ngăn cách bởi `\n`.
4. Với cờ `--import`, script sinh câu lệnh SQL chuẩn schema PostgreSQL (`Stories` với `Type = 1`, `StoryGenres`, `Chapters`) và nạp trực tiếp qua `docker exec ... psql`.

---

### Câu 15: Dự án dùng Docker Compose như thế nào?
**Trả lời:**
Root [`docker-compose.yml`](./docker-compose.yml) định nghĩa sẵn hai service hạ tầng:
- `postgres`: image `postgres:16` (cổng `5432`, DB `storyreader`, user `storynest`, volume `pgdata` bền vững).
- `redis`: image `redis:7` (cổng `6379`, phục vụ định hướng Distributed Cache).
Chỉ với `docker compose up -d`, bất kỳ máy nào cũng dựng xong môi trường DB đồng nhất mà không cần cài PostgreSQL thủ công.

---

### Câu 16: Nếu hệ thống có lượng truy cập lớn, nhóm sẽ nâng cấp tiếp thế nào?
**Trả lời:**
1. **API Layer (Stateless):** Do sử dụng JWT Stateless, có thể chạy nhiều instance `StoryReader.Api` phía sau Nginx/Reverse Proxy và chuyển `IMemoryCache` sang container **Redis 7** (`IDistributedCache`) để đồng bộ cache TTS và rate-limit/report dedupe giữa các instance.
2. **Database:** Dùng PostgreSQL Primary + Read Replicas cho các truy vấn đọc (`GET /api/stories`, `GET /api/chapters`).
3. **Media & CDN:** Đưa toàn bộ ảnh bìa và ảnh PNG chương từ `wwwroot/uploads` lên Object Storage (S3 / Cloudflare R2) kèm CDN.

---

## PHẦN 6: TÌNH HUỐNG THỰC TẾ ĐÃ GẶP & KHẮC PHỤC KHI LÀM ĐỒ ÁN

### Câu 17: Trong quá trình kiểm thử thực tế, nhóm đã phát hiện và sửa những lỗi đáng chú ý nào?
**Trả lời:**
1. **Lỗi nút "Khóa tài khoản" ở trang Báo cáo vi phạm (`/admin/reports`) trả về 404:** Frontend truyền `comment.userId` trong khi endpoint `POST /api/admin/reported-comments/{id}/restrict-user` nhận `Discussion.Id`. Nhóm đã sửa Frontend truyền đúng `comment.id` và invalidate thêm cache danh sách users.
2. **Lỗi Npgsql `DateTimeKind` & gửi thông báo sớm cho chương hẹn giờ:** Chuẩn hóa toàn bộ `PublishAt` về UTC bằng `ChapterPublicationHelper.NormalizeUtc`, hoãn gửi thông báo follower tới đúng thời điểm chương được công bố (`PublishNow` / `CancelSchedule`) và lọc bỏ chương tương lai khỏi bộ đếm chương công khai.
3. **Nút Nghe Audio xuất hiện trên chương ảnh PNG:** Chương Novel bật render ảnh PNG chỉ chứa URL ảnh (`/uploads/chapters/...`) trong `Content`, dẫn đến nếu bật Audio sẽ đọc nhầm URL. Nhóm đã bổ sung checkbox tùy chọn render PNG (mặc định tắt với Novel mới để ưu tiên Text + Audio) và ẩn nút/phím tắt Audio đối với mọi chương hiển thị bằng ảnh (`hasImages`).
4. **Lỗi chồng lấn UI cụm nút nổi & độ tương phản Light Theme:** Tinh chỉnh vị trí cụm `ScrollToTop`, linh vật `Jiji` và `AudioReaderPlayer` theo sự kiện DOM để không đè lên nhau trên mọi kích thước màn hình; chuyển các class chữ/badge mờ `*-400` / `slate-300` trên nền thẻ trắng Admin sang hệ màu tương phản cao `*-700` / `slate-600`.
