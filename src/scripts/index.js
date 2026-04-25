// CSS imports
import "../styles/styles.css";

import App from "./pages/app";

import { registerServiceWorker } from "./utils/sw-register";

document.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("year").innerText = new Date().getFullYear();
  const app = new App({
    content: document.querySelector("#main-content"),
    drawerButton: document.querySelector("#drawer-button"),
    navigationDrawer: document.querySelector("#navigation-drawer"),
  });

  window.addEventListener("hashchange", async () => {
    await app.renderPage();
  });

  window.addEventListener("load", async () => {
    await app.renderPage();
  });

  // Render initial page
  await app.renderPage();

  // Initialize PWA features without blocking UI
  registerServiceWorker();
  app.setupPushNotification();
});
