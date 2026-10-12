import type { StoryDetail, ChapterListItem } from "../api/stories";
import type { ChapterContent } from "../api/chapters";

const DEFAULT_CHAPTERS: ChapterListItem[] = Array.from({ length: 15 }, (_, i) => ({
  id: `mock-chap-${i + 1}`,
  chapterNumber: i + 1,
  title: `Chương ${i + 1}: ${
    [
      "Bắt đầu hành trình mới",
      "Khai mở đan điền",
      "Tuyệt kỹ gia truyền",
      "Cuộc chạm trán bất ngờ",
      "Đột phá cảnh giới",
      "Bí cảnh thần bí",
      "Thu phục linh thú",
      "Đại chiến võ đài",
      "Cơ duyên nghịch thiên",
      "Kẻ thù trong bóng tối",
      "Danh chấn bát phương",
      "Luyện đan xuất thần",
      "Quyết chiến đỉnh phong",
      "Bí mật ngàn năm",
      "Tiến vào đại lục mới",
    ][i] || `Hành trình tiếp diễn phần ${i + 1}`
  }`,
  requiresAccess: i > 5,
}));

export const MOCK_STORY_DETAILS: Record<string, StoryDetail> = {
  "mock-1": {
    id: "mock-1",
    title: "Đồ Đệ Của Ta Đều Là Đại Nhân Vật",
    coverImageUrl: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=500&q=80",
    author: "Nhiệt Huyết Manh Manh",
    status: 0,
    accessPolicy: 0,
    price: null,
    freeChapterCount: 15,
    genres: ["Huyền Huyễn", "Hài Hước", "Hệ Thống", "Xuyên Không"],
    description: `Lục Châu tỉnh dậy, phát hiện mình trở thành Ma Đạo Tổ Sư tiếng tăm lừng lẫy thiên hạ, nhưng lại sắp dầu hết đèn tắt!
Chín đại đệ tử dưới trướng hắn đều là những bá chủ một phương, người người kinh sợ, nhưng lại luôn lăm le phản bội sư phụ.

Đại đồ đệ U Minh Giáo Chủ thống lĩnh vạn ma, Nhị đồ đệ Kiếm Ma ngạo thị quần hùng...
Lục Châu dựa vào hệ thống công đức, từng bước chấn chỉnh lại đám đồ đệ phản nghịch, một lần nữa lập lại trật tự thế giới tu chân!`,
    chapters: DEFAULT_CHAPTERS,
  },
  "mock-2": {
    id: "mock-2",
    title: "Ta Có Thể Đốn Ngộ Vô Hạn",
    coverImageUrl: "https://images.unsplash.com/photo-1618336753974-aae8e304ec9f?w=500&q=80",
    author: "Đường Gia Tam Thiếu",
    status: 0,
    accessPolicy: 0,
    price: null,
    freeChapterCount: 15,
    genres: ["Tiên Hiệp", "Huyền Ảo", "Tu Chân", "Trọng Sinh"],
    description: `Thiên phú bình thường? Ngộ tính kém cỏi?
Tiêu Vân mang theo hệ thống đốn ngộ vô hạn chuyển sinh vào thế giới tu tiên. Bất kể công pháp khó khăn đến đâu, hắn chỉ cần một ý niệm là tiến vào trạng thái đốn ngộ cực hạn!
Một ngày nhập môn, ba ngày đại thành, một tháng thành tựu kiếm thánh vô tiền khoáng hậu.`,
    chapters: DEFAULT_CHAPTERS,
  },
  "mock-3": {
    id: "mock-3",
    title: "Bỏ Làm Simp Chúa, Ta Chuyển Sang Tu Tiên",
    coverImageUrl: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=500&q=80",
    author: "Hắc Bạch Vô Song",
    status: 0,
    accessPolicy: 1,
    price: 49000,
    freeChapterCount: 5,
    genres: ["Đô Thị", "Tu Chân", "Trọng Sinh", "Sảng Văn"],
    description: `Kiếp trước vì một người con gái mà tán gia bại sản, cuối cùng rơi vào kết cục thê thảm.
Được trọng sinh về thời khắc mấu chốt, Giang Thần dứt khoát chặt đứt tơ vương, thức tỉnh truyền thừa Tiên Đế vạn cổ.
Phụ nữ chỉ làm chậm tốc độ rút kiếm của ta! Từ đây một kiếm định càn khôn!`,
    chapters: DEFAULT_CHAPTERS,
  },
  "mock-4": {
    id: "mock-4",
    title: "Toàn Cầu Băng Phong: Ta Trốn Trong Nhà Tị Nạn",
    coverImageUrl: "https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=500&q=80",
    author: "Tiêu Tương",
    status: 0,
    accessPolicy: 2,
    price: 69000,
    freeChapterCount: 5,
    genres: ["Mạt Thế", "Sinh Tồn", "Dị Năng", "Không Gian"],
    description: `Kỷ băng hà toàn cầu đột ngột ập đến, nhiệt độ hạ xuống âm 60 độ C.
Trương Dịch trọng sinh trước ngày tận thế 1 tháng, điên cuồng thu thập hàng tỷ vật tư và chế tạo một căn cứ an toàn kiên cố như pháo đài thép.
Khi bên ngoài người ta tranh giành từng mẩu bánh mì, Trương Dịch ở trong phòng sưởi ấm, thưởng thức bò bít tết hảo hạng.`,
    chapters: DEFAULT_CHAPTERS,
  },
  "mock-5": {
    id: "mock-5",
    title: "Vạn Cổ Chí Tôn",
    coverImageUrl: "https://images.unsplash.com/photo-1542396601-dca920ea2807?w=500&q=80",
    author: "Thái Nhất Sinh Thủy",
    status: 1,
    accessPolicy: 0,
    price: null,
    freeChapterCount: 15,
    genres: ["Huyền Huyễn", "Trọng Sinh", "Nhiệt Huyết"],
    description: `Thiên Vũ giới thập đại Vũ Đế đứng đầu Bách Giới, Phá Quân Vũ Đế Cổ Phi Dương bất hạnh ngã xuống Thiên Đãng sơn mạch.
Mười lăm năm sau, hắn trọng sinh vào thân xác Lý Vân Tiêu - vương tử của Thiên Dương quốc, từ đó mở ra một hành trình nghịch thiên mới tranh đấu với vô số thiên tài thời đại mới!`,
    chapters: DEFAULT_CHAPTERS,
  },
};

