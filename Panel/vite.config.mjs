import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    host: '0.0.0.0',
    port: process.env.PORT || 4173
  },
  preview: {
    host: '0.0.0.0',
    port: process.env.PORT || 4173
  }
})
