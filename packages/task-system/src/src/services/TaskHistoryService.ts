import { DataStore, OpType } from "@aws-amplify/datastore";
import { TaskHistory } from "../models";
import {
  CreateTaskHistoryInput,
  UpdateTaskHistoryInput,
} from "../types/TaskHistory";

type TaskHistoryUpdateData = Omit<UpdateTaskHistoryInput, "id" | "_version">;

export class TaskHistoryService {
  static configureConflictResolution() {
    DataStore.configure({
      conflictHandler: async ({
        modelConstructor,
        localModel,
        remoteModel,
        operation,
        attempts,
      }) => {
        if (modelConstructor.name === "TaskHistory") {
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

  static async createTaskHistory(
    input: CreateTaskHistoryInput
  ): Promise<TaskHistory> {
    try {
      console.log(
        "[TaskHistoryService] Creating task history with DataStore:",
        input
      );
      const history = await DataStore.save(
        new TaskHistory({
          ...input,
        })
      );

      console.log(
        "[TaskHistoryService] TaskHistory created successfully:",
        history.id
      );
      return history;
    } catch (error) {
      console.error("Error creating task history:", error);
      throw error;
    }
  }

  static async getTaskHistories(): Promise<TaskHistory[]> {
    try {
      return await DataStore.query(TaskHistory);
    } catch (error) {
      console.error("Error fetching task histories:", error);
      throw error;
    }
  }

  static async getTaskHistory(id: string): Promise<TaskHistory | null> {
    try {
      return await DataStore.query(TaskHistory, id);
    } catch (error) {
      console.error("Error fetching task history:", error);
      throw error;
    }
  }

  static async updateTaskHistory(
    id: string,
    data: TaskHistoryUpdateData
  ): Promise<TaskHistory> {
    try {
      const original = await DataStore.query(TaskHistory, id);
      if (!original) {
        throw new Error(`TaskHistory with id ${id} not found`);
      }

      const updated = await DataStore.save(
        TaskHistory.copyOf(original, updated => {
          Object.assign(updated, data);
        })
      );

      return updated;
    } catch (error) {
      console.error("Error updating task history:", error);
      throw error;
    }
  }

  static async deleteTaskHistory(id: string): Promise<void> {
    try {
      const toDelete = await DataStore.query(TaskHistory, id);
      if (!toDelete) {
        throw new Error(`TaskHistory with id ${id} not found`);
      }

      await DataStore.delete(toDelete);
    } catch (error) {
      console.error("Error deleting task history:", error);
      throw error;
    }
  }

  static subscribeTaskHistories(
    callback: (items: TaskHistory[], isSynced: boolean) => void
  ): {
    unsubscribe: () => void;
  } {
    console.log(
      "[TaskHistoryService] Setting up DataStore subscription for TaskHistory"
    );

    const querySubscription = DataStore.observeQuery(TaskHistory).subscribe(
      snapshot => {
        const { items, isSynced } = snapshot;

        console.log("[TaskHistoryService] DataStore subscription update:", {
          itemCount: items.length,
          isSynced,
          itemIds: items.map(i => i.id),
        });

        callback(items, isSynced);
      }
    );

    return {
      unsubscribe: () => {
        console.log("[TaskHistoryService] Unsubscribing from DataStore");
        querySubscription.unsubscribe();
      },
    };
  }

  /**
   * Delete all TaskHistories
   * @returns {Promise<number>} - The number of task histories deleted
   */
  static async deleteAllTaskHistories(): Promise<number> {
    try {
      const histories = await DataStore.query(TaskHistory);
      let deletedCount = 0;

      for (const history of histories) {
        await DataStore.delete(history);
        deletedCount++;
      }

      console.log("[TaskHistoryService] Deleted all task histories", {
        deletedCount,
      });

      return deletedCount;
    } catch (error) {
      console.error("Error deleting all task histories:", error);
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
