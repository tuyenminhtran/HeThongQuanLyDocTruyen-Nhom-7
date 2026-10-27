# BÁO CÁO TIẾN ĐỘ ĐỒ ÁN - HỆ THỐNG QUẢN LÝ ĐỌC TRUYỆN (STORYREADER)
**Nhóm thực hiện:** Nhóm 7  
**Ngày cập nhật:** 27/10/2026  
**Trạng thái chung:** **HOÀN THÀNH 100% (116/116 Story Points | 35/35 User Stories)**  
**Nhánh Git đang làm việc:** `Darling`  

---

## 1. THÔNG TIN DỰ ÁN & ĐỘI NGŨ THỰC HIỆN

### 1.1. Thông tin chung
- **Tên đề tài:** Hệ Thống Quản Lý Đọc Truyện (StoryReader)
- **Mục tiêu:** Xây dựng nền tảng đọc truyện trực tuyến hoàn chỉnh với 1 hệ thống Backend RESTful API (.NET 8) phục vụ đồng thời cho Web Application (React 19 + TypeScript) và Mobile Application (Flutter).
- **Hệ thống hỗ trợ 3 chính sách truy cập:** Đọc miễn phí (Free), Gói VIP đăng ký theo tháng (Monthly Subscription) và Mua quyền đọc riêng từng truyện (Pay-per-story). Tích hợp cổng thanh toán trực tuyến, theo dõi tiến độ đọc, thông báo chương mới, cộng đồng thảo luận và hệ thống quản trị - thống kê doanh thu toàn diện.

### 1.2. Danh sách thành viên & Phân công vai trò
| STT | Họ và Tên | Tài khoản | Vai trò chính |
| :---: | :--- | :--- | :--- |
| 1 | **Trần Minh Tuyên** | `tuyenminhtran` | Nhóm trưởng, Thiết kế Kiến trúc Backend REST API (.NET 8), Module Thanh toán & Xử lý quyền truy cập, Admin Management & Fullstack |
| 2 | **Lê Hoàng** | `lehoanglh0533` | Quản lý Tài liệu & Sprint Planning, Module Truyện & Chương, Quản trị Thành viên & Kiểm duyệt Thảo luận |
| 3 | **Hồ Minh Tuyền** | `minhtuyen006` | Module Xác thực (Auth), Trang chủ, Trình đọc chương (Reader UI), Tiến độ đọc & Thảo luận |
| 4 | **Trần Mỹ Duyên** | `duyentranmy` | Phân tích Sơ đồ PERT, Gợi ý truyện, Lịch sử giao dịch & Thanh toán, Theo dõi truyện yêu thích & Thống kê |

---

## 2. BẢNG TỔNG KẾT TIẾN ĐỘ THEO SPRINT

| Sprint | Giai đoạn (Thời gian) | Mục tiêu chính | Điểm kế hoạch | Điểm thực tế | Tỷ lệ hoàn thành |
| :---: | :---: | :--- | :---: | :---: | :---: |
| **Sprint 0** | Tuần 3 - Tuần 4 | Khởi tạo dự án, Hạ tầng API, DB PostgreSQL, Xác thực Identity + JWT | 11 | 11 | **100%** |
| **Sprint 1** | Tuần 5 | Duyệt truyện, Trang chủ, Bộ lọc danh mục, Tìm kiếm đa năng & Chi tiết truyện | 14 | 14 | **100%** |
| **Sprint 2** | Tuần 6 | Quản lý Truyện/Chương (Admin), Luồng đọc chương, Kiểm tra quyền truy cập | 18 | 18 | **100%** |
| **Sprint 3** | Tuần 7 - Tuần 8 | Gói đọc theo tháng & Mua lẻ truyện, Tích hợp VNPay & Sandbox Callback | 23 | 23 | **100%** |
| **Sprint 4** | Tuần 9 | Xử lý giao dịch lỗi, Lịch sử thanh toán, Tiến độ đọc, Theo dõi & Thông báo | 20 | 20 | **100%** |
| **Sprint 5** | Tuần 10 | Bình luận & Thảo luận theo chương, Báo cáo vi phạm, Quản trị thành viên | 13 | 13 | **100%** |
| **Sprint 6** | Tuần 11 | Cập nhật trạng thái truyện, Thống kê lượt đọc, Doanh thu & Tổng kết dự án | 17 | 17 | **100%** |
| **TỔNG CỘNG** | **11 Tuần** | **Toàn bộ 35 User Stories trong Product Backlog** | **116** | **116** | **100%** |

