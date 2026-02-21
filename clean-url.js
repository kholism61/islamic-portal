// ===============================
// CLEAN URL UNIVERSAL (SAFE)
// ===============================

(function () {

  // Jangan jalan kalau buka via file://
  if (location.protocol === "file:") return;

  let path = location.pathname;
  const query = location.search || "";
  const hash = location.hash || "";

  let changed = false;

  // 1️⃣ Hapus index.html
  if (path.endsWith("index.html")) {
    path = path.replace("index.html", "");
    changed = true;
  }

  // 2️⃣ Hapus .html lain
  else if (path.endsWith(".html")) {
    path = path.slice(0, -5);
    changed = true;
  }

  // 3️⃣ Hapus trailing slash (kecuali root)
  if (path.length > 1 && path.endsWith("/")) {
    path = path.slice(0, -1);
    changed = true;
  }

  if (changed) {
    history.replaceState(null, "", path + query + hash);
  }

})();