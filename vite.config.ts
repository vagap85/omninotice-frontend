/// <reference types="vitest" />
import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

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
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/types/**',
        'src/main.tsx',
        'src/theme.ts',
        'src/pages/back-up/**',
        'src/components/back-up/**',
        'src/components/atoms/Icons/**',
        'src/components/organisms/SelectingRecipientApp/**',
        'src/components/organisms/SelectingRecipientApp-v2/**',
      ],
    },
    alias: {
      '\\.(jpg|jpeg|png|gif|svg|webp)$': path.resolve(
        __dirname,
        './src/test/__mocks__/fileMock.ts'
      ),
    },
  },
})