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

let zakatChartInstance = null;
let historyChartInstance = null;
let livestockChartInstance = null;


function rupiah(num) {
  return "Rp" + Math.round(num).toLocaleString("id-ID");
}

function drawHistoryChart() {
  const canvas = document.getElementById("historyChart");
  if (!canvas) return;

  let history;

  try {
    const userData = JSON.parse(localStorage.getItem("user"));
if (!userData) return;

const key = "zakatHistory_" + userData.email;

history = JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    history = [];
  }

  if (!Array.isArray(history) || history.length === 0) return;

  const yearly = {};

  history.forEach(item => {
    const date = new Date(item.date);
    const year = date.getFullYear();

    const value = Number(item.amount || item.total || 0);

    if (!yearly[year]) yearly[year] = 0;
    yearly[year] += value;
  });

  const labels = Object.keys(yearly);
  const data = Object.values(yearly);

  if (historyChartInstance) {
    historyChartInstance.destroy();
  }

  historyChartInstance = new Chart(canvas, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Total Zakat per Tahun",
        data: data,
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

function calculateAllZakat() {

  const goldPrice =
    +document.getElementById("goldPrice").value || 1000000;

  const nisab = goldPrice * 85;


  /* =========================
     ZAKAT MAAL (TANPA SAHAM)
  ========================== */

  const cash = +document.getElementById("cash").value || 0;
  const savings = +document.getElementById("savings").value || 0;
  const gold = +document.getElementById("gold").value || 0;
  const invest = +document.getElementById("invest").value || 0;

  const receivable = +document.getElementById("receivable").value || 0;
  const receivableType =
    document.getElementById("receivableType")?.value || "kuat";

  const debt = +document.getElementById("debt").value || 0;

  const adjustedReceivable =
    receivableType === "kuat" ? receivable : 0;

  const maalAssets =
    cash +
    savings +
    gold +
    invest +
    adjustedReceivable;

  const maalNet = maalAssets - debt;

  const zakatMaal =
    maalNet >= nisab
      ? maalNet * 0.025
      : 0;


  /* =========================
     ZAKAT SAHAM / INVESTASI
  ========================== */

  const stocks = +document.getElementById("stocks")?.value || 0;
  const bonds = +document.getElementById("bonds")?.value || 0;
  const funds = +document.getElementById("funds")?.value || 0;

  const totalInvest = stocks + bonds + funds;

  const zakatSaham =
    totalInvest >= nisab
      ? totalInvest * 0.025
      : 0;


  /* =========================
     ZAKAT PENGHASILAN
  ========================== */

  const salary = +document.getElementById("salary").value || 0;
  const expenses = +document.getElementById("expenses").value || 0;

  const salaryNet = salary - expenses;

  const zakatSalary =
    salaryNet >= nisab / 12
      ? salaryNet * 0.025
      : 0;


  /* =========================
     ZAKAT PERDAGANGAN
  ========================== */

  const capital = +document.getElementById("capital").value || 0;
  const profit = +document.getElementById("profit").value || 0;
  const stock = +document.getElementById("stock").value || 0;
  const businessReceivable =
    +document.getElementById("businessReceivable").value || 0;
  const businessDebt =
    +document.getElementById("businessDebt").value || 0;

  const businessNet =
    capital +
    profit +
    stock +
    businessReceivable -
    businessDebt;

  const zakatBusiness =
    businessNet >= nisab
      ? businessNet * 0.025
      : 0;


  /* =========================
     ZAKAT EMAS
  ========================== */

  const emasGram =
    +document.getElementById("emas-gram").value || 0;

  const emasHarga =
    +document.getElementById("emas-harga").value || 0;

  const emasTotal = emasGram * emasHarga;
  const emasNisab = 85 * emasHarga;

  const zakatEmas =
    emasTotal >= emasNisab
      ? emasTotal * 0.025
      : 0;


  /* =========================
     ZAKAT FITRAH
  ========================== */

  const fitrahJumlah =
    +document.getElementById("fitrah-jumlah").value || 0;

  const fitrahHarga =
    +document.getElementById("fitrah-harga").value || 0;

  const zakatFitrah =
    fitrahJumlah * 2.5 * fitrahHarga;


  /* =========================
     ZAKAT PERTANIAN
  ========================== */

  const harvest =
    +document.getElementById("harvest")?.value || 0;

  const harvestPrice =
    +document.getElementById("harvestPrice")?.value || 0;

  const irrigationRate =
    +document.getElementById("irrigationType")?.value || 10;

  const nisabHarvest = 653;

  let zakatHarvest = 0;

  if (harvest >= nisabHarvest) {
    const totalValue = harvest * harvestPrice;
    zakatHarvest =
      totalValue * (irrigationRate / 100);
  }


 /* =========================
   ZAKAT PETERNAKAN (FIQH FIX)
========================== */

const goatCount =
  +document.getElementById("goatCount")?.value || 0;

const cowCount =
  +document.getElementById("cowCount")?.value || 0;

const camelCount =
  +document.getElementById("camelCount")?.value || 0;


/* ===== KAMBING ===== */

let zakatGoat = "Tidak wajib";

if (goatCount >= 40 && goatCount <= 120) {
  zakatGoat = "1 ekor kambing";
} else if (goatCount >= 121 && goatCount <= 200) {
  zakatGoat = "2 ekor kambing";
} else if (goatCount >= 201 && goatCount <= 300) {
  zakatGoat = "3 ekor kambing";
} else if (goatCount > 300) {
  zakatGoat =
    Math.floor(goatCount / 100) + " ekor kambing";
}


/* ===== SAPI ===== */

let zakatCow = "Tidak wajib";

if (cowCount >= 30) {

  let remaining = cowCount;
  let tabi = 0;
  let musinnah = 0;

  while (remaining >= 40) {
    if (remaining % 40 === 0 || remaining - 40 >= 30) {
      musinnah++;
      remaining -= 40;
    } else {
      break;
    }
  }

  while (remaining >= 30) {
    tabi++;
    remaining -= 30;
  }

  if (tabi > 0 || musinnah > 0) {
    zakatCow = "";
    if (tabi > 0)
      zakatCow += tabi + " tabi’ (1 th) ";
    if (musinnah > 0)
      zakatCow += musinnah + " musinnah (2 th)";
  }
}


/* ===== UNTA ===== */

/* ===== UNTA (FIXED FIQH) ===== */

let zakatCamel = "Tidak wajib";

if (camelCount >= 5 && camelCount <= 9) {
  zakatCamel = "1 kambing";
}
else if (camelCount >= 10 && camelCount <= 14) {
  zakatCamel = "2 kambing";
}
else if (camelCount >= 15 && camelCount <= 19) {
  zakatCamel = "3 kambing";
}
else if (camelCount >= 20 && camelCount <= 24) {
  zakatCamel = "4 kambing";
}
else if (camelCount >= 25 && camelCount <= 35) {
  zakatCamel = "1 bintu makhadh (1 th)";
}
else if (camelCount >= 36 && camelCount <= 45) {
  zakatCamel = "1 bintu labun (2 th)";
}
else if (camelCount >= 46 && camelCount <= 60) {
  zakatCamel = "1 hiqqah (3 th)";
}
else if (camelCount >= 61 && camelCount <= 75) {
  zakatCamel = "1 jadza’ah (4 th)";
}
else if (camelCount >= 76 && camelCount <= 90) {
  zakatCamel = "2 bintu labun";
}
else if (camelCount >= 91 && camelCount <= 120) {
  zakatCamel = "2 hiqqah";
}
else if (camelCount > 120) {

  let remaining = camelCount;
  let hiqqah = 0;
  let bintuLabun = 0;

  while (remaining >= 50) {
    hiqqah++;
    remaining -= 50;
  }

  while (remaining >= 40) {
    bintuLabun++;
    remaining -= 40;
  }

  zakatCamel =
    hiqqah + " hiqqah + " +
    bintuLabun + " bintu labun";
}

/* =========================
   ZAKAT RIKAZ
========================== */

const rikaz =
  +document.getElementById("rikaz")?.value || 0;

const zakatRikaz =
  rikaz > 0
    ? rikaz * 0.20
    : 0;

    /* =========================
   ZAKAT BARANG TAMBANG
========================== */

const madin =
  +document.getElementById("madin")?.value || 0;

const madinMazhab =
  document.getElementById("madinMazhab")?.value || "025";

let zakatMadin = 0;

if (madinMazhab === "20") {
  zakatMadin = madin * 0.20;
} else {
  zakatMadin = madin * 0.025;
}


  /* =========================
     TOTAL
  ========================== */

 const totalZakat =
  zakatMaal +
  zakatSaham +
  zakatSalary +
  zakatBusiness +
  zakatFitrah +
  zakatEmas +
  zakatHarvest +
  zakatRikaz +
  zakatMadin;


/* =========================
   SIMPAN RIWAYAT USER
========================== */

const userData = JSON.parse(localStorage.getItem("user"));

if (userData) {
  const key = "zakatHistory_" + userData.email;
  const history = JSON.parse(localStorage.getItem(key)) || [];

  history.push({
    amount: totalZakat,
    date: new Date().toISOString()
  });

  localStorage.setItem(key, JSON.stringify(history));
}

  /* =========================
     OUTPUT
  ========================== */

  document.getElementById("zakat-result").innerHTML = `
    <h3>Hasil Perhitungan Zakat</h3>
    <p><strong>Nisab:</strong> ${rupiah(nisab)}</p>
    <hr>

    <p>Zakat Maal: ${rupiah(zakatMaal)}</p>
    <p>Zakat Saham / Investasi: ${rupiah(zakatSaham)}</p>
    <p>Zakat Penghasilan: ${rupiah(zakatSalary)}</p>
    <p>Zakat Perdagangan: ${rupiah(zakatBusiness)}</p>
    <p>Zakat Emas: ${rupiah(zakatEmas)}</p>
    <p>Zakat Fitrah: ${rupiah(zakatFitrah)}</p>
    <p>Zakat Pertanian: ${rupiah(zakatHarvest)}</p>
    <p>Zakat Rikaz: ${rupiah(zakatRikaz)}</p>
    <p>Zakat Barang Tambang: ${rupiah(zakatMadin)}</p>

   <hr>

<p><strong>Zakat Kambing:</strong> ${zakatGoat}</p>
<p><strong>Zakat Sapi:</strong> ${zakatCow}</p>
<p><strong>Zakat Unta:</strong> ${zakatCamel}</p>

<hr>

    <h3>Total Zakat Uang: ${rupiah(totalZakat)}</h3>
  `;


  /* =========================
     UPDATE CHART
  ========================== */

 drawZakatChart({
  maal: zakatMaal,
  saham: zakatSaham,
  salary: zakatSalary,
  business: zakatBusiness,
  emas: zakatEmas,
  fitrah: zakatFitrah,
  harvest: zakatHarvest,
  rikaz: zakatRikaz,
  madin: zakatMadin
});

  drawLivestockChart(goatCount, cowCount, camelCount);
  saveMonthlyHistory(totalZakat);
  drawMonthlyHistory();
  drawHistoryChart();
}


function drawZakatChart(data) {
  const ctx = document.getElementById("zakatChart");
  if (!ctx) return;

  if (zakatChartInstance) {
    zakatChartInstance.destroy();
  }

  zakatChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: [
  "Maal",
  "Saham",
  "Penghasilan",
  "Perdagangan",
  "Emas",
  "Fitrah",
  "Pertanian",
  "Rikaz",
  "Barang Tambang"
],
      datasets: [{
        data: [
  data.maal,
  data.saham,
  data.salary,
  data.business,
  data.emas,
  data.fitrah,
  data.harvest,
  data.rikaz || 0,
  data.madin || 0
]
      }]
    },
    options: {
      plugins: {
        legend: {
          position: "bottom"
        }
      }
    }
  });
}

