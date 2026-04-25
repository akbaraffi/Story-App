export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) {
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register(
      `${import.meta.env.BASE_URL}sw.js`,
      {
        type: import.meta.env.DEV ? "module" : "classic",
      },
    );
  } catch (error) {}
}
