# KIẾN TRÚC CÔNG NGHỆ & SƠ ĐỒ LUỒNG XỬ LÝ — STORYREADER

Tài liệu mô tả kiến trúc kỹ thuật thực tế, lược đồ cơ sở dữ liệu PostgreSQL và các sơ đồ luồng hoạt động chính của hệ thống **StoryReader**.

---

## 1. TỔNG QUAN STACK CÔNG NGHỆ THỰC TẾ

| Tầng (Layer) | Công nghệ thực tế trong mã nguồn | Ghi chú triển khai |
| :--- | :--- | :--- |
| **Backend API** | **.NET 8.0** (ASP.NET Core Web API) | Modular Controllers + Service Layer (`StoryService`, `ChapterAccessService`, `PaymentService`, `AuthService`, `TextToImageService`, `StatsService`) |
| **ORM & Identity** | **EF Core 8.0.10** + **ASP.NET Core Identity** | `AppDbContext : IdentityDbContext<AppUser, IdentityRole<Guid>, Guid>` kết nối PostgreSQL qua `Npgsql.EntityFrameworkCore.PostgreSQL 8.0.10` |
| **Xác thực & Phân quyền** | **JWT Bearer Token** (`8.0.10`) | Claim `NameIdentifier`, `Email`, `displayName`, `Role` (`Admin` / `Member`); kiểm tra khóa tài khoản `IsRestricted` |
| **Bảo vệ & Đa phương tiện** | **SkiaSharp 2.88.8** + **TTS Proxy (`/api/tts`)** | `TextToImageService` render văn bản sang PNG watermark; `TtsController` proxy tiếng Việt kèm `IMemoryCache` |
| **Web Frontend** | **React 19** + **TypeScript 6** + **Vite 8** + **Tailwind CSS 3.4** | Quản lý server state bằng **TanStack Query**, auth state bằng **Zustand** (`authStore`), form bằng **React Hook Form** |
| **Mobile App** | **Flutter** (Dart `^3.12.2`) | State management **Riverpod**, điều hướng **GoRouter**, HTTP client **Dio**, lưu token bằng `flutter_secure_storage` |
| **Database & Cache** | **PostgreSQL 16** + `IMemoryCache` (+ `redis:7` sẵn sàng trong Docker) | PostgreSQL 16 lưu 20 bảng nghiệp vụ & Identity; runtime API đang dùng `IMemoryCache`, container `redis:7` cấu hình sẵn trong `docker-compose.yml` cho bước scale |

---

## 2. KIẾN TRÚC TỔNG THỂ (SYSTEM ARCHITECTURE)

```mermaid
flowchart TB
    subgraph Clients["Tầng Client (Người dùng & Quản trị viên)"]
        Web["Web App — React 19 + Vite 8\n(http://localhost:5173)"]
        Mobile["Mobile App — Flutter\n(Riverpod + Dio)"]
    end

    subgraph Api["Backend — StoryReader.Api (.NET 8 — Cổng 5066)"]
        Auth["Auth & Profile\n(/api/auth, /api/profile)"]
        Story["Stories, Chapters & Genres\n(/api/stories, /api/chapters)"]
        Billing["Payments & Subscriptions\n(/api/payments, /api/subscriptions)"]
        Tts["Audio TTS Proxy\n(/api/tts)"]
        Admin["Admin Portal API\n(/api/admin/*)"]
        MemCache[("In-Memory Cache\n(IMemoryCache)\nAudio TTS & Report Dedupe")]
        ImgGen["SkiaSharp Renderer\n(wwwroot/uploads/chapters)"]
    end

    subgraph Data["Hạ tầng Dữ liệu (Docker Compose)"]
        DB[("PostgreSQL 16\n20 bảng Domain + Identity\n(Cổng 5432)")]
        Redis[("Redis 7 Container\n(Cổng 6379 — Sẵn sàng scale)")]
    end

    External["Dịch vụ bên ngoài\n- Google Translate TTS (Audio)\n- MangaDex API v5 (Tools Crawler)\n- Cổng thanh toán VNPay / Momo"]

    Web -->|HTTPS / REST + JWT| Api
    Mobile -->|HTTPS / REST + JWT| Api
    Api --> DB
    Tts <--> MemCache
    Story --> ImgGen
    Tts -.-> External
    Billing -.-> External
    Api -.-> Redis
```

---

## 3. LƯỢC ĐỒ CƠ SỞ DỮ LIỆU THỰC TẾ (POSTGRESQL — 20 BẢNG)

