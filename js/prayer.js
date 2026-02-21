 /* =========================
   GLOBAL STATE
========================= */
// =========================
// DETEKSI RAMADHAN OTOMATIS
// =========================
function checkRamadhan() {
  const hijriEl = document.getElementById("hijri-date");
  if (!hijriEl) return;

  const text = hijriEl.textContent || "";
  if (text.includes("Ramadan")) {
    document.body.classList.add("ramadhan-mode");
  } else {
    document.body.classList.remove("ramadhan-mode");
  }
}

let prayerTimes = {};
let azanEnabled = true;
let alarmEnabled = true;
let lastPlayed = null;
let notifiedBefore = {}; // ⏰ notif 5 menit sebelum
let beforeMinutes = 5; // notifikasi sebelum azan
let azanTolerance = 3; // default 3 menit

/* =========================
   ELEMENTS
========================= */
const azanToggle = document.getElementById("azan-toggle");
const alarmBtn = document.getElementById("alarm-toggle");
const azanAudio = document.getElementById("azan-audio");
const muadzinSelect = document.getElementById("muadzin-select");
// 🔓 UNLOCK AUDIO (WAJIB UNTUK AUTOPLAY)
if (azanAudio) {
  document.body.addEventListener("click", () => {
    azanAudio.play().then(() => {
      azanAudio.pause();
      azanAudio.currentTime = 0;
      console.log("Audio unlocked");
    }).catch(() => {});
  }, { once: true });
}

const notifBtn = document.getElementById("notif-toggle");
const volumeSlider = document.getElementById("azan-volume");

const volumeToggle = document.getElementById("volume-toggle");
const toleranceSelect = document.getElementById("azanTolerance");

let lastVolume = 1; // simpan volume sebelum mute

if (volumeToggle && azanAudio) {
  // load mute state
  const muted = localStorage.getItem("azanMuted") === "true";
  azanAudio.muted = muted;
  volumeToggle.textContent = muted ? "🔇" : "🔊";

  volumeToggle.onclick = () => {
    if (azanAudio.muted) {
      // UNMUTE
      azanAudio.muted = false;
      azanAudio.volume = lastVolume || 1;
      volumeToggle.textContent = "🔊";
      localStorage.setItem("azanMuted", "false");
    } else {
      // MUTE
      lastVolume = azanAudio.volume;
      azanAudio.muted = true;
      volumeToggle.textContent = "🔇";
      localStorage.setItem("azanMuted", "true");
    }
  };
}

if (toleranceSelect) {
  const savedTol = localStorage.getItem("azanTolerance");
  if (savedTol !== null) {
    azanTolerance = Number(savedTol);
    toleranceSelect.value = savedTol;
  }

  toleranceSelect.onchange = () => {
    azanTolerance = Number(toleranceSelect.value);
    localStorage.setItem("azanTolerance", azanTolerance);
  };
}

if (volumeSlider && azanAudio && volumeToggle) {

  const savedVol = localStorage.getItem("azanVolume");
  if (savedVol !== null) {
    azanAudio.volume = savedVol;
    volumeSlider.value = savedVol;
  }

  volumeSlider.oninput = () => {
    azanAudio.volume = volumeSlider.value;
    azanAudio.muted = false;
    volumeToggle.textContent = "🔊";
    localStorage.setItem("azanVolume", volumeSlider.value);
  };
}


/* =========================
   TOGGLE AZAN
========================= */
if (azanToggle) {
  azanToggle.onclick = () => {
    azanEnabled = !azanEnabled;
    azanToggle.classList.toggle("active", azanEnabled);
    azanToggle.textContent = azanEnabled ? "🔔 Azan Aktif" : "🔕 Azan Mati";
  };
}

/* =========================
   TOGGLE ALARM
========================= */
if (alarmBtn) {
  alarmEnabled = localStorage.getItem("alarmAdzan") !== "false";
  alarmBtn.classList.toggle("active", alarmEnabled);

  alarmBtn.onclick = () => {
    alarmEnabled = !alarmEnabled;
    localStorage.setItem("alarmAdzan", alarmEnabled);
    alarmBtn.classList.toggle("active", alarmEnabled);
  };
}

