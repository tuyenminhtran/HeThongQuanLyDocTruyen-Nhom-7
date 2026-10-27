import { apiClient } from "./client";

export interface StoryListItem {
  id: string;
  title: string;
  coverImageUrl: string;
  author: string;
  status: number;
  accessPolicy: number;
  viewCount: number;
  type?: number; // 0 = Novel (Truyện chữ), 1 = Comic (Truyện tranh)
  totalChapters?: number;
  latestChapterNumber?: number;
}

export interface ChapterListItem {
  id: string;
  chapterNumber: number;
  title: string;
  requiresAccess: boolean;
  partName?: string | null;
}

export interface StoryDetail {
  id: string;
  title: string;
  coverImageUrl: string;
  description: string;
  author: string;
  status: number;
  accessPolicy: number;
  price: number | null;
  freeChapterCount: number;
  genres: string[];
  chapters: ChapterListItem[];
  viewCount?: number;
  type?: number;
}

export interface CreateStoryInput {
  title: string;
  coverImageUrl: string;
  description: string;
  author: string;
  accessPolicy: number;
  price: number | null;
  freeChapterCount: number;
  genreIds: string[];
  type?: number;
}

export interface CreateChapterInput {
  chapterNumber: number;
  title: string;
  content: string;
  publishAt: string | null;
  renderAsImages?: boolean;
  partName?: string | null;
}

export async function searchStories(keyword?: string, genreId?: string, pageSize: number = 100, sortBy?: string) {
  const params: Record<string, any> = { pageSize };
  if (keyword) params.keyword = keyword.trim();
  if (genreId && genreId !== "all") params.genreId = genreId;
  if (sortBy) params.sortBy = sortBy;
  const res = await apiClient.get<StoryListItem[]>("/stories", { params });
  return res.data;
}

export async function getStoryDetail(id: string) {
  const res = await apiClient.get<StoryDetail>(`/stories/${id}`);
  return res.data;
}

export async function createStory(input: CreateStoryInput) {
  const res = await apiClient.post<{ id: string }>("/stories", input);
  return res.data;
}

export async function updateStory(id: string, input: CreateStoryInput & { status?: number }) {
  await apiClient.put(`/stories/${id}`, input);
}

export async function uploadStoryCover(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await apiClient.post<{ url: string }>("/stories/upload-cover", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function deleteStory(id: string) {
  await apiClient.delete(`/stories/${id}`);
}

export async function addChapter(storyId: string, input: CreateChapterInput) {
  await apiClient.post(`/stories/${storyId}/chapters`, input);
}

export async function updateChapter(storyId: string, chapterId: string, input: CreateChapterInput) {
  await apiClient.put(`/stories/${storyId}/chapters/${chapterId}`, input);
}

export async function deleteChapter(storyId: string, chapterId: string) {
  await apiClient.delete(`/stories/${storyId}/chapters/${chapterId}`);
}

export async function toggleFollowStory(storyId: string) {
  const res = await apiClient.post<{ isFollowing: boolean; message: string }>(`/stories/${storyId}/follow`);
  return res.data;
}

export async function getIsFollowing(storyId: string) {
  const res = await apiClient.get<{ isFollowing: boolean }>(`/stories/${storyId}/is-following`);
  return res.data.isFollowing;
}
