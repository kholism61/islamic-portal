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
  const mazhab = document.getElementById("mazhab")?.value || "syafii";

  const goldPrice = +document.getElementById("goldPrice").value || 1000000;

const nisabMaal = goldPrice * 85;
const nisabSaham = goldPrice * 85;
const nisabPerdagangan = goldPrice * 85;

/* =========================
   ZAKAT MAAL (FINAL FIXED)
========================== */

const cash = +document.getElementById("cash").value || 0;
const savings = +document.getElementById("savings").value || 0;
const gold = +document.getElementById("gold").value || 0;
const sukuk = +document.getElementById("sukuk")?.value || 0;
const reksadana = +document.getElementById("reksadana")?.value || 0;
const crypto = +document.getElementById("crypto")?.value || 0;
const sewaIncome = +document.getElementById("sewaIncome")?.value || 0;
const sewaExpense = +document.getElementById("sewaExpense")?.value || 0;

const sewaNet = sewaIncome - sewaExpense;

const receivable = +document.getElementById("receivable").value || 0;
const receivableType =
  document.getElementById("receivableType")?.value || "kuat";

const debt = +document.getElementById("debt").value || 0;

/* Piutang hanya dihitung kalau KUAT */
const adjustedReceivable =
  receivableType === "kuat"
    ? receivable
    : 0;

/* Total aset maal pribadi */
const maalAssets =
  cash +
  savings +
  gold +
  sukuk +
  reksadana +
  crypto +
  sewaNet +
  adjustedReceivable;

/* Dikurangi hutang jatuh tempo */
const maalNet = maalAssets - debt;

const maalLikuid = maalNet;

const haulMaal =
  document.getElementById("haulMaal")?.checked;

const zakatMaal =
 maalLikuid >= nisabMaal && haulMaal
    ? maalLikuid * 0.025
    : 0;

    /* =========================
   ZAKAT SAHAM (TERPISAH)
========================== */
const stocks = +document.getElementById("stocks")?.value || 0;
const stockType = document.getElementById("stockType")?.value || "trading";
const stockProfit = +document.getElementById("stockProfit")?.value || 0;

let sahamLikuid = 0;
let zakatSaham = 0;

if (stockType === "trading") {
  sahamLikuid = stocks;
}
else if (stockType === "produksi") {
  if (stockProfit >= nisabMaal) {
    zakatSaham = stockProfit * 0.025;
  }
}

const haulSaham =
  document.getElementById("haulSaham")?.checked;

const zakatSahamTrading =
  sahamLikuid >= nisabSaham && haulSaham
    ? sahamLikuid * 0.025
    : 0;

  /* =========================
     ZAKAT PENGHASILAN
  ========================== */

  const salary = +document.getElementById("salary").value || 0;
  const expenses = +document.getElementById("expenses").value || 0;

  const salaryNet = salary - expenses;

 const salaryMethod =
  document.getElementById("salaryMethod")?.value || "haul";

const haulSalary =
  document.getElementById("haulSalary")?.checked;

let zakatSalary = 0;

if (salaryMethod === "haul") {

  if (salaryNet >= nisabMaal && haulSalary) {
    zakatSalary = salaryNet * 0.025;
  }

} else if (salaryMethod === "monthly") {

  const nisabBulanan = nisabMaal / 12;

  if (salaryNet >= nisabBulanan) {
    zakatSalary = salaryNet * 0.025;
  }

}


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

 const usahaLikuid = businessNet;

 const haulPerdagangan =
  document.getElementById("haulPerdagangan")?.checked;

const zakatPerdagangan =
  usahaLikuid >= nisabPerdagangan && haulPerdagangan
    ? usahaLikuid * 0.025
    : 0;


    /* =========================
   ZAKAT PERUSAHAAN
========================== */

const companyCurrentAssets =
  +document.getElementById("companyCurrentAssets")?.value || 0;

const companyStock =
  +document.getElementById("companyStock")?.value || 0;

const companyReceivable =
  +document.getElementById("companyReceivable")?.value || 0;

const companyDebt =
  +document.getElementById("companyDebt")?.value || 0;

