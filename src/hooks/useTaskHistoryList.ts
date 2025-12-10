import { useEffect, useState } from "react";
import { TaskHistoryService } from "../services/TaskHistoryService";
import { TaskHistory } from "../types/TaskHistory";

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
  useEffect(() => {
    const sub = TaskHistoryService.subscribeTaskHistories((items, isSynced) => {
      setTaskHistories(items);
      setLoading(false);
      console.log(
        "[useTaskHistoryList] TaskHistories updated:",
        items.length,
        "synced:",
        isSynced
      );
    });

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
      console.error("Error deleting task history:", err);
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
      console.error("Error refreshing task histories:", err);
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
