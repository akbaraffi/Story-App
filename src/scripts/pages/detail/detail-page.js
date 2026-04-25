import Swal from "sweetalert2";
import DetailPresenter from "./detail-presenter";
import { showFormattedDate } from "../../utils/index";
import { getStoryById } from "../../data/api";
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

export default class DetailPage {
  #presenter;
  #story = null;

  constructor(id) {
    this.storyId = id;
  }

  async render() {
    return `
      <section class="container detail-section">
        <div id="detail-content">
          <p class="empty-message">Memuat detail cerita...</p>
        </div>
      </section>
    `;
  }

  async afterRender() {
    document.title = "Detail Cerita - Story App";

    this.#presenter = new DetailPresenter(this.storyId, {
      view: this,
      apiModel: { getStoryById },
      dbModel: Database,
    });

    await this.#presenter.showStoryDetail();
  }

  async displayDetail(story) {
    this.#story = story;

    const dateStr = showFormattedDate(story.createdAt);

    const isSaved = await this.#presenter.isStorySaved();

    const container = document.getElementById("detail-content");
    container.innerHTML = `
      <article class="detail-card">
        <img src="${story.photoUrl}" alt="Foto cerita dari ${story.name}" class="detail-image" />
        <div class="detail-body">
          <h2 class="detail-title">${story.name}</h2>
          <p class="detail-date">${dateStr}</p>
          <p class="detail-description">${story.description}</p>

          <div id="save-actions" class="detail-save-actions">
            ${
              isSaved
                ? `<button id="btn-remove-story" class="btn-basic btn-remove">Hapus Simpanan &nbsp;<i class="fa-solid fa-trash"></i></button>`
                : `<button id="btn-save-story" class="btn-basic btn-save">Simpan Cerita &nbsp;<i class="fa-solid fa-bookmark"></i></button>`
            }
          </div>
        </div>
      </article>

      ${
        story.lat && story.lon
          ? `
        <div class="detail-map-section">
          <h3 class="detail-map-title">Lokasi Cerita</h3>
          <div id="detail-map" class="detail-map"></div>
        </div>
      `
          : ""
      }
    `;

    this._setupSaveButton();

    if (story.lat && story.lon) {
      this._initMap(story.lat, story.lon, story.name);
    }
  }

  _setupSaveButton() {
    const btnSave = document.getElementById("btn-save-story");
    const btnRemove = document.getElementById("btn-remove-story");

    if (btnSave) {
      btnSave.addEventListener("click", async () => {
        await this.#presenter.saveStory(this.#story);
        await this._refreshSaveButton();
      });
    }

    if (btnRemove) {
      btnRemove.addEventListener("click", async () => {
        await this.#presenter.removeStory();
        await this._refreshSaveButton();
      });
    }
  }

  async _refreshSaveButton() {
    const isSaved = await this.#presenter.isStorySaved();
    const container = document.getElementById("save-actions");
    container.innerHTML = isSaved
      ? `<button id="btn-remove-story" class="btn-basic btn-remove">Hapus Simpanan &nbsp;<i class="fa-solid fa-trash"></i></button>`
      : `<button id="btn-save-story" class="btn-basic btn-save">Simpan Cerita &nbsp;<i class="fa-solid fa-bookmark"></i></button>`;
    this._setupSaveButton();
  }

  _initMap(lat, lon, name) {
    const map = L.map("detail-map").setView([lat, lon], 13);

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

    L.marker([lat, lon]).addTo(map).bindPopup(`<b>${name}</b>`).openPopup();
  }

  showError(message) {
    document.getElementById("detail-content").innerHTML = `
      <p class="error-message">${message}</p>
    `;
  }

  saveSuccess(message) {
    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: message,
      timer: 1500,
      showConfirmButton: false,
    });
  }

  removeSuccess(message) {
    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: message,
      timer: 1500,
      showConfirmButton: false,
    });
  }
}
