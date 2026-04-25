import { getAllStories } from "../../data/api";
import HomePresenter from "./home-presenter";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default class HomePage {
  #presenter;

  async render() {
    return `
      <section class="container home-section">
        <h2 class="home-title">Lokasi Cerita</h2>
        
        <div id="map-container" class="map-container"></div>
        
        <div class="add-story-container">
          <a href="#/add" class="btn-basic">+ Tambah Cerita</a>
        </div>
        
        <h2 class="story-section-title">Cerita Terbaru</h2>
        <div id="story-list" class="story-list">
          <p class="empty-message">Memuat data...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    document.title = "Beranda - Story App";

    this.#presenter = new HomePresenter({
      view: this,
      model: { getAllStories },
    });

    this.#presenter.loadStories();
  }

  displayStories(stories) {
    const storyListContainer = document.getElementById("story-list");
    storyListContainer.innerHTML = "";

    if (stories.length === 0) {
      storyListContainer.innerHTML =
        '<p class="empty-message">Belum ada cerita yang dibagikan.</p>';
      return;
    }

    const map = L.map("map-container").setView([-2.548926, 118.0148634], 5);

    const osmLayer = L.tileLayer(
      "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors",
      },
    );

    const topoLayer = L.tileLayer(
      "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
      {
        attribution:
          "Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap",
      },
    );

    osmLayer.addTo(map);

    const baseMaps = {
      OpenStreetMap: osmLayer,
      Topografi: topoLayer,
    };
    L.control.layers(baseMaps).addTo(map);

    stories.forEach((story) => {
      let marker = null;
      if (story.lat && story.lon) {
        marker = L.marker([story.lat, story.lon]).addTo(map);

        marker.bindPopup(`
          <div class="popup-container">
            <img src="${story.photoUrl}" alt="Foto ${story.name}" class="popup-image">
            <br><b>${story.name}</b>
          </div>
        `);
      }

      const storyCard = document.createElement("article");
      storyCard.classList.add("story-card");

      const shortDescription =
        story.description.length > 100
          ? story.description.substring(0, 100) + "..."
          : story.description;

      const dateStr = new Date(story.createdAt).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      storyCard.innerHTML = `
        <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}" class="story-card-image">
        <div class="story-card-content">
          <h3 class="story-card-title">${story.name}</h3>
          <p class="story-card-date">${dateStr}</p>
          <p class="story-card-description">${shortDescription}</p>
        </div>
      `;

      storyCard.tabIndex = 0;
      storyCard.style.cursor = "pointer";

      const handleStoryClick = () => {
        if (marker) {
          map.setView([story.lat, story.lon], 13);
          marker.openPopup();
          window.scrollTo({
            top: document.getElementById("map-container").offsetTop - 30,
            behavior: "smooth",
          });
        }
      };

      storyCard.addEventListener("click", handleStoryClick);
      storyCard.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleStoryClick();
        }
      });

      storyListContainer.appendChild(storyCard);
    });
  }
}
