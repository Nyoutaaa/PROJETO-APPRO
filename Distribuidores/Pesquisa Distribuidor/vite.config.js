import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'terser',
    rollupOptions: {
      external: ['react-toastify', 'react-leaflet', 'leaflet'],
      output: {
        globals: {
          'react-toastify': 'ReactToastify',
          'react-leaflet': 'ReactLeaflet',
          'leaflet': 'L'
        },
        manualChunks: undefined
      }
    }
  },
  optimizeDeps: {
    include: ['react-toastify', 'react-leaflet', 'leaflet']
  },
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
    strictPort: true
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 3000,
    strictPort: true
  }
}) 