import { apiClient } from "./client";

export interface ScheduledChapterItem {
  id: string;
  storyId: string;
  storyTitle: string;
  storyCoverImageUrl: string;
  storyType: number; // 0: Novel, 1: Comic
  chapterNumber: number;
  title: string;
  publishAt: string | null;
  isPublished: boolean;
  createdAt: string;
  viewCount: number;
}

export interface ScheduleStats {
  pendingCount: number;
  publishedTodayCount: number;
  storiesCount: number;
  serverTimeUtc: string;
}

export interface ScheduledChaptersResponse {
  items: ScheduledChapterItem[];
  totalCount: number;
  page: number;
  pageSize: number;
  stats: ScheduleStats;
}

export interface ScheduledFilterParams {
  storyId?: string;
  status?: "pending" | "published" | "all";
  search?: string;
  page?: number;
  pageSize?: number;
}

export async function getScheduledChapters(params: ScheduledFilterParams = {}) {
  const res = await apiClient.get<ScheduledChaptersResponse>("/admin/schedules", { params });
  return res.data;
}

export async function publishChapterNow(chapterId: string) {
  const res = await apiClient.post<{ message: string }>(`/admin/schedules/${chapterId}/publish-now`);
  return res.data;
}

export async function rescheduleChapter(chapterId: string, publishAt: string | null) {
  const res = await apiClient.put<{ message: string }>(`/admin/schedules/${chapterId}/reschedule`, {
    publishAt,
  });
  return res.data;
}

export async function cancelSchedule(chapterId: string, deleteChapter: boolean = false) {
  const res = await apiClient.delete<{ message: string }>(`/admin/schedules/${chapterId}`, {
    params: { deleteChapter },
  });
  return res.data;
}
