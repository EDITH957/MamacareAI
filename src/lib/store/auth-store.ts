'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

interface User {
  id: string;
  email: string;
  fullName: string;
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, _password: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 800));
          const existing = localStorage.getItem('mamacare-users');
          const users: Array<{ id: string; email: string; password: string; fullName: string; createdAt: string }> =
            existing ? JSON.parse(existing) : [];
          const found = users.find((u) => u.email === email);
          if (!found) throw new Error('Invalid email or password');
          set({
            user: {
              id: found.id,
              email: found.email,
              fullName: found.fullName,
              createdAt: found.createdAt,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : 'Login failed',
          });
          throw err;
        }
      },

      register: async (email: string, password: string, fullName: string) => {
        set({ isLoading: true, error: null });
        try {
          await new Promise((resolve) => setTimeout(resolve, 800));
          const existing = localStorage.getItem('mamacare-users');
          const users: Array<{ id: string; email: string; password: string; fullName: string; createdAt: string }> =
            existing ? JSON.parse(existing) : [];
          if (users.some((u) => u.email === email)) {
            throw new Error('Email already registered');
          }
          const newUser = {
            id: uuidv4(),
            email,
            password,
            fullName,
            createdAt: new Date().toISOString(),
          };
          users.push(newUser);
          localStorage.setItem('mamacare-users', JSON.stringify(users));
          set({
            user: {
              id: newUser.id,
              email: newUser.email,
              fullName: newUser.fullName,
              createdAt: newUser.createdAt,
            },
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (err) {
          set({
            isLoading: false,
            error: err instanceof Error ? err.message : 'Registration failed',
          });
          throw err;
        }
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'mamacare-auth',
      partialize: (state: any) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
