// =====================
// GLOBAL STATE
// =====================
import { articlesData } from "./data.js";
const isHomePage =
  document.getElementById("articles-container") !== null &&
  !new URLSearchParams(window.location.search).get("id");

const isArticlePage =
  document.getElementById("isi-artikel") !== null;

let cards = [];
let activeFilter = "all";

function normalize(text = "") {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

document.addEventListener("DOMContentLoaded", () => {

 // ===============================
// QUICK MENU NAVIGATION
// ===============================
const quickLinks = document.querySelectorAll(".quick-card");

quickLinks.forEach(link => {
  link.addEventListener("click", e => {

    const targetId = link.getAttribute("href");

    // kalau link normal (about.html dll) biarkan jalan
    if (!targetId || !targetId.startsWith("#")) return;

    e.preventDefault();

    const target = document.querySelector(targetId);
    if (!target) return;

    const offset =
      document.querySelector(".navbar")?.offsetHeight || 0;

    const y =
      target.getBoundingClientRect().top +
      window.pageYOffset -
      offset -
      12;

    window.scrollTo({
      top: y,
      behavior: "smooth",
    });

    // AUTO OPEN DONASI
    if (targetId === "#donasi") {
      const donateContent = document.getElementById("donate-content");

      if (donateContent && donateContent.style.display !== "block") {
        donateContent.style.display = "block";
      }
    }
  });
});

// ===============================
// ACTIVE STATE ON SCROLL
// ===============================
const sections = document.querySelectorAll("section[id]");
const quickCards = document.querySelectorAll(".quick-card");

window.addEventListener("scroll", () => {
  let current = "";

  sections.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (scrollY >= sectionTop) {
      current = section.getAttribute("id");
    }
  });

  quickCards.forEach(card => {
    card.classList.remove("active");
    if (card.getAttribute("href") === `#${current}`) {
      card.classList.add("active");
    }
  });
});


 /* =====================
   DARK MODE TOGGLE
===================== */
 const themeBtn = document.getElementById("themeToggle");

if (themeBtn) {
  const savedTheme = localStorage.getItem("theme");

  if (savedTheme === "dark") {
    document.body.classList.add("dark");
    themeBtn.textContent = "☀️";
  }

  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    const isDark = document.body.classList.contains("dark");
    themeBtn.textContent = isDark ? "☀️" : "🌙";
    localStorage.setItem("theme", isDark ? "dark" : "light");
  });
}

  /* =====================
     SIDEBAR TOGGLE
  ===================== */
  const menuBtn = document.getElementById("menuBtn");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("overlay");

  if (menuBtn && sidebar && overlay) {
    menuBtn.addEventListener("click", () => {
      sidebar.classList.add("active");
      overlay.classList.add("active");
    });

    overlay.addEventListener("click", () => {
      sidebar.classList.remove("active");
      overlay.classList.remove("active");
    });
  }

(function sidebarAutoDetect() {
  if (typeof articlesData === "undefined") return;

  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");
  if (!articleId || !articlesData[articleId]) return;

  const article = articlesData[articleId];
  const sub = article.subkategori || article.kategori;
  const cat = article.kategori;


  // ===== AKTIFKAN LINK SUBMENU =====
  const activeLink = document.querySelector(
    `.submenu a[data-filter="${sub}"]`
  );

  if (activeLink) {
    activeLink.classList.add("active");

    const parent = activeLink.closest(".has-children");
    if (parent) {
      parent.classList.add("active");

      // auto scroll sidebar
      setTimeout(() => {
        parent.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }, 150);
    }
  }

  // ===== FALLBACK (KALAU GA ADA SUBKATEGORI) =====
  if (!activeLink) {
    const main = document.querySelector(
      `.sidebar-toggle + .submenu a[data-filter="${cat}"]`
    );
    if (main) {
      main.classList.add("active");
      const parent = main.closest(".has-children");
      parent?.classList.add("active");
    }
  }
})();


// TOGGLE SUBMENU
document.querySelectorAll(".sidebar-toggle").forEach(btn => {
  btn.addEventListener("click", () => {
    const parent = btn.closest(".has-children");

    document.querySelectorAll(".has-children").forEach(item => {
      if (item !== parent) item.classList.remove("active");
    });

    parent.classList.toggle("active");

    // auto scroll ke item
    parent.scrollIntoView({
      behavior: "smooth",
      block: "start"
    });
  });
});



/* =====================
   SEARCH ARTIKEL (ENHANCED)
===================== */
const searchInput = document.getElementById("searchInput");
const emptyState = document.getElementById("empty-state");

function runSearch() {
  const keyword = searchInput.value.toLowerCase().trim();
  let visibleCount = 0;

  cards.forEach(card => {
    const title = card.querySelector("h3")?.innerText.toLowerCase() || "";
    const match = title.includes(keyword);

    card.style.display = match ? "block" : "none";
    if (match) visibleCount++;
  });

  // empty state
  if (emptyState) {
    emptyState.style.display = visibleCount === 0 ? "block" : "none";
  }

  return visibleCount;
}

if (searchInput) {
  // realtime search
  searchInput.addEventListener("input", () => {
    runSearch();
  });

  // tekan ENTER
  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();

      const resultCount = runSearch();

      if (resultCount > 0) {
        // scroll ke hasil
        document
          .getElementById("articles-container")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else {
        // scroll ke not found
        emptyState?.scrollIntoView({
          behavior: "smooth",
          block: "center"
        });
      }
    }
  });
}


  /* =====================
   AUTO-GENERATE HOME ARTICLES (FINAL – AMAN)
===================== */

const articlesContainer = document.getElementById("articles-container");

