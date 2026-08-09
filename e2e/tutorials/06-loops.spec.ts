import { test } from "../fixtures/test";
import {
  configureUseValueNumber,
  dismissOutput,
  dropExpressionInSlot,
  dropStatementOnCanvas,
  emptySlot,
  mainCanvas,
  nestedBodyCanvas,
  openCategory,
  openPlayground,
  playProgram,
  selectVariableInModal,
  toolboxItem,
} from "../helpers/playground";
import { hold, pointAt } from "../helpers/pace";

/**
 * Tutorial 06 — Loops
 * Shot list: tutorial-transcripts/06-loops.md
 * Target length: ~80–100s
 */
test.describe("Tutorial 06 — Loops", () => {
  test("Repeat N with index output", async ({ page }) => {
    await openPlayground(page);

    // 0:00–0:08 — Loops category
    await openCategory(page, "loops");
    await pointAt(page, toolboxItem(page, "repeat-n"), 1500);
    await pointAt(page, toolboxItem(page, "while-loop"), 1500);
    await hold(page, 1500);

    // 0:08–0:20 — Repeat N, count = 3, point at index
    await dropStatementOnCanvas(page, "repeat-n");
    await openCategory(page, "variables");
    await dropExpressionInSlot(
      page,
      "usePrimitiveValue",
      emptySlot(mainCanvas(page), "countSlot"),
    );
    await configureUseValueNumber(page, 3);
    await pointAt(page, page.getByText("using"), 800);
    await pointAt(page, page.getByText("index").first(), 1500);
    await hold(page, 2500);

    // 0:20–0:40 — body: User Output → Use Variable(index)
    await openCategory(page, "interactions");
    await dropStatementOnCanvas(page, "userOutput", nestedBodyCanvas(page));
    await openCategory(page, "variables");
    await dropExpressionInSlot(
      page,
      "useVar",
      emptySlot(nestedBodyCanvas(page), "valueSlot"),
    );
    await selectVariableInModal(page, "index");
    await hold(page, 1500);

    // 0:40–0:55 — Code Preview
    await pointAt(page, page.getByText("Code Preview"), 1000);
    await hold(page, 4000);

    // 0:55–1:15 — Play, show 0, 1, 2
    await playProgram(page);
    await dismissOutput(page, "0");
    await dismissOutput(page, "1");
    await dismissOutput(page, "2");
    await hold(page, 2000);

    // 1:15–1:25 — hover While without building
    await openCategory(page, "loops");
    await pointAt(page, toolboxItem(page, "while-loop"), 2500);
    await hold(page, 3000);
  });
});
