'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { LocaleCode } from '@/lib/i18n/locales';

interface UIState {
  sidebarOpen: boolean;
  activeRoute: string;
  locale: LocaleCode;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setActiveRoute: (route: string) => void;
  setLocale: (locale: LocaleCode) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      activeRoute: '/dashboard',
      locale: 'en',
      toggleSidebar: () => set((state: UIState) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      setActiveRoute: (route: string) => set({ activeRoute: route }),
      setLocale: (locale: LocaleCode) => set({ locale }),
    }),
    {
      name: 'mamacare-ui',
      partialize: (state: any) => ({ sidebarOpen: state.sidebarOpen, locale: state.locale }),
    }
  )
);
