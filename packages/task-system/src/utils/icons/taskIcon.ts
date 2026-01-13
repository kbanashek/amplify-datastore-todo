import { AppColors } from "@constants/AppColors";
import { Task, TaskType } from "@task-types/Task";

/**
 * Icon configuration for task icons
 */
export interface TaskIconConfig {
  name: string;
  color: string;
}

/**
 * Get icon name and color based on task type and title
 *
 * This utility function determines the appropriate icon for a task based on:
 * 1. Keywords in the task title (medication, survey, symptom, etc.)
 * 2. Task type (SCHEDULED, TIMED, EPISODIC)
 *
 * @param task - The task object containing title and taskType
 * @returns Icon configuration with name and color
 *
 * @example
 * ```typescript
 * const icon = getTaskIcon({ title: "Medication Reminder", taskType: TaskType.SCHEDULED });
 * // Returns: { name: "pills", color: AppColors.legacy.primary }
 * ```
 */
export const getTaskIcon = (task: Task): TaskIconConfig => {
  const title = (task.title || "").toLowerCase();

  // Check for specific keywords in title
  if (title.includes("medication") || title.includes("diary")) {
    return { name: "pills", color: AppColors.legacy.primary };
  }
  if (title.includes("survey") || title.includes("health")) {
    return { name: "questionmark.circle", color: AppColors.legacy.primary };
  }
  if (title.includes("quality") || title.includes("life")) {
    return { name: "list.clipboard", color: AppColors.legacy.primary };
  }
  if (title.includes("recall") || title.includes("recognition")) {
    return { name: "bell", color: AppColors.legacy.warning };
  }
  if (
    title.includes("symptom") ||
    title.includes("pain") ||
    title.includes("neuropathic")
  ) {
    return { name: "questionmark.circle", color: AppColors.legacy.primary };
  }

  // Default based on task type
  switch (task.taskType) {
    case TaskType.SCHEDULED:
      return { name: "calendar", color: AppColors.legacy.primary };
    case TaskType.TIMED:
      return { name: "clock", color: AppColors.legacy.primary };
    case TaskType.EPISODIC:
      return { name: "repeat", color: AppColors.legacy.primary };
    default:
      return { name: "doc.text", color: AppColors.legacy.primary };
  }
};