export function getFallbackStoryDetail(id: string): StoryDetail {
  if (MOCK_STORY_DETAILS[id]) {
    return MOCK_STORY_DETAILS[id];
  }

  return {
    id,
    title: `Truyện Tuyệt Phẩm #${id}`,
    coverImageUrl: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80",
    author: "Tác Giả Ẩn Danh",
    status: 0,
    accessPolicy: 0,
    price: null,
    freeChapterCount: 10,
    genres: ["Huyền Huyễn", "Tiên Hiệp", "Phiêu Lưu"],
    description: `Một câu chuyện hào hùng đầy kịch tính về hành trình phiêu lưu tu chân vượt qua muôn trùng thử thách để đạt tới cảnh giới tối cao.
Những âm mưu thâm hiểm, tình huynh đệ chí cốt và những trận đại chiến kinh thiên động địa đang chờ đón bạn khám phá!`,
    chapters: DEFAULT_CHAPTERS,
  };
}

export function getFallbackChapterContent(id: string): ChapterContent {
  const match = id.match(/\d+/);
  const chapNum = match ? parseInt(match[0], 10) : 1;

  return {
    id,
    chapterNumber: chapNum,
    title: `Chương ${chapNum}: Hành trình khởi sắc`,
    content: `Ánh hoàng hôn buông xuống phủ đầy ngọn núi thanh tĩnh, sương mù lượn lờ như dải lụa mềm mại vắt ngang sườn đồi.

Hắn hít một hơi thật sâu, cảm nhận luồng linh khí thanh khiết đang từ từ tuần hoàn qua các kinh mạch trong cơ thể. Những năm tháng chịu đựng đắng cay, nhẫn nhục giờ đây dường như chỉ là bước đệm cho ngày hôm nay.

"Vận mệnh của ta, từ nay do chính ta định đoạt!" 

Hắn siết chặt nắm đấm, ánh mắt bừng lên ngọn lửa kiên định. Từng luồng khí thế vô hình từ trong cơ thể bộc phát ra ngoài, khiến cành lá xung quanh khẽ rung động. 

Phía trước con đường tu đạo còn muôn vàn trắc trở, nhưng với ý chí sắt đá không bao giờ lùi bước, hắn biết rằng không điều gì có thể ngăn cản bước chân mình tiến về đỉnh cao danh vọng...

(Nội dung chương tiếp tục ở phần tiếp theo...)`,
  };
}
