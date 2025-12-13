import { useState, useCallback } from "react";
import { TaskService } from "../services/TaskService";
import { Task, UpdateTaskInput } from "../types/Task";

interface UseTaskUpdateReturn {
  updateTask: (
    id: string,
    data: Omit<UpdateTaskInput, "id" | "_version">
  ) => Promise<Task | null>;
  isUpdating: boolean;
  error: string | null;
}

/**
 * Hook for updating tasks reactively
 * Provides loading state and error handling for task updates
 */
export const useTaskUpdate = (): UseTaskUpdateReturn => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const updateTask = useCallback(
    async (
      id: string,
      data: Omit<UpdateTaskInput, "id" | "_version">
    ): Promise<Task | null> => {
      setIsUpdating(true);
      setError(null);

      try {
        console.log("[useTaskUpdate] Updating task", { id, data });
        const updated = await TaskService.updateTask(id, data);
        console.log("[useTaskUpdate] Task updated successfully", {
          id,
          updated,
        });
        return updated as unknown as Task;
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update task";
        console.error("[useTaskUpdate] Error updating task:", err);
        setError(errorMessage);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    []
  );

  return {
    updateTask,
    isUpdating,
    error,
  };
};
