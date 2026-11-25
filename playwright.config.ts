import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  // Dirección explícita y no `localhost`: `astro preview` escucha en una sola
  // (en Windows, solo [::1]) y firefox a veces resuelve `localhost` a la otra
  // y recibe NS_ERROR_CONNECTION_REFUSED (PORT-US-20). Ver
  // tests/unit/playwright-config.test.ts.
  use: { baseURL: 'http://127.0.0.1:4321', trace: 'on-first-retry' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1',
    url: 'http://127.0.0.1:4321/es/',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
