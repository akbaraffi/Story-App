export default class NotFoundPage {
  async render() {
    return `
      <section class="container not-found-section">
        <h1>404</h1>
        <div class="story-not-found">
          <h2>Halaman Tidak Ditemukan</h2>
          <p class="not-found-message">Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.</p>
          <a href="#/" class="btn-basic">Kembali ke Beranda</a>
        </div>
      </section>
    `;
  }

  async afterRender() {
    document.title = "404 Not Found - Story App";
  }
}
