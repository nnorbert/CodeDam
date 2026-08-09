import { defineConfig, devices } from "@playwright/test";
import { HQ_HEIGHT, HQ_WIDTH } from "./e2e/helpers/hqRecorder";

const isCI = !!process.env.CI;
/** Faster dry-runs: `TUTORIAL_SPEED=4 pnpm test:e2e` */
const tutorialSpeed = Number(process.env.TUTORIAL_SPEED ?? "1");

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: 1,
  timeout: Math.max(180_000, Math.round(180_000 / Math.max(tutorialSpeed, 0.25))),
  expect: {
    timeout: 15_000,
  },
  reporter: [["list"], ["html", { open: "never" }]],
  use: {
    /* Dedicated port so we never attach to an unrelated app on :5173 */
    baseURL: "http://127.0.0.1:5174",
    trace: "on-first-retry",
    /*
     * Built-in Playwright video is off on purpose:
     * - defaults to viewport scaled into ~800×800
     * - Chromium encoder bitrate is hardcoded (~1 Mbps)
     * Tutorials record via e2e/fixtures/test.ts (1080p / ~12 Mbps VP8).
     */
    video: "off",
    screenshot: "only-on-failure",
    viewport: { width: HQ_WIDTH, height: HQ_HEIGHT },
    deviceScaleFactor: 1,
    actionTimeout: 20_000,
    navigationTimeout: 30_000,
    launchOptions: {
      slowMo: tutorialSpeed <= 1 ? 40 : 0,
    },
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: HQ_WIDTH, height: HQ_HEIGHT },
        deviceScaleFactor: 1,
      },
    },
  ],
  webServer: {
    command: "pnpm dev --host 127.0.0.1 --port 5174",
    url: "http://127.0.0.1:5174",
    reuseExistingServer: !isCI,
    timeout: 120_000,
  },
});