Database `storyreader` sử dụng mô hình **Identity kết hợp Domain Entities** (xác nhận trực tiếp từ `AppDbContext.cs` và PostgreSQL `\dt`):
- **7 bảng Identity chuẩn:** `AspNetUsers` (mở rộng `DisplayName`, `IsRestricted`, `CreatedAt`), `AspNetRoles`, `AspNetUserRoles`, `AspNetUserClaims`, `AspNetRoleClaims`, `AspNetUserLogins`, `AspNetUserTokens`.
- **12 bảng Nghiệp vụ + `__EFMigrationsHistory`:**

```mermaid
erDiagram
    AspNetUsers ||--o{ StoryFollows : follows
    AspNetUsers ||--o{ ReadingProgresses : tracks
    AspNetUsers ||--o{ Discussions : posts
    AspNetUsers ||--o{ Notifications : receives
    AspNetUsers ||--o{ Transactions : initiates
    AspNetUsers ||--o{ Purchases : owns
    AspNetUsers ||--o{ UserSubscriptions : subscribes

    Stories ||--o{ Chapters : contains
    Stories ||--o{ StoryGenres : tagged
    Genres ||--o{ StoryGenres : classifies
    Stories ||--o{ StoryFollows : watched_by
    Stories ||--o{ ReadingProgresses : progress_in
    Stories ||--o{ Purchases : purchased_in

    Chapters ||--o{ Discussions : discussed_on
    SubscriptionPlans ||--o{ UserSubscriptions : plan_for
    Transactions ||--o| Purchases : grants
    Transactions ||--o| UserSubscriptions : activates
```

---

## 4. CÁC LUỒNG XỬ LÝ CỐT LÕI (CORE FLOWS)

### 4.1. Luồng Xác thực & Phân quyền Đọc Truyện Trả Phí (`ChapterAccessService`)

Khi người dùng gửi yêu cầu `GET /api/chapters/{chapterId}` kèm hoặc không kèm JWT Bearer Token:

```mermaid
sequenceDiagram
    autonumber
    actor Reader as Độc giả / Admin
    participant Web as React 19 UI
    participant API as ChaptersController
    participant Access as ChapterAccessService
    participant DB as PostgreSQL

    Reader->>Web: Bấm mở chương truyện (/chapters/{id})
    Web->>API: GET /api/chapters/{id} (Bearer JWT nếu đã đăng nhập)
    API->>Access: CanReadChapterAsync(userId, chapterId)
    Access->>DB: Kiểm tra Chapter + Story + User.IsRestricted
    alt Tài khoản bị khóa (IsRestricted = true)
        Access-->>API: Trả về false
        API-->>Web: HTTP 403 Forbidden (Yêu cầu nâng cấp / Tài khoản bị khóa)
    else Chương chưa tới lịch PublishAt và không phải Admin
        Access-->>API: Trả về false
        API-->>Web: HTTP 403 Forbidden
    else Truyện Free hoặc ChapterNumber <= FreeChapterCount
        Access-->>API: Trả về true (Đọc miễn phí)
    else Tài khoản là Admin / Đã mua truyện (Purchases) / Còn hạn VIP (UserSubscriptions.EndAt > NOW)
        Access-->>API: Trả về true (Full Access)
    else Chưa có quyền đọc
        Access-->>API: Trả về false
        API-->>Web: HTTP 403 Forbidden
        Web->>Reader: Hiển thị thẻ khóa chương & CTA Mua lẻ / Nâng cấp VIP
    end
```

---

### 4.2. Luồng Thanh toán Mua Truyện Lẻ / Gói VIP & Kích Hoạt Bù (PB28)

Hệ thống tách bạch rõ **Giao dịch khởi tạo (`Transactions`)** và **Quyền lợi được cấp (`Purchases` / `UserSubscriptions`)** để tránh lỗi mất quyền lợi khi callback chậm:

```mermaid
flowchart TD
    Start([User bấm Mua truyện lẻ hoặc Đăng ký gói VIP]) --> CheckAuth{Đã đăng nhập &\nchưa bị khóa?}
    CheckAuth -- Không --> AuthErr[Trả HTTP 401 / 400]
    CheckAuth -- Có --> Validate{Hợp lệ chính sách?\n- Story Paid/Mixed & Price > 0\n- Chưa sở hữu / Chưa có VIP}
    Validate -- Sai --> BadReq[Trả HTTP 400 kèm lý do chi tiết]
    Validate -- Đúng --> CreateTx[Tạo Transaction Status = Pending\nvà ProviderTransactionRef]
    CreateTx --> Redirect[Trả về transactionId & paymentUrl]
    Redirect --> Gateway[Người dùng thanh toán tại Cổng VNPay / Momo\nhoặc Mô phỏng Dev]
    Gateway --> Callback[POST /api/payments/callback\nXác thực X-Payment-Callback-Secret ngoài Dev]
    Callback -- Thành công --> Grant[Cập nhật Transaction = Success\nTạo Purchase hoặc UserSubscription]
    Callback -- Thất bại / Treo --> PendingFail{Cập nhật Failed\nhoặc Pending kéo dài?}
    PendingFail -- Treo Pending --> AdminPB28[Admin vào /admin/transactions\nBấm Kích hoạt bù PB28]
    AdminPB28 --> Grant
    Grant --> Done([Độc giả đọc Full chương / Nhận huy hiệu VIP])
```

