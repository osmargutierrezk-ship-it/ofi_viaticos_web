// public/sw.js
// OFI — Web Push Service Worker
// Registered by the React app at startup. Receives push events from the
// Laravel backend (via Web Push Protocol / VAPID) and shows browser notifications.

const CACHE_NAME = 'ofi-cache-v1';
const STATIC_ASSETS = ['/', '/index.html'];

// ─── Install ──────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting(); // Activate immediately
});

// ─── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim(); // Take control of all open tabs
});

// ─── Push ─────────────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {};
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'OFI', body: event.data.text() };
  }

  const { title = 'OFI Notificación', body = '', data = {} } = payload;

  const options = {
    body,
    icon: '/assets/logo.png',
    badge: '/assets/logo.png',  // 96×96 monochrome icon for Android
    tag: data.notificationId || 'ofi-notif',
    renotify: true,
    requireInteraction: false,
    vibrate: [200, 100, 200],
    data: {
      url: data.requestId ? `/requests/${data.requestId}` : '/',
      ...data,
    },
    actions: data.requestId
      ? [
          { action: 'view', title: 'Ver solicitud' },
          { action: 'dismiss', title: 'Descartar' },
        ]
      : [],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ─── Notification Click ───────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Focus existing tab if open
        const existing = windowClients.find((c) => c.url.includes(self.location.origin));
        if (existing) {
          existing.focus();
          return existing.navigate(targetUrl);
        }
        // Otherwise open a new tab
        return clients.openWindow(targetUrl);
      })
  );
});

// ─── Background Sync (optional queue for offline actions) ─────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-pending-actions') {
    event.waitUntil(syncPendingActions());
  }
});

async function syncPendingActions() {
  try {
    const cache = await caches.open('ofi-offline-queue');
    const keys  = await cache.keys();
    await Promise.all(
      keys.map(async (request) => {
        const response = await fetch(request.clone());
        if (response.ok) await cache.delete(request);
      })
    );
  } catch (err) {
    console.error('[SW] Background sync failed:', err);
  }
}
