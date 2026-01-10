import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    isolate: true,
    pool: 'forks',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'tests/',
        'dist/',
        '*.config.*',
        'api/**',
        'pages/**',
        'scripts/**',
        'content/**',
      ],
      thresholds: {
        statements: 50,
        branches: 50,
        functions: 40,
        lines: 50,
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});
