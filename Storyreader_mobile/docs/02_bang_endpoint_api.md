# 02. BẢNG TOÀN BỘ ENDPOINT API BACKEND (StoryReader.Api)

Tài liệu này được trích xuất trực tiếp từ mã nguồn thực tế của `StoryReader.Api` (Controllers, DTOs, Entities, Services).

## 1. Thông số Kỹ thuật & Hạ tầng API
- **Nền tảng**: ASP.NET Core (.NET 8/9 Web API) kết hợp Entity Framework Core.
- **Cổng mặc định**:
  - HTTP: `http://localhost:5066`
  - HTTPS: `https://localhost:7244`
  - Swagger UI: `http://localhost:5066/swagger`
- **Địa chỉ gọi từ Mobile**:
  - Android Emulator: `http://10.0.2.2:5066/api`
  - iOS Simulator / Windows App: `http://localhost:5066/api`
  - Thiết bị thật (Physical Device): `http://<IP_LAN_CUA_MAY_HOST>:5066/api`
- **Cơ chế xác thực**:
  - JSON Web Token (JWT Bearer Authentication).
  - Header yêu cầu: `Authorization: Bearer <AccessToken>`
  - Thời hạn Token mặc định (`Jwt:AccessTokenMinutes`): 30 phút.
  - **Lưu ý đặc biệt**: Backend API **chưa cung cấp** endpoint Refresh Token (`/api/auth/refresh`). Khi token hết hạn (trả về HTTP 401 Unauthorized), ứng dụng phía mobile phải tự động xóa thông tin đăng nhập và điều hướng người dùng đăng nhập lại.
- **CORS**: `AllowAnyOrigin()`, `AllowAnyHeader()`, `AllowAnyMethod()`.
- **Tải lên & Lưu trữ tệp tĩnh**:
  - Thư mục lưu trữ: `wwwroot/uploads/covers/`
  - Đường dẫn trả về từ API: dạng tương đối `/uploads/covers/{fileName}`. Client cần ghép với tiền tố Host `http://<host>:5066` nếu URL chưa có scheme.

---

## 2. Bảng Danh mục Enums quan trọng
| Enum | Giá trị nguyên (int) | Tên định danh | Ý nghĩa |
| :--- | :--- | :--- | :--- |
| **StoryType** | 0 | `Novel` | Truyện chữ |
| | 1 | `Comic` | Truyện tranh (Manga / Manhwa / Webtoon) |
| **ReleaseStatus** | 0 | `Ongoing` | Đang phát hành |
| | 1 | `Completed` | Đã hoàn thành |
| **AccessPolicy** | 0 | `Free` | Toàn bộ chương đều miễn phí |
| | 1 | `Paid` | Phải mua cả truyện hoặc có gói VIP |
| | 2 | `Mixed` | Cho phép đọc miễn phí `FreeChapterCount` chương đầu, các chương sau cần mua/VIP |
| **TransactionType** | 0 | `Subscription` | Mua gói đọc VIP |
| | 1 | `StoryPurchase` | Mua trọn bộ một truyện |
| **TransactionStatus**| 0 | `Pending` | Đang chờ thanh toán |
| | 1 | `Success` | Giao dịch thành công |
| | 2 | `Failed` | Giao dịch thất bại |

---

## 3. Bảng Chi tiết Toàn bộ Endpoints

### 3.1. Xác thực (Authentication) - `api/auth`
| Method | Endpoint | Yêu cầu Auth | Request Body / Query | Response DTO & Mã trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Không | JSON: `{ email: string, password: string, displayName: string }` | **200 OK**: `{ accessToken: string, expiresAt: string, email: string?, displayName: string?, role: string? }`<br>**400 Bad Request**: `{ message: string }` |
| `POST` | `/api/auth/login` | Không | JSON: `{ email: string, password: string }` | **200 OK**: `{ accessToken: string, expiresAt: string, email: string?, displayName: string?, role: string? }`<br>**400 Bad Request**: `{ message: string }` |

---

