const CACHE_VERSION = "hiit-shell-v6";
const APP_SHELL = [
  "",
  "src/index.html",
  "src/styles.css",
  "src/app.js",
  "src/core/format.js",
  "src/core/stateMachine.js",
  "src/core/timerEngine.js",
  "src/core/audio.js",
  "src/core/haptics.js",
  "src/core/storage.js",
  "src/ui/ringTimer.js",
  "src/ui/roundBlocks.js",
  "src/ui/timerView.js",
  "src/ui/settingsView.js",
  "public/manifest.webmanifest",
  "public/icon-192.png",
  "public/icon-512.png"
];

self.addEventListener("install", (event) => {
  const scopeUrl = new URL(self.registration.scope);
  const absoluteShellUrls = APP_SHELL.map((path) => new URL(path, scopeUrl).toString());
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(absoluteShellUrls))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_VERSION)
          .map((staleKey) => caches.delete(staleKey))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const scopeUrl = new URL(self.registration.scope);
  const fallbackUrl = new URL("src/index.html", scopeUrl).toString();
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          const url = new URL(event.request.url);
          if (url.origin === self.location.origin) {
            const responseCopy = networkResponse.clone();
            caches.open(CACHE_VERSION).then((cache) => {
              cache.put(event.request, responseCopy);
            });
          }
          return networkResponse;
        })
        .catch(() => caches.match(fallbackUrl));
    })
  );
});
