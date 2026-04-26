import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  base: '',
  server: {
    host: '::',
    port: 8080,
    hmr: false,
  },
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['src/test/setup.ts'],
    include: ['src/test/**/*.{test,spec,test.tsx,spec.tsx}'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
