# 05. BẢNG ĐỐI CHIẾU PARITY CHỨC NĂNG (WEB vs MOBILE vs API)
> **Dự án**: StoryReader - Hệ thống Quản lý Đọc truyện (Nhóm 7)  
> **Phiên bản khảo sát**: Giai đoạn A - Khảo sát và Đồng bộ Codebase  
> **Người thực hiện**: Senior Mobile Engineer + QA  
> **Ngày cập nhật**: 28/10/2026  

---

## 1. TỔNG QUAN KHẢO SÁT HỆ THỐNG

### 1.1. Hiện trạng Git & Đồng bộ Codebase
- **Nhánh hiện tại**: `main`, đã cập nhật mới nhất với `origin/main` (commit `a0b703b` - Merge pull request #50).
- **Các thay đổi gần đây của Web & API**:
  - `3f48fda`: Phát triển trang Bảng Xếp Hạng riêng biệt (`RankingsPage.tsx`) với vinh danh Top 3 và bộ lọc đa tiêu chí; API `StoriesController.cs` và `StoryService.cs` bổ sung tham số `sortBy` ("top", "views", "newest", "title").
  - `8cffdae`: Phân trang trang chủ 50 truyện/trang, điều hướng trang mượt mà; API `StoriesController.cs` tăng limit hiển thị lên 100 tác phẩm.
  - `2db2bb0`: Hỗ trợ phân chia phần/tập cha-con dạng thư mục accordion (`PartName`) cho chương truyện (`StoryDtos.cs`, `ChaptersController.cs`, `StoryService.cs`).
  - `8d48efb`: Admin chỉnh sửa truyện, upload ảnh bìa (`POST /api/stories/upload-cover`).
  - `5c4b8cb` & `81c7be6`: Trình đọc chống copy nội dung truyện chữ bằng render ảnh SkiaSharp (`TextToImageService.cs`).
  - `ca05416`: Tách biệt trang Theo Dõi (`FollowingPage.tsx`) và Lịch Sử (`HistoryPage.tsx`) khỏi Profile.
  - `7f422ce`: Hoàn thiện tính năng đánh giá & bình luận thật trên trang chi tiết truyện (`StoryDetailPage.tsx`).
  - `07d94a0`: Linh vật tương tác mèo Jiji / Totoro (`InteractiveMascot.tsx`) và hiệu ứng bối cảnh đọc (`AtmosphericOverlay.tsx`).

### 1.2. Hiện trạng Mobile (`Storyreader_mobile`)
- **Nền tảng**: Flutter 3.x (Dart SDK ^3.12.2), Riverpod 2.6.1, GoRouter 14.8.1, Dio 5.7.0, Google Fonts, CachedNetworkImage.
- **Tình trạng kiểm thử hiện tại**: `flutter test` đạt **32/32 tests pass**; `flutter analyze` báo **No issues found**.
- **Khoảng cách chính so với Web**:
  1. **Thiếu trang Bảng Xếp Hạng riêng biệt (`RankingsPage`)**: Nút "Xếp Hạng" trên header mobile chỉ chuyển về `/?sort=top` (chưa có trang vinh danh Top 3, bộ lọc ngày/tuần/tháng/tất cả). Repository chưa hỗ trợ param `sortBy`.
  2. **Thiếu phần Đánh giá & Bình luận truyện trên `StoryDetailScreen`**: Web có form chấm 1-5 sao + viết cảm nhận và danh sách review; mobile hoàn toàn chưa có.
  3. **Thiếu nút "Đọc mới nhất" và tính năng "Mua truyện" trên `StoryDetailScreen`**: Web có modal QR code mô phỏng thanh toán truyện qua API `/api/payments/story/{id}`; mobile thiếu cả 2 nút này.
  4. **Sai lệch trang Nâng Cấp VIP (`PricingScreen`)**: Mobile đang dùng dữ liệu tĩnh ("Mua Xu Lẻ" không có trong API), chưa gọi `GET /api/subscriptions/plans` và chưa có luồng thanh toán mô phỏng như Web.
  5. **Thiếu tính năng Thông Báo (Notifications)**: API có sẵn 4 endpoint (`api/notifications`), Web có chuông `NotificationBell.tsx`, Mobile đã có `NotificationItem` model nhưng chưa có repository, provider và UI chuông/danh sách.
  6. **Thiếu bộ lọc & tìm kiếm trong Tủ sách (Following & History)**: Web có tìm kiếm từ khóa, lọc thể loại, sắp xếp và nút bỏ theo dõi nhanh; Mobile mới chỉ hiển thị danh sách cơ bản.
  7. **Chức năng Quản trị (Admin)**: Mobile đã xây dựng một phần UI cho Dashboard, Stories, Categories, Users nhưng chưa có màn hình Quản lý Giao dịch (`AdminTransactionsPage.tsx`). Theo ràng buộc đồ án, mục này cần người dùng duyệt phạm vi.

---

## 2. BẢNG ĐỐI CHIẾU PARITY TOÀN DIỆN (PARITY MATRIX)

> **Quy ước trạng thái**:
> - **ĐỦ**: Mobile đã có màn hình, gọi đúng API, hành vi và luồng khớp với Web.
> - **THIẾU**: Web và API có nhưng Mobile chưa làm hoặc bỏ sót.
> - **SAI LỆCH**: Mobile có làm nhưng gọi sai endpoint, thiếu tham số, hardcode dữ liệu hoặc luồng lệch so với Web.
> - **BLOCKED (cần API)**: Chức năng cần nhưng API hiện tại chưa hỗ trợ endpoint (được ghi nhận trong `API_REQUESTS.md`).
> - **NGOÀI PHẠM VI (đề xuất)**: Chức năng quản trị/tác giả hoặc easter egg đề xuất không đưa vào app mobile người đọc, chờ duyệt.

| STT | Nhóm chức năng | Chức năng chi tiết | Trang web (file chứng cứ) | Endpoint API (file chứng cứ) | Vai trò / Quyền | Mobile: Màn hình + Repository | Trạng thái | Ghi chú & Điểm sai lệch cụ thể |
| :---: | :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **I** | **XÁC THỰC (AUTH)** | | | | | | | |
| 1 | Xác thực | Đăng ký tài khoản mới | `src/pages/RegisterPage.tsx:1-120` | `POST /api/auth/register`<br>`Controllers/AuthController.cs:21` | Khách (Ẩn danh) | `features/auth/register_screen.dart`<br>`data/repositories/auth_repository.dart` | **ĐỦ** | Validate email, password >= 6 ký tự, displayName. Lưu JWT Bearer. |
| 2 | Xác thực | Đăng nhập hệ thống | `src/pages/LoginPage.tsx:1-110` | `POST /api/auth/login`<br>`Controllers/AuthController.cs:34` | Khách (Ẩn danh) | `features/auth/login_screen.dart`<br>`data/repositories/auth_repository.dart` | **ĐỦ** | Nhận JWT token, role, displayName. Lưu secure storage. |
| 3 | Xác thực | Đăng xuất tài khoản | `src/components/Header.tsx:147` | Không cần API (Client-side clear token) | Người dùng đã đăng nhập | `widgets/app_header.dart:478`<br>`features/profile/profile_screen.dart:495` | **ĐỦ** | Xóa token trong Secure Storage/SharedPreferences, reset state. |
| 4 | Xác thực | Tự động xử lý hết hạn phiên (401 Unauthorized) | `src/api/client.ts:25` | Tất cả endpoint yêu cầu JWT | Người dùng | `core/network/dio_client.dart:45` | **ĐỦ** | Interceptor bắt lỗi 401, tự động xóa auth state và đưa về màn hình đăng nhập. |
| 5 | Xác thực | Quên / Đặt lại mật khẩu | Web chưa có màn hình này | API chưa có endpoint gửi mail OTP/reset | Khách | Chưa có | **BLOCKED (cần API)** | Đã ghi nhận vào `API_REQUESTS.md`. Hiển thị "Tính năng đang hoàn thiện" nếu có entry point. |
| **II** | **TRANG CHỦ (HOME)** | | | | | | | |
| 6 | Trang chủ | Banner thông báo chào mừng & Mạng xã hội | `src/pages/HomePage.tsx:159-179` | Không gọi API (Static content) | Tất cả | `features/home/home_screen.dart:96-156` | **ĐỦ** | Đồng bộ màu Sky-50, icon loa cam, nút MXH. |
| 7 | Trang chủ | Danh sách "★ Truyện Hay" (Top 6 đề cử) | `src/pages/HomePage.tsx:208-277` | Lọc từ `GET /api/stories`<br>`Controllers/StoriesController.cs:25` | Tất cả | `features/home/home_screen.dart:288-291` | **ĐỦ** | Lấy 6 truyện có `viewCount` cao nhất, badge HOT/Mới, nhãn VIP. |
| 8 | Trang chủ | Bộ lọc đa tiêu chí: Hình thức (Novel/Comic), Thể loại, Trạng thái, Mức phí | `src/pages/HomePage.tsx:283-373` | Client-side filter trên danh sách `GET /api/stories` | Tất cả | `features/home/home_screen.dart:360-466` | **ĐỦ** | Dropdowns lọc trạng thái, mức phí, thể loại và tab pill Chữ/Tranh. |
| 9 | Trang chủ | Lưới truyện chính & Phân trang / Xem thêm | `src/pages/HomePage.tsx:380-450` | `GET /api/stories?pageSize=100`<br>`Controllers/StoriesController.cs:25` | Tất cả | `features/home/home_screen.dart:552-595` | **ĐỦ** | Web dùng phân trang 24/36/50 trang, Mobile dùng nút "Xem thêm truyện" (infinite batch 12/18). Hiển thị đủ 4 trạng thái (Loading, Error, Empty, Data). |
| 10 | Trang chủ | Sidebar Top 10 Bảng xếp hạng tuần/tháng/ngày | `src/pages/HomePage.tsx:470-550` | Lọc từ `GET /api/stories` theo `viewCount` | Tất cả | `features/home/home_screen.dart:601-670` | **ĐỦ** | Top 1-10 số thứ tự viền cam, tên chương mới nhất, lượt đọc định dạng K. |
| 11 | Trang chủ | Banner sidebar Gói Hội Viên VIP | `src/pages/HomePage.tsx:552-575` | Điều hướng sang `/pricing` | Tất cả | `features/home/home_screen.dart:676-715` | **ĐỦ** | Card gradient Amber-Orange dẫn đến trang gói VIP. |
| **III** | **TÌM KIẾM, LỌC & THỂ LOẠI** | | | | | | | |
| 12 | Tìm kiếm | Ô tìm kiếm với Debounce tức thì | `src/components/Header.tsx:75`<br>`src/pages/HomePage.tsx:56` | `GET /api/stories?keyword=...`<br>`Controllers/StoriesController.cs:25` | Tất cả | `features/home/home_screen.dart:162-207`<br>`widgets/app_header.dart:211-247` | **ĐỦ** | Debounce 350ms, nút xóa text, hủy debounce khi unmount. |
| 13 | Thể loại | Danh mục thể loại (Menu Header & Dropdown) | `src/components/Header.tsx:212`<br>`src/api/genres.ts:60` | `GET /api/genres`<br>`Controllers/GenresController.cs:48` | Tất cả | `widgets/app_header.dart:67-164`<br>`data/repositories/genre_repository.dart` | **ĐỦ** | BottomSheet hiển thị lưới thể loại kèm số lượng tác phẩm. |
| 14 | Sắp xếp | Sắp xếp truyện từ server (`sortBy`) | `src/pages/RankingsPage.tsx:28` | `GET /api/stories?sortBy=top/newest/title`<br>`Controllers/StoriesController.cs:26` | Tất cả | `data/repositories/story_repository.dart`<br>`providers/story_provider.dart` | **ĐỦ (Tầng Data)** | Đã bổ sung tham số `sortBy` vào `IStoryRepository.getStories`, `StoryApi`, `StoryFilterQuery` và mock test. |
| **IV** | **BẢNG XẾP HẠNG (RANKINGS)** | | | | | | | |
| 15 | Bảng xếp hạng | Trang Bảng Xếp Hạng chuyên biệt (`/rankings`) | `src/pages/RankingsPage.tsx:1-461` | `GET /api/stories?sortBy=top&pageSize=100`<br>`Controllers/StoriesController.cs:26` | Tất cả | Mobile **chưa có** màn hình `RankingsScreen` | **THIẾU** | Web có trang `/rankings` riêng. Header mobile click "Xếp Hạng" bị chuyển về `/?sort=top` không hoạt động. Cần tạo `RankingsScreen` có vinh danh Top 3 và bộ lọc Ngày/Tuần/Tháng. |
| 16 | Bảng xếp hạng | Vinh danh bục vinh quang Top 3 (Podium Top 1, 2, 3) | `src/pages/RankingsPage.tsx:160-290` | Tính toán từ danh sách truyện top view | Tất cả | Chưa có | **THIẾU** | Hiệu ứng vương miện vàng (Top 1), bạc (Top 2), đồng (Top 3) kèm avatar to và số lượt đọc giả lập theo thời gian. |
| 17 | Bảng xếp hạng | Bộ lọc mốc thời gian: Ngày, Tuần, Tháng, Tất cả | `src/pages/RankingsPage.tsx:110-150` | Tính toán tỷ lệ view theo mốc thời gian | Tất cả | Chưa có | **THIẾU** | Đi kèm với `RankingsScreen`. |
| **V** | **CHI TIẾT TRUYỆN (STORY DETAIL)** | | | | | | | |
| 18 | Chi tiết truyện | Thông tin truyện (Bìa, Tiêu đề, Tác giả, Thể loại, Lượt xem, Mô tả) | `src/pages/StoryDetailPage.tsx:260-360` | `GET /api/stories/{id}`<br>`Controllers/StoriesController.cs:34` | Tất cả | `features/story_detail/story_detail_screen.dart:180-365` | **ĐỦ** | Background ambient blur, chip thể loại cam nhạt, badge loại truyện. |
| 19 | Chi tiết truyện | Nút "Đọc từ đầu" | `src/pages/StoryDetailPage.tsx:375` | Dẫn đến chương 1 (`chapters[0].id`) | Tất cả | `features/story_detail/story_detail_screen.dart:377` | **ĐỦ** | Chuyển đến chương đầu tiên trong danh sách. |
| 20 | Chi tiết truyện | Nút "Đọc mới nhất" | `src/pages/StoryDetailPage.tsx:390` | Dẫn đến chương cuối (`chapters[last].id`) | Tất cả | Chưa có trong action buttons | **THIẾU** | Web có nút "Đọc mới nhất" màu viền xám cạnh nút Đọc từ đầu. Mobile hiện đang thiếu nút này. |
| 21 | Chi tiết truyện | Nút "Mua truyện" & Modal thanh toán trực tiếp | `src/pages/StoryDetailPage.tsx:124-165, 410` | `POST /api/payments/story/{id}`<br>`Controllers/PaymentsController.cs:23` | Người dùng đã đăng nhập | Chưa có trên `StoryDetailScreen` | **THIẾU** | Khi truyện có phí (`accessPolicy > 0`) và chưa sở hữu, Web hiển thị nút mua kèm modal mã QR và nút xác nhận mô phỏng (`/api/payments/callback`). Mobile chưa có nút này. |
| 22 | Chi tiết truyện | Theo dõi / Bỏ theo dõi truyện | `src/pages/StoryDetailPage.tsx:106-119` | `POST /api/stories/{id}/follow`<br>`Controllers/StoriesController.cs:121` | Người dùng đã đăng nhập | `features/story_detail/story_detail_screen.dart:40-75` | **ĐỦ** | Gọi API toggle follow, invalidate cache `isFollowing` và `bookmarks`. |
| 23 | Chi tiết truyện | Kiểm tra trạng thái đang theo dõi | `src/pages/StoryDetailPage.tsx:100` | `GET /api/stories/{id}/is-following`<br>`Controllers/StoriesController.cs:132` | Tùy chọn (false nếu ẩn danh) | `providers/story_provider.dart:45` | **ĐỦ** | Trả về boolean `isFollowing`. |
| 24 | Chi tiết truyện | Tìm kiếm chương trong danh sách | `src/pages/StoryDetailPage.tsx:470` | Lọc client-side theo số chương / tên chương | Tất cả | `features/story_detail/story_detail_screen.dart:97-104` | **ĐỦ** | Có ô nhập tìm kiếm chương nhanh. |
| 25 | Chi tiết truyện | Đảo thứ tự danh sách chương (Cũ nhất / Mới nhất) | `src/pages/StoryDetailPage.tsx:490` | Sắp xếp ascending / descending | Tất cả | `features/story_detail/story_detail_screen.dart:106-108` | **ĐỦ** | Có nút toggle sort và cập nhật danh sách ngay lập tức. |
| 26 | Chi tiết truyện | Phân chia phần/tập cha-con dạng thư mục accordion (`PartName`) | `src/pages/StoryDetailPage.tsx:510-580` | `ChapterListItemDto.PartName`<br>`Models/Dtos/StoryDtos.cs:14` | Tất cả | `core/utils/chapter_grouping.dart`<br>`features/story_detail/story_detail_screen.dart:603-705` | **ĐỦ** | Tự động gom nhóm các chương có chung `partName` vào folder có thể đóng/mở. |
| 27 | Chi tiết truyện | Đánh dấu chương VIP / Khóa truy cập | `src/pages/StoryDetailPage.tsx:43-47` | `ChapterListItemDto.RequiresAccess`<br>`Models/Dtos/StoryDtos.cs:14` | Tất cả | `features/story_detail/story_detail_screen.dart:765-778` | **ĐỦ** | Hiển thị icon ổ khóa vàng cho các chương cần quyền VIP/mua truyện. |
| 28 | Chi tiết truyện | Đánh giá sao & Đăng bình luận truyện thật | `src/pages/StoryDetailPage.tsx:166-242, 600-850` | `POST /api/chapters/{chapterId}/discussions`<br>`Controllers/DiscussionsController.cs:40` | Người dùng đã đăng nhập | `data/models/story_review_model.dart`<br>`data/local/story_review_service.dart` | **ĐỦ (Tầng Data)** | Đã có model và service lưu trữ đánh giá local + tính sao trung bình. Giao diện form và danh sách review sẽ gắn vào Giai đoạn C. |
| **VI** | **TRÌNH ĐỌC CHƯƠNG (CHAPTER READER)** | | | | | | | |
| 29 | Trình đọc | Tải nội dung chương & ghi nhận tiến độ | `src/pages/ChapterReadPage.tsx:90` | `GET /api/chapters/{id}`<br>`Controllers/ChaptersController.cs:30` | Tùy chọn (403 nếu chương khóa) | `features/chapter_read/chapter_read_screen.dart:68`<br>`data/repositories/chapter_repository.dart` | **ĐỦ** | Backend tự ghi nhận `ReadingProgress` và tăng `ViewCount`. Xử lý lỗi 403 Forbidden chuẩn. |
| 30 | Trình đọc | Đọc truyện chữ (Novel Reader): Font, Cỡ chữ, 3 Theme màu | `src/pages/ChapterReadPage.tsx:22-33, 400-600` | Render text từ `ChapterContentDto.Content` | Tất cả | `features/chapter_read/novel_reader_view.dart`<br>`features/chapter_read/reader_settings_sheet.dart` | **ĐỦ** | Hỗ trợ 3 theme Sáng, Tối, Sepia; đổi font Serif/Sans; chỉnh cỡ chữ 14-28. |
| 31 | Trình đọc | Đọc truyện tranh (Comic Reader): Cuộn dọc Webtoon, Pinch-to-zoom | `src/pages/ChapterReadPage.tsx:350-390` | Render mảng `ChapterContentDto.ImageUrls` | Tất cả | `features/chapter_read/comic_reader_view.dart` | **ĐỦ** | `ListView.builder` cuộn dọc không ngắt quãng, `InteractiveViewer` zoom ảnh, placeholder skeleton. |
| 32 | Trình đọc | Chuyển chương Trước / Sau (Next/Prev) | `src/pages/ChapterReadPage.tsx:320-345` | Điều hướng theo `ChapterSequence` | Tất cả | `features/chapter_read/chapter_read_screen.dart:54-64`<br>`core/utils/chapter_sequence.dart` | **ĐỦ** | Thanh điều hướng nổi dưới chân trang, tự động khóa nút khi là chương đầu/cuối. |
| 33 | Trình đọc | Drawer chọn chương dạng thư mục accordion trong khi đọc | `src/pages/ChapterReadPage.tsx:270-310` | Sử dụng `groupChaptersByPart` | Tất cả | `features/chapter_read/chapter_navigation.dart` | **ĐỦ** | Modal bottom sheet chọn nhanh chương khác mà không cần quay lại trang chi tiết. |
| 34 | Trình đọc | Thảo luận chương: Xem danh sách bình luận | `src/pages/ChapterReadPage.tsx:92` | `GET /api/chapters/{chapterId}/discussions`<br>`Controllers/DiscussionsController.cs:27` | Tất cả (Công khai) | `features/chapter_read/chapter_discussions_sheet.dart:100-240` | **ĐỦ** | Hiển thị tên người dùng, thời gian và nội dung bình luận. |
| 35 | Trình đọc | Thảo luận chương: Gửi bình luận mới | `src/pages/ChapterReadPage.tsx:98-120` | `POST /api/chapters/{chapterId}/discussions`<br>`Controllers/DiscussionsController.cs:40` | Người dùng đã đăng nhập | `features/chapter_read/chapter_discussions_sheet.dart:50-80` | **ĐỦ** | Kiểm tra đăng nhập, ô nhập nội dung, xử lý lỗi tài khoản bị hạn chế (403). |
| 36 | Trình đọc | Khóa sao chép nội dung truyện chữ (Anti-copy) | `src/pages/ChapterReadPage.tsx:34, 450-480` | Client CSS/JS event + SkiaSharp backend | Tất cả | Mobile dùng `SelectableText` hoặc `Text` thường | **ĐỦ** | Mobile dùng `Text` thông thường (mặc định không cho bôi đen sao chép trên app). |
| 37 | Trình đọc | Hiệu ứng bối cảnh Atmospheric Reader (Hoa đào, Đom đóm, Mưa, Sao) | `src/components/AtmosphericOverlay.tsx`<br>`src/pages/ChapterReadPage.tsx:43-85` | Canvas animation client-side | Tất cả | Chưa có | **NGOÀI PHẠM VI (đề xuất)** | Tính năng giải trí/easter egg trên Web, hiệu ứng hạt có thể gây nóng máy/hao pin trên thiết bị di động tầm thấp. Đề xuất giữ ngoài phạm vi core app. |
| **VII** | **TỦ SÁCH, THEO DÕI & LỊCH SỬ (LIBRARY)** | | | | | | | |
| 38 | Tủ sách | Danh sách truyện đang theo dõi (Bookmarks) | `src/pages/FollowingPage.tsx:1-250` | `GET /api/profile/bookmarks`<br>`Controllers/ProfileController.cs:158` | Người dùng đã đăng nhập | `features/library/library_screen.dart:149-191` | **ĐỦ** | Hiển thị danh sách truyện user đã bookmark kèm số chương mới. |
| 39 | Tủ sách | Tìm kiếm, lọc và sắp xếp trong trang Theo Dõi | `src/pages/FollowingPage.tsx:45-75` | Lọc client-side trên kết quả API | Người dùng đã đăng nhập | `features/library/library_screen.dart` chưa có | **THIẾU** | Web có ô search trong tủ sách, lọc thể loại, lọc chữ/tranh, sắp xếp theo tên/view. Mobile hiển thị list thô. |
| 40 | Tủ sách | Nút Bỏ theo dõi trực tiếp trên từng truyện trong Tủ sách | `src/pages/FollowingPage.tsx:25-35` | `POST /api/stories/{id}/follow`<br>`Controllers/StoriesController.cs:121` | Người dùng đã đăng nhập | Mobile chưa có nút unfollow trực tiếp | **THIẾU** | Trên Web có nút icon bookmark bấm vào bỏ theo dõi ngay. Mobile phải vào chi tiết truyện mới bỏ theo dõi được. |
| 41 | Tủ sách | Danh sách lịch sử đọc truyện (Reading History) | `src/pages/HistoryPage.tsx:1-200` | `GET /api/profile/history`<br>`Controllers/ProfileController.cs:135` | Người dùng đã đăng nhập | `features/library/library_screen.dart:193-235` | **ĐỦ** | Hiển thị các truyện đã đọc gần nhất sắp xếp giảm dần theo thời gian. |
| 42 | Tủ sách | Danh sách truyện đã mua bản quyền (Purchased) | `src/pages/ProfilePage.tsx:51` | `GET /api/profile/purchased`<br>`Controllers/ProfileController.cs:181` | Người dùng đã đăng nhập | `features/library/library_screen.dart:237-279`<br>`features/profile/profile_screen.dart` | **ĐỦ** | Hiển thị danh sách truyện đã mua vĩnh viễn. |
| 43 | Tủ sách | Bộ nhớ đệm ngoại tuyến (Offline Reading Cache) | Web không hỗ trợ offline | Lưu trữ SQLite / SharedPreferences cục bộ | Tất cả | `data/local/reading_cache_service.dart` | **ĐỦ** | Điểm cộng riêng của Mobile: Lưu nội dung chương vào database cục bộ và xếp hàng gửi sync tiến độ khi có mạng. |
| **VIII** | **GÓI VIP & THANH TOÁN (PRICING & PAYMENTS)** | | | | | | | |
| 44 | Gói VIP | Lấy danh sách gói cước VIP từ API | `src/pages/PricingPage.tsx:50` | `GET /api/subscriptions/plans`<br>`Controllers/SubscriptionsController.cs:23` | Tất cả (Công khai) | `data/repositories/subscription_repository.dart`<br>`providers/subscription_provider.dart` | **ĐỦ (Tầng Data)** | Đã tạo `subscriptionPlansProvider` gọi API lấy danh sách gói thật từ server. UI sẽ nối trong Giai đoạn C. |
| 45 | Gói VIP | Khởi tạo giao dịch mua gói VIP | `src/pages/PricingPage.tsx:58-80` | `POST /api/payments/subscription/{planId}`<br>`Controllers/PaymentsController.cs:30` | Người dùng đã đăng nhập | `data/repositories/subscription_repository.dart` | **ĐỦ (Tầng Data)** | Đã có `buySubscription` trả về `transactionId` và `paymentUrl` chuẩn backend. |
| 46 | Gói VIP | Hiển thị mã QR thanh toán & Xác nhận mô phỏng tức thì | `src/pages/PricingPage.tsx:85-120, 240-340` | `POST /api/payments/callback?providerRef=...&success=true`<br>`Controllers/PaymentsController.cs:40` | Người dùng đã đăng nhập | `data/repositories/subscription_repository.dart` | **ĐỦ (Tầng Data)** | Đã có `simulatePaymentCallback` gọi `POST /api/payments/callback`. UI modal sẽ làm ở Giai đoạn C. |
| 47 | Gói VIP | Danh sách gói thuê bao của tôi (My Subscriptions) | `src/pages/ProfilePage.tsx` | `GET /api/subscriptions/me`<br>`Controllers/SubscriptionsController.cs:27` | Người dùng đã đăng nhập | `data/repositories/subscription_repository.dart` | **ĐỦ** | Đã có repository và parse model `MySubscriptionDto`. |
| **IX** | **HỒ SƠ & THIẾT LẬP (PROFILE & SETTINGS)** | | | | | | | |
| 48 | Hồ sơ | Xem thông tin tài khoản (Tên, Email, Vai trò, Hạn VIP) | `src/pages/ProfilePage.tsx:120-190` | `GET /api/profile/me`<br>`Controllers/ProfileController.cs:29` | Người dùng đã đăng nhập | `features/profile/profile_screen.dart:180-260` | **ĐỦ** | Hiển thị avatar chữ cái đầu, badge VIP/Admin, ngày tham gia, gói VIP hiện tại. |
| 49 | Hồ sơ | Cập nhật tên hiển thị | `src/pages/ProfilePage.tsx:20-23, 93-97` | `PUT /api/profile/me`<br>`Controllers/ProfileController.cs:72` | Người dùng đã đăng nhập | `features/profile/profile_screen.dart:26-155` | **ĐỦ** | Dialog chỉnh sửa tên hiển thị, validate tối đa 50 ký tự, cập nhật auth state. |
| 50 | Hồ sơ | Đổi mật khẩu tài khoản | `src/pages/ProfilePage.tsx:24-30, 99-113` | `POST /api/profile/change-password`<br>`Controllers/ProfileController.cs:99` | Người dùng đã đăng nhập | `features/profile/profile_screen.dart:360-480` | **ĐỦ** | Dialog nhập mật khẩu cũ, mật khẩu mới (>= 6 ký tự), xác nhận mật khẩu. |
| 51 | Thiết lập | Chuyển đổi giao diện Sáng / Tối (Dark / Light mode) | Web dùng Tailwind dark mode | Lưu trữ SharedPreferences cục bộ | Tất cả | `providers/theme_provider.dart`<br>`features/profile/profile_screen.dart` | **ĐỦ** | Toggle mượt mà giữa ThemeMode.light và ThemeMode.dark toàn app. |
| **X** | **THÔNG BÁO (NOTIFICATIONS)** | | | | | | | |
| 52 | Thông báo | Biểu tượng chuông thông báo & Số lượng chưa đọc (Badge) | `src/components/NotificationBell.tsx:23-45` | `GET /api/notifications/unread-count`<br>`Controllers/NotificationsController.cs:49` | Người dùng đã đăng nhập | `data/repositories/notification_repository.dart`<br>`providers/notification_provider.dart` | **ĐỦ (Tầng Data)** | Đã có `unreadNotificationCountProvider` và repository lấy số chưa đọc. UI gắn ở Giai đoạn C. |
| 53 | Thông báo | Danh sách thông báo người dùng | `src/components/NotificationBell.tsx:90-155` | `GET /api/notifications?page=1&pageSize=20`<br>`Controllers/NotificationsController.cs:24` | Người dùng đã đăng nhập | `data/repositories/notification_repository.dart`<br>`providers/notification_provider.dart` | **ĐỦ (Tầng Data)** | Đã có `notificationsListProvider` và repository lấy phân trang. UI danh sách ở Giai đoạn C. |
| 54 | Thông báo | Đánh dấu thông báo đã đọc | `src/components/NotificationBell.tsx:63-71` | `PUT /api/notifications/{id}/read`<br>`Controllers/NotificationsController.cs:56` | Người dùng đã đăng nhập | `data/repositories/notification_repository.dart`<br>`providers/notification_provider.dart` | **ĐỦ (Tầng Data)** | Đã có `markAsRead` và provider logic. UI xử lý ở Giai đoạn C. |
| 55 | Thông báo | Đánh dấu tất cả thông báo là đã đọc | `src/components/NotificationBell.tsx:46-50` | `PUT /api/notifications/read-all`<br>`Controllers/NotificationsController.cs:70` | Người dùng đã đăng nhập | `data/repositories/notification_repository.dart`<br>`providers/notification_provider.dart` | **ĐỦ (Tầng Data)** | Đã có `markAllAsRead` và provider logic. UI xử lý ở Giai đoạn C. |
| **XI** | **TÍNH NĂNG QUẢN TRỊ (ADMIN PORTAL)** *(Xem mục 3 bên dưới để duyệt phạm vi)* | | | | | | | |
| 56 | Quản trị | Admin Dashboard (Thống kê doanh thu, người dùng, lượt xem, tăng trưởng) | `src/pages/admin/DashboardPage.tsx` | `GET /api/admin/stats/overview`<br>`Controllers/AdminStatsController.cs:26` | Quản trị viên (`Admin`) | `features/admin/admin_dashboard_screen.dart` | **NGOÀI PHẠM VI (đề xuất)** | Mobile đã có code sơ bộ trong `lib/features/admin/`. Đề xuất: Giữ cho Admin kiểm tra nhanh hoặc ẩn khỏi app người đọc thông thường. |
| 57 | Quản trị | Admin Hoạt động & Giao dịch gần đây | `src/pages/admin/DashboardPage.tsx` | `GET /api/admin/stats/recent-transactions`<br>`GET /api/admin/stats/recent-activities`<br>`Controllers/AdminStatsController.cs:72, 98` | Quản trị viên (`Admin`) | `features/admin/admin_dashboard_screen.dart` | **NGOÀI PHẠM VI (đề xuất)** | Đã tích hợp gọi API trong mobile admin provider. Chờ duyệt. |
| 58 | Quản trị | Quản lý Truyện (Thêm, Sửa, Xóa truyện, Upload ảnh bìa) | `src/pages/AdminStoriesPage.tsx` | `POST/PUT/DELETE /api/stories`<br>`POST /api/stories/upload-cover`<br>`Controllers/StoriesController.cs:42, 50, 81, 89` | Quản trị viên (`Admin`) | `features/admin/admin_stories_screen.dart` | **NGOÀI PHẠM VI (đề xuất)** | Đã có màn hình quản lý truyện cơ bản trên mobile. Chờ duyệt. |
| 59 | Quản trị | Quản lý Chương (Thêm, Sửa, Xóa chương, Hỗ trợ PartName) | `src/pages/AdminStoriesPage.tsx` | `POST/PUT/DELETE /api/stories/{id}/chapters`<br>`Controllers/StoriesController.cs:97, 105, 113` | Quản trị viên (`Admin`) | `features/admin/admin_stories_screen.dart` | **NGOÀI PHẠM VI (đề xuất)** | Cần bổ sung nhập `partName` nếu tiếp tục hỗ trợ Admin trên mobile. Chờ duyệt. |
| 60 | Quản trị | Quản lý Thể loại (Thêm, Sửa, Xóa thể loại) | `src/pages/admin/AdminCategoriesPage.tsx` | `POST/PUT/DELETE /api/genres`<br>`Controllers/GenresController.cs:73, 101, 124` | Quản trị viên (`Admin`) | `features/admin/admin_categories_screen.dart` | **NGOÀI PHẠM VI (đề xuất)** | Đã có màn hình và test đầy đủ trong `admin_flows_test.dart`. Chờ duyệt. |
| 61 | Quản trị | Quản lý Người dùng (Xem danh sách, Khóa / Mở khóa tài khoản) | `src/pages/admin/AdminUsersPage.tsx` | `GET /api/admin/users`<br>`PUT /api/admin/users/{id}/toggle-restriction`<br>`Controllers/AdminUsersController.cs:26, 80` | Quản trị viên (`Admin`) | `features/admin/admin_users_screen.dart` | **NGOÀI PHẠM VI (đề xuất)** | Đã có màn hình và test trong `admin_flows_test.dart`. Chờ duyệt. |
| 62 | Quản trị | Quản lý Giao dịch (Duyệt bù giao dịch lỗi, Đánh dấu thất bại) | `src/pages/admin/AdminTransactionsPage.tsx` | `GET /api/admin/transactions`<br>`POST /api/admin/transactions/{id}/force-activate`<br>`POST /api/admin/transactions/{id}/mark-failed`<br>`Controllers/AdminTransactionsController.cs:25, 80, 94` | Quản trị viên (`Admin`) | `data/models/admin_model.dart`<br>`data/api/admin_api.dart`<br>`providers/admin_provider.dart` | **ĐỦ (Tầng Data)** | Đã hoàn thành DTOs, API client (force-activate, mark-failed), query provider và test. Màn hình `AdminTransactionsScreen` sẽ hoàn thiện ở Giai đoạn C theo Phương án 1. |
| **XII** | **TÍNH NĂNG EASTER EGG & NÂNG CAO** | | | | | | | |
| 63 | Easter Egg | Linh vật tương tác Mèo Jiji & Biến hình Totoro | `src/components/InteractiveMascot.tsx:1-470` | Client-side state | Tất cả | Chưa có trên mobile | **NGOÀI PHẠM VI (đề xuất)** | Tính năng giải trí Web tương tác bằng chuột/click. Đề xuất không đưa vào mobile để tránh rối màn hình cảm ứng nhỏ. |

---

## 3. DANH SÁCH CHỨC NĂNG DÀNH CHO VAI TRÒ QUẢN TRỊ / TÁC GIẢ & ĐỀ XUẤT PHẠM VI

Tuân thủ nghiêm ngặt **Quy tắc 7** của chỉ thị dự án: Không tự ý quyết định loại bỏ hay triển khai các chức năng dành cho vai trò quản trị/tác giả. Dưới đây là phân tích và câu hỏi xin ý kiến bạn đọc/Product Owner:

### Hiện trạng thực tế trong mã nguồn Mobile:
1. Nhóm phát triển trước đó **đã viết sẵn** các màn hình quản trị cơ bản trong `Storyreader_mobile/lib/features/admin/`:
   - `admin_layout_screen.dart`: Thanh điều hướng nội bộ Admin.
   - `admin_dashboard_screen.dart`: Biểu đồ thống kê, doanh thu, thành viên.
   - `admin_stories_screen.dart`: Danh sách truyện, form thêm/sửa truyện và chương.
   - `admin_categories_screen.dart`: Quản lý danh mục thể loại.
   - `admin_users_screen.dart`: Danh sách người dùng, nút khóa/mở khóa tài khoản.
   - Bộ test `test/admin_flows_test.dart` (23 tests) hiện đang pass 100%.
2. Phần Admin còn thiếu duy nhất: **Quản lý Giao dịch (`AdminTransactionsPage`)** bao gồm duyệt bù giao dịch (`force-activate`) và đánh dấu thất bại (`mark-failed`).

### Đề xuất lựa chọn:
- **Phương án 1 (Khuyên dùng)**: **Giữ lại các màn hình Admin đã có sẵn** (Dashboard, Truyện, Thể loại, Người dùng) để phục vụ chấm điểm đồ án CNPM (cho thấy tính toàn diện của đồ án), **bổ sung thêm màn hình Quản lý Giao dịch (`AdminTransactionsScreen`)** để đạt 100% parity với Web. Luồng này chỉ hiển thị khi tài khoản đăng nhập có `role == "Admin"`.
- **Phương án 2**: **Loại bỏ toàn bộ phần Admin khỏi Mobile**, chỉ tập trung 100% vào trải nghiệm người đọc (Reader App), các nghiệp vụ quản trị chuyển hoàn toàn sang Web Admin.

> ❓ **CÂU HỎI XIN Ý KIẾN BẠN**: Bạn muốn chọn **Phương án 1** (giữ và hoàn thiện nốt Quản lý Giao dịch cho Admin trên mobile) hay **Phương án 2** (đóng phạm vi Admin trên mobile, chỉ làm app người đọc)?

---

## 4. DANH SÁCH GIẢ ĐỊNH & RỦI RO KỸ THUẬT

### 4.1. Danh sách Giả định (Assumptions)
1. **Môi trường kết nối Backend**: Backend chạy tại máy chủ cục bộ hoặc qua Docker:
   - Android Emulator: `http://10.0.2.2:5066/api`.
   - Thiết bị thật (Real Device): Kết nối cùng mạng LAN WiFi với máy host `http://<IP_LAN>:5066/api`.
2. **Quy chế xác thực JWT**: Token có thời hạn 30 phút, chưa có Refresh Token. Mobile sẽ tự động xóa phiên và yêu cầu đăng nhập lại khi gặp HTTP 401.
3. **Cổng thanh toán điện tử**: Hệ thống thanh toán trong đồ án hiện sử dụng cơ chế Sandbox / Simulation (`simulatePaymentCallback` gọi `POST /api/payments/callback`). Mobile sẽ dựng giao diện mã QR kèm nút "Xác nhận đã thanh toán (Mô phỏng tức thì)" y hệt Web để kiểm thử end-to-end trọn vẹn mà không cần thẻ ngân hàng thật.
4. **Trình đọc truyện tranh**: Giả định danh sách ảnh trong `imageUrls` có định dạng hợp lệ, hỗ trợ giao thức HTTP/HTTPS hoặc đường dẫn tương đối `/uploads/...`.

### 4.2. Danh sách Rủi ro Kỹ thuật (Technical Risks)
1. **Tràn bộ nhớ khi đọc truyện tranh dài (OutOfMemory / RAM spike)**: Một chương truyện tranh có thể chứa 50 - 150 ảnh độ phân giải cao. Nếu load đồng loạt sẽ gây lag giật hoặc crash app.  
   *Giải pháp*: Sử dụng `ListView.builder` kết hợp `CachedNetworkImage` với giới hạn `memCacheWidth/memCacheHeight`.
2. **Xung đột trạng thái khi chuyển đổi Dark/Light mode**: Cần đảm bảo các widget màu nền (`AppColors`) và icon phản hồi nhất quán, không bị tình trạng chữ đen trên nền tối.
3. **Mất kết nối mạng khi ghi nhận tiến độ đọc**: Nếu người dùng đọc tiếp nhiều chương khi offline, tiến độ không được ghi nhận lên server.  
   *Giải pháp*: Đã có `ReadingCacheService` lưu hàng đợi offline và tự động sync lại khi phát hiện có mạng.

---

## 5. THỨ TỰ ƯU TIÊN TRIỂN KHAI CHO GIAI ĐOẠN B & C

Sau khi bạn duyệt bảng đối chiếu này, lộ trình triển khai chi tiết sẽ thực hiện theo 4 mức ưu tiên:

```
[P0: Tầng Dữ liệu & Endpoints cốt lõi]
  ├── Bổ sung `sortBy` vào StoryRepository & StoryApi
  ├── Xây dựng NotificationRepository & Provider (4 endpoint)
  ├── Chuyển SubscriptionRepository sang gọi API thực tế (/subscriptions/plans)
  ├── Bổ sung initiateStoryPurchase & simulatePaymentCallback vào PaymentRepository
  └── Viết Unit Test cho DTO parser & Repositories mới (Giai đoạn B)
       │
[P1: Màn hình Bảng Xếp Hạng & Trang Chủ]
  ├── Tạo màn hình Bảng Xếp Hạng (`RankingsScreen`) chuẩn Web với Top 3 Podium
  ├── Thêm route `/rankings` và `/bang-xep-hang` vào `app_router.dart`
  └── Điều hướng đúng từ nút "Xếp Hạng" trên header cam
       │
[P2: Hoàn thiện Chi tiết truyện & Thanh toán]
  ├── Bổ sung nút "Đọc mới nhất" trên `StoryDetailScreen`
  ├── Bổ sung nút "Mua truyện" + Modal mã QR thanh toán mô phỏng
  ├── Xây dựng khu vực "Đánh giá & Bình luận truyện" (1-5 sao) trên `StoryDetailScreen`
  └── Nâng cấp `PricingScreen`: hiển thị gói thật từ API + Modal thanh toán QR
       │
[P3: Chuông Thông Báo & Tủ Sách Nâng Cao]
  ├── Thêm `NotificationBell` vào `AppHeader` (hiển thị số chưa đọc, popup danh sách)
  ├── Bổ sung bộ lọc tìm kiếm/loại truyện/sắp xếp vào `LibraryScreen`
  ├── Bổ sung nút Bỏ theo dõi trực tiếp trên danh sách theo dõi
  └── (Tùy chọn theo duyệt) Hoàn thiện màn hình Admin Transactions nếu chọn Phương án 1
```

