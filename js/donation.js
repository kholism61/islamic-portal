document.addEventListener("DOMContentLoaded", () => {
  const copyButtons = document.querySelectorAll(".copy-btn");

  copyButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.dataset.copy;
      const text = document.getElementById(targetId)?.innerText;

      if (!text) return;

      navigator.clipboard.writeText(text).then(() => {
        const original = btn.innerHTML;
        btn.innerHTML = "✔ Tersalin";
        btn.classList.add("copied");

        setTimeout(() => {
          btn.innerHTML = original;
          btn.classList.remove("copied");
        }, 1500);
      });
    });
  });
});