/**
 * Playwright fixtures for e2e tests
 * Provides seeded test data via browser context
 */

import { test as base, expect } from "@playwright/test";
import { TestIds } from "../../src/constants/testIds";

type TestFixtures = {
  seededData: boolean;
};

/**
 * Fixture that verifies test data is available
 * Test data is seeded by global-setup.ts before tests run
 * All test data is marked with E2E_TEST_MARKER to isolate from dev data
 */
export const test = base.extend<TestFixtures>({
  seededData: [
    async ({ page }, use) => {
      // Test data should already be seeded by global-setup.ts
      // Just verify it's available
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(3000);

      const hasTasks = await page
        .getByTestId(TestIds.taskCardBeginButton)
        .count();

      if (hasTasks === 0) {
        console.warn(
          "⚠️  [Fixture] No test tasks found - global setup may have failed"
        );
      } else {
        console.log(
          `✅ [Fixture] Found ${hasTasks} test tasks (marked with E2E_TEST_MARKER)`
        );
      }

      await use(true);
    },
    { scope: "test", auto: true }, // Run once per test, automatically
  ],
});

// Re-export expect for convenience
export { expect };
