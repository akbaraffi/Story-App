export default class DetailPresenter {
  #view;
  #apiModel;
  #dbModel;
  #storyId;

  constructor(storyId, { view, apiModel, dbModel }) {
    this.#storyId = storyId;
    this.#view = view;
    this.#apiModel = apiModel;
    this.#dbModel = dbModel;
  }

  async showStoryDetail() {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        window.location.hash = "#/login";
        return;
      }

      const response = await this.#apiModel.getStoryById(token, this.#storyId);

      if (!response.error) {
        this.#view.displayDetail(response.story);
      } else {
        this.#view.showError(response.message);
      }
    } catch (error) {
      console.error(error);
      this.#view.showError("Gagal memuat detail cerita.");
    }
  }

  async saveStory(story) {
    try {
      await this.#dbModel.putStory(story);
      this.#view.saveSuccess("Cerita berhasil disimpan!");
    } catch (error) {
      console.error(error);
      this.#view.showError("Gagal menyimpan cerita.");
    }
  }

  async removeStory() {
    try {
      await this.#dbModel.removeStory(this.#storyId);
      this.#view.removeSuccess("Cerita berhasil dihapus dari simpanan!");
    } catch (error) {
      console.error(error);
      this.#view.showError("Gagal menghapus cerita.");
    }
  }

  async isStorySaved() {
    return !!(await this.#dbModel.getStoryById(this.#storyId));
  }
}
