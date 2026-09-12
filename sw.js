const CACHE = "fitness-ultime-v17-navigation-history-20260913-1";
const ROOT = [
  "./",
  "./index.html",
  "./app.css",
  "./data.js",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./assets/hero-program-official.png",
  "./assets/hero-today-official.png",
  "./assets/hero-progress-official.png",
  "./assets/hero-history-official.png",
  "./assets/today-waiting-gym-official.png",
  "./assets/card-g1-official.png",
  "./assets/card-g2-official.png",
  "./assets/card-g3-official.png",
  "./assets/card-ath-official.png",
  "./assets/card-fm-official.png"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ROOT)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request).then(response => {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(() => caches.match(event.request).then(hit => hit || caches.match("./index.html")))
  );
});
