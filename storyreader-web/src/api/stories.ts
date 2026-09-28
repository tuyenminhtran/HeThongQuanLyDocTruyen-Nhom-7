import { apiClient } from "./client";

export interface StoryListItem {
  id: string;
  title: string;
  coverImageUrl: string;
  author: string;
  status: number;
  accessPolicy: number;
  viewCount: number;
}

export interface ChapterListItem {
  id: string;
  chapterNumber: number;
  title: string;
  requiresAccess: boolean;
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
}

export interface CreateChapterInput {
  chapterNumber: number;
  title: string;
  content: string;
  publishAt: string | null;
}

export async function searchStories(keyword?: string) {
  const res = await apiClient.get<StoryListItem[]>("/stories", {
    params: { keyword },
  });
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

export async function addChapter(storyId: string, input: CreateChapterInput) {
  await apiClient.post(`/stories/${storyId}/chapters`, input);
}
