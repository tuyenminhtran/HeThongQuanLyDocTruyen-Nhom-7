-- ========================================================
-- DỮ LIỆU MẪU ĐỒ ÁN NHÓM: HỆ THỐNG QUẢN LÝ ĐỌC TRUYỆN (STORYREADER)
-- Bài thực hành số 4: Tạo dữ liệu mẫu cho đồ án nhóm
-- Database: PostgreSQL (StoryReader)
-- ========================================================

-- 1. DANH MỤC THỂ LOẠI TRUYỆN (Genres)
INSERT INTO public."Genres" ("Id", "Name", "Slug", "Description") VALUES
('11111111-1111-1111-1111-111111110001', 'Manhwa', 'manhwa', 'Truyện tranh phong cách Hàn Quốc full màu, hành động, hầm ngục'),
('11111111-1111-1111-1111-111111110002', 'Manga', 'manga', 'Truyện tranh phong cách Nhật Bản kinh điển, phiêu lưu kỳ thú'),
('11111111-1111-1111-1111-111111110003', 'Tiên Hiệp', 'tien-hiep', 'Tu tiên, phi thăng, tầm đạo trường sinh, tranh đoạt thiên địa'),
('11111111-1111-1111-1111-111111110004', 'Kiếm Hiệp', 'kiem-hiep', 'Giang hồ nghĩa khí, ân oán tình thù, võ công cái thế'),
('11111111-1111-1111-1111-111111110005', 'Huyền Huyễn', 'huyen-huyen', 'Thế giới huyền bí, ma pháp, dị giới chuyển sinh, thức tỉnh dị năng'),
('11111111-1111-1111-1111-111111110006', 'Trinh Thám', 'trinh-tham', 'Phá án, suy luận logic, vụ án phòng kín ly kỳ nghẹt thở'),
('11111111-1111-1111-1111-111111110007', 'Kinh Dị', 'kinh-di', 'Rùng rợn, tâm linh, bí ẩn siêu nhiên, bóng tối rình rập'),
('11111111-1111-1111-1111-111111110008', 'Đô Thị', 'do-thi', 'Cuộc sống hiện đại, khởi nghiệp, tài phiệt, hào môn thế gia'),
('11111111-1111-1111-1111-111111110009', 'Khoa Huyễn', 'khoa-huyen', 'Tương lai cơ giáp, du hành vũ trụ, trí tuệ nhân tạo AI, hậu tận thế'),
('11111111-1111-1111-1111-111111110010', 'Võng Du', 'vong-du', 'Game thực tế ảo, cày cuốc phó bản, nâng cấp trang bị');

-- 2. GÓI ĐĂNG KÝ HỘI VIÊN VIP (SubscriptionPlans)
INSERT INTO public."SubscriptionPlans" ("Id", "Name", "Description", "DurationDays", "Price", "IsActive", "CreatedAt") VALUES
('22222222-2222-2222-2222-222222220001', 'Gói VIP Đồng (1 Tháng)', 'Đọc không giới hạn toàn bộ truyện chữ & truyện tranh trong 30 ngày', 30, 49000.00, true, NOW()),
('22222222-2222-2222-2222-222222220002', 'Gói VIP Bạc (3 Tháng)', 'Tiết kiệm 15%, quyền đọc ưu tiên toàn bộ kho truyện VIP trong 90 ngày', 90, 129000.00, true, NOW()),
('22222222-2222-2222-2222-222222220003', 'Gói VIP Vàng (1 Năm)', 'Đặc quyền tối cao: Đọc trọn gói không giới hạn trong 365 ngày + Huy hiệu VIP hoàng gia', 365, 499000.00, true, NOW());

