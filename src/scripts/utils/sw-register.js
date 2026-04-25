export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker API unsupported");
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      type: import.meta.env.DEV ? "module" : "classic",
    });
    console.log("Service worker telah terpasang", registration);
  } catch (error) {
    console.log("Failed to install service worker:", error);
  }
}
