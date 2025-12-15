import { DataStore, OpType } from "@aws-amplify/datastore";
import { Task as DataStoreTask } from "../../models";
import {
  CreateTaskInput,
  Task,
  TaskFilters,
  TaskStatus,
  TaskType,
  UpdateTaskInput,
} from "../types/Task";
import {
  getLogPrefix,
  logWithDevice,
  logErrorWithDevice,
} from "../utils/deviceLogger";

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
        if (
          modelConstructor.name === "Task" ||
          modelConstructor === DataStoreTask
        ) {
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
        new DataStoreTask({
          ...input,
        })
      );

      console.log("[TaskService] Task created successfully:", task.id);
      return task as Task;
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
      let tasks = await DataStore.query(DataStoreTask);

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

      return tasks as Task[];
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
      const task = await DataStore.query(DataStoreTask, id);
      return (task as Task) || null;
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
      const original = await DataStore.query(DataStoreTask, id);
      if (!original) {
        throw new Error(`Task with id ${id} not found`);
      }

      console.log("[TaskService] Original task status:", original.status);
      const updated = await DataStore.save(
        DataStoreTask.copyOf(original, updated => {
          Object.assign(updated, data);
        })
      );

      console.log("[TaskService] Task updated successfully:", {
        id: updated.id,
        status: updated.status,
        title: updated.title,
      });

      return updated as Task;
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
      const toDelete = await DataStore.query(DataStoreTask, id);
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
    logWithDevice("TaskService", "Setting up DataStore subscription for Task");

    // Use observeQuery for the main subscription (filters out deleted items automatically)
    const querySubscription = DataStore.observeQuery(DataStoreTask).subscribe(
      snapshot => {
        const { items, isSynced } = snapshot;

        logWithDevice("TaskService", "Subscription update (observeQuery)", {
          itemCount: items.length,
          isSynced,
          itemIds: items.map(i => i.id),
          itemStatuses: items.map(i => ({
            id: i.id,
            status: i.status,
            title: i.title,
          })),
        });

        callback(items as Task[], isSynced);
      }
    );

    // Also observe DELETE operations explicitly to ensure deletions trigger updates
    // This ensures that when deletions sync from other devices, the subscription fires
    const deleteObserver = DataStore.observe(DataStoreTask).subscribe(msg => {
      if (msg.opType === OpType.DELETE) {
        const isLocalDelete = msg.element?._deleted === true;
        const source = isLocalDelete ? "LOCAL" : "REMOTE_SYNC";

        logWithDevice("TaskService", `DELETE operation detected (${source})`, {
          taskId: msg.element?.id,
          taskTitle: msg.element?.title,
          deleted: msg.element?._deleted,
          operationType: msg.opType,
          modelConstructor: msg.modelConstructor?.name,
        });

        // The observeQuery subscription will automatically update with the new item count
        // But we explicitly trigger a refresh to ensure immediate update
        DataStore.query(DataStoreTask)
          .then(tasks => {
            logWithDevice(
              "TaskService",
              "Query refresh after DELETE completed",
              {
                remainingTaskCount: tasks.length,
                remainingTaskIds: tasks.map(t => t.id),
              }
            );
            callback(tasks as Task[], true);
          })
          .catch(err => {
            logErrorWithDevice(
              "TaskService",
              "Error refreshing after delete",
              err
            );
          });
      }
    });

    return {
      unsubscribe: () => {
        logWithDevice("TaskService", "Unsubscribing from DataStore");
        querySubscription.unsubscribe();
        deleteObserver.unsubscribe();
      },
    };
  }

  /**
   * Delete all Tasks
   * @returns {Promise<number>} - The number of tasks deleted
   */
  static async deleteAllTasks(): Promise<number> {
    try {
      logWithDevice("TaskService", "Starting deleteAllTasks operation");
      const tasks = await DataStore.query(DataStoreTask);
      let deletedCount = 0;

      logWithDevice("TaskService", "Found tasks to delete", {
        totalTasks: tasks.length,
        taskIds: tasks.map(t => t.id),
      });

      // Delete in batches to avoid overwhelming the sync queue
      const batchSize = 10;
      for (let i = 0; i < tasks.length; i += batchSize) {
        const batch = tasks.slice(i, i + batchSize);
        logWithDevice(
          "TaskService",
          `Deleting batch ${Math.floor(i / batchSize) + 1}`,
          {
            batchSize: batch.length,
            batchTaskIds: batch.map(t => t.id),
          }
        );

        await Promise.all(batch.map(task => DataStore.delete(task)));
        deletedCount += batch.length;

        logWithDevice(
          "TaskService",
          `Batch ${Math.floor(i / batchSize) + 1} deleted, queued for sync`,
          {
            deletedInBatch: batch.length,
            totalDeleted: deletedCount,
          }
        );

        // Small delay between batches to allow sync
        if (i + batchSize < tasks.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      logWithDevice("TaskService", "All tasks deleted, waiting for sync", {
        deletedCount,
        totalQueried: tasks.length,
      });

      // Wait for deletions to sync
      await new Promise(resolve => setTimeout(resolve, 1000));

      logWithDevice("TaskService", "DeleteAllTasks operation complete", {
        deletedCount,
        totalQueried: tasks.length,
      });

      return deletedCount;
    } catch (error) {
      logErrorWithDevice("TaskService", "Error deleting all tasks", error);
      throw error;
    }
  }

  /**
   * Nuclear reset: Delete all task-related submitted data
   * This includes TaskAnswers, TaskResults, TaskHistory, Tasks, DataPoints, and DataPointInstances
   * @returns {Promise<{ tasks: number; taskAnswers: number; taskResults: number; taskHistories: number; dataPoints: number; dataPointInstances: number }>} - Counts of deleted items
   */
  static async nuclearReset(): Promise<{
    tasks: number;
    taskAnswers: number;
    taskResults: number;
    taskHistories: number;
    dataPoints: number;
    dataPointInstances: number;
  }> {
    try {
      const { TaskAnswerService } = await import("./TaskAnswerService");
      const { TaskResultService } = await import("./TaskResultService");
      const { TaskHistoryService } = await import("./TaskHistoryService");
      const { DataPointService } = await import("./DataPointService");

      console.log("[TaskService] Starting nuclear reset...");

      // Delete in order: instances first, then parent data
      // This ensures we delete dependent data before parent data
      const dataPointInstances =
        await DataPointService.deleteAllDataPointInstances();
      const dataPoints = await DataPointService.deleteAllDataPoints();
      const taskAnswers = await TaskAnswerService.deleteAllTaskAnswers();
      const taskResults = await TaskResultService.deleteAllTaskResults();
      const taskHistories = await TaskHistoryService.deleteAllTaskHistories();
      const tasks = await this.deleteAllTasks();

      console.log("[TaskService] Nuclear reset completed", {
        tasks,
        taskAnswers,
        taskResults,
        taskHistories,
        dataPoints,
        dataPointInstances,
      });

      // Wait a bit to allow DataStore to sync deletions to AWS
      // DataStore.delete() queues deletions and syncs them, but we need to give it time
      console.log("[TaskService] Waiting for deletions to sync to AWS...");
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay

      // Verify deletions by querying again
      const {
        TaskAnswer,
        TaskResult,
        TaskHistory,
        DataPoint,
        DataPointInstance,
      } = await import("../../models");
      const remainingTasks = await DataStore.query(DataStoreTask);
      const remainingAnswers = await DataStore.query(TaskAnswer);
      const remainingResults = await DataStore.query(TaskResult);
      const remainingHistories = await DataStore.query(TaskHistory);
      const remainingDataPoints = await DataStore.query(DataPoint);
      const remainingDataPointInstances =
        await DataStore.query(DataPointInstance);

      if (
        remainingTasks.length > 0 ||
        remainingAnswers.length > 0 ||
        remainingResults.length > 0 ||
        remainingHistories.length > 0 ||
        remainingDataPoints.length > 0 ||
        remainingDataPointInstances.length > 0
      ) {
        console.warn(
          "[TaskService] Some items still remain after deletion. This may indicate sync issues.",
          {
            remainingTasks: remainingTasks.length,
            remainingAnswers: remainingAnswers.length,
            remainingResults: remainingResults.length,
            remainingHistories: remainingHistories.length,
            remainingDataPoints: remainingDataPoints.length,
            remainingDataPointInstances: remainingDataPointInstances.length,
          }
        );
      } else {
        console.log(
          "[TaskService] All items successfully deleted and synced to AWS"
        );
      }

      return {
        tasks,
        taskAnswers,
        taskResults,
        taskHistories,
        dataPoints,
        dataPointInstances,
      };
    } catch (error) {
      console.error("Error during nuclear reset:", error);
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