### 3.2. Truyện (Stories) - `api/stories`
| Method | Endpoint | Yêu cầu Auth | Request Body / Query | Response DTO & Mã trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/stories` | Không | Query: `keyword?: string`, `genreId?: Guid`, `page: int = 1`, `pageSize: int = 100` | **200 OK**: `List<StoryListItemDto>`<br>Mỗi phần tử:<br>- `id`: Guid<br>- `title`: string<br>- `coverImageUrl`: string<br>- `author`: string<br>- `status`: ReleaseStatus (0: Ongoing, 1: Completed)<br>- `accessPolicy`: AccessPolicy (0: Free, 1: Paid, 2: Mixed)<br>- `viewCount`: int<br>- `type`: StoryType (0: Novel, 1: Comic)<br>- `totalChapters`: int<br>- `latestChapterNumber`: int? |
| `GET` | `/api/stories/{id}` | Tùy chọn (Gắn token để tính quyền mở khóa) | Path: `id: Guid` | **200 OK**: `StoryDetailDto`:<br>- `id`: Guid<br>- `title`: string<br>- `coverImageUrl`: string<br>- `description`: string<br>- `author`: string<br>- `status`: ReleaseStatus<br>- `accessPolicy`: AccessPolicy<br>- `price`: decimal?<br>- `freeChapterCount`: int<br>- `genres`: `List<string>`<br>- `chapters`: `List<ChapterListItemDto>` (mỗi phần tử có: `id`, `chapterNumber`, `title`, `requiresAccess`, `partName`)<br>- `type`: StoryType (0: Novel, 1: Comic)<br>**404 Not Found** nếu không tồn tại. |
| `POST` | `/api/stories` | Admin | JSON: `CreateStoryDto` (`title`, `coverImageUrl`, `description`, `author`, `accessPolicy`, `price`, `freeChapterCount`, `genreIds: List<Guid>`, `type: StoryType`) | **201 Created**: `{ id: Guid }` |
| `PUT` | `/api/stories/{id}` | Admin | Path: `id: Guid`<br>JSON: `UpdateStoryDto` (`title`, `coverImageUrl`, `description`, `author`, `status`, `accessPolicy`, `price`, `freeChapterCount`, `genreIds: List<Guid>`, `type: StoryType`) | **204 NoContent** |
| `DELETE`| `/api/stories/{id}` | Admin | Path: `id: Guid` | **204 NoContent** |
| `POST` | `/api/stories/upload-cover` | Admin | Multipart Form: `file: IFormFile` (Ảnh tối đa 10MB: `.jpg`, `.jpeg`, `.png`, `.webp`, `.gif`) | **200 OK**: `{ url: string }`<br>**400 Bad Request**: `{ message: string }` |
| `POST` | `/api/stories/{id}/chapters` | Admin | Path: `id: Guid`<br>JSON: `CreateChapterDto` (`chapterNumber: int`, `title: string`, `content: string`, `publishAt?: DateTime`, `renderAsImages: bool`, `partName?: string`) | **204 NoContent** |
| `PUT` | `/api/stories/{id}/chapters/{chapterId}` | Admin | Path: `id: Guid`, `chapterId: Guid`<br>JSON: `UpdateChapterDto` (`chapterNumber: int`, `title: string`, `content: string`, `publishAt?: DateTime`, `renderAsImages: bool`, `partName?: string`) | **204 NoContent** |
| `DELETE`| `/api/stories/{id}/chapters/{chapterId}` | Admin | Path: `id: Guid`, `chapterId: Guid` | **204 NoContent** |
| `POST` | `/api/stories/{id}/follow` | Đăng nhập | Path: `id: Guid` | **200 OK**: `{ isFollowing: bool, message: string }`<br>**401 Unauthorized** nếu chưa đăng nhập |
| `GET` | `/api/stories/{id}/is-following` | Tùy chọn | Path: `id: Guid` | **200 OK**: `{ isFollowing: bool }` (mặc định false nếu chưa đăng nhập) |

---

### 3.3. Chương & Nội dung đọc (Chapters) - `api/chapters`
| Method | Endpoint | Yêu cầu Auth | Request Body / Query | Response DTO & Mã trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/chapters/{id}` | Tùy chọn (Nếu chương có phí: bắt buộc có token đã mua hoặc có gói VIP) | Path: `id: Guid` | **200 OK**: `ChapterContentDto`:<br>- `id`: Guid<br>- `chapterNumber`: int<br>- `title`: string<br>- `content`: string<br>- `storyType`: StoryType (0: Novel, 1: Comic)<br>- `imageUrls`: `List<string>` (danh sách URL ảnh nếu là truyện tranh hoặc nội dung dạng dòng URL)<br>- `partName`: string? (Tên phần/tập cha-con)<br>**403 Forbidden**: Chưa có quyền đọc chương (truyện trả phí/hết chương free)<br>**404 Not Found**: Chương không tồn tại hoặc chưa tới thời điểm phát hành (`PublishAt`).<br>*(Tự động ghi nhận `ReadingProgress` và tăng `ViewCount` nếu người dùng đã đăng nhập)* |

