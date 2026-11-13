-- ========================================================
-- DỮ LIỆU MẪU ĐỒ ÁN NHÓM: HỆ THỐNG QUẢN LÝ ĐỌC TRUYỆN (STORYREADER)
-- Tương thích lược đồ PostgreSQL 16 thực tế (EF Core Migrations)
-- ========================================================

-- 1. DANH MỤC THỂ LOẠI TRUYỆN (Genres)
INSERT INTO public."Genres" ("Id", "Name") VALUES
('11111111-1111-1111-1111-111111110001', 'Manhwa'),
('11111111-1111-1111-1111-111111110002', 'Manga'),
('11111111-1111-1111-1111-111111110003', 'Tiên Hiệp'),
('11111111-1111-1111-1111-111111110004', 'Kiếm Hiệp'),
('11111111-1111-1111-1111-111111110005', 'Huyền Huyễn'),
('11111111-1111-1111-1111-111111110006', 'Trinh Thám'),
('11111111-1111-1111-1111-111111110007', 'Kinh Dị'),
('11111111-1111-1111-1111-111111110008', 'Đô Thị'),
('11111111-1111-1111-1111-111111110009', 'Khoa Huyễn'),
('11111111-1111-1111-1111-111111110010', 'Võng Du')
ON CONFLICT ("Id") DO NOTHING;

-- 2. GÓI ĐĂNG KÝ HỘI VIÊN VIP (SubscriptionPlans)
INSERT INTO public."SubscriptionPlans" ("Id", "Name", "Price", "DurationDays", "Scope", "IsActive") VALUES
('22222222-2222-2222-2222-222222220001', 'Gói VIP Đồng (1 Tháng)', 49000.00, 30, 'Đọc không giới hạn toàn bộ truyện chữ & truyện tranh trong 30 ngày', true),
('22222222-2222-2222-2222-222222220002', 'Gói VIP Bạc (3 Tháng)', 129000.00, 90, 'Tiết kiệm 15%, quyền đọc ưu tiên toàn bộ kho truyện VIP trong 90 ngày', true),
('22222222-2222-2222-2222-222222220003', 'Gói VIP Vàng (1 Năm)', 499000.00, 365, 'Đặc quyền tối cao: Đọc trọn gói không giới hạn trong 365 ngày', true)
ON CONFLICT ("Id") DO NOTHING;

