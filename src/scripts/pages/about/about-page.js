export default class AboutPage {
  async render() {
    return `
      <section class="container about-section">
        <h2 class="about-title">Tentang Story App</h2>
        <p class="about-description">
          Story App adalah platform interaktif untuk berbagi cerita, pengalaman, dan momen inspiratif dari berbagai tempat. Dengan fitur peta berbasis geotagging, pengguna dapat melihat lokasi asal setiap cerita secara visual melalui peta digital.
        </p>
      </section>
    `;
  }

  async afterRender() {
    document.title = "Tentang Kami - Story App";
    window.scrollTo(0, 0);
  }
}
