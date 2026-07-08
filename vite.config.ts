/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  // Served from a GitHub Pages project subpath: jasonthomas5280.github.io/KQSupport/
  base: "/KQSupport/",
  plugins: [
    react(),
    // Installable PWA + offline precache. Installed PWAs are also exempt from
    // Safari's 7-day IndexedDB eviction — this protects the user's journey data.
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["icon.svg", "apple-touch-icon.png", "favicon-32.png"],
      manifest: {
        name: "CLEAR — Recovery Tracker",
        short_name: "CLEAR",
        description:
          "A secular, withdrawal-aware recovery tracker for the kratom / 7-OH / Feel Free community. Local-first: your data stays on your device.",
        theme_color: "#0f1822",
        background_color: "#0f1822",
        display: "standalone",
        start_url: "/KQSupport/",
        scope: "/KQSupport/",
        icons: [
          { src: "pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png" },
          { src: "pwa-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
        ],
      },
    }),
  ],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
  },
});
