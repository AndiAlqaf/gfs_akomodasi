import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '@/types';

interface AppState {
  user: User | null;
  isAuthenticated: boolean;
  sidebarOpen: boolean;
  login: (user: User) => void;
  logout: () => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      sidebarOpen: false,
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
    }),
    {
      name: 'gfs-ceria-storage',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);

interface UIState {
  isSidebarHovered: boolean;
  setSidebarHovered: (hovered: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarHovered: false,
  setSidebarHovered: (hovered) => set({ isSidebarHovered: hovered }),
}));
