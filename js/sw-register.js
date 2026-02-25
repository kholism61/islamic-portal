/* ======================================
   SERVICE WORKER REGISTER — AUTO UPDATE
====================================== */

if ("serviceWorker" in navigator) {

  window.addEventListener("load", () => {

    navigator.serviceWorker.register("/sw.js")
      .then((registration) => {

        console.log("SW registered");

        // Detect update
        registration.onupdatefound = () => {

          const newWorker = registration.installing;

          newWorker.onstatechange = () => {

            if (
              newWorker.state === "activated" &&
              navigator.serviceWorker.controller
            ) {
              console.log("New version available — reloading...");
              window.location.reload();
            }

          };

        };

      })
      .catch((error) => {
        console.error("SW registration failed:", error);
      });

  });

}