// =====================
// BOOKMARK PAGE — FINAL CLEAN
// =====================
import { articlesData } from "./data.js";
document.addEventListener("DOMContentLoaded", () => {
  const listEl = document.getElementById("bookmark-list");
  const emptyEl = document.getElementById("bookmark-empty");
  const notFoundEl = document.getElementById("bookmarkNotFound");
  const searchInput = document.getElementById("bookmarkSearch");
  const exportPdfBtn = document.getElementById("exportPdfBtn");
  const exportWordBtn = document.getElementById("exportWordBtn");
  const clearBtn = document.getElementById("clearBookmarks");
 const sortSelect = document.getElementById("bookmarkSort");
const filterSelect = document.getElementById("bookmarkFilter");
const continueEl = document.getElementById("continue-reading");
const toast = document.getElementById("toast");

  if (!listEl || !emptyEl) return;

  // =====================
  // HELPER
  // =====================
  function renderContinueReading() {
  if (!continueEl) return;

  const reading = JSON.parse(localStorage.getItem("readingProgress")) || {};
  const ids = Object.keys(reading).filter(id => reading[id] > 0);

  if (ids.length === 0) {
    continueEl.style.display = "none";
    return;
  }

  continueEl.style.display = "block";
  continueEl.innerHTML = `<h2>📖 Lanjut Membaca</h2>`;

  ids.forEach(id => {
    const article = articlesData?.[id];
    if (!article) return;

    const percent = reading[id] || 0;

    const item = document.createElement("div");
    item.className = "continue-item";
    item.innerHTML = `
      <a href="article.html?id=${id}">
        ${article.judul}
      </a>

      <div class="reading-bar">
        <div class="reading-fill" style="width:${percent}%"></div>
      </div>
      <span class="reading-percent">
        ${percent === 100 ? "✔ Selesai dibaca" : percent + "% dibaca"}
      </span>
    `;

    continueEl.appendChild(item);
  });
}

  function showToast(msg, time = 2000) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove("show"), time);
  }

  function stripHtml(html) {
    const d = document.createElement("div");
    d.innerHTML = html;
    return d.textContent || "";
  }

  function getBookmarks() {
    return JSON.parse(localStorage.getItem("bookmarks")) || [];
  }

  function setBookmarks(arr) {
    localStorage.setItem("bookmarks", JSON.stringify(arr));
  }

  function removeReadingProgress(id) {
  const data = JSON.parse(localStorage.getItem("readingProgress")) || {};
  delete data[id];
  localStorage.setItem("readingProgress", JSON.stringify(data));
}

  function updateStats() {
  const oldStats = document.getElementById("bookmarkStats");
  const bookmarkEl = document.getElementById("stat-bookmark-count");
  const readingEl = document.getElementById("stat-reading-count");

  const totalBookmarks = getBookmarks().length;

  const reading =
    JSON.parse(localStorage.getItem("readingProgress")) || {};
  const readingCount = Object.keys(reading).filter(
    id => reading[id] > 0 && reading[id] < 100
  ).length;

  // sistem lama
  if (oldStats) {
    oldStats.textContent = `⭐ ${totalBookmarks} artikel tersimpan`;
  }

  // sistem baru
  if (bookmarkEl) bookmarkEl.textContent = totalBookmarks;
  if (readingEl) readingEl.textContent = readingCount;

  // reading streak
const streakData =
  JSON.parse(localStorage.getItem("readingStreak")) || {
    streak: 0
  };

const streakEl = document.getElementById("stat-streak");
if (streakEl) {
  streakEl.textContent = streakData.streak || 0;

  // ===============================
// DAILY GOAL
// ===============================
const goalTarget = 1; // target artikel per hari

const todayKey = new Date().toLocaleDateString("sv-SE");
const history =
  JSON.parse(localStorage.getItem("readingHistory")) || {};

const todayCount = history[todayKey] || 0;

const goalStatus = document.getElementById("goal-status");
const goalProgress = document.getElementById("goal-progress");

if (goalStatus && goalProgress) {
  goalStatus.textContent = `${todayCount} / ${goalTarget} artikel`;

  const percent = Math.min(
    100,
    (todayCount / goalTarget) * 100
  );

  goalProgress.style.width = percent + "%";

  // ===============================
// ACHIEVEMENT
// ===============================
const totalRead =
  JSON.parse(localStorage.getItem("totalArticlesRead")) || 0;

let achievement = "Pemula";

if (totalRead >= 25) {
  achievement = "🏆 Ulama Digital";
} else if (totalRead >= 10) {
  achievement = "🧠 Pembaca Aktif";
} else if (totalRead >= 3) {
  achievement = "📖 Pembaca Pemula";
}

const achievementEl =
  document.getElementById("achievement-label");

if (achievementEl) {
  achievementEl.textContent = achievement;
}
}
}
}


 function populateCategories() {
  if (!filterSelect) return;

  const saved = getBookmarks();
  const categories = new Set();

  saved.forEach(id => {
    const a = articlesData?.[id];
    if (a) categories.add(a.kategori);
  });

  filterSelect.innerHTML = `<option value="all">Semua Kategori</option>`;

  categories.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    filterSelect.appendChild(opt);
  });
}



  // =====================
  // RENDER BOOKMARK
  // =====================
  function renderBookmarks() {
  let saved = getBookmarks();
const sort = sortSelect?.value || "newest";
const filter = filterSelect?.value || "all";

saved = saved
  .map(id => ({ id, article: articlesData?.[id] }))
  .filter(x => x.article)
  .filter(x => filter === "all" || x.article.kategori === filter);

if (sort === "az") {
  saved.sort((a, b) => a.article.judul.localeCompare(b.article.judul));
} else if (sort === "oldest") {
  saved.reverse();
}

  listEl.innerHTML = "";

updateStats(); // ← TAMBAHKAN DI SINI

if (saved.length === 0) {
  emptyEl.style.display = "block";
  notFoundEl && (notFoundEl.style.display = "none");
  return;
}

    emptyEl.style.display = "none";

    saved.forEach(obj => {
  const id = obj.id;
  const article = obj.article;
  if (!article) return;

  const item = document.createElement("div");
  item.className = "bookmark-card";
  item.dataset.id = id;

  const thumb = article.thumbnail || "assets/images/default.jpg";
  const reading = JSON.parse(localStorage.getItem("readingProgress")) || {};
const percent = reading[id] || 0;

  item.innerHTML = `
  <img src="${thumb}" class="bookmark-thumb" alt="${article.judul}">
  
  <div class="bookmark-body">
    <span class="bookmark-category">${article.kategori}</span>
    <h3>${article.judul}</h3>
    <p>${stripHtml(article.isi).slice(0, 100)}...</p>

    <div class="reading-bar">
      <div class="reading-fill" style="width:${percent}%"></div>
    </div>
    <span class="reading-percent">${percent}% dibaca</span>

    <div class="bookmark-actions">
      <a href="article.html?id=${id}" class="read-btn">📖 Baca</a>
      <button class="remove-icon" data-id="${id}" title="Hapus">✕</button>
    </div>
  </div>
`;

  listEl.appendChild(item);
});

}

  // =====================
  // REMOVE BOOKMARK
  // =====================
  listEl.addEventListener("click", e => {
  if (!e.target.classList.contains("remove-icon")) return;

  const id = e.target.dataset.id;
  let saved = getBookmarks().filter(x => x !== id);

  setBookmarks(saved);

  // hapus juga progress bacanya
  removeReadingProgress(id);

  showToast("❌ Bookmark dihapus");
  renderBookmarks();
});

  // =====================
  // SEARCH BOOKMARK
  // =====================
  function runSearch() {
    if (!searchInput) return;

    const keyword = searchInput.value.toLowerCase().trim();
    let found = 0;

    listEl.querySelectorAll(".bookmark-card").forEach(item => {
      const match = item.innerText.toLowerCase().includes(keyword);
      item.style.display = match ? "block" : "none";
      if (match) found++;
    });

    if (notFoundEl) {
      notFoundEl.style.display = found === 0 ? "block" : "none";
    }

    return found;
  }

  searchInput?.addEventListener("input", runSearch);

  searchInput?.addEventListener("keydown", e => {
    if (e.key !== "Enter") return;
    e.preventDefault();

    const found = runSearch();
    if (found > 0) {
      listEl.querySelector(".bookmark-card[style*='block']")
        ?.scrollIntoView({ behavior: "smooth" });
    } else {
      notFoundEl?.scrollIntoView({ behavior: "smooth" });
    }
  });

  // =====================
