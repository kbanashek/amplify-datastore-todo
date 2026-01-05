import { DataStore } from "@aws-amplify/datastore";

import { TaskTempAnswer } from "@models/index";

/**
 * Service for managing temporary task answers using DataStore.
 *
 * Provides simple save/query operations for in-progress task answers.
 * DataStore automatically handles offline persistence (SQLite) and cloud sync.
 *
 * @example
 * ```typescript
 * // Save temp answers
 * await TempAnswerSyncService.saveTempAnswers(
 *   "TASK-123",
 *   "ACTIVITY-456",
 *   { question1: "answer1" },
 *   new Date().toISOString()
 * );
 *
 * // Get latest temp answers
 * const answers = await TempAnswerSyncService.getTempAnswers("TASK-123");
 * ```
 */
export class TempAnswerSyncService {
  /**
   * Save temporary answers for a task.
   *
   * DataStore automatically:
   * - Persists to local SQLite (works offline)
   * - Syncs to cloud when online
   * - Handles retries and conflicts
   *
   * @param taskPk - Task primary key
   * @param activityId - Activity identifier
   * @param answers - Answer data as JSON object
   * @param localtime - ISO 8601 timestamp when saved
   */
  static async saveTempAnswers(
    taskPk: string,
    activityId: string,
    answers: Record<string, unknown>,
    localtime: string
  ): Promise<void> {
    await DataStore.save(
      new TaskTempAnswer({
        pk: taskPk,
        sk: `TEMP#${Date.now()}`,
        taskPk,
        activityId,
        answers: JSON.stringify(answers), // AWSJSON type requires string
        localtime,
        hashKey: taskPk,
      })
    );
  }

  /**
   * Get the most recent temporary answers for a task.
   *
   * Queries DataStore for the latest saved answers.
   * Returns null if no temp answers exist.
   *
   * @param taskPk - Task primary key
   * @returns Answer data or null if not found
   */
  static async getTempAnswers(
    taskPk: string
  ): Promise<Record<string, unknown> | null> {
    const results = await DataStore.query(
      TaskTempAnswer,
      c => c.taskPk.eq(taskPk),
      {
        sort: s => s.localtime("DESCENDING"),
        limit: 1,
      }
    );

    if (!results || results.length === 0) {
      return null;
    }

    const answersString = results[0]?.answers;
    if (!answersString) {
      return null;
    }

    try {
      return JSON.parse(answersString) as Record<string, unknown>;
    } catch {
      return null;
    }
  }
}
