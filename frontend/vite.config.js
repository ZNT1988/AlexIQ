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
        target: process.env.VITE_API_URL || 'https://api.alexiq.site', // Railway API URL for development
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path // Keep /api prefix
      },
      '/health': {
        target: process.env.VITE_API_URL || 'https://api.alexiq.site',
        changeOrigin: true,
        secure: true
      }
    }
  }
})