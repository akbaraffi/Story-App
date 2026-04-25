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

      if (!token) {
        window.location.hash = "#/login";
        return;
      }

      const response = await this.#model.getAllStories(token);

      if (!response.error) {
        this.#view.displayStories(response.listStory);
      } else {
        console.error(response.message);
      }
    } catch (error) {
      console.error(error);
    }
  }
}
