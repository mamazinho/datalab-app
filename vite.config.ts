/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
	root: './',
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
    // Teste de página monta a árvore inteira e digita formulário: 5s aperta
    // quando a suíte roda em paralelo, e a instrumentação de cobertura dobra o
    // custo de cada render.
    testTimeout: 30_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/**/*.style.ts', 'src/types/**'],
    },
  },
})
