import { apiClient } from "./client";

export interface DiscussionItem {
  id: string;
  content: string;
  createdAt: string;
  user: string;
}

export async function getChapterDiscussions(chapterId: string) {
  const res = await apiClient.get<DiscussionItem[]>(`/chapters/${chapterId}/discussions`);
  return res.data;
}

export async function postChapterDiscussion(chapterId: string, content: string) {
  await apiClient.post(`/chapters/${chapterId}/discussions`, { content });
}

export async function hideDiscussion(chapterId: string, discussionId: string) {
  await apiClient.put(`/chapters/${chapterId}/discussions/${discussionId}/hide`);
}
