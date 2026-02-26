if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker.register("/sw.js")
      .then(reg => {

        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "activated" && navigator.serviceWorker.controller) {
              window.location.reload();
            }
          });

        });

      })
      .catch(err => console.log("SW failed:", err));

  });

}
