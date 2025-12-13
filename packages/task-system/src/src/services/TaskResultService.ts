import { DataStore, OpType } from "@aws-amplify/datastore";
import { TaskResult } from "../models";
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

    return {
      unsubscribe: () => {
        console.log("[TaskResultService] Unsubscribing from DataStore");
        querySubscription.unsubscribe();
      },
    };
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