function drawLivestockChart(goatCount, cowCount, camelCount) {
  const ctx = document.getElementById("livestockChart");
  if (!ctx) return;

  if (livestockChartInstance) {
    livestockChartInstance.destroy();
    livestockChartInstance = null;
  }

  livestockChartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["Kambing", "Sapi", "Unta"],
      datasets: [{
        label: "Jumlah Ternak",
        data: [
          Number(goatCount) || 0,
          Number(cowCount) || 0,
          Number(camelCount) || 0
        ]
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  });
}

/* Load history saat halaman dibuka */
document.addEventListener("DOMContentLoaded", drawHistoryChart);


const mazhabSelect = document.getElementById("mazhab");
const mazhabInfo = document.getElementById("mazhab-info");

if (mazhabSelect) {
  mazhabSelect.addEventListener("change", () => {
    const value = mazhabSelect.value;

    let text = "";

    if (value === "syafii") {
      text = "Menggunakan standar umum zakat sesuai praktik mazhab Syafi’i.";
    } else if (value === "hanafi") {
      text = "Mazhab Hanafi: lebih luas dalam perhitungan harta dan zakat fitrah boleh dengan uang.";
    } else if (value === "maliki") {
      text = "Mazhab Maliki: menekankan kepemilikan penuh dan kestabilan harta sebelum zakat.";
    } else if (value === "hanbali") {
      text = "Mazhab Hanbali: mirip dengan Syafi’i, dengan beberapa perbedaan dalam detail harta.";
    }

    mazhabInfo.textContent = text;
  });
}

