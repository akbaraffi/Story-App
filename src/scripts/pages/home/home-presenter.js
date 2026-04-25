export default class HomePresenter {
  #model;
  #view;

  constructor({ model, view }) {
    this.#model = model;
    this.#view = view;
  }

  async loadStories() {
    try {
      const token = sessionStorage.getItem("token");
      const response = await this.#model.getAllStories(token);

      if (!response.error) {
        this.#view.displayStories(response.listStory);
      } else {
      }
    } catch (error) {}
  }
}
