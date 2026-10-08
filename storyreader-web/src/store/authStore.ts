import { create } from "zustand";
import { persist } from "zustand/middleware";
import { getRoleFromToken } from "../utils/jwt";

interface AuthState {
  accessToken: string | null;
  email: string | null;
  displayName: string | null;
  roles: string[];
  updateDisplayName: (displayName: string) => void;
  setAuth: (token: string, email: string, displayName: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      email: null,
      displayName: null,
      roles: [],
      updateDisplayName: (displayName: string) => set((s) => ({ ...s, displayName })),
      setAuth: (accessToken, email, displayName) =>
        set({ accessToken, email, displayName, roles: getRoleFromToken(accessToken) }),
      logout: () => set({ accessToken: null, email: null, displayName: null, roles: [] }),
    }),
    { name: "storyreader-auth" }
  )
);

export const useIsAdmin = () => useAuthStore((s) => s.roles.includes("Admin"));
