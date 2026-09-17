const CACHE = "fitness-v24-18-build-20260917-7";
const ROOT = [
  "./sheet-layouts.js",
  "./thumbnail-map.js",
  "./assets/card-g1-v22.jpg",
  "./assets/card-g2-v22.jpg",
  "./assets/hero-today-v20.jpg",
  "./assets/hero-progress-v20.jpg",
  "./assets/hero-history-v20.jpg",
  "./assets/today-waiting-v20.jpg",
  "./",
  "./index.html",
  "./app.css",
  "./data.js",
  "./app.js",
  "./manifest.webmanifest",
  "./icon-192-v241.png",
  "./icon-512-v241.png",
  "./assets/hero-program-v2412.jpg",
  "./assets/hero-program-official.jpg",
  "./assets/hero-today-official.jpg",
  "./assets/hero-progress-official.jpg",
  "./assets/hero-history-official.jpg",
  "./assets/today-waiting-gym-official.jpg",
  "./assets/card-g1-official.jpg",
  "./assets/card-g2-official.jpg",
  "./assets/card-g3-official.jpg",
  "./assets/card-ath-official.jpg",
  "./assets/card-fm-official.jpg"
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
    }).catch(async () => {
      const hit = await caches.match(event.request);
      if(hit) return hit;
      // Only navigation requests may receive the HTML app shell. Never serve HTML as JS, CSS or an image.
      if(event.request.mode === "navigate") return caches.match("./index.html");
      return Response.error();
    })
  );
});
