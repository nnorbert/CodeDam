import { test, expect } from "../fixtures/test";
import { join } from "node:path";
import {
  buildHelloBeavyProgram,
  dismissOutput,
  openPlayground,
  playProgram,
} from "../helpers/playground";
import { hold, pointAt, typeSlowly } from "../helpers/pace";

/**
 * Tutorial 07 — Save and load
 * Shot list: tutorial-transcripts/07-save-and-load.md
 * Target length: ~60–75s
 */
test.describe("Tutorial 07 — Save and load", () => {
  test("save project, clear canvas, load it back", async ({ page }) => {
    await openPlayground(page);

    // Prepare a small finished program (pre-roll for the video)
    await buildHelloBeavyProgram(page);
    await hold(page, 1000);

    // 0:00–0:10 — show program + Save/Load
    await pointAt(page, page.getByRole("heading", { name: "Build Your Dam" }), 1000);
    await pointAt(page, page.getByTestId("save-project-button"), 1200);
    await pointAt(page, page.getByTestId("load-project-button"), 1200);
    await hold(page, 2500);

    // 0:10–0:25 — Save
    const downloadPromise = page.waitForEvent("download");
    await page.getByTestId("save-project-button").click();
    const saveDialog = page.getByRole("dialog");
    await expect(saveDialog.getByText("Save project")).toBeVisible();
    await typeSlowly(page, saveDialog.locator("#project-name"), "my-first-dam");
    await hold(page, 600);
    await saveDialog.getByRole("button", { name: "Save" }).click();
    const download = await downloadPromise;
    const downloadPath = join(
      test.info().outputDir,
      await download.suggestedFilename(),
    );
    await download.saveAs(downloadPath);
    await hold(page, 1500);

    // 0:25–0:40 — clear canvas via reload
    await page.reload();
    await expect(page.getByText("Drop planks here to build your dam!")).toBeVisible();
    await hold(page, 3500);

    // 0:40–0:55 — Load
    await page.getByTestId("load-project-button").click();
    const loadDialog = page.getByRole("dialog");
    await expect(loadDialog.getByText("Load project")).toBeVisible();
    await hold(page, 800);
    await loadDialog.locator('input[type="file"]').setInputFiles(downloadPath);
    await hold(page, 800);
    await loadDialog.getByRole("button", { name: "Load" }).click();
    await expect(page.getByText("Hello, Beavy!").first()).toBeVisible({ timeout: 15_000 });
    await hold(page, 2500);

    // 0:55–1:10 — Play to prove restore
    await playProgram(page);
    await dismissOutput(page, "Hello, Beavy!");
    await pointAt(page, page.locator("#logo, img[alt='CodeDam']").first(), 1500);
    await hold(page, 2500);
  });
});