/* =========================
   MUADZIN AUDIO MAP
========================= */
const muadzinMap = {
  mishary: {
    normal: "assets/audio/azan/mishary.mp3",
    fajr: "assets/audio/azan/mishary-fajr.mp3"
  },
  makkah: {
    normal: "assets/audio/azan/makkah.mp3",
    fajr: "assets/audio/azan/makkah.mp3"
  },
  madinah: {
    normal: "assets/audio/azan/madinah.mp3",
    fajr: "assets/audio/azan/madinah.mp3"
  },
  egypt: {
    normal: "assets/audio/azan/egypt.mp3",
    fajr: "assets/audio/azan/egypt.mp3"
  }
};

if (muadzinSelect) {
  muadzinSelect.onchange = () => {
    azanAudio.src = muadzinMap[muadzinSelect.value];
  };
  if (muadzinSelect && azanAudio) {
  const muadzin = muadzinSelect.value || "mishary";
  azanAudio.src = muadzinMap[muadzin].normal;
}
}

/* =========================
   NOTIFICATION PERMISSION
========================= */
if (notifBtn) {
  notifBtn.onclick = async () => {
    const perm = await Notification.requestPermission();
    notifBtn.textContent =
      perm === "granted" ? "✅ Notifikasi Aktif" : "❌ Ditolak";
  };
}


/* =========================
   LOAD PRAYER TIMES (API)
========================= */
loadPrayerTimes();

