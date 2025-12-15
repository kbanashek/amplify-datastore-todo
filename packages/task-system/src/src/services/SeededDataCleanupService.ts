import { DataStore } from "@aws-amplify/datastore";
import type { PersistentModelConstructor } from "@aws-amplify/datastore";
import { AppointmentService } from "./AppointmentService";
import {
  Activity,
  DataPoint,
  DataPointInstance,
  Question,
  Task,
  TaskAnswer,
  TaskHistory,
  TaskResult,
  Todo,
} from "../models";
import { logWithDevice, logErrorWithDevice } from "../utils/deviceLogger";

export interface ClearSeededDataResult {
  deleted: {
    todos: number;
    tasks: number;
    activities: number;
    questions: number;
    dataPoints: number;
    dataPointInstances: number;
    taskAnswers: number;
    taskResults: number;
    taskHistories: number;
  };
  clearedAppointments: boolean;
}

/**
 * Centralized cleanup helper intended for deterministic local testing (including E2E).
 *
 * NOTE: DataStore deletes are syncable and will propagate to the configured backend.
 * Use this only for development/testing environments.
 */
export class SeededDataCleanupService {
  private static async deleteAllForModel<TModel extends Record<string, any>>(
    modelConstructor: PersistentModelConstructor<TModel>,
    label: string
  ): Promise<number> {
    logWithDevice("SeededDataCleanupService", `Starting deletion for ${label}`);
    const items = (await DataStore.query(modelConstructor)) || [];
    let deletedCount = 0;

    logWithDevice("SeededDataCleanupService", `Found ${label} items to delete`, {
      modelName: label,
      itemCount: items.length,
      itemIds: items.map((item: any) => item.id).slice(0, 10), // Log first 10 IDs
    });

    // Delete in batches to avoid overwhelming the sync queue
    const batchSize = 10;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(items.length / batchSize);
      
      logWithDevice("SeededDataCleanupService", `Deleting ${label} batch ${batchNumber}/${totalBatches}`, {
        modelName: label,
        batchSize: batch.length,
        batchItemIds: batch.map((item: any) => item.id),
      });
      
      await Promise.all(batch.map(item => DataStore.delete(item)));
      deletedCount += batch.length;

      logWithDevice("SeededDataCleanupService", `${label} batch ${batchNumber} deleted, queued for sync`, {
        modelName: label,
        deletedInBatch: batch.length,
        totalDeleted: deletedCount,
        remaining: items.length - deletedCount,
      });

      // Small delay between batches to allow sync to process
      if (i + batchSize < items.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    logWithDevice("SeededDataCleanupService", `All ${label} items deleted, waiting for sync`, {
      modelName: label,
      deletedCount,
      totalQueried: items.length,
    });

    // Wait for deletions to sync to ensure they propagate to other devices
    await new Promise(resolve => setTimeout(resolve, 1000));

    logWithDevice("SeededDataCleanupService", `${label} deletion complete and synced`, {
      modelName: label,
      deletedCount,
    });

    return deletedCount;
  }

  static async clearAllSeededData(): Promise<ClearSeededDataResult> {
    logWithDevice("SeededDataCleanupService", "🚨 NUCLEAR DELETE STARTED - Clearing all seeded data");
    
    const taskAnswers = await this.deleteAllForModel(TaskAnswer, "TaskAnswer");
    const taskResults = await this.deleteAllForModel(TaskResult, "TaskResult");
    const taskHistories = await this.deleteAllForModel(
      TaskHistory,
      "TaskHistory"
    );

    const tasks = await this.deleteAllForModel(Task, "Task");
    const activities = await this.deleteAllForModel(Activity, "Activity");

    const questions = await this.deleteAllForModel(Question, "Question");
    const dataPoints = await this.deleteAllForModel(DataPoint, "DataPoint");
    const dataPointInstances = await this.deleteAllForModel(
      DataPointInstance,
      "DataPointInstance"
    );
    const todos = await this.deleteAllForModel(Todo, "Todo");

    logWithDevice("SeededDataCleanupService", "Clearing appointments");
    await AppointmentService.clearAppointments();

    const result = {
      deleted: {
        todos,
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

    logWithDevice("SeededDataCleanupService", "✅ NUCLEAR DELETE COMPLETE - All data deleted and syncing", {
      summary: result.deleted,
      totalItemsDeleted: Object.values(result.deleted).reduce((sum, count) => sum + count, 0),
    });

    return result;
  }
}

