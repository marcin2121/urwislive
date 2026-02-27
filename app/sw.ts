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