-- 3. DANH SÁCH BỘ TRUYỆN MẪU (Stories)
INSERT INTO public."Stories" ("Id", "Title", "CoverImageUrl", "Description", "AuthorName", "StoryType", "AccessPolicy", "Price", "FreeChapterCount", "ViewCount", "CreatedAt", "UpdatedAt") VALUES
('33333333-3333-3333-3333-333333330001', 'Solo Leveling - Tôi Thăng Cấp Một Mình', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', 'Sung Jin-Woo từ thợ săn hạng E yếu ớt nhất thế giới, sau khi sống sót khỏi Hầm Ngục Kép đã thức tỉnh Hệ Thống độc nhất vô nhị, mở ra hành trình trở thành Hoàng Đế Bóng Tối.', 'Chugong', 1, 1, 69000.00, 5, 12580, NOW() - INTERVAL '60 days', NOW()),
('33333333-3333-3333-3333-333333330002', 'Đấu Phá Thương Khung', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800', 'Nơi đây không có ma pháp diễm lệ, chỉ có Đấu Khí phồn thịnh tới đỉnh phong. Tiêu Viêm - thiên tài một thời bỗng nhiên mất đi tu vi, trải qua bao lời chế giễu quyết tâm bước lên đỉnh đại lục.', 'Thiên Tàm Thổ Đậu', 0, 0, NULL, 0, 9420, NOW() - INTERVAL '50 days', NOW()),
('33333333-3333-3333-3333-333333330003', 'Toàn Trí Độc Giả (Omniscient Reader)', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800', 'Kim Dokja là người duy nhất đọc đến chương cuối của một bộ tiểu thuyết dài 3149 chương. Khi thế giới thực biến thành thế giới trong truyện, anh nắm giữ chìa khóa định đoạt kết cục của nhân loại.', 'Sing Shong', 0, 1, 79000.00, 10, 8760, NOW() - INTERVAL '40 days', NOW()),
('33333333-3333-3333-3333-333333330004', 'Vụ Án Căn Nhà Kính', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800', 'Thám tử tư Đặng Minh Vũ nhận lời điều tra cái chết bí ẩn của một nhà sưu tầm cổ vật giàu có trong căn phòng kính khóa kín từ bên trong. Một vụ án phòng kín cổ điển đầy nút thắt bất ngờ.', 'Lam Việt Khanh', 0, 0, NULL, 0, 4310, NOW() - INTERVAL '30 days', NOW()),
('33333333-3333-3333-3333-333333330005', 'Tuyết Rơi Ở Hậu Sơn', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800', 'Lâm Viễn kiếp trước là đệ nhất đao khách, bị phản bội mà chết. Trọng sinh về năm 15 tuổi làm tạp dịch quét sân tại Thanh Phong Kiếm Phái, hắn chỉ muốn sống bình yên nhưng sóng gió giang hồ không buông tha.', 'Vô Danh', 0, 1, 35000.00, 3, 3120, NOW() - INTERVAL '20 days', NOW());

-- 4. LIÊN KẾT TRUYỆN VỚI THỂ LOẠI (StoryGenres)
INSERT INTO public."StoryGenres" ("StoryId", "GenreId") VALUES
('33333333-3333-3333-3333-333333330001', '11111111-1111-1111-1111-111111110001'), -- Solo Leveling: Manhwa
('33333333-3333-3333-3333-333333330001', '11111111-1111-1111-1111-111111110005'), -- Solo Leveling: Huyền huyễn
('33333333-3333-3333-3333-333333330002', '11111111-1111-1111-1111-111111110003'), -- Đấu Phá: Tiên hiệp
('33333333-3333-3333-3333-333333330002', '11111111-1111-1111-1111-111111110005'), -- Đấu Phá: Huyền huyễn
('33333333-3333-3333-3333-333333330003', '11111111-1111-1111-1111-111111110005'), -- Toàn Trí Độc Giả: Huyền huyễn
('33333333-3333-3333-3333-333333330004', '11111111-1111-1111-1111-111111110006'), -- Vụ Án: Trinh thám
('33333333-3333-3333-3333-333333330005', '11111111-1111-1111-1111-111111110004'); -- Hậu Sơn: Kiếm hiệp

-- 5. DANH SÁCH CHƯƠNG TRUYỆN MẪU (Chapters)
INSERT INTO public."Chapters" ("Id", "StoryId", "ChapterNumber", "Title", "Content", "WordCount", "ViewCount", "CreatedAt", "UpdatedAt") VALUES
('44444444-4444-4444-4444-444444440001', '33333333-3333-3333-3333-333333330001', 1, 'Chương 1: Thợ săn hạng E', 'Sung Jin-Woo nhìn vào vết sẹo dài trên vai, tiếng thở dài hòa vào làn gió lạnh trước cửa hầm ngục D-Rank...', 1850, 4520, NOW() - INTERVAL '59 days', NOW()),
('44444444-4444-4444-4444-444444440002', '33333333-3333-3333-3333-333333330001', 2, 'Chương 2: Hầm Ngục Kép', 'Cánh cửa đá khổng lồ phát ra âm thanh ầm ầm khi khép lại. Bức tượng đá khổng lồ đột nhiên mở mắt rực đỏ...', 2140, 3980, NOW() - INTERVAL '58 days', NOW()),
('44444444-4444-4444-4444-444444440003', '33333333-3333-3333-3333-333333330002', 1, 'Chương 1: Vẫn Lạc Chi Điên', 'Đoạn Khí Lực: Tam đoạn! Nhìn vào bốn chữ to lớn sáng chói trên bia đá, thiếu niên Tiêu Viêm nắm chặt nắm đấm...', 2450, 3100, NOW() - INTERVAL '49 days', NOW()),
('44444444-4444-4444-4444-444444440004', '33333333-3333-3333-3333-333333330004', 1, 'Chương 1: Bức Thư Mời Nửa Đêm', 'Mưa rơi lộp độp trên mái tôn văn phòng thám tử nằm khuất trong hẻm nhỏ. Đặng Minh Vũ châm điếu thuốc nhìn vào hồ sơ...', 1950, 1620, NOW() - INTERVAL '29 days', NOW());

-- 6. THẢO LUẬN & BÌNH LUẬN MẪU (Discussions)
INSERT INTO public."Discussions" ("Id", "StoryId", "ChapterId", "UserId", "Content", "LikeCount", "CreatedAt") VALUES
('55555555-5555-5555-5555-555555550001', '33333333-3333-3333-3333-333333330001', '44444444-4444-4444-4444-444444440001', '11111111-0000-0000-0000-000000000002', 'Đọc lại từ đầu vẫn thấy cuốn hút dã man! Đoạn hầm ngục kép nghẹt thở từng giây.', 18, NOW() - INTERVAL '10 days'),
('55555555-5555-5555-5555-555555550002', '33333333-3333-3333-3333-333333330002', '44444444-4444-4444-4444-444444440003', '11111111-0000-0000-0000-000000000001', 'Ba mươi năm Hà Đông, ba mươi năm Hà Tây, đừng khinh thiếu niên nghèo! Câu thoại kinh điển.', 25, NOW() - INTERVAL '8 days');
