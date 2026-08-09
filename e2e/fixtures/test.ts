import { test as base, expect } from "@playwright/test";
import { HQ_HEIGHT, HQ_WIDTH, startHqRecorder } from "../helpers/hqRecorder";

/**
 * Tutorial tests use a custom 1080p / high-bitrate screencast→ffmpeg pipeline.
 * Playwright’s built-in `video: on` is intentionally off (hardcoded ~1 Mbps + default downscale).
 */
export const test = base.extend({
  // Match recording size so pixels aren’t stretched.
  viewport: { width: HQ_WIDTH, height: HQ_HEIGHT },
  deviceScaleFactor: 1,

  page: async ({ page }, use, testInfo) => {
    const outputPath = testInfo.outputPath("tutorial-1080p.webm");
    const recorder = await startHqRecorder(page, outputPath);

    await use(page);

    const saved = await recorder.stop();
    if (saved) {
      await testInfo.attach("tutorial-1080p", {
        path: saved,
        contentType: "video/webm",
      });
    }
  },
});

export { expect };