async function loadPrayerTimes() {
  try {
    const pos = await new Promise((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject)
    );

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const res = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=11`
    );
    const data = await res.json();
    const t = data.data.timings;
    // HIJRI DATE
const hijriEl = document.getElementById("hijri-date");
if (hijriEl) {
  const hijri = data.data.date.hijri;
  hijriEl.textContent =
    "📅 " +
    hijri.day +
    " " +
    hijri.month.en +
    " " +
    hijri.year +
    " H";

  // =========================
  // HITUNG HARI RAMADHAN
  // =========================
  if (hijri.month.en === "Ramadan") {
    const day = parseInt(hijri.day, 10);
    const ramadhanInfo = document.getElementById("ramadhan-day");

    if (ramadhanInfo) {
      ramadhanInfo.textContent = `Ramadhan hari ke-${day}`;
    }
  }
}
checkRamadhan();
    prayerTimes = {
      fajr:    t.Fajr.slice(0,5),
      dhuhr:   t.Dhuhr.slice(0,5),
      asr:     t.Asr.slice(0,5),
      maghrib: t.Maghrib.slice(0,5),
      isha:    t.Isha.slice(0,5)
    };

    Object.entries(prayerTimes).forEach(([name, time]) => {
      const el = document.getElementById(`time-${name}`);
      if (el) el.textContent = time;
    });

    const cityEl = document.getElementById("prayer-city");
if (cityEl) {
  cityEl.textContent =
    data.data.meta.timezone.replace("_", " ");
}

    updatePrayerUI();

  } catch {
    loadFallbackPrayerTimes();
  }
}

/* =========================
   FALLBACK
========================= */
function loadFallbackPrayerTimes() {
  prayerTimes = {
    fajr: "04:45",
    dhuhr: "12:03",
    asr: "15:26",
    maghrib: "18:12",
    isha: "19:25"
  };
  updatePrayerUI();
}

/* =========================
   UPDATE UI
========================= */
function updatePrayerUI() {
  Object.entries(prayerTimes).forEach(([name, time]) => {
    const el = document.getElementById(`time-${name}`);
    if (el) el.textContent = time;
  });

  // === TENTUKAN SHOLAT AKTIF ===
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let currentPrayer = "isya";

  const order = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

  for (let i = order.length - 1; i >= 0; i--) {
    const name = order[i];
    const time = prayerTimes[name];
    if (!time) continue;

    const [h, m] = time.split(":").map(Number);
    const prayerMinutes = h * 60 + m;

    if (currentMinutes >= prayerMinutes) {
      currentPrayer = name;
      break;
    }
  }

  setPrayerTheme(currentPrayer);
}

/* =========================
   HIGHLIGHT ACTIVE PRAYER
========================= */
function highlightActivePrayer() {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  let active = null;

  Object.entries(prayerTimes).forEach(([name, time]) => {
    const [h, m] = time.split(":").map(Number);
    if (nowMin >= h * 60 + m) active = name;
  });

  document.querySelectorAll(".prayer-item")
    .forEach(el => el.classList.remove("active"));

  const statusBox = document.getElementById("prayer-status");

  if (active) {
    document.getElementById(`prayer-${active}`)
      ?.classList.add("active");

    if (statusBox) {
      statusBox.textContent =
        "Sekarang " + active.toUpperCase();
      statusBox.classList.add("active");
    }
  }
}


/* =========================
   CLOCK + COUNTDOWN + AZAN
========================= */
function updateClockAndCountdown() {
  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();
  // SMART SILENT MODE (kecuali subuh)
const hour = now.getHours();
// =========================
// MODE SAHUR & BERBUKA
// =========================
document.body.classList.remove("sahur-mode", "iftar-mode");

if (hour >= 2 && hour < 5) {
  document.body.classList.add("sahur-mode");
}

if (hour >= 17 && hour < 19) {
  document.body.classList.add("iftar-mode");
}

if (azanAudio && !azanAudio.muted) {
  const savedVol = localStorage.getItem("azanVolume");

  if (!savedVol) {
    if (hour >= 21 || hour < 5) {
      azanAudio.volume = 0.35;
    } else {
      azanAudio.volume = 0.8;
    }
  }
}

  // CLOCK
  const clock = document.getElementById("current-clock");
  const time = document.getElementById("current-time");
  const date = document.getElementById("current-date");

  if (clock) {
    clock.textContent = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  if (time) {
    time.textContent = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  if (date) {
    date.textContent = now.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long"
    });
  }

  let nextName = null;
  let nextDiff = null;

  // =========================
// HITUNG IMSAK (10 menit sebelum subuh)
// =========================
let times = { ...prayerTimes };

// =========================
// TAMBAHKAN IMSAK
// =========================
if (prayerTimes.fajr) {
  const [fh, fm] = prayerTimes.fajr.split(":").map(Number);
  let imsakMin = fh * 60 + fm - 10;
  if (imsakMin < 0) imsakMin += 24 * 60;

  const ih = Math.floor(imsakMin / 60);
  const im = imsakMin % 60;

  times.imsak =
    String(ih).padStart(2, "0") +
    ":" +
    String(im).padStart(2, "0");
}

  Object.entries(times).forEach(([name, time]) => {
  const [h, m] = time.split(":").map(Number);

  let diff = (h * 60 + m) - nowMin;

  // kalau sudah lewat, hitung ke hari berikutnya
  if (diff < 0) diff += 24 * 60;

  if (
  nextName !== "imsak" && // jangan timpa kalau imsak masih aktif
  (nextDiff === null || diff < nextDiff)
) {
  nextDiff = diff;
  nextName = name;
}

  // 🔔 NOTIF SEBELUM AZAN
  const prayerMin = h * 60 + m;
  const diffBefore = prayerMin - nowMin;

  if (
    diffBefore === beforeMinutes &&
    !notifiedBefore[name] &&
    Notification.permission === "granted"
  ) {
    new Notification("Pengingat Sholat", {
      body: `${beforeMinutes} menit lagi masuk waktu ${name.toUpperCase()}`,
      icon: "assets/icons/mosque.png"
    });

    notifiedBefore[name] = true;
  }

  // 🔊 AZAN
  const diffReal = nowMin - prayerMin;

  if (
    diffReal >= 0 &&
    diffReal <= azanTolerance &&
    alarmEnabled &&
    azanEnabled &&
    lastPlayed !== name
  ) {

    lastPlayed = name;
      const muadzin = muadzinSelect?.value || "mishary";

      const src =
        name === "fajr"
          ? muadzinMap[muadzin].fajr
          : muadzinMap[muadzin].normal;

      if (azanAudio) {
  azanAudio.src = src;
  azanAudio.currentTime = 0;
  if (name === "fajr") {
    azanAudio.volume = 1; // subuh selalu full
  }
  azanAudio.play().catch(() => {});
}
setTimeout(() => {
  lastPlayed = null;
}, 60000);


      // 🔔 NOTIF MASUK WAKTU
      if (Notification.permission === "granted") {
        new Notification("Waktu Sholat", {
          body: `Telah masuk waktu ${name.toUpperCase()}`,
          icon: "assets/icons/mosque.png"
        });
      }
    }
  });

  // TEXT MENUJU SHOLAT
const nextEl = document.getElementById("next-prayer");
if (nextEl && nextName && nextDiff !== null) {

  let label = nextName.toUpperCase();

  if (nextName === "imsak") {
    label = "IMSAK";
    nextEl.classList.add("next-imsak");
  } 
  else if (nextName === "maghrib") {
    label = "BERBUKA";
    nextEl.classList.add("next-iftar");
  } 
  else {
    nextEl.classList.remove("next-imsak");
    nextEl.classList.remove("next-iftar");
  }

  nextEl.textContent =
    "Menuju " +
    label +
    " • " +
    Math.floor(nextDiff / 60) +
    "j " +
    (nextDiff % 60) +
    "m";
}

  /* ======================
     PROGRESS MENUJU SHOLAT
  ====================== */

  const progressFill = document.getElementById("prayer-progress-fill");
  const progressLabel = document.getElementById("progress-prayer-name");
  const progressPercent = document.getElementById("progress-percent");

  if (nextName && progressFill && progressLabel) {
    let prevTimeMin = null;

Object.entries(prayerTimes).forEach(([name, time]) => {
  const [h, m] = time.split(":").map(Number);
  const tMin = h * 60 + m;

  if (tMin <= nowMin) {
    if (prevTimeMin === null || tMin > prevTimeMin) {
      prevTimeMin = tMin;
    }
  }
});

// kalau belum ada sholat sebelumnya (misal setelah tengah malam)
if (prevTimeMin === null) {
  const times = Object.values(prayerTimes).map(t => {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + m;
  });
  prevTimeMin = Math.max(...times) - 1440; // ambil isya kemarin
}
    const nextTimeMin = nowMin + nextDiff;
    const totalRange = nextTimeMin - prevTimeMin;
    const passed = nowMin - prevTimeMin;

    let percent =
      totalRange > 0
        ? Math.min(100, Math.max(0, (passed / totalRange) * 100))
        : 0;

    progressFill.style.width = percent.toFixed(1) + "%";
    progressLabel.textContent = `Menuju ${nextName.toUpperCase()}`;
    progressPercent.textContent = `${percent.toFixed(0)}%`;
  }
}
/* =========================
   INTERVALS
========================= */
setInterval(() => {
  updateClockAndCountdown();
  highlightActivePrayer();
}, 1000);

// reset notif tiap tengah malam
setInterval(() => {
  const now = new Date();
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    notifiedBefore = {};
    lastPlayed = null;
  }
}, 60000);

const todayKey = new Date().toDateString();
const lastDay = localStorage.getItem("notifDay");

if (lastDay !== todayKey) {
  notifiedBefore = {};
  localStorage.setItem("notifDay", todayKey);
}

/* ======================
   AYAT HARI INI — PROFESSIONAL PLAYER
====================== */

const ayatList = [
  {
    global: 2,
    arab: "الم ذَٰلِكَ ٱلْكِتَـٰبُ لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
    arti: "Alif Lam Mim Kitab (Alquran) ini tidak ada keraguan padanya; petunjuk bagi mereka yang bertakwa."
  },
  {
    global: 3,
    arab: "َٱلَّذِينَ يُؤْمِنُونَ بِٱلْغَيْبِ وَيُقِيمُونَ ٱلصَّلَوٰةَ وَمِمَّا رَزَقْنَـٰهُمْ يُنفِقُونَ",
    arti: "(Yaitu) mereka yang beriman kepada yang gaib, melaksanakan salat, dan menginfakkan sebagian rezeki yang Kami berikan kepada mereka,"
  },
  {
    global: 4,
    arab: "وَٱلَّذِينَ يُؤْمِنُونَ بِمَآ أُنزِلَ إِلَيْكَ وَمَآ أُنزِلَ مِن قَبْلِكَ وَبِٱلْـَٔاخِرَةِ هُمْ يُوقِنُونَ",
    arti: "dan mereka beriman kepada (Alquran) yang diturunkan kepadamu (Muhammad) dan (kitab-kitab) yang telah diturunkan sebelum engkau, dan mereka yakin akan adanya akhirat."
  },
  {
    global: 5,
    arab: "أُو۟لَـٰٓئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ ۖ وَأُو۟لَـٰٓئِكَ هُمُ ٱلْمُفْلِحُونَ",
    arti: "Merekalah yang mendapat petunjuk dari Tuhannya, dan mereka itulah orang-orang yang beruntung."
  },
  {
    global: 6,
    arab: "إِنَّ ٱلَّذِينَ كَفَرُوا۟ سَوَآءٌ عَلَيْهِمْ ءَأَنذَرْتَهُمْ أَمْ لَمْ تُنذِرْهُمْ لَا يُؤْمِنُونَ",
    arti: "Sesungguhnya orang-orang kafir, sama saja bagi mereka, engkau (Muhammad) beri peringatan atau tidak engkau beri peringatan, mereka tidak akan beriman."
  }
];

const arabEl = document.getElementById("daily-ayah-arab");
const artiEl = document.getElementById("daily-ayah-arti");
const playBtn = document.getElementById("daily-ayah-play");
const stopBtn = document.getElementById("daily-ayah-stop");
const qariSelect = document.getElementById("qari-select");

let ayahAudio = new Audio();
ayahAudio.onerror = () => {
  console.error("Audio gagal dimuat:", ayahAudio.src);
};
let playerState = "stopped"; 
// states: playing | paused | stopped

if (arabEl && artiEl && playBtn && stopBtn && qariSelect) {

  const todayIndex = new Date().getDate() % ayatList.length;
  const ayat = ayatList[todayIndex];

  arabEl.textContent = ayat.arab;
  artiEl.textContent = ayat.arti;

function loadAudio() {
  const qari = qariSelect.value;

  if (qari === "mishary") {
    ayahAudio.src =
      "https://download.quranicaudio.com/quran/mishaari_raashid_al_3afaasee/002.mp3";
  }

  else if (qari === "sudais") {
    ayahAudio.src =
      "https://download.quranicaudio.com/quran/sodais_and_shuraim/002.mp3";
  }

  else if (qari === "maher") {
    ayahAudio.src =
      "https://download.quranicaudio.com/quran/salah_alhashim/002.mp3";
  }
}

  /* ======================
     PLAY / PAUSE TOGGLE
  ====================== */
  playBtn.onclick = () => {

    if (playerState === "stopped") {

      loadAudio();
      ayahAudio.play();

      playerState = "playing";
      playBtn.textContent = "⏸";

    } 
    else if (playerState === "playing") {

      ayahAudio.pause();

      playerState = "paused";
      playBtn.textContent = "▶";

    } 
    else if (playerState === "paused") {

      ayahAudio.play();

      playerState = "playing";
      playBtn.textContent = "⏸";
    }
  };

  /* ======================
     STOP BUTTON
  ====================== */
  stopBtn.onclick = () => {

    ayahAudio.pause();
    ayahAudio.currentTime = 0;

    playerState = "stopped";
    playBtn.textContent = "▶";
  };

  /* ======================
     RESET KALAU AUDIO SELESAI
  ====================== */
  ayahAudio.onended = () => {
    playerState = "stopped";
    playBtn.textContent = "▶";
  };

}

/* =========================
   MANUAL TEST AZAN
========================= */

const testBtn = document.getElementById("test-azan");
const azanStopBtn = document.getElementById("azan-stop");
const statusBox = document.getElementById("azan-status");

if (testBtn && azanAudio) {

  testBtn.onclick = () => {

    const muadzin = muadzinSelect?.value || "mishary";

    azanAudio.src = `assets/audio/azan/${muadzin}.mp3`;

    azanAudio.currentTime = 0;
    azanAudio.play();

    if (statusBox) {
      statusBox.textContent = "🔊 Azan manual diputar";
    }
  };
}

if (azanStopBtn && azanAudio) {

  azanStopBtn.onclick = () => {
    azanAudio.pause();
    azanAudio.currentTime = 0;

    if (statusBox) {
      statusBox.textContent = "⏹ Azan dihentikan";
    }
  };
}

if (location.hostname === "localhost") {
  document.querySelectorAll(".dev-only")
    .forEach(el => el.style.display = "block");
}

const settingsToggle = document.getElementById("settings-toggle");
const settingsPanel = document.getElementById("settings-panel");

if (settingsToggle && settingsPanel) {
  settingsToggle.onclick = () => {
    settingsPanel.classList.toggle("active");
  };
}

function setPrayerTheme(prayer) {
  const box = document.querySelector(".prayer-box");
  if (!box) return;

  box.className = "prayer-box";

  if (prayer === "fajr") box.classList.add("prayer-subuh");
  if (prayer === "dhuhr") box.classList.add("prayer-dzuhur");
  if (prayer === "asr") box.classList.add("prayer-ashar");
  if (prayer === "maghrib") box.classList.add("prayer-maghrib");
  if (prayer === "isha") box.classList.add("prayer-isya");
}

loadHomePrayerTimes();

async function loadHomePrayerTimes() {
  try {
    const pos = await new Promise((res, rej) =>
      navigator.geolocation.getCurrentPosition(res, rej)
    );

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;

    const res = await fetch(
      `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lon}&method=11`
    );

    const data = await res.json();
    const t = data.data.timings;

    document.getElementById("home-imsak").textContent =
      t.Imsak.slice(0, 5);
    document.getElementById("home-fajr").textContent =
      t.Fajr.slice(0, 5);
    document.getElementById("home-maghrib").textContent =
      t.Maghrib.slice(0, 5);

  } catch (e) {
    console.log("Widget gagal memuat lokasi");
  }
}

const openBtn = document.getElementById("open-quran");
const quranPopup = document.getElementById("quran-popup");
const closeBtn = document.getElementById("quran-close");
const quranBody = document.getElementById("quran-body");
const juzSelect = document.getElementById("juz-select");
const translationSelect = document.getElementById("translation-select");

let currentTranslation = 33; // default Indonesia

// isi juz dropdown
for (let i = 1; i <= 30; i++) {
  const opt = document.createElement("option");
  opt.value = i;
  opt.textContent = "Juz " + i;
  juzSelect.appendChild(opt);
}

// buka popup
openBtn.addEventListener("click", () => {
  quranPopup.classList.add("active");
  loadJuz(1);
});

// tutup popup
closeBtn.addEventListener("click", () => {
  quranPopup.classList.remove("active");
});

// ganti juz
juzSelect.addEventListener("change", () => {
  loadJuz(juzSelect.value);
});

// ganti bahasa
translationSelect.addEventListener("change", () => {
  currentTranslation = translationSelect.value;
  loadJuz(juzSelect.value);
});

// load juz dengan terjemahan
async function loadJuz(juzNumber) {
  quranBody.innerHTML = `<div class="loading">Memuat...</div>`;

  try {
    const res = await fetch(
      `https://api.quran.com/api/v4/quran/verses/uthmani?juz_number=${juzNumber}`
    );

    const data = await res.json();
    const verses = data.verses;

    // ambil terjemahan
    const transRes = await fetch(
      `https://api.quran.com/api/v4/quran/translations/${currentTranslation}?juz_number=${juzNumber}`
    );

    const transData = await transRes.json();
    const translations = transData.translations;

    quranBody.innerHTML = "";

    verses.forEach((verse, index) => {
      const div = document.createElement("div");
      div.classList.add("ayah");

      div.innerHTML = `
        <div class="ayah-number">
          ${verse.verse_key}
        </div>

        <div class="arab">
          ${verse.text_uthmani}
        </div>

        <div class="translation">
          ${translations[index].text}
        </div>
      `;

      quranBody.appendChild(div);
    });

  } catch (err) {
    quranBody.innerHTML = "Gagal memuat Qur'an.";
  }
}

