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
    // Match `*.test.ts`, `*.test.tsx`, `*.spec.ts`, `*.spec.tsx`. The
    // earlier glob `*.{test,spec,test.tsx,spec.tsx}` expanded to the
    // wrong set — `.ts` test files were silently skipped, which made
    // Phase-5 validator tests look like they ran when they didn't.
    include: ['src/test/**/*.{test,spec}.{ts,tsx}'],
    testTimeout: 10000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
