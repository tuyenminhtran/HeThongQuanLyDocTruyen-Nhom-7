# He Thong Quan Ly Doc Truyen - StoryReader

He thong quan ly va doc truyen truc tuyen da nen tang (Web va Mobile), ho tro doc truyen chu, truyen tranh (Comic/Manga), tich hop co che bao ve ban quyen chong sao chep, quan ly goi hoi vien va giao dich thanh toan.

---

## Cong Nghe Su Dung

- Backend: ASP.NET Core Web API (.NET 8), Entity Framework Core 8
- Co so du lieu va bo dem: PostgreSQL 16, Redis
- Frontend Web: React 18, TypeScript, Vite, TailwindCSS, TanStack Query
- Mobile App: Flutter (Dart)
- Thu vien xu ly do hoa: SkiaSharp (chuyen doi van ban thanh hinh anh chong sao chep)
- Xac thuc va phan quyen: JSON Web Token (JWT) ket hop ASP.NET Core Identity
- Ao hoa moi truong: Docker Compose

---

## Cac Tinh Nang Chinh

### 1. Danh Cho Doc Gia (Member / Guest)
- Duyet va tim kiem: Tim kiem truyen theo tu khoa, loc theo the loai, phan loai truyen chu hoac truyen tranh.
- Trai nghiem doc truyen:
  - Che do doc truyen chu tuy chinh co chu, mau nen (Dark, Light, Sepia).
  - Che do doc Webtoon cuon doc lien mach cho truyen tranh va chuong bao ve ban quyen.
  - Chuyen chuong nhanh bang ban phim hoac thanh dieu huong cuoi trang.
  - Tu dong luu tien do doc theo tung chuong.
- Tinh nang tuong tac:
  - Theo doi truyen va nhan thong bao khi co chuong moi phat hanh.
  - Thao luan, gui binh luan theo tung chuong truyen.
- Goi doc va mua le:
  - Dang ky goi doc hoi vien theo thoi han (1 thang, 3 thang, 12 thang).
  - Mua le truyen co phi.
  - Xem lich su giao dich va trang thai kich hoat.

### 2. Danh Cho Quan Tri Vien (Admin)
- Quan ly noi dung truyen:
  - Them, sua, xoa thong tin truyen, the loai, anh bia va tac gia.
  - Them va sua chuong cho truyen chu va truyen tranh.
  - Chuc nang chong sao chep: Tu dong render van ban thanh tap hop hinh anh co watermark de doc gia khong the sao chep van ban.
  - Thiet lap chinh sach truy cap: Mien phi, tra phi toan bo hoac ket hop so chuong mien phi dau tien.
- Quan ly kinh doanh va doi soat:
  - Quan ly danh muc goi hoi vien.
  - Theo doi lich su giao dich thanh toan.
  - Kich hoat thu cong cac giao dich hop le nhung chua duoc xu ly tu dong.
  - Danh dau that bai cho cac giao dich khong hop le.
- Quan ly nguoi dung va kiem duyet:
  - Danh sach tai khoan thanh vien.
  - Kiem duyet va an cac binh luan vi pham tieu chuan cong dong.
- Bang dieu khien thong ke:
  - Tong so truyen, chuong, tai khoan nguoi dung va luot xem toan he thong.

---

## Cau Truc Thu Muc Du An

```text
HeThongQuanLyDocTruyen-Nhom-7/
├── StoryReader.Api/           # Ma nguon Backend (ASP.NET Core Web API)
│   ├── Controllers/           # Cac bo dieu khien API
│   ├── Data/                  # DbContext, DataSeeder va Migrations
│   ├── Models/                # Entity va DTOs
│   ├── Services/              # Logic nghiep vu va xu ly hinh anh SkiaSharp
│   └── wwwroot/               # Thu muc luu tru anh chuong render tinh
├── storyreader-web/           # Ma nguon Frontend Web (React + Vite)
│   ├── src/
│   │   ├── api/               # Cac ham goi API backend
│   │   ├── components/        # Cac thanh phan giao dien dung chung
│   │   ├── pages/             # Cac trang nguoi dung va trang quan tri
│   │   └── store/             # Quan ly trang thai dang nhap (Zustand)
├── Storyreader_mobile/        # Ma nguon Mobile App (Flutter)
├── db/                        # Script khoi tao co so du lieu
├── docker-compose.yml         # Cau hinh Docker cho PostgreSQL va Redis
└── README.md                  # Tai lieu huong dan du an
```

---

## Huong Dan Khoi Chay He Thong

### 1. Yeu Cau Moi Truong
- .NET 8 SDK
- Node.js (phien ban 18 hoac 20 LTS)
- Flutter SDK (cho ung dung di dong)
- Docker va Docker Compose

### 2. Khoi Dong Ha Tang Co So Du Lieu
Chay PostgreSQL va Redis thong qua Docker Compose tai thu muc goc cua du an:
```bash
docker-compose up -d
```
Thong so ket noi mac dinh:
- Host: localhost
- Port: 5432
- Database: storyreader
- User: storynest
- Password: storynest123

### 3. Khoi Chay Backend API
Chuyen vao thu muc backend va khoi chay:
```bash
cd StoryReader.Api
dotnet restore
dotnet run
```
API se khoi chay tai dia chi:
- Swagger UI: http://localhost:5066/swagger
- API Base URL: http://localhost:5066/api

Co so du lieu se duoc tu dong seed cac the loai, goi hoi vien, tai khoan mau va truyen mau ngay trong lan khoi dong dau tien.

### 4. Khoi Chay Frontend Web
Chuyen vao thu muc web va chay development server:
```bash
cd storyreader-web
npm install
npm run dev
```
Trang web se hoat dong tai dia chi: http://localhost:5173

### 5. Khoi Chay Frontend Mobile (Tuy chon)
Chuyen vao thu muc mobile de chay tren thiet bi hoac trinh gia lap:
```bash
cd Storyreader_mobile
flutter pub get
flutter run
```

---

## Tai Khoan Mac Dinh

He thong da duoc tao san cac tai khoan de kiem thu:

1. Tai khoan Quan tri vien (Admin):
- Email: admin@storynest.local
- Mat khau: Admin@123456
- Quyen han: Toan quyen quan tri he thong

2. Tai khoan Doc gia (Member):
- Email: reader@storyreader.vn
- Mat khau: Reader@123456
- Quyen han: Doc truyen, binh luan, theo doi truyen va mua goi

---

## Nhom Thuc Hien

- Nhom: Nhom 7
- Mon hoc: Do an chuyen nganh / Cuoi khoa 2026
- Danh sach thanh vien:
  - Le Hoang
  - Tran My Duyen
  - Tran Minh Tuyen
  - Ho Minh Tuyen