if (articlesContainer && typeof articlesData !== "undefined") {

  articlesContainer.innerHTML = ""; // hapus skeleton SAJA SEKALI

  // 🔒 urutkan artikel (terbaru dulu)
 const articleKeys = Object.keys(articlesData).sort((a, b) => {
  const A = articlesData[a];
  const B = articlesData[b];

  if (A.featured && !B.featured) return -1;
  if (!A.featured && B.featured) return 1;

  return new Date(B.createdAt) - new Date(A.createdAt);
});

  articleKeys.forEach((id) => {
    const article = articlesData[id];

    // ✅ CARD DIBUAT SEKALI
    const card = document.createElement("article");
    card.className = "card";

    const langIcon =
      article.bahasa === "en" ? "🇬🇧" :
      article.bahasa === "ar" ? "🇸🇦" :
      "🇮🇩";

    // === DATASET (WAJIB utk filter & count)
    card.dataset.category = normalize(article.kategori);
    if (article.subkategori) {
      card.dataset.subcategory = normalize(article.subkategori);
    }
    if (article.tag) {
      card.dataset.tag = normalize(article.tag);
    }

    if (article.featured === true) {
      card.dataset.featured = "true";
      card.classList.add("is-featured");
    }
    if (article.popular === true) {
      card.dataset.popular = "true";
      card.classList.add("is-popular");
    }
    if (article.featured === true) {
  card.classList.add("show-featured");
}

    const daysOld =
      (new Date() - new Date(article.createdAt)) / (1000 * 60 * 60 * 24);
    const isNew = daysOld <= 7;

    const thumbHtml = article.thumbnail
      ? `<img src="${article.thumbnail}" class="thumb" alt="${article.judul}">`
      : `<img src="assets/images/default.jpg" class="thumb" alt="default">`;

      const tanggal = new Date(article.tanggal).toLocaleDateString("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric"
});

    card.innerHTML = `
      <span class="lang-badge">${langIcon}</span>
      ${thumbHtml}
      ${article.popular ? `<span class="badge-popular">🔥 Populer</span>` : ""}
      ${article.featured ? `<span class="badge-featured">⭐ Featured</span>` : ""}
      ${isNew ? `<span class="badge-new">Baru</span>` : ""}
      <div class="card-top">
  <span class="category">${article.kategori}</span>
  <button class="card-bookmark" data-id="${id}">⭐</button>
</div>
     <h3>${article.judul.length > 40 
  ? article.judul.slice(0, 40) + "…" 
  : article.judul}</h3>
      <p>${article.isi.replace(/<[^>]*>/g, "").slice(0, 100)}...</p>
      <a href="article.html?id=${id}" class="read-more">Baca Selengkapnya</a>
       <span class="card-date">${tanggal}</span>
    `;

    articlesContainer.appendChild(card);
   // ==============================
// BOOKMARK BUTTON CARD (FINAL)
// ==============================
const starBtn = card.querySelector(".card-bookmark");

if (starBtn) {
  let saved = JSON.parse(localStorage.getItem("bookmarks")) || [];

  // status awal icon
  if (saved.includes(id)) {
    starBtn.classList.add("active");
    starBtn.textContent = "★";
  } else {
    starBtn.textContent = "☆";
  }

  starBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();

    let savedNow = JSON.parse(localStorage.getItem("bookmarks")) || [];

    if (savedNow.includes(id)) {
      // hapus bookmark
      savedNow = savedNow.filter(b => b !== id);
      starBtn.classList.remove("active");
      starBtn.textContent = "☆";
      showToast("❌ Bookmark dihapus");
    } else {
      // simpan bookmark
      savedNow.push(id);
      starBtn.classList.add("active");
      starBtn.textContent = "★";

      // animasi kecil
      starBtn.classList.add("pop");
      setTimeout(() => starBtn.classList.remove("pop"), 250);

      showToast("⭐ Artikel disimpan");
    }

    localStorage.setItem("bookmarks", JSON.stringify(savedNow));
    updateBookmarkBadge?.();
  });
}
  });

  // ✅ AMBIL CARD SETELAH RENDER
  cards = document.querySelectorAll(".card");

  // ✅ KHUSUS HOME: tampilkan 3 NON-FEATURED
  if (isHomePage) {
    let shown = 0;
    cards.forEach(card => {
      const isFeatured = card.dataset.featured === "true";
      if (!isFeatured && shown < 3) {
        card.style.display = "block";
        shown++;
      } else {
        card.style.display = "none";
      }
    });
  }
}

// =====================
// ARTIKEL POPULER (HOME) — TAMBAHAN AMAN
// =====================
const popularContainer = document.getElementById("popular-container");

if (isHomePage && popularContainer && typeof articlesData !== "undefined") {

  popularContainer.innerHTML = "";

  const popularKeys = Object.keys(articlesData).sort((a, b) => {
    return new Date(articlesData[b].createdAt) -
           new Date(articlesData[a].createdAt);
  });

  let popularShown = 0;

  popularKeys.forEach(id => {
    const article = articlesData[id];

    if (article.popular === true && popularShown < 3) {

      const card = document.createElement("article");
      card.className = "card";

       // TAMBAHAN INI
  card.classList.add("is-popular");

      const langIcon =
        article.bahasa === "en" ? "🇬🇧" :
        article.bahasa === "ar" ? "🇸🇦" :
        "🇮🇩";

      const thumb = article.thumbnail
        ? article.thumbnail
        : "assets/images/default.jpg";

        const tanggal = new Date(article.tanggal).toLocaleDateString("id-ID", {
  day: "numeric",
  month: "long",
  year: "numeric"
});

      card.innerHTML = `
        <span class="lang-badge">${langIcon}</span>
        <img src="${thumb}" class="thumb" alt="${article.judul}">
        <span class="badge-popular">🔥 Populer</span>
        <span class="category">${article.kategori}</span>
        <h3>${article.judul}</h3>
        <p>${article.isi.replace(/<[^>]*>/g, "").slice(0, 120)}...</p>
        <a href="article.html?id=${id}" class="read-more">Baca Selengkapnya</a>
        <span class="card-date">${tanggal}</span>
      `;

      popularContainer.appendChild(card);
      popularShown++;
    }
  });
}

 updateSidebarBadges();
 const params = new URLSearchParams(window.location.search);
const urlFilter = params.get("filter");

if (urlFilter) {
  const sidebarLink = document.querySelector(`[data-filter="${urlFilter}"]`);
  sidebarLink?.click();
}

function updateSidebarBadges() {
  if (typeof articlesData === "undefined") return;

  const categoryCount = {};
  const subcategoryCount = {};
  const tagCount = {};

  Object.values(articlesData).forEach(article => {
    const cat = normalize(article.kategori);
    const sub = article.subkategori ? normalize(article.subkategori) : null;
    const tag = article.tag ? normalize(article.tag) : null;

    if (cat) categoryCount[cat] = (categoryCount[cat] || 0) + 1;
    if (sub) subcategoryCount[sub] = (subcategoryCount[sub] || 0) + 1;
    if (tag) tagCount[tag] = (tagCount[tag] || 0) + 1;
  });

  const total = Object.keys(articlesData).length;

  document.querySelectorAll("[data-count]").forEach(badge => {
    const key = badge.dataset.count;

    let value = 0;

    if (key === "all") {
      value = total;
    } else if (categoryCount[key] !== undefined) {
      value = categoryCount[key];
    } else if (subcategoryCount[key] !== undefined) {
      value = subcategoryCount[key];
    } else if (tagCount[key] !== undefined) {
      value = tagCount[key];
    }

    badge.textContent = value;
  });
}

  /* =====================
   FILTER KATEGORI (INDEX) - FINAL STABLE
===================== */

const featuredSection = document.getElementById("featured-article");

const filterLinks = isHomePage
  ? document.querySelectorAll("[data-filter]")
  : [];

filterLinks.forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();

    

    // =====================
    // SET FILTER AKTIF
    // =====================
    activeFilter = normalize(link.dataset.filter);

    // =====================
    // SIDEBAR ACTIVE STATE
    // =====================
    document
      .querySelectorAll(".sidebar-link, .submenu a")
      .forEach(el => el.classList.remove("active"));

    link.classList.add("active");

    const parent = link.closest(".has-children");
    if (parent) parent.classList.add("active");

    // =====================
    // FILTER CARD
    // =====================
    let shownCount = 0;

