export default class RegisterPresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async register(name, email, password) {
    try {
      const response = await this.#model.registerUser({
        name,
        email,
        password,
      });

      if (!response.error) {
        window.location.hash = "#/login";
      } else {
        this.#view.showError(response.message);
      }
    } catch (error) {
      this.#view.showError("Terjadi kesalahan pada sistem. Silakan coba lagi.");
      console.error(error);
    }
  }
}
