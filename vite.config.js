import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // or any other port like 3001, 5174, 8080, etc.
  },
});