---

## 3. CHI TIẾT KẾT QUẢ ĐẠT ĐƯỢC THEO TỪNG THÀNH PHẦN

### 3.1. Backend RESTful API (.NET 8 & C#)
- **Kiến trúc & Công nghệ:** ASP.NET Core 8 Web API, Entity Framework Core 8, Npgsql, PostgreSQL 16 (Docker), Redis 7.
- **Hệ thống Xác thực & Phân quyền:**
  - ASP.NET Core Identity kết hợp JWT (Access Token & Refresh Token).
  - Phân quyền theo Claims: `Admin`, `Member`, `Guest`.
  - API hồ sơ người dùng: Xem thông tin, đổi mật khẩu, cập nhật `displayName` và ảnh đại diện.
- **Quy tắc Kiểm tra Quyền đọc Tổng hợp (`ChapterAccessService`):**
  - Thứ tự ưu tiên: Truyện hoàn toàn Miễn phí (`AccessPolicy.Free`) -> Chương nằm trong phạm vi chương đọc thử (`FreeChapterCount`) -> Người dùng đã mua lẻ bộ truyện đó (`Purchase`) -> Người dùng đang có Gói VIP theo tháng còn hiệu lực (`UserSubscription`).
  - Đảm bảo quyền lợi: Khi gói tháng hết hạn, người dùng vẫn giữ nguyên vẹn quyền đọc các truyện đã mua lẻ trước đó.
  - Chống thu phí trùng: Không cho phép mua lẻ truyện nếu người dùng đang sở hữu gói VIP đang hoạt động hoặc đã sở hữu truyện.
- **Cổng thanh toán & Giao dịch:**
  - Tích hợp cổng thanh toán VNPay và cổng Giả lập Sandbox (Simulator).
  - Callback xử lý idempotent an toàn, tự động kích hoạt quyền đọc ngay khi giao dịch thành công.
  - Hỗ trợ Admin đối soát và xử lý thủ công các giao dịch bị lỗi mạng/treo quyền (`AdminTransactionsController`).
- **Thống kê & Quản trị:**
  - Thống kê doanh thu theo mốc thời gian (ngày, tháng), doanh thu theo gói và theo truyện lẻ.
  - Thống kê Top truyện đọc nhiều nhất, số lượng thành viên, tỷ lệ chuyển đổi gói VIP.
  - Quản lý khóa / mở khóa tài khoản thành viên (`restricted`).
  - Kiểm duyệt nội dung thảo luận, ẩn bình luận vi phạm hoặc spam.
- **Cơ sở dữ liệu & Nội dung thực tế:**
  - Đã nạp (seed) **30 bộ tiểu thuyết hoàn chỉnh** (Tuyển tập Studio Ghibli: *Totoro, Vùng đất linh hồn, Lâu đài bay của Howl, Laputa, Kiki, Mononoke, Gió nổi, Pom Poko, Lời thì thầm của trái tim,...*, Văn học kinh điển và Light Novel).
  - Gần **200 chương truyện chi tiết** với nội dung phong phú.
  - **31 thể loại phân loại chuẩn hóa**: Thêm các thể loại đặc sắc như *Anime, Light Novel, Isekai, Shounen, Shoujo, Seinen, Giả Tưởng, Phép Thuật, Gia Đình, Thể Thao, Mecha*; chuẩn hóa tên thể loại *Ngôn Tình* thành *Tình Cảm*.
  - Cấu hình phân trang mặc định lên tới 100 truyện để đáp ứng hiển thị đầy đủ thư viện truyện.

