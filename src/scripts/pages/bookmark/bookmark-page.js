import BookmarkPresenter from "./bookmark-presenter";
import { showFormattedDate } from "../../utils/index";
import Database from "../../data/database";
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

export default class BookmarkPage {
  #presenter;
  #map = null;

  async render() {
    return `
      <section class="container bookmark-section">
        <h2 class="bookmark-title">Lokasi Cerita Tersimpan</h2>
        <div id="bookmark-map" class="map-container"></div>

        <div class="bookmark-controls">
          <div class="search-container">
            <input type="text" id="search-input" placeholder="Cari cerita berdasarkan nama atau deskripsi..." class="input-basic">
          </div>
          <div class="sort-container">
            <select id="sort-select" class="input-basic">
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="name-asc">Nama (A-Z)</option>
              <option value="name-desc">Nama (Z-A)</option>
            </select>
          </div>
        </div>
        <h2 class="story-section-title bookmark-list-title">Cerita Tersimpan</h2>
        <div id="bookmark-list" class="story-list">
          <p class="empty-message">Memuat data...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    document.title = "Cerita Tersimpan - Story App";

    this.#presenter = new BookmarkPresenter({
      view: this,
      model: Database,
    });

    this._initMap();
    await this.#presenter.loadBookmarks();

    const searchInput = document.getElementById("search-input");
    const sortSelect = document.getElementById("sort-select");

    searchInput.addEventListener("input", (event) => {
      this.#presenter.searchBookmarks(event.target.value);
    });

    sortSelect.addEventListener("change", (event) => {
      this.#presenter.sortBookmarks(event.target.value);
    });
  }

  _initMap() {
    this.#map = L.map("bookmark-map").setView([-2.548926, 118.0148634], 5);

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

    osmLayer.addTo(this.#map);

    const baseMaps = {
      OpenStreetMap: osmLayer,
      Topografi: topoLayer,
    };
    L.control.layers(baseMaps).addTo(this.#map);
  }

  displayBookmarks(stories) {
    const container = document.getElementById("bookmark-list");

    if (this.#map) {
      this.#map.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          this.#map.removeLayer(layer);
        }
      });
    }

    if (stories.length === 0) {
      container.innerHTML = `<p class="bookmark-empty">Belum ada cerita yang disimpan.</p>`;
      return;
    }

    container.innerHTML = "";

    stories.forEach((story) => {
      let marker = null;
      if (this.#map && story.lat && story.lon) {
        marker = L.marker([story.lat, story.lon]).addTo(this.#map);
        marker.bindPopup(`
          <div class="popup-container">
            <img src="${story.photoUrl}" alt="Foto ${story.name}" class="popup-image">
            <br><b>${story.name}</b>
          </div>
        `);
      }

      const dateStr = showFormattedDate(story.createdAt);

      const shortDesc =
        story.description.length > 100
          ? story.description.substring(0, 100) + "..."
          : story.description;

      const card = document.createElement("article");
      card.classList.add("story-card");
      card.innerHTML = `
        <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}" class="story-card-image">
        <div class="story-card-content">
          <h3 class="story-card-title">${story.name}</h3>
          <p class="story-card-date">${dateStr}</p>
          <p class="story-card-description">${shortDesc}</p>
          <div class="bookmark-card-actions">
            <button class="btn-basic btn-selengkapnya" data-id="${story.id}">Selengkapnya <i class="fa-solid fa-arrow-right"></i></button>
          </div>
        </div>
      `;

      card.tabIndex = 0;
      card.style.cursor = "pointer";

      const handleStoryClick = () => {
        if (marker) {
          this.#map.setView([story.lat, story.lon], 13);
          marker.openPopup();
          window.scrollTo({
            top: document.getElementById("bookmark-map").offsetTop - 30,
            behavior: "smooth",
          });
        }
      };

      card.addEventListener("click", (event) => {
        if (event.target.closest(".btn-selengkapnya")) return;
        handleStoryClick();
      });
      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          if (event.target.closest(".btn-selengkapnya")) return;
          event.preventDefault();
          handleStoryClick();
        }
      });

      const btnDetail = card.querySelector(".btn-selengkapnya");
      if (btnDetail) {
        btnDetail.addEventListener("click", (e) => {
          e.stopPropagation();
          window.location.hash = `#/detail/${story.id}`;
        });
      }

      container.appendChild(card);
    });
  }
}
