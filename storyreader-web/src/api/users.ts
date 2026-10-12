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