cards.forEach(card => {
  const category = card.dataset.category;
  const subcategory = card.dataset.subcategory;
  const tag = card.dataset.tag;
  const isFeatured = card.dataset.featured === "true";

  let show = false;

  // =====================
  // HOME - ALL
  // =====================
  if (activeFilter === "all") {
    if (!isFeatured && shownCount < 3) {
      show = true;
      shownCount++;
    }
  }

  // =====================
  // FILTER KATEGORI / SUB
  // =====================
  else {
    // ⬅️ INI FIX UTAMA
    if (
      category === activeFilter ||
      subcategory === activeFilter ||
      tag === activeFilter
    ) {
      show = true;
    }
  }

  card.style.display = show ? "block" : "none";
});


    // =====================
    // FEATURED SECTION
    // =====================
    if (featuredSection) {
      featuredSection.style.display =
        activeFilter === "all" ? "block" : "none";
    }

    // =====================
    // CLOSE SIDEBAR (MOBILE)
    // =====================
    sidebar?.classList.remove("active");
    overlay?.classList.remove("active");

    // =====================
    // SCROLL
    // =====================
    document
      .getElementById("articles-container")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});


  /* =====================
     HALAMAN ARTIKEL
  ===================== */
  if (typeof articlesData !== "undefined") {

    const params = new URLSearchParams(window.location.search);
    const articleId = params.get("id");

    const titleEl = document.getElementById("judul-artikel");
    const penulisEl = document.getElementById("penulis");
    const tanggalEl = document.getElementById("tanggal");
    const kategoriEl = document.getElementById("kategori");
    const isiEl = document.getElementById("isi-artikel");
    const notFoundEl = document.getElementById("not-found");
    const articleContent = document.querySelector(".article-content");

    const breadcrumbCategory = document.getElementById("breadcrumb-category");
    const breadcrumbTitle = document.getElementById("breadcrumb-title");

    const prevBtn = document.getElementById("prev-article");
    const nextBtn = document.getElementById("next-article");

    const articleKeys = Object.keys(articlesData).sort((a, b) => {
  return new Date(articlesData[b].createdAt) - new Date(articlesData[a].createdAt);
});


/* =====================
   FEATURED ARTICLE (HOME) — FINAL STABLE
===================== */

if (isHomePage && typeof articlesData !== "undefined") {

  const featuredSection = document.getElementById("featured-article");
  const heroFeaturedTitle = document.getElementById("hero-featured-title");
  const heroSubtitle = document.getElementById("hero-subtitle");

  if (!featuredSection || articleKeys.length === 0) {

    // skip featured

  } else {

    let currentFeaturedIndex = 0;
    let featuredTimer = null;

    function renderFeatured(index) {
      const id = articleKeys[index];
      const data = articlesData[id];

      featuredSection.innerHTML = `
        <a href="article.html?id=${id}" class="featured-card fade">
          <img src="${data.thumbnail || "assets/images/default.jpg"}">
          <div class="featured-content">
            <span class="category">${data.kategori}</span>
            <h2>${data.judul}</h2>
            <p>${data.isi.replace(/<[^>]*>/g, "").slice(0,160)}...</p>
          </div>
        </a>
      `;

      featuredSection.style.display = "block";

      if (heroFeaturedTitle) {
        heroFeaturedTitle.textContent = data.judul;
        heroFeaturedTitle.href = `article.html?id=${id}`;
      }

      if (heroSubtitle) {
        heroSubtitle.textContent =
          data.isi.replace(/<[^>]*>/g, "").slice(0,120) + "...";
      }
    }

    function startAutoRotate() {
  if (featuredTimer) clearInterval(featuredTimer);

  featuredTimer = setInterval(() => {
    currentFeaturedIndex =
      (currentFeaturedIndex + 1) % articleKeys.length;
    renderFeatured(currentFeaturedIndex);
  }, 6000);
}

    function stopAutoRotate() {
      clearInterval(featuredTimer);
    }

    renderFeatured(currentFeaturedIndex);
    startAutoRotate();

    // ⭐ EVENT HARUS DI DALAM ELSE
    featuredSection.addEventListener("mouseenter", stopAutoRotate);
    featuredSection.addEventListener("mouseleave", startAutoRotate);
  }
}


    let data = articlesData?.[articleId];

// fallback ke offline
if (!data) {
  const offline =
    JSON.parse(localStorage.getItem("offlineArticles")) || {};
  data = offline[articleId];
}

if (articleId && data) {

  // ===== SIMPAN ARTIKEL KE OFFLINE =====
let offline =
  JSON.parse(localStorage.getItem("offlineArticles")) || {};

if (!offline[articleId]) {
  offline[articleId] = data;
  localStorage.setItem(
    "offlineArticles",
    JSON.stringify(offline)
  );
}


      /* ========= THUMBNAIL ========= */
      const thumbEl = document.getElementById("article-thumb");
      if (thumbEl && data.thumbnail) {
        thumbEl.src = data.thumbnail;
        thumbEl.alt = data.judul;
      } else if (thumbEl) {
        thumbEl.style.display = "none";
      }

      /* ========= SEO ========= */
      document.title = `${data.judul} | Portal Literasi Islam`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        const plainText = data.isi.replace(/<[^>]*>?/gm, "").slice(0, 160);
        metaDesc.setAttribute("content", plainText);
      }

      /* ========= OPEN GRAPH ========= */
const ogTitle = document.querySelector('meta[property="og:title"]');
const ogDesc = document.querySelector('meta[property="og:description"]');
const ogImage = document.querySelector('meta[property="og:image"]');
const ogUrl = document.querySelector('meta[property="og:url"]');

if (ogTitle) ogTitle.setAttribute("content", data.judul);
if (ogDesc) {
  const plainText = data.isi.replace(/<[^>]*>?/gm, "").slice(0, 160);
  ogDesc.setAttribute("content", plainText);
}
if (ogImage && data.thumbnail) {
  // nanti kalau sudah hosting, path ini jadi absolute URL
  ogImage.setAttribute("content", data.thumbnail);
}
if (ogUrl) ogUrl.setAttribute("content", window.location.href);

/* ======== SCHEMA ARTICLE ======== */

const schemaScript = document.getElementById("schema-article");

if (schemaScript && data) {

  const plainText = (data.isi || "")
    .replace(/<[^>]*>/g, "")
    .slice(0, 160);

 const schemaData = {
  "@context": "https://schema.org",
  "@type": "Article",

  "headline": data.judul || "",
  "description": plainText,

  "image": data.thumbnail
    ? [data.thumbnail]
    : ["https://islamic-portal.vercel.app/assets/images/logo.png"],

  "author": {
    "@type": "Person",
    "name": "Muhammad Nurcholis"
  },

  "publisher": {
    "@type": "Organization",
    "name": "Portal Literasi Islam",
    "logo": {
      "@type": "ImageObject",
      "url": "https://islamic-portal.vercel.app/assets/images/logo.png"
    }
  },

  "datePublished": data.tanggal || new Date().toISOString(),
  "dateModified": data.tanggal || new Date().toISOString(),

  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": window.location.href
  },

  "articleSection": data.kategori || "Artikel",
  "inLanguage": "id"
};

  schemaScript.textContent = JSON.stringify(schemaData);
}


      /* ========= SHARE BUTTONS ========= */
