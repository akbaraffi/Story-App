import { openDB } from "idb";

const DATABASE_NAME = "storyapp";
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = "saved-stories";

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade: (database) => {
    database.createObjectStore(OBJECT_STORE_NAME, {
      keyPath: "id",
    });
    database.createObjectStore("sync-stories", {
      keyPath: "id",
      autoIncrement: true,
    });
  },
});

const Database = {
  async putStory(story) {
    if (!Object.hasOwn(story, "id")) {
      throw new Error("`id` is required to save.");
    }
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  async getStoryById(id) {
    if (!id) {
      throw new Error("`id` is required.");
    }
    return (await dbPromise).get(OBJECT_STORE_NAME, id);
  },

  async getAllStories() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async removeStory(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },

  async putSyncStory(story) {
    return (await dbPromise).put("sync-stories", story);
  },

  async getAllSyncStories() {
    return (await dbPromise).getAll("sync-stories");
  },

  async removeSyncStory(id) {
    return (await dbPromise).delete("sync-stories", id);
  },
};

export default Database;
