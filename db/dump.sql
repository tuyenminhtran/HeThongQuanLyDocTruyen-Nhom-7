--
-- PostgreSQL database dump
--

\restrict 7lVBiYgTutgi1Ax3oCUJ1aOOz4nk6nPXvGt4ZS93k5SMsxbCYejOcshzIlWgu2K

-- Dumped from database version 16.14 (Debian 16.14-1.pgdg13+1)
-- Dumped by pg_dump version 16.14 (Debian 16.14-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: Stories; Type: TABLE DATA; Schema: public; Owner: storynest
--

INSERT INTO public."Stories" VALUES ('370360cd-9bb4-4f59-be6b-83b0c1065b43', 'Đấu Phá Thương Khung', 'https://example.com/cover.jpg', 'Một thiếu niên bị phế bỏ tu vi, quyết tâm trở lại đỉnh cao.', 'Thiên Tàm Thổ Đậu', 0, 1, 50000.00, 3, 0, '2026-09-17 04:30:22.58826+00', '2026-09-17 04:30:38.46602+00');
INSERT INTO public."Stories" VALUES ('e96c496b-3d46-480c-a50e-15f90c1f5bd5', 'Vụ Án Căn Nhà Kính', 'https://m.media-amazon.com/images/S/compressed.photo.goodreads.com/books/1748162812i/222900966.jpg', 'Thể loại: Trinh thám / Suy luận 
Mô tả: Thám tử tư Đặng Minh Vũ được mời đến điều tra cái chết bí ẩn của một nhà sưu tầm cổ vật giàu có trong căn biệt thự có phòng kính khóa kín từ bên trong. Một vụ án "phòng kín" cổ điển, đầy những manh mối tưởng chừng vô lý nhưng lại dẫn đến sự thật không ai ngờ tới.', 'Lam Việt Khanh', 0, 0, NULL, 0, 0, '2026-09-24 09:03:28.36983+00', '2026-09-24 09:04:30.313014+00');
INSERT INTO public."Stories" VALUES ('45e279ea-716a-4406-8247-f2743989e3d2', 'Hồ Sơ Của Phạm Duy Trí', '', 'Thể loại: Trinh thám / Suy luận cổ điển
Mô tả: Sài Gòn năm 1930. Bác sĩ Trần Hữu Nghĩa, vừa giải ngũ, tình cờ trở thành bạn đồng hành và người ghi chép cho Phạm Duy Trí — nhà suy luận lập dị nhưng thiên tài, người có thể đọc ra cả một cuộc đời chỉ qua đôi giày hay vết mực trên tay áo. Cùng nhau, họ bước vào thế giới của những vụ án tưởng chừng không có lời giải.', 'Lam Việt Khanh', 0, 0, NULL, 0, 0, '2026-09-24 09:14:57.23098+00', '2026-09-24 09:15:55.631201+00');
INSERT INTO public."Stories" VALUES ('28fc7829-ee61-425b-824e-6aea1fde7343', 'Tuyết Rơi Ở Hậu Sơn', 'https://i.pinimg.com/1200x/ea/47/11/ea47113da6a190e0cf32c488069993cf.jpg', 'Lâm Viễn chết trong một vũng nước mưa loãng ở xó chợ.
Kiếp trước, hắn là đệ nhất cao thủ, cầm đao ba mươi năm, nếm đủ vị của phản bội và chém giết, để rồi cuối cùng chết vì một vết thương ở đùi bị nhiễm trùng. Nực cười.
Kiếp này, hắn mở mắt ở năm mười lăm tuổi, trong thân xác một tạp dịch quét sân ở Hậu Sơn của Thanh Phong Kiếm Phái. Tay trắng bệch, không nội công, không kiếm pháp, chỉ có một đôi giày vải đã rách gót và nỗi sợ lạnh ngấm vào tận xương.
Hắn quyết định sống khác. Không tranh danh đoạt lợi, không báo ân trả thù, không dính dáng đến giang hồ. Chỉ muốn ăn no, ngủ ấm, nhặt củi cho xong việc rồi về phòng.
Nhưng giang hồ không để ai yên.
Và những vệt máu cũ từ kiếp trước, hình như vẫn chưa kịp khô.', 'Vô Danh', 0, 0, NULL, 0, 0, '2026-10-01 09:03:23.917453+00', '2026-10-01 09:18:10.052502+00');
INSERT INTO public."Stories" VALUES ('d494a899-66b6-4a98-82b2-c8a2662f60a2', 'Cuốn Phim Chờ Nắng', 'https://image.qwenlm.ai/public_source/5cc8a0a3-f1ee-43e9-b44d-4a52db668b9d/2ea352693-77c8-478e-a05d-957a08dd14043325.png', 'Nam là kiểu học sinh tồn tại trong lớp như bóng đèn hành lang giờ ra chơi: có đó, nhưng chẳng ai nhớ mặt. Cậu trốn trực nhật, để tin nhắn nhóm tổ ở chế độ đã đọc, và giấu mình trong phòng tối rửa ảnh cuối dãy C, cùng ổ bánh mì nguội và mùi thuốc tráng phim.
Một chiều mưa tháng Mười, cửa phòng tối mở ra không một tiếng gõ. Miên — ướt sũng, ôm khư khư cuộn phim bị ngâm nước "từ hồi hè" — nói nhanh, chớp mắt liên tục, và để lại một viên kẹo dâu làm tin.
Ba ngày chờ phim khô. Ba ngày để một đứa chưa bao giờ đếm thứ trong tuần bắt đầu đếm.
Dưới ánh đèn đỏ, dải phim chưa hiện lên hình gì cả. Cậu tự nhủ đó chỉ là một cuộn phim. Còn ba ngày nữa mới đến thứ Năm.
', 'Mộc Miên', 0, 0, NULL, 0, 0, '2026-10-01 09:30:14.561848+00', '2026-10-01 09:42:57.461148+00');


--
-- Data for Name: Chapters; Type: TABLE DATA; Schema: public; Owner: storynest
--

INSERT INTO public."Chapters" VALUES ('5fa381ce-1ab7-4627-b37f-d1866740467b', '370360cd-9bb4-4f59-be6b-83b0c1065b43', 1, 'Chương 1: Khởi đầu', 'Nội dung chương truyện ở đây...', NULL, 0, '2026-09-17 04:30:38.379492+00', '2026-09-17 04:30:38.379493+00');
INSERT INTO public."Chapters" VALUES ('ecd5a0f3-1ca8-4df1-9bf0-7004c19efecd', 'e96c496b-3d46-480c-a50e-15f90c1f5bd5', 1, 'Bức Thư Mời Lúc Nửa Đêm', 'Mưa rơi lộp độp trên mái tôn văn phòng nhỏ nằm khuất trong con hẻm phố cổ, nơi Đặng Minh Vũ vẫn ngồi mỗi tối cùng chồng hồ sơ cũ và ly cà phê nguội. Đồng hồ điểm mười một giờ khuya thì có tiếng gõ cửa dồn dập, gấp gáp như thể người gõ cửa đang chạy trốn khỏi điều gì đó.

Vũ đặt tách cà phê xuống, khẽ nheo mắt nhìn qua khe cửa sổ. Một người phụ nữ trẻ, áo mưa ướt sũng, tay ôm chặt một chiếc túi da, đứng run rẩy ngoài hiên.

"Anh là thám tử Đặng Minh Vũ?" cô hỏi, giọng đứt quãng.

"Vào đi đã, ngoài đó lạnh lắm." Vũ mở rộng cửa, ánh mắt anh không rời khỏi đôi tay đang run của người khách lạ.

Cô gái tên là Lê Thảo My, thư ký riêng của ông Nguyễn Bá Đồng — nhà sưu tầm cổ vật nổi tiếng khắp thành phố, chủ nhân của căn biệt thự mang tên "Nhà Kính" nằm trên đồi cao ngoại ô, nơi ông cất giữ bộ sưu tập gốm sứ và tranh cổ trị giá hàng chục tỷ đồng.

"Ông Đồng... ông ấy chết rồi." My nói, tay siết chặt quai túi. "Trong phòng trưng bày. Cửa khóa từ bên trong, cửa sổ cũng khóa, không ai có thể vào hay ra được. Cảnh sát bảo đó là tự sát, nhưng... tôi không tin."

Vũ rót thêm một tách trà nóng đẩy về phía cô. "Kể tôi nghe từ đầu. Chậm thôi, không cần vội."

Theo lời My, ông Đồng có thói quen làm việc khuya trong phòng trưng bày riêng — một căn phòng hình bát giác với bốn bức tường kính dày, được ông gọi đùa là "lồng kính của lão già cô độc". Tối hôm qua, khoảng chín giờ, ông gọi điện cho My bảo cô mang tài liệu hợp đồng bán đấu giá đến. Khi My đến nơi vào chín rưỡi, cửa phòng đã khóa trái, đèn trong phòng vẫn sáng, và qua lớp kính, cô nhìn thấy ông Đồng nằm gục trên bàn, một vết máu loang trên thái dương.

Người quản gia phải phá cửa. Bên trong, họ tìm thấy một khẩu súng nằm cạnh tay ông, cửa sổ duy nhất của phòng — một ô cửa nhỏ trên cao — vẫn cài chốt bên trong. Không có dấu hiệu đột nhập. Cảnh sát kết luận nhanh chóng: tự sát do áp lực nợ nần từ một thương vụ cổ vật thất bại gần đây.

"Nhưng ông Đồng không phải người tự sát," My khẳng định. "Ông ấy vừa mua được một bức tranh mà ông theo đuổi suốt hai mươi năm. Tối hôm đó ông còn rất phấn khởi, nói với tôi sẽ tổ chức buổi triển lãm lớn vào tháng sau. Người như vậy không thể tự kết liễu đời mình chỉ sau nửa tiếng."

Vũ im lặng một lúc, ngón tay gõ nhẹ lên mặt bàn — thói quen suy nghĩ của anh. "Cô có mang theo thứ gì từ hiện trường không? Bất cứ thứ gì."

My mở túi da, lấy ra một mảnh giấy nhỏ, nhàu nát, có vẻ như bị vo tròn rồi vứt vào sọt rác. Trên đó là vài dòng chữ viết tay nguệch ngoạc: "Bảy giờ. Đừng để ai biết. Mang theo chìa khóa phòng tranh phương Đông."

"Tôi tìm thấy nó trong sọt rác cạnh bàn làm việc của ông, trước khi cảnh sát niêm phong phòng," My nói khẽ. "Chữ viết không phải của ông Đồng."

Vũ cầm mảnh giấy lên, soi dưới ánh đèn bàn. Nét chữ nghiêng, viết vội, mực xanh đã hơi nhòe vì ẩm. Anh gấp nó lại cẩn thận, đặt vào một phong bì nhỏ.

"Được. Tôi sẽ đến Nhà Kính vào sáng mai. Nhưng trước tiên, tôi cần biết — ngoài cô ra, còn ai biết về cuộc hẹn bảy giờ này không?"

My lắc đầu, nhưng ánh mắt cô thoáng chút do dự khiến Vũ để ý. Có điều gì đó cô chưa nói hết. Nhưng đêm đã khuya, và một số câu hỏi cần thời gian mới có câu trả lời trung thực.

"Cô về nghỉ đi," Vũ nói, đứng dậy tiễn khách ra cửa. "Ngày mai công việc thật sự mới bắt đầu."

Khi cánh cửa khép lại sau lưng My, Vũ đứng lặng nhìn ra màn mưa, tay vẫn cầm phong bì chứa mảnh giấy bí ẩn. Một vụ án phòng kín — loại vụ án anh vẫn luôn yêu thích nhất, bởi lẽ, như anh vẫn tin, không có căn phòng nào thực sự "kín" cả. Chỉ là con người chưa đủ tinh tường để nhìn ra khe hở.', NULL, 0, '2026-09-24 09:04:03.751091+00', '2026-09-24 09:04:03.751092+00');
INSERT INTO public."Chapters" VALUES ('c5859e41-8c21-4799-990b-8c20d0f99f49', 'e96c496b-3d46-480c-a50e-15f90c1f5bd5', 2, 'Căn Phòng Bát Giác', 'Nhà Kính hiện ra sau làn sương sớm như một khối pha lê khổng lồ nằm giữa khu vườn cây cổ thụ. Đặng Minh Vũ dừng xe trước cổng sắt, ngước nhìn tòa biệt thự ba tầng theo lối kiến trúc Pháp cổ, nơi ánh nắng sớm phản chiếu lấp lánh trên những ô cửa kính lớn.

Người quản gia tên Tư, dáng người gầy gò, đôi mắt trũng sâu vì mất ngủ, dẫn Vũ vào trong. "Cảnh sát đã gỡ niêm phong sáng nay rồi, thưa ông. Họ nói vụ án đã kết thúc."

"Nhưng ông chưa thấy nó kết thúc, phải không?" Vũ hỏi, ánh mắt quan sát từng chi tiết trong sảnh chính — bức tranh sơn dầu treo hơi lệch, tấm thảm Ba Tư có vết mòn hình bán nguyệt gần cầu thang, dấu hiệu của một vật gì đó thường xuyên bị kéo qua kéo lại.

Tư khẽ cúi đầu. "Tôi làm việc cho ông Đồng hai mươi ba năm. Tôi biết ông ấy như biết chính mình. Ông chủ tôi không phải người dễ dàng buông xuôi."

Họ đi qua hành lang dài, hai bên tường treo kín những bức tranh cổ được đóng khung cẩn thận, đến trước một cánh cửa gỗ sồi nặng nề dẫn vào phòng trưng bày bát giác. Ổ khóa đã bị phá, còn để lại vết cưa loang lổ trên khung cửa.

Bên trong, căn phòng đúng như My mô tả — tám bức tường, bốn trong số đó là kính dày trong suốt nhìn ra khu vườn, bốn bức còn lại ốp gỗ tối màu, treo đầy những món đồ sứ và tranh cổ quý giá. Giữa phòng là chiếc bàn gỗ gụ, nơi người ta đã đánh dấu phấn trắng vị trí thi thể từng nằm.

Vũ tiến đến ô cửa sổ nhỏ trên cao — thứ duy nhất có thể mở được trong toàn bộ căn phòng kính. Anh kéo ghế đứng lên, xem xét kỹ chốt cài bên trong.

"Chốt cửa sổ này," anh lẩm bẩm, "là loại chốt xoay kiểu cũ, không phải loại hiện đại có thể cài từ xa bằng dây hay nam châm như trong mấy vụ án giả tạo người ta hay dựng. Cài chốt này bắt buộc phải có người đứng ngay tại chỗ."

Anh nhìn xuống khung cửa sổ, rồi chú ý đến một chi tiết nhỏ: vài vệt bụi phấn trắng mờ nhạt trên bệ cửa, khác hẳn với lớp bụi xám thông thường tích tụ quanh đó.

"Bụi phấn trang điểm," Vũ nói khẽ, đưa ngón tay chạm nhẹ rồi đưa lên mũi ngửi. "Loại phấn phủ mịn, có mùi hoa nhài. Ông Đồng là đàn ông, không dùng loại phấn này."

Tư đứng nép ở cửa, gương mặt bỗng tái đi. "Ông muốn nói... có người khác đã ở trong phòng này? Nhưng làm sao ra được khi cửa chính khóa trái, còn cửa sổ thì lại được cài chốt bên trong sau khi..."

"Đó chính là câu hỏi cốt lõi của vụ án này," Vũ ngắt lời, ánh mắt anh sáng lên thứ hứng thú quen thuộc mỗi khi chạm đến lõi của một bí ẩn. "Không phải làm sao vào, mà là làm sao ra mà vẫn khóa được cửa từ bên trong."

Anh bước đến giá trưng bày cổ vật phương Đông — nơi có một khoảng trống hình chữ nhật giữa hai chiếc bình sứ, rõ ràng vừa vặn với kích thước một bức tranh cỡ trung bình.

"Bức tranh mà ông Đồng vừa mua được, cô My có nhắc đến. Nó đâu rồi?"

Tư sững người. "Tôi... tôi không để ý. Có lẽ đang được đóng khung ở xưởng phục chế."

"Hay," Vũ quay lại, giọng trầm xuống, "nó đã rời khỏi căn nhà này cùng với người để lại vệt phấn hoa nhài kia, trước khi cảnh sát kịp đến."

Ngoài cửa sổ, một chiếc lá vàng rơi chầm chậm xuống mặt hồ phía dưới đồi, nơi Vũ thoáng thấy bóng một chiếc xe hơi đen đang chậm rãi rời khỏi con đường nhỏ dẫn ra khỏi khu biệt thự — như thể ai đó vừa muốn rời đi thật êm, thật kín đáo, trước khi bị chú ý.

Vụ án tưởng chừng đã khép lại chỉ mới thật sự bắt đầu.', NULL, 0, '2026-09-24 09:04:30.31284+00', '2026-09-24 09:04:30.31284+00');
INSERT INTO public."Chapters" VALUES ('a03a3ab4-962f-43d8-a222-6fb06cc33626', '45e279ea-716a-4406-8247-f2743989e3d2', 1, 'Người Đàn Ông Ở Phố Catinat', 'Tôi gặp Phạm Duy Trí lần đầu trong một hoàn cảnh chẳng có gì đặc biệt — tại phòng thí nghiệm hóa học của bệnh viện Chợ Rẫy, nơi anh ta đang nhỏ một giọt thuốc thử vào ống nghiệm và reo lên đầy phấn khích khi dung dịch chuyển sang màu tím thẫm.

"Cuối cùng cũng tìm ra rồi!" anh ta thốt lên, không hề để ý đến sự có mặt của tôi. "Một phương pháp xác định vết máu khô chỉ trong vài phút, dù đã cũ đến đâu. Ông có biết điều này sẽ giúp ích thế nào cho công tác điều tra hình sự không?"

Tôi, Trần Hữu Nghĩa, khi ấy vừa trở về từ chiến trường Bắc Kỳ với một vết thương ở vai chưa lành hẳn, đang tìm một chỗ ở giá rẻ tại Sài Gòn. Người bạn cũ giới thiệu tôi với một người "đang cần chia sẻ tiền thuê nhà, tính khí hơi kỳ quặc nhưng vô hại." Người đó chính là Phạm Duy Trí.

Chúng tôi hẹn gặp nhau tại căn nhà số 12B đường Catinat để xem xét việc ở chung. Ngay phút đầu tiên bắt tay, Trí nhìn tôi từ đầu đến chân rồi nói:

"Ông vừa từ Bắc Kỳ về, phải không? Và ông là bác sĩ quân y, vết thương ở vai trái vẫn còn hành hạ ông mỗi khi trời trở lạnh."

Tôi sững người. "Sao anh biết được?"

"Đơn giản thôi." Trí phẩy tay, ngồi xuống ghế bành cũ kỹ. "Làn da ông rám nắng nhưng chỉ ở mặt và cổ tay — dấu hiệu của người vừa ở vùng nhiệt đới nhưng luôn phải mặc quân phục dài tay. Dáng đi của ông hơi khập khiễng nhẹ bên trái, nhưng không phải do chân — ông có xu hướng giữ vai trái cao hơn để giảm đau, một phản xạ điển hình của người bị thương do đạn hoặc mảnh pháo. Và chiếc cặp da ông mang theo có khắc chữ ký hiệu quân y viện dã chiến Bắc Kỳ. Ghép các chi tiết lại, kết luận gần như hiển nhiên."

Tôi phải thú thật, khoảnh khắc đó đã quyết định toàn bộ những năm tháng sau này của cuộc đời tôi. Chúng tôi dọn về sống chung tại căn nhà ấy, và tôi dần khám phá ra rằng Phạm Duy Trí không có nghề nghiệp chính thức nào cả — anh tự gọi mình là "nhà tư vấn suy luận", người mà cảnh sát tìm đến khi mọi manh mối khác đã cạn kiệt.

Buổi tối định mệnh ấy đến vào một ngày mưa tháng Bảy. Có tiếng gõ cửa gấp gáp, và người quản gia dẫn vào một quý ông ăn mặc sang trọng nhưng gương mặt tái mét, tay run rẩy không ngừng.

"Ông Phạm Duy Trí," người đàn ông nói, giọng nghẹn lại, "tôi là Lý Tấn Phát, chủ hãng buôn tơ lụa ở đường Bonard. Em trai tôi, Lý Tấn Khôi, vừa được tìm thấy đã chết trong phòng làm việc riêng sáng nay. Cảnh sát nói đó là một vụ trộm thất bại — nhưng không có gì trong phòng bị lấy đi cả, kể cả chiếc két sắt chứa đầy vàng vẫn còn nguyên khóa."

Trí, đang ngồi bên lò sưởi với cây tẩu thuốc quen thuộc, chậm rãi đặt tẩu xuống. "Xin ông kể chi tiết hơn. Đừng bỏ sót bất cứ điều gì, dù có vẻ tầm thường đến đâu — chính những chi tiết tầm thường mới thường ẩn giấu sự thật."

Ông Phát kể lại: Khôi làm việc khuya một mình trong văn phòng ở tầng hai ngôi nhà gia đình, một thói quen suốt nhiều năm. Sáng nay, người hầu gái phát hiện cửa phòng khép hờ — điều bất thường vì Khôi luôn khóa cửa cẩn thận. Bên trong, Khôi nằm chết trên sàn, một vết bầm tím kỳ lạ nơi cổ, nhưng không có dấu hiệu vật lộn, không đồ đạc xáo trộn, cửa sổ vẫn đóng kín từ bên trong.

"Điều kỳ lạ nhất," ông Phát nói, giọng hạ thấp như sợ ai nghe thấy, "là trên bàn làm việc của em tôi, người ta tìm thấy một chiếc lông công đặt ngay ngắn cạnh xấp giấy tờ. Không ai trong nhà nuôi công. Không ai giải thích được vì sao nó ở đó."

Trí ngồi thẳng dậy, ánh mắt bỗng sáng rực lên thứ hứng thú mà tôi đã học được cách nhận ra — dấu hiệu cho thấy một vụ án thực sự thú vị vừa xuất hiện.

"Một chiếc lông công," anh lẩm bẩm. "Nghĩa, lấy áo khoác của tôi. Chúng ta có việc phải làm ngay tối nay."', NULL, 0, '2026-09-24 09:15:23.488938+00', '2026-09-24 09:15:23.488939+00');
INSERT INTO public."Chapters" VALUES ('de555196-948b-49ef-a6c3-810a2c154a31', '45e279ea-716a-4406-8247-f2743989e3d2', 2, 'Chiếc Lông Công Và Ổ Khóa Câm Lặng', 'Ngôi nhà họ Lý nằm trên một con phố yên tĩnh gần chợ Bến Thành, kiến trúc pha trộn giữa phong cách Pháp và nét chạm khắc gỗ truyền thống. Khi chúng tôi đến, viên cảnh sát trưởng phụ trách vụ án — một người đàn ông trung niên tên Đội Cảnh — đang đứng canh trước cửa phòng làm việc, vẻ mặt không mấy vui khi thấy Trí xuất hiện.

"Lại là ông," Đội Cảnh thở dài. "Vụ này đơn giản thôi, ông Trí. Rõ ràng là tai biến tim mạch, chiếc lông công chỉ là thứ đồ chơi vô nghĩa ai đó để quên."

"Nếu đơn giản như vậy," Trí đáp, giọng điềm tĩnh nhưng sắc bén, "thì tại sao ông vẫn đứng canh cửa thay vì đã niêm phong hồ sơ từ sáng?"

Đội Cảnh không đáp, chỉ tránh ánh mắt và mở cửa cho chúng tôi vào.

Căn phòng làm việc của Lý Tấn Khôi gọn gàng đến kỳ lạ đối với hiện trường một cái chết. Trí bước vào, không nhìn thi thể đã được di dời trước, mà tiến thẳng đến cửa sổ, xem xét kỹ từng chốt cài, từng vết trầy trên khung gỗ.

"Cửa sổ này đã bị mở ra rồi đóng lại trong vòng hai mươi tư giờ qua," anh nói. "Nhìn vết bụi bị xáo trộn ở khung dưới, và một vệt sáp nhỏ dính trên bản lề — loại sáp dùng để bôi trơn, không phải thứ người hầu dọn dẹp thông thường sẽ dùng."

Anh tiếp tục di chuyển đến bàn làm việc, cầm chiếc lông công lên, xoay nhẹ dưới ánh đèn dầu.

"Nghĩa, ông để ý gì ở chiếc lông này?"

Tôi nhìn kỹ. "Nó... khá cũ. Phần gốc lông hơi sờn."

"Chính xác. Đây không phải lông công tươi mới, mà từ một vật trang trí cũ — có lẽ một chiếc quạt hoặc mũ lễ phục. Và nhìn kỹ đầu lông, ông sẽ thấy vết cắt thẳng, không phải rụng tự nhiên. Ai đó đã cố ý cắt nó ra từ một vật khác và đặt vào đây."

Trí quay sang xem xét cổ áo của thi thể qua bản phác họa của viên cảnh sát pháp y, đôi mắt anh nheo lại. "Vết bầm này không phải do siết cổ bằng tay hay dây thừng. Hình dạng nó cong đều, có vẻ như từ một vật hình trụ mảnh — như cán một cây quạt lông."

"Ông muốn nói em tôi bị giết bằng... một cây quạt?" ông Phát hỏi, giọng run rẩy.

"Tôi muốn nói," Trí đáp, "rằng kẻ giết người đã cố tình để lại một dấu vết mang tính biểu tượng — có lẽ là lời cảnh cáo, hoặc chữ ký của một hội kín nào đó. Chiếc quạt lông công không phải vật dụng phổ biến ở Sài Gòn, mà thường xuất hiện trong các nghi lễ của giới thương nhân gốc Hoa theo một số hội buôn cổ truyền."

Ông Phát tái mặt. "Em tôi... gần đây có tranh chấp với một hội buôn tơ lụa người Hoa, về việc độc quyền nhập hàng từ Quảng Đông."

Trí gật đầu chậm rãi, như thể mọi mảnh ghép đang dần khớp lại trong đầu anh. "Vậy thì, ông Phát, tôi e rằng cái chết của em trai ông không phải một tai nạn, mà là một thông điệp. Và nếu tôi đoán không lầm, đây mới chỉ là khởi đầu."

Ngoài cửa sổ, tiếng xe ngựa lộc cộc vang lên trên con phố ướt mưa. Đội Cảnh đứng lặng người, còn tôi cảm thấy một luồng lạnh chạy dọc sống lưng — không phải vì vết thương cũ, mà vì linh cảm rằng chúng tôi vừa bước chân vào một vụ án phức tạp và nguy hiểm hơn nhiều so với vẻ ngoài bình lặng của nó.

"Đêm nay," Trí nói, khoác lại áo choàng, "chúng ta sẽ đến khu phố người Hoa. Nghĩa, mang theo súng của ông. Tôi có cảm giác chuyến thăm này sẽ không mấy dễ chịu."', NULL, 0, '2026-09-24 09:15:55.630589+00', '2026-09-24 09:15:55.63059+00');
INSERT INTO public."Chapters" VALUES ('4e09bce4-dbb0-421e-89c2-9461f8800263', '28fc7829-ee61-425b-824e-6aea1fde7343', 1, 'Củ khoai nướng và vệt máu cũ', 'Mùi than ẩm mốc xộc vào mũi trước cả khi ý thức kịp trở lại.
Cái lạnh không cắt da cắt thịt như trận bão tuyết trên đỉnh Thiên Sơn kiếp trước, mà nó ngấm ngầm, tê dại len lỏi từ đầu ngón chân lên tận sống lưng. Hắn theo quán tính co người lại, bàn tay phải vội vã áp lên ngực để chặn dòng máu đang phun trào từ nhát kiếm xuyên tim.
Nhưng không có máu.
Không có mùi tanh nồng của sắt rỉ.
Chỉ có tiếng vải cọ xát sột soạt và hơi thở khò khè của ai đó ở góc phòng.
Hắn mở mắt.
Ánh sáng xám xịt, loãng thếch của buổi sớm mùa đông lọt qua lớp giấy dán cửa sổ đã ố vàng và rách nát. Hắn nheo mắt, để đồng tử quen dần với bóng tối, rồi từ từ đưa bàn tay phải lên trước mặt.
Một bàn tay không có vết chai sạn dày cộm của kẻ cầm đao ba mươi năm. Không có vết sẹo chạy dọc từ cổ tay đến khuỷu tay do trúng ám khí. Chỉ có một bàn tay gầy guộc, trắng bệch, với vài nốt phồng rộp do hôm qua chặt củi.
Hắn nhìn chằm chằm vào bàn tay đó một lúc lâu. Rồi hắn thở hắt ra, một hơi thở nhẹ bẫng, làm tan biến chút hơi ấm cuối cùng trong khoang miệng.
Hắn nhớ ra rồi.
Năm Vĩnh Lạc thứ mười hai. Hắn mười lăm tuổi. Đang làm tạp dịch quét sân ở Hậu Sơn của Thanh Phong Kiếm Phái.
Kiếp trước, hắn đã dành cả đời để leo lên đỉnh cao, để nếm trải đủ vị của phản bội, của chém giết, của những danh vọng phù phiếm, để rồi cuối cùng chết trong một vũng nước mưa loãng ở xó chợ, vì một vết thương ở đùi bị nhiễm trùng. Nực cười. Cái chết của một đệ nhất cao thủ, rốt cuộc lại rẻ mạt như thế.
Hắn ngồi dậy, tấm chăn bông mỏng trượt xuống. Gió lùa qua khe cửa, hắn rụt cổ lại, hai bàn tay vô thức xoa xoa vào nhau cho đỡ tê.
Lạnh quá.
Kiếp trước hắn sợ lạnh, kiếp này hình như còn sợ hơn. Hắn ghét cảm giác tê buốt này. Nó nhắc nhở hắn về vũng nước mưa hôm đó.
Hắn không gào thét, không vò đầu bứt tai hỏi trời cao tại sao lại cho hắn sống lại. Hắn chỉ lẳng lặng xỏ chân vào đôi giày vải đã rách gót, bước ra khỏi gian nhà gỗ. Sàn nhà lạnh ngắt, hắn bước rón rén, tránh những chỗ gỗ bị mọt ăn lún xuống để không phát ra tiếng kêu cót két.
Sân sau lác đác vài bông tuyết rơi. Hắn không ngẩng lên nhìn trời. Hắn chỉ nhìn xuống đất, cẩn thận tìm những viên sỏi khô và những chỗ tuyết chưa tan để bước cho đỡ ướt giày.
Giang hồ gì chứ, ướt giày là khó chịu lắm.
Hắn đi men theo bức tường loang lổ về phía nhà bếp. Mùi thơm ngọt nhạt của khoai lang nướng bay ra, len lỏi qua khe cửa liếp.
Trong bếp chưa ai dậy. Lão Trương đầu bếp đang ngủ gục bên bàn thái thịt, hơi thở đều đặn. Trên bếp lò, tro tàn còn vương chút đỏ, vùi dưới đó là vài củ khoai lang nhỏ xíu, có lẽ lão nướng để ăn lót dạ lúc nửa đêm.
Hắn ngồi xổm xuống bên bếp lò. Hơi ấm tỏa ra từ đống tro làm hắn dễ chịu hơn một chút. Hắn dùng một cành củi khô, cẩn thận bới đống tro ra, gắp lấy một củ khoai nướng vỏ đã cháy xém.
Củ khoai còn nóng, làm hắn phải đổi tay liên tục. Hắn bóc lớp vỏ cháy, để lộ phần thịt vàng ươm, bốc khói. Hắn thổi phù phù vài cái rồi cắn một miếng.
Ngọt. Ấm. Bở tơi trong khoang miệng.
Hắn nhai chậm rãi, nuốt xuống, cảm nhận hơi ấm lan từ dạ dày ra tứ chi. Hắn nhìn ra khoảng sân trống trơn qua khung cửa sổ rách, nơi những bông tuyết đang rơi lặng lẽ.
Kiếp này, hắn không muốn làm đệ nhất cao thủ nữa.
Trước tiên, phải ăn no cái đã.
Hắn ăn hết củ khoai, cẩn thận gói lại lớp vỏ cháy bằng một mảnh giấy dầu cũ nhặt được từ góc bếp. Không vứt bừa. Lão Trương ghét nhất là ai làm bẩn bếp, kiếp trước hắn đã bị lão đánh cho một trận vì tội này.
Hắn đứng dậy, phủi phủi tay vào vạt áo. Áo vải thô, ráp và lạnh. Hắn rùng mình, vội vã xoa hai cánh tay cho đỡ nổi da gà.
Ngoài kia, tiếng chuông đồng từ Tiền Sơn vang lên từng hồi chậm rãi. Boong... boong... boong... Mỗi tiếng chuông cách nhau đúng ba nhịp thở. Đệ tử chính thức bắt đầu buổi tập sáng.
Hắn lắng nghe tiếng chuông, đếm nhịp trong đầu. Kiếp trước, hắn cũng từng đứng ở sân tập, cầm thanh kiếm gỗ nặng trịch, mồ hôi vã ra như tắm dưới sự quát tháo của sư huynh. Giờ nghĩ lại, thấy xa xôi như chuyện của người khác.
Hắn bước ra sân sau, xách theo hai chiếc giỏ tre. Nhiệm vụ buổi sáng của tạp dịch Hậu Sơn: đi nhặt củi khô ở rìa rừng, rồi gánh về chẻ nhỏ, xếp gọn vào nhà bếp. Một công việc lặp đi lặp lại, tẻ nhạt, nhưng ít nhất là không ai để ý.
Tuyết vẫn rơi lất phất. Hắn đi men theo con đường mòn nhỏ, tránh những vũng nước đọng. Giày vải đã ướt từ lúc nào, nước lạnh ngấm qua lớp vải mỏng, làm ngón chân tê cứng. Hắn ghét cảm giác này. Ghét đến mức muốn quay lại phòng, chui vào chăn ngủ tiếp.
Nhưng không được. Nếu không hoàn thành nhiệm vụ, buổi trưa sẽ không có cơm. Mà đói thì còn tệ hơn lạnh.
Khu rừng phía sau Thanh Phong Kiếm Phái không sâu lắm, nhưng đủ rậm rạp để che khuất tầm nhìn từ sơn môn. Cây cối trơ trụi lá, cành cây khẳng khiu vươn lên trời xám xịt như những ngón tay khô khốc. Gió rít qua kẽ lá, tạo ra những âm thanh lạo xạo, rợn người.
Hắn cúi xuống, nhặt từng cành củi khô. Tay lạnh cóng, nhưng hắn không đeo găng. Tạp dịch không được phát găng tay. Hắn chỉ biết co rúm ngón tay lại, rồi tiếp tục nhặt.
Được nửa giỏ, hắn nghe thấy tiếng bước chân.
Nhẹ. Rất nhẹ. Nhưng vẫn đủ để hắn nhận ra. Kiếp trước, thính giác của hắn nhạy bén đến mức có thể nghe thấy tiếng côn trùng bò trên cỏ. Giờ thì không còn được thế, nhưng ít nhất vẫn hơn người thường.
Hắn không ngẩng lên. Tiếp tục nhặt củi, làm như không nghe thấy gì.
Tiếng bước chân dừng lại cách hắn chừng mười bước chân.
"Tạp dịch?" Một giọng nam trẻ, lạnh lùng.
Hắn vẫn không ngẩng lên. "Dạ."
"Lại đây."
Hắn thở dài trong bụng. Đặt giỏ củi xuống, đứng dậy, phủi tay vào vạt áo rồi mới chậm rãi bước về phía giọng nói.
Trước mặt hắn là một nam tử trẻ, chừng mười bảy, mười tám tuổi, mặc đệ tử phục màu xanh lam của nội môn đệ tử. Kiếm đeo bên hông, tóc buộc gọn gàng, mặt mày tuấn tú nhưng lạnh lùng. Hắn nhận ra người này.
Lý Thanh Phong. Đệ tử thiên tài của Thanh Phong Kiếm Phái. Kiếp trước, người này đã trở thành chưởng môn khi mới hai mươi lăm tuổi, và là một trong những kẻ dẫn đầu liên minh vây giết hắn.
Nhưng giờ, Lý Thanh Phong chỉ là một thiếu niên mười bảy tuổi, đang nhìn hắn với ánh mắt khinh khỉnh.
"Ngươi là ai? Sao ta chưa từng thấy mặt?"
Hắn cúi đầu. "Lâm Viễn. Mới vào Hậu Sơn được ba tháng."
Lý Thanh Phong nhíu mày. "Ba tháng? Ta nhớ rõ mặt tất cả tạp dịch ở Hậu Sơn. Ngươi nói dối."
Hắn im lặng. Kiếp trước, hắn cũng từng bị chất vấn như thế này. Và hắn đã học được một bài học: đừng cãi lại đệ tử nội môn. Không đáng.
"Thuộc hạ mới chuyển từ Tiền Sơn sang." Hắn nói, giọng đều đều.
Lý Thanh Phong nhìn hắn chằm chằm một lúc, rồi hừ lạnh. "Đồ phế vật. Tránh ra, đừng cản đường ta."
Hắn lùi lại, cúi đầu thấp hơn. Lý Thanh Phong lướt qua hắn, áo xanh bay part phới trong gió. Mùi hương trầm hương nhàn nhạt bay theo, làm hắn hơi nhíu mũi.
Đệ tử nội môn được phát trầm hương để tắm gội. Tạp dịch thì không.
Hắn đứng đó, nhìn theo bóng lưng Lý Thanh Phong khuất dần sau rặng cây, rồi mới quay lại nhặt củi. Tay hắn lạnh hơn lúc nãy, nhưng không phải vì gió.
Không phải vì sợ. Mà vì hắn nhớ ra một chuyện.
Kiếp trước, hôm nay là ngày Lý Thanh Phong phát hiện ra bí mật của sư muội. Và cũng là ngày bắt đầu cho chuỗi ngày đen tối của Thanh Phong Kiếm Phái.
Hắn nhặt cành củi, bẻ gãy làm đôi. Tiếng gãy giòn tan trong không khí lạnh.
Mặc kệ.
Kiếp này, hắn không muốn dính dáng đến những chuyện đó. Hắn chỉ muốn ăn no, ngủ ấm, và sống hết kiếp này trong im lặng.
Nhưng hắn biết, giang hồ không để ai yên.', NULL, 0, '2026-10-01 09:04:34.73157+00', '2026-10-01 09:04:34.731571+00');
INSERT INTO public."Chapters" VALUES ('97961f7e-8399-41e8-be8d-1cc27b12b4a1', '28fc7829-ee61-425b-824e-6aea1fde7343', 2, 'Cháo trắng và vết nứt trên mu bàn tay', 'Hai giỏ củi nặng trĩu đè lên đôi vai gầy, khiến bước chân của Lâm Viễn thêm phần nặng nề.
Hắn không dùng nội công để nâng đỡ. Kiếp trước, hắn có thể dùng một ngón tay nhấc bổng tảng đá ngàn cân, nhưng giờ đây, cơ thể mười lăm tuổi này chỉ là một cái xác thịt phàm trần, yếu ớt và thiếu dinh dưỡng. Mỗi bước đi trên lớp tuyết dày, bắp chân hắn lại run lên bần bật, hơi thở phun ra thành từng làn khói trắng đặc quánh, nhanh chóng bị gió lạnh xé tan.
Hắn dừng lại nghỉ một nhịp, đặt hai giỏ củi xuống gốc một cây tùng già. Vỏ cây sần sùi cọ vào lưng áo, lạnh buốt. Hắn cúi xuống, xoa xoa hai bắp chân, cảm nhận từng thớ cơ đang rên rỉ vì quá tải.
"Chậm quá," hắn lẩm bẩm, giọng khàn đặc vì nuốt phải gió lạnh.
Kiếp trước hắn đi một mạch từ đỉnh Thiên Sơn xuống chân núi chỉ mất nửa盏 trà (nửa chén trà). Giờ đây, quãng đường từ rìa rừng về đến nhà bếp Hậu Sơn, hắn phải nghỉ tới ba lần. Hắn nhìn xuống đôi bàn tay đang bám chặt vào quai giỏ. Các khớp ngón tay trắng bệch, móng tay hơi dài và dính đầy bụi đất, mu bàn tay nổi lên những vết nứt nẻ đỏ au vì lạnh.
Hắn ghét đôi bàn tay này. Nó không có sức mạnh, không có vết chai của người cầm kiếm, chỉ có những vết xước dăm do vấp ngã và cái lạnh làm tê dại.
Lâm Viễn hít một hơi thật sâu, để không khí lạnh tràn đầy lồng ngực, rồi lại cúi xuống nhấc hai giỏ củi lên. Hắn không dám đi chậm hơn nữa. Lão Trương đầu bếp tuy bề ngoài xù xì, nhưng nếu giao việc không đúng giờ, lão sẽ trừ vào khẩu phần ăn buổi trưa. Mà với cái dạ dày đang sôi lên vì đói của hắn lúc này, việc bị trừ cơm là một thảm họa.
Khi hắn đẩy cánh cửa gỗ nặng nề của nhà bếp, một luồng hơi ấm ẩm ướt mang theo mùi cháo gạo và dưa muối xộc thẳng vào mặt.
Sự tương phản giữa cái lạnh cắt da bên ngoài và cái ấm áp bên trong khiến Lâm Viễn hơi choáng váng. Hắn chớp mắt vài cái, để đồng tử điều chỉnh lại với ánh sáng vàng đục từ ngọn đèn dầu treo trên xà nhà.
Trong bếp đã nhộn nhịp. Hai gã tạp dịch khác đang lom khom thái rau, tiếng dao chạm vào thớt gỗ vang lên lộp cộp đều đặn. Lão Trương đứng trước bếp lò lớn, tay cầm chiếc muôi gỗ khổng lồ, khuấy nồi cháo đang sôi sùng sục. Mùi hơi nước bốc lên nghi ngút, làm mờ cả một góc bếp.
Lâm Viễn lặng lẽ đi vào góc bếp, đặt hai giỏ củi xuống cạnh đống củi cũ. Hắn không lên tiếng, chỉ cúi đầu bắt đầu chẻ củi.
"Chậm rì à?"
Giọng ồm ồm của Lão Trương vang lên, không kèm theo sự giận dữ, chỉ là một lời nhận xét cộc lốc. Lão không quay đầu lại, tay vẫn khuấy nồi cháo.
Lâm Viễn dừng tay, cúi đầu thấp hơn một chút. "Dạ, tuyết rơi dày, đường trơn."
Lão Trương hừ một tiếng, múc một gáo nước lạnh đổ vào nồi. "Thôi, xong thì vào rửa tay đi. Chuẩn bị bưng cháo."
Lâm Viễn gật đầu, đi ra phía chậu nước ở góc nhà. Nước trong chậu lạnh ngắt, nổi lên một lớp váng mỏng do nhiệt độ thấp. Hắn nhúng hai bàn tay vào, cảm giác tê buốt lập tức lan lên tận khuỷu tay. Hắn nghiến răng, cọ mạnh hai bàn tay vào nhau cho bớt đi lớp bụi đất, rồi lau khô vào vạt áo.
"Có biết tin gì chưa Lâm ca?"
Một giọng nói the thé, hơi nasal vang lên bên cạnh. Lâm Viễn quay sang, thấy Tiểu Đậu - một gã tạp dịch trạc tuổi hắn, mặt mày xanh xao, đang nhón chân nhìn ra ngoài sân qua khe cửa.
"Biết gì?" Lâm Viễn hỏi, giọng đều đều, tay vẫn lau khô.
"Nghe nói sáng nay Lý sư huynh của nội môn đi ngang qua Trúc Lâm, bắt gặp sư muội Tô... à không, bắt gặp ai đó đang lén lút truyền tin cho Ma Giáo!" Tiểu Đậu压低 giọng (hạ thấp giọng), đôi mắt sáng rực lên vì phấn khích. "Sau đó có tiếng động lớn, hình như Lý sư huynh đã ra tay. Nghe đâu người đó bị phế tu vi, đang bị nhốt ở Hình Phòng!"
Lâm Viễn lau tay xong, dừng lại một nhịp.
Hắn nhớ ra rồi. Kiếp trước, sự kiện này là ngòi nổ cho cuộc thanh trừng nội bộ của Thanh Phong Kiếm Phái. Kẻ bị bắt không phải ai xa lạ, mà là một đệ tử ngoại môn vô danh, bị dùng làm bia đỡ đạn cho một âm mưu lớn hơn. Và Lý Thanh Phong, nhờ "lập công" này, đã chính thức được Chưởng môn thu nhận làm đệ tử thân truyền.
"Lâm ca? Lâm ca có nghe ta nói không?" Tiểu Đậu huých huých vào tay áo hắn.
Lâm Viễn lấy lại vẻ mặt bình thản, vỗ nhẹ lên vai gã nhóc. "Nghe rồi. Nhưng chuyện của đại nhân vật, bọn mình nghe xong thì bỏ đi. Nói nhiều kẻo mất đầu."
Hắn nói xong, quay lại đống củi, cầm lấy chiếc rìu sắt nặng trịch.
Tiểu Đậu bĩu môi, lẩm bẩm "nhát gan" rồi quay lại thái rau.
Lâm Viễn nâng chiếc rìu lên. Hắn không dùng lực của cánh tay, mà dùng trọng lượng của chính chiếc rìu, để nó rơi xuống theo quán tính. Cạch. Một khúc củi tách đôi. Hắn làm rất chậm, rất cẩn thận, tính toán từng đường vân gỗ để không tốn sức.
Hắn không quan tâm đến ai bị phế tu vi, cũng không quan tâm đến âm mưu của Ma Giáo. Hắn chỉ quan tâm đến việc khúc củi này có đủ khô để cháy nhanh hay không. Nếu củi ẩm, bếp sẽ ám khói, và hắn sẽ bị Lão Trương mắng.
Bữa sáng của tạp dịch Hậu Sơn rất đơn giản: một bát cháo trắng loãng, vài lát củ cải muối, và một chiếc bánh bao chay nhỏ bằng nắm tay.
Lâm Viễn ngồi xổm ở góc bếp, bưng bát cháo trên hai tay. Hơi nóng từ bát cháo truyền qua lớp gốm mỏng, làm ấm lại đôi bàn tay đang tê cứng. Hắn thổi nhẹ, húp một ngụm nhỏ.
Cháo nhạt thếch, chỉ có vị ngai ngái của gạo tẻ và một chút vị chua nhẹ của củ cải muối. Nhưng với hắn, lúc này nó ngon hơn cả yến sào và rượu ngon mà hắn từng được thưởng thức ở những bữa tiệc của võ lâm minh chủ kiếp trước.
Hắn ăn chậm rãi, nhai kỹ từng miếng bánh bao khô cứng. Hắn thích cảm giác no bụng. Cảm giác dạ dày được lấp đầy, hơi ấm lan tỏa ra khắp cơ thể, xua tan đi cái lạnh lẽo của buổi sáng. Đó là một cảm giác rất thật, rất cụ thể, khác hẳn với những danh vọng phù phiếm.
Ăn xong, hắn cẩn thận liếm sạch đáy bát, rồi mang ra chậu nước rửa.
Khi hắn đang rửa bát, Lão Trương đi ngang qua, ném xuống cạnh hắn một lọ sành nhỏ xíu.
"Muỗi." Lão Trương cộc lốc.
Lâm Viễn nhìn xuống. Đó là một lọ mỡ trăn pha thuốc, loại rẻ tiền nhất mà bọn tạp dịch hay dùng để bôi lên những vết nứt nẻ do lạnh.
"Đa tạ Trương thúc." Hắn nói, cúi đầu.
Lão Trương không đáp, chỉ phất tay rồi đi ra ngoài sân kiểm tra đống củi hắn vừa chẻ.
Lâm Viễn cầm lọ mỡ lên, mở nắp. Mùi dầu mỡ và thảo dược hơi nồng xộc lên mũi. Hắn bôi một lớp mỏng lên mu bàn tay, rồi xoa nhẹ nhàng. Cảm giác rát rát lúc đầu nhanh chóng dịu lại, thay vào đó là một lớp màng nhờn giữ ấm.
Hắn nhìn ra ngoài cửa sổ. Tuyết vẫn rơi, nhưng đã thưa hơn. Ánh sáng mặt trời yếu ớt xuyên qua tầng mây xám, chiếu xuống sân sau một màu trắng bạc lấp lánh.
Một ngày mới của Thanh Phong Kiếm Phái lại bắt đầu. Những đệ tử nội môn đang luyện kiếm, những trưởng lão đang ngồi thiền, và những âm mưu ngầm đang cuộn trào dưới lớp vỏ bọc bình yên.
Còn hắn, Lâm Viễn, chỉ là một tạp dịch với đôi bàn tay bôi đầy mỡ trăn, đang ngồi xổm ở góc bếp, cảm thấy hơi buồn ngủ.
Hắn ngáp một cái, che miệng lại, rồi đứng dậy đi tìm chỗ phơi khô đôi giày vải ướt sũng.
Giang hồ mặc kệ giang hồ. Hắn chỉ cần đôi giày khô là được.
', NULL, 0, '2026-10-01 09:06:19.236573+00', '2026-10-01 09:06:19.236573+00');
INSERT INTO public."Chapters" VALUES ('8d397f39-5cfe-4dce-aac8-ac02741955c1', '28fc7829-ee61-425b-824e-6aea1fde7343', 3, 'Vết sẹo trong tiềm thức và thanh kiếm gỗ', 'Suối sau núi chảy xiết hơn vào buổi trưa, khi lớp băng mỏng trên mặt nước tan bớt dưới ánh mặt trời nhợt nhạt.
Lâm Viễn ngồi xổm trên phiến đá phẳng, hai bàn tay ngâm trong dòng nước lạnh buốt. Hắn đang giặt y phục của Lão Trương. Lớp vải thô dày, ngấm nước nặng trĩu, cọ xát vào những vết nứt nẻ trên mu bàn tay hắn. Mỗi lần vắt, nước lạnh lại rỉ ra, chảy dọc theo cổ tay, luồn vào trong ống tay áo.
Hắn không dùng nội lực để làm ấm người. Hắn không có nội lực.
Nhưng có một thứ khác đang len lỏi trong cơ thể hắn. Một cảm giác quen thuộc, đáng sợ hơn cả cái lạnh.
Hắn nhìn xuống mặt nước. Dòng suối trong vắt, phản chiếu bầu trời xám xịt và khuôn mặt nhợt nhạt của chính hắn. Đột nhiên, hình ảnh trong nước nhoè đi. Mặt nước biến thành một vũng bùn loãng. Mùi tanh của máu và mùi ẩm mốc của xó chợ xộc vào mũi. Hắn cảm thấy một cơn đau nhói ở đùi, và hơi thở bắt đầu dồn dập, hụt hơi.
Tay hắn run lên. Chỉ một nhịp. Rất nhẹ.
Lâm Viễn nhắm mắt lại. Hắn hít vào một hơi thật sâu, đếm từ một đến năm trong đầu, rồi thở ra. Khi mở mắt, vũng bùn biến mất, chỉ còn lại dòng suối và phiến đá.
Hắn cúi xuống, vò mạnh tấm vải vào tảng đá. Soạt. Soạt. Âm thanh粗糙 (thô ráp) vang lên, kéo hắn trở về thực tại. Hắn ghét cảm giác này. Hắn ghét việc cơ thể mười lăm tuổi này lại phản ứng với những ký ức của kẻ ba mươi tuổi. Hắn đã chết rồi. Hắn đã trả giá bằng cả mạng sống. Vậy tại sao nỗi sợ hãi đó vẫn bám lấy hắn như một bóng ma?
"Cạch."
Một tiếng động khô khốc vang lên từ bờ suối phía trên, cắt ngang dòng suy nghĩ của hắn.
Lâm Viễn ngẩng đầu. Cách hắn chừng mười mét, một nam tử trẻ mặc ngoại môn đệ tử phục đang đứng giữa bãi cỏ khô. Trên tay gã là một thanh kiếm gỗ, mồ hôi vã ra trên trán despite cái lạnh. Gã đang tập một bộ kiếm pháp cơ bản của Thanh Phong Phái.
Lâm Viễn nhận ra gã. Triệu Hổ. Một đệ tử ngoại môn bình thường, tính tình nóng nảy, hay bắt nạt tạp dịch để tỏ ra mình có địa vị. Kiếp trước, gã này chết trong một trận giao tranh biên giới khi mới hai mươi tuổi.
Triệu Hổ vung kiếm. Vút. Vút.
Lâm Viễn nhìn theo đường kiếm của gã. Hắn không muốn nhìn, nhưng đôi mắt hắn đã được rèn luyện ba mươi năm để phân tích sát chiêu. Nó tự động hoạt động, như một cỗ máy đã lập trình sẵn.
Hạ盤 (hạ bàn) quá cao. Cổ tay cứng. Khi chuyển từ chiêu ''Bạch Hạc Lượng Sí'' sang ''Dã Mã Phân Tông'', trọng tâm bị lệch sang trái ba phân.
Lâm Viễn收回 (thu lại) ánh mắt, tiếp tục vò tấm vải.
Nhưng Triệu Hổ lại vung kiếm. Và lại mắc lỗi đó. Cổ tay gã run lên, thanh kiếm gỗ suýt nữa tuột khỏi tay. Gã chửi thề một tiếng, cúi xuống nhặt kiếm. Trong lúc cúi, chân gã trượt trên lớp cỏ ẩm, ngã chúi về phía trước, thanh kiếm gỗ văng ra, trượt dài trên mặt đất và dừng lại ngay trước mũi giày vải của Lâm Viễn.
Không khí xung quanh dường như ngưng lại một nhịp.
Lâm Viễn nhìn thanh kiếm gỗ. Vỏ cây đã bị mài mòn, để lộ lớp gỗ sáng màu bên trong.
Hắn biết mình nên làm gì. Hắn nên cúi đầu, nhặt nó lên, đưa trả bằng hai tay, và nói một câu xin lỗi vì đã để nó văng tới chỗ mình. Đó là cách một tạp dịch sống sót.
Nhưng tay hắn không cử động.
Trong đầu hắn, một giọng nói lạnh lùng vang lên: Nếu hắn tiếp tục tập như thế, trong vòng ba tháng, kinh mạch cổ tay phải của hắn sẽ bị tổn thương vĩnh viễn. Hắn sẽ phế một tay, bị đuổi khỏi tông môn, và chết đói ở ngoài trấn.
Hắn nhớ lại kiếp trước. Hắn đã từng thấy hàng ngàn đệ tử như Triệu Hổ. Những kẻ có chút thiên phú, tham vọng, nhưng lại chết vì chính sự ngu ngốc và kiêu ngạo của mình. Hắn từng khinh thường họ. Giờ đây, nhìn gã đang loay hoay đứng dậy, phủi đất trên quần áo, Lâm Viễn cảm thấy một cảm giác kỳ lạ.
Không phải khinh thường. Mà là một sự mệt mỏi rã rời.
Hắn mệt vì phải nhìn thấy những lỗi sai hiển nhiên. Hắn mệt vì biết trước kết cục. Hắn mệt vì phải kìm nén bản năng của một bậc thầy để đóng vai một kẻ ngốc.
"Lão câm điếc à? Nhặt kiếm cho ta!" Triệu Hổ quát lên, giọng đầy vẻ bề trên, tay chỉ vào thanh kiếm.
Lâm Viễn nhìn lên. Ánh mắt của Triệu Hổ đầy sự khinh khỉnh và impatient (thiếu kiên nhẫn).
Trong khoảnh khắc đó, sát khí kiếp trước thoáng qua trong mắt Lâm Viễn. Chỉ một thoáng. Đủ để không khí xung quanh hắn nặng trĩu lại. Triệu Hổ bỗng nhiên khựng lại, sống lưng lạnh toát, như thể vừa bị một con thú dữ nhìn chằm chằm. Gã nuốt nước bọt, bước lùi lại nửa bước theo bản năng.
Nhưng Lâm Viễn đã kịp thời khép lại cái "lồng" trong tâm trí mình. Hắn cúi đầu, vai hơi co lại, thu hết cái sát khí đó vào trong.
Hắn vươn tay, nhặt thanh kiếm gỗ lên.
Lúc ngón tay hắn chạm vào chuôi kiếm, một cảm giác tê dại chạy dọc sống lưng. Hắn nhớ lại cảm giác cầm đao. Nhớ lại sức nặng của nó. Nhớ lại mùi máu. Hắn siết chặt chuôi kiếm, đến mức các khớp ngón tay trắng bệch, rồi từ từ thả lỏng ra.
Hắn đứng dậy, bước về phía Triệu Hổ.
"Đưa đây." Triệu Hổ giật phắt lấy thanh kiếm, vẻ mặt vẫn còn chút hoảng hốt chưa kịp giấu kỹ. "Lần sau để ý một chút, đừng có đứng chắn đường ta tập kiếm."
Lâm Viễn không đáp. Hắn chỉ nhìn vào cổ tay phải của Triệu Hổ.
Hắn mở miệng. Hắn muốn nói: Hạ thấp vai xuống. Xoay cổ tay ra ngoài một chút khi chuyển chiêu. Chỉ cần một câu thôi. Hắn có thể cứu cái tay phải của gã.
Nhưng rồi hắn nghĩ đến vũng nước mưa. Nghĩ đến cơn đau ở đùi. Nghĩ đến việc nếu hắn thể hiện ra một chút kiến thức, hắn sẽ bị cuốn vào vòng xoáy của tông môn, bị dò xét, bị lợi dụng.
Hắn đóng miệng lại. Hắn nuốt câu nói đó xuống cổ họng. Nó nghẹn lại ở đó, đắng ngắt.
"Thuộc hạ sẽ chú ý." Lâm Viễn nói, giọng khàn và đều đều. Hắn cúi đầu, quay lưng lại, bước về phía phiến đá.
Triệu Hổ đứng đó nhìn theo lưng hắn, nhíu mày, cảm thấy có gì đó không ổn nhưng không nói ra được. Gã hừ lạnh, quay lại vung kiếm.
Lâm Viễn ngồi xuống phiến đá. Hắn nhúng tay vào nước lạnh. Cái lạnh buốt giá lập tức xâm chiếm, xua tan đi chút hơi ấm cuối cùng trong cơ thể.
Hắn nhìn xuống đôi bàn tay đang run rẩy của mình. Hắn không cứu gã. Hắn đã chọn sự an toàn. Hắn đã chọn sống.
Vậy tại sao trong lòng hắn lại cảm thấy trống rỗng đến thế?
Hắn vò mạnh tấm vải vào đá. Soạt. Soạt. Âm thanh lại vang lên, lấn át tiếng nước chảy và tiếng kiếm vung trong gió. Hắn giặt tiếp. Hắn chỉ là một tạp dịch. Hắn chỉ cần giặt xong đống quần áo này, rồi về phòng, ăn một củ khoai, và ngủ.
Chỉ vậy thôi.', NULL, 0, '2026-10-01 09:08:08.016336+00', '2026-10-01 09:08:08.016336+00');
INSERT INTO public."Chapters" VALUES ('3a6b59d8-13e0-40bd-94bd-4f48e6025ca5', '28fc7829-ee61-425b-824e-6aea1fde7343', 4, 'Cánh cửa không cài và điều thứ ba', 'Trời Hậu Sơn tối nhanh hơn Lâm Viễn nghĩ.
Lúc hắn rời khỏi nhà bếp, vệt nắng cuối cùng còn bám trên nóc ngói rêu phong; đến khi hắn băng qua sân phơi, bầu trời đã chuyển sang màu mực loãng. Gió nổi lên, quét qua những giàn củi khô, tạo thành thứ âm thanh rít dài như tiếng ai đó nghiến răng ở rất xa.
Đôi giày vải của hắn đã khô. Hắn phơi nó cạnh bếp lò từ trưa, giờ xỏ chân vào, lớp vải cứng và ráp, nhưng còn vương chút hơi ấm muộn màng của tro than. Hắn bước đi, cảm nhận chút ấm đó lan qua gan bàn chân, và thấy trong lòng dễ chịu hơn một chút.
Đi qua giếng nước, hắn dừng lại uống hai ngụm. Nước giếng lạnh, ngọt, trôi xuống cổ họng như một lưỡi dao nhỏ. Hắn lau miệng bằng mu bàn tay, rồi tiếp tục đi về phía dãy nhà tạp dịch ở mé đông.
Trong đầu hắn tự động chạy một bản sổ sách nhỏ: củi đã chẻ đủ, bát đã rửa, giày đã khô, nửa cái bánh bao buổi tối còn giấu trong bọc vải. Một ngày không tệ. Một ngày không ai để ý đến hắn.
Dãy nhà tạp dịch chìm trong bóng tối. Dầu đèn là thứ xa xỉ, không ai thắp qua canh đầu. Ánh trăng non lọt qua lớp giấy dán cửa sổ, hắt xuống nền đất những ô sáng mờ nhờ nhờ.
Lâm Viễn dừng lại trước gian phòng của mình.
Hơi thở hắn khựng lại nửa nhịp.
Then cài cửa. Sáng nay, trước khi đi, hắn đã cài nó. Một thói quen cũ từ kiếp trước, thứ thói quen đã cứu hắn qua không biết bao nhiêu đêm ám sát: không bao giờ ngủ sau một cánh cửa không khóa.
Giờ thì then cài đang buông thõng, đung đưa khe khẽ theo gió lùa.
Hắn không bước vào. Hắn lùi nửa bước, lưng áp vào vách gỗ lạnh, để mắt quen dần với bóng tối bên trong. Hắn lắng nghe.
Tiếng ngáy của lão Chu ở góc phòng. Đều, nặng, khò khè như cũ.
Và một hơi thở khác.
Nông. Rất nông. Bị nén lại. Thứ hơi thở của kẻ đang cố gắng để không tồn tại.
Tay hắn theo quán tính sờ xuống hông. Trống không. Không đao, không kiếm, không cả một con dao găm. Ngón tay hắn khép lại trên lớp vải áo thô ráp, và trong một thoáng, hắn thấy nực cười: ba mươi năm kiếp trước, hắn rút đao nhanh hơn người ta hít vào; bây giờ hắn đứng trước cửa nhà mình, trong tay chỉ có thể nắm lấy... không gì cả.
Hắn với lấy thanh củi khô dựa bên vách. Gỗ nhẹ, xốp, vô dụng. Hắn cầm nó như cầm một thanh kiếm, rồi đẩy cửa.
Két.
Ánh trăng dịch chuyển trên nền đất. Và trên chiếc chiếu cói của hắn, sát vách trong cùng, một bóng người đang co tròn.
Mùi xộc ra trước: mùi mồ hôi cũ, mùi máu tanh ngọt, và mùi sợ hãi.
Lâm Viễn đứng yên hai nhịp thở. Rồi hắn thả thanh củi xuống. Cạch.
"Tiểu Đậu." Hắn nói, giọng phẳng lì. "Nhà ngươi có ba chiếc chiếu. Chiếu của ngươi ở kia."
Bóng người trên chiếu hắn giật mình, co rúm lại. Một khuôn mặt ngẩng lên khỏi đầu gối, nửa chìm trong bóng tối: gò má sưng tím, khóe môi rách, vệt máu khô kéo xuống cằm.
"Lâm ca." Giọng gã nhóc khàn đặc, nứt ra như vỏ cây khô. "Ta không đụng vào gì cả. Ta chỉ... ngồi một chút."
Lâm Viễn không đáp. Hắn bước vào, khép cửa lại, rồi cài then. Tách. Âm thanh nhỏ, dứt khoát, vang lên trong gian phòng tối như một nhát đóng đinh.
Hắn ngồi xuống mép chiếu, tháo dải quấn chân, động tác chậm rãi. Trong đầu hắn, ba điều hắn tự đặt ra cho kiếp này trôi qua, rõ ràng như chữ khắc trên đá:
Một, ăn no.
Hai, ngủ ấm.
Ba, không dính vào chuyện của người khác.
Kiếp trước, hắn đã từng vi phạm điều thứ ba một lần. Hắn cõng một kẻ bị thương xuyên qua ba đêm tuyết, chia cho kẻ đó nửa phần lương khô cuối cùng. Bảy năm sau, ở Cốc Khóc, chính kẻ đó đứng trên gò cao, chỉ tay xuống đám đông đang quỳ và nói: Chính là hắn.
Lâm Viễn nhìn đống chăn mỏng của mình bị xê dịch. Nhìn đôi giày rách của gã nhóc để ngổn ngang trên mép chiếu hắn.
"Quản sự Tôn vẫn đang tìm ngươi," hắn nói, mắt vẫn cúi xuống dải quấn chân. "Ngươi ngủ ở đây, sáng mai cả hai đứa bị lôi ra sân hình."
"Canh năm ta đi." Tiểu Đậu nói nhanh, rồi lại chậm dần, giọng chìm xuống. "Lão nói... lão nói ai khai thêm một tên nữa thì bị bẻ lưỡi lôi xuống Hình Đường." Gã nhóc cười một tiếng, khô hơn cả tiếng ho. "Ta không khai hôm đó có ai nghe cùng đâu, Lâm ca."
Gian phòng im lặng. Lão Chu ngáy. Gió rít qua khe cửa.
Tay Lâm Viễn đang tháo dải quấn chân dừng lại. Một nhịp. Rồi hai nhịp.
Hắn nhớ buổi sáng ở nhà bếp. Gã nhóc đứng sát hắn,压低 giọng kể chuyện Trúc Lâm, mắt sáng rực như trẻ con nhặt được đồng xu. Chuyện đó lọt đến tai Quản sự Tôn. Và gã nhóc ăn đòn một mình.
Hắn nhìn sang chỗ khác. Hắn với lấy bọc vải để đầu chiếu, mở ra. Nửa cái bánh bao buổi tối, cứng và lạnh, nằm trong lớp vải thô. Hắn ném nó qua.
Tiểu Đậu bắt hụt, cái bánh rơi vào ngực gã. Gã ôm lấy nó như ôm một thứ gì dễ vỡ.
"Nhai chậm," Lâm Viễn nói, quay lưng lại, bắt đầu trải chăn. "Nghẹn là ta vứt ra ngoài."
Gã nhóc không nói gì. Nhưng tiếng nhai vang lên sau lưng hắn, vội vã lúc đầu, rồi cố gắng chậm lại, rồi lại vội. Xen giữa những tiếng nhai là những tiếng hít vào rất khẽ, bị nuốt xuống nửa chừng.
Lâm Viễn nằm xuống, quay mặt vào vách. Vách đất lạnh tỏa hơi ra sau gáy hắn.
Trong ánh trăng mờ, hắn nhìn thấy khóe môi rách của gã nhóc lúc nãy. Vết rách sâu, đã khô máu nhưng còn sưng. Loại vết thương này, nếu không bôi thuốc, sẽ nứt toác ra khi ăn, khi nói, khi ngủ nghiến răng. Hắn biết. Hắn đã có cả trăm vết như thế, ở cả những chỗ tệ hơn nhiều.
Hắn thở ra một hơi qua mũi. Rồi hắn ngồi dậy, lục trong túi áo, lấy ra lọ sành nhỏ xíu Lão Trương ném cho hắn hôm qua. Mở nắp. Mùi mỡ trăn và thảo dược nồng lên trong gian phòng tối.
Hắn nhón một chút, quay sang, dí vào khóe môi gã nhóc.
Tiểu Đậu giật mình lùi lại, lưng đập vào vách.
"Ngồi yên," Lâm Viễn nói.
Gã nhóc ngồi yên. Mắt gã mở to trong bóng tối, không dám chớp. Ngón tay hắn chạm vào vết rách, bôi một lớp mỏng, đều. Gã nhóc hít vào một tiếng qua kẽ răng, nhưng không kêu.
Xong, hắn ném cả lọ thuốc vào lòng gã.
"Cất đi," hắn nói, nằm xuống lại, kéo chăn lên. "Đừng để Quản sự Tôn thấy. Thứ này đáng giá ba ngày công của ngươi đấy."
"Lâm ca..."
"Chiếu của ta," hắn cắt ngang, mắt đã nhắm lại. "Nhỏ dãi lên là mai quét sân thay ta."
Im lặng. Rồi một tiếng "ừ" rất nhỏ, nhỏ đến mức gần như bị tiếng gió nuốt mất.
Lâm Viễn nằm nghe gió. Nghe lão Chu ngáy. Nghe hơi thở sau lưng hắn dần dần đều lại, chìm vào giấc ngủ của một đứa trẻ kiệt sức.
Hắn nhẩm lại ba điều khắc trong đầu. Ăn no. Ngủ ấm. Hắn dừng lại ở điều thứ ba khá lâu.
Rồi hắn tự nhủ: nửa cái bánh bao. Một góc chăn. Vài lần bôi thuốc. Rẻ quá. Rẻ đến mức không đáng gọi là dính dáng.
Hắn nhẩm câu đó thêm một lần nữa, như người ta đóng thêm một cái đinh cho chắc.
Chính lúc ấy, ánh trăng dịch qua khe cửa, quét một vệt sáng mỏng lên vai áo gã nhóc đang ngủ co ro sát mép chiếu hắn.
Trên cổ áo vải sờn, kẹt giữa đường chỉ rách, có một chiếc lá trúc.
Xanh. Tươi. Còn nguyên gân lá.
Hậu Sơn không có trúc. Trúc xanh giữa mùa tuyết chỉ có ở Trúc Lâm, bên trong sơn môn, nơi nội môn đệ tử luyện kiếm.
Lâm Viễn nhìn chiếc lá đó đúng hai nhịp thở.
Hắn không hỏi. Hắn kéo chăn lên tận cằm, khép mắt lại, để bóng tối phủ xuống chiếc lá xanh và tất cả những câu hỏi đang cựa quậy dưới đáy ngực hắn.
Ngoài kia, tiếng mõ canh vang lên hai nhịp, khô và xa. Canh ba.
Sáng mai hắn phải dậy sớm chẻ củi.', NULL, 0, '2026-10-01 09:17:41.248327+00', '2026-10-01 09:17:41.248327+00');
INSERT INTO public."Chapters" VALUES ('6daaef14-d1f4-4598-bd23-5b280fffd00e', '28fc7829-ee61-425b-824e-6aea1fde7343', 5, 'Bếp lửa ngày cuối năm', 'Canh năm, Lâm Viễn tỉnh dậy vì lạnh.
Hắn mở mắt, nhìn lên xà nhà đen đặc trong bóng tối. Hơi thở hắn phả ra thành khói mờ. Bên cạnh, góc chiếu sát vách trong cùng, trống không.
Hắn ngồi dậy rất chậm. Chiếc chăn bông của hắn được gấp lại, mép lệch mép, đường gấp run run như tay người gấp chưa quen việc. Chiếu cói được vuốt phẳng. Đôi giày rách của gã nhóc đã biến mất.
Trên mép chiếu, ngay chỗ hắn vẫn ngồi tháo quấn chân, có một gói nhỏ bọc trong mo cau khô.
Hắn cầm lên. Còn ấm. Bên trong là hai củ khoai lang nướng, vỏ cháy xém, chắc vừa được moi ra từ đống tro bếp nhà ăn trước khi trời sáng.
Lâm Viễn ngồi yên trên chiếu, ôm gói khoai trong lòng bàn tay, nghe hơi ấm của nó thấm dần qua lớp da chai nứt. Ngoài cửa sổ, trời còn tối đặc. Gió rít qua khe cửa một hồi dài, rồi im.
Hắn bóc một củ, đứng ăn bên cửa sổ. Khoai ngọt, bở, nóng rẫy lưỡi. Hắn nhai chậm, nhìn ra sân tối, nơi những mái nhà tạp dịch chìm trong tuyết như những nắm tay xám khép chặt.
Củ còn lại, hắn bọc kín vào mo cau, nhét vào túi áo trong, sát ngực.
Buổi trưa, nhà ăn ồn ào tiếng bát đũa và tiếng Lão Trương quát bọn thái rau cho nhanh.
Lâm Viễn bưng bát cháo của mình đến chỗ Tiểu Đậu vẫn ngồi, xổ xuống cạnh, đặt củ khoai còn nguyên bọc mo cau xuống bên cạnh bát cháo của gã nhóc.
Hắn không nói gì. Gã nhóc cũng không nói gì.
Đũa của Tiểu Đậu dừng lại nửa nhịp. Rồi gã cúi đầu, tiếp tục húp cháo, chậm hơn thường lệ một chút. Mãi đến cuối bữa, khi xung quanh đã vãn người, gã mới bóc củ khoai ra, ăn từng miếng nhỏ, ăn cả những chỗ vỏ cháy khét mà bình thường gã vẫn bỏ lại.
Lâm Viễn ngồi đối diện, gặm cái bánh bao của mình, nhìn ra sân. Tuyết trên giàn củi đã dày đến đầu gối.
Cả bữa đó, không ai nói với ai một lời nào. Nhưng khi đứng dậy, gã nhóc đặt cái bọc mo cau đã gấp gọn lên đầu gối hắn, ngay ngắn như trả lại một thứ đồ mượn.
Tuần trăng qua đi, chậm và nặng nề như những gánh nước đóng váng冰 (váng băng).
Chuyện Trúc Lâm chìm xuống rất nhanh, theo cách mọi chuyện trong tông môn chìm xuống: không ai nhắc nữa. Một buổi sáng, Lâm Viễn đi qua bảng phân việc ở sân sau, thấy một cái tên ở hàng ngoại môn đệ tử bị gạch bằng một nét mực đậm. Không ai nói người đó đi đâu. Nhà ăn bớt đi một suất cháo, và Lão Trương càu nhàu rằng bớt miệng ăn thì nồi cháo vẫn loãng y như cũ, chẳng biết phần dư trôi về đâu.
Lâm Viễn đứng nhìn nét mực đó ba nhịp thở. Rồi hắn xách gánh nước đi tiếp.
Giữa tháng, hắn thấy Lý Thanh Phong băng qua sân luyện, trong bộ đệ tử thân truyền màu trắng ngà, thanh kiếm thật lần đầu tiên đeo bên hông thay cho kiếm gỗ. Xung quanh gã, mấy sư huynh sư đệ nói cười rạng rỡ. Lâm Viễn đứng ở rìa sân, tay xách xô nước, nhìn theo đúng nửa hơi thở. Nước trong xô sánh ra một chút, ướt ống quần hắn, lạnh buốt. Hắn xách xô đi tiếp, đầu cúi xuống như mọi khi.
Chỉ có điều, từ dạo đó, mỗi tối trước khi nằm xuống, hắn cài then cửa hai lần. Lần thứ nhất bằng tay. Lần thứ hai bằng mắt, nhìn thật kỹ vào cái then gỗ mộc mạc, như thể nó có thể tự mở ra lúc nào không hay.
Cuối tháng, đến phiên hắn quét tuyết sân tây.
Sân tây sát vách núi, vắng người qua lại. Tuyết ở đây chưa ai giẫm lên, phẳng và xốp, lấp lóa dưới ánh nắng yếu. Hắn quét từng nhát chổi đều đặn, soạt, soạt, dồn tuyết thành từng đống tròn như những nắm xôi khổng lồ.
Then chổi hắn khựng lại.
Giữa đám tuyết mới quét hở ra một mảng nền đá, có một chiếc lá trúc.
Khô. Quăn lại. Màu xanh đã bạc thành vàng úa, gân lá nổi rõ như những đường chỉ tay. Nó nằm đó, lạc lõng giữa một sân toàn tuyết và lá tùng.
Lâm Viễn đứng nhìn nó rất lâu. Gió từ vách núi thổi xuống, lay lay mép lá, nhưng chiếc lá đã khô giòn, nặng vừa đủ để không bay đi đâu nữa.
Hắn có thể hỏi. Hắn biết hỏi ai. Hắn biết chỉ cần một câu bâng quơ — dạo này đêm ngươi ngủ có ngon không — là gã nhóc sẽ hiểu, và có thể sẽ nói, và rồi hắn sẽ phải làm một điều gì đó, bất cứ điều gì, và cái tường hắn xây suốt nửa năm nay sẽ nứt toác ra từ đó.
Hắn cúi xuống, quét một nhát chổi.
Chiếc lá trúc lẫn vào đống tuyết, cùng với lá tùng, cùng với bụi đất, cùng với tất cả những thứ rơi xuống sân tây trong mùa đông này. Hắn hót đống tuyết đổ vào sọt, gánh ra sau bếp, đổ vào hố ủ. Xong việc, hắn rửa tay, ngồi xuống bên bếp lò sưởi ấm, ngồi lâu hơn thường lệ một chút, cho đến khi Lão Trương phải hắng giọng đuổi đi chỗ khác cho chật bếp.
Hắn không nghĩ gì về chiếc lá nữa. Ít nhất là hắn tự nhủ với mình như thế, trong lúc hơ tay trên lửa, nhìn ngọn lửa liếm vào đáy nồi cháo đang sôi.
Đêm nào đó sau đấy, hắn không nhớ rõ đêm nào, Lâm Viễn tỉnh giấc vì một âm thanh rất khẽ.
Két.
Cửa phòng hé ra một khe hẹp. Hơi lạnh lùa vào, mang theo mùi tuyết đêm và mùi nhựa thông. Một bóng đen lẻn vào, khép cửa lại, ngồi xuống mép chiếu hắn, co chân lên, run cầm cập trong im lặng. Quần áo bóng đen thoảng mùi sương đêm, và thoảng một mùi hương trầm rất nhạt, không phải thứ trầm hương của nội môn, mà là mùi nhang rẻ tiền của chùa hoang dưới chân núi.
Lâm Viễn nằm quay mặt vào vách, thở đều.
Hắn không mở mắt. Hắn không hỏi. Hắn nằm yên, nghe tiếng răng gã nhóc đánh vào nhau磕 (lập cập) dần dần chậm lại bên cạnh mình.
Rồi, vẫn không mở mắt, hắn duỗi chân, đá tung mép chăn bông ra phía sau.
Bóng đen khựng lại. Im lặng kéo dài chừng năm nhịp thở. Rồi có tiếng sột soạt rất nhẹ, một thân người gầy guộc lạnh ngắt trượt vào trong chăn, nằm co sát mép chiếu, cẩn thận không chạm vào hắn dù chỉ một gang tay.
Ngoài kia, tuyết rơi trên mái ngói, lộp độp, lộp độp, đều như tiếng mõ canh.
Lâm Viễn nghe tiếng thở bên lưng mình dần dần chìm xuống, sâu và nặng, của một đứa trẻ đã đi bộ cả đêm và cuối cùng cũng được ngồi xuống.
Hắn nhắm mắt, ngủ tiếp.
Đêm ba mươi Tết, gió lặng hẳn.
Lâm Viễn làm xong phiên trực cuối, về phòng khi canh đã khuya. Trong phòng, lão Chu đã ngáy, mấy gã tạp dịch khác cũng đã cuộn chăn kín mít. Hắn thổi tắt ngọn đèn dầu mượn được ở nhà bếp, khép cửa lại, rồi đứng trước cánh cửa tối om đó, tay đưa lên cái then gỗ.
Tay hắn dừng lại.
Đã bao nhiêu đêm rồi, hắn nhận ra, hắn không cài then nữa. Không phải vì quên. Mỗi tối, tay hắn vẫn đưa lên chỗ then cài, vẫn chạm vào miếng gỗ mòn nhẵn, rồi lại hạ xuống, như tối nay.
Hắn đứng yên một lúc, nghe tiếng gió ngoài sân thổi qua giàn củi khô.
Rồi hắn hạ tay xuống, không cài then, quay vào nằm xuống chiếu, kéo chăn lên tận cằm. Hơi lạnh luồn qua khe cửa hở, đọng thành một vệt trăng mờ run rẩy trên nền đất.
Mai là ngày cuối năm. Nhà bếp sẽ hầm thịt từ sớm, và Lão Trương thế nào cũng giấu riêng một miếng nạc dày cho đứa nào mò xuống bếp đầu tiên. Hắn định xuống thật sớm. Hắn đã định như thế từ ba hôm trước.
Lâm Viễn nhắm mắt lại.
Cánh cửa sau lưng hắn vẫn để ngỏ then cài, im lặng hứng lấy cả mùa đông.
', NULL, 0, '2026-10-01 09:18:10.052277+00', '2026-10-01 09:18:10.052278+00');
INSERT INTO public."Chapters" VALUES ('94cf3a07-f3e3-471a-a9ae-b5f0196a189b', 'd494a899-66b6-4a98-82b2-c8a2662f60a2', 1, 'Căn phòng đèn đỏ chiều mưa', 'Mưa tháng Mười rơi trên mái tôn dãy C thành một thứ tiếng động đều đến mức gần như gây nghiện.
Năm giờ mười lăm phút chiều. Hành lang tầng hai vắng tanh. Cửa các lớp đã khóa từ bốn giờ, bảng đen còn sót lại nửa dòng bài tập toán chưa xóa hết, cây thước gỗ nằm nghiêng trong góc. Nước từ máng tôn nhỏ xuống nền xi măng thành từng vũng loang dài, phản chiếu ánh sáng xám xịt hắt từ cửa sổ. Dưới sân, cột cờ ướt sũng đứng im giữa màn mưa, trông như một đứa học sinh bị phạt đứng mà quên mất mình đang buồn.
Bác bảo vệ sẽ khóa cổng chính lúc năm rưỡi. Tôi nhớ chính xác, vì học kỳ nào tôi cũng thuộc nhóm vài đứa ở lại sau cùng.
Không phải vì chăm. Vì tôi trốn trực nhật.
Phòng tối của câu lạc bộ nhiếp ảnh nằm cuối hành lang dãy C, là chỗ duy nhất trong trường không ai buồn tìm tôi. Cửa khép hờ. Bên trong bật thứ đèn đỏ quạch như đèn bể cá. Trên bàn, ổ bánh mì mua từ trưa đã nguội ngắt, lớp pate đông lại thành một màng mờ. Điện thoại tôi úp mặt xuống cạnh ổ bánh. Nhóm chat "Tổ 4 – 11B" vừa nhảy lên ba mươi bảy tin nhắn. Tôi thấy thông báo. Tôi nhìn sang chỗ khác. Không phải giận dỗi gì. Chỉ là trả lời thì mai phải vác chổi lên lớp, mà hôm nay tôi đã quyết định mình không tồn tại với ai cả.
Trong phòng tối có mùi thuốc rửa ảnh. Hăng hăng, hơi ngọt, ngửi lâu thì quen, quen rồi thì thành nhớ. Ba dải phim từ tuần trước còn treo trên dây, đung đưa rất khẽ theo luồng gió lọt qua khe cửa, trông như mấy cọng rong biển phơi trong ánh đèn đỏ. Chiếc máy phóng ảnh phủ khăn vải ngồi im ở góc, như con thú ngủ.
Tôi cắn một miếng bánh mì nguội, nhai chậm, nghe mưa. Ngoài cửa sổ, trời đã chuyển sang màu mực loãng.
Rồi cửa phòng mở ra. Không một tiếng gõ.
Gió và nước mưa tràn vào trước, làm ngọn đèn đỏ lay động, cả căn phòng chao đi một nhịp. Rồi một người bước vào, kéo cửa khép lại đằng sau, đứng thở dốc.
Một đứa con gái. Áo đồng phục ướt sũng nửa vai, tóc bết vào má, tay ôm chặt chiếc cặp sách trước ngực như ôm một đứa trẻ. Nước từ ống tay áo nhỏ xuống nền gạch, tỏng, tỏng, nhanh hơn tiếng mưa ngoài máng tôn.
Chúng tôi nhìn nhau chừng hai giây. Trong phòng chỉ còn tiếng thở của nó và tiếng mưa.
"Đây là phòng rửa ảnh hả?" nó hỏi.
"Ừ."
"Có người biết rửa phim đúng không? Ý tớ là phim cuộn ấy, phim âm bản ấy, không phải chụp bằng điện thoại đâu, cậu đừng nhìn tớ như tớ vừa hỏi mua vé số trong chùa."
Tôi nhai hết miếng bánh trong miệng rồi mới đáp. "Tớ rửa được. Nhưng hôm nay tớ không nhận việc."
Nó không đi ra. Nó bước thêm hai bước vào trong, đặt chiếc cặp ướt lên bàn gỗ, mở khóa kéo bằng những ngón tay còn run vì lạnh, lôi ra một hộp nhựa đựng cuộn phim, bên ngoài đọng đầy nước.
"Nó bị ướt," nó nói, nhanh, rất nhanh, như sợ nói chậm thì tôi đổi ý. "Lúc tớ chạy qua cổng trời mưa to, túi tớ hở, nước vào hết bên trong, tớ không biết trong máy còn cuốn chưa rửa, nó nằm trong đó từ hè, ý tớ là từ đầu năm, và nếu mà hỏng thì..."
Nó dừng lại. Chớp mắt. Liên tục ba bốn cái liền.
"...thì cũng không sao lắm," nó nói tiếp, giọng nhỏ xuống. "Nhưng mà cậu cứu được không?"
Tôi nhìn hộp nhựa trên tay nó. Nước đọng ở nắp. Loại hộp này không kín, ngâm lâu thì coi như xong. Tôi đặt ổ bánh mì xuống, đứng dậy, vặn công tắc đèn thường tắt phụt, chỉ còn ánh đèn đỏ.
"Sao đèn đỏ vậy?" nó nheo mắt.
"Để phim không chết."
"Nghe như phim kinh dị."
"Ừ," tôi nói. "Kinh dị nhất là lúc tớ đang đổ thuốc mà có người đứng sau lưng tớ."
Nó cười hì một tiếng, rồi chắc tự thấy tiếng cười của mình không hợp hoàn cảnh, nên ngồi xuống chiếc ghế đẩu, hai tay vẫn ôm chiếc cặp vào lòng, mắt dõi theo từng cử động của tôi.
"Ngồi đó," tôi nói. "Đừng đụng vào gì hết. Kể cả cái công tắc."
"Ừ. Tớ biết rồi. Tớ không đụng."
Tôi mở hộp nhựa bằng một tay, tay kia giữ cuộn phim trong túi vải đen. Ngón tay tôi quen việc này hơn quen việc giơ tay phát biểu: tách nắp, lôi ruột phim, quấn vào trục cuốn của tank rửa, tất cả trong bóng tối đặc, không một hạt sáng lọt vào. Tiếng nắp tank vặn kêu kách một tiếng khô khốc.
"Nước ấm," tôi lẩm bẩm, chế nước từ phích vào bình trộn, nhìn nhiệt kế nhích lên vạch hai mươi độ. "Phim ướt rồi thì rửa liều thôi. Được ăn cả, ngã về không."
"Cậu nói nghe sợ thế."
"Thật đấy."
Tôi đổ thuốc vào tank. Vặn nắp. Lắc.
Cạch. Cạch. Cạch.
Tiếng tank va vào lòng bàn tay tôi theo nhịp đều đặn, ba mươi giây một lần, xen giữa là tiếng mưa trên mái tôn và tiếng ghế đẩu kẽo kẹt mỗi lần nó đổi tư thế. Mười một phút chờ thuốc ngấm, tôi đếm được nó đổi tư thế chín lần. Đến phút thứ sáu, tôi liếc thấy môi nó mấp máy đếm thầm theo nhịp lắc của tôi. Nó bắt được nhịp trước cả tôi một tiếng cạch. Tôi không nói gì. Nhưng tự dưng tôi lắc đúng nhịp hơn một chút, như để cho đứa kia đếm khỏi hụt.
"Trong phim chụp gì?" tôi hỏi, mắt vẫn nhìn đồng hồ bấm giờ.
"Chẳng có gì quan trọng đâu."
Nó đáp nhanh. Và chớp mắt liên tục. Tôi không ngẩng lên. Tôi gật gù một tiếng, đổ thuốc tráng ra, rót thuốc hãm vào, để câu trả lời của nó trôi đi cùng nước thải.
Trên ghế, chiếc cặp của nó bỗng rung lên bần bật. Một ánh sáng trắng xanh lóe qua khe khóa kéo, soi rõ mấy giọt nước trên mặt gỗ: màn hình điện thoại, dòng chữ nhấp nháy hai chữ Mẹ gọi.
Nó nhìn chiếc cặp. Rồi kéo vạt áo phủ lên, ấn nhẹ xuống, như người ta đắp chăn cho một đứa trẻ đang khóc dở.
Màn hình tắt ngấm. Cuộc gọi nhỡ nằm lại trong túi, không ai trả lời.
Tôi nhìn sang chỗ khác, vặn vòi xả cuộn phim lần cuối.
"Xong phần thô," tôi nói, treo dải phim ướt lên dây, kẹp hai đầu bằng kẹp sắt. "Nhưng phải chờ khô rồi phóng ra giấy mới biết cứu được bao nhiêu kiểu. Thứ Năm cậu quay lại."
"Thứ Năm?" nó nhắc lại, rồi gật nhanh. "Ừ. Thứ Năm. Tiết bốn tớ trống. Mà cậu tên gì?"
"Nam."
"Tớ là Miên. 11A4." Nó đứng dậy, phủi quần dù quần vẫn ướt. "Hôm nay cảm ơn cậu. Tớ không có tiền trả trước đâu, nhưng tớ để cái này làm tin."
Nó lục túi áo, lôi ra một viên kẹo dâu bọc giấy bóng kính, đặt lên bàn, cạnh ổ bánh mì nguội của tôi. Viên kẹo lăn một vòng rồi nằm im, đỏ lừ dưới ánh đèn.
"Không cần—" tôi bắt đầu.
Nhưng cửa phòng đã khép lại sau lưng nó.
Tôi ra cửa sổ nhìn xuống. Dưới sân, nó chạy xuyên mưa với chiếc cặp giơ lên đầu, đôi giày trắng tát nước lép bép, dáng chạy nghiêng nghiêng như người vừa quên mất thứ gì ở đằng sau. Trên mắc cửa phòng tôi còn treo cây ô đen của câu lạc bộ. Tôi nhìn cây ô. Rồi nhìn xuống sân, nơi bóng nó đã khuất sau dãy nhà xe.
Tôi không chạy theo. Tôi đứng thêm một lúc, rồi quay vào, ngồi xuống ghế, bóc viên kẹo dâu cho vào miệng.
Kẹo ngọt gắt. Ngọt kiểu kẹo chợ, ngọt đến mức tôi phải nhíu mày.
Tờ giấy bóng kính tôi vuốt phẳng ra, ấn xuống dưới hộp phim rỗng trên bàn. Cho khỏi bay. Chỉ thế thôi.
Trên dây, dải phim ướt nhỏ nước tỏng, tỏng vào chậu nhựa. Chưa lộ ra hình gì cả, chỉ một màu nâu sẫm bóng loáng dưới đèn đỏ. Muốn thấy nó chụp gì, phải chờ phim khô, chờ giấy bắt sáng, chờ thuốc hiện hình loang dần trên khay men.
Hôm nay thứ Hai.
Tôi không có thói quen đếm ngày trong tuần. Thế mà lúc tắt đèn đỏ, khóa cửa phòng tối và bước ra hành lang ướt sũng, tôi lại nhẩm ra một điều rất rõ ràng:
Còn ba ngày nữa mới đến thứ Năm.
', NULL, 0, '2026-10-01 09:32:33.482444+00', '2026-10-01 09:32:33.482444+00');
INSERT INTO public."Chapters" VALUES ('b97d28c8-f23c-4549-961b-116a7280d18a', 'd494a899-66b6-4a98-82b2-c8a2662f60a2', 2, 'Ba ngày đếm ngược', 'Thứ Hai, chín giờ bốn mươi lăm phút tối.
Tôi về nhà lúc chín rưỡi. Căn hộ tầng ba khu tập thể cũ, cửa sắt kéo kêu ken két mỗi lần mở. Mẹ tôi làm ca đêm ở nhà máy dệt, tuần này là tuần ca, đi từ bảy giờ tối đến năm giờ sáng hôm sau. Tủ lạnh trống, chỉ còn nửa hộp sữa chua và một bịch bánh quy bơ mở từ hôm qua. Tôi ăn hai cái bánh quy, uống nửa cốc nước lọc, rồi ngồi xuống bàn học.
Bài tập toán bốn trang. Vật lý hai trang. Tiếng Anh một bài đọc hiểu về chủ đề "My Future". Tôi nhìn dòng chữ My Future một lúc, rồi lật sang trang sau, làm bài tập điền từ.
Trên góc bàn, tờ giấy bóng kính kẹo dâu được tôi vuốt phẳng, ép dưới cuốn từ điển Anh-Việt cũ. Không có lý do gì đặc biệt. Chỉ là tôi sợ nó bay mất khi mở cửa sổ.
Mười một giờ, tôi tắt đèn. Nằm xuống giường, nghe tiếng quạt trần quay đều trên đầu. Ngoài cửa sổ, mưa đã tạnh từ chiều, nhưng không khí vẫn ẩm, nặng mùi đất. Tôi nhắm mắt, đếm nhịp quạt. Một, hai, ba, bốn...
Không ngủ được.
Tôi mở mắt, nhìn lên trần nhà. Vết nứt chạy dọc từ góc tường ra giữa trần, giống một dòng sông khô. Tôi nhớ đến cái chớp mắt liên tục của Miên khi nói "chẳng có gì quan trọng đâu". Tôi nhớ đến ánh sáng trắng xanh lóe qua khe khóa kéo, hai chữ Mẹ gọi. Tôi nhớ đến dáng chạy nghiêng nghiêng dưới mưa, chiếc cặp giơ lên đầu như một mái nhà di động.
Tôi trở mình, quay mặt vào tường.
Ba ngày nữa mới đến thứ Năm.
Thứ Ba, bảy giờ mười lăm phút sáng.
Lớp 11B ồn ào như mọi ngày. Tôi ngồi bàn cuối, sát cửa sổ, tai đeo một bên earbud, nghe podcast về lịch sử nhiếp ảnh. Giọng người dẫn đều đều, nói về Henri Cartier-Bresson và "khoảnh khắc quyết định". Tôi nhìn ra sân, nơi mấy đứa lớp 10 đang đá cầu.
"Nam, tối qua mày làm bài tập toán chưa?"
Thắng, tổ trưởng, đứng trước bàn tôi, tay cầm cuốn vở mở sẵn. Tôi tháo một bên tai nghe. "Rồi."
"Cho tao mượn chép nhanh, tiết một cô kiểm tra."
Tôi mở cặp, lôi cuốn vở ra, đẩy sang. Thắng vồ lấy, ngồi xuống bàn bên cạnh, chép như máy. Tôi đeo lại tai nghe, tiếp tục nhìn ra sân.
Giờ ra chơi, tôi xuống căng tin mua một hộp sữa đậu nành. Đứng dựa vào gốc cây bàng, uống chậm, nhìn dòng người qua lại.
Rồi tôi thấy nó.
Miên. Đi cùng hai đứa con gái khác, tay ôm một chồng sách, cười nói gì đó. Nó mặc đồng phục khô ráo, tóc buộc gọn, không còn ướt sũng như chiều hôm qua. Nó đi ngang qua tôi, cách chừng năm mét, không nhìn sang.
Tôi uống hết hộp sữa, ném vỏ vào thùng rác, rồi lên lớp.
Tiết ba, giờ văn, cô giảng về "Chí Phèo". Tôi ngồi vẽ nguệch ngoạc vào góc vở: một cái tank rửa phim, một viên kẹo dâu, một chiếc ô đen. Rồi tôi gạch bỏ, vẽ lại một cái cây. Rồi gạch bỏ tiếp.
Cuối giờ, cô gọi tôi ở lại.
"Nam, em nộp bài luận ''Người ảnh hưởng nhất đến em'' chưa?"
"Dạ chưa, cô."
"Hạn là thứ Sáu. Em nhớ nộp."
"Dạ."
Tôi ra khỏi lớp, đi về phía cầu thang. Trong đầu tôi, câu hỏi của cô lặp lại: Người ảnh hưởng nhất đến em. Tôi nghĩ đến mẹ, làm ca đêm, ít nói, để tiền trên bàn mỗi sáng. Tôi nghĩ đến bố, đã rời đi khi tôi tám tuổi, để lại một chiếc máy ảnh Canon AE-1 và một lời hứa không bao giờ giữ. Tôi nghĩ đến chiếc máy ảnh đó, giờ nằm trong tủ kính ở phòng khách, phủ một lớp bụi mỏng.
Tôi không viết được câu nào.
Thứ Tư, mười một giờ đêm.
Tôi ngồi trong phòng tối, một mình.
Đèn đỏ bật. Mùi thuốc rửa ảnh quen thuộc. Ba dải phim từ tuần trước đã khô, tôi cắt ra từng khung, soi lên ánh đèn. Một bức ảnh chụp cột cờ lúc hoàng hôn, một bức chụp con mèo hoang nằm trên bậu cửa sổ, một bức chụp bàn tay tôi đang cầm bút. Không có gì đặc biệt.
Tôi đặt chúng xuống, nhìn sang dải phim ướt của Miên, giờ đã khô, treo trên dây, cuộn tròn lại theo quán tính. Tôi tháo kẹp, trải nó ra trên bàn, soi từng khung dưới đèn loupe.
Khung 1: một góc trời, mây trắng, không rõ lắm.
Khung 2: một bàn tay, ngón thon, đang cầm gì đó.
Khung 3: một bóng người, quay lưng, áo trắng.
Khung 4: trống.
Khung 5: một cái cây, lá xanh.
Khung 6: một khuôn mặt, cười, nhưng mờ.
Khung 7: một chiếc ghế đá, trống.
Khung 8: một bầu trời đêm, có sao.
Tôi nhìn từng khung, cố đoán xem nó chụp gì. Bàn tay đó là của ai? Bóng người quay lưng là ai? Khuôn mặt cười đó là ai? Tại sao có khung trống? Tại sao có chiếc ghế đá trống?
Tôi không biết.
Tôi tắt đèn, khóa cửa, về nhà.
Đêm đó, tôi mơ thấy một cơn mưa. Mưa rơi trên mái tôn, tiếng lộp độp, lộp độp. Tôi đứng dưới sân, nhìn lên cửa sổ tầng hai, nơi một ngọn đèn đỏ bật sáng. Có ai đó đứng sau cửa sổ, nhìn xuống tôi. Tôi không thấy rõ mặt. Chỉ thấy một bàn tay áp lên kính, để lại một vệt hơi nước.
Tôi tỉnh dậy lúc bốn giờ sáng. Mồ hôi ướt áo. Tôi uống một cốc nước, rồi ngồi chờ trời sáng.
Thứ Năm, mười giờ ba mươi phút sáng.
Tiết bốn trống. Tôi ngồi trong phòng tối, chờ.
Đèn đỏ bật. Khay thuốc tráng đã pha sẵn, nhiệt độ hai mươi độ. Giấy in ảnh cắt sẵn, xếp gọn trong hộp kín. Tôi lấy dải phim của Miên xuống, đặt vào máy phóng, chỉnh tiêu cự, vặn timer.
Mười một giờ đúng.
Cửa phòng mở ra. Không gõ.
Miên bước vào, tay xách một túi nilon, bên trong có hai hộp cơm. Nó mặc áo khoác mỏng, tóc buộc cao, mặt hơi tái, như vừa chạy từ đâu đến.
"Cậu đến sớm," tôi nói.
"Tớ trốn tiết thể dục," nó đáp, đặt túi nilon lên bàn. "Cơm trưa, tớ mua hai suất. Coi như trả công."
Tôi không từ chối. Tôi bật máy phóng, ánh sáng trắng chiếu xuống khay thuốc tráng, rồi tắt. Tôi nhấc tờ giấy in ảnh ra, thả vào khay.
Chúng tôi cùng nhìn xuống.
Trong khay men trắng, hình ảnh bắt đầu hiện lên, từ từ, như một ký ức trôi về từ rất xa. Đầu tiên là những đường viền mờ, rồi bóng tối loang ra, rồi chi tiết rõ dần.
Một bầu trời. Mây trắng. Và một chiếc diều, dây đứt, bay cao.
Miên thở hắt ra một tiếng, rất nhẹ.
Tôi nhấc tờ giấy ra, thả vào khay hãm, rồi phóng tiếp tấm thứ hai.
Một bàn tay. Ngón thon, cầm một que kem. Nền là một công viên, cây xanh, nắng.
Tấm thứ ba.
Một bóng người. Quay lưng. Áo trắng. Đứng trước một cánh cổng sắt, tay xách cặp.
Miên không nói gì. Nó chỉ nhìn, mắt không chớp.
Tấm thứ tư. Trống. Chỉ một màu xám đều.
Tấm thứ năm. Một cái cây. Lá xanh. Gốc cây có khắc hai chữ, nhưng mờ, không đọc được.
Tấm thứ sáu.
Một khuôn mặt. Cười. Mắt híp lại. Nhưng mờ, như chụp qua lớp kính mờ.
Miên đưa tay lên, che miệng. Nó không khóc. Nhưng vai nó run lên, rất nhẹ.
Tôi không hỏi. Tôi phóng tiếp tấm thứ bảy.
Một chiếc ghế đá. Trống. Bên cạnh có một chiếc lá rơi.
Tấm thứ tám.
Một bầu trời đêm. Có sao. Và một vệt sáng, như sao băng, hoặc như ánh đèn từ xa.
Tôi tắt máy phóng. Bật đèn thường. Ánh sáng trắng tràn vào, khiến cả hai chúng tôi nheo mắt.
Miên đứng đó, nhìn tám bức ảnh trải trên bàn, tay vẫn che miệng. Nó hít vào một hơi thật sâu, rồi hạ tay xuống. Khóe mắt nó đỏ, nhưng không có nước mắt.
"Cảm ơn cậu," nó nói, giọng khàn. "Tớ tưởng mất hết rồi."
"Cậu chụp ai?" tôi hỏi.
Nó nhìn tôi, rồi nhìn xuống tấm thứ ba, nơi bóng người quay lưng đứng trước cánh cổng sắt.
"Một người đã đi xa," nó nói. "Rất xa."
Tôi không hỏi thêm. Tôi gom tám bức ảnh lại, kẹp vào một cuốn sổ cũ, đưa cho nó.
"Giữ cẩn thận," tôi nói. "Ảnh mới in, dễ hỏng."
Nó cầm cuốn sổ, ôm vào ngực, như chiều hôm qua nó ôm chiếc cặp ướt.
"Cậu tên Nam, đúng không?" nó hỏi lại, dù đã hỏi hôm thứ Hai.
"Ừ."
"Tớ là Miên. 11A4. Cảm ơn cậu, Nam."
Nó quay ra cửa, rồi dừng lại, quay đầu.
"Thứ Hai tuần sau, tớ mang tiền đến trả."
"Không cần," tôi nói.
"Nhưng tớ muốn trả," nó đáp, rồi bước ra, khép cửa lại.
Tôi đứng đó, nhìn tám bức ảnh còn ướt trên bàn, nhìn hai hộp cơm nguội trên bàn, nhìn viên kẹo dâu mới nó đặt cạnh đó, đỏ lừ.
Tôi không biết người trong ảnh là ai. Không biết tại sao nó không trả lời cuộc gọi của mẹ. Không biết tại sao nó chụp một chiếc ghế đá trống, một bầu trời đêm, một chiếc diều đứt dây.
Nhưng tôi biết một điều.
Rằng từ giờ, mỗi khi nhìn thấy một chiếc ghế đá trống, tôi sẽ nhớ đến tấm ảnh đó. Và nhớ đến nó.
Tôi ngồi xuống ghế, mở hộp cơm ra, ăn chậm, nghe mưa ngoài mái tôn.
Mưa tháng Mười, vẫn rơi, vẫn đều, vẫn gây nghiện.
Và tôi, lần đầu tiên, không thấy chán.', NULL, 0, '2026-10-01 09:35:48.307398+00', '2026-10-01 09:35:48.307398+00');
INSERT INTO public."Chapters" VALUES ('66727e6e-d421-41d2-bcec-f9b7ccddbf40', 'd494a899-66b6-4a98-82b2-c8a2662f60a2', 3, 'Nắng hanh', 'Thứ Hai, tờ thông báo được dán lên bảng tin Đoàn trường lúc nào không ai hay.
Tôi thấy nó vào giờ ra chơi, giữa bản danh sách thi đua và lịch tiêm vắc-xin. Một tờ A4 đánh máy, tiêu đề in đậm: V/v rà soát câu lạc bộ học kỳ II. Bên dưới là danh sách những cái tên sắp chết: Câu lạc bộ Cờ vua. Câu lạc bộ Tiếng Anh. Và Câu lạc bộ Nhiếp ảnh — gạch đầu dòng kèm chú thích nhỏ: 01 thành viên. Đề nghị giải thể, bàn giao phòng chức năng trước 30/11.
Tôi đứng trước bảng tin đúng bằng thời gian đọc xong tờ thông báo hai lần.
Rồi tôi sờ vào túi áo. Chìa khóa phòng tối vẫn nằm đó, cục đồng nhỏ mòn nhẵn cạnh răng cưa. Tôi sờ nó như người ta sờ ví tiền sau khi nghe tin chợ sắp dỡ. Chuống vào lớp reo lên từ đâu đó, tôi xếp hàng vào lớp như mọi ngày, mặt không đổi.
Tiết một, Thắng lại quay xuống mượn vở toán. Tôi đẩy sang. Tiết hai, cô văn trả bài kiểm tra, tôi được sáu điểm, bằng đúng kỳ vọng của mình. Suốt bốn tiết, trong đầu tôi chạy một bản kê khai rất chậm, rất đầy đủ, như thể ai đó bắt tôi bàn giao thật:
Ba chai thuốc tráng dán nhãn bằng bút dạ, chữ tôi viết. Chiếc máy phóng phủ khăn vải. Ba sợi dây phơi và mười hai cái kẹp sắt. Cuốn sổ sinh hoạt câu lạc bộ dày đến năm 2019 thì đứt quãng, bìa sổ còn vết mực của anh khóa trên nào đó. Cây ô đen của Đoàn. Chiếc Zenit kẹt màn trập từ năm ngoái. Và trên nền gạch, sát mép bàn gỗ, hai vệt nước hình dấu phẩy đã khô từ chiều mưa tuần trước — nước nhỏ từ ống tay áo ướt của Miên. Tôi chưa lau. Tôi tự nhủ để nó tự bay hơi, gạch men thì biết gì mà nhớ.
Trưa đó tôi không xuống phòng tối. Tôi ngồi ăn cơm ở ghế đá dưới cây bàng, nhìn sang dãy C từ xa. Nắng hanh đầu mùa trải lên mái tôn một lớp vàng nhạt, khô và mỏng như giấy nến. Cả tuần mưa, hôm nay trời hửng. Tôi ngồi nhìn cái phòng cuối hành lang đang hửng nắng, nhai cơm chậm, và thấy miệng mình nhạt hơn thường lệ một chút.
Chiều, tôi vẫn lên đó. Thói quen là thứ không cần lý do.
Hai tiếng gõ khẽ vang lên trước khi cửa mở. Tôi ngẩng lên khỏi cuốn sổ sinh hoạt.
Miên đứng ở khung cửa, tóc buộc cao, tay cầm một phong bì trắng. Hôm nay nó không ướt. Nó bước vào, đặt phong bì lên bàn, cạnh hộp phim rỗng đựng mấy tờ giấy kẹo dâu tôi vuốt phẳng.
"Tớ mang tiền đến."
"Tớ nói không cần mà."
"Nhưng tớ muốn trả." Nó nói nhanh, rồi chớp mắt. Liên tục. "Với lại tớ nghe nói... câu lạc bộ của cậu sắp bị giải thể hả?"
Tôi nhìn phong bì. Rồi nhìn ra cửa sổ, nơi nắng hanh đang rút dần khỏi mái tôn.
"Thông báo dán từ sáng," tôi nói. "Dưới hai thành viên thì giải thể. Phòng bàn giao cho Đoàn cuối tháng. Thuốc tẩy, máy móc, dây phơi, dọn hết."
"Thế cậu tính sao?"
"Không tính sao." Tôi nhún vai, nghe chính giọng mình phẳng như mặt bàn. "Phòng của trường mà. Họ đòi thì trả."
Miên im lặng một lúc. Nó nhìn quanh căn phòng đèn đỏ: ba chai thuốc, máy phóng phủ khăn, dây phơi, và hai vệt nước hình dấu phẩy trên gạch mà nó chắc nhận ra trước tôi.
Rồi nó đẩy phong bì về phía tôi.
"Câu lạc bộ cần mấy người?" nó hỏi.
"Hai. Tối thiểu hai."
"Thế còn một suất." Nó chỉ vào ngực mình, ngón trỏ gõ gõ lên túi áo đồng phục. "Tớ."
Tôi nhìn nó. Nó nhìn lại, nói nhanh hơn, như sợ tôi chen vào: "Tớ biết rửa phim chưa? Chưa. Nhưng tớ học nhanh, tớ chép bài nhanh, tớ viết kế hoạch hoạt động cũng được, chữ tớ đẹp lắm, với lại tớ trốn tiết thể dục giỏi nên thứ Năm nào tớ cũng trống, cậu không lỗ gì hết, thật đấy, cậu cứ tính đi—"
Nó chớp mắt. Liên tục.
Tôi bỗng nhớ chiều mưa tuần trước, trong ánh đèn đỏ, nó cũng chớp mắt y như thế khi nói chẳng có gì quan trọng đâu. Lúc đó tôi tin chắc nó nói dối. Bây giờ, nhìn nó chớp mắt giữa một câu không có chữ nào dối trá, tôi hiểu ra mình đã đọc sai một thứ: hóa ra có người chớp mắt không phải vì đang nói dối, mà vì đang sợ bị từ chối.
Tôi không nói ra điều đó. Tôi kéo cuốn sổ sinh hoạt câu lạc bộ từ trong ngăn bàn ra, lật đến trang giấy trắng cuối cùng, đẩy sang cùng một cây bút bi.
"Khai vào," tôi nói. "Họ tên, lớp, chữ ký. Kế hoạch hoạt động thì nộp cho cô Vân dạy văn, cô ký xong đưa lên Đoàn trước thứ Sáu."
Miên cầm bút nhanh như sợ tôi đổi ý. Nó viết, đầu lưỡi hơi thè ra bên khóe miệng. Tôi nhìn nghiêng thấy dòng chữ nghiêng nghiêng, đều tăm tắp: Nguyễn Trúc Miên — 11A4.
Xong nó ngẩng lên, chìa bút về phía tôi. "Đến lượt cậu. Câu lạc bộ hai người thì phải đủ hai chữ ký chứ."
"Tớ ký làm gì, tớ là thành viên cũ."
"Thành viên cũ cũng phải ký lại." Nó gõ gõ đầu bút xuống trang giấy. "Quy định tớ vừa đặt ra đấy."
Tôi cầm bút. Ký: Trần Nhật Nam — 11B.
Miên nghiêng đầu đọc, đọc thành tiếng, nhỏ như hơi thở: "Trần Nhật Nam..." Rồi nó ngẩng lên, khóe miệng nhếch một cái: "Tên cậu có chữ Nam. Tên tớ có chữ Miên. Ghép lại thành Nam Miên. Nghe như tên một cái trạm xe buýt."
"Ừ," tôi nói, gập sổ lại trước khi nó kịp đặt thêm tên nào nữa. "Trạm Nam Miên, chuyến năm giờ rưỡi, bác bảo vệ khóa cổng."
Nó cười thành tiếng lần đầu tiên trong căn phòng này. Tiếng cười ngắn, hơi vỡ, rồi nó vội vàng ho một cái để chữa, như thể tiếng cười vừa rồi trốn tiết khỏi một đứa vốn dĩ nghiêm túc hơn nhiều.
Điện thoại trong túi áo nó rung lên bần bật. Nó liếc màn hình, rồi lật úp máy xuống mặt bàn, nhẹ nhàng, dứt khoát, y như chiều mưa hôm đó. Ánh sáng trắng xanh tắt ngấm dưới lưng máy.
Lần thứ hai tôi thấy nó làm vậy. Tôi nhìn sang chai thuốc tráng, vặn nắp chai dù nắp đã chặt.
"Thứ Năm nhé," Miên đứng dậy, phủi quần, giọng đã trở lại nhịp nhanh thường lệ. "Không phải để rửa ảnh đâu. Để sinh hoạt câu lạc bộ. Thành viên mới phải được dạy việc, đúng quy định cậu vừa ký đấy."
"Ừ."
Nó ra đến cửa thì dừng lại, không quay đầu, chỉ nói với vào: "Phong bì đừng mở trước thứ Năm đấy."
Rồi cửa khép. Nắng hanh ngoài cửa sổ đã tắt hẳn, chỉ còn ánh đèn đỏ quạch lên mấy chai thuốc và hai cái bóng trên tường: một cái ngồi, một cái vừa mang đi mất nửa căn phòng.
Tối hôm đó, ở nhà, tôi vẫn mở phong bì.
Tôi biết mình không nên mở. Nhưng có những cái phong bì mà nếu không mở, người ta sẽ mất ngủ, và tôi thì đã mất ngủ đủ đêm thứ Hai tuần trước rồi.
Bên trong không có tiền.
Có một cuộn phim mới, còn nguyên hộp giấy bạc. Và một mẩu giấy gấp tư, chữ nghiêng nghiêng đều tăm tắp:
"Trả công bằng hiện vật. Kèm điều kiện: thứ Năm chụp tớ một kiểu, bằng máy của chính cậu. Cấm dùng máy câu lạc bộ, tớ nghe nói nó kẹt màn trập từ năm ngoái rồi. Chụp xong phải cho tớ xem ngay, không được giấu."
Tôi đọc mẩu giấy hai lần. Lần thứ ba thì tôi đứng dậy, đi ra phòng khách.
Tủ kính đứng sát tường, bên trong là chiếc Canon AE-1 màu bạc, dây da nứt nẻ, nắp ống kính còn nguyên vết xước hình lưỡi liềm. Bụi phủ một lớp mỏng đều như tuyết rơi trong nhà kín. Bảy năm nay nó nằm đó, từ cái ngày bố tôi xách túi đi ra khỏi cửa và để lại thứ duy nhất ông ấy chưa kịp bán. Bảy năm nay tôi lau tủ kính mỗi chủ nhật, và chưa một lần mở khóa.
Tôi đứng trước tủ rất lâu. Đủ để bóng mình trong mặt kính mờ đi vì hơi thở.
Rồi tôi tắt đèn phòng khách, về phòng, nằm xuống. Quạt trần quay đều trên đầu. Một, hai, ba, bốn...
Còn ba ngày nữa mới đến thứ Năm.
Dạo này tôi đếm ngày giỏi hẳn ra.', NULL, 0, '2026-10-01 09:38:22.325399+00', '2026-10-01 09:38:22.325399+00');
INSERT INTO public."Chapters" VALUES ('487fad39-4a67-4b75-a28d-105e9e6433ae', 'd494a899-66b6-4a98-82b2-c8a2662f60a2', 4, 'Mười bảy kiểu chưa rửa', 'Mẹ tôi về nhà vào sáng thứ Tư, lúc năm giờ mười lăm, khi trời vừa hửng và khu tập thể còn ngập trong mùi sương đêm lẫn mùi than tổ ong.
Tôi đợi ở bàn ăn, nơi mẹ đặt xấp tiền chợ như mọi lần. Mẹ tháo khăn, rửa tay, chưa kịp ngồi xuống thì tôi nói:
"Mẹ. Chìa khóa tủ kính đâu mẹ?"
Tay mẹ dừng lại trên vành chậu nước.
Rất lâu. Đủ để nước trong chậu thôi gợn và mặt mẹ trong gương mờ phía trên chậu nước thôi dao động. Mẹ không quay lại.
"Trong hộp bánh quy," mẹ nói cuối cùng, giọng đều như đọc bảng phân ca. "Góc tủ bếp."
Rồi mẹ bước được hai bước, dừng ở cửa buồng, lưng vẫn quay về phía tôi:
"Lau bụi rồi hãy dùng. Máy ấy nhạy lắm."
Cửa buồng khép lại. Tôi ngồi yên thêm một lúc, nghe tiếng giường sắt kêu kẽo kẹt sau cánh cửa gỗ ép. Bảy năm, mẹ chưa một lần nhắc đến chiếc tủ kính. Bảy năm, mẹ lau bụi nó mỗi chủ nhật, đều như chấm công.
Đêm thứ Tư, tôi mở tủ.
Chiếc Canon AE-1 nằm trong lớp bụi mỏng đều như tuyết rơi trong nhà kín. Tôi nhấc nó ra bằng cả hai tay, nặng hơn tôi nhớ, hoặc có thể tay tôi đã yếu đi vì bảy năm chỉ cầm mỗi cây bút và cái tank rửa phim. Dây da nứt nẻ quệt vào cổ tay tôi một vệt nâu.
Tôi lật mặt đáy. Kim đếm kiểu dừng ở con số 17.
Mười bảy kiểu. Bảy năm. Cuốn phim bên trong đã nằm đó chừng ấy thời gian, ngủ trong buồng tối của thân máy, chờ một ngón tay bấm nốt kiểu thứ mười tám không bao giờ tới.
Tôi ngồi xuống sàn, vặn cần tráng phim. Trục quay rắc, rắc dưới ngón tay tôi, chậm và涩 (khứu), như một khớp xương già trở mình. Cuốn phim cũ thu dần vào hộp sắt con. Tôi lấy nó ra, đặt vào lòng bàn tay. Nhẹ. Lạnh. Không nói một lời nào về mười bảy khung hình bên trong.
Trong hộp sắt đựng phim của câu lạc bộ, tôi đặt nó xuống cạnh mấy tờ giấy kẹo dâu vuốt phẳng. Rồi tôi ngồi nhìn cái hộp đến khi mắt cay xè vì quên chớp.
Sáng thứ Năm, tiệm ảnh Hòa Bình mở cửa lúc bảy giờ kém.
Ông chủ tóc bạc tháo kính lúp ra khỏi mắt khi nhìn thấy thân máy tôi đặt lên quầy. Ông không hỏi gì, chỉ lật đáy, ngắm kim đếm, rồi lấy tua vít tháo nắp buồng pin. Cục pin cũ chảy nước, xanh lè như rêu.
"Bảy năm?" ông hỏi.
"Dạ."
Ông thay pin mới, chà sạch tiếp điểm bằng một mẩu giấy nhám, vặn nút thử màn trập.
Tách.
Âm thanh nhỏ như một tiếng khớp xương trở mình. Tôi giật mình nhẹ, dù tôi biết nó sẽ kêu. Bảy năm rồi trong nhà tôi không có âm thanh nào giống thế.
"Bốn mươi nghìn," ông nói, đẩy máy sang. Rồi ông thêm, mắt đã cúi xuống kính lúp: "Máy tốt. Giữ cho kỹ."
Thứ Năm, tiết bốn, Miên đã ngồi chờ trên bậu cửa sổ phòng tối từ lúc nào, chân đung đưa, tay cầm hai hộp sữa.
"Chụp ở đâu?" nó hỏi,遞 (đưa) tôi một hộp.
"Cậu chọn."
Nó nhảy xuống bậu cửa sổ nhanh như đã chờ câu đó từ tuần trước. "Ghế đá sân sau. Ánh sáng chiều nay đẹp lắm, tớ xem dự báo thời tiết rồi, nắng hanh, không mây."
Tôi nhìn nó một nhịp.
Chiếc ghế đá sân sau. Tấm thứ bảy trong cuộn phim ướt: ghế đá trống, một chiếc lá rơi bên cạnh.
Nó bắt gặp ánh mắt tôi, không né, khóe miệng nhếch lên nửa milimét như thách tôi hỏi. Tôi không hỏi. Tôi đeo túi máy lên vai, tắt đèn đỏ, khóa cửa.
Nắng chiều trải trên sân sau một lớp mật loãng. Miên ngồi xuống ghế đá, rồi lại đứng lên, vuốt tóc, hắng giọng, đứng thẳng lưng như chào cờ.
"Chụp nhanh lên," nó nói, mắt nhìn thẳng vào tôi, cứng đờ.
"Cậu đứng như dự lễ chào cờ ấy," tôi hạ máy xuống. "Thả lỏng đi. Cậu không phải tạo dáng. Cậu chỉ cần ở đó."
"Nghĩa là sao?"
"Nghĩa là," tôi nâng máy lên lại, chỉnh khẩu, "cậu cứ làm việc cậu đang làm lúc quên mất tớ tồn tại."
Nó blink (chớp mắt). Rồi nó cười phá lên, và trong đúng nửa giây nó quên mất tôi thật: mắt híp lại, vai rung, tay quệt ngang miệng — tách.
Kiểu thứ nhất.
Sau đó mọi thứ dễ hơn. Nó ngồi xuống ghế, kể chuyện con chó nhà hàng xóm ăn tr dép tổ trưởng, chuyện cô Vân bắt làm lại bài luận vì "thiếu cảm xúc", chuyện nó ghét tiếng chuông trường đến mức nào. Tôi đứng cách ba mét, nghe một nửa, ngắm một nửa. Nắng xuyên qua lá bàng rơi lên vai áo nó từng đốm tròn, di chuyển chậm theo gió. Tôi chờ những đốm nắng bò đến khóe mắt nó rồi mới bấm. Tách. Tách.
"Này," nó đột ngột ngừng nói, nghiêng đầu. "Trong khung ngắm, tớ trông thế nào?"
Tôi hạ máy xuống một chút. "Đẹp."
"Thật á?" mắt nó sáng lên.
"...Ánh sáng," tôi nói. "Ánh sáng đẹp."
Nó ném nguyên một chiếc lá bàng khô về phía tôi, cười đến mức phải ôm bụng, và tôi bấm máy đúng lúc nó ngẩng lên, nước mắt cười còn đọng ở khóe mi, nắng ăn trọn vào nửa mặt.
Kiểu thứ sáu. Kiểu tôi biết mình sẽ phóng to nhất.
Trong phòng tối, chúng tôi rửa phim trong bóng đen đặc, vì nó đòi ở lại "để nghe cho biết".
Cạch. Cạch. Cạch.
Tiếng tank lắc đều trong im lặng. Rồi nó hỏi, giọng nhẹ hơn thường lệ nửa tông:
"Máy ấy cậu mua ở đâu?"
Bóng tối đặc. Tôi không nhìn thấy mặt nó, nó không nhìn thấy mặt tôi. Có lẽ vì thế mà câu trả lời thoát ra dễ hơn tôi tưởng, như một cái khớp gỉ sét bảy năm đột ngột chịu xoay:
"Của bố tớ."
Im lặng. Tiếng tank. Tiếng nước nhỏ từ dây phơi cũ.
"Thế thì phải rửa cho khéo," cuối cùng nó nói, không một câu hỏi thêm, không một giọt thương hại nào trong giọng. "Ảnh của máy ấy mà hỏng, tớ tiếc thay cậu đấy."
"Ừ."
Điện thoại trong túi áo khoác nó treo trên mắc cửa rung lên, tiếng chuông闷 (đục) qua lớp vải. Tôi nghe nó摸索 (mò) máy, nghe một nhịp thở dài rất khẽ, rồi tiếng cửa he hé: nó bước ra hành lang nghe điện thoại.
Giọng nó lọt qua khe cửa, thấp và chậm, khác hẳn đứa con gái bắn liên thanh dưới nắng chiều:
"...dạ... con biết... thứ Bảy con về... dạ, con không quên đâu..."
Cửa khép lại. Nó bước vào, mắt hơi đỏ nhưng giọng đã treo lại đúng nhịp nhanh thường lệ: "Còn mấy kiểu nữa hả thợ? Treo lên đi, tớ chờ."
Tôi không hỏi. Tôi tráng nốt, xả nước, treo dải phim lên dây. Kẹp sắt tách hai tiếng khô khốc.
Đèn đỏ bật lên. Miên ngẩng nhìn dải phim còn ướt, nghiêng đầu soi từng khung ngược sáng như soi một bản đồ treasure (kho báu).
"Kiểu thứ sáu," nó chỉ tay, "là kiểu tớ cười như điên đúng không? Phải phóng cho tớ bản to nhất đấy."
"Ừ."
"Hứa?"
"Ừ. Hứa."
Nó ra về lúc năm giờ, kịp trước khi bác bảo vệ khóa cổng. Xuống đến chân cầu thang nó còn quay lại hét vọng lên: "Thứ Bảy tớ bận! Chủ nhật tớ mang tiền khung ảnh đến! Cấm tớ không được quên đấy!"
Tôi đứng trên cầu thang, tay nắm lan can sắt lạnh, nhìn theo đến khi tiếng giày nó mất hút ngoài cổng.
Tối đó, ở nhà, tôi lôi từ ngăn túi xách ra một viên kẹo dâu bọc giấy bóng kính. Nó nhét vào đó lúc nào tôi không biết. Viên thứ ba.
Tôi bóc ăn. Vẫn ngọt gắt. Vẫn phải nhíu mày. Vẫn ăn hết.
Rồi tôi mở hộp sắt của câu lạc bộ. Ba tờ giấy kẹo vuốt phẳng nằm trên. Cuốn phim bảy năm tuổi nằm dưới, im lìm, mười bảy kiểu chưa rửa.
Trên dây phơi trong phòng tối, dải phim của Miên đang khô dần, ba mươi sáu kiểu mới tinh, sáu kiểu có một đứa nheo mắt cười.
Tôi đậy nắp hộp sắt, nhưng không khóa.
Bài luận "Người ảnh hưởng nhất đến em" hạn nộp ngày mai vẫn còn trắng giấy. Tôi ngồi vào bàn, vặn đèn, viết một dòng đầu tiên rồi dừng lại rất lâu, nghe quạt trần quay đều trên đầu.
Dòng đầu tiên ấy viết: Bố tôi để lại cho tôi một chiếc máy ảnh, và một cuốn phim chưa rửa hết.
Tôi chưa biết mình sẽ viết tiếp về bố, hay về một đứa con gái bắt tôi phải đếm ngày đến thứ Năm.
Nhưng lần đầu tiên sau bảy năm, trang giấy không còn trắng nữa.', NULL, 0, '2026-10-01 09:41:10.847312+00', '2026-10-01 09:41:10.847312+00');
INSERT INTO public."Chapters" VALUES ('d143b1ac-7913-4df6-a29d-c13bc651691f', 'd494a899-66b6-4a98-82b2-c8a2662f60a2', 5, 'Khung hình thứ mười tám', 'Thứ Bảy, trời không mưa, nhưng không khí đặc quánh mùi đất ẩm.
Tôi ngồi trong phòng tối từ lúc tám giờ tối. Chỉ bật mỗi ngọn đèn đỏ. Trên khay men trắng, tôi đang tráng cuộn phim đã ngủ quên bảy năm trong chiếc Canon AE-1.
Mười bảy khung hình.
Tôi đã đoán đủ thứ kịch bản vĩ mô về người đàn ông đã bỏ lại chiếc máy ảnh và ra đi. Có lẽ là những bức ảnh chụp một người phụ nữ khác. Có lẽ là những bức ảnh mang theo một bí mật nào đó. Hoặc có thể là những kiệt tác nghệ thuật mà ông ấy giấu kín.
Nhưng khi hình ảnh hiện lên trên giấy in, tôi chỉ thấy sự bình thường đến mức tẻ nhạt.
Khung 1: Một góc phố mờ ảo, nhòe nét do rung tay.
Khung 5: Một cốc cà phê vơi một nửa đặt trên bàn gỗ.
Khung 12: Một thằng bé chừng bảy tuổi đang há hốc mồm ngủ trên ghế sofa, nước dãi ướt một vạt áo. Tôi nhìn thằng bé, thấy nó giống mình, nhưng xa lạ như người dưng.
Khung 17: Một bầu trời xám, không có mây, không có chim, chỉ là một khoảng không trống rỗng.
Không có bí mật. Không có bi kịch. Chỉ là một người đàn ông dần dần mất đi hứng thú với việc ghi lại thế giới, cho đến khi ông ấy bấm nút chụp thứ mười bảy, rồi cất máy vào tủ, và bước ra khỏi cửa.
Tôi treo mười bảy tờ giấy ảnh lên dây phơi. Kẹp sắt kêu tách, tách. Tôi tắt đèn đỏ, ngồi trong bóng tối đặc quánh của căn phòng, nghe tiếng nước nhỏ từ dải phim xuống chậu nhựa. Tỏng. Tỏng.
Hóa ra, sự rời đi của một người đôi khi không có tiếng động. Nó chỉ đơn giản là cuộn phim hết khung hình, và người ta không buồn thay cuộn mới.
Chủ Nhật, ba giờ chiều.
Tiếng gõ cửa vang lên. Ba nhịp.
Miên bước vào. Hôm nay nó mặc một chiếc áo khoác gió màu be, to hơn so với người. Tôi liếc xuống chân nó. Đôi giày vải trắng hôm nọ giờ bám một lớp bụi đỏ quạch, thứ đất sét chỉ có ở vùng đồi trung du cách đây cả trăm cây số.
Nó đặt lên bàn một chiếc khung gỗ mộc, kích thước vừa vặn với tờ giấy in ảnh 10x15.
"Tớ đóng ở xưởng mộc gần nhà," nó nói, giọng hơi khàn, như thể đã nói chuyện hoặc khóc rất nhiều trong hai ngày qua. Nó không nhắc đến thứ Bảy. Tôi cũng không hỏi lớp bụi đỏ trên giày nó là của nghĩa trang, của bệnh viện, hay của một sân ga nào đó.
Nó nhìn thấy mười bảy bức ảnh của bố tôi đang treo trên dây. Nó đứng đó, im lặng nhìn thằng bé bảy tuổi ngủ trên ghế sofa, và bầu trời xám ở khung thứ mười bảy.
Nó không hỏi "đây là ai". Nó chỉ vươn tay, chạm nhẹ vào mép tờ giấy ảnh khung thứ mười hai, rồi rụt lại.
"Cậu rửa xong rồi à," nó nói khẽ.
"Ừ."
"Buồn nhỉ."
"Ừ. Chẳng có gì đặc biệt cả."
Miên quay sang nhìn tôi, rồi nhìn xuống chiếc Canon AE-1 đang đặt trên bàn. "Máy cậu còn kiểu nào không?"
Tôi cầm máy lên, vặn núm cuộn phim. Kim đồng hồ nhích lên.
"Mười bảy," tôi nói. "Còn đúng một kiểu nữa là hết cuộn."
Nó mỉm cười, một nụ cười rất nhẹ, khóe mắt còn hơi sưng nhưng ánh mắt thì trong vắt. "Thế thì chụp tớ đi. Coi như tớ mở hàng cho cuộn phim mới của cậu."
Tôi nhìn quanh căn phòng chật hẹp. Mùi thuốc rửa ảnh, mùi ẩm mốc của tường vôi, và ánh sáng duy nhất lọt qua khe cửa sổ là thứ nắng chiều vàng vọt, yếu ớt của ngày cuối tuần.
"Ngồi xuống ghế đi," tôi nói.
Nó ngồi xuống chiếc ghế đẩu, ngay cạnh khay tráng phim, tay đặt lên đầu gối. Nắng chiều hắt qua khe cửa, vẽ một vệt sáng cắt ngang sống mũi nó, để lại nửa khuôn mặt chìm trong bóng râm. Nó không chớp mắt liên tục như hôm đầu tiên gặp gỡ. Nó nhìn thẳng vào ống kính, bình thản, và có chút gì đó rất buồn.
Tôi vặn nút hẹn giờ.
Tít... tít... tít...
Âm thanh điện tử nhỏ xíu vang lên trong căn phòng yên tĩnh. Tôi bước nhanh lại, đứng cách nó hai mét, dựa lưng vào mép bàn gỗ, nhìn nó.
Tít... tít... tít...
"Nam này," nó đột ngột lên tiếng, giọng rất nhẹ, gần như bị tiếng kim đồng hồ át đi.
"Ừ."
"Cảm ơn cậu vì đã để tớ trốn ở đây."
Tách.
Màn trập sập xuống. Gương lật hất lên.
Một phần mười lăm giây. Đủ để ánh sáng đi qua thấu kính, ghi lại bóng hình của nó, và cả bóng hình của tôi đang đứng dựa vào bàn, vào lớp giấy bạc của cuộn phim.
Khung hình thứ mười tám.
Tôi cầm máy lên, vặn cần tua phim.
Rè... rè... rè...
Tiếng cuộn phim rút ngược lại vào hộp sắt vang lên giòn giã, dứt khoát, báo hiệu một kỷ lục đã được hoàn thành. Cuộn phim đã được lấp đầy. Không còn khoảng trống nào nữa.
Tôi tháo ống kính, đậy nắp body, đặt chiếc Canon xuống bàn.
"Xong rồi," tôi nói.
Miên nhìn tôi, rồi nhìn chiếc máy ảnh. Nó gật đầu, cầm lấy chiếc khung gỗ trống rỗng của mình, ôm vào lòng.
"Thứ Hai tớ mang tiền mua phim mới đến," nó nói, rồi quay bước ra cửa.
Lần này nó không chạy. Nó đi rất chậm, từng bước một, đôi giày dính bụi đỏ in những vệt mờ lên nền gạch men. Cánh cửa khép lại sau lưng nó, để lại căn phòng với mùi hóa chất và mười tám khung hình đang chờ được rửa.
Tôi ngồi xuống ghế, nhìn ra cửa sổ. Nắng đã tắt hẳn.
Tôi không biết ngày mai sẽ rửa kiểu ảnh thứ mười tám ấy như thế nào. Nhưng tôi biết, từ mai, chiếc tủ kính ở phòng khách sẽ được mở ra thường xuyên hơn.
Và tôi sẽ không trốn trực nhật nữa.', NULL, 0, '2026-10-01 09:42:57.460788+00', '2026-10-01 09:42:57.460788+00');


--
-- Data for Name: Genres; Type: TABLE DATA; Schema: public; Owner: storynest
--



--
-- Data for Name: StoryGenres; Type: TABLE DATA; Schema: public; Owner: storynest
--



--
-- PostgreSQL database dump complete
--

\unrestrict 7lVBiYgTutgi1Ax3oCUJ1aOOz4nk6nPXvGt4ZS93k5SMsxbCYejOcshzIlWgu2K

