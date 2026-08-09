import type { Page } from "@playwright/test";

/**
 * Pacing for tutorial screen recordings.
 * Segment durations come from the shot lists in /tutorial-transcripts.
 * Override with TUTORIAL_SPEED (e.g. 4 = 4× faster) for dry runs.
 */
const speed = Math.max(Number(process.env.TUTORIAL_SPEED ?? "1"), 0.25);

export function ms(durationMs: number): number {
  return Math.max(50, Math.round(durationMs / speed));
}

/** Hold still so narration can breathe and the viewer can follow. */
export async function hold(page: Page, durationMs: number): Promise<void> {
  await page.waitForTimeout(ms(durationMs));
}

/** Move the mouse slowly toward an element and pause on it (highlight beat). */
export async function pointAt(
  page: Page,
  target: { boundingBox(): Promise<{ x: number; y: number; width: number; height: number } | null> },
  pauseMs = 800,
): Promise<void> {
  const box = await target.boundingBox();
  if (!box) return;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 24 });
  await hold(page, pauseMs);
}

/** Type text character-by-character so viewers can read it. */
export async function typeSlowly(
  page: Page,
  locator: { click(): Promise<void>; fill(value: string): Promise<void> },
  text: string,
  charDelayMs = 90,
): Promise<void> {
  await locator.click();
  await locator.fill("");
  for (const char of text) {
    await page.keyboard.type(char, { delay: ms(charDelayMs) });
  }
  await hold(page, 400);
}
