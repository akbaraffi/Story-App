import Swal from "sweetalert2";
import { registerUser } from "../../data/api";
import RegisterPresenter from "./register-presenter";

export default class RegisterPage {
  #presenter;

  async render() {
    return `
      <section class="container form-container">
        <div class="form-card">
          <h2 class="form-title">Daftar Akun</h2>
          
          <div id="error-message" class="error-message d-none"></div>
          
          <form id="register-form">
            <div class="form-group">
              <label for="name">Nama</label>
              <input type="text" id="name" required>
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input type="email" id="email" required>
            </div>
            
            <div class="form-group">
              <label for="password">Password</label>
              <input type="password" id="password" required minlength="8">
            </div>
            
            <button type="submit" class="btn-primary">Daftar</button>
          </form>
          
          <p class="register-link">Sudah punya akun? <a href="#/login">Login di sini</a></p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    document.title = "Daftar Akun - Story App";

    this.#presenter = new RegisterPresenter({
      view: this,
      model: { registerUser },
    });

    const registerForm = document.getElementById("register-form");

    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      document.getElementById("error-message").classList.add("d-none");

      this.#presenter.register(name, email, password);
    });
  }

  showError(message) {
    const errorContainer = document.getElementById("error-message");
    errorContainer.innerText = message;
    errorContainer.classList.remove("d-none");
  }

  showSuccess(message) {
    Swal.fire({
      icon: "success",
      title: "Pendaftaran Berhasil",
      text: message,
      confirmButtonText: "Ke Halaman Login",
    }).then(() => {
      window.location.hash = "#/login";
    });
  }
}
