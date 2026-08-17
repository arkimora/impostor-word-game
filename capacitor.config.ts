import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.impostor.localgame",
  appName: "Impostor",
  webDir: "dist",
  server: {
    androidScheme: "https",
  },
};

export default config;