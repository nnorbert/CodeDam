import type { Locator, Page } from "@playwright/test";
import { hold } from "./pace";

/**
 * Pointer drag compatible with @dnd-kit (needs ≥5px movement before activation).
 * Moves slowly so the action is clear on tutorial video.
 */
export async function dragToolboxItemTo(
  page: Page,
  source: Locator,
  target: Locator,
  options?: {
    holdBeforeMs?: number;
    holdAfterMs?: number;
    /** Where on the target to release (default: center). */
    targetPoint?: "center" | "bottom" | "top" | "nearTop";
  },
): Promise<void> {
  const holdBefore = options?.holdBeforeMs ?? 600;
  const holdAfter = options?.holdAfterMs ?? 900;
  const targetPoint = options?.targetPoint ?? "center";

  await source.scrollIntoViewIfNeeded();
  await target.scrollIntoViewIfNeeded();

  const from = await source.boundingBox();
  const to = await target.boundingBox();
  if (!from || !to) {
    throw new Error("Could not resolve drag source/target bounding boxes");
  }

  const startX = from.x + from.width / 2;
  const startY = from.y + from.height / 2;
  const endX = to.x + Math.min(to.width / 2, 160);
  let endY = to.y + to.height / 2;
  if (targetPoint === "bottom") {
    endY = to.y + to.height - 6;
  } else if (targetPoint === "top") {
    endY = to.y + 8;
  } else if (targetPoint === "nearTop") {
    endY = to.y + Math.min(96, to.height * 0.18);
  }

  await page.mouse.move(startX, startY, { steps: 12 });
  await hold(page, holdBefore);
  await page.mouse.down();
  await page.mouse.move(startX + 12, startY + 8, { steps: 6 });
  await page.mouse.move(endX, endY, { steps: 36 });
  await hold(page, 350);
  await page.mouse.up();
  await hold(page, holdAfter);
}

/**
 * Drag a toolbox item to absolute page coordinates (natural stacking under last plank).
 */
export async function dragToolboxItemToPoint(
  page: Page,
  source: Locator,
  endX: number,
  endY: number,
  options?: { holdBeforeMs?: number; holdAfterMs?: number },
): Promise<void> {
  const holdBefore = options?.holdBeforeMs ?? 600;
  const holdAfter = options?.holdAfterMs ?? 900;

  await source.scrollIntoViewIfNeeded();
  const from = await source.boundingBox();
  if (!from) {
    throw new Error("Could not resolve drag source bounding box");
  }

  const startX = from.x + from.width / 2;
  const startY = from.y + from.height / 2;

  await page.mouse.move(startX, startY, { steps: 12 });
  await hold(page, holdBefore);
  await page.mouse.down();
  await page.mouse.move(startX + 12, startY + 8, { steps: 6 });
  await page.mouse.move(endX, endY, { steps: 36 });
  await hold(page, 350);
  await page.mouse.up();
  await hold(page, holdAfter);
}
