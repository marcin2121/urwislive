/// <reference lib="webworker" />
import { defaultCache } from "@serwist/turbopack/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, CacheFirst, ExpirationPlugin, NetworkOnly } from "serwist";
import { BackgroundSyncPlugin } from "@serwist/background-sync";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

// NOTE: We don't need to re-declare self if we have the reference lib webworker,
// but for standard TS in Next.js it helps to be explicit or use 'as any' ONLY at the boundary.
// Given user request to use declare const self: ServiceWorkerGlobalScope;
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
        url: "/~offline",
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
    // Domyślny cache Serwist dla Turbopack
    ...defaultCache,
  ],
});

serwist.addEventListeners();

// Obsługa Push Notifications
self.addEventListener('push', (event) => {
  // Sprawdź czy przeglądarka wspiera powiadomienia (Service Worker standard)
  if (!('registration' in self) || !('showNotification' in self.registration)) {
    return;
  }

  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || 'Sklep Urwis';
    
    // Używamy casting do any jedynie przy tworzeniu opcji, 
    // aby uniknąć problemu z brakującymi polami typa w domyślnym TS (np. image we wcześniejszych wersjach)
    const options: NotificationOptions & Record<string, any> = {
      body: data.body || 'Masz nową wiadomość!',
      icon: data.icon || '/android-chrome-192x192.png',
      badge: data.badge || '/favicon-16x16.png',
      image: data.image || undefined,
      vibrate: [100, 50, 100],
      tag: data.tag || 'urwis-notification',
      renotify: true,
      data: {
        url: data.url || (data.data?.url) || '/'
      }
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error('[SW] Błąd parsowania push payload:', error);
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = (event.notification.data as { url?: string })?.url || '/';
  const fullUrl = new URL(targetUrl, self.location.origin).href;

  // Tracking kliknięcia
  event.waitUntil(
    fetch('/api/push/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'click', url: targetUrl }),
    }).catch(err => console.error('[SW] Błąd trackingu kliknięcia:', err))
  );

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === fullUrl && 'focus' in client) {
          return (client as WindowClient).focus();
        }
      }
      if (clientList.length > 0) {
        const anyClient = clientList[0] as WindowClient;
        if ('navigate' in anyClient) {
            return anyClient.navigate(fullUrl).then((c) => c?.focus());
        }
      }
      return self.clients.openWindow(fullUrl);
    })
  );
});
