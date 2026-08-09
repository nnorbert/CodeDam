import { test, expect } from "../fixtures/test";
import {
  configureUseValueNumber,
  configureUseValueText,
  configureVariableName,
  dismissOutput,
  dropExpressionInSlot,
  dropStatementOnCanvas,
  elseBranchCanvas,
  emptySlot,
  mainCanvas,
  openCategory,
  openPlayground,
  openWidgetSettings,
  playProgram,
  selectVariableInModal,
  thenBranchCanvas,
  toolboxItem,
} from "../helpers/playground";
import { hold, pointAt } from "../helpers/pace";

/**
 * Tutorial 05 — Decisions (If / If-Else)
 * Shot list: tutorial-transcripts/05-decisions.md
 * Target length: ~80–100s
 */
test.describe("Tutorial 05 — Decisions", () => {
  test("If-Else age check with both paths", async ({ page }) => {
    await openPlayground(page);

    // 0:00–0:10 — Decisions category
    await openCategory(page, "decisions");
    await pointAt(page, toolboxItem(page, "if"), 1200);
    await pointAt(page, toolboxItem(page, "if-else"), 1500);
    await hold(page, 2500);

    // 0:10–0:25 — age = 12
    await openCategory(page, "variables");
    await dropStatementOnCanvas(page, "createVar");
    await configureVariableName(page, "age");
    await dropExpressionInSlot(
      page,
      "usePrimitiveValue",
      emptySlot(mainCanvas(page), "valueSlot"),
    );
    await configureUseValueNumber(page, 12);
    await hold(page, 1000);

    // 0:25–0:45 — If-Else + ≥ condition
    await openCategory(page, "decisions");
    await dropStatementOnCanvas(page, "if-else");
    await hold(page, 800);

    await openCategory(page, "comparisons");
    await dropExpressionInSlot(
      page,
      "greaterOrEqual",
      emptySlot(mainCanvas(page), "conditionSlot"),
    );
    await hold(page, 800);

    await openCategory(page, "variables");
    const leftSlot = emptySlot(mainCanvas(page), "leftOperand");
    await dropExpressionInSlot(page, "useVar", leftSlot);
    await selectVariableInModal(page, "age");
    await expect(mainCanvas(page).getByText("age").nth(1)).toBeVisible();

    const rightSlot = emptySlot(mainCanvas(page), "rightOperand");
    await dropExpressionInSlot(page, "usePrimitiveValue", rightSlot);
    await configureUseValueNumber(page, 10);
    await expect(page.locator("[data-slot-name='leftOperand']")).toHaveCount(0);
    await expect(page.locator("[data-slot-name='rightOperand']")).toHaveCount(0);
    await hold(page, 1000);

    // 0:45–1:05 — then / else User Output
    await openCategory(page, "interactions");
    await dropStatementOnCanvas(page, "userOutput", thenBranchCanvas(page));
    await openCategory(page, "variables");
    await dropExpressionInSlot(
      page,
      "usePrimitiveValue",
      emptySlot(thenBranchCanvas(page), "valueSlot"),
    );
    await configureUseValueText(page, "You can play!");

    await openCategory(page, "interactions");
    await dropStatementOnCanvas(page, "userOutput", elseBranchCanvas(page));
    await openCategory(page, "variables");
    await dropExpressionInSlot(
      page,
      "usePrimitiveValue",
      emptySlot(elseBranchCanvas(page), "valueSlot"),
    );
    await configureUseValueText(page, "Ask a grown-up first.");
    await hold(page, 1200);

    // 1:05–1:20 — Play (then path)
    await playProgram(page);
    await dismissOutput(page, "You can play!");
    await hold(page, 1500);

    // 1:20–1:35 — change age to 8, Play again (else path)
    const ageValue = mainCanvas(page).locator(".wood-slice").filter({ hasText: "12" }).first();
    await openWidgetSettings(page, ageValue);
    await configureUseValueNumber(page, 8);
    await hold(page, 800);
    await playProgram(page);
    await dismissOutput(page, "Ask a grown-up first.");
    await hold(page, 2500);
  });
});
