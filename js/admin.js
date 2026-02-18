/* =========================
   KONFIGURASI ADMIN
========================= */
const ADMIN_EMAIL = "nurcholism51@gmail.com";

/* =========================
   GLOBAL STATE
========================= */
let zakatHistory = [];

/* =========================
   CEK LOGIN ADMIN
========================= */
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    alert("Silakan login dulu");
    window.location.href = "zakat.html";
    return;
  }

  if (user.email !== ADMIN_EMAIL) {
    alert("Akses ditolak");
    window.location.href = "zakat.html";
    return;
  }

  loadAdminData();
});

/* =========================
   LOAD DATA ADMIN
========================= */
function loadAdminData() {
  zakatHistory = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key.startsWith("zakatHistory_")) {
      let data;

      try {
        data = JSON.parse(localStorage.getItem(key));
      } catch {
        data = [];
      }

      if (Array.isArray(data)) {
        zakatHistory = zakatHistory.concat(data);
      }
    }
  }

  renderTable();
  renderStats();
  drawMonthlyChart();
  loadDashboardStats(zakatHistory);
drawYearlyChart(zakatHistory);
}

/* =========================
   RENDER TABLE
========================= */
function renderTable() {
  const tableBody = document.querySelector("tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  zakatHistory.forEach(item => {
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = item.name || "User";

    const typeCell = document.createElement("td");
    typeCell.textContent = item.type || "Zakat";

    const amountCell = document.createElement("td");
    amountCell.textContent =
      "Rp " + Number(item.amount).toLocaleString("id-ID");

    const dateCell = document.createElement("td");
    dateCell.textContent = item.date;

    row.appendChild(nameCell);
    row.appendChild(typeCell);
    row.appendChild(amountCell);
    row.appendChild(dateCell);

    tableBody.appendChild(row);
  });
}

/* =========================
   RENDER STATS
========================= */
function renderStats() {
  const totalUsersEl = document.getElementById("total-users");
  const totalZakatEl = document.getElementById("total-zakat");

  let total = 0;
  let users = new Set();

  zakatHistory.forEach(item => {
    if (!item.amount) return;
    total += Number(item.amount);
    users.add(item.name || "User");
  });

  if (totalUsersEl) totalUsersEl.textContent = users.size;

  if (totalZakatEl)
    totalZakatEl.textContent =
      "Rp " + total.toLocaleString("id-ID");
}

/* =========================
   GRAFIK BULANAN
========================= */
function drawMonthlyChart() {
  const ctx = document.getElementById("monthlyChart");
  if (!ctx) return;

  const monthly = {};

  zakatHistory.forEach(item => {
    if (!item.date) return;

    const date = new Date(item.date);
    const key =
      date.getFullYear() + "-" + (date.getMonth() + 1);

    monthly[key] = (monthly[key] || 0) + Number(item.amount || 0);
  });

  const labels = Object.keys(monthly).sort();
  const values = labels.map(k => monthly[k]);

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Total Zakat",
        data: values
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false }
      }
    }
  });
}

/* =========================
   DASHBOARD STATS
========================= */
function loadDashboardStats(history) {
  let total = 0;
  let users = new Set();

  history.forEach(item => {
    total += Number(item.amount) || 0;
    users.add(item.email || item.name);
  });

  const totalZakatEl = document.getElementById("stat-total-zakat");
  const totalTransEl = document.getElementById("stat-total-transaksi");
  const totalUserEl = document.getElementById("stat-total-user");

  if (totalZakatEl)
    totalZakatEl.textContent =
      "Rp " + total.toLocaleString("id-ID");

  if (totalTransEl)
    totalTransEl.textContent = history.length;

  if (totalUserEl)
    totalUserEl.textContent = users.size;
}

/* =========================
   GRAFIK TAHUNAN
========================= */
function drawYearlyChart(history) {
  const ctx = document.getElementById("yearlyChart");
  if (!ctx) return;

  const yearly = {};

  history.forEach(item => {
    if (!item.date) return;

    let year;

    if (item.date.includes("/")) {
      year = item.date.split("/")[2];
    } else {
      year = new Date(item.date).getFullYear();
    }

    const value = Number(item.amount) || 0;

    if (!yearly[year]) yearly[year] = 0;
    yearly[year] += value;
  });

  const labels = Object.keys(yearly);
  const values = Object.values(yearly);

  if (labels.length === 0) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Zakat Tahunan",
        data: values,
        tension: 0.3
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      }
    }
  });
}

/* =========================
   EXPORT CSV
========================= */
function exportToExcel() {
  if (!zakatHistory.length) {
    alert("Tidak ada data.");
    return;
  }

  let csv = "Nama,Jenis,Jumlah,Tanggal\n";

  zakatHistory.forEach(item => {
    csv += `${item.name},${item.type},${item.amount},${item.date}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "laporan-zakat.csv";
  a.click();

  URL.revokeObjectURL(url);
}

/* =========================
   EXPORT PDF
========================= */
function exportToPDF() {
  window.print();
}

/* =========================
   RESET DATA
========================= */
function resetAllData() {
  const confirmReset = confirm(
    "Yakin ingin menghapus semua data zakat?"
  );

  if (!confirmReset) return;

  const keysToDelete = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (
      key.startsWith("zakatHistory_") ||
      key === "zakatMonthly"
    ) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach(key =>
    localStorage.removeItem(key)
  );

  alert("Data berhasil dihapus");
  location.reload();
}