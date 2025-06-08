import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: mode === "production" ? "/restaurant-pro/" : "/",
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Keep React and React-DOM together to avoid context issues
          if (id.includes("react") || id.includes("react-dom")) {
            return "vendor-react";
          }

          // Charts (largest library)
          if (id.includes("recharts") || id.includes("d3-")) {
            return "vendor-charts";
          }

          // All other node_modules
          if (id.includes("node_modules")) {
            return "vendor";
          }
        },
      },
    },
    // Increase chunk size warning limit to 600kb
    chunkSizeWarningLimit: 600,
    // Use default minification (esbuild is faster than terser)
    minify: mode === "production" ? "esbuild" : false,
  },
}));
