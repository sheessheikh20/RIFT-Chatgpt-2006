import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthResponse } from '../types';
import * as api from '../api';

interface UserState {
  username: string;
  registeredTo: string;
  licenseType: string;
  serialNumber: string;
  queriesRemaining: number;
}

interface AuthStore {
  token: string | null;
  user: UserState | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<AuthResponse>;
  register: (username: string, password: string, registeredTo: string, licenseType: string) => Promise<AuthResponse>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  clearError: () => void;
  /** Silent auto-auth used after installer completes */
  silentAuth: () => Promise<boolean>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.login({ username, password });
          api.setToken(data.token);
          set({
            token: data.token,
            user: {
              username: data.username,
              registeredTo: data.registeredTo,
              licenseType: data.licenseType,
              serialNumber: data.serialNumber,
              queriesRemaining: data.queriesRemaining,
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return data;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Login failed';
          set({ isLoading: false, error: msg, isAuthenticated: false });
          throw err;
        }
      },

      register: async (username, password, registeredTo, licenseType) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.register({ username, password, registeredTo, licenseType });
          api.setToken(data.token);
          set({
            token: data.token,
            user: {
              username: data.username,
              registeredTo: data.registeredTo,
              licenseType: data.licenseType,
              serialNumber: data.serialNumber,
              queriesRemaining: data.queriesRemaining,
            },
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          return data;
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Registration failed';
          set({ isLoading: false, error: msg });
          throw err;
        }
      },

      logout: () => {
        api.setToken(null);
        set({ token: null, user: null, isAuthenticated: false, error: null });
      },

      refreshUser: async () => {
        const { isAuthenticated } = get();
        if (!isAuthenticated) return;
        try {
          const data = await api.getCurrentUser();
          set(state => ({
            user: state.user
              ? {
                  ...state.user,
                  queriesRemaining: data.queriesRemaining,
                  registeredTo: data.registeredTo,
                  licenseType: data.licenseType,
                  serialNumber: data.serialNumber,
                }
              : null,
          }));
        } catch {
          // Ignore refresh errors silently — token may have expired
        }
      },

      silentAuth: async () => {
        set({ isLoading: true });
        const success = await api.authenticateDefaultUser();
        if (success) {
          try {
            const data = await api.getCurrentUser();
            set({
              token: api.getToken(),
              user: {
                username: data.username,
                registeredTo: data.registeredTo,
                licenseType: data.licenseType,
                serialNumber: data.serialNumber,
                queriesRemaining: data.queriesRemaining,
              },
              isAuthenticated: true,
              isLoading: false,
            });
          } catch {
            set({ isLoading: false });
          }
        } else {
          set({ isLoading: false });
        }
        return success;
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'chat2006-auth',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);
