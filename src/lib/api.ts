/**
 * PULSE API client
 *
 * Enable the real backend with either:
 *   VITE_API_URL=http://localhost:3001
 * or (same-origin / Vite proxy):
 *   VITE_USE_API=true
 *
 * When not configured, the UI keeps using local mock + localStorage.
 */

const rawUrl = import.meta.env.VITE_API_URL as string | undefined;
const useApiFlag = import.meta.env.VITE_USE_API === 'true';

/** null = API disabled; '' = same-origin; otherwise absolute base */
const API_BASE: string | null =
  rawUrl !== undefined && String(rawUrl).trim() !== ''
    ? String(rawUrl).replace(/\/$/, '')
    : useApiFlag
      ? ''
      : null;

const TOKEN_KEY = 'pulse_api_token_v1';

export function getApiBase(): string | null {
  return API_BASE;
}

export function isApiConfigured(): boolean {
  return API_BASE !== null;
}

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null): void {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

/** True when API is configured and a session token exists */
export function isApiSessionActive(): boolean {
  return isApiConfigured() && Boolean(getStoredToken());
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  if (API_BASE === null) {
    throw new ApiError(0, 'API not configured (set VITE_API_URL or VITE_USE_API=true)');
  }

  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined)
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string }).error || res.statusText || 'Request failed');
  }
  return data as T;
}

export interface BootstrapPayload {
  user?: unknown;
  families?: unknown[];
  students?: unknown[];
  parents?: unknown[];
  teachers?: unknown[];
  classes?: unknown[];
  activities?: unknown[];
  messages?: unknown[];
  corrections?: unknown[];
  categoryRules?: unknown[];
  auditLogs?: unknown[];
}

export const api = {
  health: () => request<{ ok: boolean; seeded: boolean }>('/api/health'),

  login: (email: string, password?: string) =>
    request<{ token: string; user: unknown }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }),

  loginDemo: (userId: string) =>
    request<{ token: string; user: unknown }>('/api/auth/demo', {
      method: 'POST',
      body: JSON.stringify({ userId })
    }),

  me: () => request<{ user: unknown }>('/api/auth/me'),

  logout: () => request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),

  demoAccounts: () => request<{ accounts: unknown[] }>('/api/auth/demo-accounts'),

  bootstrap: () => request<BootstrapPayload>('/api/pulse/bootstrap'),

  leaderboard: (timeframe: string) =>
    request<{ rankedFamilies: unknown[]; topThree: unknown[] }>(
      `/api/pulse/leaderboard?timeframe=${encodeURIComponent(timeframe)}`
    ),

  awardPoints: (payload: {
    familyId: string;
    studentId?: string;
    categoryId: string;
    title: string;
    description?: string;
    points: number;
    timeframe?: string;
  }) =>
    request<{ activity: unknown }>('/api/pulse/points', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  sendMessage: (payload: Record<string, unknown>) =>
    request<{ message: unknown }>('/api/pulse/messages', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  acknowledgeMessage: (messageId: string) =>
    request<{ message: unknown; pointsAwarded: number }>(
      `/api/pulse/messages/${messageId}/acknowledge`,
      { method: 'POST' }
    ),

  submitCorrection: (activityId: string, reason: string) =>
    request<{ correction: unknown }>('/api/pulse/corrections', {
      method: 'POST',
      body: JSON.stringify({ activityId, reason })
    }),

  resolveCorrection: (
    correctionId: string,
    decision: 'resolved' | 'declined',
    note: string,
    pointsDelta?: number
  ) =>
    request<{ correction: unknown }>(`/api/pulse/corrections/${correctionId}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ decision, note, pointsDelta })
    }),

  updateRules: (weights: Record<string, number>) =>
    request<{ categoryRules: unknown[] }>('/api/pulse/rules', {
      method: 'PUT',
      body: JSON.stringify({ weights })
    })
};
