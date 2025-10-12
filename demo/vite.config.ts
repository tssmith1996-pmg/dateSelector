import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        parent: path.resolve(__dirname, "parent/index.html"),
        visual: path.resolve(__dirname, "visual/index.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@lib": path.resolve(__dirname, "../src"),
    },
  },
  server: {
    fs: {
      allow: [__dirname, path.resolve(__dirname, "..")],
    },
  },
});
