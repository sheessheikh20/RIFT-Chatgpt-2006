/**
 * Shared TypeScript types for the ChatGPT Professional Enterprise Suite (2006 Concept).
 * These interfaces mirror the Spring Boot backend DTOs and entities.
 */

// ─── Auth & User ──────────────────────────────────────────────────────────────

export interface AuthResponse {
  token: string | null;
  username: string;
  registeredTo: string;
  licenseType: string;
  serialNumber: string;
  queriesRemaining: number;
}

export interface AuthRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  registeredTo: string;
  licenseType: string;
}

export interface LicenseStatus {
  registeredTo: string;
  licenseType: string;
  serialNumber: string;
  queriesRemaining: number;
}

// ─── Conversations & Messages ─────────────────────────────────────────────────

export interface Conversation {
  id: string;
  title: string;
  folder: ConversationFolder;
  createdAt: string;
  updatedAt: string;
}

export type ConversationFolder =
  | 'Inbox'
  | 'Programming'
  | 'Personal'
  | 'Work'
  | 'Favorites'
  | 'Archive'
  | 'Deleted';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  assistantProfile: string | null;
  createdAt: string;
}

export interface MessageSendRequest {
  content: string;
  assistantProfile: string;
  connectionType: ConnectionType;
}

export interface MessageSendResponse {
  id: string;
  role: 'assistant';
  content: string;
  createdAt: string;
  latencyMs: number;
  queriesRemaining: number;
}

export type ConnectionType = 'dialup' | 'dsl' | 'broadband' | 'lan';

// ─── Knowledge Packs ─────────────────────────────────────────────────────────

export interface KnowledgePack {
  id: string;
  name: string;
  description: string;
  installed: boolean;
  sizeMb: number;
  estimatedDownloadMinutes: number;
  category: string;
}

export type KnowledgePackId =
  | 'programming'
  | 'mathematics'
  | 'history'
  | 'dictionary'
  | 'grammar'
  | 'medicine'
  | 'finance'
  | 'astronomy'
  | 'engineering'
  | 'legal';

export interface KnowledgePackMissingError {
  error: 'KNOWLEDGE_PACK_MISSING';
  packId: KnowledgePackId;
  packName: string;
  sizeMb: number;
  estimatedDownloadMinutes: number;
  message: string;
}

// ─── Assistant Profiles ───────────────────────────────────────────────────────

export interface AssistantProfile {
  id: string;
  displayName: string;
  description: string;
  systemPromptOverride: string | null;
  avatarIcon: string;
  isDefault: boolean;
  createdAt: string;
}

export type AssistantProfileId =
  | 'programmer'
  | 'scientist'
  | 'teacher'
  | 'business-consultant'
  | 'creative-writer'
  | 'historian';

// ─── Settings ─────────────────────────────────────────────────────────────────

export interface AppSettings {
  theme: 'luna-blue' | 'olive-green' | 'silver' | 'classic';
  assistantProfile: string;
  windowLayout: 'standard' | 'compact' | 'wide';
  networkPreference: ConnectionType;
  autosave: boolean;
  startupBehavior: 'splash' | 'direct';
}

// ─── Maintenance / Defrag ─────────────────────────────────────────────────────

export type ClusterState = 'U' | 'F' | 'P' | 'W' | 'E' | 'S';

export interface DefragStatus {
  taskId: string;
  type: string;
  progress: number;
  completed: boolean;
  clusters: ClusterState[];
  message: string;
}

export type MaintenanceTaskType =
  | 'optimize_cache'
  | 'repair_db'
  | 'rebuild_dict'
  | 'clean_temp'
  | 'repair_index';

// ─── Benchmark ────────────────────────────────────────────────────────────────

export interface BenchmarkResult {
  testName: string;
  score: number;
  unit: string;
  rating: string;
}

export interface DiagnosticsResult {
  javaVersion: string;
  availableProcessors: number;
  maxMemoryMb: number;
  usedMemoryMb: number;
  freeMemoryMb: number;
  systemProperties: Record<string, string>;
}

// ─── Local Data ───────────────────────────────────────────────────────────────

export interface InitializeResult {
  status: 'success' | 'error';
  message: string;
  logs: string[];
}

// ─── Error Responses ─────────────────────────────────────────────────────────

export interface ApiError {
  error: string;
  message: string;
  [key: string]: unknown;
}

export interface QuotaExceededError extends ApiError {
  error: 'LICENSE_QUOTA_EXCEEDED';
}

// ─── Electron IPC ─────────────────────────────────────────────────────────────

export interface ElectronAPI {
  getAppVersion: () => Promise<string>;
  getPlatform: () => Promise<string>;
  openFileDialog: () => Promise<string | null>;
  saveFileDialog: (defaultName?: string) => Promise<string | null>;
  revealInExplorer: (path: string) => Promise<void>;
  openExternal: (url: string) => Promise<void>;
  isBackendRunning: () => Promise<boolean>;
  resizeWindow: (width: number, height: number) => Promise<void>;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  onOAuthCallback: (callback: (data: { token?: string; name?: string; email?: string; picture?: string; error?: string }) => void) => void;
  removeOAuthListener: () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
