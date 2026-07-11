/**
 * API layer for the ChatGPT Professional Enterprise Suite backend.
 * All requests go through the Spring Boot backend at localhost:8080.
 * JWT token is stored in localStorage and attached to every authenticated request.
 */

import type {
  AuthResponse,
  AuthRequest,
  RegisterRequest,
  Conversation,
  ConversationFolder,
  Message,
  MessageSendRequest,
  MessageSendResponse,
  KnowledgePack,
  AssistantProfile,
  AppSettings,
  DefragStatus,
  BenchmarkResult,
  DiagnosticsResult,
  InitializeResult,
  LicenseStatus,
  MaintenanceTaskType,
} from './types';

const BASE_URL = 'http://localhost:8080';

// ─── Token Management ─────────────────────────────────────────────────────────

let jwtToken: string | null = localStorage.getItem('chat2006_token');

export const setToken = (token: string | null): void => {
  jwtToken = token;
  if (token) {
    localStorage.setItem('chat2006_token', token);
  } else {
    localStorage.removeItem('chat2006_token');
  }
};

export const getToken = (): string | null => jwtToken;

const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = { 'Content-Type': 'application/json' };
  if (jwtToken) {
    headers['Authorization'] = `Bearer ${jwtToken}`;
  }
  return headers;
};

// ─── Generic Fetch Wrapper ────────────────────────────────────────────────────

async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getHeaders(),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: res.statusText }));
    // Attach status to the error for callers to handle specific codes (e.g., 428)
    const err = Object.assign(new Error(errorBody.message || 'API error'), {
      status: res.status,
      ...errorBody,
    });
    throw err;
  }

  // Handle empty responses (e.g., 204 No Content)
  const text = await res.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const login = async (request: AuthRequest): Promise<AuthResponse> => {
  return apiFetch<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

export const register = async (request: RegisterRequest): Promise<AuthResponse> => {
  return apiFetch<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(request),
  });
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
  return apiFetch<AuthResponse>('/api/auth/me');
};

/**
 * Silent auto-auth: tries to login as admin/password, then registers if not found.
 * Used during installer completion to set up the initial session.
 */
export const authenticateDefaultUser = async (): Promise<boolean> => {
  try {
    const data = await login({ username: 'admin', password: 'password' });
    setToken(data.token);
    return true;
  } catch {
    // Login failed — try registration
    try {
      const data = await register({
        username: 'admin',
        password: 'password',
        registeredTo: 'Administrator',
        licenseType: 'Professional Enterprise',
      });
      setToken(data.token);
      return true;
    } catch {
      return false;
    }
  }
};

// ─── License ──────────────────────────────────────────────────────────────────

export const getLicenseStatus = async (): Promise<LicenseStatus> => {
  return apiFetch<LicenseStatus>('/api/license/status');
};

export const verifyLicense = async (serialNumber: string): Promise<{ valid: boolean; message: string }> => {
  return apiFetch('/api/license/verify', {
    method: 'POST',
    body: JSON.stringify({ serialNumber }),
  });
};

// ─── Conversations ────────────────────────────────────────────────────────────

export const fetchConversations = async (
  folder?: ConversationFolder,
  search?: string
): Promise<Conversation[]> => {
  const params = new URLSearchParams();
  if (folder) params.set('folder', folder);
  if (search) params.set('search', search);
  const query = params.toString() ? `?${params.toString()}` : '';
  return apiFetch<Conversation[]>(`/api/conversations${query}`);
};

export const createConversation = async (
  title: string,
  folder: ConversationFolder = 'Inbox'
): Promise<Conversation> => {
  return apiFetch<Conversation>('/api/conversations', {
    method: 'POST',
    body: JSON.stringify({ title, folder }),
  });
};

