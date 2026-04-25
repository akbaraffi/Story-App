export default class AddPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async addStory(formData) {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        window.location.hash = "#/login";
        return;
      }

      const response = await this.#model.addNewStory(token, formData);

      if (!response.error) {
        this.#view.showSuccess("Yeay! Cerita kamu berhasil diunggah! 🎉");
      } else {
        this.#view.showError(
          "Gagal mengirim data ke server: " + response.message,
        );
      }
    } catch (error) {
      console.error(error);
      this.#view.showError("Terjadi kesalahan sistem saat mengirim data.");
    }
  }
}
