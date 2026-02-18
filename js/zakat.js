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

  /* ZAKAT MAAL */
  const cash = +document.getElementById("cash").value || 0;
  const savings = +document.getElementById("savings").value || 0;
  const gold = +document.getElementById("gold").value || 0;
  const invest = +document.getElementById("invest").value || 0;
  const receivable = +document.getElementById("receivable").value || 0;
  const debt = +document.getElementById("debt").value || 0;

  const maalAssets =
    cash + savings + gold + invest + receivable;

  const maalNet = maalAssets - debt;
  const zakatMaal =
    maalNet >= nisab ? maalNet * 0.025 : 0;

  /* ZAKAT PENGHASILAN */
  const salary = +document.getElementById("salary").value || 0;
  const expenses = +document.getElementById("expenses").value || 0;

  const salaryNet = salary - expenses;
  const zakatSalary =
    salaryNet >= nisab / 12 ? salaryNet * 0.025 : 0;

  /* ZAKAT PERDAGANGAN */
  const capital = +document.getElementById("capital").value || 0;
  const profit = +document.getElementById("profit").value || 0;
  const stock = +document.getElementById("stock").value || 0;
  const businessReceivable =
    +document.getElementById("businessReceivable").value || 0;
  const businessDebt =
    +document.getElementById("businessDebt").value || 0;

  const businessNet =
    capital + profit + stock + businessReceivable - businessDebt;

  const zakatBusiness =
    businessNet >= nisab ? businessNet * 0.025 : 0;

  /* ZAKAT FITRAH */
  const fitrahJumlah =
    +document.getElementById("fitrah-jumlah").value || 0;
  const fitrahHarga =
    +document.getElementById("fitrah-harga").value || 0;

  const zakatFitrah =
    fitrahJumlah * 2.5 * fitrahHarga;

  /* ZAKAT EMAS */
  const emasGram =
    +document.getElementById("emas-gram").value || 0;
  const emasHarga =
    +document.getElementById("emas-harga").value || 0;

  const emasTotal = emasGram * emasHarga;
  const emasNisab = 85 * emasHarga;

  const zakatEmas =
    emasTotal >= emasNisab ? emasTotal * 0.025 : 0;

  /* TOTAL */
  const totalZakat =
    zakatMaal +
    zakatSalary +
    zakatBusiness +
    zakatFitrah +
    zakatEmas;


// === SIMPAN RIWAYAT PER USER ===
const userData = JSON.parse(localStorage.getItem("user"));

if (userData) {
  const key = "zakatHistory_" + userData.email;

  const history = JSON.parse(localStorage.getItem(key)) || [];

  history.push({
    name: userData.name,
    email: userData.email,
    type: "Zakat",
    amount: totalZakat,
    date: new Date().toLocaleDateString()
  });

  localStorage.setItem(key, JSON.stringify(history));
}

  /* NOTIF NISAB */
  let nisabNote = "";
  if (maalNet >= nisab) {
    nisabNote = `<p style="color:green;"><strong>Anda telah mencapai nisab.</strong></p>`;
  } else {
    nisabNote = `<p style="color:gray;">Belum mencapai nisab.</p>`;
  }

  /* OUTPUT */
  const result = `
    <h3>Hasil Perhitungan Zakat</h3>
    <p><strong>Nisab:</strong> ${rupiah(nisab)}</p>
    ${nisabNote}
    <hr>
    <p>Zakat Maal: ${rupiah(zakatMaal)}</p>
    <p>Zakat Penghasilan: ${rupiah(zakatSalary)}</p>
    <p>Zakat Perdagangan: ${rupiah(zakatBusiness)}</p>
    <p>Zakat Emas: ${rupiah(zakatEmas)}</p>
    <p>Zakat Fitrah: ${rupiah(zakatFitrah)}</p>
    <hr>
    <h3>Total Zakat: ${rupiah(totalZakat)}</h3>
  `;

  document.getElementById("zakat-result").innerHTML = result;

  drawZakatChart({
    maal: zakatMaal,
    salary: zakatSalary,
    business: zakatBusiness,
    emas: zakatEmas,
    fitrah: zakatFitrah
  });

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
        "Penghasilan",
        "Perdagangan",
        "Emas",
        "Fitrah"
      ],
      datasets: [{
        data: [
          data.maal,
          data.salary,
          data.business,
          data.emas,
          data.fitrah
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