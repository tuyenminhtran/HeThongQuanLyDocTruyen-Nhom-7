const fs = require('fs');
const { execSync } = require('child_process');
const crypto = require('crypto');

const GENRES = {
  tien_hiep: 'a1000000-0000-0000-0000-000000000001',
  kiem_hiep: 'a1000000-0000-0000-0000-000000000002',
  huyen_huyen: 'a1000000-0000-0000-0000-000000000003',
  do_thi: 'a1000000-0000-0000-0000-000000000004',
  vong_du: 'a1000000-0000-0000-0000-000000000008',
  hanh_dong: 'a1000000-0000-0000-0000-000000000011',
  phieu_luu: 'a1000000-0000-0000-0000-000000000012',
  di_nang: 'a1000000-0000-0000-0000-000000000009'
};

const NOVELS = [
  {
    title: "Toàn Chức Cao Thủ (The King's Avatar)",
    author: "Hồ Điệp Lam",
    coverUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
    description: "Diệp Tu – cao thủ đứng đầu tựa game trực tuyến Vinh Quang (Glory), mang danh Bách Khoa Toàn Thư, vì không chấp nhận thương mại hóa hình ảnh cá nhân mà bị câu lạc bộ xua đuổi. Rời khỏi đấu trường chuyên nghiệp sau 10 năm cống hiến, anh trở thành nhân viên quản lý tiệm net Hưng Hân ca đêm. Nhưng với niềm đam mê bất diệt cùng ký ức chinh chiến đỉnh phong, khi máy chủ thứ 10 của Vinh Quang khai mở, anh một lần nữa trở lại thế giới ảo với nhân vật tán nhân mang tên Quân Mạc Tiếu và thanh thần binh Ô Thiên Cơ tự chế, từng bước xây dựng một chiến đội huyền thoại mới để trở lại đỉnh vinh quang tối thượng!",
    views: 89450,
    genreKeys: ['vong_du', 'do_thi', 'hanh_dong'],
    chapters: [
      {
        number: 1,
        title: "Chương 1: Bị Xua Đổi Khỏi Gia Thế",
        content: `Tuyết đêm Hàng Châu rơi dày đặc như muốn vùi lấp cả thành phố dưới một tấm thảm trắng xóa lạnh lẽo.

Tại trụ sở câu lạc bộ Gia Thế – một trong những thế lực thể thao điện tử lừng lẫy nhất giới chuyên nghiệp Vinh Quang, Diệp Tu lặng lẽ đặt chiếc thẻ tài khoản 'Nhất Diệp Chi Thu' lên mặt bàn bóng loáng. Đó là tài khoản đã cùng anh chiến đấu suốt 7 năm qua, đem về cho Gia Thế 3 chiếc cúp vô địch danh giá và danh hiệu Đấu Thần bất khả chiến bại.

"Diệp Tu, hợp đồng chấm dứt tại đây. Tôn Tường sẽ tiếp quản Nhất Diệp Chi Thu. Cậu có thể chọn làm huấn luyện viên dự bị, hoặc nhận tiền đền bù rồi giải nghệ," ông chủ Đào Hiên lạnh lùng nói, ánh mắt không hề giấu giếm toan tính thương mại.

Trước mặt anh, thiếu niên trẻ tuổi Tôn Tường nở nụ cười kiêu ngạo: "Tiền bối, thời đại của anh đã kết thúc rồi. Tôi sẽ chứng minh ai mới là Đấu Thần đích thực!"

Diệp Tu khẽ thở ra một làn khói trắng, ánh mắt thản nhiên không gợn chút sóng gió: "Nếu cậu thích nó, hãy trân trọng nó, đừng xem nó như một món trang sức để khoe khoang danh tiếng. Vinh Quang không phải là trò chơi đơn giản như vậy đâu."

Anh không nhận bất kỳ đồng tiền bồi thường nào để đổi lấy quyền tự do, chỉ khoác chiếc áo khoác mỏng cũ kỹ, một mình bước ra khỏi cổng lớn của câu lạc bộ Gia Thế, hòa mình vào đêm tuyết lạnh giá.`
      },
      {
        number: 2,
        title: "Chương 2: Tiệm Net Hưng Hân Và Người Quản Lý Ca Đêm",
        content: `Rời khỏi Gia Thế, Diệp Tu đi bộ qua con đường đối diện và ghé vào một quán net lớn mang tên 'Hưng Hân'. Tiếng lách cách gõ phím rộn rã cùng luồng không khí ấm áp bên trong nhanh chóng xua tan cái giá lạnh thấu xương của đêm đông.

Bà chủ quán net Trần Quả – một fan hâm mộ cuồng nhiệt của Đấu Thần Nhất Diệp Chi Thu – đang tuyển nhân viên trực ca đêm. Thấy một người đàn ông trông có vẻ luộm thuộm nhưng ngón tay dài thon gọn đầy khí chất game thủ bước vào, cô liền thử tài anh bằng một trận solo Vinh Quang.

Chỉ trong chưa đầy 40 giây, bằng một tài khoản cùi bắp cấp thấp, Diệp Tu đã nhẹ nhàng hạ gục chuỗi thắng 52 trận của Trần Quả khiến cô tròn mắt kinh ngạc.

"Cậu... cậu rốt cuộc là quái vật phương nào tới vậy?!" Trần Quả ngơ ngác hỏi.

Diệp Tu mỉm cười, châm một điếu thuốc rồi nói nhẹ tênh: "Tôi là Diệp Thu."

Trần Quả bĩu môi cười lớn: "Cậu mà là Diệp Thu đại thần thì tôi chính là Tô Mộc Tranh rồi! Thôi được rồi, nhận việc đi, trực ca đêm từ 11 giờ tối đến 7 giờ sáng, bao ăn ở, lương 1000 tệ một tháng. Đồng ý không?"

"Đồng ý. Cảm ơn chị chủ." Diệp Tu cười khẽ, nhận chìa khóa phòng nghỉ nhỏ trên gác xép.`
      },
      {
        number: 3,
        title: "Chương 3: Quân Mạc Tiếu Và Thanh Ô Thiên Cơ",
        content: `Đúng 0 giờ đêm ngày 3 tháng 12, máy chủ thứ 10 của game trực tuyến Vinh Quang chính thức mở cửa sau đợt cập nhật kỷ niệm 10 năm. Hàng triệu người chơi trên toàn quốc chen lấn đăng nhập khiến máy chủ suýt chút nữa nghẽn mạng.

Diệp Tu ngồi ở góc bàn máy net VIP số 47, rút từ trong túi áo ra một chiếc thẻ tài khoản trắng chưa hề kích hoạt từ 10 năm trước.

Chiếc thẻ này là kỷ vật của người bạn thân nhất thời niên thiếu của anh – Tô Mộc Thu, một thiên tài chế tạo trang bị bạc yểu mệnh đã qua đời vì tai nạn giao thông trước khi giải đấu chuyên nghiệp đầu tiên khởi tranh.

"Mộc Thu, kế hoạch Tán Nhân mà cậu ấp ủ năm xưa... hôm nay tớ sẽ giúp cậu hoàn thành nó."

Diệp Tu tra thẻ vào đầu đọc. Màn hình máy tính lập tức hiện lên giao diện tạo nhân vật mới toanh.

ID: Quân Mạc Tiếu.
Nghề nghiệp: Chưa chuyển chức (Tán Nhân).

Trên tay nhân vật xuất hiện một thanh ô màu bạc giản dị nhưng toát lên luồng ánh sáng kỳ dị – Thần Binh Bạc cấp 5: Ô Thiên Cơ! Vũ khí có thể biến hóa thành 12 dạng hình thái tương ứng với toàn bộ các hệ phái trong Vinh Quang!`
      },
      {
        number: 4,
        title: "Chương 4: Kỷ Lục Bản Đồ Đầu Tiên Rúng Động Khu 10",
        content: `Khu 10 vừa mở được 3 tiếng, phụ bản cấp 10 'Khu Rừng Cách Lâm' trở thành chiến trường cạnh tranh khốc liệt giữa các đại công hội lớn trực thuộc các chiến đội chuyên nghiệp: Lam Khê Các (Lam Vũ), Trung Thảo Đường (Vi Thảo), Bá Khí Hùng Đồ (Bá Đồ).

Cả ba công hội đều dốc toàn lực lập tổ đội tinh anh để giành lấy First Clear và kỷ lục thời gian thông quan nhằm khuếch trương thanh thế.

Bỗng nhiên, toàn bộ hệ thống Vinh Quang vang lên một dòng thông báo chữ vàng chói lọi phủ kín màn hình của toàn bộ người chơi khu 10:

[HỆ THỐNG]: Người chơi 'Quân Mạc Tiếu' cùng tổ đội đã hoàn thành kỷ lục phụ bản Khu Rừng Cách Lâm! Thời gian hoàn thành: 13 phút 05 giây 21! Phá vỡ kỷ lục cũ 5 phút 40 giây!

Toàn bộ thế giới trong game như chết lặng.

"Cái quái gì thế này?! 13 phút?! Kỷ lục trước đó của đội tuyển chuyên nghiệp là gần 19 phút cơ mà?!"
"Quân Mạc Tiếu là ai?! Công hội nào đào đâu ra đại thần khủng khiếp thế này?!"

Các hội trưởng đại công hội Lam Khê Các và Bá Khí Hùng Đồ lập tức tái mặt, vội vã mở danh sách bạn bè điên cuồng gửi lời mời kết bạn tới cái tên 'Quân Mạc Tiếu'.`
      },
      {
        number: 5,
        title: "Chương 5: Bắt Đầu Lại Từ Đầu",
        content: `Nhìn danh sách tin nhắn nổ tung từ các hội trưởng công hội lớn, Diệp Tu chỉ bình thản nhấp ngụm nước trà nguội, mỉm cười tắt bảng thông báo.

Bên cạnh anh, Trần Quả ôm ly mì gói nóng hổi bước tới, nhìn vào màn hình của anh rồi thảng thốt kêu lên: "Cậu... cái tên Quân Mạc Tiếu phá kỷ lục chấn động kênh thế giới vừa rồi là cậu đấy à?!"

"Đúng vậy," Diệp Tu cười đáp.

"Trời ơi! Cậu chơi Tán Nhân sao? Nhưng Tán Nhân lên cấp 50 không thể thức tỉnh kỹ năng đại chiêu, không ai chơi Tán Nhân cả!"

Diệp Tu nhìn vào thanh Ô Thiên Cơ trên tay nhân vật, ánh mắt sâu thẳm kiên định như ngọn lửa không bao giờ tắt:

"Không có con đường nào là cụt, chỉ có người không dám bước tiếp. Mười năm trước tôi bắt đầu từ con số không, hôm nay tôi cũng có thể bắt đầu lại từ đầu. Đỉnh vinh quang ấy... tôi nhất định sẽ trở lại!"

Tiếng gõ phím lách cách của Diệp Tu lại vang lên nhịp nhàng trong đêm tuyết Hàng Châu, mở ra trang sử huyền thoại mới chấn động toàn bộ giới eSports thế giới.`
      }
    ]
  },
  {
    title: "Phàm Nhân Tu Tiên",
    author: "Vong Ngữ",
    coverUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    description: "Một thiếu niên bình thường xuất thân từ sơn thôn nghèo khó tên Hàn Lập, vì gia cảnh bần hàn mà được tam thúc tiến cử tham gia khảo hạch đệ tử của Thất Huyền Môn. Tư chất bình thường, tứ linh căn hỗn tạp tưởng chừng vô duyên với tiên đạo, nhưng nhờ tâm tính cẩn trọng, cơ trí và một chiếc Chưởng Thiên Bình thần bí nhặt được, từng bước vượt qua vô số hiểm nguy, nghịch thiên cải mệnh trên con đường tu tiên đầy máu và gió bão.",
    views: 95200,
    genreKeys: ['tien_hiep', 'huyen_huyen', 'phieu_luu'],
    chapters: [
      {
        number: 1,
        title: "Chương 1: Xuất Thân Sơn Thôn",
        content: `Thôn Thanh Ngưu nằm heo hút dưới chân núi Ngũ Thừa, quanh năm mây mù bao phủ, cuộc sống của người dân nơi đây nghèo khó quanh năm chỉ biết bám lấy mảnh ruộng cằn cỗi.

Hàn Lập, đứa con thứ ba trong một gia đình nông dân nghèo khó, từ nhỏ đã có làn da ngăm đen, gương mặt chất phác bình thường, nhưng sâu trong ánh mắt lại có sự chín chắn và trầm tĩnh hơn hẳn bạn bè cùng trang lứa.

Năm mười tuổi, Tam thúc của hắn – một người làm chân chạy việc trong giang hồ – trở về làng mang theo một tin vui lớn: Thất Huyền Môn, một môn phái giang hồ lừng danh cách thôn hàng trăm dặm, đang mở hội tuyển chọn đồng tử nhập môn. Người được chọn không chỉ được nuôi ăn học võ công, mà mỗi tháng còn gửi về cho gia đình một lượng bạc trắng.

Đối với gia đình Hàn Lập, đó là một món tiền khổng lồ có thể cứu cả nhà khỏi cảnh chết đói qua mùa đông giá rét.

Trước ngày lên đường, cha mẹ Hàn Lập dặn dò con trai từng câu từng chữ: "Lập nhi, ra ngoài giang hồ hiểm ác, đừng hơn thua với người ta, sống sót bình an mới là quan trọng nhất."

Hàn Lập gật đầu thật mạnh, khắc sâu lời dạy của song thân vào tận đáy lòng.`
      },
      {
        number: 2,
        title: "Chương 2: Thất Huyền Môn Và Mặc Đại Phu",
        content: `Trải qua hàng tuần lễ khảo hạch leo vách núi gian khổ đầy mồ hôi và nước mắt, Hàn Lập vì thể lực có hạn nên trượt khỏi danh sách đệ tử nội môn Thất Huyền Môn.

Tưởng chừng như phải ôm nỗi thất vọng quay về chốn quê nghèo, cơ duyên bất ngờ lại mỉm cười với hắn. Mặc Đại phu – vị thần y thần bí cư ngụ tại Thần Thủ Cốc của Thất Huyền Môn – đang cần tìm một đệ tử phụ việc sắc thuốc và thử truyền thụ y đạo.

Sau khi bắt mạch kiểm tra thể chất của Hàn Lập, Mặc Đại phu khẽ nhíu mày, trong mắt lóe lên một tia dị quang khó hiểu rồi gật đầu thu nhận hắn cùng một thiếu niên khác tên Trương Thiết.

Tại Thần Thủ Cốc tĩnh mịch ngát hương thảo dược, Mặc Đại phu ném cho Hàn Lập một cuốn khẩu quyết da thú ố vàng không tên và căn dặn:

"Đây là một bộ tâm pháp thổ nạp vô danh. Trong vòng một năm, nếu ngươi có thể tu luyện sinh ra khí cảm, lão phu sẽ chính thức truyền thụ y thuật tối cao và chu cấp đầy đủ cho gia đình ngươi. Bằng không, ngươi sẽ bị trục xuất khỏi sơn môn!"

Hàn Lập siêng năng khoanh chân ngồi thiền ngày đêm, bắt đầu tiếp xúc với những khái niệm huyền ảo đầu tiên của thiên địa linh khí.`
      },
      {
        number: 3,
        title: "Chương 3: Chiếc Lọ Xanh Thần Bí (Chưởng Thiên Bình)",
        content: `Nửa năm ròng rã khổ tu trôi qua, trong khi Trương Thiết đã luyện thành Tượng Giáp Công đao thương bất nhập, thì cơ thể Hàn Lập vẫn như một cái động không đáy, linh khí hấp thu vào cơ thể đều tan biến như muối bỏ biển, tiến độ vô cùng chậm chạp.

Một đêm nọ, khi đi nhặt củi sau rặng trúc Thần Thủ Cốc, mũi giày của Hàn Lập bỗng va phải một vật thể cứng chôn vùi dưới lớp bùn đất.

Đào lên xem, đó là một chiếc bình nhỏ màu xanh lục bằng chất liệu không rõ ngọc hay đá, trên bề mặt chạm khắc những hoa văn lá cây tinh xảo kỳ dị. Điều kỳ lạ nhất là khi đêm xuống, chiếc lọ nhỏ này lại tự động hấp thu ánh sáng mặt trăng, tỏa ra vô số đốm sáng màu bạc lấp lánh như ngàn vạn vì sao vây quanh!

Sau vài ngày nghiên cứu, Hàn Lập kinh ngạc phát hiện: Chiếc bình sau khi hấp thu đầy ánh trăng sẽ ngưng tụ ra một giọt chất lỏng màu lục thần bí. Khi nhỏ giọt dịch này vào gốc một cây thảo dược thường, chỉ trong một đêm, cây thảo dược đó đã sinh trưởng vượt bậc tương đương với dược tính trăm năm!

Trái tim Hàn Lập đập thình thịch liên hồi. Hắn hiểu rõ, mình vừa nhặt được một bảo vật nghịch thiên cải mệnh vô giá!`
      },
      {
        number: 4,
        title: "Chương 4: Tâm Cơ Hiểm Độc Dưới Lớp Mặt Nạ",
        content: `Nhờ có giọt dịch xanh của Chưởng Thiên Bình, Hàn Lập liên tục dùng dược liệu trăm năm, nghìn năm để bồi dưỡng kinh mạch. Khẩu quyết vô danh vốn dĩ vô cùng khó luyện – thực chất chính là 'Trường Xuân Công' của người tu tiên – đã được hắn đột phá liên tiếp tới tầng thứ tư!

Thế nhưng, khi thấy Hàn Lập tiến bộ thần tốc, thái độ của Mặc Đại phu lại trở nên vô cùng kỳ quái. Ánh mắt ông ta nhìn Hàn Lập không còn là sư phụ nhìn đồ đệ, mà giống như một con dã thú đang đói khát nhìn chằm chằm vào con mồi béo bở.

Cùng lúc đó, sư huynh Trương Thiết bỗng nhiên mất tích bí ẩn không một dấu vết.

Hàn Lập với tính cách cẩn thận từ nhỏ đã sớm ngửi thấy mùi nguy hiểm chết chóc. Hắn âm thầm luyện chế độc dược phòng thân, giấu giếm tu vi thật sự, đồng thời chế tạo ám khí và độc đao luôn giắt bên hông.`
      },
      {
        number: 5,
        title: "Chương 5: Bước Chân Đầu Tiên Vào Tiên Lộ",
        content: `Vào một đêm trăng tròn u ám, chân tướng cuối cùng cũng phơi bày. Mặc Đại phu lộ rõ bộ mặt thật của một tu tiên giả thất bại, thân thể già nua sắp chết, muốn dùng bí thuật tà ác để Đoạt Xá (chiếm đoạt thể xác) của Hàn Lập!

Một trận chiến kinh tâm động phách giữa cơ trí của thiếu niên và tâm kế thâm hiểm của lão hồ ly nổ ra trong mật thất Thần Thủ Cốc. Bằng sự bình tĩnh phi thường, cơ thể tràn ngập Trường Xuân Công cùng ám khí tẩm độc, Hàn Lập đã phản sát thành công, tiêu diệt Mặc Đại phu và linh hồn ma đạo trú ngụ trong người ông ta.

Từ di vật của Mặc Đại phu, một thế giới hoàn toàn mới mở ra trước mắt Hàn Lập: Thế giới của Tu Tiên Giả! Nơi những kẻ có linh căn ngự kiếm phi hành, trường sinh bất tử, vẫy tay dời non lấp biển.

Cầm trên tay Lệnh Bài Thăng Tiên của Hoàng Phong Cốc, thiếu niên thôn quê năm nào hít một hơi thật sâu, thu dọn hành trang rời khỏi Thất Huyền Môn.

Con đường tu tiên muôn trùng hiểm nguy, nhân tâm hiểm ác, nhưng hắn – Hàn Lập – với tâm tính vững như bàn thạch và Chưởng Thiên Bình trong tay, đã sẵn sàng đạp bằng mọi chông gai để tiến tới đỉnh cao tiên đạo!`
      }
    ]
  },
  {
    title: "Đấu Phá Thương Khung (Viêm Đế Tiêu Viêm)",
    author: "Thiên Tằm Thổ Đậu",
    coverUrl: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
    description: "Tại Đấu Khí Đại Lục phồn thịnh, không có ma pháp hoa lệ, chỉ có đấu khí phát triển đến đỉnh phong! Tiêu Viêm từng là thiên tài chấn động Ô Thản Thành, nhưng năm 12 tuổi bỗng nhiên mất sạch đấu khí, biến thành phế vật bị người đời khinh bỉ, vị hôn thê Nạp Lan Yên Nhiên đem giấy từ hôn đến tận cửa sỉ nhục. Giữa lúc tuyệt vọng nhất, linh hồn của Dược Lão trong chiếc giới chỉ mẫu thân để lại thức tỉnh... Ba mươi năm Hà Đông, ba mươi năm Hà Tây, đừng khinh thiếu niên nghèo! Cuộc hành trình thôn phệ Dị Hỏa, bước lên ngôi vị Viêm Đế chính thức bắt đầu!",
    views: 112000,
    genreKeys: ['huyen_huyen', 'di_nang', 'hanh_dong'],
    chapters: [
      {
        number: 1,
        title: "Chương 1: Đấu Lực Ba Đoạn - Rơi Xuống Vực Sâu",
        content: `"Đấu lực: Ba đoạn! Cấp bậc: Đê cấp!"

Nhìn vào bia đá trắc nghiệm lóe lên dòng chữ chói mắt, thiếu niên Tiêu Viêm đứng giữa quảng trường Tiêu gia, khóe môi khẽ nhếch lên một nụ cười tự giễu cay đắng. Bàn tay giấu trong tay áo siết chặt đến mức móng tay găm sâu vào da thịt, rỉ ra những giọt máu đỏ tươi.

Xung quanh, hàng trăm đệ tử cùng trang lứa vốn từng nịnh bợ, tôn sùng anh như một thiên tài cái thế, giờ đây đều phát ra những tiếng cười nhạo báng, mỉa mai không hề kiêng nể.

"Thiên tài năm bốn tuổi luyện khí, mười tuổi ngưng tụ Đấu Khí Khí Toàn, mười một tuổi đột phá Đấu Giả trẻ nhất gia tộc... giờ lại biến thành một tên phế vật ba đoạn đấu lực! Thật là sỉ nhục của Tiêu gia chúng ta!"

Ba năm trước, không biết vì lý do gì, đấu khí trong cơ thể Tiêu Viêm bỗng nhiên không ngừng hao hụt, tu vi tụt dốc không phanh. Từ đỉnh cao danh vọng rơi xuống đáy bùn nhơ, Tiêu Viêm đã nếm trải trọn vẹn sự bạc bẽo và tàn khốc của nhân tình thế thái.`
      },
      {
        number: 2,
        title: "Chương 2: Tấm Giấy Từ Hôn Và Lời Thề Ba Năm",
        content: `Tại đại sảnh Tiêu gia, bầu không khí ngột ngạt đến nghẹt thở.

Đệ tử đệ nhất Vân Lam Tông – Nạp Lan Yên Nhiên – vị hôn thê được hứa hôn từ khi còn trong bụng mẹ với Tiêu Viêm, mang theo chấp sự tông môn kiêu ngạo bước vào, công khai muốn hủy bỏ hôn ước với 'phế vật' Tiêu Viêm, đồng thời ném ra một viên Tụ Khí Đan quý giá xem như tiền bồi thường danh dự.

Tộc trưởng Tiêu Chiến – phụ thân của Tiêu Viêm – giận đến run rẩy cả người, chén trà bằng ngọc trong tay vỡ nát thành bột mịn.

Giữa sự nhục nhã của cả dòng tộc, Tiêu Viêm ngẩng cao đầu bước ra giữa sảnh đường, ánh mắt rực lửa nhìn thẳng vào Nạp Lan Yên Nhiên:

"Nạp Lan tiểu thư, hôm nay cô đến đây sỉ nhục Tiêu gia ta, chẳng qua là ỷ vào thế lực của Vân Lam Tông và sự kiêu ngạo của bản thân cô mà thôi! Nhưng cô nên nhớ: Ba mươi năm Hà Đông, ba mươi năm Hà Tây, đừng khinh thiếu niên nghèo!"

Nói đoạn, Tiêu Viêm rút thanh đoản đao rạch một đường dài trên lòng bàn tay, dùng máu tươi viết nên một lá thư hưu thê ngay trước mặt mọi người:

"Không phải cô từ hôn ta, mà là Tiêu Viêm ta bỏ cô! Ba năm sau, Tiêu Viêm này sẽ đích thân bước lên đỉnh Vân Lam Tông, cùng cô một trận quyết chiến sinh tử!"`
      },
      {
        number: 3,
        title: "Chương 3: Sự Thức Tỉnh Của Dược Lão",
        content: `Đêm khuya thanh vắng trên đỉnh núi sau gia tộc, Tiêu Viêm ngước nhìn bầu trời đêm đầy sao, lòng tràn ngập uất nghẹn và bất lực.

Bỗng nhiên, một giọng cười già nua mang theo vẻ trêu chọc vang lên từ khoảng không vô định:

"Khà khà, tiểu tử, tâm tính cũng không tồi đấy chứ! Dám thách đấu cả Vân Lam Tông cơ à?"

Tiêu Viêm giật mình bật dậy, thủ thế đề phòng: "Ai?! Ai đang nói?!"

Từ chiếc nhẫn đen cũ kỹ trên ngón tay hắn – di vật duy nhất người mẹ quá cố để lại – một luồng khói trắng lượn lờ bay ra, ngưng tụ thành hình bóng một lão giả râu tóc bạc phơ, ánh mắt sâu thẳm như chứa đựng cả tinh hà vũ trụ.

"Tiểu tử, ba năm nay nhờ có đấu khí tinh thuần của ngươi tẩm bổ ngày đêm, linh hồn tàn tạ của lão phu mới có thể tỉnh lại đấy!" Lão giả cười híp mắt nói.

Tiêu Viêm sững sờ, rồi cơn giận bùng lên như núi lửa: "Lão già khốn kiếp! Hóa ra ba năm qua chính ông là kẻ đã hút sạch đấu khí của ta, biến ta thành phế vật cho người đời chà đạp?!"`
      },
      {
        number: 4,
        title: "Chương 4: Quyết Định Trở Thành Luyện Dược Sư",
        content: `Nhìn thấy Tiêu Viêm nổi giận lôi đình, lão giả không hề bực tức mà khẽ mỉm cười, một ngọn lửa màu trắng kỳ dị bỗng nhiên bùng cháy trên đầu ngón tay ông ta, tỏa ra luồng uy áp kinh hồn bạt vía khiến không gian xung quanh như bị bóp méo.

"Tiểu tử, lão phu tên là Dược Trần. Ngươi có muốn trong vòng một năm lấy lại tu vi Đấu Giả? Ngươi có muốn trở thành Luyện Dược Sư – nghề nghiệp tôn quý và quyền lực nhất trên Đấu Khí Đại Lục này không?"

Luyện Dược Sư! Nghe đến ba chữ này, hơi thở của Tiêu Viêm lập tức trở nên dồn dập.

Trên đại lục này, ngay cả đấu hoàng cường giả cũng phải khép nép cung kính trước mặt một vị Luyện Dược Sư cao cấp!

"Lão tiên sinh... người thực sự có thể giúp ta?" Tiêu Viêm hạ giọng, ánh mắt lóe lên ngọn lửa khao khát sức mạnh mãnh liệt.

"Khà khà, chỉ cần ngươi bái lão phu làm thầy, chịu được nỗi khổ mà người thường không thể chịu nổi, đừng nói là Vân Lam Tông nhỏ bé, ngay cả đỉnh cao Đấu Khí Đại Lục này, lão phu cũng sẽ đưa ngươi bước lên!"

Tiêu Viêm không chút do dự, quỳ rạp xuống đất dập đầu ba cái: "Đồ nhi Tiêu Viêm, bái kiến sư phụ!"`
      },
      {
        number: 5,
        title: "Chương 5: Bước Lên Con Đường Nghịch Thiên",
        content: `Dưới sự chỉ bảo tận tình của Dược Lão và dược dịch Trúc Cơ linh diệu, kinh mạch của Tiêu Viêm được tẩy tủy phạt mao, đấu khí bắt đầu ngưng tụ trở lại với tốc độ kinh hồn bạt vía.

Chỉ trong vòng chưa đầy nửa năm, hắn đã liên tục đột phá từ Đấu Lực tầng bốn lên tới Đấu Lực tầng chín, sẵn sàng cho bước nhảy vọt trở thành Đấu Giả thực thụ!

Đặc biệt, Dược Lão đã truyền thụ cho anh một bộ công pháp thần bí vô thượng mang tên 'Phần Quyết' – một công pháp khởi đầu chỉ là Hoàng giai đê cấp, nhưng có thể tiến hóa không giới hạn bằng cách thôn phệ các loại Dị Hỏa cuồng bạo giữa trời đất!

"Tiêu Viêm, con đường thôn phệ Dị Hỏa là con đường cửu tử nhất sinh, ngàn vạn người tu luyện chưa từng có ai thành công. Ngươi có sợ không?" Dược Lão nghiêm túc hỏi.

Tiêu Viêm nhìn về phía dãy núi Ma Thú trùng điệp xa xăm, nở nụ cười kiên định ngút trời:

"Nếu sợ chết, con đã không lập lời thề ba năm! Viêm Đế con đường này... Tiêu Viêm con nhất định sẽ đi đến tận cùng!"

Một truyền kỳ chấn động Đấu Khí Đại Lục bắt đầu từ đây!`
      }
    ]
  }
];

