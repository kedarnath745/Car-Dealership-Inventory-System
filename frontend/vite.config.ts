/// <reference types="vitest/config" />
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    // In development the SPA calls /api on its own origin and Vite forwards it,
    // so no CORS setup is needed locally.
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    // Fixed time zone so date formatting is deterministic on every machine.
    env: { TZ: 'Asia/Kolkata' },
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.d.ts'],
      reporter: ['text', 'text-summary', 'lcov'],
    },
  },
});
