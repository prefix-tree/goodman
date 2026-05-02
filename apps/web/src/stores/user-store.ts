import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserState {
  userId: string | null;
  userName: string | null;
  setUser: (userId: string, userName: string) => void;
  clear: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      userName: null,
      setUser: (userId, userName) => set({ userId, userName }),
      clear: () => set({ userId: null, userName: null }),
    }),
    { name: "sol-user" },
  ),
);