const shareWaBtn = document.getElementById("share-wa");
const copyLinkBtn = document.getElementById("copy-link");

const currentUrl = window.location.href;
const shareText = `${data.judul} — ${currentUrl}`;

if (shareWaBtn) {
  shareWaBtn.addEventListener("click", () => {
    const waUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
    window.open(waUrl, "_blank");
  });
}

if (copyLinkBtn) {
  copyLinkBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(currentUrl).then(() => {
      copyLinkBtn.textContent = "✅ Tersalin!";
      setTimeout(() => {
        copyLinkBtn.textContent = "🔗 Copy Link";
      }, 2000);
    });
  });
}

     /* ========= ISI ========= */
if (titleEl) titleEl.textContent = data.judul;
if (penulisEl) penulisEl.textContent = "✍️ " + data.penulis;
if (tanggalEl) tanggalEl.textContent = "📅 " + data.tanggal;
if (kategoriEl) kategoriEl.textContent = data.kategori;
if (isiEl) isiEl.innerHTML = data.isi;
updateReadTime();
applyArabicDirection(document.getElementById("isi-artikel"));
const savedLang = localStorage.getItem("articleLang");
if (savedLang) applyRTL(savedLang);

function applyArabicDirection(container) {
  if (!container) return;

  const arabicRegex = /[\u0600-\u06FF]/; // range unicode Arab

  container.querySelectorAll("p, h2, h3, blockquote").forEach(el => {
    if (arabicRegex.test(el.textContent)) {
      el.classList.add("arabic-text");
    }
  });
}


/* ========= READ TIME ========= */
function updateReadTime() {
  const readTimeEl = document.getElementById("read-time");
  const content = document.getElementById("isi-artikel");

  if (!readTimeEl || !content) return;

  const text = content.innerText || "";
  const words = text.trim().split(/\s+/).filter(w => w).length;

  // ambil ukuran font
  const fontSize = parseInt(window.getComputedStyle(content).fontSize);

  let speed = 200;
  if (fontSize >= 20) speed = 160;
  else if (fontSize <= 15) speed = 240;

  const minutes = Math.max(1, Math.ceil(words / speed));
  readTimeEl.textContent = `🕒 ${minutes} menit baca`;
}

      /* ========= TABLE OF CONTENTS (FINAL FIX) ========= */
const tocList = document.getElementById("toc-list");
const contentEl = document.getElementById("isi-artikel");
const tocBox = document.getElementById("toc");

if (tocList && contentEl && tocBox) {
  tocList.innerHTML = ""; // bersihin dulu (anti dobel)

  const headings = contentEl.querySelectorAll("h2, h3");

  if (headings.length > 0) {
    headings.forEach((heading, index) => {
      const id = `section-${index}`;
      heading.id = id;

      const li = document.createElement("li");
      li.className = heading.tagName.toLowerCase(); // h2 / h3

      const a = document.createElement("a");
      a.href = `#${id}`;
      a.textContent = heading.textContent;

      li.appendChild(a);
      tocList.appendChild(li);
    });
  } else {
    tocBox.style.display = "none";
  }
}


      /* ========= BREADCRUMB ========= */
      if (breadcrumbCategory) breadcrumbCategory.textContent = " / " + data.kategori;
      if (breadcrumbTitle) breadcrumbTitle.textContent = " / " + data.judul;

      /* ========= PREV / NEXT ========= */
      const index = articleKeys.indexOf(articleId);

      if (prevBtn) {
        if (index > 0) {
          const prevId = articleKeys[index - 1];
          prevBtn.href = `article.html?id=${prevId}`;
          prevBtn.textContent = "← Artikel Sebelumnya";
        } else {
          prevBtn.style.display = "none";
        }
      }

      if (nextBtn) {
        if (index < articleKeys.length - 1) {
          const nextId = articleKeys[index + 1];
          nextBtn.href = `article.html?id=${nextId}`;
          nextBtn.textContent = "Artikel Selanjutnya →";
        } else {
          nextBtn.style.display = "none";
        }
      }

      /* ========= RELATED (FINAL, CLEAN) ========= */
      const relatedContainer = document.getElementById("related-container");
      const relatedSection = document.querySelector(".related-articles");

      if (relatedContainer && relatedSection) {
        const relatedKeys = articleKeys
  .filter(key => key !== articleId)
  .filter(key => articlesData[key].kategori === data.kategori)
  .sort((a, b) =>
    new Date(articlesData[b].createdAt) -
    new Date(articlesData[a].createdAt)
  )
  .slice(0, 3);

        if (relatedKeys.length === 0) {
          relatedSection.style.display = "none";
        } else {
          relatedKeys.forEach(key => {
            const item = articlesData[key];

            const div = document.createElement("div");
            div.className = "related-card";

          div.innerHTML = `
         <span class="lang-badge">${item.lang || "ID"}</span>
  <a href="article.html?id=${key}" class="related-link">
    <img 
      src="${item.thumbnail || 'assets/images/default.jpg'}" 
      class="related-thumb" 
      alt="${item.judul}"
    >
    <span class="category">${item.kategori}</span>
    <h4>${item.judul}</h4>
    <span class="related-read">Baca →</span>
  </a>
`;

            relatedContainer.appendChild(div);
          });
        }
      }

    } else if (articleContent && notFoundEl) {
      articleContent.style.display = "none";
      notFoundEl.style.display = "block";
    }
  }

});

// ============================
// GOOGLE AUTO TRANSLATE ARTICLE
// ============================

window.translateTo = function(lang) {

  localStorage.setItem("siteLang", lang);

  if (lang === "id") {
    document.cookie = "googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC;";
    location.reload();
    return;
  }

  document.cookie = "googtrans=/id/" + lang + ";path=/";
  location.reload();
};

function applyRTL(lang) {
  const article = document.querySelector(".article-content");
  if (!article) return;

  if (lang === "ar") {
    article.setAttribute("dir", "rtl");
    article.classList.add("rtl");
  } else {
    article.setAttribute("dir", "ltr");
    article.classList.remove("rtl");
  }
}

// ===============================
// AUTO APPLY RTL SAAT LOAD (KHUSUS ARTICLE)
// ===============================

window.addEventListener("load", function () {
  const savedLang = localStorage.getItem("siteLang");

  if (!savedLang) return;

  applyRTL(savedLang);
});

