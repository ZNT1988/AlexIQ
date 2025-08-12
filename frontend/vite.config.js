import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()]
  // Test configuration
  test: {
    globals: true
    environment: 'jsdom'
    setupFiles: './src/test/setup.js'
  }
  // Build optimizations
  build: {
    target: 'es2022'
    minify: 'esbuild'
    sourcemap: true
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
          ai: ['./src/IA/QuantumGenerator.js']
          routing: ['react-router-dom']
          ui: ['framer-motion', 'lucide-react']
        }
      }
    }
  }
  // Development server
  server: {
    port: 5173
    strictPort: false
    host: true
    cors: true
    proxy: {
      '/api': {
        target: 'http://localhost:3000'
        changeOrigin: true
        secure: false
        rewrite: (path) => path
      }
    }
  }
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version)
  }
});