import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "require-corp",
    },
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        audioProcessor: resolve(__dirname, "public/audioProcessor.js"),
      },
    },
  },
  optimizeDeps: {
    exclude: ["audioProcessor.js"],
  },
});
