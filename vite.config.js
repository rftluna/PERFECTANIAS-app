import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Librerías grandes en archivos separados: se cachean aparte y no se vuelven a bajar en cada deploy.
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('firebase') || id.includes('@firebase')) return 'firebase'
          if (id.includes('react-bootstrap') || id.includes('bootstrap') || id.includes('@restart') || id.includes('@popperjs')) return 'bootstrap'
          if (id.includes('react-dom') || id.includes('react-router') || id.includes('/react/') || id.includes('scheduler')) return 'react'
        },
      },
    },
  },
})
