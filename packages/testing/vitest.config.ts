import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/core/resolvers/types.ts', 'src/adapters/vitest.ts', 'src/core/resolvers/node-fs.ts'],
      reporter: ['text', 'text-summary', 'lcov'],
      thresholds: {
        statements: 97,
        branches: 90,
        functions: 96,
        lines: 97,
      },
    },
  },
});