/* =====================
   TOC SCROLL SPY
===================== */
const tocLinks = document.querySelectorAll("#toc a");
const tocHeadings = document.querySelectorAll("#isi-artikel h2, #isi-artikel h3");

function onScrollSpy() {
  let currentId = "";

  tocHeadings.forEach(section => {
    const sectionTop = section.offsetTop - 120;
    if (window.scrollY >= sectionTop) {
      currentId = section.id;
    }
  });

  tocLinks.forEach(link => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${currentId}`) {
      link.classList.add("active");
    }
  });
}

window.addEventListener("scroll", onScrollSpy);

/* =====================
   TOC CLICK SCROLL (FINAL FIX)
===================== */
document.querySelectorAll("#toc a").forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();

    const id = link.getAttribute("href").replace("#", "");
    const target = document.getElementById(id);
    if (!target) return;

    const headerOffset = 100;
    const elementPosition = target.getBoundingClientRect().top;
    const offsetPosition =
      elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth"
    });
  });
});

/* =====================================
   FONT SIZE CONTROLLER (FULL VERSION)
   ===================================== */

const articleBody = document.getElementById("isi-artikel");
const btnPlus = document.getElementById("fontPlus");
const btnMinus = document.getElementById("fontMinus");

let fontSize = parseInt(localStorage.getItem("articleFontSize")) || 16;

/* =============================
   APPLY FONT SIZE
============================= */
function applyFontSize() {
  if (!articleBody) return;

  articleBody.style.fontSize = fontSize + "px";
  localStorage.setItem("articleFontSize", fontSize);

  updateReadingStats();
}

/* =============================
   UPDATE READING STATS
   (Menit baca ikut berubah)
============================= */
function updateReadingStats() {
  const articleBody = document.getElementById("isi-artikel");
  if (!articleBody) return;

  const text = articleBody.textContent || "";
  const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  let wordsPerMinute = 200;

  if (fontSize >= 20) wordsPerMinute = 140;
  else if (fontSize >= 18) wordsPerMinute = 160;
  else if (fontSize >= 16) wordsPerMinute = 180;

  const minutes = Math.max(1, Math.round(words / wordsPerMinute));

  const readTimeEl = document.getElementById("read-time");

  if (readTimeEl) {
    readTimeEl.textContent = "⏱ " + minutes + " menit baca";
  }
}

/* =============================
   FONT SIZE BUTTONS
============================= */
if (btnPlus) {
  btnPlus.addEventListener("click", () => {
    if (fontSize < 24) {
      fontSize += 1;
      applyFontSize();
    }
  });
}

if (btnMinus) {
  btnMinus.addEventListener("click", () => {
    if (fontSize > 14) {
      fontSize -= 1;
      applyFontSize();
    }
  });
}

/* =============================
   LOAD INITIAL FONT SIZE
============================= */
if (articleBody) {
  applyFontSize();
}

setTimeout(updateReadingStats, 300);

const bookmarkBtn = document.getElementById("bookmarkBtn");

if (bookmarkBtn) {
  const articleId = new URLSearchParams(window.location.search).get("id");

  // kalau TIDAK ada articleId → JANGAN PASANG EVENT (bukan return!)
  if (!articleId) {
    bookmarkBtn.disabled = true;
  } else {
    let saved = JSON.parse(localStorage.getItem("bookmarks")) || [];

    // status awal tombol
    bookmarkBtn.textContent = saved.includes(articleId)
      ? "⭐ Disimpan"
      : "⭐ Simpan";

    bookmarkBtn.addEventListener("click", () => {
      let savedNow = JSON.parse(localStorage.getItem("bookmarks")) || [];

      // 🔒 bersihkan duplikat (AMAN)
      savedNow = [...new Set(savedNow)];

     if (savedNow.includes(articleId)) {
  // hapus bookmark
  savedNow = savedNow.filter(id => id !== articleId);
  bookmarkBtn.textContent = "⭐ Simpan";
  showToast("❌ Bookmark dihapus");

  // hapus dari offline juga
  const offline =
    JSON.parse(localStorage.getItem("offlineArticles")) || {};
  delete offline[articleId];
  localStorage.setItem("offlineArticles", JSON.stringify(offline));

} else {
  // simpan bookmark
  savedNow.push(articleId);
  bookmarkBtn.textContent = "⭐ Disimpan";
  showToast("⭐ Artikel disimpan. Lihat di menu Bookmark");

  // otomatis simpan ke offline
  const offline =
    JSON.parse(localStorage.getItem("offlineArticles")) || {};
  offline[articleId] = articlesData[articleId];
  localStorage.setItem("offlineArticles", JSON.stringify(offline));
}

      localStorage.setItem("bookmarks", JSON.stringify(savedNow));
      updateBookmarkBadge?.();
    });
  }
}

function updateBookmarkBadge() {
  const badge = document.querySelector(".bookmark-count");
  if (!badge) return;

  const saved = JSON.parse(localStorage.getItem("bookmarks")) || [];
  badge.textContent = saved.length;
  badge.style.display = saved.length > 0 ? "flex" : "none";
}

// jalankan saat load
updateBookmarkBadge();

window.addEventListener("storage", () => {
  updateBookmarkBadge();
});

const focusBtn = document.getElementById("focusToggle");

if (focusBtn) {
  focusBtn.onclick = () => {
    document.body.classList.toggle("focus-mode");
    focusBtn.textContent =
      document.body.classList.contains("focus-mode")
        ? "❌ Keluar"
        : "📖 Mode Baca";
  };
}

document.getElementById("fontReset")?.addEventListener("click", () => {
  fontSize = 16;
  articleBody.style.fontSize = "16px";
  localStorage.removeItem("articleFontSize");
});

const readModeBtn = document.getElementById("readModeBtn");
const resetBtn = document.getElementById("resetBtn");

if (readModeBtn) {
  readModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("read-mode");
  });
}

if (resetBtn) {
  resetBtn.addEventListener("click", () => {
    document.body.classList.remove("read-mode");
    localStorage.removeItem("articleFontSize");
    location.reload();
  });
}



// =====================
// QUOTE SELECTION (FINAL & AMAN)
// =====================

document.addEventListener("mouseup", (e) => {
  const box = document.getElementById("quoteBox");
  const quote = document.getElementById("quoteText");

  if (!box || !quote) return;

  // ⛔ klik di dalam popup → jangan tutup
  if (box.contains(e.target)) return;

  const text = window.getSelection().toString().trim();

  if (text.length > 20) {
    quote.textContent = `“${text}”`;
    box.style.display = "block";
  } else {
    box.style.display = "none";
  }
});

document.getElementById("waQuote")?.addEventListener("click", () => {
  const text = document.getElementById("quoteText").textContent;
  window.open(
    `https://wa.me/?text=${encodeURIComponent(text + "\n\n" + location.href)}`,
    "_blank"
  );
});

const copyBtn = document.getElementById("copyQuote");

