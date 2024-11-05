import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['test.ts'],
    include: ['./**/*.spec.ts'],
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['lcov'],
    },
  },
});