const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;

    tabButtons.forEach(b => b.classList.remove("active"));
    tabContents.forEach(c => c.classList.remove("active"));

    btn.classList.add("active");
    document.getElementById("tab-" + target).classList.add("active");
  });
});

/* =====================
   LOGIN USER (SAFE)
===================== */

function sanitizeName(name) {
  // hanya huruf, angka, spasi
  return name
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .slice(0, 25);
}

function loadUser() {
  const user = localStorage.getItem("user");

  const out = document.getElementById("user-logged-out");
  const inn = document.getElementById("user-logged-in");
  const app = document.getElementById("zakat-app");

  if (!out || !inn) return;

  if (!user) {
    out.style.display = "block";
    inn.style.display = "none";
    if (app) app.style.display = "none";
    return;
  }

  const data = JSON.parse(user);

  out.style.display = "none";
  inn.style.display = "block";
  if (app) app.style.display = "block";

  const nameEl = document.getElementById("user-name");
  if (nameEl) nameEl.textContent = data.name;
}

/* =====================
   RIWAYAT BULANAN
===================== */

function saveMonthlyHistory(total) {
  const date = new Date();
  const key = date.getFullYear() + "-" + (date.getMonth() + 1);

  let history =
    JSON.parse(localStorage.getItem("zakatMonthly")) || {};

  history[key] = (history[key] || 0) + total;

  localStorage.setItem("zakatMonthly", JSON.stringify(history));
  drawMonthlyHistory();
}

