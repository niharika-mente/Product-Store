import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from "vite-plugin-pwa";
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA({
    registerStrategy: "autoUpdate",
    includeAssets: ["vite.svg"],
    workbox: {
      navigateFallback: "/offline.html",
      globPatterns: ["**/*.{js,css,html,svg,png,jpg,jpeg,webp}"]
    }
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server:{
    proxy:{
      "/api":{
        target:"http://localhost:5000",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./src/setupTests.js",
  },
});
