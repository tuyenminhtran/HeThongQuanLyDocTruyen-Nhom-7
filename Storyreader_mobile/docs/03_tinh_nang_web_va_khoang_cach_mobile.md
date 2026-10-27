# 03. TÍNH NĂNG WEB VÀ PHÂN TÍCH KHOẢNG CÁCH TRÊN MOBILE

Tài liệu này đối chiếu toàn bộ các tính năng, màn hình và luồng trải nghiệm người dùng của `storyreader-web` (đã hoàn thiện và hoạt động chuẩn) với phiên bản hiện tại của `Storyreader_mobile`.

---

## 1. Bảng Đối Chiếu Tính Năng & Màn Hình (Web vs Mobile)

| Màn hình / Tính năng trên Web | Đã có trên Web? | Trạng thái trên Mobile hiện tại | Khoảng cách & Điểm lệch cần khắc phục |
| :--- | :--- | :--- | :--- |
| **1. Trang chủ (HomePage)** | | | |
| - Banner truyện nổi bật (Featured Hero) | Có (Carousel/Hero banner nổi bật) | Sơ sài | Mobile chỉ có 1 danh sách dọc cơ bản, chưa có banner carousel nổi bật |
| - Phân loại theo Tab / Thể loại (Genre chips) | Có (Scroll ngang chip thể loại, lọc theo genreId) | Có nhưng tĩnh | Mobile lọc client-side trên 1 list cố định, chưa truyền `genreId` lên API |
| - Lọc truyện Chữ vs Truyện Tranh (Novel / Comic) | Có (Chuyển đổi Novel/Comic) | **Chưa có** | Mobile model chưa parse trường `type` (0: Novel, 1: Comic) |
| - Danh sách "Mới cập nhật", "Xem nhiều" | Có | Chưa tách bạch | Mobile hiển thị gộp chung 1 danh sách |
| - Tìm kiếm tức thì có Debounce | Có (Search input + debounce) | Có | Đã có debounce 400ms trên mobile |
| - Phân trang / Tải thêm (Infinite scroll) | Có (Load more theo batch) | Cắt cứng 12 item | Cần chuyển sang infinite scroll mượt mà |
| **2. Chi tiết truyện (StoryDetailPage)** | | | |
| - Thông tin bìa, tác giả, trạng thái, thể loại | Có | Có | Có đầy đủ thông tin cơ bản |
| - Nhãn loại truyện (Truyện chữ / Truyện tranh) | Có badge riêng | **Chưa có** | Thiếu badge Novel / Comic |
| - Phân chia chương theo phần/tập cha-con (`PartName` / Folder) | Có (Cây thư mục cha-con, expand/collapse) | **HOÀN TOÀN THIẾU** | Mobile chỉ hiển thị 1 danh sách phẳng (flat list), không nhóm theo part/tập |
| - Tìm kiếm chương trong danh sách | Có ô search chương | Có | Đã có ô tìm kiếm số chương |
| - Nút Đảo chiều sắp xếp chương (Cũ nhất / Mới nhất) | Có | Có | Đã có nút sort ascending/descending |
| - Đánh dấu chương VIP / Yêu cầu mua | Có (icon khóa / badge Trả phí) | Có | Có hiển thị icon khóa |
| - Mua truyện trọn bộ (Pay for story) | Có dialog mở liên kết thanh toán | Có | Đã tích hợp gọi API initiate purchase |
| - Theo dõi / Bỏ theo dõi truyện | Có (Toggle follow + cập nhật tức thì) | Chưa hoàn chỉnh | Cần đồng bộ trực tiếp với `GET/POST /api/stories/{id}/follow` |
| **3. Trình đọc chương (ChapterReadPage)** | | | |
| - Đọc truyện chữ (Novel Reader) | Tùy chỉnh font, cỡ chữ, theme (Light/Sepia/Dark) | Có | Đã có tùy chỉnh font size và theme |
| - Đọc truyện tranh (Comic/Webtoon Reader) | Cuộn dọc không ngắt quãng (Webtoon mode), lazy-load ảnh, zoom | **Sơ sài** | Mobile dùng `Image.network` trong Column (dễ tràn RAM), chưa có zoom, chưa có lazy-load/cache tối ưu |
| - Chuyển chương Trước / Sau (Next/Prev) | Có (Tự động nhận biết chương theo thứ tự) | Có | Có thanh điều hướng cuối trang |
| - Tự động lưu tiến độ đọc (Reading Progress) | Có (Backend tự ghi nhận khi gọi API có token) | Tự động qua API | Chưa lưu vị trí cuộn (scroll position) cục bộ khi đọc dở |
| - Bình luận chương (Discussions) | Có (Đọc bình luận, gửi bình luận mới) | **HOÀN TOÀN THIẾU** | Mobile chưa tích hợp API bình luận chương |
| **4. Thư viện & Cá nhân (Library / Following / History)** | | | |
| - Màn hình Truyện đang theo dõi (Following / Bookmarks) | Trang riêng `/following` có tab | Ghép vào Profile | Cần tạo màn hình Thư viện/Tủ sách chuyên biệt dễ truy cập |
| - Màn hình Lịch sử đọc (Reading History) | Trang riêng `/history` | Ghép vào Profile | Cần hỗ trợ xóa lịch sử hoặc tiếp tục đọc nhanh chương gần nhất |
| - Màn hình Truyện đã mua (Purchased Stories) | Tab trong trang Profile | Ghép vào Profile | Đã có API và model hiển thị |
| **5. Nâng cấp VIP & Thanh toán (PricingPage)** | | | |
| - Bảng so sánh các gói Subscription (1, 3, 12 tháng) | Có (Hiển thị quyền lợi, giá, thời hạn) | Có | Đã có màn hình chọn gói VIP |
| - Khởi tạo thanh toán & điều hướng cổng thanh toán | Mở URL cổng thanh toán | Có | Đã có qua `url_launcher` |
| **6. Quản trị hệ thống (Admin Portal)** | | | |
| - Dashboard thống kê doanh thu, người dùng, lượt xem | Có | Có | Đã có màn hình thống kê |
| - Quản lý truyện (Thêm, sửa, xóa, upload ảnh bìa) | Có | Có phần lớn | Cần bổ sung trường loại truyện (Novel/Comic) và upload ảnh |
| - Quản lý chương (Thêm, sửa, xóa, phân part/tập) | Có | Chưa có `partName` | Cần bổ sung ô nhập `partName` và cờ `renderAsImages` |
| - Quản lý thể loại (CRUD) | Có | Có | Đã hoạt động tốt |
| - Quản lý thành viên (Khóa / mở khóa tài khoản) | Có | Có | Đã hoạt động tốt |
| - Quản lý giao dịch (Duyệt giao dịch lỗi, hủy) | Có trên web | Chưa có trên mobile | Mobile chưa có trang quản lý giao dịch |

