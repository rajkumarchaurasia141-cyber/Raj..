const CACHE_NAME = 'bseb-guru-v5';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('Precache partial fallback:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          const fallback = await caches.match('/');
          if (fallback) return fallback;
        }
        return new Response('Network error', { status: 408, headers: { 'Content-Type': 'text/plain' } });
      })
  );
});

// ============================================================================
// BSEB GURU SMART WEB PUSH NOTIFICATION HANDLER
// ============================================================================
self.addEventListener('push', (event) => {
  let payload = {
    title: 'BSEB GURU',
    body: '📚 BSEB GURU में नया अपडेट उपलब्ध है! अभी ऐप खोलें।',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'bseb-guru-notification',
    url: '/',
    data: {}
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = {
        ...payload,
        ...parsed,
        title: parsed.title || 'BSEB GURU',
        body: parsed.body || parsed.description || payload.body,
        icon: parsed.icon || '/icon-192.png',
        badge: parsed.badge || '/icon-192.png',
        tag: parsed.tag || parsed.idempotencyKey || 'bseb-guru-' + Date.now(),
        url: parsed.url || parsed.targetUrl || '/'
      };
    } catch (e) {
      const text = event.data.text();
      if (text) {
        payload.body = text;
      }
    }
  }

  const options = {
    body: payload.body,
    icon: payload.icon,
    badge: payload.badge,
    tag: payload.tag,
    renotify: true,
    vibrate: [200, 100, 200],
    data: {
      url: payload.url || '/',
      actionType: payload.actionType || 'none',
      subjectId: payload.subjectId || null,
      chapterNo: payload.chapterNo || null,
      videoId: payload.videoId || null,
      ...(payload.data || {})
    },
    actions: [
      { action: 'open', title: '📖 अभी खोलें' },
      { action: 'close', title: 'बंद करें' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(payload.title, options)
  );
});

// ============================================================================
// DEEP-LINK NAVIGATION ON NOTIFICATION CLICK
// ============================================================================
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const notifData = event.notification.data || {};
  const rawTargetUrl = notifData.url || '/';
  const targetUrl = new URL(rawTargetUrl, self.location.origin).href;

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if BSEB GURU is already open in a tab/PWA window
      for (const client of windowClients) {
        if (client.url.startsWith(self.location.origin) && 'focus' in client) {
          client.postMessage({
            type: 'BSEB_NOTIFICATION_CLICK',
            url: rawTargetUrl,
            data: notifData
          });
          return client.focus();
        }
      }
      // Otherwise open a new window to the deep-link URL
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
