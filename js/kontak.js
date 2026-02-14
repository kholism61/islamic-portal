document.addEventListener("DOMContentLoaded", () => {

  const links = document.querySelectorAll(".contact-link");

  links.forEach(link => {

    // ===== Ripple Effect =====
    link.addEventListener("click", e => {
      createRipple(e, link);
    });

    // ===== Handle Copy =====
    link.addEventListener("click", () => {

      let textToCopy = "";

      if (link.href.startsWith("mailto:")) {
        textToCopy = link.textContent.trim();
        showToast("📧 Email disalin");
      }

      if (link.href.includes("wa.me")) {
        textToCopy = link.href.split("wa.me/")[1];
        showToast("💬 Nomor WhatsApp disalin");
      }

      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy);
      }

    });

  });

  /* =======================
     RIPPLE EFFECT
  ======================= */
  function createRipple(event, element) {

    const circle = document.createElement("span");
    circle.className = "ripple";

    const rect = element.getBoundingClientRect();

    circle.style.left = event.clientX - rect.left + "px";
    circle.style.top = event.clientY - rect.top + "px";

    element.appendChild(circle);

    setTimeout(() => circle.remove(), 600);
  }

  /* =======================
     TOAST NOTIFICATION
  ======================= */
  function showToast(message) {

    let toast = document.querySelector(".contact-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "contact-toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("show");

    setTimeout(() => {
      toast.classList.remove("show");
    }, 2200);
  }

});