import { expect, type Locator, type Page } from "@playwright/test";
import { dragToolboxItemTo, dragToolboxItemToPoint } from "./drag";
import { hold, pointAt, typeSlowly } from "./pace";

const CONSENT_KEY = "codedam_analytics_consent";

export async function dismissAnalytics(page: Page): Promise<void> {
  await page.addInitScript((key) => {
    window.localStorage.setItem(key, "denied");
  }, CONSENT_KEY);
}

export async function openPlayground(page: Page): Promise<void> {
  await dismissAnalytics(page);
  await page.goto("/playground");
  await expect(page.getByText("Workshop", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Build Your Dam" })).toBeVisible();
  await hold(page, 800);
}

export function mainCanvas(page: Page): Locator {
  return page.getByTestId("canvas");
}

export function toolboxItem(page: Page, type: string): Locator {
  return page.getByTestId(`tool-${type}`);
}

export function thenBranchCanvas(page: Page): Locator {
  return page.locator('[data-droppable="canvas"][data-testid$="-then"]').first();
}

export function elseBranchCanvas(page: Page): Locator {
  return page.locator('[data-droppable="canvas"][data-testid$="-else"]').first();
}

/** Nested body for Repeat N / While / If (single nested canvas under a statement). */
export function nestedBodyCanvas(page: Page): Locator {
  return page.locator('[data-droppable="canvas"][data-nested="true"]').first();
}

export function emptySlot(scope: Locator | Page, slotName: string): Locator {
  return scope.locator(`[data-droppable="slot"][data-slot-name="${slotName}"]`).first();
}

export async function openCategory(page: Page, category: string): Promise<void> {
  const header = page.locator("#toolbox-container").getByRole("button", {
    name: new RegExp(`^${category}$`, "i"),
  });
  await pointAt(page, header, 500);
  const expanded = await header.getAttribute("aria-expanded");
  if (expanded !== "true") {
    await header.click();
    await hold(page, 500);
  }
}

export async function dropStatementOnCanvas(
  page: Page,
  toolType: string,
  canvas: Locator = mainCanvas(page),
): Promise<void> {
  const lastPlank = canvas.locator(".sortable-item").last();
  const hasPlanks = (await lastPlank.count()) > 0;
  const tool = toolboxItem(page, toolType);

  if (hasPlanks) {
    // Release a bit under the last plank so the canvas (not the plank) is `over`
    // → widget is appended. Visually this reads as “drop after the last block”.
    const box = await lastPlank.boundingBox();
    const canvasBox = await canvas.boundingBox();
    if (!box || !canvasBox) {
      throw new Error("Could not resolve canvas/plank bounds for statement drop");
    }
    const endX = box.x + Math.min(box.width / 2, 160);
    const endY = Math.min(box.y + box.height + 28, canvasBox.y + canvasBox.height - 24);
    await dragToolboxItemToPoint(page, tool, endX, endY);
  } else {
    // Empty dam: land near the top / empty-message area
    await dragToolboxItemTo(page, tool, canvas, { targetPoint: "nearTop" });
  }
}

export async function dropExpressionInSlot(
  page: Page,
  toolType: string,
  slot: Locator,
): Promise<void> {
  await expect(slot).toBeVisible();
  await dragToolboxItemTo(page, toolboxItem(page, toolType), slot, {
    targetPoint: "center",
  });
}

export async function saveConfigModal(page: Page): Promise<void> {
  const panel = page
    .locator(".rounded-2xl.bg-white")
    .filter({ has: page.getByRole("button", { name: "Save" }) });
  await expect(panel).toBeVisible();
  await hold(page, 400);
  await panel.getByRole("button", { name: "Save" }).click();
  await expect(panel).toBeHidden({ timeout: 10_000 });
  await hold(page, 500);
}

export async function configureVariableName(page: Page, name: string): Promise<void> {
  await expect(
    page.getByRole("heading", { name: /Configure (Variable|Constant)/ }),
  ).toBeVisible();
  const input = page.locator(".rounded-2xl.bg-white input[type='text']").first();
  await typeSlowly(page, input, name);
  await saveConfigModal(page);
}

export async function configureUseValueText(page: Page, text: string): Promise<void> {
  await expect(page.getByText("Configure Value")).toBeVisible();
  await page.getByRole("button", { name: "Text" }).click();
  await hold(page, 300);
  const input = page.getByPlaceholder("Enter text...");
  await typeSlowly(page, input, text);
  await saveConfigModal(page);
}

export async function configureUseValueNumber(page: Page, value: string | number): Promise<void> {
  await expect(page.getByText("Configure Value")).toBeVisible();
  await page.getByRole("button", { name: "Number" }).click();
  await hold(page, 300);
  const input = page.getByPlaceholder("e.g. 42 or 3.14");
  await typeSlowly(page, input, String(value));
  await saveConfigModal(page);
}

export async function selectVariableInModal(page: Page, variableName: string): Promise<void> {
  const panel = page
    .locator(".rounded-2xl.bg-white")
    .filter({ has: page.getByRole("heading", { name: "Select Variable" }) });
  await expect(panel).toBeVisible();
  await hold(page, 400);

  const select = panel.locator("select");
  await expect(select.locator("option", { hasText: variableName })).toHaveCount(1, {
    timeout: 10_000,
  });
  await select.selectOption({ label: variableName });
  await expect(select).not.toHaveValue("");
  await hold(page, 500);
  await panel.getByRole("button", { name: "Save" }).click();
  await expect(panel).toBeHidden({ timeout: 10_000 });
  await hold(page, 500);
}

export async function playProgram(page: Page): Promise<void> {
  const play = page.getByTestId("play-pause-button");
  await pointAt(page, play, 600);
  await play.click();
  await hold(page, 700);
}

export async function dismissOutput(page: Page, expectedText?: string | RegExp): Promise<void> {
  const ok = page.getByRole("button", { name: "OK" });
  await expect(ok).toBeVisible({ timeout: 20_000 });
  if (expectedText !== undefined) {
    await expect(page.locator("pre")).toContainText(expectedText);
  }
  await hold(page, 1600);
  await ok.click();
  await hold(page, 500);
}

export async function switchCodeLanguage(
  page: Page,
  language: "JavaScript" | "Python",
): Promise<void> {
  const select = page.locator("select").filter({ hasText: "JavaScript" });
  await pointAt(page, select, 500);
  await select.selectOption({ label: language });
  await hold(page, 1200);
}

export async function openWidgetSettings(page: Page, widgetLocator: Locator): Promise<void> {
  await widgetLocator.locator(".widget-menu-button").click();
  await hold(page, 400);
  await page.getByRole("menuitem", { name: "Settings" }).click();
  await hold(page, 400);
}

/** Build the Video 02 hello program (also used as seed for save/load). */
export async function buildHelloBeavyProgram(page: Page): Promise<void> {
  await openCategory(page, "interactions");
  await dropStatementOnCanvas(page, "userOutput");
  await openCategory(page, "variables");
  await dropExpressionInSlot(page, "usePrimitiveValue", emptySlot(mainCanvas(page), "valueSlot"));
  await configureUseValueText(page, "Hello, Beavy!");
}
