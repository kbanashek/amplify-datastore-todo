/**
 * Test-specific seed function
 * Wraps the regular seed function and marks all created data with E2E_TEST_MARKER
 * This allows test data to be cleaned up separately from dev data
 */

import { DataStore } from "@aws-amplify/datastore";
import { seedCoordinatedData } from "../../scripts/seed-coordinated-data";
// Import models - they're exported from index.js at runtime
import * as Models from "../../models";
const { Task, Activity } = Models as any;
import { E2E_TEST_MARKER, createTestDataPk } from "./test-data-marker";

/**
 * Seed test data with markers so it can be cleaned up separately
 * This creates data through the normal seed function, then marks it as test data
 */
export async function seedTestData(): Promise<void> {
  console.log("🌱 [TestSeed] Seeding test data with markers...");

  // First, seed the data normally
  const result = await seedCoordinatedData();

  console.log("🌱 [TestSeed] Data seeded, now marking as test data...");

  // Mark all created tasks and activities with test marker
  // We need to update their pk fields to include the test marker prefix
  const tasks = await DataStore.query(Task);
  const activities = await DataStore.query(Activity);

  // Mark tasks created in this seed (they'll be recent)
  const recentTasks = tasks.filter(
    task =>
      !task.pk?.startsWith(E2E_TEST_MARKER) &&
      task.createdAt &&
      new Date(task.createdAt).getTime() > Date.now() - 60000 // Created in last minute
  );

  for (const task of recentTasks) {
    if (task.pk && !task.pk.startsWith(E2E_TEST_MARKER)) {
      const updatedTask = Task.copyOf(task, (updated: any) => {
        updated.pk = createTestDataPk(task.pk!);
      });
      await DataStore.save(updatedTask);
    }
  }

  // Mark activities created in this seed
  const recentActivities = activities.filter(
    activity =>
      !activity.pk?.startsWith(E2E_TEST_MARKER) &&
      activity.createdAt &&
      new Date(activity.createdAt).getTime() > Date.now() - 60000
  );

  for (const activity of recentActivities) {
    if (activity.pk && !activity.pk.startsWith(E2E_TEST_MARKER)) {
      const updatedActivity = Activity.copyOf(activity, (updated: any) => {
        updated.pk = createTestDataPk(activity.pk!);
      });
      await DataStore.save(updatedActivity);
    }
  }

  console.log("✅ [TestSeed] Test data marked:", {
    tasksMarked: recentTasks.length,
    activitiesMarked: recentActivities.length,
  });

  // Wait for sync
  await new Promise(resolve => setTimeout(resolve, 2000));
}
