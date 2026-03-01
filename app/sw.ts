/// <reference lib="webworker" />
import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, ExpirationPlugin, NetworkOnly } from "serwist";
import { BackgroundSyncPlugin } from "@serwist/background-sync";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

// 🚀 KONFIGURACJA KOLEJKI OFFLINE (PUNKTY)
const bgSyncPlugin = new BackgroundSyncPlugin("urwis-sync-queue", {
  maxRetentionTime: 24 * 60, // Próbuj wysłać przez 24 godziny
});

// 🚀 KONFIGURACJA KOLEJKI OFFLINE (KUPONY)
const couponSyncPlugin = new BackgroundSyncPlugin("coupon-claims-queue", {
  maxRetentionTime: 24 * 60, // Próbuj przez 24h
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  
  fallbacks: {
    entries: [
      {
        url: "/offline",
        matcher({ request }) {
          return request.destination === "document";
        },
      },
    ],
  },

  runtimeCaching: [
    // 1. Synchronizacja punktów gry (Background Sync)
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/urwis/sync"),
      handler: new NetworkOnly({
        plugins: [bgSyncPlugin],
      }),
      method: "POST",
    },
    // 2. Bezpieczna synchronizacja kuponów (Background Sync)
    {
      matcher: ({ url }) => url.pathname.startsWith("/api/coupons/claim"),
      handler: new NetworkOnly({
        plugins: [couponSyncPlugin],
      }),
      method: "POST",
    },
    // 3. Dźwięki i efekty SFX (Cache First)
    {
      matcher: /\.(?:mp3|wav|ogg)$/i,
      handler: new CacheFirst({
        cacheName: "urwis-audio-sfx",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // 4. Modele 3D (Cache First)
    {
      matcher: /\.(?:glb|gltf)$/i,
      handler: new CacheFirst({
        cacheName: "urwis-3d-models",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 5,
            maxAgeSeconds: 30 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // 5. Zdjęcia z Supabase (Cache First)
    {
      matcher: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/i,
      handler: new CacheFirst({
        cacheName: "supabase-images",
        plugins: [
          new ExpirationPlugin({
            maxEntries: 150,
            maxAgeSeconds: 7 * 24 * 60 * 60,
          }),
        ],
      }),
    },
    // Domyślny cache Next.js
    ...defaultCache,
  ],
});

serwist.addEventListeners();

// ---- PUSH NOTIFICATION ----
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let data: any;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('[SW] Błąd parsowania push payload:', e);
    return;
  }

  const options: NotificationOptions & Record<string, unknown> = {
    body: data.body || '',
    icon: data.icon || '/android-chrome-192x192.png',
    badge: data.badge || '/android-chrome-192x192.png',
    image: data.image || undefined,
    data: data.data || {},
    vibrate: [200, 100, 200],
    tag: data.tag || 'urwis-notification',
    renotify: true,
    requireInteraction: false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Sklep Urwis', options)
  );
});

// ---- KLIKNIĘCIE W POWIADOMIENIE ----
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data as any)?.url || '/';
  const fullUrl = new URL(targetUrl, self.location.origin).href;

  // Tracking kliknięcia (fire & forget)
  fetch('/api/push/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'click', url: targetUrl }),
  }).catch(() => {});

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Jeśli jest już otwarta karta z naszą stroną — focus na nią
      for (const client of windowClients) {
        if (client.url === fullUrl && 'focus' in client) {
          return (client as WindowClient).focus();
        }
      }
      // Jeśli jest jakakolwiek otwarta karta — nawiguj ją
      for (const client of windowClients) {
        if ('navigate' in client && 'focus' in client) {
          return (client as WindowClient).navigate(fullUrl).then((c) => c?.focus());
        }
      }
      // Jeśli nie ma otwartej karty — otwórz nową
      return self.clients.openWindow(fullUrl);
    })
  );
});