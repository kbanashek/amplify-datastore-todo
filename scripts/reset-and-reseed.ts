/**
 * Reset and Reseed Script
 *
 * This script:
 * 1. Deletes all data (nuclear delete)
 * 2. Waits for sync to complete
 * 3. Reseeds coordinated data
 * 4. Waits for sync to complete
 * 5. Verifies data is present
 *
 * Run with: npx ts-node scripts/reset-and-reseed.ts
 */

import { Amplify } from "aws-amplify";
import { DataStore } from "@aws-amplify/datastore";
import awsconfig from "../aws-exports";
import { SeededDataCleanupService } from "@orion/task-system";
import { seedCoordinatedData } from "./seed-coordinated-data";
import { Task } from "../models";
import {
  logWithDevice,
  logErrorWithDevice,
} from "../packages/task-system/src/utils/logging/deviceLogger";

// Configure Amplify
Amplify.configure(awsconfig);

async function waitForSync(durationMs: number = 5000): Promise<void> {
  logWithDevice(
    "ResetAndReseed",
    `Waiting ${durationMs}ms for sync to complete...`
  );
  await new Promise(resolve => setTimeout(resolve, durationMs));
}

async function verifyData(): Promise<{
  taskCount: number;
  activityCount: number;
}> {
  logWithDevice("ResetAndReseed", "Verifying data is present...");

  const tasks = await DataStore.query(Task);
  const activities = await DataStore.query(require("../models").Activity);

  logWithDevice("ResetAndReseed", "Data verification complete", {
    taskCount: tasks.length,
    activityCount: activities.length,
    taskIds: tasks.map(t => t.id).slice(0, 10), // First 10 task IDs
  });

  return {
    taskCount: tasks.length,
    activityCount: activities.length,
  };
}

async function resetAndReseed(): Promise<void> {
  try {
    logWithDevice("ResetAndReseed", "🚀 Starting reset and reseed process...");

    // Step 1: Start DataStore
    logWithDevice("ResetAndReseed", "Starting DataStore...");
    await DataStore.start();
    logWithDevice("ResetAndReseed", "DataStore started");

    // Step 2: Nuclear Delete
    logWithDevice("ResetAndReseed", "Step 1: Performing nuclear delete...");
    const deleteResult = await SeededDataCleanupService.clearAllSeededData();
    logWithDevice("ResetAndReseed", "Nuclear delete complete", {
      deleted: deleteResult.deleted,
    });

    // Step 3: Wait for deletions to sync
    logWithDevice(
      "ResetAndReseed",
      "Step 2: Waiting for deletions to sync across devices..."
    );
    await waitForSync(10000); // 10 seconds for deletions to sync

    // Step 4: Verify data is deleted
    logWithDevice("ResetAndReseed", "Step 3: Verifying all data is deleted...");
    const afterDelete = await verifyData();
    if (afterDelete.taskCount > 0 || afterDelete.activityCount > 0) {
      logWithDevice(
        "ResetAndReseed",
        "⚠️  Warning: Some data still exists after delete",
        afterDelete
      );
    } else {
      logWithDevice("ResetAndReseed", "✅ All data deleted successfully");
    }

    // Step 5: Reseed data
    logWithDevice("ResetAndReseed", "Step 4: Reseeding coordinated data...");
    const seedResult = await seedCoordinatedData();
    logWithDevice("ResetAndReseed", "Reseed complete", {
      summary: seedResult.summary,
    });

    // Step 6: Wait for new data to sync
    logWithDevice(
      "ResetAndReseed",
      "Step 5: Waiting for new data to sync across devices..."
    );
    await waitForSync(10000); // 10 seconds for new data to sync

    // Step 7: Verify data is present
    logWithDevice("ResetAndReseed", "Step 6: Verifying new data is present...");
    const afterReseed = await verifyData();

    if (afterReseed.taskCount === 0 && afterReseed.activityCount === 0) {
      logErrorWithDevice(
        "ResetAndReseed",
        "❌ ERROR: No data found after reseed!"
      );
      throw new Error("Reseed failed - no data present");
    }

    logWithDevice("ResetAndReseed", "✅ Reset and reseed complete!", {
      finalTaskCount: afterReseed.taskCount,
      finalActivityCount: afterReseed.activityCount,
    });

    logWithDevice(
      "ResetAndReseed",
      "📱 All devices should now show the same data"
    );
    logWithDevice(
      "ResetAndReseed",
      "💡 Check iOS, Android, and Web - they should all be synced"
    );
  } catch (error) {
    logErrorWithDevice(
      "ResetAndReseed",
      "❌ Error during reset and reseed",
      error
    );
    throw error;
  } finally {
    // Don't stop DataStore - let it continue running for the app
    logWithDevice("ResetAndReseed", "Reset and reseed script complete");
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