### 3.2. Web Application (React 19 + TypeScript + Vite + Tailwind CSS v3)
- **Trạng thái:** Toàn bộ dữ liệu Mock đã được thay thế 100% bằng API Backend thật. Lệnh `npm run build` chạy thành công tuyệt đối (0 lỗi, 0 cảnh báo type).
- **Các trang & Tính năng đã hoàn thành:**
  1. **Trang chủ (`HomePage.tsx`):**
     - Banner carousel truyện nổi bật.
     - Thanh tìm kiếm tức thì (Debounced Search) theo tên truyện, tác giả, thể loại.
     - Bảng xếp hạng Top truyện đọc nhiều nhất.
     - Bộ lọc thể loại dạng thanh cuộn ngang mượt mà, hỗ trợ hiển thị đồng thời toàn bộ 30 bộ truyện.
  2. **Trang chi tiết truyện (`StoryDetailPage.tsx`):**
     - Hiển thị ảnh bìa sắc nét, tác giả, trạng thái phát hành, tags thể loại, số lượt xem, số chương.
     - **Danh sách chương dạng Accordion theo Phần/Hồi (Parts):** Tự động gom nhóm chương trực quan (Phần 1: Khởi đầu, Phần 2: Biến cố,...).
     - Đánh dấu huy hiệu *Miễn phí* / *VIP* cho từng chương.
     - Nút Mua truyện lẻ (hiển thị giá bán) kèm Modal thanh toán tiện lợi.
     - Nút Theo dõi / Hủy theo dõi truyện yêu thích.
     - Khu vực thảo luận và đánh giá của cộng đồng độc giả.
  3. **Trang đọc chương (`ChapterReadPage.tsx`):**
     - Trình đọc tùy biến cao cấp: 3 chế độ màu nền (*Dark, Light, Sepia*).
     - Tùy chỉnh kích thước chữ (14px - 32px), phông chữ đọc, khoảng cách dòng.
     - Thanh công cụ điều hướng: Nút Chương trước / Chương sau, thanh tiến trình cuộn đọc.
     - Tự động lưu tiến độ đọc vào tài khoản ngay khi chuyển trang hoặc cuộn.
     - Khu vực bình luận theo chương: Viết bình luận mới, trả lời (reply) thảo luận, báo cáo vi phạm.
  4. **Trang Gói cước VIP (`PricingPage.tsx`):**
     - Bảng so sánh quyền lợi các gói: 1 tháng (49.000đ), 3 tháng (129.000đ), 12 tháng (399.000đ).
     - Kết nối API tạo thanh toán VNPay / Sandbox và chuyển hướng giao dịch an toàn.
  5. **Trang Thông tin cá nhân (`ProfilePage.tsx`):**
     - Quản lý thông tin tài khoản, cập nhật tên hiển thị (`displayName`), đổi mật khẩu.
     - 4 Tab chức năng: *Lịch sử đọc*, *Truyện đang theo dõi*, *Truyện đã mua*, *Lịch sử giao dịch*.
  6. **Cụm Trang Quản trị Admin:**
     - `AdminDashboardPage`: Biểu đồ doanh thu, thống kê lượt đọc, thành viên và giao dịch.
     - `AdminStoriesPage`: Thêm mới, chỉnh sửa truyện, bật/tắt chính sách Free/Paid/Mixed, cấu hình giá bán.
     - `AdminChaptersPage`: Thêm chương, tải nội dung, cài đặt số chương đọc thử miễn phí, lên lịch phát hành (`PublishAt`).
     - `AdminTransactionsPage`: Quản lý danh sách giao dịch, tra cứu và kích hoạt bù quyền cho giao dịch gặp sự cố mạng.
     - `AdminUsersPage`: Danh sách thành viên, phân quyền, khóa hoặc mở khóa tài khoản vi phạm.
  7. **Trải nghiệm người dùng:**
     - Header hiển thị Huy hiệu VIP, Chuông thông báo chương mới với dropdown real-time.
     - Tích hợp `ScrollToTop`: Tự động cuộn mượt lên đầu trang khi chuyển hướng route.

