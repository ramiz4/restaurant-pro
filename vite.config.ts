import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
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
          // Vendor chunks
          if (id.includes("node_modules")) {
            // React core
            if (id.includes("react") || id.includes("react-dom")) {
              return "vendor-react";
            }
            // Router
            if (id.includes("react-router")) {
              return "vendor-router";
            }
            // Charts (largest library)
            if (id.includes("recharts") || id.includes("d3-")) {
              return "vendor-charts";
            }
            // UI libraries
            if (id.includes("@radix-ui") || id.includes("lucide-react")) {
              return "vendor-ui";
            }
            // Forms
            if (
              id.includes("react-hook-form") ||
              id.includes("@hookform") ||
              id.includes("zod")
            ) {
              return "vendor-forms";
            }
            // Query
            if (id.includes("@tanstack/react-query")) {
              return "vendor-query";
            }
            // Other vendors
            return "vendor";
          }

          // App chunks
          if (id.includes("src/pages/")) {
            // Extract page name from path
            const pageName = id
              .split("/")
              .pop()
              ?.replace(".tsx", "")
              .toLowerCase();
            if (pageName === "reports" || pageName === "dashboard") {
              return `page-${pageName}`;
            }
            return "pages";
          }

          if (id.includes("src/components/ui/")) {
            return "ui-components";
          }

          if (id.includes("src/lib/")) {
            return "lib";
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
