/* ===============================
   LITERATUR ISLAM PWA — FINAL SW
================================ */

const CACHE_NAME = "literatur-islam-v3";

/* ===============================
   FILE YANG WAJIB ADA OFFLINE
================================ */
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
================================ */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    })
  );
  self.skipWaiting();
});

/* ===============================
   ACTIVATE
================================ */
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

/* ===============================
   FETCH — CACHE FIRST
================================ */
self.addEventListener("fetch", (event) => {

  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(async (cached) => {

      if (cached) return cached;

      const response = await fetch(event.request);

      // 🔥 INI PENTING
      if (!response || response.status !== 200 || response.type !== "basic") {
        return response;
      }

      const cache = await caches.open(CACHE_NAME);
      cache.put(event.request, response.clone());

      return response;
    })
  );

});
