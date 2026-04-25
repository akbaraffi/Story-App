export default class BookmarkPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async loadBookmarks() {
    try {
      const stories = await this.#model.getAllStories();
      const sortedStories = stories.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      );
      this.#view.displayBookmarks(sortedStories);
    } catch (error) {
      console.error(error);
      this.#view.displayBookmarks([]);
    }
  }

  async removeBookmark(id) {
    try {
      await this.#model.removeStory(id);
      await this.loadBookmarks();
    } catch (error) {
      console.error(error);
    }
  }
}
