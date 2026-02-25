const container = document.getElementById("offline-list");
const searchInput = document.getElementById("offline-search");
const sortSelect = document.getElementById("sort-select");

let activeFilter = "all";

let offlineData =
  JSON.parse(localStorage.getItem("offlineArticles")) || {};

function getProgressData() {
  return JSON.parse(localStorage.getItem("readingProgress")) || {};
}

function renderOfflineList(filterText = "") {
  container.innerHTML = "";

  const progressData = getProgressData();

  let ids = Object.keys(offlineData);

  // filter search
  ids = ids.filter(id => {
    const title = offlineData[id].judul.toLowerCase();
    return title.includes(filterText.toLowerCase());
  });

  // filter status
  ids = ids.filter(id => {
    const progress = progressData[id] || 0;

    if (activeFilter === "new") return progress === 0;
    if (activeFilter === "reading") return progress > 0 && progress < 100;
    if (activeFilter === "done") return progress >= 100;

    return true;
  });

  // sorting
  if (sortSelect.value === "progress") {
    ids.sort((a, b) => {
      const pa = progressData[a] || 0;
      const pb = progressData[b] || 0;
      return pb - pa;
    });
  }

  if (sortSelect.value === "title") {
    ids.sort((a, b) =>
      offlineData[a].judul.localeCompare(offlineData[b].judul)
    );
  }

  if (ids.length === 0) {
    container.innerHTML = "<p>Tidak ada artikel ditemukan.</p>";
    return;
  }

  ids.forEach(id => {
    const article = offlineData[id];
    const progress = progressData[id] || 0;

    const card = document.createElement("div");
card.className = "offline-card";

card.innerHTML = `
  ${article.thumbnail ? `<img src="${article.thumbnail}" class="offline-thumb">` : ""}

  <h3>${article.judul}</h3>
  <p>${article.kategori || ""}</p>

  <div class="offline-progress-bar">
    <div class="offline-progress-fill" style="width:${progress}%"></div>
  </div>
  <p class="offline-progress-text">${progress}% selesai</p>

  <div class="offline-actions">
    <a href="article.html?id=${id}" class="btn-premium">
      Baca Artikel
    </a>

    <button class="delete-btn" data-id="${id}">
      Hapus
    </button>
  </div>
`;

    container.appendChild(card);
  });
}

renderOfflineList();
updateOfflineStats();

function updateOfflineStats() {
  const offline =
    JSON.parse(localStorage.getItem("offlineArticles")) || {};

  const progressData =
    JSON.parse(localStorage.getItem("readingProgress")) || {};

  const ids = Object.keys(offline);

  const countEl = document.getElementById("stat-offline-count");
  const progressEl = document.getElementById("stat-offline-progress");

  if (!countEl || !progressEl) return;

  if (ids.length === 0) {
    countEl.textContent = "0";
    progressEl.textContent = "0%";
    return;
  }

  let total = 0;

  ids.forEach(id => {
    total += progressData[id] || 0;
  });

  const avg = Math.round(total / ids.length);

  countEl.textContent = ids.length;
  progressEl.textContent = avg + "%";
}

/* =========================
   EVENTS
========================= */

if (searchInput) {
  searchInput.addEventListener("input", e => {
    renderOfflineList(e.target.value);
  });
}

if (sortSelect) {
  sortSelect.addEventListener("change", () => {
    renderOfflineList(searchInput.value);
  });
}

/* filter buttons */
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".filter-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    activeFilter = btn.dataset.filter;

    renderOfflineList(searchInput.value);
  });
});

/* hapus satu artikel */
document.addEventListener("click", e => {
  if (e.target.classList.contains("delete-btn")) {
    const id = e.target.dataset.id;

    delete offlineData[id];

    localStorage.setItem(
      "offlineArticles",
      JSON.stringify(offlineData)
    );

    renderOfflineList(searchInput.value);
  }
});

/* hapus semua */
const deleteAllBtn = document.getElementById("delete-all");

if (deleteAllBtn) {
  deleteAllBtn.addEventListener("click", () => {
    if (!confirm("Hapus semua artikel offline?")) return;

    localStorage.removeItem("offlineArticles");
    offlineData = {};
    renderOfflineList();
  });
}

/* download semua */
const downloadAllBtn = document.getElementById("download-all");

if (downloadAllBtn) {
  downloadAllBtn.addEventListener("click", () => {
    const all = {};
    Object.keys(articlesData).forEach(id => {
      all[id] = articlesData[id];
    });

    localStorage.setItem("offlineArticles", JSON.stringify(all));
    offlineData = all;
    renderOfflineList();
    alert("Semua artikel berhasil diunduh.");
  });
}


// ===============================
// AUTO REFRESH SAAT DATA BERUBAH
// ===============================

// kalau localStorage berubah (tab lain update)
window.addEventListener("storage", (e) => {
  if (e.key === "readingProgress" || e.key === "offlineArticles") {
    offlineData =
      JSON.parse(localStorage.getItem("offlineArticles")) || {};

    renderOfflineList(searchInput?.value || "");
    updateOfflineStats();
  }
});

// kalau user balik ke tab ini
window.addEventListener("focus", () => {
  offlineData =
    JSON.parse(localStorage.getItem("offlineArticles")) || {};

  renderOfflineList(searchInput?.value || "");
  updateOfflineStats();
});