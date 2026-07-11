import {
  app,
  BrowserWindow,
  ipcMain,
  dialog,
  shell,
  screen,
} from 'electron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, type ChildProcess } from 'child_process';
import http from 'http';
import { IPC_CHANNELS } from './ipc-channels.js';

// ESM-compatible __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Custom Deep Link Protocol Client ──────────────────────────────────────────
if (process.defaultApp) {
  if (process.argv.length >= 2) {
    app.setAsDefaultProtocolClient('chatgpt2006', process.execPath, [path.resolve(process.argv[1])]);
  }
} else {
  app.setAsDefaultProtocolClient('chatgpt2006');
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  console.log('[Electron] Another instance is already running. Quitting...');
  app.quit();
}

// Global state to store deep link URL on startup before window is ready
let initialDeepLinkUrl: string | null = process.argv.find((arg) => arg.startsWith('chatgpt2006://')) || null;

// ─── State ────────────────────────────────────────────────────────────────────

let mainWindow: BrowserWindow | null = null;
let backendProcess: ChildProcess | null = null;

const isDev = process.env['NODE_ENV'] === 'development' || !app.isPackaged;

// Spring Boot backend configuration
const BACKEND_PORT = 8080;
const BACKEND_HEALTH_URL = `http://localhost:${BACKEND_PORT}/api/localdata/logs?limit=1`;
const BACKEND_MAX_RETRIES = 30;
const BACKEND_RETRY_INTERVAL_MS = 1000;

// Helper to handle parsing deep links and forwarding to React frontend
function handleDeepLinkUrl(urlStr: string): void {
  console.log(`[Electron] Processing Deep Link URL: ${urlStr}`);
  try {
    const url = new URL(urlStr);
    const params = new URLSearchParams(url.search);
    const token = params.get('token');
    const name = params.get('name');
    const email = params.get('email');
    const picture = params.get('picture');
    const error = params.get('error');

    if (mainWindow) {
      mainWindow.webContents.send(IPC_CHANNELS.ON_OAUTH_CALLBACK, {
        token: token || undefined,
        name: name || undefined,
        email: email || undefined,
        picture: picture || undefined,
        error: error || undefined,
      });
    }
  } catch (err: any) {
    console.error('[Electron] Failed to parse deep link URL:', urlStr, err.message);
  }
}

// ─── Data Directory Initialization ────────────────────────────────────────────

function setupDataDirectories(): { basePath: string; dbUrl: string } {
  const basePath = path.join(app.getPath('userData'), 'Data');
  const dirs = [
    'database',
    'KnowledgePacks',
    'Sessions',
    'Logs',
    'Cache',
    'Runtime',
    'Config',
    'Updates',
    'Exports',
  ];
  for (const dir of dirs) {
    fs.mkdirSync(path.join(basePath, dir), { recursive: true });
  }
  const dbPath = path.join(basePath, 'database', 'chatgpt2006.db').replace(/\\/g, '/');
  const dbUrl = `jdbc:sqlite:${dbPath}`;
  return { basePath, dbUrl };
}

// ─── Backend Launcher ─────────────────────────────────────────────────────────

function getBackendJarPath(): string {
  if (isDev) {
    const projectRoot = path.resolve(__dirname, '../..');
    return path.join(projectRoot, 'backend', 'target', 'chat2006-1.0.1-SNAPSHOT.jar');
  }
  return path.join(process.resourcesPath, 'backend.jar');
}