---

### 4.3. Luồng Nghe Truyện Audio Tiếng Việt (`AudioReaderPlayer` + `/api/tts`)

```mermaid
sequenceDiagram
    autonumber
    actor User as Độc giả (Truyện chữ thuần)
    participant Reader as ChapterReadPage & AudioReaderPlayer
    participant TTS as TtsController (/api/tts)
    participant Cache as IMemoryCache
    participant Google as Google Translate TTS

    User->>Reader: Bấm "Nghe Audio" hoặc phím A
    Reader->>Reader: Tách văn bản thành từng câu (< 180 ký tự)
    loop Từng câu trong chương
        Reader->>TTS: GET /api/tts?text=... (Google Engine)
        TTS->>Cache: Kiểm tra cache byte[] theo nội dung câu
        alt Cache Hit
            Cache-->>TTS: Trả về audio/mpeg tức thì
        else Cache Miss
            TTS->>Google: Gọi TTS voice vi (timeout & Referer server-side)
            Google-->>TTS: Trả về MP3 stream
            TTS->>Cache: Lưu cache giới hạn dung lượng
        end
        TTS-->>Reader: Trả audio/mpeg -> Phát nối tiếp & lưu tiến độ câu (localStorage)
    end
    Note over Reader: Nếu mất mạng / lỗi Proxy, tự động Fallback sang Web Speech API
```

---

### 4.4. Luồng Hiển thị Truyện Tranh Webtoon (Manga / Comic)

```mermaid
sequenceDiagram
    autonumber
    actor Reader as Độc giả
    participant ReadPage as ChapterReadPage (Type = 1)
    participant API as .NET 8 Backend API
    participant CDN as Nguồn ảnh / MangaDex CDN

    Reader->>ReadPage: Truy cập trang đọc chương truyện tranh (/chapters/{chapterId})
    ReadPage->>API: GET /api/chapters/{chapterId}
    API->>API: Tách chuỗi Content theo ký tự xuống dòng (\n) thành mảng ImageUrls
    API-->>ReadPage: HTTP 200 { id, title, storyType: 1, imageUrls: ["https://...", ...] }
    ReadPage->>ReadPage: Kích hoạt chế độ Webtoon Infinite Scroll (ẩn Audio Reader)
    loop Từng trang truyện trong imageUrls
        ReadPage->>CDN: Request ảnh trang truyện (loading="lazy")
        CDN-->>ReadPage: Trả về file ảnh (JPG/PNG)
        ReadPage->>ReadPage: Render ảnh căn giữa kèm số trang (Trang X / Tổng)
    end
```

---

## 5. FLOW HOẠT ĐỘNG CỦA SCRIPT CÀO TRUYỆN TỰ ĐỘNG (`tools/crawl_manga.js`)

### 5.1. Tại sao dùng MangaDex API v5 thay cho OTruyen?
- **Vấn đề của nguồn cũ (OTruyen):** Tên miền `otruyenapi.com` trả lỗi `HTTP 404` / unbound domain.
- **Ưu điểm của MangaDex API v5:** Dữ liệu chuẩn quốc tế, có bản dịch tiếng Việt (`translatedLanguage[]=vi`), ảnh chất lượng cao không watermark và cho phép nhúng ảnh từ trình duyệt.

### 5.2. Sơ đồ quy trình Cào và Nạp tự động