### 3.3. Mobile Application (Flutter - `Storyreader_mobile`)
- **Trạng thái:** Đã hoàn thành 100% đúng theo kế hoạch ban đầu.
- Đồng bộ giao diện Material 3 Dark Theme nhất quán với Web.
- Kết nối thông suốt với REST API Backend qua Dio client.
- Đầy đủ tính năng: Đăng nhập/Đăng ký, Duyệt truyện, Đọc chương, Đổi theme đọc (Dark/Light/Sepia), Mua gói VIP & Mua truyện lẻ, Quản lý tài khoản cá nhân.

---

## 4. BẢNG CHI TIẾT 35 USER STORIES (PRODUCT BACKLOG & SPRINT BACKLOG)

Dưới đây là bảng theo dõi chi tiết toàn bộ 35 User Stories trong hệ thống đã được nghiệm thu hoàn thành:

| Mã PB | Tên User Story | Điểm | Dev phụ trách | Sprint | Trạng thái | Ghi chú kỹ thuật |
| :---: | :--- | :---: | :--- | :---: | :---: | :--- |
| **DOC1** | Rà soát yêu cầu & hoàn thiện Backlog | 1 | Lê Hoàng + Trần Minh Tuyên | Sprint 0 | Hoàn thành [x] | Chuẩn hóa bảng Product & Sprint Backlog |
| **DOC2** | Thiết kế Sơ đồ PERT & Critical Path | 1 | Trần Mỹ Duyên | Sprint 0 | Hoàn thành [x] | Phân tích 9 bước phụ thuộc kỹ thuật |
| **DOC3** | Điền Kế hoạch Sprint Planning | 1 | Lê Hoàng | Sprint 0 | Hoàn thành [x] | Mục tiêu 7 Sprint & Quản trị rủi ro |
| **INFRA** | Dựng hạ tầng REST API C# & DB Docker | 1 | Trần Minh Tuyên | Sprint 0 | Hoàn thành [x] | Cấu trúc Solution, EF Core 8, JWT, Postgres |
| **PB06** | Đăng ký tài khoản (Registration) | 2 | Hồ Minh Tuyền | Sprint 0 | Hoàn thành [x] | API Register + Validate Form Web |
| **PB07** | Đăng nhập & Phân quyền (Login & JWT) | 2 | Trần Minh Tuyên | Sprint 0 | Hoàn thành [x] | Phân quyền Claims Admin / Member / Guest |
| **PB23** | Đăng xuất tài khoản (Logout) | 1 | Lê Hoàng | Sprint 0 | Hoàn thành [x] | Xóa token, clear Zustand store an toàn |
| **PB08** | Quản lý Hồ sơ cá nhân (Manage Profile) | 2 | Trần Mỹ Duyên + Hồ Minh Tuyền | Sprint 0 | Hoàn thành [x] | Đổi tên hiển thị, đổi mật khẩu |
| **PB01** | Xem Trang chủ (View HomePage) | 2 | Hồ Minh Tuyền + Trần Mỹ Duyên | Sprint 1 | Hoàn thành [x] | Hero banners, Ranking, Thư viện truyện |
| **PB02** | Xem Danh sách truyện (Story List) | 3 | Trần Minh Tuyên + Lê Hoàng | Sprint 1 | Hoàn thành [x] | Lưới truyện, hiển thị đầy đủ 30 tác phẩm |
| **PB03** | Tìm kiếm truyện (Search Story) | 3 | Lê Hoàng | Sprint 1 | Hoàn thành [x] | Tìm kiếm theo tên, tác giả, thể loại đa năng |
| **PB05** | Danh sách gợi ý (Suggested Lists) | 3 | Trần Mỹ Duyên | Sprint 1 | Hoàn thành [x] | Gợi ý truyện mới, truyện hot đọc nhiều |
| **PB04** | Xem Chi tiết truyện (Story Details) | 3 | Trần Minh Tuyên | Sprint 1 | Hoàn thành [x] | Bìa, mô tả, Accordion chương theo Phần |
| **PB24** | Quản lý Truyện Admin (Manage Story) | 5 | Lê Hoàng | Sprint 2 | Hoàn thành [x] | CRUD truyện, cấu hình chính sách Free/Paid |
| **PB25** | Quản lý Chương Admin (Manage Chapter) | 3 | Trần Minh Tuyên | Sprint 2 | Hoàn thành [x] | Soạn thảo chương, hẹn giờ phát hành |
| **PB09** | Đọc chương (Read Chapter) | 5 | Trần Minh Tuyên + Hồ Minh Tuyền | Sprint 2 | Hoàn thành [x] | Reader UI 3 theme, kiểm tra quyền 403 chuẩn |
| **PB10** | Xử lý quyền truy cập tổng hợp | 5 | Trần Minh Tuyên | Sprint 2 | Hoàn thành [x] | Ưu tiên quyền, giữ truyện mua, chống thu phí trùng |
| **PB26** | Quản lý Gói đọc theo tháng Admin | 5 | Lê Hoàng | Sprint 3 | Hoàn thành [x] | CRUD gói dịch vụ: 1 tháng, 3 tháng, 1 năm |
| **PB27** | Quản lý Giá bán truyện Admin | 3 | Trần Mỹ Duyên | Sprint 3 | Hoàn thành [x] | Cấu hình giá bán lẻ từng bộ truyện |
| **PB15** | Đăng ký Gói đọc theo tháng | 5 | Trần Minh Tuyên + Hồ Minh Tuyền | Sprint 3 | Hoàn thành [x] | Thanh toán VNPay / Sandbox gói tháng |
| **PB16** | Gia hạn Gói đọc theo tháng | 3 | Hồ Minh Tuyền | Sprint 3 | Hoàn thành [x] | Tự động cộng dồn ngày hết hạn nối tiếp |
| **PB17** | Xem trạng thái Gói đang dùng | 2 | Lê Hoàng | Sprint 3 | Hoàn thành [x] | Huy hiệu VIP, ngày hết hạn tại Profile |
| **PB18** | Mua lẻ từng bộ truyện (Purchase Story)| 5 | Trần Minh Tuyên | Sprint 3 | Hoàn thành [x] | Thanh toán một lần, sở hữu vĩnh viễn |
| **PB28** | Xử lý Giao dịch lỗi (Admin Transactions)| 5 | Trần Minh Tuyên | Sprint 4 | Hoàn thành [x] | Tra cứu lỗi callback, bù quyền tự động |
| **PB19** | Xem Lịch sử thanh toán cá nhân | 5 | Trần Mỹ Duyên | Sprint 4 | Hoàn thành [x] | Bảng giao dịch, hóa đơn, trạng thái thành công |
| **PB11** | Ghi nhận & Xem Tiến độ đọc | 3 | Hồ Minh Tuyền | Sprint 4 | Hoàn thành [x] | Tự động lưu vị trí đọc, đọc tiếp 1 chạm |
| **PB12** | Danh sách Truyện đang đọc | 2 | Lê Hoàng | Sprint 4 | Hoàn thành [x] | Lưu vết lịch sử đọc trong Profile |
| **PB13** | Theo dõi truyện yêu thích (Favorites) | 2 | Trần Mỹ Duyên | Sprint 4 | Hoàn thành [x] | Danh sách bookmark, bỏ theo dõi dễ dàng |
| **PB14** | Nhận thông báo chương mới | 3 | Trần Minh Tuyên | Sprint 4 | Hoàn thành [x] | Chuông thông báo Header, tự động gửi tin |
| **PB20** | Đăng bình luận theo chương | 2 | Hồ Minh Tuyền | Sprint 5 | Hoàn thành [x] | Bình luận ngữ cảnh theo từng chương |
| **PB21** | Xem & Trả lời thảo luận | 3 | Trần Mỹ Duyên | Sprint 5 | Hoàn thành [x] | Thảo luận đa tầng (Reply), avatar người dùng |
| **PB22** | Báo cáo nội dung vi phạm / spam | 2 | Lê Hoàng | Sprint 5 | Hoàn thành [x] | Gắn cờ báo cáo vi phạm tiêu chuẩn cộng đồng |
| **PB30** | Kiểm duyệt thảo luận Admin | 3 | Lê Hoàng + Trần Minh Tuyên | Sprint 5 | Hoàn thành [x] | Admin ẩn bình luận tiêu cực / vi phạm |
| **PB31** | Quản lý Tài khoản thành viên Admin | 3 | Trần Minh Tuyên | Sprint 5 | Hoàn thành [x] | Danh sách người dùng, Khóa / Mở khóa tài khoản |
| **PB29** | Cập nhật Trạng thái truyện Admin | 3 | Lê Hoàng | Sprint 6 | Hoàn thành [x] | Đang tiến hành (Ongoing) / Hoàn thành |
| **PB32** | Thống kê Lượt đọc chi tiết | 3 | Hồ Minh Tuyền | Sprint 6 | Hoàn thành [x] | Tăng lượt xem tự động, thống kê theo truyện |
| **PB33** | Thống kê Hoạt động hệ thống Admin | 3 | Trần Mỹ Duyên | Sprint 6 | Hoàn thành [x] | Tổng số thành viên, số lượt mua, biểu đồ |
| **PB34** | Thống kê Doanh thu tài chính Admin | 5 | Trần Minh Tuyên | Sprint 6 | Hoàn thành [x] | Doanh thu theo gói VIP & doanh thu bán lẻ |
| **PB35** | Thống kê Nội dung nổi bật Admin | 3 | Trần Minh Tuyên + Lê Hoàng | Sprint 6 | Hoàn thành [x] | Top truyện được yêu thích, thể loại nổi bật |

