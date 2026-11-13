# 03. ĐỐI CHIẾU TÍNH NĂNG WEB VÀ MOBILE (ĐÃ ĐỒNG BỘ HOÀN CHỈNH)

Tài liệu đối chiếu các tính năng giữa `storyreader-web` và `Storyreader_mobile` kết nối tới `StoryReader.Api`. Toàn bộ các tính năng cốt lõi trên Web đã được triển khai đồng bộ trên nhánh `Darling`.

---

## 1. Bảng Đối Chiếu Tính Năng & Màn Hình (Web vs Mobile)

| Màn hình / Tính năng trên Web | Web | Mobile | Ghi chú triển khai đồng bộ |
| :--- | :---: | :---: | :--- |
| **1. Trang chủ & Điều hướng (Home, Rankings, AppHeader)** | | | |
| - Giao diện Light Theme TruyenQQ + Header 2 tầng + Chuông thông báo | Có | **Có** | Chuẩn hóa bảng màu `AppColors`, sửa lỗi CORS ảnh Pinterest trên Web qua `images.weserv.nl` |
| - Phân loại Truyện chữ (`Novel`) & Truyện tranh (`Comic`), lọc thể loại & tìm kiếm debounce | Có | **Có** | Model & UI hiển thị đầy đủ badge `Novel`/`Comic`, sắp xếp & lọc API |
| **2. Chi tiết truyện & Thanh toán Trả phí / VIP (`StoryDetail`, `Pricing`)** | | | |
| - Cây thư mục chương theo Tập/Phần (`PartName`), tìm kiếm, đảo chiều sắp xếp | Có | **Có** | Gom nhóm `groupChaptersByPart` thu gọn/mở rộng |
| - Đồng bộ quyền sở hữu (`HasPurchased`, `HasActiveVip`, `HasFullAccess`) & quyền Admin | Có | **Có** | Ẩn nút mua và hiển thị huy hiệu `Đã mua truyện` / `Thành viên VIP` / `Quyền Admin` |
| - Hiển thị giá truyện động theo từng bộ & thông báo lỗi chi tiết từ Backend | Có | **Có** | Dùng `formatVnd(story.price)` và `apiErrorMessage`, bỏ giá cố định cũ |
| - Mua truyện lẻ & Đăng ký gói VIP qua mô phỏng cổng thanh toán | Có | **Có** | Hỗ trợ xác nhận giao dịch & kích hoạt tức thì |
| **3. Trình đọc chương, Audio TTS & Bình luận (`ChapterRead`)** | | | |
| - Đọc Novel (Dark/Sepia/Paper Light, Lora/Inter/Noto Serif, cỡ chữ, giãn dòng) | Có | **Có** | Lưu và đồng bộ tiến độ đọc cục bộ (`ReadingCacheService`) |
| - Đọc Comic (Cuộn dọc Webtoon, Pinch-to-zoom 1.0x–3.5x, tải lại từng ảnh lỗi) | Có | **Có** | Danh sách ảnh phân trang mượt mà bằng `ListView.builder` |
| - **Nghe truyện Audio Tiếng Việt (`GET /api/tts`)** | Có | **Có** | `AudioReaderBar` + `tts_chunker` (<= 180 ký tự/câu), tốc độ `0.8x–2.0x`, lưu vị trí câu & tự ẩn với Comic/ảnh PNG |
| - Hiển thị thông báo lỗi 403 chi tiết từ Backend khi chương bị khóa | Có | **Có** | Xử lý `AppException` mã 403 từ `ChapterRepository` để hiện đúng thông điệp máy chủ |
| - **Bình luận chương & Báo cáo vi phạm (`Report`)** | Có | **Có** | Chọn lý do nhanh hoặc nhập tự do gọi `POST .../discussions/{id}/report` |
| **4. Tủ sách & Hồ sơ Cá nhân (`Library`, `Profile`)** | | | |
| - Tủ sách 3 tab (Đang theo dõi, Lịch sử đọc, Đã mua), Hồ sơ & Đổi mật khẩu | Có | **Có** | Tích hợp luồng đồng bộ API thời gian thực |
| **5. Cổng Quản trị Admin (`/admin/*`)** | | | |
| - Dashboard thống kê doanh thu, người dùng, giao dịch & hoạt động | Có | **Có** | Tab `Dashboard` (`/admin`) |
| - Quản lý Truyện & Chương (Thêm/Sửa/Xóa, `StoryType`, `PartName`, `PublishAt`, `renderAsImages`) | Có | **Có** | Cho phép chỉnh sửa/xóa truyện & chương, hẹn lịch phát hành và bật/tắt xuất bản PNG |
| - **Quản lý Lịch đăng chương (`/admin/schedules`)** | Có | **Có** | Tab `Lịch Đăng`: lọc trạng thái, **Đăng ngay**, **Đổi lịch**, **Hủy lịch** |
| - **Kiểm duyệt Bình luận bị báo cáo (`/admin/reports`)** | Có | **Có** | Tab `Báo Cáo BL`: **Duyệt**, **Ẩn**, **Xóa**, **Khóa/Mở khóa TK** |
| - Quản lý Thể loại, Người dùng & Giao dịch (PB28 Force Activate) | Có | **Có** | Các tab `Quản lý Thể Loại`, `Người Dùng`, `Giao Dịch` |

---

## 2. Ghi chú xác minh kỹ thuật
- Các khoảng cách trước đây (`PartName`, `Comic Reader`, `Discussions` + `Report`, `Offline Cache`, `Audio TTS Tiếng Việt`, `StoryType`, `Lịch Đăng`, `Kiểm Duyệt Bình Luận`, quyền truy cập truyện trả phí/VIP) đều đã được hoàn thiện và kiểm thử tự động trong `Storyreader_mobile/test/`.
