import { test, expect } from "../fixtures/test";
import { dismissAnalytics } from "../helpers/playground";
import { hold, pointAt } from "../helpers/pace";

/**
 * Tutorial 01 — What is CodeDam?
 * Shot list: tutorial-transcripts/01-what-is-codedam.md
 * Target length: ~60–75s
 */
test.describe("Tutorial 01 — What is CodeDam?", () => {
  test("landing tour then open playground", async ({ page }) => {
    await dismissAnalytics(page);
    await page.goto("/");

    // 0:00–0:08 — hero hold
    const beavy = page.locator('img.landing-hero__img[alt="Beavy"]');
    await expect(beavy).toBeVisible();
    await hold(page, 8000);

    // 0:08–0:16 — hover Beavy / bubble
    const bubble = page.locator(".landing-hero__bubble-text");
    await pointAt(page, beavy, 1500);
    await pointAt(page, bubble, 2500);
    await hold(page, 4000);

    // 0:16–0:28 — intro paragraph
    const intro = page.getByLabel("About CodeDam");
    await intro.scrollIntoViewIfNeeded();
    await pointAt(page, intro.locator(".landing-intro__copy"), 2000);
    await hold(page, 9000);

    // 0:28–0:40 — how it works + bullets
    const how = page.getByLabel("How it works");
    await how.scrollIntoViewIfNeeded();
    await pointAt(page, how.getByText("Build with blocks. Learn real code."), 1500);
    await pointAt(page, how.getByText("Drag & drop"), 900);
    await pointAt(page, how.getByText("Step through code"), 900);
    await pointAt(page, how.getByText("Real languages"), 900);
    await pointAt(page, how.getByText("Save & share"), 900);
    await hold(page, 4000);

    // 0:40–0:50 — devices, then back toward CTA
    const devices = page.getByLabel("Devices");
    await devices.scrollIntoViewIfNeeded();
    await pointAt(page, devices.getByText("Code anywhere — on any device"), 2000);
    await hold(page, 4000);

    await page.locator(".landing-hero-cta").scrollIntoViewIfNeeded();
    await hold(page, 2000);

    // 0:50–1:05 — Start Building → playground tour
    const cta = page.locator("a.landing-hero-cta__button", { hasText: "Start Building" });
    await pointAt(page, cta, 1000);
    await cta.click();
    await expect(page).toHaveURL(/\/playground/);
    await expect(page.getByText("Workshop")).toBeVisible();
    await hold(page, 1000);

    await pointAt(page, page.getByText("Workshop"), 1200);
    await pointAt(page, page.getByRole("heading", { name: "Build Your Dam" }), 1200);
    await pointAt(page, page.getByText("Code Preview"), 1200);
    await pointAt(page, page.getByTestId("play-pause-button"), 1500);
    await hold(page, 3000);
  });
});
