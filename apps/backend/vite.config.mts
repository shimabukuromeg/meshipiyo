import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    globalSetup: 'test/setup-global.ts',
    setupFiles: ['test/setup.ts'],
    coverage: {
      provider: 'v8',
      all: true,
    },
  },
  plugins: [],
})
