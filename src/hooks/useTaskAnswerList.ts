import { useState, useEffect } from "react";
import { TaskAnswerService } from "../services/TaskAnswerService";
import { TaskAnswer } from "../types/TaskAnswer";

interface UseTaskAnswerListReturn {
  taskAnswers: TaskAnswer[];
  loading: boolean;
  error: string | null;
  handleDeleteTaskAnswer: (id: string) => Promise<void>;
  refreshTaskAnswers: () => Promise<void>;
}

export const useTaskAnswerList = (): UseTaskAnswerListReturn => {
  const [taskAnswers, setTaskAnswers] = useState<TaskAnswer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<(() => void) | null>(null);

  useEffect(() => {
    const sub = TaskAnswerService.subscribeTaskAnswers((items, isSynced) => {
      setTaskAnswers(items);
      setLoading(false);
      console.log('[useTaskAnswerList] TaskAnswers updated:', items.length, 'synced:', isSynced);
    });
    setSubscription(sub);

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
      console.error("Error deleting task answer:", err);
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
      console.error("Error refreshing task answers:", err);
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

