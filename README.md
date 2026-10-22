# Hệ Thống Quản Lý Đọc Truyện - StoryReader

Hệ thống quản lý và đọc truyện trực tuyến đa nền tảng (Web và Mobile), hỗ trợ đọc truyện chữ, truyện tranh (Comic/Manga), tích hợp cơ chế bảo vệ bản quyền chống sao chép, quản lý gói hội viên và giao dịch thanh toán.

---

## Công Nghệ Sử Dụng

- Backend: ASP.NET Core Web API (.NET 8), Entity Framework Core 8
- Cơ sở dữ liệu và bộ nhớ đệm: PostgreSQL 16, Redis
- Frontend Web: React 18, TypeScript, Vite, TailwindCSS, TanStack Query
- Mobile App: Flutter (Dart)
- Thư viện xử lý đồ họa: SkiaSharp (chuyển đổi văn bản thành hình ảnh chống sao chép)
- Xác thực và phân quyền: JSON Web Token (JWT) kết hợp ASP.NET Core Identity
- Ảo hóa môi trường: Docker Compose

---

## Các Tính Năng Chính

### 1. Dành Cho Độc Giả (Member / Guest)
- Duyệt và tìm kiếm: Tìm kiếm truyện theo từ khóa, lọc theo thể loại, phân loại truyện chữ hoặc truyện tranh.
- Trải nghiệm đọc truyện:
  - Chế độ đọc truyện chữ tùy chỉnh cỡ chữ, màu nền (Tối, Sáng, Sepia).
  - Chế độ đọc Webtoon cuộn dọc liền mạch cho truyện tranh và các chương bảo vệ bản quyền.
  - Chuyển chương nhanh bằng bàn phím hoặc thanh điều hướng cuối trang.
  - Tự động lưu tiến độ đọc theo từng chương.
- Tính năng tương tác:
  - Theo dõi truyện và nhận thông báo khi có chương mới phát hành.
  - Thảo luận, gửi bình luận theo từng chương truyện.
- Gói đọc và mua lẻ:
  - Đăng ký gói đọc hội viên theo thời hạn (1 tháng, 3 tháng, 12 tháng).
  - Mua lẻ truyện có phí.
  - Xem lịch sử giao dịch và trạng thái kích hoạt.

### 2. Dành Cho Quản Trị Viên (Admin)
- Quản lý nội dung truyện:
  - Thêm, sửa, xóa thông tin truyện, thể loại, ảnh bìa và tác giả.
  - Thêm và sửa chương cho truyện chữ và truyện tranh.
  - Chức năng chống sao chép: Tự động render văn bản thành tập hợp hình ảnh có watermark để độc giả không thể sao chép văn bản.
  - Thiết lập chính sách truy cập: Miễn phí, trả phí toàn bộ hoặc kết hợp số chương miễn phí đầu tiên.
- Quản lý kinh doanh và đối soát:
  - Quản lý danh mục gói hội viên.
  - Theo dõi lịch sử giao dịch thanh toán.
  - Kích hoạt thủ công các giao dịch hợp lệ nhưng chưa được xử lý tự động.
  - Đánh dấu thất bại cho các giao dịch không hợp lệ.
- Quản lý người dùng và kiểm duyệt:
  - Danh sách tài khoản thành viên.
  - Kiểm duyệt và ẩn các bình luận vi phạm tiêu chuẩn cộng đồng.
- Bảng điều khiển thống kê:
  - Tổng số truyện, chương, tài khoản người dùng và lượt xem toàn hệ thống.

---

## Cấu Trúc Thư Mục Dự Án

```text
HeThongQuanLyDocTruyen-Nhom-7/
├── StoryReader.Api/           # Mã nguồn Backend (ASP.NET Core Web API)
│   ├── Controllers/           # Các bộ điều khiển API
│   ├── Data/                  # DbContext, DataSeeder và Migrations
│   ├── Models/                # Entity và DTOs
│   ├── Services/              # Logic nghiệp vụ và xử lý hình ảnh SkiaSharp
│   └── wwwroot/               # Thư mục lưu trữ ảnh chương render tĩnh
├── storyreader-web/           # Mã nguồn Frontend Web (React + Vite)
│   ├── src/
│   │   ├── api/               # Các hàm gọi API backend
│   │   ├── components/        # Các thành phần giao diện dùng chung
│   │   ├── pages/             # Các trang người dùng và trang quản trị
│   │   └── store/             # Quản lý trạng thái đăng nhập (Zustand)
├── Storyreader_mobile/        # Mã nguồn Mobile App (Flutter)
├── db/                        # Script khởi tạo cơ sở dữ liệu
├── docker-compose.yml         # Cấu hình Docker cho PostgreSQL và Redis
└── README.md                  # Tài liệu hướng dẫn dự án
```

---

## Hướng Dẫn Khởi Chạy Hệ Thống

### 1. Yêu Cầu Môi Trường
- .NET 8 SDK
- Node.js (phiên bản 18 hoặc 20 LTS)
- Flutter SDK (cho ứng dụng di động)
- Docker và Docker Compose

### 2. Khởi Động Hạ Tầng Cơ Sở Dữ Liệu
Chạy PostgreSQL và Redis thông qua Docker Compose tại thư mục gốc của dự án:
```bash
docker-compose up -d
```
Thông số kết nối mặc định:
- Host: localhost
- Port: 5432
- Database: storyreader
- User: storynest
- Password: storynest123

### 3. Khởi Chạy Backend API
Chuyển vào thư mục backend và khởi chạy:
```bash
cd StoryReader.Api
dotnet restore
dotnet run
```
API sẽ khởi chạy tại địa chỉ:
- Swagger UI: http://localhost:5066/swagger
- API Base URL: http://localhost:5066/api

Cơ sở dữ liệu sẽ được tự động seed các thể loại, gói hội viên, tài khoản mẫu và truyện mẫu ngay trong lần khởi động đầu tiên.

### 4. Khởi Chạy Frontend Web
Chuyển vào thư mục web và chạy development server:
```bash
cd storyreader-web
npm install
npm run dev
```
Trang web sẽ hoạt động tại địa chỉ: http://localhost:5173

### 5. Khởi Chạy Frontend Mobile (Tùy chọn)
Chuyển vào thư mục mobile để chạy trên thiết bị hoặc trình giả lập:
```bash
cd Storyreader_mobile
flutter pub get
flutter run
```

---

## Tài Khoản Mặc Định

Hệ thống đã được tạo sẵn các tài khoản để kiểm thử:

1. Tài khoản Quản trị viên (Admin):
- Email: admin@storynest.local
- Mật khẩu: Admin@123456
- Quyền hạn: Toàn quyền quản trị hệ thống

2. Tài khoản Độc giả (Member):
- Email: reader@storyreader.vn
- Mật khẩu: Reader@123456
- Quyền hạn: Đọc truyện, bình luận, theo dõi truyện và mua gói

---

## Nhóm Thực Hiện

- Nhóm: Nhóm 7
- Môn học: Đồ án chuyên ngành / Cuối khóa 2026
- Danh sách thành viên:
  - Lê Hoàng
  - Trần Mỹ Duyên
  - Trần Minh Tuyên
  - Hồ Minh Tuyền
