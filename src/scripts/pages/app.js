import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { transitionHelper } from "../utils";
import {
  isCurrentPushSubscriptionAvailable,
  subscribe,
  unsubscribe,
} from "../utils/notification-helper";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this.#setupDrawer();
    this.#setupAuthNav();
  }

  async setupPushNotification() {
    if (!("serviceWorker" in navigator)) return;
    const tools = document.getElementById("push-notification-tools");
    if (!tools) return;

    let isSubscribed = false;
    try {
      isSubscribed = await isCurrentPushSubscriptionAvailable();
    } catch (e) {
      console.warn("Failed to check push subscription status:", e);
    }

    if (isSubscribed) {
      tools.innerHTML = `<button id="unsubscribe-button" class="push-btn-white">Unsubscribe <i class="fa-solid fa-bell-slash"></i></button>`;
      document
        .getElementById("unsubscribe-button")
        .addEventListener("click", () => {
          unsubscribe().finally(() => {
            this.setupPushNotification();
          });
        });
      return;
    }

    tools.innerHTML = `<button id="subscribe-button" class="push-btn-white">Subscribe <i class="fa-solid fa-bell"></i></button>`;
    document
      .getElementById("subscribe-button")
      .addEventListener("click", () => {
        subscribe().finally(() => {
          this.setupPushNotification();
        });
      });
  }

  #setupAuthNav() {
    const logoutBtn = document.getElementById("logout-button");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        sessionStorage.removeItem("token");
        window.location.hash = "#/login";
      });
    }
  }

  #setupDrawer() {
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    document.body.addEventListener("click", (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }

      this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove("open");
        }
      });
    });
  }

  async renderPage() {
    this._updateAuthVisibility();

    const token = sessionStorage.getItem("token");
    if (token) {
      this.setupPushNotification();
    }

    const url = getActiveRoute();
    const route = routes[url];

    if (!route) {
      this.#content.innerHTML = "<h2>Halaman tidak ditemukan</h2>";
      return;
    }

    // Protection logic
    const publicRoutes = ["/login", "/register", "/about"];
    if (!publicRoutes.includes(url) && !token) {
      window.location.hash = "#/login";
      return;
    }

    const page = route();

    const transition = transitionHelper({
      updateDOM: async () => {
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      },
    });

    transition.ready.catch(console.error);

    transition.updateCallbackDone.then(() => {
      window.scrollTo({ top: 0, behavior: "instant" });
    });
  }

  _updateAuthVisibility() {
    const token = sessionStorage.getItem("token");
    const loginMenu = document.getElementById("login-menu");
    const logoutMenu = document.getElementById("logout-menu");
    const addMenu = document.getElementById("add-menu");
    const pushMenu = document.getElementById("push-notification-tools");
    const bookmarkMenu = document.getElementById("bookmark-menu");

    if (token) {
      if (loginMenu) loginMenu.classList.add("d-none");
      if (logoutMenu) logoutMenu.classList.remove("d-none");
      if (addMenu) addMenu.classList.remove("d-none");
      if (pushMenu) pushMenu.classList.remove("d-none");
      if (bookmarkMenu) bookmarkMenu.classList.remove("d-none");
    } else {
      if (loginMenu) loginMenu.classList.remove("d-none");
      if (logoutMenu) logoutMenu.classList.add("d-none");
      if (addMenu) addMenu.classList.add("d-none");
      if (pushMenu) pushMenu.classList.add("d-none");
      if (bookmarkMenu) bookmarkMenu.classList.add("d-none");
    }
  }
}

export default App;