```mermaid
flowchart TD
    Start(["Chạy: node tools/crawl_manga.js 'Tên Truyện' --import"]) --> Step1[1. Tìm kiếm Manga trên MangaDex API v5]
    Step1 --> CheckManga{Tìm thấy manga?}
    CheckManga -- Không --> Err1[Báo lỗi: Không tìm thấy truyện] --> End([Kết thúc])
    CheckManga -- Có --> FilterCanon[Lọc lấy bản chính thức\nBỏ qua Doujinshi]

    FilterCanon --> Step2[2. Lấy Metadata & Ảnh bìa Cover]
    Step2 --> Step3[3. Lấy danh sách Chapter tiếng Việt]
    Step3 --> CheckChaps{Có chapter tiếng Việt?}
    CheckChaps -- Không --> Err2[Báo lỗi: Chưa có bản dịch tiếng Việt] --> End
    CheckChaps -- Có --> Step4[4. Lấy tối đa 5 chương đầu tiên]

    Step4 --> LoopChap[Duyệt từng Chapter]
    LoopChap --> GetServer[Gọi MangaDex At-Home Server\nLấy hash & danh sách file ảnh]
    GetServer --> BuildUrls[Ghép mảng URL hoàn chỉnh\nbase_url/data/hash/file]
    BuildUrls --> NextChap{Còn chapter?}
    NextChap -- Có --> LoopChap
    NextChap -- Không --> CheckImport{Có cờ --import?}

    CheckImport -- Không --> SaveJson[Xuất file JSON cục bộ] --> End
    CheckImport -- Có --> GenSql[5. Tạo SQL PostgreSQL:\n- INSERT Stories Type=1\n- INSERT StoryGenres\n- INSERT Chapters Content=URLs]
    GenSql --> ExecDocker["6. Chạy psql qua Docker:\ndocker exec -i ... psql -U storynest -d storyreader"]
    ExecDocker --> Success([7. Hoàn tất & in URL đọc truyện])
```

---

## 6. FLOW THÊM TRUYỆN & HẸN GIỜ XUẤT BẢN QUA ADMIN

Bên cạnh script tự động, Admin quản lý trực tiếp nội dung và lịch phát hành tại `/admin/stories` và `/admin/schedules`:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Quản trị viên
    participant Web as AdminStoriesPage & AdminSchedulesPage
    participant API as .NET 8 Backend API
    participant DB as PostgreSQL

    Admin->>Web: Vào /admin/stories -> Thêm truyện & Thêm chương
    Note over Web: Admin chọn xuất bản ngay hoặc đặt PublishAt tương lai\n(Mặc định chương Novel lưu văn bản thuần; có tùy chọn xuất PNG chống copy)
    Web->>API: POST /api/stories/{storyId}/chapters
    API->>API: Chuẩn hóa PublishAt sang UTC (ChapterPublicationHelper.NormalizeUtc)
    API->>DB: INSERT INTO "Chapters"
    alt PublishAt null hoặc <= UtcNow
        API->>DB: Cập nhật Story.UpdatedAt & gửi Notifications cho StoryFollows
    else PublishAt > UtcNow (Hẹn giờ tương lai)
        API->>DB: Chỉ lưu Chapter, KHÔNG gửi thông báo sớm & ẩn khỏi danh sách công khai
        Note over Web,DB: Khi tới giờ PublishAt (ScheduledChapterPublisherWorker quét mỗi phút)\nhoặc Admin bấm "Đăng ngay" tại /admin/schedules,\nAPI cập nhật Story.UpdatedAt và gửi Notifications idempotent cho follower
    end
```

---

## 7. ĐIỂM NỔI BẬT VỀ BẢO MẬT & TỐI ƯU HÓA

1. **Bảo mật truy cập & Thanh toán:**
   - Kiểm tra `ChapterAccessService` ở tầng server cho cả nội dung chương văn bản lẫn danh sách ảnh; khóa bình luận (`IsRestricted`) chặn đồng thời đăng bình luận và đọc truyện trả phí.
   - Endpoint `POST /api/payments/callback` yêu cầu chữ ký `X-Payment-Callback-Secret` so sánh theo thời gian hằng (`CryptographicOperations.FixedTimeEquals`) ngoài môi trường Development.
   - Chống spam báo cáo bình luận: lưu cache `IMemoryCache` theo cặp `(DiscussionId, UserId)` để mỗi người chỉ báo cáo 1 lần trên cùng bình luận; Admin duyệt hợp lệ sẽ reset `ReportCount = 0`.
2. **Bảo vệ bản quyền nội dung (Tùy chọn theo chương):**
   - Chế độ render chữ thành ảnh PNG watermark (`TextToImageService` với `SkiaSharp`) gắn token ngẫu nhiên trên tên file (`/uploads/chapters/{chapterId}/page_001_{token}.png`) chống đoán URL tĩnh.
   - Chế độ đọc web vô hiệu hóa bôi đen/chuột phải ở vùng ảnh truyện tranh & vùng ảnh chống copy.
3. **Tối ưu hiệu năng & Trải nghiệm đọc:**
   - `AdminUsersController` sử dụng join SQL đơn (`UserRoles` join `Roles`) thay vòng lặp `GetRolesAsync` tránh truy vấn N+1.
   - Ảnh truyện tranh tải dần (`loading="lazy"`), Audio TTS được cache byte stream trên server bằng `IMemoryCache`.
   - Giao diện Admin sử dụng Light Theme nhất quán (`#F4F6F9` / `#FFFFFF` / `slate-700..900`) kết hợp điều hướng nhanh giữa Quản lý truyện, Lịch đăng, Báo cáo vi phạm và Giao dịch.
