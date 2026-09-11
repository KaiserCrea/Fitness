const CACHE = "fitness-ultime-v8-final-20260911-1";
const ROOT = [
  "./",
  "./index.html",
  "./app.css",
  "./data.js",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./assets/hero-program.jpg",
  "./assets/hero-today.jpg",
  "./assets/hero-progress.jpg",
  "./assets/hero-history.jpg",
  "./assets/card-g1.jpg",
  "./assets/card-g2.jpg",
  "./assets/card-g3.jpg",
  "./assets/card-ath.jpg",
  "./assets/card-fm.jpg"
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
