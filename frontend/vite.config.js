import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist'
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3003', // ✅ Port correct pour backend optimisé
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path // Keep /api prefix
      }
    }
  }
})