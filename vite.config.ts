import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/quicksense/" : "/",
  plugins: [react()],
  server: { port: 5186, strictPort: true },
  clearScreen: false,
  envPrefix: ["VITE_", "TAURI_ENV_"],
  build: { target: "es2021" },
});