if (copyBtn) {
  copyBtn.addEventListener("click", () => {
    const text = document.getElementById("quoteText")?.textContent?.trim();

    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
      const originalText = copyBtn.textContent;

      copyBtn.textContent = "✅ Dicopy";
      copyBtn.disabled = true;

      setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.disabled = false;
      }, 1500);
    });
  });
}

const quoteBox = document.getElementById("quoteBox");
const closeQuoteBtn = document.getElementById("closeQuote");

if (closeQuoteBtn && quoteBox) {
  closeQuoteBtn.addEventListener("click", () => {
    quoteBox.classList.remove("show");
    quoteBox.style.display = "none";
  });
}

/* =====================
   AUTO FOCUS SEARCH (HOME)
===================== */
if (isHomePage) {
  const search = document.getElementById("searchInput");
  if (search) {
    setTimeout(() => {
      search.focus();
    }, 600);
  }
}


// INTRO VALUES ANIMATION
const valueItems = document.querySelectorAll(".value-item");

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

valueItems.forEach(item => observer.observe(item));

const tocToggle = document.getElementById("tocToggle");
const toc = document.getElementById("toc");

if (tocToggle && toc) {
  tocToggle.addEventListener("click", () => {
    toc.classList.toggle("active");
  });
}

/* =====================
   TOC DESKTOP COLLAPSE
===================== */
const tocCollapse = document.getElementById("tocCollapse");

if (tocCollapse && toc) {
  tocCollapse.addEventListener("click", () => {
    toc.classList.toggle("collapsed");
  });
}


// =====================
// TOAST (GLOBAL, SIMPLE)
// =====================

function showToast(message, duration = 2000) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toast._timer);

  toast._timer = setTimeout(() => {
    toast.classList.remove("show");
  }, duration);
}

document.querySelectorAll(".prefooter-col a[data-filter]").forEach(link => {
  link.onclick = e => {
    e.preventDefault();

    const filter = link.dataset.filter;

    // klik sidebar filter otomatis
    const sidebarLink = document.querySelector(
      `[data-filter="${filter}"]`
    );

    if (sidebarLink) {
      sidebarLink.click();
    }

    // scroll ke artikel
    document
      .getElementById("articles-container")
      ?.scrollIntoView({ behavior: "smooth" });
  };
});

// ===============================
// READING PROGRESS STANDALONE
// ===============================
window.addEventListener("load", () => {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  window.addEventListener("scroll", () => {
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    if (docHeight <= 0) return;

   let percent = Math.min(
  100,
  Math.floor((window.scrollY / docHeight) * 100)
);

// kalau sudah hampir selesai
if (percent >= 95) percent = 100;

    const data =
      JSON.parse(localStorage.getItem("readingProgress")) || {};

    // hanya update kalau lebih besar
    if (!data[id] || percent > data[id]) {
     if (percent >= 96) {
  delete data[id]; // hapus kalau sudah selesai
} else {
  data[id] = percent;
}

localStorage.setItem("readingProgress", JSON.stringify(data));
    }
  });
});

// =====================
// AUTO SCROLL KE POSISI TERAKHIR (FINAL)
// =====================
(function () {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  const data =
    JSON.parse(localStorage.getItem("readingProgress")) || {};

  const percent = data[id];
  if (!percent || percent >= 96) return;

  window.addEventListener("load", () => {
    setTimeout(() => {
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;

      const target = (docHeight * percent) / 100;

      window.scrollTo({
        top: target,
        behavior: "auto"
      });
    }, 400); // tunggu render artikel
  });
})();


(function () {
  const btn = document.getElementById("focusModeBtn");
  if (!btn) return;

  // load status
  if (localStorage.getItem("focusMode") === "on") {
    document.body.classList.add("focus-mode");
    btn.textContent = "❌ Keluar Fokus";
  }

  btn.addEventListener("click", () => {
    document.body.classList.toggle("focus-mode");

    const active = document.body.classList.contains("focus-mode");

    btn.textContent = active
      ? "❌ Keluar Fokus"
      : "🧘 Mode Fokus";

    localStorage.setItem("focusMode", active ? "on" : "off");
  });
})();

// =============================
// AUTO SCROLL KE POSISI TERAKHIR
// =============================
window.addEventListener("load", () => {
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  const data =
    JSON.parse(localStorage.getItem("readingProgress")) || {};

  const percent = data[id] || 0;

  // kalau sudah hampir selesai, mulai dari atas
  if (percent >= 95) {
    window.scrollTo(0, 0);
    return;
  }

  // kalau belum selesai, scroll ke posisi terakhir
  if (percent > 5) {
    const docHeight =
      document.documentElement.scrollHeight - window.innerHeight;

    const scrollPos = (percent / 100) * docHeight;

    setTimeout(() => {
      window.scrollTo({
  top: scrollPos,
  behavior: "smooth"
      });
    }, 300);
  }
});

// =============================
// TOP PROGRESS BAR
// =============================
window.addEventListener("scroll", () => {
  const bar = document.getElementById("progress-bar");
  if (!bar) return;

  const docHeight =
    document.documentElement.scrollHeight - window.innerHeight;

  if (docHeight <= 0) return;

  const percent = Math.round(
    (window.scrollY / docHeight) * 100
  );

  bar.style.width = percent + "%";

  // ===============================
  // SIMPAN PROGRESS BACA
  // ===============================
  const id = new URLSearchParams(window.location.search).get("id");
  if (!id) return;

  let reading =
    JSON.parse(localStorage.getItem("readingProgress")) || {};

  reading[id] = percent;
  localStorage.setItem(
    "readingProgress",
    JSON.stringify(reading)
  );

  // ===============================
  // JIKA ARTIKEL SELESAI
  // ===============================
  if (percent >= 95 && !reading[id + "_done"]) {
    reading[id + "_done"] = true;
    localStorage.setItem(
      "readingProgress",
      JSON.stringify(reading)
    );

    const today = new Date().toISOString().slice(0, 10);

    let history =
      JSON.parse(localStorage.getItem("readingHistory")) || {};

    history[today] = (history[today] || 0) + 1;
    localStorage.setItem(
      "readingHistory",
      JSON.stringify(history)
    );

    let total =
      parseInt(localStorage.getItem("totalArticlesRead")) || 0;

    localStorage.setItem(
      "totalArticlesRead",
      total + 1
    );
  }
});

// =====================
// GLOBAL DARK MODE AUTO
// =====================
(function () {
  const saved = localStorage.getItem("theme");

  // jika belum ada pilihan, ikuti sistem
  if (!saved) {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (prefersDark) {
      document.body.classList.add("dark");
      localStorage.setItem("theme", "dark");
    }
  } else if (saved === "dark") {
    document.body.classList.add("dark");
  }
})();