-- 3. DANH SÁCH BỘ TRUYỆN MẪU (Stories)
-- Status: 0 = Ongoing, 1 = Completed | AccessPolicy: 0 = Free, 1 = Paid, 2 = Mixed | Type: 0 = Novel, 1 = Comic
INSERT INTO public."Stories" ("Id", "Title", "CoverImageUrl", "Description", "Author", "Status", "AccessPolicy", "Price", "FreeChapterCount", "ViewCount", "CreatedAt", "UpdatedAt", "Type") VALUES
('33333333-3333-3333-3333-333333330001', 'Solo Leveling - Tôi Thăng Cấp Một Mình', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800', 'Sung Jin-Woo từ thợ săn hạng E yếu ớt nhất thế giới, sau khi sống sót khỏi Hầm Ngục Kép đã thức tỉnh Hệ Thống độc nhất vô nhị, mở ra hành trình trở thành Hoàng Đế Bóng Tối.', 'Chugong', 0, 2, 69000.00, 5, 12580, NOW() - INTERVAL '60 days', NOW(), 1),
('33333333-3333-3333-3333-333333330002', 'Đấu Phá Thương Khung', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800', 'Nơi đây không có ma pháp diễm lệ, chỉ có Đấu Khí phồn thịnh tới đỉnh phong. Tiêu Viêm - thiên tài một thời bỗng nhiên mất đi tu vi, trải qua bao lời chế giễu quyết tâm bước lên đỉnh đại lục.', 'Thiên Tàm Thổ Đậu', 0, 0, NULL, 0, 9420, NOW() - INTERVAL '50 days', NOW(), 0),
('33333333-3333-3333-3333-333333330003', 'Toàn Trí Độc Giả (Omniscient Reader)', 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800', 'Kim Dokja là người duy nhất đọc đến chương cuối của một bộ tiểu thuyết dài 3149 chương. Khi thế giới thực biến thành thế giới trong truyện, anh nắm giữ chìa khóa định đoạt kết cục của nhân loại.', 'Sing Shong', 0, 2, 79000.00, 10, 8760, NOW() - INTERVAL '40 days', NOW(), 0),
('33333333-3333-3333-3333-333333330004', 'Vụ Án Căn Nhà Kính', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800', 'Thám tử tư Đặng Minh Vũ nhận lời điều tra cái chết bí ẩn của một nhà sưu tầm cổ vật giàu có trong căn phòng kính khóa kín từ bên trong. Một vụ án phòng kín cổ điển đầy nút thắt bất ngờ.', 'Lam Việt Khanh', 1, 0, NULL, 0, 4310, NOW() - INTERVAL '30 days', NOW(), 0),
('33333333-3333-3333-3333-333333330005', 'Tuyết Rơi Ở Hậu Sơn', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800', 'Lâm Viễn kiếp trước là đệ nhất đao khách, bị phản bội mà chết. Trọng sinh về năm 15 tuổi làm tạp dịch quét sân tại Thanh Phong Kiếm Phái, hắn chỉ muốn sống bình yên nhưng sóng gió giang hồ không buông tha.', 'Vô Danh', 0, 1, 35000.00, 3, 3120, NOW() - INTERVAL '20 days', NOW(), 0)
ON CONFLICT ("Id") DO NOTHING;

-- 4. LIÊN KẾT TRUYỆN VỚI THỂ LOẠI (StoryGenres)
INSERT INTO public."StoryGenres" ("StoryId", "GenreId") VALUES
('33333333-3333-3333-3333-333333330001', '11111111-1111-1111-1111-111111110001'),
('33333333-3333-3333-3333-333333330001', '11111111-1111-1111-1111-111111110005'),
('33333333-3333-3333-3333-333333330002', '11111111-1111-1111-1111-111111110003'),
('33333333-3333-3333-3333-333333330002', '11111111-1111-1111-1111-111111110005'),
('33333333-3333-3333-3333-333333330003', '11111111-1111-1111-1111-111111110005'),
('33333333-3333-3333-3333-333333330004', '11111111-1111-1111-1111-111111110006'),
('33333333-3333-3333-3333-333333330005', '11111111-1111-1111-1111-111111110004')
ON CONFLICT ("StoryId", "GenreId") DO NOTHING;

-- 5. DANH SÁCH CHƯƠNG TRUYỆN MẪU (Chapters)
INSERT INTO public."Chapters" ("Id", "StoryId", "PartName", "ChapterNumber", "Title", "Content", "PublishAt", "ViewCount", "CreatedAt", "UpdatedAt") VALUES
('44444444-4444-4444-4444-444444440001', '33333333-3333-3333-3333-333333330001', 'Tập 1', 1, 'Chương 1: Thợ săn hạng E', E'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1000&q=80\nhttps://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&q=80', NOW() - INTERVAL '59 days', 4520, NOW() - INTERVAL '59 days', NOW()),
('44444444-4444-4444-4444-444444440002', '33333333-3333-3333-3333-333333330001', 'Tập 1', 2, 'Chương 2: Hầm Ngục Kép', E'https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&q=80\nhttps://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=1000&q=80', NOW() - INTERVAL '58 days', 3980, NOW() - INTERVAL '58 days', NOW()),
('44444444-4444-4444-4444-444444440003', '33333333-3333-3333-3333-333333330002', 'Quyển 1', 1, 'Chương 1: Vẫn Lạc Chi Điên', 'Đấu Khí Lực: Tam đoạn! Nhìn vào bốn chữ to lớn sáng chói trên bia đá, thiếu niên Tiêu Viêm nắm chặt nắm đấm...', NOW() - INTERVAL '49 days', 3100, NOW() - INTERVAL '49 days', NOW()),
('44444444-4444-4444-4444-444444440004', '33333333-3333-3333-3333-333333330004', 'Phần Mở Đầu', 1, 'Chương 1: Bức Thư Mời Nửa Đêm', 'Mưa rơi lộp độp trên mái tôn văn phòng thám tử nằm khuất trong hẻm nhỏ. Đặng Minh Vũ châm điếu thuốc nhìn vào hồ sơ...', NOW() - INTERVAL '29 days', 1620, NOW() - INTERVAL '29 days', NOW())
ON CONFLICT ("Id") DO NOTHING;

-- 6. BÌNH LUẬN MẪU (Discussions) — Chỉ chèn nếu tồn tại tài khoản seed tương ứng
INSERT INTO public."Discussions" ("Id", "ChapterId", "UserId", "Content", "Status", "ReportCount", "CreatedAt")
SELECT '55555555-5555-5555-5555-555555550001', '44444444-4444-4444-4444-444444440001', u."Id", 'Đọc lại từ đầu vẫn thấy cuốn hút dã man! Đoạn hầm ngục kép nghẹt thở từng giây.', 0, 0, NOW() - INTERVAL '10 days'
FROM public."AspNetUsers" u WHERE u."Email" = 'reader@storyreader.vn'
ON CONFLICT ("Id") DO NOTHING;

INSERT INTO public."Discussions" ("Id", "ChapterId", "UserId", "Content", "Status", "ReportCount", "CreatedAt")
SELECT '55555555-5555-5555-5555-555555550002', '44444444-4444-4444-4444-444444440003', u."Id", 'Ba mươi năm Hà Đông, ba mươi năm Hà Tây, đừng khinh thiếu niên nghèo! Câu thoại kinh điển.', 0, 0, NOW() - INTERVAL '8 days'
FROM public."AspNetUsers" u WHERE u."Email" = 'admin@storynest.local'
ON CONFLICT ("Id") DO NOTHING;