function run() {
  console.log("🚀 BẮT ĐẦU NẠP 3 BỘ TIỂU THUYẾT ĐỈNH CAO VÀO CƠ SỞ DỮ LIỆU...");

  let sqlStatements = "";

  for (const n of NOVELS) {
    const storyId = crypto.randomUUID();
    const safeTitle = n.title.replace(/'/g, "''");
    const safeAuthor = n.author.replace(/'/g, "''");
    const safeCover = n.coverUrl.replace(/'/g, "''");
    const safeDesc = n.description.replace(/'/g, "''");

    sqlStatements += `
-- Truyện chữ: ${safeTitle}
INSERT INTO "Stories" (
  "Id", "Title", "CoverImageUrl", "Description", "Author", "Status", "AccessPolicy",
  "Price", "FreeChapterCount", "ViewCount", "CreatedAt", "UpdatedAt", "Type"
) VALUES (
  '${storyId}', '${safeTitle}', '${safeCover}', '${safeDesc}', '${safeAuthor}',
  0, 0, NULL, 0, ${n.views}, NOW(), NOW(), 0
);
`;

    for (const gk of n.genreKeys) {
      const gid = GENRES[gk];
      if (gid) {
        sqlStatements += `INSERT INTO "StoryGenres" ("StoryId", "GenreId") VALUES ('${storyId}', '${gid}') ON CONFLICT DO NOTHING;\n`;
      }
    }

    for (const chap of n.chapters) {
      const safeChapTitle = chap.title.replace(/'/g, "''");
      const safeContent = chap.content.replace(/'/g, "''");
      sqlStatements += `
INSERT INTO "Chapters" (
  "Id", "StoryId", "ChapterNumber", "Title", "Content", "ViewCount", "PublishAt", "CreatedAt", "UpdatedAt"
) VALUES (
  gen_random_uuid(), '${storyId}', ${chap.number}, '${safeChapTitle}', '${safeContent}', ${Math.floor(n.views / 5)}, NOW(), NOW(), NOW()
);
`;
    }
  }

  const tmpSql = `novels_import_${Date.now()}.sql`;
  fs.writeFileSync(tmpSql, sqlStatements, 'utf-8');

  console.log("💾 Đang thực thi nạp dữ liệu vào cơ sở dữ liệu Docker PostgreSQL...");
  try {
    execSync(`docker exec -i hethongquanlydoctruyen-nhom-7-postgres-1 psql -U storynest -d storyreader < "${tmpSql}"`, { stdio: 'inherit', shell: true });
    console.log("🎉 HOÀN TẤT NẠP TIỂU THUYẾT THÀNH CÔNG!");
  } catch (err) {
    console.error("❌ Lỗi khi import SQL:", err.message);
  } finally {
    if (fs.existsSync(tmpSql)) fs.unlinkSync(tmpSql);
  }
}

run();