---

## 5. HẠ TẦNG VẬN HÀNH & HƯỚNG DẪN KHỞI CHẠY HỆ THỐNG

### 5.1. Cấu hình Cổng Dịch vụ
- **PostgreSQL Database:** Cổng `5432` (Docker Container: `hethongquanlydoctruyen-nhom-7-postgres-1`)
- **Redis Cache:** Cổng `6379` (Docker Container: `hethongquanlydoctruyen-nhom-7-redis-1`)
- **Backend ASP.NET Core API:** Cổng `http://localhost:5066` (hoặc `https://localhost:7244`)
  - Swagger UI: `http://localhost:5066/swagger`
- **Web Frontend (React Vite):** Cổng `http://localhost:5173`

### 5.2. Tài khoản Quản trị Mặc định (Seed Data)
- **Tài khoản Quản trị viên (Admin):**
  - Email: `admin@storynest.local`
  - Mật khẩu: `Admin@123456`
- **Tài khoản Thành viên thử nghiệm (Member):**
  - Email: `member@storynest.local`
  - Mật khẩu: `Member@123456`

---

## 6. KẾT LUẬN & ĐÁNH GIÁ TỔNG KẾT
1. **Tiến độ:** Dự án đã hoàn thành **100% kế hoạch đề ra** theo đúng tài liệu Scrum Sprint Planning và Product Backlog.
2. **Chất lượng:** Toàn bộ API hoạt động ổn định, kiểm soát quyền truy cập chặt chẽ, luồng thanh toán chính xác không trùng phí. Giao diện Web hiện đại, mượt mà, phản hồi nhanh và thân thiện với người dùng.
3. **Sẵn sàng nghiệm thu:** Hệ thống đã sẵn sàng cho buổi báo cáo và nghiệm thu đồ án cuối kỳ.
