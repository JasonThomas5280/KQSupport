/// <reference types="vitest/config" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Web (GitHub Pages) is served from a project subpath; native (Capacitor)
  // WebViews serve assets from root, so use a relative base there.
  // Set VITE_NATIVE=1 for native builds (see `npm run build:native`).
  base: process.env.VITE_NATIVE === "1" ? "./" : "/KQSupport/",
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./vitest.setup.ts",
  },
});
