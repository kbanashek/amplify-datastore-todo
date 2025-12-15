/**
 * Playwright global setup - runs once before all tests
 * Seeds minimal test data with E2E_TEST_MARKER prefix
 * This ensures test data is isolated from dev data
 */

import { Amplify } from "aws-amplify";
import awsconfig from "../../aws-exports";
import { seedMinimalTestData } from "./test-seed-minimal";

// Configure Amplify for Node.js context
Amplify.configure(awsconfig);

async function globalSetup() {
  console.log("\n✨ [E2E Setup] Starting global setup...");
  console.log("🧹 [E2E Setup] Cleaning up any existing test data first...");
  
  // Clean up any existing test data before seeding
  try {
    const { TestDataCleanupService } = await import("./test-data-cleanup");
    await TestDataCleanupService.cleanupTestData();
    console.log("✅ [E2E Setup] Existing test data cleaned up");
  } catch (error) {
    console.warn("⚠️  [E2E Setup] Could not clean up existing test data:", error);
  }
  
  console.log("🌱 [E2E Setup] Seeding minimal test data with markers...");
  
  try {
    const result = await seedMinimalTestData();
    console.log("✅ [E2E Setup] Test data seeded:", {
      activities: result.activitiesCount,
      tasks: result.tasksCount,
    });
    console.log("💡 [E2E Setup] All test data is marked with E2E_TEST_MARKER prefix");
    console.log("💡 [E2E Setup] Dev data remains untouched");
  } catch (error) {
    console.error("❌ [E2E Setup] Failed to seed test data:", error);
    throw error; // Fail setup if seeding fails
  }
  
  // Wait for DataStore to sync
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  console.log("✨ [E2E Setup] Global setup complete\n");
}

export default globalSetup;

