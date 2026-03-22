import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/shattered-game/',
  build: {
    chunkSizeWarningLimit: 600,
    outDir: 'dist',
  },
})
