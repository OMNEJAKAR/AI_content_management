import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react({
    include: "**/*.{jsx,js}",
  })],
  server: {
    port: 3000,
    open: true
  },
  optimizeDeps: {
    include: [
      "pdfjs-dist/build/pdf.worker",
      "franc"
    ]
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  }
});
