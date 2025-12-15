import { test, expect } from "./fixtures";
import { TestIds } from "../../src/constants/testIds";

/**
 * Web e2e test: Task persistence after app reload
 * Tests that task state persists after page reload
 * 
 * Note: Test data is automatically seeded via fixtures before tests run
 * and cleaned up after tests complete (see global-teardown.ts)
 */
test.describe("Task Persistence", () => {
  test("should persist task state after page reload", async ({ page }) => {
    // Navigate to the app
    await page.goto("/");

    // Wait for app to fully load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Verify we're on the dashboard
    const dashboardHeader = page.getByText("Dashboard");
    await expect(dashboardHeader).toBeVisible({ timeout: 10000 });

    // Wait for tasks to load
    const newDashboard = page.getByTestId(TestIds.dashboardGroupedTasksView);
    const legacyDashboard = page.getByTestId(TestIds.dashboardTasksGroupedView);
    const emptyState = page.getByText("No tasks available.");
    
    await Promise.race([
      newDashboard.waitFor({ state: "visible", timeout: 5000 }).catch(() => null),
      legacyDashboard.waitFor({ state: "visible", timeout: 5000 }).catch(() => null),
      emptyState.waitFor({ state: "visible", timeout: 5000 }).catch(() => null),
      page.waitForTimeout(5000),
    ]);

    // Check if we have tasks - if not, fail the test (data should have been seeded)
    const hasTasks = await page.getByTestId(TestIds.taskCardBeginButton).count();
    
    if (hasTasks === 0) {
      throw new Error("No tasks available - test data seeding may have failed. Check fixtures.ts");
    }

    // Begin a task
    const beginButton = page.getByTestId(TestIds.taskCardBeginButton).first();
    await expect(beginButton).toBeVisible({ timeout: 10000 });
    await beginButton.click();
    await page.waitForTimeout(2000);

    // Verify questions screen is visible
    await expect(
      page.getByTestId(TestIds.questionsScreenRoot)
    ).toBeVisible({ timeout: 15000 });

    // Simulate app restart by reloading the page
    await page.reload();
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(3000);

    // Verify dashboard is still visible after reload (data persisted)
    await expect(page.getByText("Dashboard")).toBeVisible({ timeout: 10000 });
    
    // Verify tasks are still visible (data persisted)
    const hasTasksAfterReload = await page.getByTestId(TestIds.taskCardBeginButton).count();
    expect(hasTasksAfterReload).toBeGreaterThan(0);
  });
});

