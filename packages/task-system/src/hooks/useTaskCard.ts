/**
 * Custom hook for TaskCard component logic.
 *
 * Handles task status updates, event handlers, and computed values.
 * Separates business logic from presentation layer.
 *
 * @module useTaskCard
 */

import { TaskService } from "@services/TaskService";
import { Task, TaskStatus } from "@task-types/Task";
import { useTaskTranslation } from "@translations/index";
import { getServiceLogger } from "@utils/logging/serviceLogger";
import { getTaskIcon } from "@utils/icons/taskIcon";
import { useCallback, useMemo } from "react";

const logger = getServiceLogger("useTaskCard");

/**
 * Props for the useTaskCard hook
 */
export interface UseTaskCardProps {
  /** The task object */
  task: Task;
  /** Callback when card/button is pressed */
  onPress?: (task: Task) => void;
}

/**
 * Return type for useTaskCard hook
 */
export interface UseTaskCardReturn {
  /** Task icon configuration */
  icon: { name: string; color: string };
  /** Text for BEGIN/RESUME button */
  beginButtonText: string;
  /** Text for completed badge */
  completedText: string;
  /** Whether task is completed */
  isCompleted: boolean;
  /** Whether card should be disabled */
  isDisabled: boolean;
  /** Handler for BEGIN/RESUME button press */
  handleBeginPress: () => Promise<void>;
  /** Handler for card press */
  handleCardPress: () => Promise<void>;
  /** Translation function */
  t: (key: string) => string;
}

/**
 * Props interface for TaskCard memoization comparison.
 * Matches the TaskCardProps interface from TaskCard component.
 */
export interface TaskCardMemoProps {
  task: Task;
  onPress?: (task: Task) => void;
  onDelete?: (id: string) => void;
  simple?: boolean;
}

/**
 * Custom comparison function for React.memo to prevent unnecessary re-renders.
 *
 * Only re-renders if relevant props have changed:
 * - task.id, task.title, task.status, task.taskType (core display data)
 * - onPress, onDelete callback references
 * - simple flag
 *
 * Note: task.taskType is included because getTaskIcon() uses it to determine
 * which icon to display. Without this check, taskType changes would not trigger
 * re-renders and would display stale icons.
 *
 * @param prevProps - Previous props
 * @param nextProps - Next props
 * @returns True if props are equal (skip re-render), false if different (re-render)
 */
export const areTaskCardPropsEqual = (
  prevProps: TaskCardMemoProps,
  nextProps: TaskCardMemoProps
): boolean => {
  // Compare task properties that affect rendering
  // Note: taskType is critical because getTaskIcon() uses it
  const taskEqual =
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.title === nextProps.task.title &&
    prevProps.task.status === nextProps.task.status &&
    prevProps.task.taskType === nextProps.task.taskType;

  // Compare callback references
  const callbacksEqual =
    prevProps.onPress === nextProps.onPress &&
    prevProps.onDelete === nextProps.onDelete;

  // Compare simple flag
  const simpleEqual = prevProps.simple === nextProps.simple;

  return taskEqual && callbacksEqual && simpleEqual;
};

/**
 * Hook for TaskCard component logic.
 *
 * Provides task display values, status flags, and event handlers.
 * Handles task status updates when BEGIN/RESUME is pressed.
 *
 * @param props - Hook props
 * @returns Task card state and handlers
 *
 * @example
 * ```tsx
 * const {
 *   icon,
 *   beginButtonText,
 *   isCompleted,
 *   handleBeginPress,
 *   handleCardPress,
 * } = useTaskCard({ task, onPress });
 * ```
 */
export const useTaskCard = ({
  task,
  onPress,
}: UseTaskCardProps): UseTaskCardReturn => {
  const { t } = useTaskTranslation();

  // Compute button text based on task status
  const isStarted =
    task.status === TaskStatus.STARTED || task.status === TaskStatus.INPROGRESS;
  const beginButtonText = t(isStarted ? "task.resume" : "task.begin");
  const completedText = t("task.completed");

  // Get task icon
  const icon = useMemo(() => getTaskIcon(task), [task]);

  // Compute status flags
  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isDisabled = isCompleted;

  /**
   * Handles BEGIN/RESUME button press.
   * Updates task status to STARTED if not already started, then navigates.
   */
  const handleBeginPress = useCallback(async () => {
    try {
      // If task is not started, update status to STARTED
      if (
        task.status !== TaskStatus.STARTED &&
        task.status !== TaskStatus.INPROGRESS
      ) {
        await TaskService.updateTask(task.id, {
          status: TaskStatus.STARTED,
        });
      }
    } catch (error) {
      logger.error("Error updating task status", error);
    } finally {
      // Call the onPress callback regardless of updateTask success
      // This ensures consistent UX - user still navigates even if status update fails
      onPress?.(task);
    }
  }, [task, onPress]);

  /**
   * Handles card press.
   * Updates task status to STARTED if not already started, then navigates.
   * Ignores presses on completed tasks.
   */
  const handleCardPress = useCallback(async () => {
    if (isCompleted) return;

    try {
      // If task is not started, update status to STARTED when card is clicked
      // This ensures the button text updates to "RESUME" when user returns to dashboard
      if (
        task.status !== TaskStatus.STARTED &&
        task.status !== TaskStatus.INPROGRESS
      ) {
        await TaskService.updateTask(task.id, {
          status: TaskStatus.STARTED,
        });
      }
      // Call the onPress callback
      onPress?.(task);
    } catch (error) {
      logger.error("Error updating task status on card press", error);
      // Still navigate even if status update fails
      onPress?.(task);
    }
  }, [task, onPress, isCompleted]);

  return {
    icon,
    beginButtonText,
    completedText,
    isCompleted,
    isDisabled,
    handleBeginPress,
    handleCardPress,
    t,
  };
};
