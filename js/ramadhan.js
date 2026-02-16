const doaHarian = [
  "Allahumma barik lana fi Ramadhan...",
  "Ya Allah, kuatkan iman kami...",
  "Ya Allah, jadikan puasa kami diterima...",
  "Ya Allah, ampuni dosa kami...",
  "Ya Allah, lapangkan rezeki kami...",
  "Ya Allah, dekatkan kami dengan Al-Qur’an...",
  "Ya Allah, lindungi kami dari neraka...",
  "Ya Allah, jadikan kami hamba yang sabar...",
  "Ya Allah, bersihkan hati kami...",
  "Ya Allah, beri kami malam Lailatul Qadr..."
];

function tampilkanDoaHarian() {
  const el = document.getElementById("doa-harian");
  if (!el) return;

  const day = new Date().getDate();
  const doa = doaHarian[day % doaHarian.length];

  el.textContent = doa;
}

document.addEventListener("click", () => {
  const adzan = document.getElementById("adzan-audio");
  if (adzan) adzan.play().then(() => adzan.pause());
}, { once: true });

let times = {};

loadRamadhanTimes();
tampilkanDoaHarian();
initNotifyButton();

async function loadRamadhanTimes() {
  try {
    const pos = await new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej)
    );

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    loadRamadhanTable(lat, lon);
    calculateQibla(lat, lon);

    const res = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=11`
    );

    const data = await res.json();
    const t = data.data.timings;

    // tanggal hijriyah
const hijri = data.data.date.hijri;
const hijriText = `${hijri.weekday.en}, ${hijri.day} ${hijri.month.en} ${hijri.year} H`;

const hijriEl = document.getElementById("hijriDate");
if (hijriEl) hijriEl.textContent = hijriText;

    times = {
  imsak: t.Imsak.slice(0, 5),
  fajr: t.Fajr.slice(0, 5),
  dhuhr: t.Dhuhr.slice(0, 5),
  asr: t.Asr.slice(0, 5),
  maghrib: t.Maghrib.slice(0, 5),
  isha: t.Isha.slice(0, 5)
};

// jalankan semua fitur setelah waktu tersedia
updateCountdown();
highlightCurrentPrayer();
updateRamadhanMode();
autoNightMode();
ramadhanNotifications();
updateMiniPrayer();
setInterval(updateMiniPrayer, 60000);

// interval
setInterval(updateCountdown, 1000);
setInterval(highlightCurrentPrayer, 60000);
setInterval(updateRamadhanMode, 60000);
setInterval(playAdzanIfTime, 60000);
setInterval(autoNightMode, 60000);

    document.getElementById("time-imsak").textContent = times.imsak;
    document.getElementById("time-fajr").textContent = times.fajr;
    document.getElementById("time-maghrib").textContent = times.maghrib;

    const city = data.data.meta.timezone.replace("_", " ");
    document.getElementById("ramadhan-city").textContent = city;

updateCountdown(); // langsung jalan tanpa nunggu 1 detik
   setInterval(updateCountdown, 1000);

  

  } catch {
    document.getElementById("ramadhan-city").textContent =
      "Lokasi tidak tersedia";
  }
}


function ramadhanNotifications() {
  if (!("Notification" in window)) return;

  if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }

  setInterval(() => {
    if (!times.fajr) return;

    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();

    // notifikasi imsak
    const [ih, im] = times.imsak.split(":").map(Number);
    const imsakMin = ih * 60 + im;

    if (nowMin === imsakMin) {
      new Notification("Waktu Imsak", {
        body: "Sudah masuk waktu imsak. Segera selesaikan sahur.",
        icon: "assets/icons/mosque.png"
      });

      const adzan = document.getElementById("adzan-audio");
      if (adzan) adzan.play();
    }

    // notifikasi shalat
    const prayers = [
      { name: "Subuh", time: times.fajr },
      { name: "Dzuhur", time: times.dhuhr },
      { name: "Ashar", time: times.asr },
      { name: "Maghrib", time: times.maghrib },
      { name: "Isya", time: times.isha }
    ];

    prayers.forEach(prayer => {
      const [h, m] = prayer.time.split(":").map(Number);
      const prayerMin = h * 60 + m;

      if (nowMin === prayerMin) {
        new Notification("Waktu " + prayer.name, {
          body: "Sudah masuk waktu " + prayer.name,
          icon: "assets/icons/mosque.png"
        });

        const adzan = document.getElementById("adzan-audio");
        if (adzan) adzan.play();
      }
    });

  }, 60000);
}

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

async function loadRamadhanTable(lat, lon) {
  const year = new Date().getFullYear();
  const month = new Date().getMonth() + 1;

  const res = await fetch(
    `https://api.aladhan.com/v1/calendar?latitude=${lat}&longitude=${lon}&method=2&month=${month}&year=${year}`
  );

  const data = await res.json();
  const days = data.data;

  const tbody = document.getElementById("ramadhan-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";

  const today = new Date().getDate();

days.forEach((day, i) => {
  const tr = document.createElement("tr");

  const dayNum = parseInt(day.date.gregorian.day);

  if (dayNum === today) {
    tr.classList.add("today");
    tr.id = "today-row";
  }

    const imsak = day.timings.Imsak.slice(0, 5);
const fajr = day.timings.Fajr.slice(0, 5);
const maghrib = day.timings.Maghrib.slice(0, 5);

    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${day.date.readable}</td>
      <td>${imsak}</td>
      <td>${fajr}</td>
      <td>${maghrib}</td>
    `;

    tbody.appendChild(tr);
  });
}

// auto scroll ke hari ini
setTimeout(() => {
  const todayRow = document.getElementById("today-row");
  if (todayRow) {
    todayRow.scrollIntoView({
      behavior: "smooth",
      block: "center"
    });
  }
}, 300);

  // =========================
// DOA SAHUR & BERBUKA OTOMATIS
// =========================
const duaBox = document.getElementById("ramadhan-dua");
const duaText = document.getElementById("dua-text");

if (duaBox && duaText) {
  duaBox.style.display = "block";

  // waktu sekarang
  const now = new Date();
  const hour = now.getHours();

  // DOA SAHUR
  if (hour >= 2 && hour < 5) {
    duaText.innerHTML = `
      <div class="dua-arab">
        وَبِصَوْمِ غَدٍ نَوَيْتُ مِنْ شَهْرِ رَمَضَانَ
      </div>
      <div class="dua-arti">
        "Aku berniat berpuasa esok hari untuk menunaikan fardhu di bulan Ramadhan."
      </div>
    `;
  }

  // DOA BERBUKA
  else if (hour >= 17 && hour < 19) {
    duaText.innerHTML = `
      <div class="dua-arab">
        اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ
      </div>
      <div class="dua-arti">
        "Ya Allah, karena-Mu aku berpuasa, kepada-Mu aku beriman, dan dengan rezeki-Mu aku berbuka."
      </div>
    `;
  }

  // selain waktu sahur/berbuka
  else {
    duaBox.style.display = "none";
  }
}

function updateRamadhanMode() {
  const now = new Date();
  const hour = now.getHours();

  document.body.classList.remove("sahur-mode", "iftar-mode");

  // mode sahur
  if (hour >= 2 && hour < 5) {
    document.body.classList.add("sahur-mode");
  }

  // mode berbuka
  if (hour >= 17 && hour < 19) {
    document.body.classList.add("iftar-mode");
  }
}

function updateCountdown() {
  if (!times.imsak || !times.maghrib) return;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const [mh, mm] = times.maghrib.split(":").map(Number);
  const maghribMin = mh * 60 + mm;

  const [ih, im] = times.imsak.split(":").map(Number);
  const imsakMin = ih * 60 + im;

  let nextText = "";

  if (nowMin < imsakMin) {
    const diff = imsakMin - nowMin;
    nextText = `Menuju Imsak: ${Math.floor(diff / 60)}j ${diff % 60}m`;
  } else if (nowMin < maghribMin) {
    const diff = maghribMin - nowMin;
    nextText = `Menuju Berbuka: ${Math.floor(diff / 60)}j ${diff % 60}m`;
  } else {
    const diff = 1440 - nowMin + imsakMin;
    nextText = `Menuju Imsak: ${Math.floor(diff / 60)}j ${diff % 60}m`;
  }
const heroEl = document.getElementById("hero-countdown");
if (heroEl) heroEl.textContent = nextText;

const boxEl = document.getElementById("ramadhan-next");
if (boxEl) boxEl.textContent = nextText;
}

function initNotifyButton() {
  const btn = document.getElementById("notifyBtn");
  if (!btn) return;

  btn.addEventListener("click", () => {
    if (!("Notification" in window)) {
      alert("Browser tidak mendukung notifikasi.");
      return;
    }

    Notification.requestPermission().then((perm) => {
      if (perm === "granted") {
        btn.textContent = "Notifikasi Aktif";
        btn.classList.add("active");
      }
    });
  });
}

function updateMiniPrayer() {
  if (!times.fajr) return;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const prayers = [
    { name: "Subuh", time: times.fajr },
    { name: "Dzuhur", time: times.dhuhr },
    { name: "Ashar", time: times.asr },
    { name: "Maghrib", time: times.maghrib },
    { name: "Isya", time: times.isha }
  ];

  let next = prayers[0];

  for (let p of prayers) {
    const [h, m] = p.time.split(":").map(Number);
    const pMin = h * 60 + m;

    if (nowMin < pMin) {
      next = p;
      break;
    }
  }

  const nameEl = document.getElementById("mini-name");
  const timeEl = document.getElementById("mini-time");

  if (nameEl) nameEl.textContent = next.name;
  if (timeEl) timeEl.textContent = next.time;
}

function highlightCurrentPrayer() {
  if (!times.fajr) return;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const prayerOrder = [
    { key: "fajr", id: "time-fajr" },
    { key: "dhuhr", id: "time-dhuhr" },
    { key: "asr", id: "time-asr" },
    { key: "maghrib", id: "time-maghrib" },
    { key: "isha", id: "time-isha" }
  ];

  let current = prayerOrder[0];

  for (let i = 0; i < prayerOrder.length; i++) {
    const p = prayerOrder[i];
    const t = times[p.key];
    if (!t) continue;

    const [h, m] = t.split(":").map(Number);
    const pMin = h * 60 + m;

    if (nowMin >= pMin) {
      current = p;
    }
  }

  document.querySelectorAll(".ramadhan-card")
    .forEach(c => c.classList.remove("active"));

  const el = document.getElementById(current.id);
  if (el) {
    const card = el.closest(".ramadhan-card");
    if (card) card.classList.add("active");
  }
}

function playAdzanIfTime() {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const adzanTimes = [
    times.fajr,
    times.dhuhr,
    times.asr,
    times.maghrib,
    times.isha
  ];

  for (let t of adzanTimes) {
    if (!t) continue;

    const [h, m] = t.split(":").map(Number);
    const pMin = h * 60 + m;

    if (nowMin === pMin) {
      const adzan = document.getElementById("adzan-audio");
      if (adzan) adzan.play();
    }
  }
}

function calculateQibla(lat, lon) {
  const kaabaLat = 21.4225;
  const kaabaLon = 39.8262;

  const toRad = d => d * Math.PI / 180;
  const toDeg = r => r * 180 / Math.PI;

  const dLon = toRad(kaabaLon - lon);

  const y = Math.sin(dLon);
  const x =
    Math.cos(toRad(lat)) * Math.tan(toRad(kaabaLat)) -
    Math.sin(toRad(lat)) * Math.cos(dLon);

  let qibla = toDeg(Math.atan2(y, x));
  qibla = (qibla + 360) % 360;

  const el = document.getElementById("qiblaDirection");
  if (el) el.textContent = Math.round(qibla) + "° dari utara";
}

function autoNightMode() {
  if (!times.isha) return;

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const [ih, im] = times.isha.split(":").map(Number);
  const ishaMin = ih * 60 + im;

  if (nowMin >= ishaMin) {
    document.body.classList.add("dark");
  }
}