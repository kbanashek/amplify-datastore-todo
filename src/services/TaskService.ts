import { DataStore, OpType } from "@aws-amplify/datastore";
import { Task } from "../../models";
import {
  CreateTaskInput,
  TaskFilters,
  TaskStatus,
  TaskType,
  UpdateTaskInput,
} from "../types/Task";

type TaskUpdateData = Omit<UpdateTaskInput, "id" | "_version">;

export class TaskService {
  /**
   * Configure DataStore with custom conflict resolution strategy for Task model
   */
  static configureConflictResolution() {
    DataStore.configure({
      conflictHandler: async ({
        modelConstructor,
        localModel,
        remoteModel,
        operation,
        attempts,
      }) => {
        // For Task model conflicts
        if (modelConstructor.name === "Task") {
          // For update operations
          if (operation === OpType.UPDATE) {
            // Prefer local status changes, but remote timing updates
            const resolvedModel = {
              ...remoteModel, // Start with remote model as base
              status: localModel.status || remoteModel.status, // Prefer local status
              // For timing, prefer remote if it's more recent
              startTimeInMillSec:
                remoteModel.startTimeInMillSec || localModel.startTimeInMillSec,
              expireTimeInMillSec:
                remoteModel.expireTimeInMillSec ||
                localModel.expireTimeInMillSec,
              endTimeInMillSec:
                remoteModel.endTimeInMillSec || localModel.endTimeInMillSec,
              // For activity responses, prefer local if it exists
              activityAnswer:
                localModel.activityAnswer || remoteModel.activityAnswer,
              activityResponse:
                localModel.activityResponse || remoteModel.activityResponse,
            };

            return resolvedModel;
          }

          // For delete operations, handle carefully
          if (operation === OpType.DELETE) {
            // If remote is already deleted, use that version
            if (remoteModel._deleted) {
              return remoteModel;
            }

            // If local model is incomplete, use remote with _deleted flag
            if (!localModel.title && !localModel.description) {
              return { ...remoteModel, _deleted: true };
            }

            // Otherwise use local delete
            return localModel;
          }
        }

        // Default to remote model for other cases
        return remoteModel;
      },
    });
  }

  /**
   * Create a new Task
   * @param {CreateTaskInput} input - The input data for creating a task
   * @returns {Promise<Task>} - The created task
   */
  static async createTask(input: CreateTaskInput): Promise<Task> {
    try {
      console.log("[TaskService] Creating task with DataStore:", input);
      const task = await DataStore.save(
        new Task({
          ...input,
        })
      );

      console.log("[TaskService] Task created successfully:", task.id);
      return task;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  /**
   * Get all Tasks with optional filters
   * @param {TaskFilters} filters - Optional filters for tasks
   * @returns {Promise<Task[]>} - Array of tasks
   */
  static async getTasks(filters?: TaskFilters): Promise<Task[]> {
    try {
      let tasks = await DataStore.query(Task);

      // Apply filters
      if (filters) {
        if (filters.status && filters.status.length > 0) {
          tasks = tasks.filter(task =>
            filters.status!.includes(task.status as TaskStatus)
          );
        }

        if (filters.taskType && filters.taskType.length > 0) {
          tasks = tasks.filter(task =>
            filters.taskType!.includes(task.taskType as TaskType)
          );
        }

        if (filters.searchText) {
          const searchLower = filters.searchText.toLowerCase();
          tasks = tasks.filter(
            task =>
              task.title?.toLowerCase().includes(searchLower) ||
              (task.description &&
                task.description.toLowerCase().includes(searchLower))
          );
        }

        if (filters.dateFrom || filters.dateTo) {
          tasks = tasks.filter(task => {
            if (!task.startTimeInMillSec) return false;
            const taskDate = new Date(task.startTimeInMillSec);
            if (filters.dateFrom && taskDate < filters.dateFrom) return false;
            if (filters.dateTo && taskDate > filters.dateTo) return false;
            return true;
          });
        }
      }

      return tasks;
    } catch (error) {
      console.error("Error fetching tasks:", error);
      throw error;
    }
  }

  /**
   * Get a Task by ID
   * @param {string} id - The id of the task
   * @returns {Promise<Task | null>} - The task or null if not found
   */
  static async getTaskById(id: string): Promise<Task | null> {
    try {
      const task = await DataStore.query(Task, id);
      return task || null;
    } catch (error) {
      console.error("Error fetching task:", error);
      throw error;
    }
  }

  /**
   * Update a Task
   * @param {string} id - The id of the task to update
   * @param {TaskUpdateData} data - The data to update
   * @returns {Promise<Task>} - The updated task
   */
  static async updateTask(id: string, data: TaskUpdateData): Promise<Task> {
    try {
      console.log("[TaskService] updateTask called:", { id, data });
      const original = await DataStore.query(Task, id);
      if (!original) {
        throw new Error(`Task with id ${id} not found`);
      }

      console.log("[TaskService] Original task status:", original.status);
      const updated = await DataStore.save(
        Task.copyOf(original, updated => {
          Object.assign(updated, data);
        })
      );

      console.log("[TaskService] Task updated successfully:", {
        id: updated.id,
        status: updated.status,
        title: updated.title,
      });

      return updated;
    } catch (error) {
      console.error("[TaskService] Error updating task:", error);
      throw error;
    }
  }

  /**
   * Delete a Task
   * @param {string} id - The id of the task to delete
   * @returns {Promise<void>}
   */
  static async deleteTask(id: string): Promise<void> {
    try {
      const toDelete = await DataStore.query(Task, id);
      if (!toDelete) {
        throw new Error(`Task with id ${id} not found`);
      }

      await DataStore.delete(toDelete);
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }

  /**
   * Subscribe to changes in Task items
   * @param {Function} callback - Function to call when changes occur
   * @returns {Function} - Unsubscribe function
   */
  static subscribeTasks(callback: (items: Task[], isSynced: boolean) => void): {
    unsubscribe: () => void;
  } {
    console.log("[TaskService] Setting up DataStore subscription for Task");

    const querySubscription = DataStore.observeQuery(Task).subscribe(
      snapshot => {
        const { items, isSynced } = snapshot;

        console.log("[TaskService] DataStore subscription update:", {
          itemCount: items.length,
          isSynced,
          itemIds: items.map(i => i.id),
          itemStatuses: items.map(i => ({
            id: i.id,
            status: i.status,
            title: i.title,
          })),
        });

        callback(items, isSynced);
      }
    );

    return {
      unsubscribe: () => {
        console.log("[TaskService] Unsubscribing from DataStore");
        querySubscription.unsubscribe();
      },
    };
  }

  /**
   * Delete all Tasks
   * @returns {Promise<number>} - The number of tasks deleted
   */
  static async deleteAllTasks(): Promise<number> {
    try {
      const tasks = await DataStore.query(Task);
      let deletedCount = 0;

      for (const task of tasks) {
        await DataStore.delete(task);
        deletedCount++;
      }

      return deletedCount;
    } catch (error) {
      console.error("Error deleting all tasks:", error);
      throw error;
    }
  }

  /**
   * Clear the DataStore completely
   * This will remove all local data and trigger a fresh sync from the server
   * @returns {Promise<void>}
   */
  static async clearDataStore(): Promise<void> {
    try {
      await DataStore.clear();
    } catch (error) {
      console.error("Error clearing DataStore:", error);
      throw error;
    }
  }
}
