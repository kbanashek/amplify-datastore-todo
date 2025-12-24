import { useState, useEffect } from "react";
import { TaskHistoryService } from "@services/TaskHistoryService";
import { TaskHistory } from "@task-types/TaskHistory";
import { getServiceLogger } from "@utils/serviceLogger";

const logger = getServiceLogger("useTaskHistoryList");

/**
 * Return type for the useTaskHistoryList hook.
 */
interface UseTaskHistoryListReturn {
  /** List of all task history entries */
  taskHistories: TaskHistory[];
  /** Whether initial data is still loading */
  loading: boolean;
  /** Error message from the most recent operation, or null */
  error: string | null;
  /** Deletes a task history entry by ID */
  handleDeleteTaskHistory: (id: string) => Promise<void>;
  /** Manually refreshes the task history list */
  refreshTaskHistories: () => Promise<void>;
}

/**
 * React hook for managing task history with real-time synchronization.
 *
 * Provides reactive task history data via DataStore subscriptions.
 * Task histories track changes to tasks over time.
 *
 * @returns Object containing task history data, loading states, and management operations
 *
 * @example
 * ```tsx
 * const {
 *   taskHistories,
 *   loading,
 *   handleDeleteTaskHistory,
 * } = useTaskHistoryList();
 *
 * // Find history for a specific task
 * const historyForTask = taskHistories.filter(h => h.taskId === taskId);
 * ```
 */
export const useTaskHistoryList = (): UseTaskHistoryListReturn => {
  const [taskHistories, setTaskHistories] = useState<TaskHistory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<(() => void) | null>(null);

  useEffect(() => {
    const sub = TaskHistoryService.subscribeTaskHistories((items, isSynced) => {
      setTaskHistories(items);
      setLoading(false);
      logger.debug("TaskHistories updated", {
        count: items.length,
        synced: isSynced,
      });
    });
    setSubscription(() => sub.unsubscribe);

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, []);

  const handleDeleteTaskHistory = async (id: string): Promise<void> => {
    try {
      await TaskHistoryService.deleteTaskHistory(id);
    } catch (err) {
      logger.error("Error deleting task history", err);
      setError("Failed to delete task history.");
    }
  };

  const refreshTaskHistories = async (): Promise<void> => {
    try {
      setLoading(true);
      const allHistories = await TaskHistoryService.getTaskHistories();
      setTaskHistories(allHistories);
      setLoading(false);
    } catch (err) {
      logger.error("Error refreshing task histories", err);
      setError("Failed to refresh task histories.");
      setLoading(false);
    }
  };

  return {
    taskHistories,
    loading,
    error,
    handleDeleteTaskHistory,
    refreshTaskHistories,
  };
};
