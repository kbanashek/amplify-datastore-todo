import { useState, useCallback, useEffect } from "react";
import { TaskAnswerService } from "@services/TaskAnswerService";
import {
  TaskAnswer,
  CreateTaskAnswerInput,
  UpdateTaskAnswerInput,
} from "@task-types/TaskAnswer";
import { getServiceLogger } from "@utils/serviceLogger";

const logger = getServiceLogger("useTaskAnswer");

interface UseTaskAnswerReturn {
  // Get answers by taskId
  getAnswersByTaskId: (taskId: string) => TaskAnswer[];
  // Get answer by questionId for a specific task
  getAnswerByQuestionId: (
    taskId: string,
    questionId: string
  ) => TaskAnswer | undefined;
  // Create a new task answer
  createTaskAnswer: (
    input: CreateTaskAnswerInput
  ) => Promise<TaskAnswer | null>;
  // Update an existing task answer
  updateTaskAnswer: (
    id: string,
    data: Omit<UpdateTaskAnswerInput, "id" | "_version">
  ) => Promise<TaskAnswer | null>;
  // Get all answers (reactive)
  taskAnswers: TaskAnswer[];
  loading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
}

/**
 * Hook for managing task answers reactively
 * Provides reactive updates, filtering, and CRUD operations
 */
export const useTaskAnswer = (): UseTaskAnswerReturn => {
  const [taskAnswers, setTaskAnswers] = useState<TaskAnswer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  // Subscribe to task answer changes
  useEffect(() => {
    const sub = TaskAnswerService.subscribeTaskAnswers((items, isSynced) => {
      setTaskAnswers(items);
      setLoading(false);
      logger.debug("TaskAnswers updated", {
        count: items.length,
        synced: isSynced,
      });
    });

    return () => {
      if (sub) {
        sub.unsubscribe();
      }
    };
  }, []);

  const getAnswersByTaskId = useCallback(
    (taskId: string): TaskAnswer[] => {
      return taskAnswers.filter(answer => answer.taskInstanceId === taskId);
    },
    [taskAnswers]
  );

  const getAnswerByQuestionId = useCallback(
    (taskId: string, questionId: string): TaskAnswer | undefined => {
      return taskAnswers.find(
        answer =>
          answer.taskInstanceId === taskId && answer.questionId === questionId
      );
    },
    [taskAnswers]
  );

  const createTaskAnswer = useCallback(
    async (input: CreateTaskAnswerInput): Promise<TaskAnswer | null> => {
      setIsCreating(true);
      setError(null);

      try {
        logger.debug("Creating task answer", input);
        const created = await TaskAnswerService.createTaskAnswer(input);
        logger.info("Task answer created successfully", created);
        // The subscription will automatically update taskAnswers
        return created;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create task answer";
        logger.error("Error creating task answer", err);
        setError(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    []
  );

  const updateTaskAnswer = useCallback(
    async (
      id: string,
      data: Omit<UpdateTaskAnswerInput, "id" | "_version">
    ): Promise<TaskAnswer | null> => {
      setIsUpdating(true);
      setError(null);

      try {
        logger.debug("Updating task answer", { id, data });
        const updated = await TaskAnswerService.updateTaskAnswer(id, data);
        logger.info("Task answer updated successfully", updated);
        // The subscription will automatically update taskAnswers
        return updated;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update task answer";
        logger.error("Error updating task answer", err);
        setError(errorMessage);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return {
    getAnswersByTaskId,
    getAnswerByQuestionId,
    createTaskAnswer,
    updateTaskAnswer,
    taskAnswers,
    loading,
    error,
    isCreating,
    isUpdating,
  };
};
