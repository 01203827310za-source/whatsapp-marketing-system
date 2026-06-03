import { create } from "zustand";
import type { AuthUser } from "@factory/shared";

interface AuthState {
  user?: AuthUser;
  accessToken?: string;
  refreshToken?: string;
  setSession: (session: { user: AuthUser; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
}

const stored = localStorage.getItem("factory-session");

export const useAuthStore = create<AuthState>((set) => ({
  ...(stored ? JSON.parse(stored) : {}),
  setSession: (session) => {
    localStorage.setItem("factory-session", JSON.stringify(session));
    set(session);
  },
  logout: () => {
    localStorage.removeItem("factory-session");
    set({ user: undefined, accessToken: undefined, refreshToken: undefined });
  }
}));