---

### 3.4. Bình luận chương (Discussions) - `api/chapters/{chapterId}/discussions`
| Method | Endpoint | Yêu cầu Auth | Request Body / Query | Response DTO & Mã trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/chapters/{chapterId}/discussions` | Không | Path: `chapterId: Guid` | **200 OK**: `List<{ id: Guid, content: string, createdAt: DateTime, user: string }>` |
| `POST` | `/api/chapters/{chapterId}/discussions` | Đăng nhập | Path: `chapterId: Guid`<br>JSON: `{ content: string }` | **204 NoContent**<br>**403 Forbidden** nếu tài khoản bị khóa/hạn chế (`isRestricted = true`) |
| `PUT` | `/api/chapters/{chapterId}/discussions/{discussionId}/hide` | Admin | Path: `chapterId: Guid`, `discussionId: Guid` | **204 NoContent**<br>**404 Not Found** nếu không tìm thấy bình luận |

---

### 3.5. Thể loại (Genres) - `api/genres`
| Method | Endpoint | Yêu cầu Auth | Request Body / Query | Response DTO & Mã trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/genres` | Không | Không | **200 OK**: `List<GenreDto>`<br>Mỗi phần tử:<br>- `id`: Guid<br>- `name`: string<br>- `slug`: string<br>- `storyCount`: int |
| `POST` | `/api/genres` | Admin | JSON: `{ name: string }` | **201 Created**: `GenreDto`<br>**400 Bad Request** nếu tên trống hoặc trùng lặp |
| `PUT` | `/api/genres/{id}` | Admin | Path: `id: Guid`<br>JSON: `{ name: string }` | **200 OK**: `GenreDto`<br>**400 Bad Request** nếu trùng tên<br>**404 Not Found** |
| `DELETE`| `/api/genres/{id}` | Admin | Path: `id: Guid` | **200 OK**: `{ message: string }`<br>**404 Not Found** |

---

### 3.6. Hồ sơ người dùng (Profile) - `api/profile`
| Method | Endpoint | Yêu cầu Auth | Request Body / Query | Response DTO & Mã trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/profile` hoặc `/api/profile/me` | Đăng nhập | Không | **200 OK**: `UserProfileDto`:<br>- `id`: Guid<br>- `email`: string<br>- `displayName`: string<br>- `role`: string ("Admin", "VIP", "User")<br>- `isRestricted`: bool<br>- `createdAt`: DateTime<br>- `activePlanName`: string?<br>- `subscriptionEndAt`: DateTime? |
| `PUT` | `/api/profile` hoặc `/api/profile/me` | Đăng nhập | JSON: `{ displayName: string }` | **200 OK**: `{ message: string, displayName: string }`<br>**400 Bad Request** nếu rỗng hoặc > 50 ký tự |
| `POST` | `/api/profile/change-password` | Đăng nhập | JSON: `{ currentPassword: string, newPassword: string }` | **200 OK**: `{ message: string }`<br>**400 Bad Request**: Sai mật khẩu cũ hoặc mật khẩu mới < 6 ký tự |
| `GET` | `/api/profile/history` | Đăng nhập | Không | **200 OK**: `List<StoryListItemDto>` (Danh sách truyện trong lịch sử đọc) |
| `GET` | `/api/profile/bookmarks` | Đăng nhập | Không | **200 OK**: `List<StoryListItemDto>` (Danh sách truyện đã theo dõi) |
| `GET` | `/api/profile/purchased` | Đăng nhập | Không | **200 OK**: `List<StoryListItemDto>` (Danh sách truyện đã mua trả phí) |

---

### 3.7. Gói Đọc VIP & Đăng ký (Subscriptions) - `api/subscriptions`
| Method | Endpoint | Yêu cầu Auth | Request Body / Query | Response DTO & Mã trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/subscriptions/plans` | Không | Không | **200 OK**: `List<SubscriptionPlanDto>`:<br>- `id`: Guid<br>- `name`: string<br>- `price`: decimal<br>- `durationDays`: int<br>- `scope`: string |
| `GET` | `/api/subscriptions/me` | Đăng nhập | Không | **200 OK**: `List<MySubscriptionDto>`:<br>- `planId`: Guid<br>- `planName`: string<br>- `startAt`: DateTime<br>- `endAt`: DateTime<br>- `isActive`: bool |
| `GET` | `/api/subscriptions/me/purchases` | Đăng nhập | Không | **200 OK**: `List<MyPurchaseDto>`:<br>- `storyId`: Guid<br>- `storyTitle`: string<br>- `pricePaid`: decimal<br>- `purchasedAt`: DateTime |

