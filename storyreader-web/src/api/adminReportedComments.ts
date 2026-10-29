import { apiClient } from "./client";

export interface ReportedCommentItem {
  id: string;
  content: string;
  status: number; // 0: Visible, 1: Hidden, 2: Reported
  statusName: string;
  reportReason: string | null;
  reportCount: number;
  createdAt: string;
  userId: string;
  userName: string;
  userEmail: string;
  isUserRestricted: boolean;
  chapterId: string;
  chapterNumber: number;
  chapterTitle: string;
  storyId: string;
  storyTitle: string;
  storyCoverImageUrl: string;
  storyType: number;
}

export interface ReportedCommentsStats {
  reportedCount: number;
  hiddenCount: number;
  visibleCount: number;
  restrictedUsersCount: number;
}

export interface ReportedCommentsResponse {
  items: ReportedCommentItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  stats: ReportedCommentsStats;
}

export interface ReportedCommentsFilterParams {
  status?: "reported" | "hidden" | "visible" | "all";
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getReportedComments(params: ReportedCommentsFilterParams = {}) {
  const res = await apiClient.get<ReportedCommentsResponse>("/admin/reported-comments", { params });
  return res.data;
}

export async function approveReportedComment(id: string) {
  const res = await apiClient.put<{ message: string }>(`/admin/reported-comments/${id}/approve`);
  return res.data;
}

export async function hideReportedComment(id: string) {
  const res = await apiClient.put<{ message: string }>(`/admin/reported-comments/${id}/hide`);
  return res.data;
}

export async function deleteReportedComment(id: string) {
  const res = await apiClient.delete<{ message: string }>(`/admin/reported-comments/${id}`);
  return res.data;
}

export async function restrictUserFromComment(id: string) {
  const res = await apiClient.post<{ message: string }>(`/admin/reported-comments/${id}/restrict-user`);
  return res.data;
}
