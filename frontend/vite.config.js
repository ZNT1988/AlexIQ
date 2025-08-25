import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  // Base path for Vercel deployment
  base: "/",
  // Test configuration
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.js"
  },
  // Build optimizations for Vercel
  build: {
    target: "es2020",
    minify: "esbuild",
    sourcemap: false,
    outDir: "dist",
    assetsDir: "assets",
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          routing: ["react-router-dom"],
          ui: ["framer-motion", "lucide-react"]
        },
        assetFileNames: "assets/[name]-[hash].[ext]",
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: "assets/[name]-[hash].js"
      }
    }
  },
  // Development server
  server: {
    port: 5173,
    strictPort: false,
    host: true,
    cors: true,
    proxy: {
      "/api": {
        target: "http://localhost:3003",
        changeOrigin: true,
        secure: false,
        rewrite: path => path
      }
    }
  },
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});
