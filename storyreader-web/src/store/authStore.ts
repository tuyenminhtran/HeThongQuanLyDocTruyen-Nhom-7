import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getRoleFromToken, getDisplayNameFromToken } from "../utils/jwt";

interface AuthState {
  accessToken: string | null;
  email: string | null;
  displayName: string | null;
  roles: string[];
  setAuth: (token: string, email: string, displayName?: string) => void;
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
        const resolvedName = getDisplayNameFromToken(accessToken) || displayName || email.split("@")[0];
        set({
          accessToken,
          email,
          displayName: resolvedName,
          roles: getRoleFromToken(accessToken),
        });
      },
      logout: () => set({ accessToken: null, email: null, displayName: null, roles: [] }),
    }),
    { name: "storyreader-auth" }
  )
);

export const useIsAdmin = () => useAuthStore((s) => s.roles.includes("Admin"));
