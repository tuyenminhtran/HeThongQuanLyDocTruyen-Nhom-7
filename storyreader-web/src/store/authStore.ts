import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getRoleFromToken, getDisplayNameFromToken, getUserIdFromToken, isTokenExpired } from "../utils/jwt";
import { revokeServerSession } from "../api/auth";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  email: string | null;
  displayName: string | null;
  roles: string[];
  setAuth: (token: string, email: string, displayName?: string, refreshToken?: string | null) => void;
  setDisplayName: (displayName: string) => void;
  logout: () => void;
  logoutAndRevoke: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      userId: null,
      email: null,
      displayName: null,
      roles: [],
      setAuth: (accessToken, email, displayName, refreshToken) => {
        if (isTokenExpired(accessToken)) {
          set({ accessToken: null, refreshToken: null, userId: null, email: null, displayName: null, roles: [] });
          return;
        }
        const resolvedName = getDisplayNameFromToken(accessToken) || displayName || email.split("@")[0];
        set((state) => ({
          accessToken,
          refreshToken: refreshToken === undefined ? state.refreshToken : refreshToken,
          userId: getUserIdFromToken(accessToken),
          email,
          displayName: resolvedName,
          roles: getRoleFromToken(accessToken),
        }));
      },
      setDisplayName: (displayName) => set({ displayName }),
      logout: () => set({ accessToken: null, refreshToken: null, userId: null, email: null, displayName: null, roles: [] }),
      logoutAndRevoke: async () => {
        const { accessToken, refreshToken, logout } = get();
        if (accessToken && !isTokenExpired(accessToken)) {
          try {
            await revokeServerSession(refreshToken);
          } catch {
            // Bỏ qua lỗi mạng khi đăng xuất để vẫn dọn sạch phiên cục bộ
          }
        }
        logout();
      },
    }),
    {
      name: "storyreader-auth",
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken && isTokenExpired(state.accessToken) && !state.refreshToken) {
          state.logout();
        }
      },
    }
  )
);

export const useIsAdmin = () =>
  useAuthStore((s) => !!s.accessToken && !isTokenExpired(s.accessToken) && s.roles.includes("Admin"));

export const useCurrentUserId = () =>
  useAuthStore((s) => (s.accessToken && !isTokenExpired(s.accessToken) ? s.userId || getUserIdFromToken(s.accessToken) : null));
