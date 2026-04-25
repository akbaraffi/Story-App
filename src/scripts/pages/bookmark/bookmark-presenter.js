export default class BookmarkPresenter {
  #view;
  #model;
  #bookmarks = [];
  #searchQuery = "";
  #sortBy = "newest";

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async loadBookmarks() {
    try {
      this.#bookmarks = await this.#model.getAllStories();
      this._renderBookmarks();
    } catch (error) {
      console.error(error);
      this.#view.displayBookmarks([]);
    }
  }

  searchBookmarks(query) {
    this.#searchQuery = query.toLowerCase();
    this._renderBookmarks();
  }

  sortBookmarks(sortBy) {
    this.#sortBy = sortBy;
    this._renderBookmarks();
  }

  _renderBookmarks() {
    let filtered = this.#bookmarks.filter((story) => {
      const nameMatch = story.name.toLowerCase().includes(this.#searchQuery);
      const descMatch = story.description
        .toLowerCase()
        .includes(this.#searchQuery);
      return nameMatch || descMatch;
    });

    filtered.sort((a, b) => {
      if (this.#sortBy === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (this.#sortBy === "oldest") {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      if (this.#sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      }
      if (this.#sortBy === "name-desc") {
        return b.name.localeCompare(a.name);
      }
      return 0;
    });

    this.#view.displayBookmarks(filtered);
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
