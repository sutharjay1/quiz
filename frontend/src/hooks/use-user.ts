import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  quiz: {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    title: string;
    description: string | null;
  } | null;
}

export interface AuthState {
  user: User | null;
  setUser: (userData: User | null) => void;
  logout: () => void;
}

export const useUser = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (userData) => set({ user: userData }),
      logout: () => set({ user: null }),
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
