# DANH SÁCH ĐỀ XUẤT CẢI TIẾN & BỔ SUNG API BACKEND (StoryReader.Api)
> **Dự án**: Đồ án CNPM - Hệ thống quản lý đọc truyện (Nhóm 7)  
> **Người đề xuất**: Senior Mobile Engineer  
> **Mục đích**: Ghi nhận các yêu cầu endpoint bổ sung cho đội ngũ Backend nhằm hoàn thiện trải nghiệm người dùng trên Mobile App mà không làm ảnh hưởng đến hợp đồng API hiện tại.

---

### 1. Xác thực & Quản lý Phiên đăng nhập (Authentication)
- **Vấn đề hiện tại**: Token JWT chỉ có thời hạn mặc định 30 phút (`AccessTokenMinutes = 30`) và API **chưa có cơ chế Refresh Token**. Khi hết hạn, app buộc phải đăng xuất người dùng ra màn hình đăng nhập.
- **Đề xuất endpoint**:
  - `POST /api/auth/refresh`
  - **Body**: `{ "refreshToken": string }`
  - **Response 200 OK**: `{ "accessToken": string, "refreshToken": string, "expiresAt": DateTime }`
  - **Lợi ích**: Giúp người dùng giữ phiên đăng nhập lâu dài (7 - 30 ngày) tương tự các app đọc truyện thực tế (Webtoon, MangaToon, Wattpad).

---

### 2. Mua Bản Quyền Trọn Bộ Truyện (Story Purchase)
- **Vấn đề hiện tại**: Backend đã định nghĩa enum `TransactionType.StoryPurchase = 1`, nhưng Controller `PaymentController` / `SubscriptionsController` hiện chủ yếu phục vụ thanh toán các gói VIP theo tháng/năm (`SubscriptionPlan`).
- **Đề xuất endpoint**:
  - `POST /api/stories/{id}/purchase`
  - **Header**: `Authorization: Bearer <Token>`
  - **Response 200 OK**: `{ "success": true, "transactionId": Guid, "message": "Mua truyện thành công" }`
  - **Lợi ích**: Giúp người đọc có thể mua vĩnh viễn bộ truyện mình yêu thích mà không bắt buộc phải duy trì gói VIP hàng tháng.

---

### 3. Đánh giá & Xếp hạng Truyện (Story Rating & Review)
- **Vấn đề hiện tại**: Truyện chỉ có số lượt xem (`viewCount`) và lượt theo dõi (`isFollowing`), chưa có điểm đánh giá trung bình (1 - 5 sao).
- **Đề xuất endpoint**:
  - `GET /api/stories/{id}/reviews`: Lấy danh sách đánh giá và điểm số trung bình (ví dụ: 4.8/5.0).
  - `POST /api/stories/{id}/reviews`: Gửi đánh giá sao (1 - 5) kèm cảm nhận ngắn.

---

### 4. Tải lên Ảnh đại diện Cá nhân (User Avatar Upload)
- **Vấn đề hiện tại**: `StoryReader.Api` mới chỉ hỗ trợ `POST /api/stories/upload-cover` dành cho Admin tải ảnh bìa truyện. Người dùng thông thường chưa có endpoint tải ảnh avatar cá nhân mà hiển thị chữ cái đầu tên hiển thị.
- **Đề xuất endpoint**:
  - `POST /api/profile/upload-avatar`
  - **Form-data**: `file: IFormFile` (Hỗ trợ `.jpg`, `.png`, `.webp`, tối đa 5MB)
  - **Response 200 OK**: `{ "avatarUrl": string }`

---

### 5. Hàng đợi Đồng bộ Tiến độ Đọc Hàng loạt (Batch Sync Reading Progress)
- **Vấn đề hiện tại**: Việc ghi nhận tiến độ đọc dựa vào việc gọi `GET /api/chapters/{id}` từng chương một. Khi người dùng đọc offline 5-10 chương rồi kết nối mạng trở lại, việc ping từng request có thể gây nghẽn mạng.
- **Đề xuất endpoint**:
  - `POST /api/reading-progress/batch-sync`
  - **Body**:
    ```json
    {
      "items": [
        { "storyId": "guid", "chapterId": "guid", "readAt": "2026-10-27T10:00:00Z", "percentage": 100.0 }
      ]
    }
    ```
  - **Response 200 OK**: `{ "syncedCount": int }`