// ================= POPUP CONTROL =================
document.getElementById("openTasbih").onclick = () =>
  document.getElementById("tasbihPopup").style.display = "flex";

document.getElementById("closeTasbih").onclick = () =>
  document.getElementById("tasbihPopup").style.display = "none";

document.getElementById("openKiblat").onclick = () =>
  document.getElementById("kiblatPopup").style.display = "flex";

document.getElementById("closeKiblat").onclick = () =>
  document.getElementById("kiblatPopup").style.display = "none";


// ================= TASBIH =================
let count = 0;
let mode = 0;

const dzikir = [
  { arab: "سُبْحَانَ اللَّهِ", arti: "Maha Suci Allah" },
  { arab: "الْحَمْدُ لِلَّهِ", arti: "Segala puji bagi Allah" },
  { arab: "اللَّهُ أَكْبَرُ", arti: "Allah Maha Besar" }
];

const tasbihText = document.getElementById("tasbihText");
const tasbihTranslation = document.getElementById("tasbihTranslation");
const tasbihCount = document.getElementById("tasbihCount");

document.getElementById("tasbihBtn").onclick = () => {
  count++;
  tasbihCount.innerText = count;

  if (count >= 33) {
    count = 0;
    mode++;
    if (mode >= dzikir.length) mode = 0;

    tasbihText.innerText = dzikir[mode].arab;
    tasbihTranslation.innerText = dzikir[mode].arti;
  }
};

