import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.clearrecovery.app",
  appName: "CLEAR",
  // Vite output. Build with `npm run build:native` (relative asset base) before
  // running `npx cap sync`.
  webDir: "dist",
  backgroundColor: "#0f1822",
};

export default config;