function launchBackend(): void {
  const jarPath = getBackendJarPath();
  const { basePath, dbUrl } = setupDataDirectories();

  console.log(`[Electron] Launching Spring Boot: ${jarPath}`);

  backendProcess = spawn('java', ['-jar', jarPath], {
    env: {
      ...process.env,
      GEMINI_API_KEY: process.env['GEMINI_API_KEY'] ?? '',
      JWT_SECRET: process.env['JWT_SECRET'] ?? '',
      APP_DATA_BASE_PATH: basePath,
      SPRING_DATASOURCE_URL: dbUrl,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  backendProcess.stdout?.on('data', (data: Buffer) => {
    const line = data.toString().trim();
    if (line) console.log(`[Spring Boot] ${line}`);
  });

  backendProcess.stderr?.on('data', (data: Buffer) => {
    const line = data.toString().trim();
    if (line) console.error(`[Spring Boot ERR] ${line}`);
  });

  backendProcess.on('exit', (code) => {
    console.log(`[Electron] Spring Boot exited with code: ${code}`);
    backendProcess = null;
  });

  backendProcess.on('error', (err: Error) => {
    console.error(`[Electron] Failed to start Spring Boot:`, err.message);
    dialog.showErrorBox(
      'Backend Error',
      `Failed to launch the application backend.\n\nPlease ensure Java 17+ is installed.\n\nError: ${err.message}`,
    );
  });
}

function waitForBackend(retries = BACKEND_MAX_RETRIES): Promise<boolean> {
  return new Promise((resolve) => {
    const check = (remaining: number) => {
      const req = http.get(BACKEND_HEALTH_URL, (res) => {
        if (res.statusCode != null && res.statusCode < 500) {
          console.log(`[Electron] Backend ready (status ${res.statusCode})`);
          resolve(true);
        } else {
          retry(remaining);
        }
        res.resume();
      });
      req.on('error', () => retry(remaining));
      req.setTimeout(800, () => { req.destroy(); retry(remaining); });
    };

    const retry = (remaining: number) => {
      if (remaining <= 0) { console.warn('[Electron] Backend timed out'); resolve(false); return; }
      setTimeout(() => check(remaining - 1), BACKEND_RETRY_INTERVAL_MS);
    };

    check(retries);
  });
}

// ─── Window Creation ──────────────────────────────────────────────────────────

function createWindow(): void {
  console.log('[Electron] createWindow() called');

  // Get primary display dimensions and center the window
  const { width: sw, height: sh } = screen.getPrimaryDisplay().workAreaSize;
  const winW = 497, winH = 387;
  const x = Math.round((sw - winW) / 2);
  const y = Math.round((sh - winH) / 2);
  console.log(`[Electron] Centering window at x=${x} y=${y} on ${sw}x${sh} display`);

  mainWindow = new BrowserWindow({
    width: winW,
    height: winH,
    x,
    y,
    minWidth: 300,
    minHeight: 200,
    frame: false,
    thickFrame: true,
    resizable: true,
    title: 'ChatGPT Professional Enterprise Suite',
    show: true,
    alwaysOnTop: true,
    backgroundColor: '#ECE9D8',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.webContents.on('did-fail-load', (_event, errorCode, errorDescription, validatedURL) => {
    console.error(`[Electron] did-fail-load: ${errorCode} ${errorDescription} url=${validatedURL}`);
  });

  mainWindow.webContents.on('did-finish-load', () => {
    console.log('[Electron] did-finish-load — window should be visible now');
    mainWindow?.show();
    mainWindow?.focus();
    
    // Deliver initial deep link URL if application was started via protocol deep link
    if (initialDeepLinkUrl) {
      console.log(`[Electron] Delivering initial deep link URL: ${initialDeepLinkUrl}`);
      setTimeout(() => {
        if (initialDeepLinkUrl) {
          handleDeepLinkUrl(initialDeepLinkUrl);
          initialDeepLinkUrl = null;
        }
      }, 1000);
    }
    
    // Disable alwaysOnTop after a moment so normal window management works
    setTimeout(() => { mainWindow?.setAlwaysOnTop(false); }, 2000);
  });

  if (isDev) {
    console.log('[Electron] Loading: http://localhost:5173');
    void mainWindow.loadURL('http://localhost:5173').catch((err: Error) => {
      console.error('[Electron] loadURL error:', err.message);
    });
    // mainWindow.webContents.openDevTools(); // Disabled DevTools auto-open on startup
  } else {
    void mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => { mainWindow = null; });
}

// ─── IPC Handlers ─────────────────────────────────────────────────────────────

function registerIpcHandlers(): void {
  ipcMain.handle(IPC_CHANNELS.GET_APP_VERSION, () => app.getVersion());
  ipcMain.handle(IPC_CHANNELS.GET_PLATFORM, () => process.platform);

  ipcMain.handle(IPC_CHANNELS.OPEN_FILE_DIALOG, async () => {
    if (!mainWindow) return null;
    const result = await dialog.showOpenDialog(mainWindow, { properties: ['openDirectory'] });
    return result.canceled ? null : result.filePaths[0];
  });

  ipcMain.handle(IPC_CHANNELS.SAVE_FILE_DIALOG, async (_event, defaultName?: string) => {
    if (!mainWindow) return null;
    const result = await dialog.showSaveDialog(mainWindow, { defaultPath: defaultName ?? 'export' });
    return result.canceled ? null : result.filePath;
  });

  ipcMain.handle(IPC_CHANNELS.REVEAL_IN_EXPLORER, async (_event, filePath: string) => {
    shell.showItemInFolder(filePath);
  });

  ipcMain.handle(IPC_CHANNELS.OPEN_EXTERNAL, async (_event, url: string) => {
    await shell.openExternal(url);
  });

  ipcMain.handle(IPC_CHANNELS.BACKEND_IS_RUNNING, () =>
    new Promise<boolean>((resolve) => {
      const req = http.get(BACKEND_HEALTH_URL, (res) => {
        resolve(res.statusCode != null && res.statusCode < 500);
        res.resume();
      });
      req.on('error', () => resolve(false));
      req.setTimeout(2000, () => { req.destroy(); resolve(false); });
    }),
  );

  ipcMain.handle(IPC_CHANNELS.RESIZE_WINDOW, (_event, width: number, height: number) => {
    if (mainWindow) {
      mainWindow.setSize(width, height);
      mainWindow.center();
    }
  });

  ipcMain.on(IPC_CHANNELS.MINIMIZE_WINDOW, () => {
    mainWindow?.minimize();
  });

  ipcMain.on(IPC_CHANNELS.MAXIMIZE_WINDOW, () => {
    if (mainWindow) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on(IPC_CHANNELS.CLOSE_WINDOW, () => {
    mainWindow?.close();
  });
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────

// Intercept second instance of the app (Windows / Linux deep linking)
app.on('second-instance', (event, commandLine) => {
  console.log('[Electron] Second instance triggered with arguments:', commandLine);
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
  const url = commandLine.find((arg) => arg.startsWith('chatgpt2006://'));
  if (url) {
    handleDeepLinkUrl(url);
  }
});

// Intercept custom protocol scheme link open (macOS deep linking)
app.on('open-url', (event, url) => {
  event.preventDefault();
  console.log('[Electron] open-url event triggered:', url);
  handleDeepLinkUrl(url);
});

app.whenReady().then(async () => {
  registerIpcHandlers();

  const backendAlreadyRunning = await new Promise<boolean>((resolve) => {
    const req = http.get(BACKEND_HEALTH_URL, (res) => {
      resolve(res.statusCode != null && res.statusCode < 500);
      res.resume();
    });
    req.on('error', () => resolve(false));
    req.setTimeout(1000, () => { req.destroy(); resolve(false); });
  });

  if (!backendAlreadyRunning) {
    launchBackend();
    console.log('[Electron] Waiting for Spring Boot...');
    const ready = await waitForBackend();
    if (!ready) console.warn('[Electron] Backend health check failed — proceeding anyway');
  } else {
    console.log('[Electron] Backend already running — skipping launch');
  }

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
}).catch(console.error);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('will-quit', () => {
  if (backendProcess && !backendProcess.killed) {
    console.log('[Electron] Shutting down Spring Boot...');
    backendProcess.kill('SIGTERM');
  }
});
