// src/services/api.js
// Central Axios instance — reads VITE_API_URL from the Vite env
// so the same build works locally and on Render.

import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL
    ? `${import.meta.env.VITE_API_URL}/api`
    : '/api',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  withCredentials: true,
  timeout: 15_000,
});

// ── Attach Bearer token on every request ──────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ofi_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Global error handling ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('ofi_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────────────────────────────────────
export const authApi = {
  login:  (email, password) => api.post('/auth/login', { email, password }),
  logout: ()                => api.post('/auth/logout'),
  me:     ()                => api.get('/auth/me'),
};

// ─────────────────────────────────────────────────────────────────────────────
// REQUESTS
// ─────────────────────────────────────────────────────────────────────────────
export const requestsApi = {
  list:    (params = {}) => api.get('/requests', { params }),
  stats:   ()            => api.get('/requests/stats'),
  get:     (id)          => api.get(`/requests/${id}`),
  create:  (data)        => api.post('/requests', data),
  update:  (id, data)    => api.put(`/requests/${id}`, data),
  delete:  (id)          => api.delete(`/requests/${id}`),
  submit:  (id)          => api.post(`/requests/${id}/submit`),
  approve: (id, comment) => api.post(`/requests/${id}/approve`, { comment }),
  reject:  (id, comment) => api.post(`/requests/${id}/reject`, { comment }),
  comment: (id, comment) => api.post(`/requests/${id}/comment`, { comment }),
  history: (id)          => api.get(`/requests/${id}/history`),
  audit:   (id)          => api.get(`/requests/${id}/audit`),
};

// ─────────────────────────────────────────────────────────────────────────────
// FILES
// ─────────────────────────────────────────────────────────────────────────────
export const filesApi = {
  upload: (requestId, file, category = 'factura') => {
    const form = new FormData();
    form.append('file', file);
    form.append('category', category);
    return api.post(`/requests/${requestId}/files`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        const pct = Math.round((e.loaded * 100) / e.total);
        console.debug(`[upload] ${file.name}: ${pct}%`);
      },
    });
  },
  delete: (fileId) => api.delete(`/files/${fileId}`),
};

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────
export const notificationsApi = {
  list:       (params = {}) => api.get('/notifications', { params }),
  markRead:   (id)          => api.post(`/notifications/${id}/read`),
  markAllRead:()            => api.post('/notifications/read'),
  subscribe:  (sub)         => api.post('/push/subscribe', sub),
  unsubscribe:(endpoint)    => api.delete('/push/unsubscribe', { data: { endpoint } }),
};

// ─────────────────────────────────────────────────────────────────────────────
// PUSH NOTIFICATION HELPER
// Registers the service worker and subscribes the browser to Web Push.
// Call this once after a successful login.
// ─────────────────────────────────────────────────────────────────────────────
export async function registerPushNotifications() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('[push] Not supported in this browser.');
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[push] Permission denied.');
      return;
    }

    // Register service worker
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    // Subscribe to push
    const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    const subscription = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    const { endpoint, keys } = subscription.toJSON();
    await notificationsApi.subscribe({
      endpoint,
      p256dh_key: keys.p256dh,
      auth_key:   keys.auth,
    });

    console.info('[push] Subscribed to push notifications.');
  } catch (err) {
    console.error('[push] Registration failed:', err);
  }
}

// ─── Utility: convert VAPID public key from Base64URL to Uint8Array ───────────
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw     = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}


// ─────────────────────────────────────────────────────────────────────────────
// src/hooks/useRequests.js
// React hook for paginated request list with filters
// ─────────────────────────────────────────────────────────────────────────────
/*
import { useState, useEffect, useCallback } from 'react';
import { requestsApi } from '../services/api';

export function useRequests(initialFilters = {}) {
  const [requests, setRequests]   = useState([]);
  const [meta, setMeta]           = useState({ current_page:1, last_page:1, total:0 });
  const [filters, setFilters]     = useState(initialFilters);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await requestsApi.list(filters);
      setRequests(data.data);
      setMeta({ current_page: data.current_page, last_page: data.last_page, total: data.total });
    } catch (e) {
      setError(e.response?.data?.message || 'Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetch(); }, [fetch]);

  return { requests, meta, loading, error, filters, setFilters, refetch: fetch };
}
*/

// ─────────────────────────────────────────────────────────────────────────────
// src/hooks/useNotifications.js
// Polls for unread notifications every 30 seconds
// ─────────────────────────────────────────────────────────────────────────────
/*
import { useState, useEffect } from 'react';
import { notificationsApi } from '../services/api';

export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const [loading, setLoading]             = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await notificationsApi.list({ per_page: 10 });
      setNotifications(data.data);
      setUnreadCount(data.unread_count);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    await notificationsApi.markRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const markAllRead = async () => {
    await notificationsApi.markAllRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    fetch();
    const interval = setInterval(fetch, 30_000); // poll every 30 s
    return () => clearInterval(interval);
  }, []);

  return { notifications, unreadCount, loading, markRead, markAllRead, refetch: fetch };
}
*/
