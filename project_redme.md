# Hệ Thống Quản Lý Đọc Truyện - StoryReader

Hệ thống quản lý và đọc truyện trực tuyến hỗ trợ nền tảng Web và Mobile, cung cấp trải nghiệm đọc truyện linh hoạt, quản lý gói đọc theo tháng, mua lẻ truyện và tích hợp thanh toán.

---

##  Tech Stack

- **Backend:** ASP.NET Core Web API (.NET 8), Entity Framework Core
- **Database & Cache:** PostgreSQL, Redis
- **Frontend (Web):** React + TypeScript (Vite) / `storyreader-web`
- **Mobile App:** Android Native (Kotlin)
- **Authentication:** JWT (JSON Web Token) & ASP.NET Core Identity
- **Containerization:** Docker Compose

---

##  Tính Năng Chính

###  Người Đọc (Member / Guest)
- **Duyệt & Tìm kiếm:** Xem danh sách truyện hot, truyện mới, tìm kiếm theo thể loại / tác giả.
- **Trải nghiệm đọc:** Lưu tiến độ đọc, danh sách đang đọc, truyện yêu thích, nhận thông báo chương mới.
- **Thanh toán & Gói đọc:** Đăng ký gói đọc theo tháng, mua lẻ truyện, xem lịch sử giao dịch.
- **Thảo luận:** Bình luận theo chương, phản hồi và báo cáo nội dung vi phạm.

###  Quản Trị Viên (Admin)
- **Quản lý nội dung:** CRUD truyện, chương, thiết lập chính sách Free/Paid, lên lịch phát hành.
- **Quản lý kinh doanh:** Quản lý gói đọc, thiết lập giá truyện, xử lý giao dịch lỗi.
- **Kiểm duyệt & Thành viên:** Quản lý tài khoản người dùng, kiểm duyệt bình luận/báo cáo.
- **Báo cáo thống kê:** Thống kê lượt đọc, doanh thu và các nội dung nổi bật.

---

##  Cấu Trúc Dự Án

```text
├── StoryReader.Api/        # RESTful API Backend (ASP.NET Core)
├── storyreader-web/         # Frontend Web App (React + TypeScript)
├── Docx/                    # Tài liệu quản lý dự án (.docx, .xlsx, .md)
├── docker-compose.yml       # Cấu hình môi trường (PostgreSQL, Redis)
└── StoryReader.Api.slnx     # Csharp Solution File
```

---

##  Hướng Dẫn Khởi Chạy Nhanh

### 1. Yêu Cầu Môi Trường
- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (phiên bản LTS)
- [Docker & Docker Compose](https://www.docker.com/)

### 2. Khởi Chạy Infrastructure (Database & Redis)
```bash
docker-compose up -d
```

### 3. Chạy Backend API
```bash
cd StoryReader.Api
dotnet restore
dotnet run
```
*API Swagger sẽ khả dụng tại: `http://localhost:5000/swagger` (hoặc port đã cấu hình).*

### 4. Chạy Frontend Web
```bash
cd storyreader-web
npm install
npm run dev
```

---

## 👥 Nhóm Thực Hiện
- **Nhóm 7** - Đồ án cuối môn 2026
