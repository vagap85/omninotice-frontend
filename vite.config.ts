import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

function publicBase(): string {
  const raw = process.env.VITE_BASE_URL
  if (raw == null || raw === '') return '/'
  const trimmed = raw.replace(/\/$/, '') || '/'
  return trimmed === '/' ? '/' : `${trimmed}/`
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
  base: publicBase(),
  build: {
    outDir: 'dist',
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
