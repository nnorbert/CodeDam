import { test, expect } from "../fixtures/test";
import {
  configureUseValueText,
  dropExpressionInSlot,
  dropStatementOnCanvas,
  emptySlot,
  mainCanvas,
  openCategory,
  openPlayground,
  toolboxItem,
} from "../helpers/playground";
import { dragToolboxItemTo } from "../helpers/drag";
import { hold, pointAt } from "../helpers/pace";

/**
 * Tutorial 03 — Statements & expressions
 * Shot list: tutorial-transcripts/03-statements-and-expressions.md
 * Target length: ~80–95s
 */
test.describe("Tutorial 03 — Statements and expressions", () => {
  test("show planks vs slices and drop rules", async ({ page }) => {
    await openPlayground(page);

    // 0:00–0:10 — intro hold
    await hold(page, 8000);

    // 0:10–0:25 — open Variables, contrast plank vs slice
    await openCategory(page, "variables");
    await pointAt(page, toolboxItem(page, "createVar"), 1800);
    await pointAt(page, toolboxItem(page, "usePrimitiveValue"), 1800);
    await pointAt(page, toolboxItem(page, "useVar"), 1200);
    await hold(page, 4000);

    // 0:25–0:42 — planks = statements → dam
    await openCategory(page, "interactions");
    await pointAt(page, toolboxItem(page, "userOutput"), 1500);
    await pointAt(page, mainCanvas(page), 2000);
    await pointAt(page, page.getByText("Drop planks here to build your dam!"), 1500);
    await hold(page, 6000);

    // 0:42–1:00 — failed drop: slice onto empty dam
    await openCategory(page, "variables");
    const useValue = toolboxItem(page, "usePrimitiveValue");
    await pointAt(page, useValue, 1000);
    await dragToolboxItemTo(page, useValue, mainCanvas(page), {
      holdBeforeMs: 700,
      holdAfterMs: 1800,
    });
    // Expression must not stick on the dam
    await expect(page.getByText("Drop planks here to build your dam!")).toBeVisible();
    await hold(page, 2500);

    // 1:00–1:15 — plank on dam, slice in slot
    await openCategory(page, "interactions");
    await dropStatementOnCanvas(page, "userOutput");
    await hold(page, 800);
    await openCategory(page, "variables");
    const valueSlot = emptySlot(mainCanvas(page), "valueSlot");
    await pointAt(page, valueSlot, 1000);
    await dropExpressionInSlot(page, "usePrimitiveValue", valueSlot);
    await configureUseValueText(page, "ok");
    await hold(page, 2500);

    // 1:15–1:25 — recap points
    await pointAt(page, mainCanvas(page), 1500);
    await pointAt(page, page.locator(".wood-slice").first(), 1500);
    await hold(page, 4000);
  });
});
