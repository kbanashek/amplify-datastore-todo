import { DataStore, OpType } from "@aws-amplify/datastore";
import { logWithDevice, logErrorWithDevice } from "../utils/deviceLogger";
import { TaskResult } from "../../models";
import {
  CreateTaskResultInput,
  UpdateTaskResultInput,
} from "../types/TaskResult";

type TaskResultUpdateData = Omit<UpdateTaskResultInput, "id" | "_version">;

export class TaskResultService {
  static configureConflictResolution() {
    DataStore.configure({
      conflictHandler: async ({
        modelConstructor,
        localModel,
        remoteModel,
        operation,
        attempts,
      }) => {
        if (modelConstructor.name === "TaskResult") {
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

  static async createTaskResult(
    input: CreateTaskResultInput
  ): Promise<TaskResult> {
    try {
      console.log(
        "[TaskResultService] Creating task result with DataStore:",
        input
      );
      const result = await DataStore.save(
        new TaskResult({
          ...input,
        })
      );

      console.log(
        "[TaskResultService] TaskResult created successfully:",
        result.id
      );
      return result;
    } catch (error) {
      console.error("Error creating task result:", error);
      throw error;
    }
  }

  static async getTaskResults(): Promise<TaskResult[]> {
    try {
      return await DataStore.query(TaskResult);
    } catch (error) {
      console.error("Error fetching task results:", error);
      throw error;
    }
  }

  static async getTaskResult(id: string): Promise<TaskResult | null> {
    try {
      return await DataStore.query(TaskResult, id);
    } catch (error) {
      console.error("Error fetching task result:", error);
      throw error;
    }
  }

  static async updateTaskResult(
    id: string,
    data: TaskResultUpdateData
  ): Promise<TaskResult> {
    try {
      const original = await DataStore.query(TaskResult, id);
      if (!original) {
        throw new Error(`TaskResult with id ${id} not found`);
      }

      const updated = await DataStore.save(
        TaskResult.copyOf(original, updated => {
          Object.assign(updated, data);
        })
      );

      return updated;
    } catch (error) {
      console.error("Error updating task result:", error);
      throw error;
    }
  }

  static async deleteTaskResult(id: string): Promise<void> {
    try {
      const toDelete = await DataStore.query(TaskResult, id);
      if (!toDelete) {
        throw new Error(`TaskResult with id ${id} not found`);
      }

      await DataStore.delete(toDelete);
    } catch (error) {
      console.error("Error deleting task result:", error);
      throw error;
    }
  }

  static subscribeTaskResults(
    callback: (items: TaskResult[], isSynced: boolean) => void
  ): {
    unsubscribe: () => void;
  } {
    console.log(
      "[TaskResultService] Setting up DataStore subscription for TaskResult"
    );

    const querySubscription = DataStore.observeQuery(TaskResult).subscribe(
      snapshot => {
        const { items, isSynced } = snapshot;

        console.log("[TaskResultService] DataStore subscription update:", {
          itemCount: items.length,
          isSynced,
          itemIds: items.map(i => i.id),
        });

        callback(items, isSynced);
      }
    );

    // Also observe DELETE operations to ensure deletions trigger updates
    const deleteObserver = DataStore.observe(TaskResult).subscribe(msg => {
      if (msg.opType === OpType.DELETE) {
        const isLocalDelete = msg.element?._deleted === true;
        const source = isLocalDelete ? "LOCAL" : "REMOTE_SYNC";

        logWithDevice(
          "TaskResultService",
          `DELETE operation detected (${source})`,
          {
            taskResultId: msg.element?.id,
            taskId: msg.element?.taskId,
            deleted: msg.element?._deleted,
            operationType: msg.opType,
          }
        );

        DataStore.query(TaskResult)
          .then(results => {
            logWithDevice(
              "TaskResultService",
              "Query refresh after DELETE completed",
              {
                remainingResultCount: results.length,
              }
            );
            callback(results, true);
          })
          .catch(err => {
            logErrorWithDevice(
              "TaskResultService",
              "Error refreshing after delete",
              err
            );
          });
      }
    });

    return {
      unsubscribe: () => {
        console.log("[TaskResultService] Unsubscribing from DataStore");
        querySubscription.unsubscribe();
        deleteObserver.unsubscribe();
      },
    };
  }

  /**
   * Delete all TaskResults
   * @returns {Promise<number>} - The number of task results deleted
   */
  static async deleteAllTaskResults(): Promise<number> {
    try {
      const results = await DataStore.query(TaskResult);
      let deletedCount = 0;

      // Delete in batches to avoid overwhelming the sync queue
      const batchSize = 10;
      for (let i = 0; i < results.length; i += batchSize) {
        const batch = results.slice(i, i + batchSize);
        await Promise.all(batch.map(result => DataStore.delete(result)));
        deletedCount += batch.length;

        // Small delay between batches to allow sync
        if (i + batchSize < results.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log("[TaskResultService] Deleted all task results", {
        deletedCount,
        totalQueried: results.length,
      });

      return deletedCount;
    } catch (error) {
      console.error("Error deleting all task results:", error);
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