// =====================
// TEXT HIGHLIGHT SAVE
// =====================
document.addEventListener("mouseup", () => {
  const selection = window.getSelection();
  const text = selection.toString().trim();
  if (text.length < 20) return;

  const articleId =
    new URLSearchParams(window.location.search).get("id");
  if (!articleId) return;

  const highlights =
    JSON.parse(localStorage.getItem("highlights")) || {};

  if (!highlights[articleId]) {
    highlights[articleId] = [];
  }

  highlights[articleId].push(text);
  localStorage.setItem("highlights", JSON.stringify(highlights));
});


// =====================
// SAVE ARTICLE OFFLINE
// =====================
const offlineBtn = document.getElementById("offlineSaveBtn");

if (offlineBtn) {
  const params = new URLSearchParams(window.location.search);
  const articleId = params.get("id");

  offlineBtn.addEventListener("click", () => {
   if (!articleId || !articlesData?.[articleId]) return;

const offline =
  JSON.parse(localStorage.getItem("offlineArticles")) || {};

offline[articleId] = articlesData[articleId];

    localStorage.setItem(
      "offlineArticles",
      JSON.stringify(offline)
    );

    if (typeof showToast === "function") {
      showToast("⬇️ Artikel disimpan offline");
    }
  });
}

function updateOfflineCount() {
  const el = document.getElementById("offline-count");
  if (!el) return;

  const data =
    JSON.parse(localStorage.getItem("offlineArticles")) || {};

  el.textContent = Object.keys(data).length;
}

updateOfflineCount();

// ==============================
// RENDER OFFLINE DI HOME
// ==============================
function renderOfflineHome() {
  const section = document.getElementById("offline-section");
  const list = document.getElementById("offline-home-list");

  if (!section || !list) return;

  const offline =
    JSON.parse(localStorage.getItem("offlineArticles")) || {};

  const ids = Object.keys(offline);

  if (ids.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";
  list.innerHTML = "";

  ids.slice(0, 3).forEach((id) => {
    const article = offline[id];
    if (!article) return;

    const card = document.createElement("article");
    card.className = "card";

    const thumb = article.thumbnail || "assets/images/default.jpg";

    card.innerHTML = `
      <img src="${thumb}" class="thumb" alt="${article.judul}">
      <span class="category">${article.kategori}</span>
      <h3>${article.judul}</h3>
      <a href="article.html?id=${id}" class="read-more">
        Baca Offline
      </a>
    `;

    list.appendChild(card);
  });
}

// ===============================
// DOWNLOAD SEMUA ARTIKEL KATEGORI
// ===============================
const downloadBtn = document.getElementById("download-category");
const progressBox = document.getElementById("download-progress");
const progressFill = document.getElementById("progress-fill");
const progressText = document.getElementById("progress-text");

if (downloadBtn) {
  downloadBtn.addEventListener("click", () => {
    const currentFilter = activeFilter || "all";

    let articles = Object.entries(articlesData);

    if (currentFilter !== "all") {
      articles = articles.filter(
        ([id, data]) => data.kategori === currentFilter
      );
    }

    const total = articles.length;
    let done = 0;

    const offline =
      JSON.parse(localStorage.getItem("offlineArticles")) || {};

    progressBox.style.display = "flex";

    articles.forEach(([id, data], index) => {
      setTimeout(() => {
        offline[id] = data;
        done++;

        const percent = Math.round((done / total) * 100);
        progressFill.style.width = percent + "%";
        progressText.textContent = percent + "%";

        if (done === total) {
          localStorage.setItem(
            "offlineArticles",
            JSON.stringify(offline)
          );

          downloadBtn.classList.add("downloaded");
          downloadBtn.textContent = "✓ Sudah diunduh";

          updateOfflineCount();
        }
      }, index * 120); // animasi bertahap
    });
  });
}

function updateOnlineStatus() {
  const el = document.getElementById("offline-indicator");
  if (!el) return;

  if (navigator.onLine) {
    el.textContent = "🌐 Online";
    el.classList.remove("offline");
  } else {
    el.textContent = "📴 Offline";
    el.classList.add("offline");
  }
}

window.addEventListener("online", updateOnlineStatus);
window.addEventListener("offline", updateOnlineStatus);

updateOnlineStatus();
// jalankan saat halaman dimuat
renderOfflineHome();

// =============================
// OFFLINE TOAST
// =============================
function showOfflineToast(message) {
  const toast = document.getElementById("offline-toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 4000);
}

// cek status awal
window.addEventListener("load", () => {
  if (!navigator.onLine) {
    showOfflineToast("⚠️ Anda sedang offline.");
  }
});

// saat internet putus
window.addEventListener("offline", () => {
  showOfflineToast("⚠️ Anda sedang offline.");
});

// saat internet kembali
window.addEventListener("online", () => {
  showOfflineToast("✅ Koneksi kembali online.");
});

function renderLastReading() {
  const section = document.getElementById("last-reading");
  const container = document.getElementById("last-reading-card");

  if (!section || !container) return;

  const progress =
    JSON.parse(localStorage.getItem("readingProgress")) || {};

  const ids = Object.keys(progress).filter(
    id => progress[id] > 5 && progress[id] < 100
  );

  if (ids.length === 0) {
    section.style.display = "none";
    return;
  }

  const id = ids[ids.length - 1];
  const article = articlesData[id];
  if (!article) return;

  section.style.display = "block";

  container.innerHTML = `
  <div class="last-reading-card">
    <span class="category">${article.kategori}</span>
    <h3>${article.judul}</h3>
    <div class="reading-progress-bar">
      <div class="reading-progress-fill" style="width:${progress[id]}%"></div>
    </div>
    <p>Lanjutkan dari ${progress[id]}%</p>
    <a href="article.html?id=${id}" class="btn-premium">
      Lanjutkan Membaca
    </a>
  </div>
  `;

  // =====================
// 🎨 AUTO COLOR CARD
// =====================

const card = container.querySelector(".last-reading-card");

card.classList.remove(
  "card-low",
  "card-mid",
  "card-high"
);

const percent = progress[id];

if (percent < 40) {
  card.classList.add("card-low");
} else if (percent < 80) {
  card.classList.add("card-mid");
} else {
  card.classList.add("card-high");
}
}


// ===============================
// AUTO SYNC TIAP 2 DETIK
// ===============================
setInterval(() => {
  renderLastReading();
  updateReaderStats();
  updateHomeStats();
}, 200);


// ===============================
// AUTO REFRESH SAAT KEMBALI KE TAB
// ===============================
function refreshHomeWidgets() {
  renderLastReading();
  updateReaderStats();
  updateHomeStats();
}

window.addEventListener("focus", refreshHomeWidgets);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    refreshHomeWidgets();
  }
});

function updateHomeStats() {
  const offlineEl = document.getElementById("stat-offline");
  const statBox = offlineEl?.closest(".stat-box"); // cuma ambil parent

  if (offlineEl) {
    const offline =
      JSON.parse(localStorage.getItem("offlineArticles")) || {};

    const count = Object.keys(offline).length;
    offlineEl.textContent = count;

    // ===================
    // 🎨 TAMBAH WARNA SAJA
    // ===================
    if (statBox) {
      statBox.classList.remove("offline-low","offline-mid","offline-high");

      if (count >= 20) {
        statBox.classList.add("offline-high");
      } else if (count >= 10) {
        statBox.classList.add("offline-mid");
      } else if (count >= 5) {
        statBox.classList.add("offline-low");
      }
    }
  }
}

