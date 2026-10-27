import { defineConfig, devices } from "@playwright/test";

/**
 * E2E against a running server (default: the dev server on :3250, which is
 * where React reports hydration problems). Uses the locally installed Chrome,
 * so no browser download is needed.
 *
 *   pnpm dev --port 3250 & pnpm test:e2e
 *   E2E_BASE_URL=http://localhost:3260 pnpm test:e2e   # against `next start`
 */
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: process.env.E2E_BASE_URL || "http://localhost:3250",
    channel: "chrome",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"], channel: "chrome" } },
  ],
});
