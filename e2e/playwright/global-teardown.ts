/**
 * Playwright global teardown - runs once after all tests
 * Cleans up ONLY e2e test data (marked with E2E_TEST_MARKER) via browser context
 * Dev data is left untouched
 * 
 * NOTE: Cleanup is controlled by E2E_CLEANUP environment variable.
 * Set E2E_CLEANUP=false to skip cleanup (useful for dev testing).
 */

import { chromium } from "@playwright/test";

async function globalTeardown() {
  // Skip cleanup if E2E_CLEANUP is explicitly set to false
  const shouldCleanup = process.env.E2E_CLEANUP !== "false";
  
  if (!shouldCleanup) {
    console.log("⏭️  [E2E Teardown] Skipping cleanup (E2E_CLEANUP=false)");
    console.log("💡 [E2E Teardown] Test data remains in database for inspection");
    return;
  }
  
  console.log("🧹 [E2E Teardown] Cleaning up test data only (dev data untouched)...");
  console.log("🔍 [E2E Teardown] Only deleting items with E2E_TEST_MARKER prefix");
  
  try {
    // Launch browser to run cleanup in browser context (DataStore needs browser)
    const browser = await chromium.launch();
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Navigate to app
    await page.goto(process.env.E2E_BASE_URL || "http://localhost:8081");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);
    
    // Run cleanup in browser context
    await page.evaluate(async () => {
      try {
        const { DataStore } = await import("@aws-amplify/datastore");
        const Models = await import("../../models");
        const { Task, Activity, TaskAnswer, TaskResult, TaskHistory } = Models as any;
        const E2E_TEST_MARKER = "E2E_TEST";
        
        const isTestData = (pk: string | null | undefined) => {
          if (!pk) return false;
          return pk.startsWith(E2E_TEST_MARKER);
        };
        
        console.log("🧹 [Cleanup] Starting test data cleanup...");
        
        // Get all items
        const tasks = await DataStore.query(Task);
        const activities = await DataStore.query(Activity);
        const taskAnswers = await DataStore.query(TaskAnswer);
        const taskResults = await DataStore.query(TaskResult);
        const taskHistories = await DataStore.query(TaskHistory);
        
        // Find test task IDs
        const testTasks = tasks.filter(t => isTestData(t.pk));
        const testTaskIds = new Set(testTasks.map(t => t.id));
        
        // Delete test tasks
        let deletedTasks = 0;
        for (const task of testTasks) {
          await DataStore.delete(task);
          deletedTasks++;
        }
        
        // Delete test activities
        const testActivities = activities.filter(a => isTestData(a.pk));
        let deletedActivities = 0;
        for (const activity of testActivities) {
          await DataStore.delete(activity);
          deletedActivities++;
        }
        
        // Delete related test data
        let deletedAnswers = 0;
        for (const answer of taskAnswers) {
          if (answer.taskId && testTaskIds.has(answer.taskId)) {
            await DataStore.delete(answer);
            deletedAnswers++;
          }
        }
        
        let deletedResults = 0;
        for (const result of taskResults) {
          if (result.taskId && testTaskIds.has(result.taskId)) {
            await DataStore.delete(result);
            deletedResults++;
          }
        }
        
        let deletedHistories = 0;
        for (const history of taskHistories) {
          if (history.taskId && testTaskIds.has(history.taskId)) {
            await DataStore.delete(history);
            deletedHistories++;
          }
        }
        
        console.log("✅ [Cleanup] Test data cleaned up:", {
          tasks: deletedTasks,
          activities: deletedActivities,
          taskAnswers: deletedAnswers,
          taskResults: deletedResults,
          taskHistories: deletedHistories,
        });
      } catch (error) {
        console.error("❌ [Cleanup] Error during cleanup:", error);
      }
    });
    
    // Wait for deletions to sync
    await page.waitForTimeout(3000);
    await browser.close();
    
    console.log("✅ [E2E Teardown] Teardown complete - test data cleaned up, dev data untouched");
  } catch (error) {
    console.error("❌ [E2E Teardown] Failed to clean up test data:", error);
    // Don't throw - teardown failures shouldn't fail the test run
  }
}

export default globalTeardown;