const haulCompany =
  document.getElementById("haulCompany")?.checked;

const companyNet =
  companyCurrentAssets +
  companyStock +
  companyReceivable -
  companyDebt;

const zakatCompany =
  companyNet >= nisabPerdagangan && haulCompany
    ? companyNet * 0.025
    : 0;



  /* =========================
     ZAKAT EMAS
  ========================== */

  const emasGram =
    +document.getElementById("emas-gram").value || 0;

  const emasHarga =
    +document.getElementById("emas-harga").value || 0;

    const emasDipakai = document.getElementById("emasDipakai")?.checked;

  const emasTotal = emasGram * emasHarga;
  const emasNisab = 85 * emasHarga;

  let zakatEmas = 0;

if (mazhab === "hanafi") {
  // tetap wajib walau dipakai
  if (emasTotal >= emasNisab) {
    zakatEmas = emasTotal * 0.025;
  }
} else {
  // Syafi’i dll -> tidak wajib jika dipakai
  if (!emasDipakai && emasTotal >= emasNisab) {
    zakatEmas = emasTotal * 0.025;
  }
}

  /* =========================
     ZAKAT FITRAH
  ========================== */

  const fitrahJumlah =
    +document.getElementById("fitrah-jumlah").value || 0;

  const fitrahHarga =
    +document.getElementById("fitrah-harga").value || 0;

  let zakatFitrah = 0;

if (mazhab === "hanafi") {
  // boleh uang
  zakatFitrah = fitrahJumlah * 2.5 * fitrahHarga;
} else {
  // selain hanafi -> tetap makanan (info saja)
  zakatFitrah = fitrahJumlah * 2.5 * fitrahHarga;
}

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
   ZAKAT PETERNAKAN (FULL FIQH FINAL)
========================== */

const goatCount =
  +document.getElementById("goatCount")?.value || 0;

const cowCount =
  +document.getElementById("cowCount")?.value || 0;

const camelCount =
  +document.getElementById("camelCount")?.value || 0;

/* ===== SYARAT WAJIB ===== */

const haulTernak =
  document.getElementById("haulTernak")?.checked;

const ternakGembala =
  document.getElementById("ternakGembala")?.checked;

const ternakBukanKerja =
  document.getElementById("ternakBukanKerja")?.checked;

let zakatGoat = "Tidak wajib";
let zakatCow = "Tidak wajib";
let zakatCamel = "Tidak wajib";

/* Jika syarat tidak terpenuhi */
if (!haulTernak || !ternakGembala || !ternakBukanKerja) {

  zakatGoat = "Tidak wajib (syarat belum terpenuhi)";
  zakatCow = "Tidak wajib (syarat belum terpenuhi)";
  zakatCamel = "Tidak wajib (syarat belum terpenuhi)";

} else {

  /* =====================
     KAMBING / DOMBA
  ===================== */

  if (goatCount >= 40 && goatCount <= 120) {
    zakatGoat = "1 ekor kambing";
  } 
  else if (goatCount >= 121 && goatCount <= 200) {
    zakatGoat = "2 ekor kambing";
  } 
  else if (goatCount >= 201 && goatCount <= 300) {
    zakatGoat = "3 ekor kambing";
  } 
  else if (goatCount > 300) {
    zakatGoat =
      Math.floor(goatCount / 100) + " ekor kambing";
  }

  /* =====================
     SAPI
  ===================== */

  if (cowCount >= 30) {

    let remaining = cowCount;
    let tabi = 0;       // 30 ekor
    let musinnah = 0;   // 40 ekor

    /* Cari kombinasi optimal */
    while (remaining >= 30) {

      if (remaining >= 40 && (remaining - 40) % 30 !== 10) {
        musinnah++;
        remaining -= 40;
      } else {
        tabi++;
        remaining -= 30;
      }

      if (remaining < 30) break;
    }

    if (tabi > 0 || musinnah > 0) {
      zakatCow = "";
      if (tabi > 0)
        zakatCow += tabi + " tabi’ (1 th) ";
      if (musinnah > 0)
        zakatCow += musinnah + " musinnah (2 th)";
    }
  }

  /* =====================
     UNTA
  ===================== */

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

  let bestHiqqah = 0;
  let bestBintuLabun = 0;
  let smallestRemainder = camelCount;

  for (let hiqqah = 0; hiqqah <= Math.floor(camelCount / 50); hiqqah++) {

    for (let bintuLabun = 0; bintuLabun <= Math.floor(camelCount / 40); bintuLabun++) {

      const total = (hiqqah * 50) + (bintuLabun * 40);

      if (total <= camelCount) {

        const remainder = camelCount - total;

        if (remainder < smallestRemainder) {
          smallestRemainder = remainder;
          bestHiqqah = hiqqah;
          bestBintuLabun = bintuLabun;
        }

        if (remainder === 0) break;
      }
    }
  }

  zakatCamel = "";

  if (bestHiqqah > 0) {
    zakatCamel += bestHiqqah + " hiqqah ";
  }

  if (bestBintuLabun > 0) {
    zakatCamel += bestBintuLabun + " bintu labun";
  }

}

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

