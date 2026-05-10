"use client";

import { create } from "zustand";
import type { CookieUser } from "@/lib/auth/cookies";

type AuthStore = {
  user: CookieUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: CookieUser | null) => void;
  setLoading: (value: boolean) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: Boolean(user),
      isLoading: false,
    }),
  setLoading: (isLoading) => set({ isLoading }),
}));
