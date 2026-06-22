import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.glb', '**/*.mp3', '**/*.mp4', '**/*.webm', '**/*.woff2'],
  server: {
    port: parseInt(process.env.PORT) || 5173,
  },
})