export const updateConversation = async (
  id: string,
  updates: { title?: string; folder?: ConversationFolder }
): Promise<Conversation> => {
  return apiFetch<Conversation>(`/api/conversations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export const deleteConversation = async (id: string): Promise<{ message: string }> => {
  return apiFetch(`/api/conversations/${id}`, { method: 'DELETE' });
};

// ─── Messages ─────────────────────────────────────────────────────────────────

export const fetchMessages = async (conversationId: string): Promise<Message[]> => {
  return apiFetch<Message[]>(`/api/conversations/${conversationId}/messages`);
};

export const sendMessage = async (
  conversationId: string,
  request: MessageSendRequest
): Promise<MessageSendResponse> => {
  return apiFetch<MessageSendResponse>(
    `/api/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(request),
    }
  );
};

export const exportConversation = async (
  id: string,
  format: 'txt' | 'html' | 'rtf' = 'txt'
): Promise<Blob> => {
  const res = await fetch(`${BASE_URL}/api/conversations/${id}/export?format=${format}`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error('Export failed');
  return res.blob();
};

// ─── Knowledge Packs ─────────────────────────────────────────────────────────

export const fetchKnowledgePacks = async (): Promise<KnowledgePack[]> => {
  return apiFetch<KnowledgePack[]>('/api/knowledge-packs');
};

export const installKnowledgePack = async (id: string): Promise<{ message: string; pack: KnowledgePack }> => {
  return apiFetch(`/api/knowledge-packs/${id}/install`, { method: 'POST' });
};

export const uninstallKnowledgePack = async (id: string): Promise<{ message: string; pack: KnowledgePack }> => {
  return apiFetch(`/api/knowledge-packs/${id}/uninstall`, { method: 'POST' });
};

// ─── Assistant Profiles ───────────────────────────────────────────────────────

export const fetchAssistantProfiles = async (): Promise<AssistantProfile[]> => {
  return apiFetch<AssistantProfile[]>('/api/assistant-profiles');
};

export const createAssistantProfile = async (profile: Partial<AssistantProfile>): Promise<AssistantProfile> => {
  return apiFetch<AssistantProfile>('/api/assistant-profiles', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
};

export const updateAssistantProfile = async (
  id: string,
  updates: Partial<AssistantProfile>
): Promise<AssistantProfile> => {
  return apiFetch<AssistantProfile>(`/api/assistant-profiles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
};

export const deleteAssistantProfile = async (id: string): Promise<{ message: string }> => {
  return apiFetch(`/api/assistant-profiles/${id}`, { method: 'DELETE' });
};

// ─── Local Data ───────────────────────────────────────────────────────────────

export const initializeLocalData = async (): Promise<InitializeResult> => {
  return apiFetch<InitializeResult>('/api/localdata/initialize', { method: 'POST' });
};

export const getSettings = async (): Promise<AppSettings> => {
  const text = await apiFetch<string>('/api/localdata/settings');
  return typeof text === 'string' ? JSON.parse(text) : text;
};

export const saveSettings = async (settings: AppSettings): Promise<{ status: string; message: string }> => {
  return apiFetch('/api/localdata/settings', {
    method: 'POST',
    body: JSON.stringify(settings),
  });
};

export const fetchLogs = async (category = 'app', limit = 100): Promise<string[]> => {
  return apiFetch<string[]>(`/api/localdata/logs?category=${category}&limit=${limit}`);
};

// ─── Maintenance (Defrag) ─────────────────────────────────────────────────────

export const startMaintenance = async (
  type: MaintenanceTaskType = 'optimize_cache'
): Promise<{ taskId: string; type: string; durationMs: number; message: string }> => {
  return apiFetch(`/api/maintenance/start?type=${type}`, { method: 'POST' });
};

export const getMaintenanceStatus = async (taskId: string): Promise<DefragStatus> => {
  return apiFetch<DefragStatus>(`/api/maintenance/status/${taskId}`);
};

// ─── Benchmark ────────────────────────────────────────────────────────────────

export const runBenchmark = async (): Promise<BenchmarkResult[]> => {
  return apiFetch<BenchmarkResult[]>('/api/benchmark/run', { method: 'POST' });
};

export const getDiagnostics = async (): Promise<DiagnosticsResult> => {
  return apiFetch<DiagnosticsResult>('/api/benchmark/diagnostics');
};
