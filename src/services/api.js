import { useAuthStore } from '@/store/useAuthStore';
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api', // ← fixed port
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept':       'application/json',
  },
});

// ── Request Interceptor ────────────────────────────────────────────────────
// Reads token from Zustand store and attaches to every request.
// Since auth.service.js also sets api.defaults.headers directly after login,
// this interceptor acts as the fallback for requests made after page refresh
// where the store is rehydrated from localStorage.
//
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ───────────────────────────────────────────────────
// DO NOT unwrap .data here — auth.service.js and all other services
// destructure { data } from the response themselves.
// Unwrapping here would break: const { data } = await api.get('/users/me')
//
api.interceptors.response.use(
  (response) => response,   // ← return full response, not response.data

  (error) => {
    const status  = error.response?.status;
    const message =
      error.response?.data?.error      ??   // matches our backend { error: "..." } shape
      error.response?.data?.message    ??
      error.message                    ??
      'Unknown error';

    // Auto-logout on 401 — token expired or invalid
    if (status === 401) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject({ status, message, errors: error.response?.data?.errors ?? null });
  }
);

export default api;