 /* =========================
   GLOBAL STATE
========================= */
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
}

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

  highlightActivePrayer();
  updateClockAndCountdown();
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

  Object.entries(prayerTimes).forEach(([name, time]) => {
  const [h, m] = time.split(":").map(Number);

  let diff = (h * 60 + m) - nowMin;

  // kalau sudah lewat, hitung ke hari berikutnya
  if (diff < 0) diff += 24 * 60;

  if (nextDiff === null || diff < nextDiff) {
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

      lastPlayed = name;

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
    nextEl.textContent =
      "Menuju " +
      nextName.toUpperCase() +
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
    arab: "الم",
    arti: "Alif Lam Mim."
  },
  {
    global: 3,
    arab: "ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ",
    arti: "Kitab ini tidak ada keraguan padanya; petunjuk bagi orang bertakwa."
  },
  {
    global: 4,
    arab: "الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ...",
    arti: "Yaitu mereka yang beriman kepada yang gaib..."
  },
  {
    global: 5,
    arab: "وَالَّذِينَ يُؤْمِنُونَ بِمَا أُنزِلَ إِلَيْكَ...",
    arti: "Dan mereka yang beriman kepada apa yang diturunkan kepadamu..."
  },
  {
    global: 6,
    arab: "أُولَٰئِكَ عَلَىٰ هُدًى مِّن رَّبِّهِمْ...",
    arti: "Mereka itulah yang mendapat petunjuk dari Tuhannya..."
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