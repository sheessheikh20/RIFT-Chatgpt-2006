import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from './ipc-channels.js';

/**
 * Electron preload script.
 * Exposes a strongly typed `window.electronAPI` bridge to the renderer process.
 * No Node.js APIs are directly exposed — everything goes through contextBridge.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  /** Returns the Electron app version (from package.json) */
  getAppVersion: (): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_APP_VERSION),

  /** Returns the OS platform string (e.g., 'win32') */
  getPlatform: (): Promise<string> =>
    ipcRenderer.invoke(IPC_CHANNELS.GET_PLATFORM),

  /** Opens a native file picker dialog and returns the selected path or null */
  openFileDialog: (): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.OPEN_FILE_DIALOG),

  /** Opens a native save dialog and returns the chosen path or null */
  saveFileDialog: (defaultName?: string): Promise<string | null> =>
    ipcRenderer.invoke(IPC_CHANNELS.SAVE_FILE_DIALOG, defaultName),

  /** Opens Windows Explorer at the given path */
  revealInExplorer: (path: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.REVEAL_IN_EXPLORER, path),

  /** Opens a URL in the system default browser */
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.OPEN_EXTERNAL, url),

  /** Pings the Spring Boot backend to check if it is running */
  isBackendRunning: (): Promise<boolean> =>
    ipcRenderer.invoke(IPC_CHANNELS.BACKEND_IS_RUNNING),

  /** Resizes the host Electron window dynamically */
  resizeWindow: (width: number, height: number): Promise<void> =>
    ipcRenderer.invoke(IPC_CHANNELS.RESIZE_WINDOW, width, height),

  /** Minimizes the host Electron window */
  minimizeWindow: (): void =>
    ipcRenderer.send(IPC_CHANNELS.MINIMIZE_WINDOW),

  /** Maximizes or unmaximizes the host Electron window */
  maximizeWindow: (): void =>
    ipcRenderer.send(IPC_CHANNELS.MAXIMIZE_WINDOW),

  /** Closes the host Electron window */
  closeWindow: (): void =>
    ipcRenderer.send(IPC_CHANNELS.CLOSE_WINDOW),

  /** Listen for OAuth callback deep links */
  onOAuthCallback: (callback: (data: { token?: string; name?: string; email?: string; picture?: string; error?: string }) => void): void => {
    const listener = (_event: any, data: any) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.ON_OAUTH_CALLBACK, listener);
  },
  
  /** Clean up OAuth callback listener */
  removeOAuthListener: (): void => {
    ipcRenderer.removeAllListeners(IPC_CHANNELS.ON_OAUTH_CALLBACK);
  }
});