---

## 2. Các điểm thiếu sót và sai lệch nghiêm trọng nhất cần khắc phục

### Sai lệch 1: Cấu trúc Phần/Tập cha - con (`PartName` / Folder)
- **Thực tế Web & API**: Cả Web lẫn API đều coi cấu trúc phần/tập cha - con dạng thư mục là tính năng trọng tâm của đồ án (đặc biệt đối với truyện dài tập hoặc truyện tranh nhiều hồi/season). Mỗi chương có trường `partName` (ví dụ: "Phần 1: Khởi đầu", "Tập 2: Đại hội tỷ võ"). Trên giao diện người dùng, danh sách chương được nhóm thành từng Folder cha có thể thu gọn / mở rộng.
- **Hiện trạng Mobile**: Mobile bỏ qua hoàn toàn trường `partName`, parse danh sách chương thành một mảng phẳng (flat array), làm mất hoàn toàn tính năng cấu trúc phần/tập cha-con.

### Sai lệch 2: Hỗ trợ Truyện Tranh (Comic / Manga / Webtoon)
- **Thực tế Web & API**: Hệ thống hỗ trợ 2 loại truyện độc lập: Truyện Chữ (`Novel = 0`) và Truyện Tranh (`Comic = 1`). Đối với truyện tranh, `ChapterContentDto` trả về `imageUrls` (danh sách link ảnh). Trình đọc webtoon yêu cầu cuộn dọc mượt mà, bộ nhớ đệm ảnh và không bị giật lag khi có hàng trăm ảnh độ phân giải cao.
- **Hiện trạng Mobile**:
  - DTO `StoryListItem` và `StoryDetail` trên mobile chưa có trường `type`.
  - Màn hình đọc truyện chỉ render danh sách ảnh bằng thẻ `Image.network` đơn giản, không có cơ chế tái sử dụng ô nhớ (virtualized list / ListView), không có zoom đa điểm (Pinch-to-zoom / InteractiveViewer), không có tính năng tải lại khi rớt mạng từng ảnh.

### Sai lệch 3: Bình luận chương (Discussions)
- **Thực tế Web & API**: API cung cấp đầy đủ `GET /api/chapters/{id}/discussions` và `POST /api/chapters/{id}/discussions` cho phép độc giả trao đổi, bình luận sôi nổi ở cuối mỗi chương.
- **Hiện trạng Mobile**: Màn hình đọc chương hoàn toàn không có khu vực bình luận.

### Sai lệch 4: Cơ chế Ngoại tuyến (Offline Reading & Sync)
- **Thực tế**: Người dùng di động thường xuyên đọc truyện trong điều kiện mạng yếu hoặc mất kết nối (trên máy bay, xe bus, tàu điện ngầm).
- **Hiện trạng Mobile**: Hiện tại chỉ phụ thuộc 100% vào gọi mạng trực tiếp, không có cơ chế lưu trữ cục bộ các chương đã đọc, không lưu hàng đợi đồng bộ tiến độ đọc khi online trở lại.

### Sai lệch 5: Trải nghiệm UI/UX và Ngôn ngữ bản địa hóa
- Các thông báo lỗi hiện tại còn mang tính kỹ thuật ("DioException", "Connection timeout"), nhiều nhãn tiếng Anh hoặc hard-code rải rác.
- Cần chuẩn hóa toàn bộ văn bản UI tiếng Việt, tách biệt vào từ điển/localization nhất quán.
- Thiết kế hệ thống màu sắc (Design System) nhất quán với hai chế độ Sáng / Tối, vùng chạm ≥ 48dp theo chuẩn di động.
