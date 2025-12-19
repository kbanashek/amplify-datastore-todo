import { useEffect, useMemo, useState } from "react";
import { useAmplify } from "../contexts/AmplifyContext";
import { TaskService } from "../services/TaskService";
import { Task, TaskFilters } from "../types/Task";
import { NetworkStatus } from "./useAmplifyState";

interface UseTaskListReturn {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  isSynced: boolean;
  isOnline: boolean;
  handleDeleteTask: (id: string) => Promise<void>;
  retryLoading: () => void;
  clearDataStore: () => Promise<void>;
  refreshTasks: () => Promise<void>;
}

export const useTaskList = (filters?: TaskFilters): UseTaskListReturn => {
  const [allTasks, setAllTasks] = useState<Task[]>([]); // Store unfiltered tasks
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSynced, setIsSynced] = useState<boolean>(false);
  const { networkStatus } = useAmplify();
  const isOnline = networkStatus === NetworkStatus.Online;
  const [subscription, setSubscription] = useState<{
    unsubscribe: () => void;
  } | null>(null);

  const initTasks = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Subscribe to changes in tasks - just store data, don't filter
      // Filtering happens in useMemo below
      const sub = TaskService.subscribeTasks((items, synced) => {
        // Store unfiltered tasks - filtering happens in useMemo
        setAllTasks(items);
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

  // Memoize filtered tasks - only recalculates when allTasks or filters change
  const tasks = useMemo(() => {
    if (!filters) return allTasks;

    let filtered = allTasks;

    // Apply status filter
    if (filters.status && filters.status.length > 0) {
      filtered = filtered.filter(task => filters.status!.includes(task.status));
    }

    // Apply taskType filter
    if (filters.taskType && filters.taskType.length > 0) {
      filtered = filtered.filter(task =>
        filters.taskType!.includes(task.taskType)
      );
    }

    // Apply searchText filter
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(searchLower) ||
          (task.description &&
            task.description.toLowerCase().includes(searchLower))
      );
    }

    // Apply date range filter
    if (filters.dateFrom || filters.dateTo) {
      filtered = filtered.filter(task => {
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

    return filtered;
  }, [allTasks, filters]);

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
      const fetchedTasks = await TaskService.getTasks(filters);
      setAllTasks(fetchedTasks);
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
    isOnline,
    handleDeleteTask,
    retryLoading,
    clearDataStore,
    refreshTasks,
  };
};
