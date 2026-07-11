import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AppSettings } from '../types';
import * as api from '../api';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'luna-blue',
  assistantProfile: 'programmer',
  windowLayout: 'standard',
  networkPreference: 'broadband',
  autosave: true,
  startupBehavior: 'splash',
};

interface SettingsStore {
  settings: AppSettings;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;

  loadSettings: () => Promise<void>;
  saveSettings: (updates: Partial<AppSettings>) => Promise<void>;
  updateLocalSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  clearError: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      settings: DEFAULT_SETTINGS,
      isLoading: false,
      isSaving: false,
      error: null,

      loadSettings: async () => {
        set({ isLoading: true, error: null });
        try {
          const loaded = await api.getSettings();
          set({ settings: { ...DEFAULT_SETTINGS, ...loaded }, isLoading: false });
        } catch {
          // Backend settings unavailable — use persisted/default settings
          set({ isLoading: false });
        }
      },

      saveSettings: async (updates: Partial<AppSettings>) => {
        set({ isSaving: true, error: null });
        const merged: AppSettings = { ...get().settings, ...updates };
        try {
          await api.saveSettings(merged);
          set({ settings: merged, isSaving: false });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : 'Failed to save settings';
          // Still update local state even if backend save fails
          set({ settings: merged, isSaving: false, error: msg });
        }
      },

      /** Update a single setting locally without persisting to backend (for live previews) */
      updateLocalSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
        set(state => ({ settings: { ...state.settings, [key]: value } }));
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'chat2006-settings',
      partialize: (state) => ({ settings: state.settings }),
    }
  )
);
