/**
 * Electron IPC channel constants.
 * Shared between main.ts (handlers) and preload.ts (bridge) to prevent typos.
 */
export const IPC_CHANNELS = {
  // App metadata
  GET_APP_VERSION: 'app:getAppVersion',
  GET_PLATFORM: 'app:getPlatform',

  // File system dialogs
  OPEN_FILE_DIALOG: 'app:openFileDialog',
  SAVE_FILE_DIALOG: 'app:saveFileDialog',
  REVEAL_IN_EXPLORER: 'app:revealInExplorer',

  // Shell
  OPEN_EXTERNAL: 'shell:openExternal',

  // Backend health
  BACKEND_IS_RUNNING: 'backend:isRunning',

  // Window sizing
  RESIZE_WINDOW: 'window:resize',

  // Window controls
  MINIMIZE_WINDOW: 'window:minimize',
  MAXIMIZE_WINDOW: 'window:maximize',
  CLOSE_WINDOW: 'window:close',

  // OAuth
  ON_OAUTH_CALLBACK: 'oauth:callback',
} as const;

export type IpcChannel = (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS];