// =====================
// READER STATS (GLOBAL)
// =====================
function updateReaderStats() {
  const section = document.getElementById("reader-stats");
  if (!section) return;

  const reading =
    JSON.parse(localStorage.getItem("readingProgress")) || {};

  const ids = Object.keys(reading).filter(id => reading[id] > 0);

  // =====================
  // Kalau belum ada bacaan
  // =====================
  if (ids.length === 0) {
    section.style.display = "none";
    return;
  }

  section.style.display = "block";

  const articleCount = ids.length;

  // =====================
  // Hitung total waktu
  // =====================
  let totalMinutes = 0;

  ids.forEach(id => {
    const percent = reading[id];
    const article = articlesData?.[id];
    if (!article) return;

    const text = article.isi.replace(/<[^>]*>/g, "");
    const words = text.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);

    totalMinutes += Math.round((percent / 100) * minutes);
  });

  // =====================
  // Artikel terakhir
  // =====================
  let lastTitle = "–";
  const lastId = ids[ids.length - 1];

  if (lastId && articlesData?.[lastId]) {
    lastTitle =
      articlesData[lastId].judul.length > 18
        ? articlesData[lastId].judul.slice(0, 18) + "..."
        : articlesData[lastId].judul;
  }

  // =====================
  // Update Text
  // =====================
  const elArticles = document.getElementById("stat-articles");
  const elTime = document.getElementById("stat-time");
  const elLast = document.getElementById("stat-last");

  if (elArticles) elArticles.textContent = articleCount;
  if (elTime) elTime.textContent = totalMinutes;
  if (elLast) elLast.textContent = lastTitle;

  // =====================
  // 🎨 Dynamic Color System
  // =====================
  section.classList.remove(
    "reader-green",
    "reader-blue",
    "reader-gold",
    "reader-default"
  );

  if (articleCount >= 5) {
    section.classList.add("reader-green");
  } else if (totalMinutes >= 30) {
    section.classList.add("reader-blue");
  } else {
    section.classList.add("reader-default");
  }
}

// ===============================
// REAL READING TIME TRACKER
// ===============================
let readingStart = Date.now();
let totalTime = 0;

const articleIdForTime =
  new URLSearchParams(window.location.search).get("id");

function saveReadingTime() {
  if (!articleIdForTime) return;

  const now = Date.now();
  const sessionTime = now - readingStart;
  totalTime += sessionTime;

  const data =
    JSON.parse(localStorage.getItem("readingTime")) || {};

  data[articleIdForTime] =
  (data[articleIdForTime] || 0) + sessionTime;

  localStorage.setItem("readingTime", JSON.stringify(data));

  readingStart = now;
}

// simpan tiap 10 detik
setInterval(saveReadingTime, 10000);

// simpan saat keluar halaman
window.addEventListener("beforeunload", saveReadingTime);

// ===============================
// READING STREAK
// ===============================
function updateReadingStreak() {
  const today = new Date().toDateString();

  let data =
    JSON.parse(localStorage.getItem("readingStreak")) || {
      lastDay: null,
      streak: 0
    };

  if (data.lastDay !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    if (data.lastDay === yesterday.toDateString()) {
      data.streak += 1;
    } else {
      data.streak = 1;
    }

    data.lastDay = today;
    localStorage.setItem("readingStreak", JSON.stringify(data));
  }
}

updateReadingStreak();

// ===============================
// AI SMART RECOMMENDATION ENGINE
// (kategori + perilaku user)
// ===============================
(function () {
  const container = document.getElementById("recommended-container");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const currentId = params.get("id");
  if (!currentId) return;

  if (typeof articlesData === "undefined") return;
  const current = articlesData[currentId];
  if (!current) return;

  const currentCat = (current.kategori || "").toLowerCase();
  const currentSub = (current.subkategori || "").toLowerCase();
  const currentTag = (current.tag || "").toLowerCase();

  // ambil riwayat baca
  const reading =
    JSON.parse(localStorage.getItem("readingProgress")) || {};

  const readingIds = Object.keys(reading);

  // kumpulkan kategori yang sering dibaca
  const userCategories = {};
  readingIds.forEach(id => {
    const art = articlesData[id];
    if (!art) return;
    const cat = (art.kategori || "").toLowerCase();
    userCategories[cat] = (userCategories[cat] || 0) + 1;
  });

  const allArticles = Object.entries(articlesData);

  let scored = allArticles
    .filter(([id]) => id !== currentId)
    .map(([id, a]) => {
      let score = 0;

      const cat = (a.kategori || "").toLowerCase();
      const sub = (a.subkategori || "").toLowerCase();
      const tag = (a.tag || "").toLowerCase();

      // konteks artikel saat ini
      if (cat === currentCat) score += 3;
      if (sub && sub === currentSub) score += 2;
      if (tag && tag === currentTag) score += 2;

      // perilaku user
      if (userCategories[cat]) {
        score += userCategories[cat] * 2;
      }

      // kualitas artikel
      if (a.popular) score += 2;
      if (a.featured) score += 1;

      return { id, data: a, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // fallback kalau kosong
  if (scored.length === 0) {
    scored = allArticles
      .filter(([id]) => id !== currentId)
      .slice(0, 3)
      .map(([id, data]) => ({ id, data, score: 0 }));
  }

  container.innerHTML = scored.map(item => `
    <a href="article.html?id=${item.id}" class="recommended-card">
      <span class="rec-cat">${item.data.kategori}</span>
      <h4>${item.data.judul}</h4>
      <p>${item.data.tanggal || ""}</p>
    </a>
  `).join("");
})();

// ================= ADVANCED FLOATING SCROLL =================

let lastScrollY = window.scrollY;
let ticking = false;

const floating = document.querySelector(".floating-actions");
const SHOW_AFTER = 150;     // muncul setelah 150px
const SCROLL_SENSITIVITY = 8; // biar gak flicker

function handleScroll() {
  const currentY = window.scrollY;
  const diff = currentY - lastScrollY;

  // Jangan tampil di atas halaman
  if (currentY < SHOW_AFTER) {
    floating.classList.add("hide");
  } else {
    if (diff > SCROLL_SENSITIVITY) {
      // Scroll turun → tampil
      floating.classList.remove("hide");
    } else if (diff < -SCROLL_SENSITIVITY) {
      // Scroll naik → sembunyi
      floating.classList.add("hide");
    }
  }

  lastScrollY = currentY;
  ticking = false;
}

window.addEventListener("scroll", () => {
  if (!ticking) {
    window.requestAnimationFrame(handleScroll);
    ticking = true;
  }

});