document.getElementById("resetTasbih").onclick = () => {
  count = 0;
  mode = 0;
  tasbihCount.innerText = 0;
  tasbihText.innerText = dzikir[0].arab;
  tasbihTranslation.innerText = dzikir[0].arti;
};


// ================= KIBLAT =================
function getQiblaDirection(lat, lon) {
  const kaabaLat = 21.4225;
  const kaabaLon = 39.8262;

  const dLon = (kaabaLon - lon) * Math.PI / 180;
  const y = Math.sin(dLon) * Math.cos(kaabaLat * Math.PI / 180);
  const x =
    Math.cos(lat * Math.PI / 180) * Math.sin(kaabaLat * Math.PI / 180) -
    Math.sin(lat * Math.PI / 180) *
    Math.cos(kaabaLat * Math.PI / 180) *
    Math.cos(dLon);

  let brng = Math.atan2(y, x);
  brng = brng * 180 / Math.PI;
  return (brng + 360) % 360;
}

if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition((position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const qibla = getQiblaDirection(lat, lon);

    document.getElementById("kiblatDegree").innerText =
      "Derajat Kiblat: " + Math.round(qibla) + "°";

    window.addEventListener("deviceorientationabsolute", (event) => {
      if (event.alpha !== null) {
        const heading = event.alpha;
        const rotate = qibla - heading;
        document.getElementById("compass").style.transform =
          `rotate(${rotate}deg)`;
      }
    });
  });

}
