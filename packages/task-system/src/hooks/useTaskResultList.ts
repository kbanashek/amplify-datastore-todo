import { useState, useEffect } from "react";
import { TaskResultService } from "@services/TaskResultService";
import { TaskResult } from "@task-types/TaskResult";
import { getServiceLogger } from "@utils/logging/serviceLogger";

const logger = getServiceLogger("useTaskResultList");

/**
 * Return type for the useTaskResultList hook.
 */
interface UseTaskResultListReturn {
  /** List of all task results */
  taskResults: TaskResult[];
  /** Whether initial data is still loading */
  loading: boolean;
  /** Error message from the most recent operation, or null */
  error: string | null;
  /** Deletes a task result by ID */
  handleDeleteTaskResult: (id: string) => Promise<void>;
  /** Manually refreshes the task result list */
  refreshTaskResults: () => Promise<void>;
}

/**
 * React hook for managing task results with real-time synchronization.
 *
 * Provides reactive task result data via DataStore subscriptions.
 * Task results contain the outcomes/submissions of completed tasks.
 *
 * @returns Object containing task result data, loading states, and management operations
 *
 * @example
 * ```tsx
 * const {
 *   taskResults,
 *   loading,
 *   handleDeleteTaskResult,
 * } = useTaskResultList();
 *
 * // Find results for a specific task
 * const resultsForTask = taskResults.filter(r => r.taskId === taskId);
 * ```
 */
export const useTaskResultList = (): UseTaskResultListReturn => {
  const [taskResults, setTaskResults] = useState<TaskResult[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<(() => void) | null>(null);

  useEffect(() => {
    const sub = TaskResultService.subscribeTaskResults((items, isSynced) => {
      setTaskResults(items);
      setLoading(false);
      logger.debug("TaskResults updated", {
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

  const handleDeleteTaskResult = async (id: string): Promise<void> => {
    try {
      await TaskResultService.deleteTaskResult(id);
    } catch (err) {
      logger.error("Error deleting task result", err);
      setError("Failed to delete task result.");
    }
  };

  const refreshTaskResults = async (): Promise<void> => {
    try {
      setLoading(true);
      const allResults = await TaskResultService.getTaskResults();
      setTaskResults(allResults);
      setLoading(false);
    } catch (err) {
      logger.error("Error refreshing task results", err);
      setError("Failed to refresh task results.");
      setLoading(false);
    }
  };

  return {
    taskResults,
    loading,
    error,
    handleDeleteTaskResult,
    refreshTaskResults,
  };
};
