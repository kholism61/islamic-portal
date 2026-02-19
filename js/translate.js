// =====================
// LANGUAGE DROPDOWN
// =====================
const langBtn = document.getElementById("langBtn");
const langDropdown = document.getElementById("langDropdown");

if (langBtn && langDropdown) {
  langBtn.onclick = (e) => {
    e.stopPropagation();
    langDropdown.classList.toggle("active");
  };

  document.addEventListener("click", (e) => {
    if (!langDropdown.contains(e.target)) {
      langDropdown.classList.remove("active");
    }
  });
}

window.setLang = function(lang) {

  localStorage.setItem("siteLang", lang);

  if (lang === "id") {
    document.cookie = "googtrans=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  } else {
    document.cookie = "googtrans=/id/" + lang + ";path=/";
  }

  location.reload();
};