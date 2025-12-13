import { useState, useEffect } from "react";
import { TaskService } from "../services/TaskService";
import { Task, TaskFilters, TaskStatus, TaskType } from "../types/Task";

interface UseTaskListReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  isSynced: boolean;
  handleDeleteTask: (id: string) => Promise<void>;
  retryLoading: () => void;
  clearDataStore: () => Promise<void>;
  refreshTasks: () => Promise<void>;
}

export const useTaskList = (filters?: TaskFilters): UseTaskListReturn => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const [subscription, setSubscription] = useState<{
    unsubscribe: () => void;
  } | null>(null);

  const initTasks = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Subscribe to changes in tasks
      const sub = TaskService.subscribeTasks((items, synced) => {
        console.log("========================================");
        console.log("[useTaskList] SUBSCRIPTION CALLBACK FIRED");
        console.log("[useTaskList] Items count:", items.length);
        console.log("[useTaskList] Synced:", synced);
        console.log(
          "[useTaskList] Items:",
          items.map(t => ({
            id: t.id,
            title: t.title,
            status: t.status,
            statusString: t.status,
            isStarted: t.status === TaskStatus.STARTED,
            isInProgress: t.status === TaskStatus.INPROGRESS,
            isCompleted: t.status === TaskStatus.COMPLETED,
          }))
        );
        console.log("========================================");
        // Apply filters if provided
        let filteredItems = items;

        if (filters) {
          if (filters.status && filters.status.length > 0) {
            filteredItems = filteredItems.filter(task =>
              filters.status!.includes(task.status as TaskStatus)
            );
          }

          if (filters.taskType && filters.taskType.length > 0) {
            filteredItems = filteredItems.filter(task =>
              filters.taskType!.includes(task.taskType as TaskType)
            );
          }

          if (filters.searchText) {
            const searchLower = filters.searchText.toLowerCase();
            filteredItems = filteredItems.filter(
              task =>
                task.title.toLowerCase().includes(searchLower) ||
                (task.description &&
                  task.description.toLowerCase().includes(searchLower))
            );
          }

          if (filters.dateFrom || filters.dateTo) {
            filteredItems = filteredItems.filter(task => {
              if (!task.startTimeInMillSec) return false;

              const taskDate = new Date(task.startTimeInMillSec);

              if (filters.dateFrom && taskDate < filters.dateFrom) {
                return false;
              }

              if (filters.dateTo && taskDate > filters.dateTo) {
                return false;
              }

              return true;
            });
          }
        }

        console.log(
          "[useTaskList] Setting tasks:",
          filteredItems.length,
          "after filtering"
        );
        setTasks(filteredItems as unknown as Task[]);
        setIsSynced(synced);
        setLoading(false);
      });

      setSubscription(sub);
    } catch (err) {
      console.error("Error initializing tasks:", err);
      setError("Failed to load tasks. Please try again.");
      setLoading(false);
    }
  };

  useEffect(() => {
    initTasks();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const handleDeleteTask = async (id: string): Promise<void> => {
    try {
      await TaskService.deleteTask(id);
      // The subscription will automatically update the UI
    } catch (err) {
      console.error("Error deleting task:", err);
      setError("Failed to delete task. Please try again.");
    }
  };

  const retryLoading = () => {
    setLoading(true);
    setError(null);
    if (subscription) {
      subscription.unsubscribe();
    }
    initTasks();
  };

  const refreshTasks = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const allTasks = await TaskService.getTasks(filters);
      setTasks(allTasks as unknown as Task[]);
      setLoading(false);
    } catch (err) {
      console.error("Error refreshing tasks:", err);
      setError("Failed to refresh tasks. Please try again.");
      setLoading(false);
    }
  };

  const clearDataStore = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      if (subscription) {
        subscription.unsubscribe();
      }

      await TaskService.clearDataStore();

      initTasks();
    } catch (err) {
      console.error("Error clearing DataStore:", err);
      setError("Failed to clear DataStore. Please try again.");
      setLoading(false);
    }
  };

  return {
    tasks,
    loading,
    error,
    isSynced,
    handleDeleteTask,
    retryLoading,
    clearDataStore,
    refreshTasks,
  };
};
