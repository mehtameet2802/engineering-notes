import { defineConfig } from '@playwright/test';
import scenarios from './tests/scenarios.json' with { type: 'json' };
import { resolve } from 'node:path';

const root = import.meta.dirname;
const DEV_PORT = 4510;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: [['list']],
  use: { channel: 'chrome', colorScheme: 'light' },
  webServer: [
    ...Object.entries(scenarios).map(([name, { port }]) => ({
      command: `node tests/serve.mjs dist-test/${name} ${port}`,
      url: `http://127.0.0.1:${port}/engineering-notes/`,
      reuseExistingServer: false,
    })),
    {
      // Development server on the "none" fixture, whose only article is a draft.
      command: `npx astro dev --port ${DEV_PORT} --host 127.0.0.1`,
      url: `http://127.0.0.1:${DEV_PORT}/engineering-notes/`,
      env: { ARTICLES_DIR: resolve(root, 'tests/fixtures/none') },
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
