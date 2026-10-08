import { apiClient } from "./client";

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

export interface UpdateProfilePayload {
  displayName: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function getProfile(): Promise<UserProfile> {
  const res = await apiClient.get<UserProfile>("/profile");
  return res.data;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<{ message: string; displayName: string }> {
  const res = await apiClient.put<{ message: string; displayName: string }>("/profile", payload);
  return res.data;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
  const res = await apiClient.post<{ message: string }>("/profile/change-password", payload);
  return res.data;
}
