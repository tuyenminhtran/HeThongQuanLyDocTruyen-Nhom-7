import { apiClient } from "./client";

export interface AuthResult {
  accessToken: string;
  expiresAt: string;
}

export async function login(email: string, password: string) {
  const res = await apiClient.post<AuthResult>("/auth/login", { email, password });
  return res.data;
}

export async function register(email: string, password: string, displayName: string) {
  const res = await apiClient.post<AuthResult>("/auth/register", {
    email,
    password,
    displayName,
  });
  return res.data;
}
