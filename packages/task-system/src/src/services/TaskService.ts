import { DataStore, OpType } from "@aws-amplify/datastore";
import { ModelName } from "../constants/modelNames";
import { OperationSource } from "../constants/operationSource";
import { Task as DataStoreTask } from "../models";
import {
  CreateTaskInput,
  Task,
  TaskFilters,
  TaskStatus,
  TaskType,
  UpdateTaskInput,
} from "../types/Task";
import { logErrorWithDevice, logWithDevice } from "../utils/deviceLogger";

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
        if (modelConstructor.name === ModelName.Task) {
          // For update operations
          if (operation === OpType.UPDATE) {
            // CRITICAL: Preserve local status changes to prevent tasks from disappearing
            // If local has a status that indicates progress (STARTED, INPROGRESS, COMPLETED),
            // prefer it over remote OPEN status to prevent regression
            const shouldPreferLocalStatus =
              localModel.status &&
              (localModel.status === TaskStatus.STARTED ||
                localModel.status === TaskStatus.INPROGRESS ||
                localModel.status === TaskStatus.COMPLETED) &&
              remoteModel.status === TaskStatus.OPEN;

            // Prefer local status changes, but remote timing updates
            const resolvedModel = {
              ...remoteModel, // Start with remote model as base
              // Preserve local status if it indicates progress, otherwise use remote
              status: shouldPreferLocalStatus
                ? localModel.status
                : localModel.status || remoteModel.status,
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
      logWithDevice("TaskService", "Creating task with DataStore", input);
      const task = await DataStore.save(
        new DataStoreTask({
          ...input,
        })
      );

      logWithDevice("TaskService", "Task created successfully", {
        id: task.id,
      });
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
      logWithDevice("TaskService", "updateTask called", { id, data });
      const original = await DataStore.query(DataStoreTask, id);
      if (!original) {
        throw new Error(`Task with id ${id} not found`);
      }

      logWithDevice("TaskService", "Original task before update", {
        id: original.id,
        status: original.status,
        title: original.title,
        _version: (original as any)._version,
      });

      const updated = await DataStore.save(
        DataStoreTask.copyOf(original, updated => {
          Object.assign(updated, data);
        })
      );

      logWithDevice(
        "TaskService",
        "Task updated successfully - syncing to cloud immediately",
        {
          id: updated.id,
          status: updated.status,
          title: updated.title,
          _version: (updated as any)._version,
        }
      );

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

    // CRITICAL: Do an initial query to ensure tasks are loaded immediately
    // observeQuery may not fire immediately, so we query first to populate the UI
    DataStore.query(DataStoreTask)
      .then(initialTasks => {
        logWithDevice("TaskService", "Initial task query completed", {
          itemCount: initialTasks.length,
          itemIds: initialTasks.slice(0, 10).map(i => i.id),
        });
        // Call callback with initial data - assume synced if we got data
        callback(initialTasks as Task[], initialTasks.length > 0);
      })
      .catch(err => {
        logErrorWithDevice("TaskService", "Initial task query failed", err);
        // Still set up subscription even if initial query fails
        callback([], false);
      });

    // Use observeQuery for the main subscription (filters out deleted items automatically)
    // This handles local operations and most remote operations
    const querySubscription = DataStore.observeQuery(DataStoreTask).subscribe(
      snapshot => {
        const { items, isSynced } = snapshot;

        // Only log in development to reduce production overhead
        if (__DEV__) {
          logWithDevice("TaskService", "Subscription update (observeQuery)", {
            itemCount: items.length,
            isSynced,
            itemIds: items.slice(0, 10).map(i => i.id), // Only log first 10 IDs
          });
        }

        callback(items as Task[], isSynced);
      }
    );

    // CRITICAL: Observe ALL operations to ensure cross-device sync
    // observeQuery may not always fire for remote updates reliably, so we explicitly observe
    // all operations and refresh the query to ensure immediate UI updates across devices
    // This is a safety net to catch any remote updates that observeQuery might miss
    const changeObserver = DataStore.observe(DataStoreTask).subscribe(msg => {
      const element = msg.element as any;

      // Detect if this is a remote operation (from another device)
      // For DELETE: local deletes have _deleted === true, remote deletes come from sync
      // For UPDATE/INSERT: remote operations typically have higher _version or come via sync
      const isLocalDelete =
        msg.opType === OpType.DELETE && element?._deleted === true;
      const source = isLocalDelete
        ? OperationSource.LOCAL
        : OperationSource.REMOTE_SYNC;

      // Verbose observe logging is gated in logWithDevice() to avoid console "loops".

      // Refresh query IMMEDIATELY for ALL operations to ensure cross-device sync
      // This is critical for catching remote updates from other devices
      // We refresh on all operations because:
      // 1. Remote operations need immediate UI updates
      // 2. Local operations might have been missed by observeQuery
      // 3. DELETE operations especially need immediate refresh to sync deletions
      // 4. This ensures consistency across devices
      DataStore.query(DataStoreTask)
        .then(tasks => {
          // Verbose query-refresh logging is gated in logWithDevice() to avoid console "loops".
          // Always call callback to ensure UI updates across all devices
          // This is CRITICAL for DELETE operations - without this, deletions won't appear on other devices
          callback(tasks as Task[], true);
        })
        .catch(err => {
          logErrorWithDevice(
            "TaskService",
            `❌ Error refreshing after ${msg.opType} (${source})`,
            err
          );
          // Even on error, try to call callback with current state to prevent UI from being stuck
          DataStore.query(DataStoreTask)
            .then(tasks => callback(tasks as Task[], false))
            .catch(() => {
              // If query fails completely, at least log it
              logErrorWithDevice(
                "TaskService",
                "❌ Complete failure to refresh after operation",
                err
              );
            });
        });
    });

    return {
      unsubscribe: () => {
        logWithDevice("TaskService", "Unsubscribing from DataStore");
        querySubscription.unsubscribe();
        changeObserver.unsubscribe();
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
   * This includes TaskAnswers, TaskResults, TaskHistory, and Tasks
   * @returns {Promise<{ tasks: number; taskAnswers: number; taskResults: number; taskHistories: number }>} - Counts of deleted items
   */
  static async nuclearReset(): Promise<{
    tasks: number;
    taskAnswers: number;
    taskResults: number;
    taskHistories: number;
  }> {
    try {
      // Import services dynamically to avoid circular dependencies
      const { TaskAnswerService } = await import("./TaskAnswerService");
      const { TaskResultService } = await import("./TaskResultService");
      const { TaskHistoryService } = await import("./TaskHistoryService");

      logWithDevice("TaskService", "Starting nuclear reset...");

      // Delete in order: answers, results, histories first, then tasks
      // This ensures we delete dependent data before parent data
      const taskAnswers = await TaskAnswerService.deleteAllTaskAnswers();
      const taskResults = await TaskResultService.deleteAllTaskResults();
      const taskHistories = await TaskHistoryService.deleteAllTaskHistories();
      const tasks = await this.deleteAllTasks();

      logWithDevice("TaskService", "Nuclear reset completed", {
        tasks,
        taskAnswers,
        taskResults,
        taskHistories,
      });

      return {
        tasks,
        taskAnswers,
        taskResults,
        taskHistories,
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
