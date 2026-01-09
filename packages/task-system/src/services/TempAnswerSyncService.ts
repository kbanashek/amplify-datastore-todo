import { DataStore } from "@aws-amplify/datastore";

import { TaskTempAnswer } from "@models/index";
import { getServiceLogger } from "@utils/serviceLogger";

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
const logger = getServiceLogger("TempAnswerSyncService");

/**
 * Service for managing temporary answers via AWS DataStore.
 *
 * Provides save and retrieval operations for in-progress task answers.
 * Uses DataStore for offline-first support and automatic cloud sync.
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
    try {
      logger.info(`💾 [TempAnswers] Saving temp answers for task ${taskPk}`, {
        taskPk,
        activityId,
        answerCount: Object.keys(answers).length,
      });

      const saved = await DataStore.save(
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

      logger.info(
        `✅ [TempAnswers] Successfully saved temp answers for task ${taskPk}`,
        { id: saved.id }
      );
    } catch (error) {
      logger.error(
        `❌ [TempAnswers] Failed to save temp answers for task ${taskPk}`,
        error
      );
      throw error;
    }
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
    try {
      logger.info(`🔍 [TempAnswers] Querying temp answers for task ${taskPk}`);

      const results = await DataStore.query(
        TaskTempAnswer,
        c => c.taskPk.eq(taskPk),
        {
          sort: s => s.localtime("DESCENDING"),
          limit: 1,
        }
      );

      if (!results || results.length === 0) {
        logger.info(
          `📭 [TempAnswers] No temp answers found for task ${taskPk}`
        );
        return null;
      }

      const answersData = results[0]?.answers;
      if (!answersData) {
        logger.warn(
          `⚠️ [TempAnswers] Temp answer record exists but answers field is empty for task ${taskPk}`
        );
        return null;
      }

      // Handle both string (AWSJSON) and object cases
      let parsed: Record<string, unknown>;
      if (typeof answersData === "string") {
        try {
          parsed = JSON.parse(answersData) as Record<string, unknown>;
        } catch (parseError) {
          logger.error(
            `❌ [TempAnswers] Failed to parse answers JSON for task ${taskPk}`,
            {
              error: parseError,
              answersData: answersData.substring(0, 100), // Log first 100 chars
            }
          );
          return null;
        }
      } else if (typeof answersData === "object" && answersData !== null) {
        // Already an object - use as-is
        parsed = answersData as Record<string, unknown>;
      } else {
        logger.warn(
          `⚠️ [TempAnswers] Unexpected answers data type for task ${taskPk}`,
          { type: typeof answersData }
        );
        return null;
      }

      logger.info(
        `✅ [TempAnswers] Retrieved temp answers for task ${taskPk}`,
        {
          answerCount: Object.keys(parsed).length,
          recordId: results[0].id,
        }
      );
      return parsed;
    } catch (error) {
      logger.error(
        `❌ [TempAnswers] Failed to get temp answers for task ${taskPk}`,
        error
      );
      return null;
    }
  }
}
