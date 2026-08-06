/// <reference lib="webworker" />
import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist';
import { Serwist, NetworkFirst, ExpirationPlugin } from 'serwist';

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: ServiceWorkerGlobalScope;

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    ...defaultCache,
    // On peut rajouter des stratégies spécifiques ici
    {
      matcher: ({ request, url }) => {
        // Ne pas cacher les appels API ou l'administration
        if (url.pathname.startsWith('/api') || url.pathname.startsWith('/admin')) {
          return false;
        }
        return request.destination === 'document' || request.destination === 'image';
      },
      handler: new NetworkFirst({
        cacheName: 'app-cache',
        plugins: [
          new ExpirationPlugin({
            maxEntries: 200,
            maxAgeSeconds: 24 * 60 * 60, // 24 heures
          }),
        ],
      }),
    },
  ],
});

serwist.addEventListeners();
