const CACHE_NAME = "islamic-portal-v1";

const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/offline.html",
  "/css/style.css",
  "/js/data.js",
  "/js/article.js",
  "/js/bookmark.js",
  "/js/prayer.js",
  "/js/translate.js",
  "/assets/images/logo.png"
];

/* ================= INSTALL ================= */
self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
});

/* ================= ACTIVATE ================= */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

/* ================= FETCH ================= */
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") return;

  const request = event.request;

  // 🔥 HTML → NETWORK FIRST
  if (request.headers.get("accept")?.includes("text/html")) {

    event.respondWith(
      fetch(request)
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, copy));
          return response;
        })
        .catch(() => caches.match(request).then(res => res || caches.match("/offline.html")))
    );

    return;
  }

  // 🔥 CSS / JS / IMG → STALE WHILE REVALIDATE
  event.respondWith(
    caches.match(request).then(cached => {

      const fetchPromise = fetch(request).then(response => {
        if (response && response.status === 200) {
          caches.open(CACHE_NAME).then(cache => cache.put(request, response.clone()));
        }
        return response;
      }).catch(() => cached);

      return cached || fetchPromise;
    })
  );

});
