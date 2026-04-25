import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";
import { transitionHelper } from "../utils";

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
    const url = getActiveRoute();
    const route = routes[url];

    if (!route) {
      this.#content.innerHTML = "<h2>Halaman tidak ditemukan</h2>";
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

    if (token) {
      if (loginMenu) loginMenu.style.display = "none";
      if (logoutMenu) logoutMenu.style.display = "block";
      if (addMenu) addMenu.style.display = "block";
    } else {
      if (loginMenu) loginMenu.style.display = "block";
      if (logoutMenu) logoutMenu.style.display = "none";
      if (addMenu) addMenu.style.display = "none";
    }
  }
}

export default App;
