import { Hub } from "@aws-amplify/core";
import { DataStore, OpType } from "@aws-amplify/datastore";
import { OperationSource } from "@constants/operationSource";
import { Question } from "@models/index";
import { CreateQuestionInput, UpdateQuestionInput } from "@task-types/Question";
import { resetDataStore } from "@utils/datastore/dataStoreReset";
import { logErrorWithDevice, logWithDevice } from "@utils/logging/deviceLogger";
import { getServiceLogger } from "@utils/logging/serviceLogger";

type QuestionUpdateData = Omit<UpdateQuestionInput, "id" | "_version">;
type QuestionConstructor = new (init: CreateQuestionInput) => Question;
interface ObserveElement {
  id?: string;
  question?: string;
  _deleted?: boolean;
}
/**
 * Service: `QuestionService`
 *
 * Manages `Question` persistence via AWS DataStore and provides helpers for
 * common question operations used across the package (create, read, update,
 * delete, subscribe, and clear DataStore).
 *
 * The subscription helpers use `DataStore.observeQuery` for real-time
 * updates and an additional `DataStore.observe` watcher to ensure deletes
 * trigger a refresh when necessary.
 *
 * @example
 * ```ts
 * const question = await QuestionService.createQuestion({ text: 'Why?' });
 * const all = await QuestionService.getQuestions();
 * ```
 */
export class QuestionService {
  /**
   * Create a new Question
   */
  static async createQuestion(input: CreateQuestionInput): Promise<Question> {
    const logger = getServiceLogger("QuestionService");
    try {
      logger.info("Creating question with DataStore", input);
      const question = await DataStore.save(
        new (Question as unknown as QuestionConstructor)(input)
      );

      logger.info("Question created successfully", { id: question.id });
      return question;
    } catch (error) {
      logger.error("Error creating question", error);
      throw error;
    }
  }

  /**
   * Get all Questions
   */
  static async getQuestions(): Promise<Question[]> {
    try {
      return await DataStore.query(Question);
    } catch (error) {
      getServiceLogger("QuestionService").error(
        "Error fetching questions",
        error
      );
      throw error;
    }
  }

  /**
   * Get a Question by ID
   */
  static async getQuestion(id: string): Promise<Question | null> {
    try {
      const question = await DataStore.query(Question, id);
      return question || null;
    } catch (error) {
      getServiceLogger("QuestionService").error(
        "Error fetching question",
        error
      );
      throw error;
    }
  }

  /**
   * Update a Question
   */
  static async updateQuestion(
    id: string,
    data: QuestionUpdateData
  ): Promise<Question> {
    try {
      const original = await DataStore.query(Question, id);
      if (!original) {
        throw new Error(`Question with id ${id} not found`);
      }

      const updated = await DataStore.save(
        Question.copyOf(original, updated => {
          Object.assign(updated, data);
        })
      );

      return updated;
    } catch (error) {
      getServiceLogger("QuestionService").error(
        "Error updating question",
        error
      );
      throw error;
    }
  }

  /**
   * Delete a Question
   */
  static async deleteQuestion(id: string): Promise<void> {
    try {
      const toDelete = await DataStore.query(Question, id);
      if (!toDelete) {
        throw new Error(`Question with id ${id} not found`);
      }

      await DataStore.delete(toDelete);
    } catch (error) {
      getServiceLogger("QuestionService").error(
        "Error deleting question",
        error
      );
      throw error;
    }
  }

  /**
   * Subscribe to changes in Question items
   */
  static subscribeQuestions(
    callback: (items: Question[], isSynced: boolean) => void,
    options?: {
      /**
       * If true, perform a full DataStore query after DELETE events.
       * This is a safety-net for cross-device consistency, but can be expensive.
       *
       * Default: true (throttled).
       */
      refreshOnDelete?: boolean;
      /** Debounce/throttle window for refresh queries. Default: 500ms. */
      deleteRefreshThrottleMs?: number;
      /** Enable verbose debug logging (opt-in). Default: false. */
      debug?: boolean;
    }
  ): {
    unsubscribe: () => void;
  } {
    const refreshOnDelete = options?.refreshOnDelete ?? true;
    const deleteRefreshThrottleMs = options?.deleteRefreshThrottleMs ?? 500;
    const debug = options?.debug ?? false;

    getServiceLogger("QuestionService").info(
      "Setting up DataStore subscription for Question"
    );

    const querySubscription = DataStore.observeQuery(Question).subscribe(
      snapshot => {
        const { items, isSynced } = snapshot;

        if (debug) {
          logWithDevice(
            "QuestionService",
            "Subscription update (observeQuery)",
            {
              itemCount: items.length,
              isSynced,
              itemIds: items.map(i => i.id),
            }
          );
        }

        callback(items, isSynced);
      },
      error => {
        logErrorWithDevice(
          "QuestionService",
          "DataStore subscription error",
          error
        );
        callback([], false);
      }
    );

    // Also observe DELETE operations to ensure deletions trigger updates
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;
    const scheduleRefresh = () => {
      if (!refreshOnDelete) return;
      if (refreshTimer) return;
      refreshTimer = setTimeout(() => {
        refreshTimer = null;
        DataStore.query(Question)
          .then(questions => {
            if (debug) {
              logWithDevice(
                "QuestionService",
                "Query refresh after DELETE completed",
                {
                  remainingQuestionCount: questions.length,
                }
              );
            }
            callback(questions, true);
          })
          .catch(err => {
            logErrorWithDevice(
              "QuestionService",
              "Error refreshing after delete",
              err
            );
          });
      }, deleteRefreshThrottleMs);
    };

    const deleteObserver = DataStore.observe(Question).subscribe(
      msg => {
        if (msg.opType === OpType.DELETE) {
          const element = msg.element as unknown as ObserveElement | undefined;
          const isLocalDelete = element?._deleted === true;
          const source = isLocalDelete
            ? OperationSource.LOCAL
            : OperationSource.REMOTE_SYNC;

          if (debug) {
            logWithDevice(
              "QuestionService",
              `DELETE operation detected (${source})`,
              {
                questionId: element?.id,
                questionText: element?.question,
                deleted: element?._deleted,
                operationType: msg.opType,
              }
            );
          }

          scheduleRefresh();
        }
      },
      error => {
        logErrorWithDevice("QuestionService", "DELETE observer error", error);
      }
    );

    return {
      unsubscribe: () => {
        logWithDevice("QuestionService", "Unsubscribing from DataStore");
        querySubscription.unsubscribe();
        deleteObserver.unsubscribe();
        if (refreshTimer) {
          clearTimeout(refreshTimer);
          refreshTimer = null;
        }
      },
    };
  }

  /**
   * Clear the DataStore completely
   */
  static async clearDataStore(): Promise<void> {
    try {
      await resetDataStore(
        { dataStore: DataStore, hub: Hub },
        {
          mode: "clearAndRestart",
          waitForOutboxEmpty: true,
          outboxTimeoutMs: 2000,
          stopTimeoutMs: 5000,
          clearTimeoutMs: 5000,
          startTimeoutMs: 5000,
          proceedOnStopTimeout: true,
        }
      );
    } catch (error) {
      getServiceLogger("QuestionService").error(
        "Error clearing DataStore",
        error
      );
      throw error;
    }
  }
}
