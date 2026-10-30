import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getRoleFromToken, getDisplayNameFromToken, isTokenExpired } from "../utils/jwt";

interface AuthState {
  accessToken: string | null;
  email: string | null;
  displayName: string | null;
  roles: string[];
  setAuth: (token: string, email: string, displayName?: string) => void;
  setDisplayName: (displayName: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      email: null,
      displayName: null,
      roles: [],
      setAuth: (accessToken, email, displayName) => {
        if (isTokenExpired(accessToken)) {
          set({ accessToken: null, email: null, displayName: null, roles: [] });
          return;
        }
        const resolvedName = getDisplayNameFromToken(accessToken) || displayName || email.split("@")[0];
        set({
          accessToken,
          email,
          displayName: resolvedName,
          roles: getRoleFromToken(accessToken),
        });
      },
      setDisplayName: (displayName) => set({ displayName }),
      logout: () => set({ accessToken: null, email: null, displayName: null, roles: [] }),
    }),
    {
      name: "storyreader-auth",
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken && isTokenExpired(state.accessToken)) {
          state.logout();
        }
      },
    }
  )
);

export const useIsAdmin = () =>
  useAuthStore((s) => !!s.accessToken && !isTokenExpired(s.accessToken) && s.roles.includes("Admin"));
