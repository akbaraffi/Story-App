import Database from "../../data/database";

export default class AddPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async addStory(formData) {
    const token = sessionStorage.getItem("token");

    try {
      if (!navigator.onLine) {
        await this._saveToSync(formData, token);
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
      console.error("Network error, saving for sync:", error);
      await this._saveToSync(formData, token);
    }
  }

  async _saveToSync(formData, token) {
    try {
      const storyData = {
        description: formData.get("description"),
        photo: formData.get("photo"),
        lat: parseFloat(formData.get("lat")),
        lon: parseFloat(formData.get("lon")),
        token: token,
        createdAt: new Date().toISOString(),
      };

      await Database.putSyncStory(storyData);

      if ("serviceWorker" in navigator && "SyncManager" in window) {
        const registration = await navigator.serviceWorker.ready;
        try {
          await registration.sync.register("sync-new-story");
        } catch (err) {
          console.warn("Background sync registration failed:", err);
        }
      }

      this.#view.showSuccess(
        "Koneksi terputus. Cerita kamu disimpan dan akan otomatis dikirim saat online! 📶✨",
      );
    } catch (err) {
      console.error("Failed to save to sync storage:", err);
      this.#view.showError("Gagal menyimpan data offline.");
    }
  }
}
