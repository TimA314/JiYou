// sw.ts
declare const self: ServiceWorkerGlobalScope;

import { precacheAndRoute } from 'workbox-precaching';

// Precache all assets in the build directory
// These assets are listed in the "start_url" property of the manifest
precacheAndRoute(self.__WB_MANIFEST);

// Offline Google Analytics
// import { initialize } from 'workbox-google-analytics';
// initialize();

// ... additional service worker code ...

