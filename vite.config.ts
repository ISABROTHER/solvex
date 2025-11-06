import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
  },
  
  // --- THIS IS THE FIX ---
  // We are telling esbuild (which Vite uses)
  // that 'top-level-await' is supported.
  esbuild: {
    supported: {
      'top-level-await': true
    }
  },
  
  // We also need to add this to the dependency optimizer
  // to fix the "pre-transform" error.
  optimizeDeps: {
    esbuildOptions: {
      supported: {
        'top-level-await': true
      }
    }
  }
  // --- END OF FIX ---
})