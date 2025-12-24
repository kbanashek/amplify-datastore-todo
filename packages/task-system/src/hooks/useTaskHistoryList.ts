import { useState, useEffect } from "react";
import { TaskHistoryService } from "../services/TaskHistoryService";
import { TaskHistory } from "../types/TaskHistory";
import { getServiceLogger } from "../utils/serviceLogger";

const logger = getServiceLogger("useTaskHistoryList");

interface UseTaskHistoryListReturn {
  taskHistories: TaskHistory[];
  loading: boolean;
  error: string | null;
  handleDeleteTaskHistory: (id: string) => Promise<void>;
  refreshTaskHistories: () => Promise<void>;
}

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