// SORT & FILTER
// =====================
sortSelect?.addEventListener("change", renderBookmarks);
filterSelect?.addEventListener("change", renderBookmarks);

  // =====================
  // EXPORT PDF
  // =====================
  exportPdfBtn?.addEventListener("click", () => {
  const saved = getBookmarks();

  if (saved.length === 0) {
    showToast("⚠️ Tidak ada bookmark");
    return;
  }

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({
    unit: "pt",
    format: "a4"
  });

  let y = 60;

  doc.setFont("Times", "Bold");
  doc.setFontSize(18);
  doc.text("Daftar Artikel Bookmark", 40, y);

  y += 40;

  saved.forEach((id, index) => {
    const article = articlesData[id];
    if (!article) return;

   // JUDUL (AUTO WRAP LEBAR HALAMAN)
const pageWidth = doc.internal.pageSize.getWidth();
const margin = 40;
const usableWidth = pageWidth - margin * 2;

const title = `${index + 1}. ${article.judul}`;
const titleLines = doc.splitTextToSize(title, usableWidth);

doc.setFont("Times", "Bold");
doc.setFontSize(14);
doc.text(titleLines, margin, y);

y += titleLines.length * 12 + 12;

    // META
    doc.setFont("Times", "Normal");
    doc.setFontSize(10);
    doc.text(`${article.penulis} — ${article.tanggal}`, 40, y);

    y += 18;

   // ===== AMBIL & BERSIHKAN HTML =====
let html = article.isi;

// buat elemen sementara
const temp = document.createElement("div");
temp.innerHTML = html;

// HAPUS SEMUA BAGIAN REFERENSI
const refs = temp.querySelectorAll(".reference, .footnote, sup");
refs.forEach(el => el.remove());

// ambil text bersih
let text = temp.innerText;

// POTONG BAGIAN REFERENSI JIKA ADA KATA KUNCI
text = text.split("Referensi")[0];
text = text.split("Daftar Pustaka")[0];

// rapikan simbol & spasi
text = text
  .replace(/[“”]/g, '"')
  .replace(/[‘’]/g, "'")
  .replace(/[–—]/g, "-")
  .replace(/[^\x00-\x7F\u0600-\u06FF\n\r.,;:()\-'" ]/g, "") // buang karakter aneh
  .replace(/\n{3,}/g, "\n\n")
  .trim();


    // SPLIT TEXT
    doc.setFont("Times", "Normal");
    doc.setFontSize(12);

    const lines = doc.splitTextToSize(text, 500);

    lines.forEach(line => {
      if (y > 760) {
        doc.addPage();
        y = 60;
      }

      // deteksi teks arab
      const isArabic = /[\u0600-\u06FF]/.test(line);

      if (isArabic) {
        doc.text(line, 555, y, { align: "right" });
      } else {
        doc.text(line, 40, y);
      }

      y += 16;
    });

    y += 30;

    if (y > 720) {
      doc.addPage();
      y = 60;
    }
  });

  doc.save("bookmark-artikel.pdf");
});

  // =====================
  // EXPORT WORD
  // =====================
  if (exportWordBtn) {
  exportWordBtn.addEventListener("click", () => {
    const saved = getBookmarks();

    if (saved.length === 0) {
      showToast("⚠️ Tidak ada bookmark");
      return;
    }

    let content = `<h1>Artikel Bookmark</h1>`;

    saved.forEach(id => {
      const article = articlesData[id];
      if (!article) return;

      content += `
        <h2>${article.judul}</h2>
        <p><strong>Kategori:</strong> ${article.kategori}</p>
        <p><strong>Tanggal:</strong> ${article.tanggal}</p>
        <hr>
        ${article.isi}
        <br><br><hr><br>
      `;
    });

    const blob = new Blob(
      ["\ufeff", content],
      { type: "application/msword" }
    );

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "artikel-bookmark.doc";
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
}

  // =====================
  // CLEAR ALL
  // =====================
  clearBtn?.addEventListener("click", () => {
  if (confirm("Yakin hapus semua bookmark?")) {
    localStorage.removeItem("bookmarks");
    localStorage.removeItem("readingProgress"); // ← tambahkan ini
    renderBookmarks();
    renderContinueReading(); // ← biar langsung hilang dari tampilan
    showToast("🗑️ Semua bookmark dihapus");
  }
});

  // =====================
  // INIT
  // =====================
  populateCategories();
renderBookmarks();
renderContinueReading();

// =====================
// AUTO UPDATE PROGRESS
// =====================
window.addEventListener("focus", () => {
  renderBookmarks();
  renderContinueReading();
});

// kalau progress berubah dari tab lain / halaman artikel
window.addEventListener("storage", (e) => {
  if (e.key === "readingProgress") {
    renderBookmarks();
    renderContinueReading();
  }
});
});