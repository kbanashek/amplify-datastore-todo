import { useState, useEffect } from "react";
import { TaskResultService } from "../services/TaskResultService";
import { TaskResult } from "../types/TaskResult";
import { getServiceLogger } from "../utils/serviceLogger";

const logger = getServiceLogger("useTaskResultList");

interface UseTaskResultListReturn {
  taskResults: TaskResult[];
  loading: boolean;
  error: string | null;
  handleDeleteTaskResult: (id: string) => Promise<void>;
  refreshTaskResults: () => Promise<void>;
}

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