---

### 3.8. Thanh toán (Payments) - `api/payments`
| Method | Endpoint | Yêu cầu Auth | Request Body / Query | Response DTO & Mã trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/story/{storyId}` | Đăng nhập | Path: `storyId: Guid` | **200 OK**: `{ transactionId: Guid, paymentUrl: string }` |
| `POST` | `/api/payments/subscription/{planId}` | Đăng nhập | Path: `planId: Guid` | **200 OK**: `{ transactionId: Guid, paymentUrl: string }` |
| `POST` | `/api/payments/callback` | Không (Webhook công khai) | Query: `providerRef: string`, `success: bool` | **200 OK** |

---

### 3.9. Quản trị hệ thống (Admin) - `api/admin/*`
| Method | Endpoint | Yêu cầu Auth | Request Body / Query | Response DTO & Mã trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/stats/overview` | Admin | Không | **200 OK**: `AdminDashboardOverviewDto`:<br>- `todayRevenue`: decimal<br>- `yesterdayRevenue`: decimal<br>- `revenueGrowthPercent`: double<br>- `totalUsers`: int<br>- `newUsersThisWeek`: int<br>- `totalFollows`: int<br>- `totalChapterViews`: int<br>- `totalStories`: int |
| `GET` | `/api/admin/stats/recent-transactions` | Admin | Query: `limit: int = 10` | **200 OK**: `List<RecentTransactionDto>` |
| `GET` | `/api/admin/stats/recent-activities` | Admin | Query: `limit: int = 10` | **200 OK**: `List<RecentActivityDto>` |
| `GET` | `/api/admin/users` | Admin | Query: `keyword?: string` | **200 OK**: `List<MemberListItemDto>` (`id`, `email`, `displayName`, `role`, `isRestricted`, `createdAt`) |
| `PUT` | `/api/admin/users/{id}/toggle-restriction`| Admin | Path: `id: Guid` | **200 OK**: `{ id: Guid, isRestricted: bool, message: string }` |
| `GET` | `/api/admin/transactions` | Admin | Query: `status?: TransactionStatus`, `keyword?: string`, `page: int = 1`, `pageSize: int = 20` | **200 OK**: `{ total: int, page: int, pageSize: int, items: List<TransactionItem> }` |
| `POST` | `/api/admin/transactions/{id}/force-activate`| Admin | Path: `id: Guid` | **200 OK**: `{ message: string }`<br>**400 Bad Request**: `{ message: string }` |
| `POST` | `/api/admin/transactions/{id}/mark-failed` | Admin | Path: `id: Guid` | **200 OK**: `{ message: string }` |

---

### 3.10. Thông báo (Notifications) - `api/notifications`
| Method | Endpoint | Yêu cầu Auth | Request Body / Query | Response DTO & Mã trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Đăng nhập | Query: `page: int = 1`, `pageSize: int = 20` | **200 OK**: `{ unreadCount: int, items: List<{ id: Guid, title: string, message: string, linkUrl: string, isRead: bool, createdAt: DateTime }> }` |
| `GET` | `/api/notifications/unread-count` | Đăng nhập | Không | **200 OK**: `{ unreadCount: int }` |
| `PUT` | `/api/notifications/{id}/read` | Đăng nhập | Path: `id: Guid` | **200 OK**: `{ message: string }` |
| `PUT` | `/api/notifications/read-all` | Đăng nhập | Không | **200 OK**: `{ message: string }` |
