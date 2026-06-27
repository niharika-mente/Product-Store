export function registerSW() {
  if (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator
  ) {
    window.addEventListener("load", async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch (error) {
        console.error("Service worker registration failed:", error);
      }
    });
  }
}