let zakatMadin = 0;

if (mazhab === "hanafi") {
  zakatMadin = madin * 0.20;
} else {
  zakatMadin = madin * 0.025;
}

  /* =========================
     TOTAL
  ========================== */

const totalZakat =
  zakatMaal +
  zakatSahamTrading +
  zakatPerdagangan +
  zakatSaham +
  zakatSalary +
  zakatEmas +
  zakatFitrah +
  zakatHarvest +
  zakatRikaz +
  zakatMadin +
  zakatCompany;


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
   <p><strong>Nisab Emas (85gr):</strong> ${rupiah(nisabMaal)}</p>
    <hr>

   <p>Zakat Maal: ${rupiah(zakatMaal)}</p>
<p>Zakat Saham Trading: ${rupiah(zakatSahamTrading)}</p>
<p>Zakat Perdagangan: ${rupiah(zakatPerdagangan)}</p>
<p>Zakat Saham Produksi: ${rupiah(zakatSaham)}</p>
    <p>Zakat Penghasilan: ${rupiah(zakatSalary)}</p>
    <p>Zakat Emas: ${rupiah(zakatEmas)}</p>
    <p>Zakat Fitrah: ${rupiah(zakatFitrah)}</p>
    <p>Zakat Pertanian: ${rupiah(zakatHarvest)}</p>
    <p>Zakat Rikaz: ${rupiah(zakatRikaz)}</p>
    <p>Zakat Barang Tambang: ${rupiah(zakatMadin)}</p>
    <p>Zakat Perusahaan: ${rupiah(zakatCompany)}</p>

   <hr>

<p><strong>Zakat Kambing:</strong> ${zakatGoat}</p>
<p><strong>Zakat Sapi:</strong> ${zakatCow}</p>
<p><strong>Zakat Unta:</strong> ${zakatCamel}</p>
<button onclick="showTernakInfo()" class="info-btn">
  Lihat Penjelasan Istilah
</button>

