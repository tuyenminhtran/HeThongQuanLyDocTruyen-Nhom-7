import { apiClient } from "./client";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  linkUrl: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationListResponse {
  unreadCount: number;
  items: NotificationItem[];
}

export async function getNotifications(page = 1, pageSize = 20) {
  const res = await apiClient.get<NotificationListResponse>("/notifications", {
    params: { page, pageSize },
  });
  return res.data;
}

export async function getUnreadNotificationCount() {
  const res = await apiClient.get<{ unreadCount: number }>("/notifications/unread-count");
  return res.data.unreadCount;
}

export async function markNotificationAsRead(id: string) {
  const res = await apiClient.put<{ message: string }>(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllNotificationsAsRead() {
  const res = await apiClient.put<{ message: string }>("/notifications/read-all");
  return res.data;
}
