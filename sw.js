/* ======================================
   LITERATUR ISLAM — PRODUCTION SW
====================================== */

const CACHE_VERSION = "v4";
const CACHE_NAME = `literatur-islam-${CACHE_VERSION}`;

const PRECACHE_ASSETS = [
  "/",
  "/index.html",
  "/about.html",
  "/faq.html",
  "/kontak.html",
  "/donasi.html",
  "/bookmark.html",
  "/offline.html",
  "/privacy.html",
  "/disclaimer.html",

  "/css/style.css",

  "/js/data.js",
  "/js/article.js",
  "/js/bookmark.js",
  "/js/prayer.js",

  "/assets/images/logo.png"
];


/* ===============================
   INSTALL
=============================== */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});


/* ===============================
   ACTIVATE
=============================== */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();

      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );

      await self.clients.claim();
    })()
  );
});


/* ===============================
   FETCH HANDLER
=============================== */
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") return;

  // 🔥 Jangan ganggu Range request (audio/video)
  if (event.request.headers.get("range")) return;

  event.respondWith(
    (async () => {

      const cached = await caches.match(event.request);
      if (cached) return cached;

      try {
        const response = await fetch(event.request);

        // Cache hanya response valid
        if (
          response &&
          response.status === 200 &&
          response.type === "basic"
        ) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(event.request, response.clone());
        }

        return response;

      } catch (error) {

        // Fallback kalau offline
        if (event.request.mode === "navigate") {
          return caches.match("/offline.html");
        }

        return new Response("Offline", { status: 503 });
      }

    })()
  );

});