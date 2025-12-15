import { test, expect } from "./fixtures";
import { TestIds } from "../../src/constants/testIds";

/**
 * Web e2e test: Begin task and navigate to questions screen
 * Tests core task flow: dashboard → begin task → questions screen
 *
 * Note: Test data is automatically seeded via fixtures before tests run
 * and cleaned up after tests complete (see global-teardown.ts)
 */
test.describe("Begin Task and Navigate", () => {
  test("should begin a task and open questions screen", async ({ page }) => {
    // Navigate to the app
    await page.goto("/");

    // Wait for app to fully load - React Native Web needs time to hydrate
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000); // Give React Native Web time to render

    // Verify we're on the dashboard by checking for the Dashboard header
    // This is more reliable than checking for the tasks view which may not exist if no tasks
    const dashboardHeader = page.getByText("Dashboard");
    await expect(dashboardHeader).toBeVisible({ timeout: 10000 });

    // Wait for tasks to load - check for either tasks view or empty state
    const newDashboard = page.getByTestId(TestIds.dashboardGroupedTasksView);
    const legacyDashboard = page.getByTestId(TestIds.dashboardTasksGroupedView);
    const emptyState = page.getByText("No tasks available.");

    // Wait for one of: tasks view, empty state, or loading to complete
    await Promise.race([
      newDashboard
        .waitFor({ state: "visible", timeout: 5000 })
        .catch(() => null),
      legacyDashboard
        .waitFor({ state: "visible", timeout: 5000 })
        .catch(() => null),
      emptyState.waitFor({ state: "visible", timeout: 5000 }).catch(() => null),
      page.waitForTimeout(5000), // Max wait
    ]);

    // Check if we have tasks - if not, fail the test (data should have been seeded)
    const hasTasks = await page
      .getByTestId(TestIds.taskCardBeginButton)
      .count();

    if (hasTasks === 0) {
      throw new Error(
        "No tasks available - test data seeding may have failed. Check fixtures.ts"
      );
    }

    // Find and click the first "Begin" button on a task card
    const beginButton = page.getByTestId(TestIds.taskCardBeginButton).first();
    await expect(beginButton).toBeVisible({ timeout: 10000 });
    await beginButton.click();

    // Wait for navigation animation
    await page.waitForTimeout(2000);

    // Verify questions screen is visible
    await expect(page.getByTestId(TestIds.questionsScreenRoot)).toBeVisible({
      timeout: 15000,
    });
  });
});
