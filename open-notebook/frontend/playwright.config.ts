import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  use: {
    baseURL: 'http://localhost:3000',
    locale: 'zh-CN',
    trace: 'on-first-retry',
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:3000',
          localStorage: [{ name: 'i18nextLng', value: 'zh-CN' }],
        },
      ],
    },
  },
  webServer: undefined,
})
