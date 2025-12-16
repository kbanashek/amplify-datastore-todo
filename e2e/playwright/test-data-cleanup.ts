/**
 * Test data cleanup service - only deletes e2e test data
 * Uses pk prefix to identify test data, leaving dev data untouched
 */

import { DataStore } from "@aws-amplify/datastore";
import type { PersistentModelConstructor } from "@aws-amplify/datastore";
// Import models - they're exported from index.js at runtime
// TypeScript types may not match exactly, so we use any for the constructor types
import * as Models from "../../models";
const {
  Activity,
  DataPoint,
  DataPointInstance,
  Question,
  Task,
  TaskAnswer,
  TaskHistory,
  TaskResult,
  Todo,
} = Models as any;
import { E2E_TEST_MARKER, isTestData } from "./test-data-marker";

export interface TestDataCleanupResult {
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
  clearedAppointments: number;
}

/**
 * Cleanup service that only deletes e2e test data (identified by pk prefix)
 * Dev data is left untouched
 */
export class TestDataCleanupService {
  private static async deleteTestDataForModel<
    TModel extends { pk?: string | null },
  >(
    modelConstructor: PersistentModelConstructor<TModel>,
    label: string
  ): Promise<number> {
    const items = await DataStore.query(modelConstructor);
    let deletedCount = 0;

    // Only delete items with test data marker in pk
    for (const item of items) {
      if (isTestData(item.pk)) {
        await DataStore.delete(item);
        deletedCount++;
      }
    }

    console.log("[TestDataCleanupService] Deleted test items", {
      label,
      deletedCount,
      totalItems: items.length,
    });

    return deletedCount;
  }

  /**
   * Delete test data for TaskAnswer, TaskResult, TaskHistory
   * These are linked to tasks, so we delete by checking if the related task is test data
   */
  private static async deleteTestTaskAnswers(): Promise<number> {
    const taskAnswers = await DataStore.query(TaskAnswer);
    const tasks = await DataStore.query(Task);
    const testTaskIds = new Set(
      tasks.filter(t => isTestData(t.pk)).map(t => t.id)
    );

    let deletedCount = 0;
    for (const answer of taskAnswers) {
      if (answer.taskId && testTaskIds.has(answer.taskId)) {
        await DataStore.delete(answer);
        deletedCount++;
      }
    }

    console.log("[TestDataCleanupService] Deleted test TaskAnswers", {
      deletedCount,
      totalAnswers: taskAnswers.length,
    });

    return deletedCount;
  }

  private static async deleteTestTaskResults(): Promise<number> {
    const taskResults = await DataStore.query(TaskResult);
    const tasks = await DataStore.query(Task);
    const testTaskIds = new Set(
      tasks.filter(t => isTestData(t.pk)).map(t => t.id)
    );

    let deletedCount = 0;
    for (const result of taskResults) {
      if (result.taskId && testTaskIds.has(result.taskId)) {
        await DataStore.delete(result);
        deletedCount++;
      }
    }

    console.log("[TestDataCleanupService] Deleted test TaskResults", {
      deletedCount,
      totalResults: taskResults.length,
    });

    return deletedCount;
  }

  private static async deleteTestTaskHistories(): Promise<number> {
    const taskHistories = await DataStore.query(TaskHistory);
    const tasks = await DataStore.query(Task);
    const testTaskIds = new Set(
      tasks.filter(t => isTestData(t.pk)).map(t => t.id)
    );

    let deletedCount = 0;
    for (const history of taskHistories) {
      if (history.taskId && testTaskIds.has(history.taskId)) {
        await DataStore.delete(history);
        deletedCount++;
      }
    }

    console.log("[TestDataCleanupService] Deleted test TaskHistories", {
      deletedCount,
      totalHistories: taskHistories.length,
    });

    return deletedCount;
  }

  /**
   * Delete test appointments (those with test marker in title or appointmentId)
   */
  private static async deleteTestAppointments(): Promise<number> {
    // AppointmentService doesn't expose query, so we'll need to check via API
    // For now, we'll skip appointment cleanup or do it via the service
    // TODO: Add appointment test marker support
    console.log(
      "[TestDataCleanupService] Appointment cleanup not yet implemented with test markers"
    );
    return 0;
  }

  /**
   * Clean up only e2e test data, leaving dev data untouched
   */
  static async cleanupTestData(): Promise<TestDataCleanupResult> {
    console.log(
      "🧹 [TestDataCleanupService] Cleaning up e2e test data only..."
    );
    console.log(
      `🔍 [TestDataCleanupService] Looking for items with pk prefix: ${E2E_TEST_MARKER}`
    );

    // Delete test data in dependency order
    const taskAnswers = await this.deleteTestTaskAnswers();
    const taskResults = await this.deleteTestTaskResults();
    const taskHistories = await this.deleteTestTaskHistories();

    // Delete test tasks and activities (by pk prefix)
    const tasks = await this.deleteTestDataForModel(Task, "Task");
    const activities = await this.deleteTestDataForModel(Activity, "Activity");

    // Delete related test data
    const questions = await this.deleteTestDataForModel(Question, "Question");
    const dataPoints = await this.deleteTestDataForModel(
      DataPoint,
      "DataPoint"
    );
    const dataPointInstances = await this.deleteTestDataForModel(
      DataPointInstance,
      "DataPointInstance"
    );
    const todos = await this.deleteTestDataForModel(Todo as any, "Todo");

    // Appointments cleanup (TODO: implement with test markers)
    const clearedAppointments = await this.deleteTestAppointments();

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
      clearedAppointments,
    };

    console.log(
      "✅ [TestDataCleanupService] Test data cleanup complete:",
      result
    );
    console.log("💡 [TestDataCleanupService] Dev data remains untouched");

    return result;
  }
}
