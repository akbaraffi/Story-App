import Swal from "sweetalert2";
import AddPresenter from "./add-presenter";
import { addNewStory } from "../../data/api";
import * as L from "leaflet";

export default class AddPage {
  #presenter;
  #map;
  #marker;
  #stream;

  async render() {
    return `
      <section class="container add-section">
        <div class="form-card add-card">
          <h2 class="form-title">Tambah Cerita Baru</h2>
          
          <div id="error-message" class="error-message d-none"></div>

          <form id="add-story-form">
            <div class="form-group">
              <label for="description">Deskripsi Cerita</label>
              <textarea id="description" required rows="8" class="form-textarea"></textarea>
            </div>

            <div class="form-group">
              <label for="camera-select">Pilih Kamera</label>
              <select id="camera-select" class="camera-select"></select>

              <div class="camera-container">
                <video id="camera-video" autoplay class="camera-video" aria-label="Pratinjau Kamera"></video>
                <canvas id="camera-canvas" class="d-none"></canvas>
              </div>
              
              <button type="button" id="btn-take-photo" class="btn-primary btn-take-photo">Ambil Foto</button>
              
              <p class="upload-text">Atau unggah file gambar</p>
              <label for="photo-file">Unggah file gambar</label>
              <input type="file" id="photo-file" accept="image/*" class="file-input">
              
              <p id="photo-preview-label" class="photo-preview-label d-none">Hasil Gambar</p>
              <img id="photo-preview" class="photo-preview d-none" alt="Pratinjau foto yang akan diunggah" />
            </div>

            <div class="form-group">
              <p class="map-instruction">Lokasi (Klik area peta untuk menandai)</p>
              <div id="add-map" class="add-map" aria-label="Peta interaktif untuk memilih lokasi"></div>
              
              <div class="coordinate-container">
                <div class="flex-1">
                  <label for="lat" class="coordinate-label">Latitude</label>
                  <input type="text" id="lat" placeholder="Latitude" readonly class="coordinate-input w-100">
                </div>
                <div class="flex-1">
                  <label for="lon" class="coordinate-label">Longitude</label>
                  <input type="text" id="lon" placeholder="Longitude" readonly class="coordinate-input w-100">
                </div>
              </div>
            </div>

            <button type="submit" id="btn-submit" class="btn-primary btn-submit-story">Kirim Cerita</button>
          </form>
        </div>
      </section>
    `;
  }

  async afterRender() {
    document.title = "Tambah Cerita - Story App";

    this.#presenter = new AddPresenter({ view: this, model: { addNewStory } });
    this._initMap();
    await this._initCamera();
    this._setupListeners();
  }

  _initMap() {
    this.#map = L.map("add-map").setView([-2.548926, 118.0148634], 5);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
      this.#map,
    );

    this.#map.on("click", (event) => {
      const { lat, lng } = event.latlng;
      document.getElementById("lat").value = lat;
      document.getElementById("lon").value = lng;

      if (this.#marker) {
        this.#marker.setLatLng(event.latlng);
      } else {
        this.#marker = L.marker(event.latlng).addTo(this.#map);
      }
    });
  }

  async _initCamera() {
    try {
      this.#stream = await navigator.mediaDevices.getUserMedia({ video: true });
      document.getElementById("camera-video").srcObject = this.#stream;

      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput",
      );
      const select = document.getElementById("camera-select");

      select.innerHTML = videoDevices
        .map(
          (device, index) =>
            `<option value="${device.deviceId}">${device.label || `Kamera ${index + 1}`}</option>`,
        )
        .join("");

      select.addEventListener("change", () => this._startStream(select.value));
    } catch (error) {
      console.error("Gagal mengakses kamera:", error);
      Swal.fire({
        icon: "error",
        title: "Kamera Gagal",
        text: "Tidak bisa mengakses kamera. Pastikan kamu memberikan izin di browser.",
      });
    }
  }

  async _startStream(deviceId) {
    this._stopStream();
    try {
      this.#stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
      document.getElementById("camera-video").srcObject = this.#stream;
    } catch (error) {
      console.error("Gagal mengganti stream kamera:", error);
    }
  }

  _stopStream() {
    if (this.#stream) {
      this.#stream.getTracks().forEach((track) => track.stop());
    }
  }

  _setupListeners() {
    const video = document.getElementById("camera-video");
    const canvas = document.getElementById("camera-canvas");
    const btnTake = document.getElementById("btn-take-photo");
    const fileInput = document.getElementById("photo-file");
    const preview = document.getElementById("photo-preview");
    const previewLabel = document.getElementById("photo-preview-label");
    const form = document.getElementById("add-story-form");

    let photoBlob = null;

    const stopStreamOnNav = () => {
      if (window.location.hash !== "#/add") {
        this._stopStream();
        window.removeEventListener("hashchange", stopStreamOnNav);
      }
    };
    window.addEventListener("hashchange", stopStreamOnNav);

    btnTake.addEventListener("click", () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0);

      preview.src = canvas.toDataURL("image/jpeg");
      preview.classList.remove("d-none");
      previewLabel.classList.remove("d-none");

      canvas.toBlob((blob) => {
        photoBlob = blob;
      }, "image/jpeg");
    });

    fileInput.addEventListener("change", (event) => {
      const file = event.target.files[0];
      if (file) {
        photoBlob = file;
        preview.src = URL.createObjectURL(file);
        preview.classList.remove("d-none");
        previewLabel.classList.remove("d-none");
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const errorMsg = document.getElementById("error-message");
      errorMsg.classList.add("d-none");
      const btnSubmit = document.getElementById("btn-submit");

      if (!photoBlob) {
        this.showError("Kamu belum mengambil atau memilih foto cerita.");
        return;
      }

      if (photoBlob.size > 1000000) {
        this.showError("Ukuran file foto tidak boleh melebihi 1MB.");
        return;
      }

      const description = document.getElementById("description").value;
      const lat = document.getElementById("lat").value;
      const lon = document.getElementById("lon").value;

      if (!lat || !lon) {
        this.showError(
          "Lokasi belum dipilih,Silakan klik salah satu koordinat acak di peta.",
        );
        return;
      }

      const formData = new FormData();
      formData.append("description", description);
      formData.append("photo", photoBlob, "photo.jpg");
      formData.append("lat", parseFloat(lat));
      formData.append("lon", parseFloat(lon));

      btnSubmit.innerText = "Mengirim Cerita";
      this._stopStream();

      this.#presenter.addStory(formData);
    });
  }

  showError(message) {
    document.getElementById("btn-submit").innerText = "Kirim Cerita";
    const errorMsg = document.getElementById("error-message");
    errorMsg.innerText = message;
    errorMsg.classList.remove("d-none");
    document
      .querySelector(".add-section")
      .scrollIntoView({ behavior: "smooth" });
  }

  showSuccess(message) {
    document.getElementById("btn-submit").innerText = "Kirim Cerita";
    Swal.fire({
      icon: "success",
      title: "Berhasil",
      text: message,
      confirmButtonText: "OK",
    }).then(() => {
      window.location.hash = "#/";
    });
  }
}