<hr>

    <h3>Total Zakat Uang: ${rupiah(totalZakat)}</h3>
  `;


  /* =========================
     UPDATE CHART
  ========================== */

 drawZakatChart({
  maal: zakatMaal,
  sahamTrading: zakatSahamTrading,
  perdagangan: zakatPerdagangan,
  sahamProduksi: zakatSaham,
  salary: zakatSalary,
  emas: zakatEmas,
  fitrah: zakatFitrah,
  harvest: zakatHarvest,
  rikaz: zakatRikaz,
  madin: zakatMadin,
  company: zakatCompany
});

  drawLivestockChart(goatCount, cowCount, camelCount);
  if (totalZakat > 0) {
  saveMonthlyHistory(totalZakat);
}
drawMonthlyHistory();
  drawHistoryChart();
}


function drawZakatChart(data) {
  const ctx = document.getElementById("zakatChart");
  if (!ctx) return;

  if (zakatChartInstance) {
    zakatChartInstance.destroy();
  }

  const rawData = [
  data.maal || 0,
  data.sahamTrading || 0,
  data.perdagangan || 0,
  data.sahamProduksi || 0,
  data.salary || 0,
  data.emas || 0,
  data.fitrah || 0,
  data.harvest || 0,
  data.rikaz || 0,
  data.madin || 0,
  data.company || 0
];

  const total = rawData.reduce((a, b) => a + b, 0);

  const percentData = rawData.map(v =>
    total > 0 ? (v / total * 100) : 0
  );

  zakatChartInstance = new Chart(ctx, {
    type: "doughnut",
    data: {
     labels: [
  "Zakat Maal",
  "Saham Trading",
  "Perdagangan",
  "Saham Produksi",
  "Penghasilan",
  "Emas",
  "Fitrah",
  "Pertanian",
  "Rikaz",
  "Barang Tambang",
  "Perusahaan"
],
      datasets: [{
        data: percentData
      }]
    },
    options: {
      plugins: {
        legend: {
          position: "bottom"
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ": " + context.parsed.toFixed(2) + "%";
            }
          }
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

  // ==============================
  // LOGIN CHECK
  // ==============================
  const user = localStorage.getItem("user");
  const nameEl = document.getElementById("user-name");
  const loggedOutEl = document.getElementById("user-logged-out");
  const loggedInEl = document.getElementById("user-logged-in");
  const zakatAppEl = document.getElementById("zakat-app");

  if (user) {
    const data = JSON.parse(user);
    if (nameEl) nameEl.textContent = data.name;
    if (loggedOutEl) loggedOutEl.style.display = "none";
    if (loggedInEl) loggedInEl.style.display = "block";
    if (zakatAppEl) zakatAppEl.style.display = "block";
  } else {
    if (loggedOutEl) loggedOutEl.style.display = "block";
    if (loggedInEl) loggedInEl.style.display = "none";
    if (zakatAppEl) zakatAppEl.style.display = "none";
  }

  // ==============================
  // SAHAM UI LOGIC
  // ==============================

  const stockTypeSelect = document.getElementById("stockType");
  const stockProfitSection = document.getElementById("stock-profit-section");
  const haulWrapper = document.getElementById("haulSahamWrapper");

  function updateStockUI() {
    if (!stockTypeSelect) return;

    if (stockTypeSelect.value === "trading") {
      if (stockProfitSection) stockProfitSection.style.display = "none";
      if (haulWrapper) haulWrapper.style.display = "flex";
    } else {
      if (stockProfitSection) stockProfitSection.style.display = "block";
      if (haulWrapper) haulWrapper.style.display = "none";
    }
  }

  if (stockTypeSelect) {
    stockTypeSelect.addEventListener("change", updateStockUI);
  }

  updateStockUI(); // jalankan saat pertama load

  const salaryMethodSelect = document.getElementById("salaryMethod");
const haulSalaryWrapper = document.getElementById("haulSalaryWrapper");

function updateSalaryUI() {
  if (!salaryMethodSelect || !haulSalaryWrapper) return;

  if (salaryMethodSelect.value === "monthly") {
    haulSalaryWrapper.style.display = "none";
  } else {
    haulSalaryWrapper.style.display = "flex";
  }
}

if (salaryMethodSelect) {
  salaryMethodSelect.addEventListener("change", updateSalaryUI);
}

updateSalaryUI();

});

function showTernakInfo() {

  const content = `
    <p><strong>Bintu makhadh</strong>: Unta betina usia 1 tahun.</p>
    <p><strong>Bintu labun</strong>: Unta betina usia 2 tahun.</p>
    <p><strong>Hiqqah</strong>: Unta betina usia 3 tahun.</p>
    <p><strong>Jadza’ah</strong>: Unta betina usia 4 tahun.</p>
    <p><strong>Tabi’</strong>: Sapi usia 1 tahun.</p>
    <p><strong>Musinnah</strong>: Sapi usia 2 tahun.</p>
    <hr>
    <small>Berdasarkan ketentuan zakat ternak dalam hadits Nabi ﷺ dan fiqh klasik.</small>
  `;

  document.getElementById("ternakModalContent").innerHTML = content;
  document.getElementById("ternakModal").style.display = "block";
}

function closeTernakInfo() {
  document.getElementById("ternakModal").style.display = "none";
}