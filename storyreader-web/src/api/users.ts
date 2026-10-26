import { apiClient } from "./client";
import type { StoryListItem } from "./stories";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isRestricted: boolean;
  createdAt: string;
  activePlanName?: string | null;
  subscriptionEndAt?: string | null;
}

export interface AdminUserItem {
  id: string;
  email: string;
  displayName: string;
  role: string;
  isRestricted: boolean;
  createdAt: string;
}

export async function getUserProfile(): Promise<UserProfile> {
  const res = await apiClient.get<UserProfile>("/profile/me");
  return res.data;
}

export async function updateUserProfile(displayName: string): Promise<{ message: string; displayName: string }> {
  const res = await apiClient.put<{ message: string; displayName: string }>("/profile/me", {
    displayName: displayName.trim(),
  });
  return res.data;
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>("/profile/change-password", {
    currentPassword,
    newPassword,
  });
  return res.data;
}

export async function getReadingHistory(): Promise<StoryListItem[]> {
  try {
    const res = await apiClient.get<StoryListItem[]>("/profile/history");
    return res.data;
  } catch {
    return [];
  }
}

export async function getBookmarks(): Promise<StoryListItem[]> {
  try {
    const res = await apiClient.get<StoryListItem[]>("/profile/bookmarks");
    return res.data;
  } catch {
    return [];
  }
}

export async function getPurchasedStories(): Promise<StoryListItem[]> {
  try {
    const res = await apiClient.get<StoryListItem[]>("/profile/purchased");
    return res.data;
  } catch {
    return [];
  }
}

export async function getAdminUsers(keyword?: string): Promise<AdminUserItem[]> {
  const params = keyword ? { keyword: keyword.trim() } : {};
  const res = await apiClient.get<AdminUserItem[]>("/admin/users", { params });
  return res.data;
}

export async function toggleUserRestriction(id: string): Promise<{ id: string; isRestricted: boolean; message: string }> {
  const res = await apiClient.put<{ id: string; isRestricted: boolean; message: string }>(
    `/admin/users/${id}/toggle-restriction`
  );
  return res.data;
}
