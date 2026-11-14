import axios, { type InternalAxiosRequestConfig } from "axios";
import { useAuthStore } from "../store/authStore";
import { isTokenExpired } from "../utils/jwt";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5066/api",
});

interface RetryableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshPromise: Promise<string | null> | null = null;

async function tryRefreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  const { refreshToken, email, displayName, setAuth, logout } = useAuthStore.getState();
  if (!refreshToken) {
    logout();
    return null;
  }

  refreshPromise = axios
    .post<{
      accessToken: string;
      refreshToken?: string;
      email?: string;
      displayName?: string;
    }>(`${apiClient.defaults.baseURL}/auth/refresh`, { refreshToken })
    .then((res) => {
      const data = res.data;
      setAuth(
        data.accessToken,
        data.email || email || "",
        data.displayName || displayName || undefined,
        data.refreshToken ?? refreshToken
      );
      return data.accessToken;
    })
    .catch(() => {
      logout();
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

// Tự động gắn JWT token vào header của mọi request nếu token còn hạn.
apiClient.interceptors.request.use(async (config) => {
  const url = config.url || "";
  if (url.includes("/auth/refresh") || url.includes("/auth/login") || url.includes("/auth/register")) {
    return config;
  }

  const { accessToken, refreshToken, logout } = useAuthStore.getState();
  if (accessToken) {
    if (!isTokenExpired(accessToken)) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    } else if (refreshToken) {
      const nextToken = await tryRefreshAccessToken();
      if (nextToken) {
        config.headers.Authorization = `Bearer ${nextToken}`;
      }
    } else {
      logout();
    }
  }
  return config;
});

// Nếu gặp 401 (token vừa hết hạn hoặc bị thu hồi), thử xoay vòng refreshToken 1 lần trước khi logout.
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const url = originalRequest?.url || "";
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/refresh") ||
      url.includes("/auth/logout");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      const { refreshToken, logout } = useAuthStore.getState();
      if (refreshToken) {
        originalRequest._retry = true;
        const nextToken = await tryRefreshAccessToken();
        if (nextToken) {
          originalRequest.headers.Authorization = `Bearer ${nextToken}`;
          return apiClient(originalRequest);
        }
      } else {
        logout();
      }
    } else if (error.response?.status === 401 && !isAuthEndpoint) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);
