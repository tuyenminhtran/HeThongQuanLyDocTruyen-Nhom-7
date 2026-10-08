BEGIN;
SET client_encoding = 'UTF8';

-- Genres
INSERT INTO "Genres" ("Id", "Name") VALUES
  ('a1000000-0000-0000-0000-000000000001', 'Tiên Hiệp'),
  ('a1000000-0000-0000-0000-000000000002', 'Kiếm Hiệp'),
  ('a1000000-0000-0000-0000-000000000003', 'Huyền Huyễn'),
  ('a1000000-0000-0000-0000-000000000004', 'Đô Thị'),
  ('a1000000-0000-0000-0000-000000000005', 'Khoa Huyễn'),
  ('a1000000-0000-0000-0000-000000000006', 'Ngôn Tình'),
  ('a1000000-0000-0000-0000-000000000007', 'Xuyên Không'),
  ('a1000000-0000-0000-0000-000000000008', 'Võng Du'),
  ('a1000000-0000-0000-0000-000000000009', 'Dị Năng'),
  ('a1000000-0000-0000-0000-000000000010', 'Trinh Thám')
ON CONFLICT ("Id") DO NOTHING;

-- Stories
INSERT INTO "Stories" ("Id", "Title", "Author", "Description", "CoverImageUrl", "Status", "AccessPolicy", "Price", "FreeChapterCount", "ViewCount", "CreatedAt", "UpdatedAt") VALUES
  ('b1000000-0000-0000-0000-000000000001', 'Phàm Nhân Tu Tiên', 'Vong Ngữ', 'Một thiếu niên bình thường xuất thân bần hàn nơi thôn dã, tình cờ bước vào con đường tu tiên đầy hiểm hóc. Không có thiên tư tuyệt đỉnh, không có gia thế hiển hách, chỉ dựa vào một chiếc bình nhỏ thần bí và tâm tính kiên định, Hàn Lập từng bước bước lên đỉnh cao tiên đạo.', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop', 1, 0, NULL, 0, 15820, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000002', 'Đấu Phá Thương Khung', 'Thiên Tằm Thổ Đậu', 'Đây là một thế giới thuộc về Đấu Khí, không có ma pháp hoa lệ, chỉ có đấu khí đã phồn thịnh tới đỉnh cao! Tiêu Viêm - thiên tài từng rơi xuống vực thẳm phế vật, chịu đủ mọi khinh nhục, đã thức tỉnh cùng Dược Lão và ngọn lửa Dị Hỏa truyền kỳ.', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=600&auto=format&fit=crop', 1, 2, 49000.00, 2, 28940, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000003', 'Toàn Chức Cao Thủ', 'Hồ Điệp Lam', 'Diệp Tu – tuyển thủ đẳng cấp sách giáo khoa trong tựa game thể thao điện tử Vinh Quang, bị câu lạc bộ ruồng bỏ và trục xuất. Rời khỏi chiến đội, anh làm quản lý ca đêm tại một quán net nhỏ và bắt đầu hành trình trở lại đỉnh vinh quang.', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=600&auto=format&fit=crop', 1, 0, NULL, 0, 19200, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000004', 'Quỷ Bí Chi Chủ', 'Mực Thích Lặn Nước', 'Trong làn sóng máy hơi nước và kỹ nghệ ma pháp, Chu Minh Thụy tỉnh dậy trong thân phận Klein Moretti giữa một thế giới Victoria đầy sương mù, giáo hội và những cấm kỵ thần bí. Từng bước khám phá chuỗi ma dược và bí mật của các Chân Thần.', 'https://images.unsplash.com/photo-1519791883288-dc8bd696e667?q=80&w=600&auto=format&fit=crop', 0, 2, 69000.00, 2, 34500, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000005', 'Từng Có Người Yêu Tôi Như Sinh Mệnh', 'Thư Nghi', 'Câu chuyện tình yêu đầy khắc khoải và nước mắt nơi xứ người giữa Tôn Gia Ngộ và Triệu Mai. Một tình yêu chân thành, mãnh liệt giữa bão táp giông gió cuộc đời, để lại dư âm không thể nào quên.', 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=600&auto=format&fit=crop', 1, 1, 29000.00, 0, 11400, NOW(), NOW()),
  ('b1000000-0000-0000-0000-000000000006', 'Vạn Cổ Thần Đế', 'Phi Thiên Ngư', 'Tám trăm năm trước, Trương Nhược Trần, nhi tử duy nhất của Minh Đế, bị thanh mai trúc mã là Trì Dao công chúa sát hại. Tám trăm năm sau, hắn tái sinh trong thân xác một thiếu niên yếu nhược, phát hiện kẻ thù xưa nay đã thành nữ hoàng thống trị thiên hạ.', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop', 0, 0, NULL, 0, 8930, NOW(), NOW())
ON CONFLICT ("Id") DO NOTHING;

-- StoryGenres
INSERT INTO "StoryGenres" ("StoryId", "GenreId") VALUES
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001'),
  ('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000009'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000008'),
  ('b1000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000004'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000005'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000007'),
  ('b1000000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000010'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000006'),
  ('b1000000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000004'),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000003'),
  ('b1000000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000007')
ON CONFLICT ("StoryId", "GenreId") DO NOTHING;

-- Chapters
INSERT INTO "Chapters" ("Id", "StoryId", "ChapterNumber", "Title", "Content", "PublishAt", "ViewCount", "CreatedAt", "UpdatedAt") VALUES
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 1, 'Chương 1: Sơn thôn thiếu niên', 'Mặt trời lặn về tây, ráng chiều màu đỏ máu nhuộm đỏ cả nửa bầu trời phía chân trời, ánh tà dương chiếu rọi trên sườn núi nhỏ phía tây thôn Thanh Ngưu.

Nơi đó có một thiếu niên da dẻ ngăm đen khoảng chừng mười tuổi, đang nằm ngửa trên bãi cỏ, ngậm trong miệng một cọng cỏ đuôi gà, mắt chăm chú nhìn những áng mây đủ màu sắc trên không trung.

Thiếu niên tên là Hàn Lập, cái tên này là do phụ thân nhờ một vị tiên sinh dạy học trong thôn láng giềng lấy giúp với giá hai quả trứng gà...', NOW(), 3200, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 2, 'Chương 2: Thất Huyền Môn', 'Xe ngựa xóc nảy suốt ba ngày ba đêm trên con đường đất gập ghềnh, cuối cùng dừng lại dưới chân một ngọn núi cao chót vót mây mù bao phủ.

"Đến rồi, nơi này chính là Thất Huyền Môn!" Tam thúc nhìn Hàn Lập dặn dò cẩn thận trước khi bước vào bài khảo hạch bạch ngọc thạch...', NOW(), 2850, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 3, 'Chương 3: Chiếc bình nhỏ thần bí', 'Đêm khuya, ánh trăng vằng vặc chiếu qua khe cửa sổ của căn nhà gỗ nhỏ nơi Thần Thủ Cốc. Hàn Lập ngồi xếp bằng trên giường gỗ, trong tay nâng niu một chiếc bình nhỏ bằng ngọc xanh thần kỳ...', NOW(), 3120, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 1, 'Chương 1: Phế vật Tiêu gia', '"Đấu Lực: Tam đoạn! Cấp bậc: Cấp thấp!"

Nhìn vào hàng chữ to màu vàng kim hiển thị trên thạch bia ma thạch, thiếu niên không biểu cảm, khóe môi khẽ nhếch lên một nụ cười tự giễu, hai bàn tay nắm chặt giấu trong tay áo...', NOW(), 5400, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000002', 2, 'Chương 2: Đấu Khí Đại Lục', 'Đấu Khí Đại Lục, một thế giới mênh mông vô tận. Nơi đây không có ma pháp kỳ ảo, mà chỉ tôn sùng một thứ sức mạnh duy nhất: Đấu Khí!...', NOW(), 4980, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000002', 3, 'Chương 3: Hôn ước và Dược Lão', 'Trong phòng khách Tiêu gia hôm nay không khí ngột ngạt dị thường. Khách quý từ Vân Lam Tông danh chấn Gia Mã Đế Quốc - Nạp Lan Yên Nhiên đã đến...

"Ba mươi năm Hà Đông, ba mươi năm Hà Tây, đừng khinh thiếu niên nghèo!"', NOW(), 5620, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000007', 'b1000000-0000-0000-0000-000000000004', 1, 'Chương 1: Máu và mặt trăng đỏ', 'Cơn đau nhức dữ dội như muốn xé toạc màng óc. Chu Minh Thụy cảm thấy như vừa bị một chiếc búa tạ giáng thẳng vào thái dương...', NOW(), 6100, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000008', 'b1000000-0000-0000-0000-000000000004', 2, 'Chương 2: Ma Dược Chi Đạo', 'Klein Moretti - đây là thân phận mới của hắn, một sinh viên vừa tốt nghiệp khoa Lịch sử của Đại học Khoy...', NOW(), 5890, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000009', 'b1000000-0000-0000-0000-000000000003', 1, 'Chương 1: Trục xuất khỏi chiến đội', '"Ký tên vào đây đi, Diệp Tu." Đào Hiên đẩy bản thỏa thuận thanh lý hợp đồng sang phía đối diện chiếc bàn kính...', NOW(), 4300, NOW(), NOW()),
  ('c1000000-0000-0000-0000-000000000010', 'b1000000-0000-0000-0000-000000000003', 2, 'Chương 2: Quán Net Hưng Hân', 'Băng qua con đường đối diện trụ sở Gia Thế, Diệp Tu bước vào quán net Hưng Hân ấm áp rực rỡ ánh đèn...', NOW(), 4100, NOW(), NOW())
ON CONFLICT ("Id") DO NOTHING;

COMMIT;
