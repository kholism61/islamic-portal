/* ======================================
   LITERATUR ISLAM — PRODUCTION SW
====================================== */

const CACHE_VERSION = "v5";
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

  // 🚫 JANGAN cache request dengan Range header
  if (event.request.headers.get("range")) return;

  event.respondWith(
    caches.match(event.request).then(async (cached) => {

      if (cached) return cached;

      try {
        const response = await fetch(event.request);

        // 🚫 Jangan cache kalau bukan 200
        if (!response || response.status !== 200 || response.type !== "basic") {
          return response;
        }

        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());

        return response;

      } catch (error) {

        // fallback offline untuk halaman
        if (event.request.destination === "document") {
          return caches.match("/offline.html");
        }

      }
    })
  );
});

