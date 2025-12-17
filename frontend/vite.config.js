import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: true, // Enable Hot Module Replacement
    watch: {
      usePolling: true, // Helps with file system watching on Windows
    },
    // Dev-only proxy so frontend can call `/api/*` without CORS issues.
    // Backend runs on http://localhost:4000 and exposes routes under `/api`.
    proxy: {
      '/api': {
        target: 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
