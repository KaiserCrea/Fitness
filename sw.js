const CACHE = "fitness-v24-25-1-card-safety-20260921-1";
const IMAGE_CACHE = "fitness-static-images-v24185";
const ROOT = [
  "./sheet-layouts.js",
  "./thumbnail-map.js",
  "./miniatures/G1A/05_curl_biceps_barre_EZ_debout_v24251.png",
  "./assets/card-g1-v22.jpg",
  "./assets/card-g1-v22.png",
  "./assets/card-g2-v22.jpg",
  "./assets/card-g2-v22.png",
  "./assets/hero-today-v20.jpg",
  "./assets/hero-progress-v20.jpg",
  "./assets/hero-history-v20.jpg",
  "./assets/today-waiting-v20.jpg",
  "./",
  "./index.html",
  "./app.css",
  "./data.js",
  "./app.js",
  "./assets/guide/mensurations.jpg",
  "./fiches/FM1/FM1_EX01_Developpe incline avec halteres_VALIDE.jpg",
  "./miniatures/FM4/01_developpe_incline_halteres.jpg",
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
  "./assets/card-g3-official.png",
  "./assets/card-ath-official.jpg",
  "./assets/card-fm-official.jpg"
];
self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ROOT)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys=await caches.keys(),imageCache=await caches.open(IMAGE_CACHE);
    // Migrate only the previously cached JPEG thumbnails/guide assets, never entire old releases.
    for(const key of keys.filter(k=>k!==CACHE&&k!==IMAGE_CACHE&&/^fitness-v24-(?:18|19|20|21|22|23|24)-/.test(k))){
      const cache=await caches.open(key);
      for(const request of await cache.keys()){
        const url=new URL(request.url);
        if(/\/(?:miniatures|assets\/guide)\/.*\.jpe?g$/i.test(url.pathname)){
          const existing=await imageCache.match(request);
          if(!existing){const response=await cache.match(request);if(response){try{await imageCache.put(request,response);}catch(error){console.warn("Cache image non copié ; téléchargement à la demande",error);}}}
        }
      }
    }
    await Promise.all(keys.filter(k=>k!==CACHE&&k!==IMAGE_CACHE&&/^fitness-v24-(?:18|19|20|21|22|23|24)-/.test(k)).map(k=>caches.delete(k)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  // Large static images are immutable in this release: reuse the cached copy
  // immediately on subsequent visits instead of waiting for the network.
  if (/\/(?:miniatures|fiches|assets\/guide)\//.test(url.pathname)) {
    event.respondWith(caches.match(event.request).then(hit => hit || fetch(event.request).then(response => {
      if (response.ok) { const copy=response.clone(); caches.open(IMAGE_CACHE).then(cache=>cache.put(event.request,copy)).catch(()=>{}); }
      return response;
    }).catch(()=>Response.error())));
    return;
  }
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
