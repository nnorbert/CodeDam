import { expect, test } from "../fixtures/test";
import {
  configureUseValueNumber,
  configureVariableName,
  dismissOutput,
  dropExpressionInSlot,
  dropStatementOnCanvas,
  emptySlot,
  mainCanvas,
  openCategory,
  openPlayground,
  playProgram,
  selectVariableInModal,
  toolboxItem,
} from "../helpers/playground";
import { hold, pointAt } from "../helpers/pace";

/**
 * Tutorial 04 — Variables and constants
 * Shot list: tutorial-transcripts/04-variables-and-constants.md
 * Target length: ~80–100s
 */
test.describe("Tutorial 04 — Variables and constants", () => {
  test("create score, set it, show it, then show constant", async ({ page }) => {
    await openPlayground(page);

    // 0:00–0:10 — Variables category
    await openCategory(page, "variables");
    await pointAt(page, toolboxItem(page, "createVar"), 1500);
    await pointAt(page, toolboxItem(page, "createConst"), 1500);
    await hold(page, 3000);

    // 0:10–0:30 — Create Variable score = 0
    await dropStatementOnCanvas(page, "createVar");
    await configureVariableName(page, "score");
    await dropExpressionInSlot(
      page,
      "usePrimitiveValue",
      emptySlot(mainCanvas(page), "valueSlot"),
    );
    await configureUseValueNumber(page, 0);
    await hold(page, 1500);

    // 0:30–0:50 — Set Variable score = 10
    await dropStatementOnCanvas(page, "setVar");
    await selectVariableInModal(page, "score");
    await expect(mainCanvas(page).getByText("score").first()).toBeVisible();
    await dropExpressionInSlot(
      page,
      "usePrimitiveValue",
      emptySlot(mainCanvas(page), "valueSlot"),
    );
    await configureUseValueNumber(page, 10);
    await expect(mainCanvas(page).getByText("10").first()).toBeVisible();
    await hold(page, 1500);

    // 0:50–1:05 — User Output + Use Variable(score)
    await openCategory(page, "interactions");
    await dropStatementOnCanvas(page, "userOutput");
    await openCategory(page, "variables");
    await dropExpressionInSlot(
      page,
      "useVar",
      emptySlot(mainCanvas(page), "valueSlot"),
    );
    await selectVariableInModal(page, "score");
    await hold(page, 1500);

    // 1:05–1:20 — Play
    await pointAt(page, page.getByText("Code Preview"), 800);
    await playProgram(page);
    await dismissOutput(page, "10");
    await hold(page, 1500);

    // 1:20–1:35 — Create Constant briefly
    await openCategory(page, "variables");
    await pointAt(page, toolboxItem(page, "createConst"), 1000);
    await dropStatementOnCanvas(page, "createConst");
    await configureVariableName(page, "points");
    await dropExpressionInSlot(
      page,
      "usePrimitiveValue",
      emptySlot(mainCanvas(page), "valueSlot"),
    );
    await configureUseValueNumber(page, 10);
    await hold(page, 3500);
  });
});
