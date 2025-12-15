import { DataStore, OpType } from "@aws-amplify/datastore";
import { logWithDevice, logErrorWithDevice } from "../utils/deviceLogger";
import { TaskAnswer } from "../../models";
import {
  CreateTaskAnswerInput,
  UpdateTaskAnswerInput,
} from "../types/TaskAnswer";

type TaskAnswerUpdateData = Omit<UpdateTaskAnswerInput, "id" | "_version">;

export class TaskAnswerService {
  static configureConflictResolution() {
    DataStore.configure({
      conflictHandler: async ({
        modelConstructor,
        localModel,
        remoteModel,
        operation,
        attempts,
      }) => {
        if (modelConstructor.name === "TaskAnswer") {
          if (operation === OpType.DELETE) {
            if (remoteModel._deleted) {
              return remoteModel;
            }
            if (!localModel.pk && !localModel.sk) {
              return { ...remoteModel, _deleted: true };
            }
            return localModel;
          }
        }
        return remoteModel;
      },
    });
  }

  static async createTaskAnswer(
    input: CreateTaskAnswerInput
  ): Promise<TaskAnswer> {
    try {
      console.log(
        "[TaskAnswerService] Creating task answer with DataStore:",
        input
      );
      const answer = await DataStore.save(
        new TaskAnswer({
          ...input,
        })
      );

      console.log(
        "[TaskAnswerService] TaskAnswer created successfully:",
        answer.id
      );
      return answer;
    } catch (error) {
      console.error("Error creating task answer:", error);
      throw error;
    }
  }

  static async getTaskAnswers(): Promise<TaskAnswer[]> {
    try {
      return await DataStore.query(TaskAnswer);
    } catch (error) {
      console.error("Error fetching task answers:", error);
      throw error;
    }
  }

  static async getTaskAnswer(id: string): Promise<TaskAnswer | null> {
    try {
      return await DataStore.query(TaskAnswer, id);
    } catch (error) {
      console.error("Error fetching task answer:", error);
      throw error;
    }
  }

  static async updateTaskAnswer(
    id: string,
    data: TaskAnswerUpdateData
  ): Promise<TaskAnswer> {
    try {
      const original = await DataStore.query(TaskAnswer, id);
      if (!original) {
        throw new Error(`TaskAnswer with id ${id} not found`);
      }

      const updated = await DataStore.save(
        TaskAnswer.copyOf(original, updated => {
          Object.assign(updated, data);
        })
      );

      return updated;
    } catch (error) {
      console.error("Error updating task answer:", error);
      throw error;
    }
  }

  static async deleteTaskAnswer(id: string): Promise<void> {
    try {
      const toDelete = await DataStore.query(TaskAnswer, id);
      if (!toDelete) {
        throw new Error(`TaskAnswer with id ${id} not found`);
      }

      await DataStore.delete(toDelete);
    } catch (error) {
      console.error("Error deleting task answer:", error);
      throw error;
    }
  }

  static subscribeTaskAnswers(
    callback: (items: TaskAnswer[], isSynced: boolean) => void
  ): {
    unsubscribe: () => void;
  } {
    console.log(
      "[TaskAnswerService] Setting up DataStore subscription for TaskAnswer"
    );

    const querySubscription = DataStore.observeQuery(TaskAnswer).subscribe(
      snapshot => {
        const { items, isSynced } = snapshot;

        console.log("[TaskAnswerService] DataStore subscription update:", {
          itemCount: items.length,
          isSynced,
          itemIds: items.map(i => i.id),
        });

        callback(items, isSynced);
      }
    );

    // Also observe DELETE operations to ensure deletions trigger updates
    const deleteObserver = DataStore.observe(TaskAnswer).subscribe(msg => {
      if (msg.opType === OpType.DELETE) {
        const isLocalDelete = msg.element?._deleted === true;
        const source = isLocalDelete ? "LOCAL" : "REMOTE_SYNC";

        logWithDevice(
          "TaskAnswerService",
          `DELETE operation detected (${source})`,
          {
            taskAnswerId: msg.element?.id,
            taskId: msg.element?.taskId,
            deleted: msg.element?._deleted,
            operationType: msg.opType,
          }
        );

        DataStore.query(TaskAnswer)
          .then(answers => {
            logWithDevice(
              "TaskAnswerService",
              "Query refresh after DELETE completed",
              {
                remainingAnswerCount: answers.length,
              }
            );
            callback(answers, true);
          })
          .catch(err => {
            logErrorWithDevice(
              "TaskAnswerService",
              "Error refreshing after delete",
              err
            );
          });
      }
    });

    return {
      unsubscribe: () => {
        console.log("[TaskAnswerService] Unsubscribing from DataStore");
        querySubscription.unsubscribe();
        deleteObserver.unsubscribe();
      },
    };
  }

  /**
   * Delete all TaskAnswers
   * @returns {Promise<number>} - The number of task answers deleted
   */
  static async deleteAllTaskAnswers(): Promise<number> {
    try {
      const answers = await DataStore.query(TaskAnswer);
      let deletedCount = 0;

      // Delete in batches to avoid overwhelming the sync queue
      const batchSize = 10;
      for (let i = 0; i < answers.length; i += batchSize) {
        const batch = answers.slice(i, i + batchSize);
        await Promise.all(batch.map(answer => DataStore.delete(answer)));
        deletedCount += batch.length;

        // Small delay between batches to allow sync
        if (i + batchSize < answers.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log("[TaskAnswerService] Deleted all task answers", {
        deletedCount,
        totalQueried: answers.length,
      });

      return deletedCount;
    } catch (error) {
      console.error("Error deleting all task answers:", error);
      throw error;
    }
  }

  static async clearDataStore(): Promise<void> {
    try {
      await DataStore.clear();
    } catch (error) {
      console.error("Error clearing DataStore:", error);
      throw error;
    }
  }
}
