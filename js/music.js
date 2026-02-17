/* =========================
   BACKGROUND MUSIC — FINAL
========================= */

document.addEventListener("DOMContentLoaded", () => {
  const audio = document.getElementById("bgMusic");
  const toggle = document.getElementById("musicToggle");
  if (!audio || !toggle) return;

  /* =========================
     PLAYLIST
  ========================= */
const playlistLight = [
  "https://download.quranicaudio.com/quran/ibrahim_al_akhdar/003.mp3",
  "https://download.quranicaudio.com/quran/abu_bakr_ash-shatri_tarawee7/004.mp3",
  "https://download.quranicaudio.com/quran/ali_jaber/005.mp3"
];

const playlistDark = [
  "https://download.quranicaudio.com/quran/sodais_and_shuraim/004.mp3",
  "https://download.quranicaudio.com/quran/maher_almu3aiqly/year1440/005.mp3",
  "https://download.quranicaudio.com/quran/maher_almu3aiqly/year1440/028.mp3",
  "https://download.quranicaudio.com/quran/yasser_ad-dussary/016.mp3"
];

  /* =========================
     STATE
  ========================= */
  let isPlaying = localStorage.getItem("musicPlaying") === "true";
  let lastTime = parseFloat(localStorage.getItem("musicTime")) || 0;

  /* =========================
     PICK RANDOM SONG
  ========================= */
  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  /* =========================
     LOAD SONG BASED ON MODE
  ========================= */
  function loadSong() {
    const isDark = document.body.classList.contains("dark");
    const list = isDark ? playlistDark : playlistLight;

    const src = pickRandom(list);
    audio.src = src;
    audio.loop = true;

    if (lastTime > 0) {
      audio.currentTime = lastTime;
    }
  }

  /* =========================
     PLAY / PAUSE
  ========================= */
  function playMusic() {
    audio.play().catch(() => {});
    toggle.textContent = "⏸";
    isPlaying = true;
    localStorage.setItem("musicPlaying", "true");
  }

  function pauseMusic() {
    audio.pause();
    toggle.textContent = "🎵";
    isPlaying = false;
    localStorage.setItem("musicPlaying", "false");
  }

  /* =========================
     BUTTON CLICK
  ========================= */
  toggle.addEventListener("click", () => {
    isPlaying ? pauseMusic() : playMusic();
  });

  /* =========================
     SAVE TIME
  ========================= */
  audio.addEventListener("timeupdate", () => {
    localStorage.setItem("musicTime", audio.currentTime.toString());
  });

  /* =========================
     DARK MODE CHANGE DETECT
  ========================= */
  const observer = new MutationObserver(() => {
    const wasPlaying = isPlaying;
    pauseMusic();
    loadSong();
    if (wasPlaying) playMusic();
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });

  /* =========================
     INIT
  ========================= */
  loadSong();
  if (isPlaying) playMusic();
});


