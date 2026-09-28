# Tiến độ đồ án StoryReader

Cập nhật: 28/09/2026

## Tổng quan

| Hạng mục | Trạng thái |
|---|---|
| Backend API | Xong phần lõi, đã test qua Swagger |
| Web (React) | Chạy được, còn lỗi build và nhiều chỗ đang mock |
| Mobile (Android) | Chưa bắt đầu |
| GitHub | Đã push, 1 repo chung (backend + web) |

## Đã xong

### Backend
- [x] Đăng ký / đăng nhập (Identity + JWT), role Admin / Member
- [x] Seed sẵn tài khoản Admin và 3 gói subscription
- [x] Truyện và chương: tạo, tìm kiếm, chi tiết, chương có hẹn giờ đăng (`PublishAt`)
- [x] Phân quyền đọc: free / paid / mixed, số chương đầu miễn phí
- [x] Mua truyện lẻ và mua gói tháng, callback tự cấp quyền, chống thu phí trùng
- [x] Lưu tiến độ đọc + tăng lượt xem khi đọc chương
- [x] Thảo luận theo chương, Admin ẩn bình luận
- [x] Quản lý thành viên (danh sách, khóa/mở khóa)
- [x] Thống kê: tổng quan, doanh thu theo ngày, top truyện
- [x] Docker compose cho Postgres + Redis

### Web
- [x] Khung project Vite + React + TS + Tailwind v3, gọi API bằng axios + React Query
- [x] Đăng nhập / đăng ký, lưu token (Zustand persist), ẩn hiện menu Admin theo role
- [x] Trang chủ (tìm kiếm, lọc, bảng xếp hạng), chi tiết truyện, đọc chương (đổi theme, cỡ chữ, xử lý 403)
- [x] Trang Admin: tạo truyện, thêm chương
- [x] Giao diện Header / Footer / Profile / Pricing (do Antigravity code thêm)

## Đang vướng (nên sửa trước)

- [ ] **`npm run build` đang fail**, 3 lỗi nhỏ:
  - `src/api/users.ts` dòng 2 -> `import type { StoryListItem } from "./stories";`
  - `src/pages/HomePage.tsx` dòng 8 -> xóa biến `isTop3` không dùng
  - `src/pages/PricingPage.tsx` dòng 2 -> xóa `import { Link }` không dùng
- [ ] `ProfilePage.tsx`: `useQuery` đang gọi sau lệnh `return <Navigate>` (vi phạm rules of hooks). Đưa `useQuery` lên trước và thêm `enabled: !!accessToken`
- [ ] Sau login tên hiển thị đang là email (backend `AuthResultDto` chưa trả `displayName`)
- [ ] `api/client.ts` gặp 401 chỉ logout, chưa chuyển về `/login`

## Web: chức năng còn mock, cần nối API thật

- [ ] `PricingPage`: đang là dữ liệu bịa (19k/49k, gói "Xu"), nút chỉ `alert`. Đổi sang `GET /api/subscriptions/plans` + `POST /api/payments/subscription/{planId}`
- [ ] `ProfilePage` tab "Đã mua": dùng `GET /api/subscriptions/me/purchases`. Tab "Lịch sử đọc" và "Bookmark" đang lấy đại từ `/stories`, cần backend thêm endpoint
- [ ] `StoryDetailPage`: phần Đánh giá & Bình luận đang là comment cứng. Nối `/api/chapters/{id}/discussions` hoặc bỏ mục này
- [ ] Sửa tên hiển thị ở Profile mới chỉ `alert`, backend chưa có API
- [ ] Đọc chương: thêm nút Chương trước / Chương sau; khi 403 và đã đăng nhập thì dẫn về trang truyện để mua thay vì `/login`
- [ ] Trang thống kê + quản lý thành viên cho Admin (backend đã có API)
- [ ] Footer còn nhiều link trỏ về `/`; Home chưa phân trang
- [ ] Đưa base URL vào `import.meta.env.VITE_API_URL` thay vì hardcode `https://localhost:7244`

## Backend: việc còn lại

- [ ] Trả `displayName` và `email` trong `AuthResultDto`
- [ ] Endpoint lịch sử đọc (`ReadingProgress` đã có bảng), bookmark/follow truyện (`StoryFollow` đã có bảng)
- [ ] Endpoint đổi tên hiển thị
- [ ] Trả lỗi 400/401 gọn thay vì để exception thành 500 (login sai mật khẩu hiện ném `InvalidOperationException`)
- [ ] Test luồng mua gói tháng (subscription) như đã test mua truyện lẻ
- [ ] Tích hợp VNPay/Momo thật + xác thực chữ ký callback (hiện callback là `[AllowAnonymous]`, ai gọi cũng được)
- [ ] Job đối soát: Transaction Success nhưng chưa có Purchase/UserSubscription
- [ ] Tài liệu API tổng hợp để nộp kèm

## Mobile Android (chưa làm)

- [ ] Tạo project Kotlin + Jetpack Compose
- [ ] Retrofit + OkHttp trỏ vào cùng backend (emulator dùng `https://10.0.2.2:7244`, cần xử lý cert dev)
- [ ] Đăng nhập, lưu token bằng DataStore
- [ ] Danh sách truyện, chi tiết, đọc chương
- [ ] Room cache chương đã tải + lưu tiến độ đọc offline
- [ ] Mua truyện / gói tháng

## Tạm hoãn

- Manga / truyện tranh (Chapter chứa danh sách ảnh)
- Redis cache (đã có container, chưa dùng trong code)

## Thứ tự làm đề xuất

1. Sửa 3 lỗi build + hook Profile (10 phút, tự sửa được)
2. Backend trả `displayName`, bọc lỗi login thành 400/401
3. Nối Pricing + tab "Đã mua" vào API thật
4. Endpoint lịch sử đọc + bookmark, nối vào Profile
5. Bắt đầu Mobile
6. Trang thống kê Admin, tài liệu API, dọn lỗi nhỏ
