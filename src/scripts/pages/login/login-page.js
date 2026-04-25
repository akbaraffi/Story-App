import { loginUser } from "../../data/api";
import LoginPresenter from "./login-presenter";

export default class LoginPage {
  #presenter;

  async render() {
    return `
      <section class="container form-container">
        <div class="form-card">
          <h2 class="form-title">Login</h2>
          
          <div id="error-message" class="error-message d-none"></div>
          
          <form id="login-form">
            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" required>
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" required minlength="8">
            </div>
            
            <button type="submit" class="btn-primary">Login</button>
          </form>
          
          <p class="register-link">Belum punya akun? <a href="#/register">Daftar di sini</a></p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    document.title = "Login - Story App";

    this.#presenter = new LoginPresenter({
      view: this,
      model: { loginUser },
    });

    const loginForm = document.getElementById("login-form");

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      document.getElementById("error-message").style.display = "none";

      this.#presenter.login(email, password);
    });
  }

  showError(message) {
    const errorContainer = document.getElementById("error-message");
    errorContainer.innerText = message;
    errorContainer.style.display = "block";
  }
}