function drawMonthlyHistory() {
  const list = document.getElementById("monthly-history");
  if (!list) return;

  const history =
    JSON.parse(localStorage.getItem("zakatMonthly")) || {};

  list.innerHTML = "";

  Object.keys(history)
    .sort()
    .reverse()
    .forEach(key => {
      const li = document.createElement("li");
      li.textContent =
        key + " — " + rupiah(history[key]);
      list.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", () => {
  loadUser();
  drawMonthlyHistory();
});


function handleCredentialResponse(response) {
  const data = parseJwt(response.credential);

  const user = {
    name: data.name,
    email: data.email,
    picture: data.picture
  };

  localStorage.setItem("user", JSON.stringify(user));

  // reload agar UI update
  location.reload();
}


function parseJwt(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split('')
      .map(c =>
        '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      )
      .join('')
  );

  return JSON.parse(jsonPayload);
}

function logoutUser() {
  // hapus data user
  localStorage.removeItem("user");

  // tampilkan kembali layar login
  document.getElementById("user-logged-out").style.display = "block";

  // sembunyikan tampilan user login
  document.getElementById("user-logged-in").style.display = "none";

  // sembunyikan kalkulator
  document.getElementById("zakat-app").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  const user = localStorage.getItem("user");

  if (user) {
    const data = JSON.parse(user);

    const nameEl = document.getElementById("user-name");
    const loggedOutEl = document.getElementById("user-logged-out");
    const loggedInEl = document.getElementById("user-logged-in");
    const zakatAppEl = document.getElementById("zakat-app");

    if (nameEl) nameEl.textContent = data.name;
    if (loggedOutEl) loggedOutEl.style.display = "none";
    if (loggedInEl) loggedInEl.style.display = "block";
    if (zakatAppEl) zakatAppEl.style.display = "block";

  } else {
    const loggedOutEl = document.getElementById("user-logged-out");
    const loggedInEl = document.getElementById("user-logged-in");
    const zakatAppEl = document.getElementById("zakat-app");

    if (loggedOutEl) loggedOutEl.style.display = "block";
    if (loggedInEl) loggedInEl.style.display = "none";
    if (zakatAppEl) zakatAppEl.style.display = "none";
  }
});