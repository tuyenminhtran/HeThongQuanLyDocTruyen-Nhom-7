import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { isTokenExpired } from "../utils/jwt";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5066/api",
});

// Tự động gắn JWT token vào header của mọi request nếu token còn hạn.
apiClient.interceptors.request.use((config) => {
  const { accessToken, logout } = useAuthStore.getState();
  if (accessToken) {
    if (isTokenExpired(accessToken)) {
      logout();
    } else {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
  }
  return config;
});

// Nếu token hết hạn hoặc tài khoản bị khóa (401), tự động logout.
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
