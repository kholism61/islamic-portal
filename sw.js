const CACHE_NAME = "literatur-islam-pwa-v2";

const FILES_TO_CACHE = [
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

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

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

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});