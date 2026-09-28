---
name: storyreader-project
description: Ngữ cảnh và quy ước của đồ án StoryReader (hệ thống quản lý đọc truyện chữ) gồm backend ASP.NET Core, web React, mobile Android. Dùng khi tiếp tục code, sửa lỗi hoặc thêm tính năng cho dự án này.
---

# StoryReader - ngữ cảnh dự án

Đồ án cuối môn: hệ thống đọc truyện chữ. **Một backend REST API dùng chung cho Web và Mobile.**
Admin quản lý truyện/chương/thành viên/thống kê. Người đọc: tìm truyện, đọc chương, mua truyện hoặc gói tháng, thảo luận theo chương.

## Tech stack (đã chốt, không đổi)

| Phần | Công nghệ |
|---|---|
| Backend | ASP.NET Core Web API (.NET 8), EF Core 8, Identity + JWT |
| CSDL | PostgreSQL (Docker), Npgsql provider. Redis có trong compose nhưng chưa dùng |
| Web | React 19 + TypeScript + Vite, TailwindCSS **v3** (không dùng v4), React Query, Zustand, React Hook Form, React Router |
| Mobile | Android native: Kotlin, Jetpack Compose, Retrofit + OkHttp, Room, DataStore, Hilt (chưa bắt đầu) |

## Cấu trúc thư mục

```
D:\StoryNest\                      <- 1 repo GitHub chung
├── StoryReader.Api\               (backend)
│   ├── Controllers\  Services\ (+Interfaces)  Models\ (Entities, Dtos)  Data\ (AppDbContext, DataSeeder)
│   └── Program.cs  appsettings.json
├── storyreader-web\               (frontend)
│   └── src\ api\ store\ pages\ components\ utils\
└── docker-compose.yml             (postgres:16 + redis:7)
```

## Môi trường chạy local

- Postgres (docker): db `storyreader`, user `storynest`, pass `storynest123`, port 5432
- Backend: `https://localhost:7244` (Swagger: `/swagger`). Lần đầu cần mở URL này trong trình duyệt và chấp nhận cert dev
- Web: `http://localhost:5173`
- Tài khoản Admin tự seed: `admin@storynest.local` / `Admin@123456`
- 3 gói subscription tự seed: 1 tháng 49k, 3 tháng 129k, 12 tháng 399k

## Quy tắc nghiệp vụ cốt lõi

- `AccessPolicy`: 0 Free, 1 Paid, 2 Mixed. `ReleaseStatus`: 0 Ongoing, 1 Completed
- Quyền đọc chương (`ChapterAccessService`), kiểm tra theo thứ tự: truyện Free -> chương nằm trong `FreeChapterCount` -> đã có `Purchase` -> có `UserSubscription` còn hạn -> ngược lại 403
- Thanh toán: tạo `Transaction` (Pending, lưu `TargetId` = storyId hoặc planId) -> callback `success=true` mới tạo `Purchase`/`UserSubscription`. Callback idempotent. Gói mới gia hạn nối tiếp từ ngày hết hạn của gói đang active
- Không thu phí trùng: đã mua truyện hoặc đang có gói còn hạn thì không cho mua lẻ
- Cổng thanh toán (VNPay/Momo) hiện chỉ là URL sandbox giả lập

## API hiện có

```
POST /api/auth/register | /api/auth/login              -> { accessToken, expiresAt }
GET  /api/stories?keyword&genreId&page&pageSize
GET  /api/stories/{id}
POST /api/stories                     [Admin]
POST /api/stories/{id}/chapters       [Admin]
GET  /api/chapters/{id}               (kiểm tra quyền, tăng view, lưu ReadingProgress)
GET/POST /api/chapters/{chapterId}/discussions
PUT  /api/chapters/{chapterId}/discussions/{id}/hide   [Admin]
POST /api/payments/story/{storyId} | /api/payments/subscription/{planId}
POST /api/payments/callback?providerRef=&success=
GET  /api/subscriptions/plans | /me | /me/purchases
GET  /api/members  PUT /api/members/{id}/restrict?restricted=   [Admin]
GET  /api/stats/overview | /revenue?from&to | /top-stories?count   [Admin]
```

Chưa có endpoint: lịch sử đọc, bookmark/follow, đổi tên hiển thị, rating truyện.

## Quy ước code

- Backend: Controller mỏng, logic ở Service; DTO dùng `record`; Guid làm khóa chính
- JWT gắn role bằng `ClaimTypes.Role` (claim URI dài `http://schemas.microsoft.com/ws/2008/06/identity/claims/role`), web đọc role ở `utils/jwt.ts`
- Web: gọi API qua `src/api/*` (axios instance `client.ts` tự gắn Bearer), state đăng nhập ở `store/authStore.ts` (persist localStorage)
- Web theme tối ấm: token Tailwind `ink-bg/card/border/text/muted` và `gold` / `gold-dim`, font serif cho tiêu đề (Noto Serif), sans cho UI (Inter)
- Migration: sau khi sửa entity phải `Add-Migration <Tên>` rồi `Update-Database`, mở file migration kiểm tra `Up()` không rỗng

## Bẫy đã gặp (đừng lặp lại)

- Ghim package Microsoft.* và Npgsql về **8.0.x** (bản mới nhất nhắm .NET 10 sẽ lỗi NU1202)
- `Add-Migration` cần thêm package `Microsoft.EntityFrameworkCore.Tools`
- Query rồi sửa entity thì **không** dùng `AsNoTracking()` (từng làm ViewCount không lưu)
- Swagger cần `AddSecurityDefinition("Bearer")` mới hiện nút Authorize; nhập `Bearer <token>` đủ chữ Bearer
- Đổi role trong DB xong phải login lại để lấy token mới
- Tailwind v4 không còn `npx tailwindcss init`; dự án dùng v3 (`tailwindcss@3`)
- `verbatimModuleSyntax` bật: import type phải viết `import type { ... }`
- Windows `cd` sang ổ khác cần `cd /d D:\...`
- Copy code thủ công dễ dùng nhầm bản cũ của file (từng gặp với `Billing.cs`, `PaymentService.cs`, `Program.cs`): luôn kiểm tra lại nội dung file trong project

## Phạm vi tạm hoãn

- Manga/truyện tranh (cần chương chứa danh sách ảnh): để sau khi xong truyện chữ
- Tích hợp VNPay/Momo thật
