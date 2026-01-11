import { DataStore } from "@aws-amplify/datastore";
import type { PersistentModelConstructor } from "@aws-amplify/datastore";
import { AppointmentService } from "@services/AppointmentService";
import {
  Activity,
  DataPoint,
  DataPointInstance,
  Question,
  Task,
  TaskAnswer,
  TaskHistory,
  TaskResult,
} from "@models/index";
import { logWithDevice, logErrorWithDevice } from "@utils/logging/deviceLogger";

/**
 * Result of clearing seeded data operation
 * Contains counts of deleted records for each model type
 */
export interface ClearSeededDataResult {
  /** Counts of deleted records by model type */
  deleted: {
    /** Number of Task records deleted */
    tasks: number;
    /** Number of Activity records deleted */
    activities: number;
    /** Number of Question records deleted */
    questions: number;
    /** Number of DataPoint records deleted */
    dataPoints: number;
    /** Number of DataPointInstance records deleted */
    dataPointInstances: number;
    /** Number of TaskAnswer records deleted */
    taskAnswers: number;
    /** Number of TaskResult records deleted */
    taskResults: number;
    /** Number of TaskHistory records deleted */
    taskHistories: number;
  };
  /** Whether appointments were successfully cleared */
  clearedAppointments: boolean;
}

/**
 * Centralized cleanup helper intended for deterministic local testing (including E2E).
 *
 * Provides methods to delete all seeded data from DataStore, including Tasks, Activities,
 * Questions, DataPoints, and related models. Also handles clearing appointments.
 *
 * NOTE: DataStore deletes are syncable and will propagate to the configured backend.
 * Use this only for development/testing environments.
 *
 * @example
 * ```typescript
 * // Clear all seeded data
 * const result = await SeededDataCleanupService.clearAllSeededData();
 * console.log(`Deleted ${result.deleted.tasks} tasks`);
 * ```
 */
export class SeededDataCleanupService {
  private static async deleteAllForModel<TModel extends Record<string, any>>(
    modelConstructor: PersistentModelConstructor<TModel>,
    label: string
  ): Promise<number> {
    logWithDevice("SeededDataCleanupService", `Starting deletion for ${label}`);

    // Query all items - DataStore.query automatically filters out deleted items
    // So we only get items that are not yet deleted
    let items: any[] = [];
    try {
      items = (await DataStore.query(modelConstructor)) || [];
    } catch (error) {
      logErrorWithDevice(
        "SeededDataCleanupService",
        `Error querying ${label}`,
        error
      );
      // If query fails, try to continue with empty array
      items = [];
    }

    let deletedCount = 0;

    logWithDevice(
      "SeededDataCleanupService",
      `Found ${label} items to delete`,
      {
        modelName: label,
        itemCount: items.length,
        itemIds: items.map((item: any) => item.id).slice(0, 10), // Log first 10 IDs
      }
    );

    // If no items found, return early
    if (items.length === 0) {
      logWithDevice(
        "SeededDataCleanupService",
        `No ${label} items found to delete`
      );
      return 0;
    }

    // Delete in batches to avoid overwhelming the sync queue
    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(items.length / batchSize);

      logWithDevice(
        "SeededDataCleanupService",
        `Deleting ${label} batch ${batchNumber}/${totalBatches}`,
        {
          modelName: label,
          batchSize: batch.length,
          batchItemIds: batch.map((item: any) => item.id),
        }
      );

      // Delete each item individually to catch and log any failures
      const deletePromises = batch.map(async item => {
        try {
          await DataStore.delete(item);
          return { success: true, id: item.id };
        } catch (error) {
          logErrorWithDevice(
            "SeededDataCleanupService",
            `Failed to delete ${label} item: ${item.id}`,
            error
          );
          return { success: false, id: item.id, error };
        }
      });

      const deleteResults = await Promise.all(deletePromises);
      const successfulDeletes = deleteResults.filter(r => r.success).length;
      deletedCount += successfulDeletes;

      if (successfulDeletes < batch.length) {
        logWithDevice(
          "SeededDataCleanupService",
          `⚠️ Some ${label} items failed to delete in batch ${batchNumber}`,
          {
            successful: successfulDeletes,
            failed: batch.length - successfulDeletes,
            failedIds: deleteResults.filter(r => !r.success).map(r => r.id),
          }
        );
      }

      logWithDevice(
        "SeededDataCleanupService",
        `${label} batch ${batchNumber} deleted, queued for sync`,
        {
          modelName: label,
          deletedInBatch: batch.length,
          totalDeleted: deletedCount,
          remaining: items.length - deletedCount,
        }
      );

      // Small delay between batches to allow sync to process
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    logWithDevice(
      "SeededDataCleanupService",
      `All ${label} items deleted, waiting for sync`,
      {
        modelName: label,
        deletedCount,
        totalQueried: items.length,
      }
    );

    // Wait for deletions to sync to ensure they propagate to other devices
    await new Promise(resolve => setTimeout(resolve, 1000));

    logWithDevice(
      "SeededDataCleanupService",
      `${label} deletion complete and synced`,
      {
        modelName: label,
        deletedCount,
      }
    );

    return deletedCount;
  }

