import { apiClient } from "./client";
import type { StoryListItem } from "./stories";

// Giả lập API cho Profile/Library vì backend chưa có endpoint này
// Bạn có thể sửa lại đường dẫn API khi backend đã sẵn sàng

export async function getReadingHistory(): Promise<StoryListItem[]> {
  try {
    const res = await apiClient.get<StoryListItem[]>("/profile/history");
    if (res.data && res.data.length > 0) return res.data;
    const fallback = await apiClient.get<StoryListItem[]>("/stories");
    return fallback.data.slice(0, 2);
  } catch {
    return [];
  }
}

export async function getBookmarks(): Promise<StoryListItem[]> {
  try {
    const res = await apiClient.get<StoryListItem[]>("/profile/bookmarks");
    if (res.data && res.data.length > 0) return res.data;
    const fallback = await apiClient.get<StoryListItem[]>("/stories");
    return fallback.data.slice(1, 4);
  } catch {
    return [];
  }
}

export async function getPurchasedStories(): Promise<StoryListItem[]> {
  try {
    const res = await apiClient.get<StoryListItem[]>("/profile/purchased");
    if (res.data && res.data.length > 0) return res.data;
    const fallback = await apiClient.get<StoryListItem[]>("/stories");
    return fallback.data.filter(s => s.accessPolicy !== 0);
  } catch {
    return [];
  }
}

export interface AdminUserListItem {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isRestricted: boolean;
  createdAt: string;
}

export async function getAdminUsers(keyword?: string): Promise<AdminUserListItem[]> {
  const params = keyword ? { keyword } : {};
  const res = await apiClient.get<AdminUserListItem[]>("/admin/users", { params });
  return res.data;
}

export async function toggleUserRestriction(userId: string): Promise<{ id: string; isRestricted: boolean; message: string }> {
  const res = await apiClient.put<{ id: string; isRestricted: boolean; message: string }>(
    `/admin/users/${userId}/toggle-restriction`
  );
  return res.data;
}

