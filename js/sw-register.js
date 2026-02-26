if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js")
      .then(reg => reg.update())
      .catch(err => console.log("SW error:", err));
  });
}
