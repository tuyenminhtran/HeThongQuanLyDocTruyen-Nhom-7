import { apiClient } from "./client";
import type { StoryListItem } from "./stories";

// Giả lập API cho Profile/Library vì backend chưa có endpoint này
// Bạn có thể sửa lại đường dẫn API khi backend đã sẵn sàng

export async function getReadingHistory(): Promise<StoryListItem[]> {
  // Thực tế: await apiClient.get("/users/me/history")
  try {
    const res = await apiClient.get<StoryListItem[]>("/stories");
    // Mock: Lấy 2 truyện đầu tiên làm lịch sử
    return res.data.slice(0, 2);
  } catch {
    return [];
  }
}

export async function getBookmarks(): Promise<StoryListItem[]> {
  // Thực tế: await apiClient.get("/users/me/bookmarks")
  try {
    const res = await apiClient.get<StoryListItem[]>("/stories");
    // Mock: Lấy 3 truyện làm bookmark
    return res.data.slice(1, 4);
  } catch {
    return [];
  }
}

export async function getPurchasedStories(): Promise<StoryListItem[]> {
  // Thực tế: await apiClient.get("/users/me/purchased")
  try {
    const res = await apiClient.get<StoryListItem[]>("/stories");
    // Mock: Lọc các truyện trả phí làm truyện đã mua
    return res.data.filter(s => s.accessPolicy !== 0);
  } catch {
    return [];
  }
}
