const CACHE_NAME = "Literatur Islam-pwa-v4";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./about.html",
  "./faq.html",
  "./kontak.html",
  "./donasi.html",
  "./bookmark.html",
  "./offline.html",

  "./css/style.css",

  "./js/data.js",
  "./js/article.js",
  "./js/bookmark.js",
  "./js/prayer.js",

  "./assets/images/logo.png"
];

// INSTALL
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ACTIVATE
self.addEventListener("activate", event => {
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

// FETCH
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      return (
        cached ||
        fetch(event.request).catch(() =>
          caches.match("./index.html")
        )
      );
    })
  );
});