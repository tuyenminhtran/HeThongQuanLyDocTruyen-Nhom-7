import { apiClient } from "./client";

export interface Genre {
  id: string;
  name: string;
  slug: string;
  storyCount: number;
}

export const FALLBACK_GENRES: Genre[] = [
  { id: "a1000000-0000-0000-0000-000000000001", name: "Tiên Hiệp", slug: "tien-hiep", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000002", name: "Kiếm Hiệp", slug: "kiem-hiep", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000003", name: "Huyền Huyễn", slug: "huyen-huyen", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000004", name: "Đô Thị", slug: "do-thi", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000005", name: "Khoa Huyễn", slug: "khoa-huyen", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000006", name: "Tình Cảm", slug: "tinh-cam", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000007", name: "Xuyên Không", slug: "xuyen-khong", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000008", name: "Võng Du", slug: "vong-du", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000009", name: "Dị Năng", slug: "di-nang", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000010", name: "Trinh Thám", slug: "trinh-tham", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000011", name: "Hành Động", slug: "hanh-dong", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000012", name: "Phiêu Lưu", slug: "phieu-luu", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000013", name: "Hài Hước", slug: "hai-huoc", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000014", name: "Trọng Sinh", slug: "trong-sinh", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000015", name: "Cổ Đại", slug: "co-dai", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000016", name: "Hệ Thống", slug: "he-thong", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000017", name: "Linh Dị", slug: "linh-di", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000018", name: "Đam Mỹ", slug: "dam-my", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000019", name: "Bách Hợp", slug: "bach-hop", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000020", name: "Học Đường", slug: "hoc-duong", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000021", name: "Đời Thường", slug: "doi-thuong", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000022", name: "Manhwa", slug: "manhwa", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000023", name: "Manhua", slug: "manhua", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000024", name: "Manga", slug: "manga", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000025", name: "Siêu Nhiên", slug: "sieu-nhien", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000026", name: "Võ Thuật", slug: "vo-thuat", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000027", name: "Kinh Dị", slug: "kinh-di", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000028", name: "Mạt Thế", slug: "mat-the", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000029", name: "Quân Sự", slug: "quan-su", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000030", name: "Lịch Sử", slug: "lich-su", storyCount: 0 },
  { id: "a1000000-0000-0000-0000-000000000031", name: "Ngôn Tình", slug: "ngon-tinh", storyCount: 0 },
];

export async function getGenres(): Promise<Genre[]> {
  try {
    const res = await apiClient.get<Genre[]>("/genres");
    if (res.data && res.data.length > 0) {
      // Hợp nhất danh sách: ưu tiên backend, sau đó bổ sung thể loại fallback chưa có
      const map = new Map<string, Genre>();
      FALLBACK_GENRES.forEach((g) => map.set(g.id, g));
      res.data.forEach((g) => map.set(g.id, g));
      return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, "vi"));
    }
  } catch (err) {
    console.warn("Không thể tải danh sách thể loại từ server, sử dụng danh sách mặc định:", err);
  }
  return FALLBACK_GENRES;
}

export async function createGenre(name: string): Promise<Genre> {
  const res = await apiClient.post<Genre>("/genres", { name: name.trim() });
  return res.data;
}

export async function updateGenre(id: string, name: string): Promise<Genre> {
  const res = await apiClient.put<Genre>(`/genres/${id}`, { name: name.trim() });
  return res.data;
}

export async function deleteGenre(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`/genres/${id}`);
  return res.data;
}
