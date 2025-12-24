import { useState, useEffect } from "react";
import { TaskAnswerService } from "@services/TaskAnswerService";
import { TaskAnswer } from "@task-types/TaskAnswer";
import { getServiceLogger } from "@utils/serviceLogger";

const logger = getServiceLogger("useTaskAnswerList");

/**
 * Return type for the useTaskAnswerList hook.
 */
interface UseTaskAnswerListReturn {
  /** List of all task answers */
  taskAnswers: TaskAnswer[];
  /** Whether initial data is still loading */
  loading: boolean;
  /** Error message from the most recent operation, or null */
  error: string | null;
  /** Deletes a task answer by ID */
  handleDeleteTaskAnswer: (id: string) => Promise<void>;
  /** Manually refreshes the task answer list */
  refreshTaskAnswers: () => Promise<void>;
}

/**
 * React hook for managing task answers with real-time synchronization.
 *
 * Provides reactive task answer data via DataStore subscriptions and
 * answer management operations. Task answers are automatically updated
 * when changes occur in the DataStore.
 *
 * @returns Object containing task answer data, loading states, and management operations
 *
 * @example
 * ```tsx
 * const {
 *   taskAnswers,
 *   loading,
 *   handleDeleteTaskAnswer,
 * } = useTaskAnswerList();
 *
 * // Find answers for a specific task
 * const answersForTask = taskAnswers.filter(a => a.taskId === taskId);
 * ```
 */
export const useTaskAnswerList = (): UseTaskAnswerListReturn => {
  const [taskAnswers, setTaskAnswers] = useState<TaskAnswer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<(() => void) | null>(null);

  useEffect(() => {
    const sub = TaskAnswerService.subscribeTaskAnswers((items, isSynced) => {
      setTaskAnswers(items);
      setLoading(false);
      logger.debug("TaskAnswers updated", {
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

  const handleDeleteTaskAnswer = async (id: string): Promise<void> => {
    try {
      await TaskAnswerService.deleteTaskAnswer(id);
    } catch (err) {
      logger.error("Error deleting task answer", err);
      setError("Failed to delete task answer.");
    }
  };

  const refreshTaskAnswers = async (): Promise<void> => {
    try {
      setLoading(true);
      const allAnswers = await TaskAnswerService.getTaskAnswers();
      setTaskAnswers(allAnswers);
      setLoading(false);
    } catch (err) {
      logger.error("Error refreshing task answers", err);
      setError("Failed to refresh task answers.");
      setLoading(false);
    }
  };

  return {
    taskAnswers,
    loading,
    error,
    handleDeleteTaskAnswer,
    refreshTaskAnswers,
  };
};
