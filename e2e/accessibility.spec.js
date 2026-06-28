import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { BASE_URL } from "./helpers.js";

test.describe("Accessibility Audits", () => {
  test("Homepage should not have serious or critical WCAG violations", async ({
    page,
  }) => {
    await page.goto(BASE_URL);

    await expect(page.locator("vite-error-overlay")).toHaveCount(0);

    const results = await new AxeBuilder({ page }).analyze();

    const severeViolations = results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical"
    );

    expect(severeViolations).toEqual([]);
  });

  test("404 page should not have serious or critical WCAG violations", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/this-route-does-not-exist`);

    await expect(page.locator("vite-error-overlay")).toHaveCount(0);

    const results = await new AxeBuilder({ page }).analyze();

    const severeViolations = results.violations.filter(
      (violation) =>
        violation.impact === "serious" || violation.impact === "critical"
    );

    expect(severeViolations).toEqual([]);
  });
});
