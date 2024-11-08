import { defineConfig } from 'vitest/config';
import JsonArrayReporter from './benchmarks/jsonArrayReporter';

export default defineConfig({
  test: {
    setupFiles: ['test.ts'],
    include: ['src/**/*.spec.ts'],
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      reporter: ['lcov'],
      include: ['src/**'],
    },
    benchmark: {
      include: ['benchmarks/**/*.bench.ts'],
      reporters: [new JsonArrayReporter(), 'default'],
    },
  },
});