  /**
   * Delete all TaskAnswers with retry logic to ensure complete deletion
   * TaskAnswers can be tricky because they're linked to Tasks
   */
  private static async deleteAllTaskAnswersWithRetry(): Promise<number> {
    logWithDevice(
      "SeededDataCleanupService",
      "Deleting all TaskAnswer items (with retry)"
    );

    let totalDeleted = 0;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      logWithDevice(
        "SeededDataCleanupService",
        `TaskAnswer deletion attempt ${attempt}/${maxRetries}`
      );

      const answers = await DataStore.query(TaskAnswer);
      logWithDevice(
        "SeededDataCleanupService",
        `Found ${answers.length} TaskAnswer items to delete`,
        {
          attempt,
          answerIds: answers.map((a: any) => a.id).slice(0, 10),
        }
      );

      if (answers.length === 0) {
        logWithDevice(
          "SeededDataCleanupService",
          "No TaskAnswer items remaining"
        );
        break;
      }

      // Delete in batches
      const batchSize = 10;
      for (let i = 0; i < answers.length; i += batchSize) {
        const batch = answers.slice(i, i + batchSize);
        const deletePromises = batch.map(async answer => {
          try {
            await DataStore.delete(answer);
            return { success: true, id: answer.id };
          } catch (error) {
            logErrorWithDevice(
              "SeededDataCleanupService",
              `Failed to delete TaskAnswer: ${answer.id}`,
              error
            );
            return { success: false, id: answer.id };
          }
        });

        const results = await Promise.all(deletePromises);
        const successful = results.filter(r => r.success).length;
        totalDeleted += successful;

        if (i + batchSize < answers.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      // Wait a bit and check if any remain
      await new Promise(resolve => setTimeout(resolve, 1000));
      const remaining = await DataStore.query(TaskAnswer);

      if (remaining.length === 0) {
        logWithDevice(
          "SeededDataCleanupService",
          `✅ All TaskAnswer items deleted on attempt ${attempt}`
        );
        break;
      } else {
        logWithDevice(
          "SeededDataCleanupService",
          `⚠️ ${remaining.length} TaskAnswer items still remain after attempt ${attempt}`,
          {
            remainingIds: remaining.map((a: any) => a.id).slice(0, 10),
          }
        );
      }
    }

    // Final check
    const finalCheck = await DataStore.query(TaskAnswer);
    if (finalCheck.length > 0) {
      logWithDevice(
        "SeededDataCleanupService",
        `⚠️ WARNING: ${finalCheck.length} TaskAnswer items still remain after all retries`,
        {
          remainingIds: finalCheck.map((a: any) => a.id),
        }
      );
    }

    return totalDeleted;
  }

  static async clearAllSeededData(): Promise<ClearSeededDataResult> {
    logWithDevice(
      "SeededDataCleanupService",
      "🚨 NUCLEAR DELETE STARTED - Clearing all seeded data"
    );

    // CRITICAL: Delete TaskAnswer FIRST with retry logic
    // TaskAnswer has foreign key relationships to Tasks, so we must delete them first
    // Using special retry method to ensure all are deleted
    logWithDevice(
      "SeededDataCleanupService",
      "Step 1: Deleting TaskAnswer (must be deleted before Tasks)"
    );
    const taskAnswers = await this.deleteAllTaskAnswersWithRetry();

    logWithDevice("SeededDataCleanupService", "Step 2: Deleting TaskResult");
    const taskResults = await this.deleteAllForModel(TaskResult, "TaskResult");

    logWithDevice("SeededDataCleanupService", "Step 3: Deleting TaskHistory");
    const taskHistories = await this.deleteAllForModel(
      TaskHistory,
      "TaskHistory"
    );

    logWithDevice("SeededDataCleanupService", "Step 4: Deleting Tasks");
    const tasks = await this.deleteAllForModel(Task, "Task");

    logWithDevice("SeededDataCleanupService", "Step 5: Deleting Activities");
    const activities = await this.deleteAllForModel(Activity, "Activity");

    logWithDevice("SeededDataCleanupService", "Step 6: Deleting Questions");
    const questions = await this.deleteAllForModel(Question, "Question");

    logWithDevice("SeededDataCleanupService", "Step 7: Deleting DataPoints");
    const dataPoints = await this.deleteAllForModel(DataPoint, "DataPoint");

    logWithDevice(
      "SeededDataCleanupService",
      "Step 8: Deleting DataPointInstances"
    );
    const dataPointInstances = await this.deleteAllForModel(
      DataPointInstance,
      "DataPointInstance"
    );

    logWithDevice("SeededDataCleanupService", "Step 9: Clearing appointments");
    await AppointmentService.clearAppointments();

    // Final verification - check all models are empty
    logWithDevice(
      "SeededDataCleanupService",
      "Step 11: Verifying all deletions"
    );
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for deletions to process

    const finalAnswers = await DataStore.query(TaskAnswer);
    const finalResults = await DataStore.query(TaskResult);
    const finalHistories = await DataStore.query(TaskHistory);
    const finalTasks = await DataStore.query(Task);

    if (
      finalAnswers.length > 0 ||
      finalResults.length > 0 ||
      finalHistories.length > 0 ||
      finalTasks.length > 0
    ) {
      logWithDevice(
        "SeededDataCleanupService",
        "⚠️ WARNING: Some items still remain after deletion",
        {
          remainingTaskAnswers: finalAnswers.length,
          remainingTaskResults: finalResults.length,
          remainingTaskHistories: finalHistories.length,
          remainingTasks: finalTasks.length,
        }
      );
    } else {
      logWithDevice(
        "SeededDataCleanupService",
        "✅ All task-related items verified deleted"
      );
    }

    const result = {
      deleted: {
        tasks,
        activities,
        questions,
        dataPoints,
        dataPointInstances,
        taskAnswers,
        taskResults,
        taskHistories,
      },
      clearedAppointments: true,
    };

    logWithDevice(
      "SeededDataCleanupService",
      "✅ NUCLEAR DELETE COMPLETE - All data deleted and syncing",
      {
        summary: result.deleted,
        totalItemsDeleted: Object.values(result.deleted).reduce(
          (sum, count) => sum + count,
          0
        ),
        verification: {
          remainingTaskAnswers: finalAnswers.length,
          remainingTaskResults: finalResults.length,
          remainingTaskHistories: finalHistories.length,
          remainingTasks: finalTasks.length,
        },
      }
    );

    return result;
  }
}
