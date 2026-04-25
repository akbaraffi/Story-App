export default class LoginPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async login(email, password) {
    try {
      const response = await this.#model.loginUser({ email, password });
      if (!response.error) {
        sessionStorage.setItem("token", response.loginResult.token);
        this.#view.showSuccess("Selamat datang kembali!");
      } else {
        this.#view.showError(response.message);
      }
    } catch (error) {
      this.#view.showError("Terjadi kesalahan pada sistem. Silakan coba lagi.");
    }
  }
}
