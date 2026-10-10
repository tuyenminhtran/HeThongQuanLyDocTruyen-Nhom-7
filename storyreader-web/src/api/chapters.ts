import { apiClient } from "./client";

export interface ChapterContent {
  id: string;
  storyId?: string;
  chapterNumber: number;
  title: string;
  content: string;
}

export async function getChapterContent(id: string) {
  const res = await apiClient.get<ChapterContent>(`/chapters/${id}`);
  return res.data;
}
