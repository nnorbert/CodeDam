import { expect, test } from "../fixtures/test";
import {
  configureUseValueText,
  dropExpressionInSlot,
  dropStatementOnCanvas,
  emptySlot,
  mainCanvas,
  openCategory,
  openPlayground,
  playProgram,
  dismissOutput,
  switchCodeLanguage,
} from "../helpers/playground";
import { hold, pointAt } from "../helpers/pace";

/**
 * Tutorial 02 — Your first program
 * Shot list: tutorial-transcripts/02-your-first-program.md
 * Target length: ~75–90s
 */
test.describe("Tutorial 02 — Your first program", () => {
  test("build Hello Beavy and run", async ({ page }) => {
    await openPlayground(page);

    // 0:00–0:08 — empty playground tour
    await expect(page.getByText("Drop planks here to build your dam!")).toBeVisible();
    await pointAt(page, page.getByText("Workshop"), 1200);
    await pointAt(page, page.getByRole("heading", { name: "Build Your Dam" }), 1200);
    await pointAt(page, page.getByText("Code Preview"), 1000);
    await pointAt(page, page.getByTestId("play-pause-button"), 1200);
    await hold(page, 2000);

    // 0:08–0:20 — User Output
    await openCategory(page, "interactions");
    await hold(page, 800);
    await dropStatementOnCanvas(page, "userOutput");
    await hold(page, 1500);

    // 0:20–0:40 — Use Value text
    await openCategory(page, "variables");
    await hold(page, 600);
    await dropExpressionInSlot(
      page,
      "usePrimitiveValue",
      emptySlot(mainCanvas(page), "valueSlot"),
    );
    await configureUseValueText(page, "Hello, Beavy!");
    await hold(page, 1500);

    // 0:40–0:55 — Code Preview language switch
    await pointAt(page, page.getByText("Code Preview"), 800);
    await hold(page, 2000);
    await switchCodeLanguage(page, "Python");
    await switchCodeLanguage(page, "JavaScript");
    await hold(page, 2000);

    // 0:55–1:15 — Play
    await playProgram(page);
    await dismissOutput(page, "Hello, Beavy!");
    await hold(page, 2500);
  });
});
