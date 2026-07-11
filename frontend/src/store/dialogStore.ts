import { create } from 'zustand';

export type DialogType = 
  | 'Confirmation'
  | 'Information'
  | 'Warning'
  | 'Error'
  | 'KnowledgePackRequired'
  | 'UpdateAvailable'
  | 'InstallationProgress'
  | 'RestartRuntime'
  | 'ExportComplete'
  | 'DeleteConfirmation'
  | null;

export interface DialogOptions {
  title?: string;
  message?: string;
  requiredPack?: string;
  dependencies?: string[];
  progress?: number;
  statusText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
}

interface DialogState {
  isOpen: boolean;
  type: DialogType;
  options: DialogOptions;
  showDialog: (type: DialogType, options?: DialogOptions) => void;
  hideDialog: () => void;
  updateProgress: (progress: number, statusText?: string) => void;
}

export const useDialogStore = create<DialogState>((set) => ({
  isOpen: false,
  type: null,
  options: {},
  showDialog: (type, options = {}) => set({ isOpen: true, type, options }),
  hideDialog: () => set({ isOpen: false, type: null, options: {} }),
  updateProgress: (progress, statusText) => set((state) => ({
    options: { ...state.options, progress, statusText: statusText ?? state.options.statusText }
  })),
}));
