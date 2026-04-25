import { defineConfig } from "vite";
import { resolve } from "path";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  root: resolve(__dirname, "src"),
  publicDir: resolve(__dirname, "src", "public"),
  build: {
    outDir: resolve(__dirname, "dist"),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  plugins: [
    VitePWA({
      strategies: "injectManifest",
      srcDir: ".",
      filename: "sw.js",
      injectRegister: false,
      injectManifest: {
        injectionPoint: "self.__WB_MANIFEST",
      },
      devOptions: {
        enabled: true,
        type: "module",
      },
      manifest: {
        id: "/#/",
        start_url: "/#/",
        scope: "/",
        name: "Story App",
        short_name: "Story",
        description:
          "Aplikasi berbagi cerita dan pengalaman dari berbagai tempat. Dengan fitur peta berbasis geotagging, pengguna dapat melihat lokasi asal setiap cerita secara visual melalui peta digital.",
        display: "standalone",
        background_color: "#FFFFFF",
        theme_color: "#000000",
        icons: [
          {
            src: "images/icons/icon-48x48.png",
            sizes: "48x48",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "images/icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "images/icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "images/icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "images/icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "images/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "images/icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "images/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
        screenshots: [
          {
            src: "images/screenshots/dekstop.png",
            sizes: "1326x857",
            type: "image/png",
            form_factor: "wide",
          },
          {
            src: "images/screenshots/mobile.png",
            sizes: "506x859",
            type: "image/png",
            form_factor: "narrow",
          },
        ],
        shortcuts: [
          {
            name: "Tambah Cerita Baru",
            short_name: "Tambah",
            description: "Membuat cerita baru.",
            url: "/?source=pwa#/add",
            icons: [
              {
                src: "images/icons/icon-96x96.png",
                sizes: "96x96",
                type: "image/png",
              },
            ],
          },
        ],
      },
    }),
  ],
});
