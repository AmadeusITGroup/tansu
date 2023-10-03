import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    setupFiles: ['test.ts'],
    include: ['./**/*.spec.ts'],
    environment: 'happy-dom',
    coverage: {
      provider: 'istanbul',
      reporter: ['lcov'],
    },
  },
});
