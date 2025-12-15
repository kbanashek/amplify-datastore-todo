/**
 * Reset and Reseed Script (JavaScript version for direct execution)
 *
 * This script:
 * 1. Deletes all data (nuclear delete)
 * 2. Waits for sync to complete
 * 3. Reseeds coordinated data
 * 4. Waits for sync to complete
 * 5. Verifies data is present
 *
 * Run with: node scripts/reset-and-reseed.js
 */

const { Amplify } = require("aws-amplify");
const { DataStore } = require("@aws-amplify/datastore");
const awsconfig = require("../aws-exports");
const {
  SeededDataCleanupService,
} = require("../src/services/SeededDataCleanupService");
const { seedCoordinatedData } = require("../scripts/seed-coordinated-data");
const { Task, Activity } = require("../models");

// Configure Amplify
Amplify.configure(awsconfig);

async function waitForSync(durationMs = 5000) {
  console.log(
    `[ResetAndReseed] Waiting ${durationMs}ms for sync to complete...`
  );
  await new Promise(resolve => setTimeout(resolve, durationMs));
}

async function verifyData() {
  console.log("[ResetAndReseed] Verifying data is present...");

  const tasks = await DataStore.query(Task);
  const activities = await DataStore.query(Activity);

  console.log("[ResetAndReseed] Data verification complete:", {
    taskCount: tasks.length,
    activityCount: activities.length,
    taskIds: tasks.map(t => t.id).slice(0, 10), // First 10 task IDs
  });

  return {
    taskCount: tasks.length,
    activityCount: activities.length,
  };
}

async function resetAndReseed() {
  try {
    console.log("[ResetAndReseed] 🚀 Starting reset and reseed process...");

    // Step 1: Start DataStore
    console.log("[ResetAndReseed] Starting DataStore...");
    await DataStore.start();
    console.log("[ResetAndReseed] DataStore started");

    // Step 2: Nuclear Delete
    console.log("[ResetAndReseed] Step 1: Performing nuclear delete...");
    const deleteResult = await SeededDataCleanupService.clearAllSeededData();
    console.log(
      "[ResetAndReseed] Nuclear delete complete:",
      deleteResult.deleted
    );

    // Step 3: Wait for deletions to sync
    console.log(
      "[ResetAndReseed] Step 2: Waiting for deletions to sync across devices (10 seconds)..."
    );
    await waitForSync(10000); // 10 seconds for deletions to sync

    // Step 4: Verify data is deleted
    console.log("[ResetAndReseed] Step 3: Verifying all data is deleted...");
    const afterDelete = await verifyData();
    if (afterDelete.taskCount > 0 || afterDelete.activityCount > 0) {
      console.log(
        "[ResetAndReseed] ⚠️  Warning: Some data still exists after delete:",
        afterDelete
      );
    } else {
      console.log("[ResetAndReseed] ✅ All data deleted successfully");
    }

    // Step 5: Reseed data
    console.log("[ResetAndReseed] Step 4: Reseeding coordinated data...");
    const seedResult = await seedCoordinatedData();
    console.log("[ResetAndReseed] Reseed complete:", seedResult.summary);

    // Step 6: Wait for new data to sync
    console.log(
      "[ResetAndReseed] Step 5: Waiting for new data to sync across devices (10 seconds)..."
    );
    await waitForSync(10000); // 10 seconds for new data to sync

    // Step 7: Verify data is present
    console.log("[ResetAndReseed] Step 6: Verifying new data is present...");
    const afterReseed = await verifyData();

    if (afterReseed.taskCount === 0 && afterReseed.activityCount === 0) {
      console.error("[ResetAndReseed] ❌ ERROR: No data found after reseed!");
      throw new Error("Reseed failed - no data present");
    }

    console.log("[ResetAndReseed] ✅ Reset and reseed complete!", {
      finalTaskCount: afterReseed.taskCount,
      finalActivityCount: afterReseed.activityCount,
    });

    console.log("\n📱 All devices should now show the same data");
    console.log("💡 Check iOS, Android, and Web - they should all be synced");
    console.log(
      "🔍 Look for device-specific logs to verify sync across devices"
    );
  } catch (error) {
    console.error("[ResetAndReseed] ❌ Error during reset and reseed:", error);
    throw error;
  } finally {
    // Don't stop DataStore - let it continue running for the app
    console.log("[ResetAndReseed] Reset and reseed script complete");
  }
}

// Run the script
resetAndReseed()
  .then(() => {
    console.log("\n✅ Reset and reseed completed successfully!");
    console.log(
      "📱 Check all devices (iOS, Android, Web) - they should show the same data"
    );
    process.exit(0);
  })
  .catch(error => {
    console.error("\n❌ Reset and reseed failed:", error);
    process.exit(1);
  });
