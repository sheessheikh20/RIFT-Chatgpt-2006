import { create } from 'zustand';
import type { KnowledgePack } from '../types';
import * as api from '../api';

interface KnowledgePackStore {
  packs: KnowledgePack[];
  isLoading: boolean;
  error: string | null;

  loadPacks: () => Promise<void>;
  installPack: (id: string) => Promise<void>;
  uninstallPack: (id: string) => Promise<void>;
  clearError: () => void;

  // Computed helpers
  getInstalledPacks: () => KnowledgePack[];
  getAvailablePacks: () => KnowledgePack[];
  isPackInstalled: (id: string) => boolean;
}

export const useKnowledgePackStore = create<KnowledgePackStore>()((set, get) => ({
  packs: [],
  isLoading: false,
  error: null,

  loadPacks: async () => {
    set({ isLoading: true, error: null });
    try {
      const packs = await api.fetchKnowledgePacks();
      set({ packs, isLoading: false });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load knowledge packs';
      set({ error: msg, isLoading: false });
    }
  },

  installPack: async (id: string) => {
    set({ error: null });
    try {
      const result = await api.installKnowledgePack(id);
      set(state => ({
        packs: state.packs.map(p => (p.id === id ? result.pack : p)),
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to install pack: ${id}`;
      set({ error: msg });
      throw err;
    }
  },

  uninstallPack: async (id: string) => {
    set({ error: null });
    try {
      const result = await api.uninstallKnowledgePack(id);
      set(state => ({
        packs: state.packs.map(p => (p.id === id ? result.pack : p)),
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : `Failed to uninstall pack: ${id}`;
      set({ error: msg });
      throw err;
    }
  },

  clearError: () => set({ error: null }),

  getInstalledPacks: () => get().packs.filter(p => p.installed),
  getAvailablePacks: () => get().packs.filter(p => !p.installed),
  isPackInstalled: (id: string) => get().packs.some(p => p.id === id && p.installed),
}));
