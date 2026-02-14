document.addEventListener("DOMContentLoaded", () => {
  // =====================
  // NAV ACTIVE
  // =====================
  const links = document.querySelectorAll(".nav-links a");

  let currentPage = location.pathname.split("/").pop();

  // kalau di root domain
  if (currentPage === "") {
    currentPage = "index.html";
  }

  links.forEach(link => {
    const linkPage = link.getAttribute("href");

    if (linkPage === currentPage) {
      link.classList.add("active");
    }
  });

  // =====================
  // DONASI – QRIS TOGGLE
  // =====================
  const qrisToggle = document.querySelector(".qris-toggle");

  if (qrisToggle) {
    qrisToggle.addEventListener("click", () => {
      const card = qrisToggle.closest(".donation-card");

      if (card) {
        card.classList.toggle("qris-open");

        const icon = qrisToggle.querySelector(".qris-icon");
        if (icon) {
          icon.textContent = card.classList.contains("qris-open")
            ? "−"
            : "+";
        }
      }
    });
  }

  // =====================
  // PREFOOTER FILTER LINK
  // =====================
  document.querySelectorAll(".prefooter-col a[data-filter]").forEach(link => {
    link.onclick = e => {
      e.preventDefault();

      const filter = link.dataset.filter;

      const sidebarLink = document.querySelector(
        `[data-filter="${filter}"]`
      );

      if (sidebarLink) {
        sidebarLink.click();
      }

      document
        .getElementById("articles-container")
        ?.scrollIntoView({ behavior: "smooth" });
    };
  });
});