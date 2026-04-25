import { precacheAndRoute } from "workbox-precaching";
import { openDB } from "idb";
import { registerRoute } from "workbox-routing";
import { CacheableResponsePlugin } from "workbox-cacheable-response";
import {
  NetworkFirst,
  CacheFirst,
  StaleWhileRevalidate,
} from "workbox-strategies";

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim());
});

registerRoute(
  ({ url }) => {
    return (
      url.origin === "https://cdnjs.cloudflare.com" ||
      url.origin.includes("fontawesome")
    );
  },
  new CacheFirst({
    cacheName: "fontawesome",
  }),
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL("https://story-api.dicoding.dev/v1");
    return baseUrl.origin === url.origin && request.destination !== "image";
  },
  new NetworkFirst({
    cacheName: "story-api",
  }),
);

registerRoute(
  ({ request, url }) => {
    const baseUrl = new URL("https://story-api.dicoding.dev/v1");
    return baseUrl.origin === url.origin && request.destination === "image";
  },
  new StaleWhileRevalidate({
    cacheName: "story-api-images",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

registerRoute(
  ({ url }) => {
    return url.origin.includes("tile.openstreetmap.org");
  },
  new CacheFirst({
    cacheName: "openstreetmap-tiles",
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  }),
);

self.addEventListener("push", (event) => {
  async function chainPromise() {
    let data = {
      title: "Story App",
      options: { body: "Notifikasi baru!" },
    };

    try {
      if (event.data) {
        data = await event.data.json();
      }
    } catch (err) {}

    const options = {
      ...data.options,
      icon: data.options?.icon || "/favicon.png",
      data: data.data || {},
    };

    await self.registration.showNotification(data.title, options);
  }

  event.waitUntil(chainPromise());
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const notificationData = event.notification.data;
  let urlToOpen = "/";

  if (notificationData && notificationData.id) {
    urlToOpen = `/#/detail/${notificationData.id}`;
  }

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (
            "focus" in client &&
            client.url.includes(self.registration.scope)
          ) {
            client.focus();
            if (urlToOpen !== "/") {
              client.navigate(urlToOpen);
            }
            return;
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      }),
  );
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-new-story") {
    event.waitUntil(processSyncStories());
  }
});

async function processSyncStories() {
  const db = await openDB("storyapp", 1);
  const syncStories = await db.getAll("sync-stories");

  for (const story of syncStories) {
    try {
      const formData = new FormData();
      formData.append("description", story.description);
      formData.append("photo", story.photo);
      formData.append("lat", story.lat);
      formData.append("lon", story.lon);

      const response = await fetch(
        "https://story-api.dicoding.dev/v1/stories",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${story.token}`,
          },
          body: formData,
        },
      );

      const result = await response.json();
      if (!result.error) {
        await db.delete("sync-stories", story.id);

        self.registration.showNotification("Story App", {
          body: "Cerita offline kamu berhasil terkirim! 🚀",
          icon: "/favicon.png",
          vibrate: [100, 50, 100],
          data: { id: result.id || "" },
        });
      }
    } catch (err) {
      console.error("Sync failed for story:", story.id, err);
    }
  }
}
