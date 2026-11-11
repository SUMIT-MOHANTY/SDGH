// ============================================================
// LibraMS — Axios API Client with JWT Interceptors
// ============================================================

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { mockData } from '@/mocks/mockData';

// Environment configuration
export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false'; // Default true for dev
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// ── Token storage helpers ─────────────────────────────────────
// SECURITY NOTE: Tokens stored in localStorage for simplicity.
// For production, consider httpOnly cookies for refresh tokens.
export const tokenStorage = {
  getAccess: () => localStorage.getItem('librams_access_token'),
  getRefresh: () => localStorage.getItem('librams_refresh_token'),
  setTokens: (access: string, refresh: string) => {
    localStorage.setItem('librams_access_token', access);
    localStorage.setItem('librams_refresh_token', refresh);
  },
  clear: () => {
    localStorage.removeItem('librams_access_token');
    localStorage.removeItem('librams_refresh_token');
  },
};

// ── Axios instance ────────────────────────────────────────────
export const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ── Request interceptor — attach JWT token ────────────────────
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenStorage.getAccess();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor — 401 handler & token refresh ────────
let isRefreshing = false;
let failedQueue: Array<{ resolve: (value: unknown) => void; reject: (reason?: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenStorage.getRefresh();

      if (!refreshToken) {
        isRefreshing = false;
        // Dispatch logout event — AuthProvider listens and handles redirect via React Router
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        tokenStorage.setTokens(data.access, data.refresh || refreshToken);
        processQueue(null, data.access);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${data.access}`;

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        tokenStorage.clear();
        // Dispatch logout event — AuthProvider listens and handles redirect via React Router
        window.dispatchEvent(new Event('auth:logout'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// ── Typed API helper functions with mock fallback ─────────────
export async function apiGet<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  if (USE_MOCK) return mockGet<T>(url);
  const response = await api.get<T>(url, config);
  return response.data;
}

export async function apiPost<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  if (USE_MOCK) return mockPost<T>(url, data);
  const response = await api.post<T>(url, data, config);
  return response.data;
}

export async function apiPut<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  if (USE_MOCK) return mockPut<T>(url, data);
  const response = await api.put<T>(url, data, config);
  return response.data;
}

export async function apiPatch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
  if (USE_MOCK) return mockPatch<T>(url, data);
  const response = await api.patch<T>(url, data, config);
  return response.data;
}

export async function apiDelete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
  if (USE_MOCK) return mockDelete<T>(url);
  const response = await api.delete<T>(url, config);
  return response.data;
}

// ── Mock data handlers ────────────────────────────────────────
function mockGet<T>(url: string): Promise<T> {
  if (url.match(/\/books\/\d+$/)) {
    const id = parseInt(url.split('/').pop() || '1');
    return Promise.resolve(mockData.books.find((b) => b.id === id) as T);
  }
  if (url.includes('/books')) {
    return Promise.resolve({ count: mockData.books.length, next: null, previous: null, results: mockData.books } as T);
  }
  if (url.match(/\/members\/\d+$/)) {
    const id = parseInt(url.split('/').pop() || '1');
    return Promise.resolve(mockData.members.find((m) => m.id === id) as T);
  }
  if (url.includes('/members')) {
    return Promise.resolve({ count: mockData.members.length, next: null, previous: null, results: mockData.members } as T);
  }
  if (url.includes('/loans')) {
    return Promise.resolve({ count: mockData.loans.length, next: null, previous: null, results: mockData.loans } as T);
  }
  if (url.includes('/fines')) {
    return Promise.resolve({ count: mockData.fines.length, next: null, previous: null, results: mockData.fines } as T);
  }
  if (url.includes('/reservations')) {
    return Promise.resolve({ count: mockData.reservations.length, next: null, previous: null, results: mockData.reservations } as T);
  }
  if (url.includes('/dashboard')) {
    return Promise.resolve(mockData.dashboardStats as T);
  }
  if (url.includes('/audit')) {
    return Promise.resolve({ count: mockData.auditLogs.length, next: null, previous: null, results: mockData.auditLogs } as T);
  }
  if (url.includes('/auth/me') || url.includes('/accounts/me')) {
    return Promise.resolve(mockData.users[0] as T);
  }
  return Promise.resolve({} as T);
}

function mockPost<T>(url: string, data?: unknown): Promise<T> {
  // Mock login
  if (url.includes('/token') || url.includes('/login')) {
    const body = data as { email?: string; username?: string; password?: string };
    const email = body?.email || body?.username || '';
    const user = mockData.users.find((u) => u.email === email) || mockData.users[0];
    return Promise.resolve({
      access: 'mock-access-token-' + Date.now(),
      refresh: 'mock-refresh-token-' + Date.now(),
      user,
    } as T);
  }
  console.log('[MOCK POST]', url, data);
  return Promise.resolve({ id: Math.floor(Math.random() * 1000), ...((data as object) || {}) } as T);
}

function mockPut<T>(_url: string, data?: unknown): Promise<T> {
  return Promise.resolve({ ...((data as object) || {}) } as T);
}

function mockPatch<T>(_url: string, data?: unknown): Promise<T> {
  return Promise.resolve({ ...((data as object) || {}) } as T);
}

function mockDelete<T>(_url: string): Promise<T> {
  return Promise.resolve({ success: true } as T);
}

export default api;
