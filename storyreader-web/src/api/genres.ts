import { apiClient } from "./client";

export interface Genre {
  id: string;
  name: string;
  slug: string;
  storyCount: number;
}

export async function getGenres(): Promise<Genre[]> {
  const res = await apiClient.get<Genre[]>("/genres");
  return res.data;
}

export async function createGenre(name: string): Promise<Genre> {
  const res = await apiClient.post<Genre>("/genres", { name: name.trim() });
  return res.data;
}

export async function updateGenre(id: string, name: string): Promise<Genre> {
  const res = await apiClient.put<Genre>(`/genres/${id}`, { name: name.trim() });
  return res.data;
}

export async function deleteGenre(id: string): Promise<{ message: string }> {
  const res = await apiClient.delete<{ message: string }>(`/genres/${id}`);
  return res.data;
}
