/**
 * Task Grouping Utilities - LX Parity
 *
 * Ported from Lumiere/src/components/tasks/hooks/useTodayTasks.ts
 *
 * Provides task grouping logic to match LX dashboard behavior.
 */

import { Task } from "@task-types/Task";
import {
  getTaskExpirationWithRecall,
  getTimeInMinutes,
  isTaskInRecallPeriod,
} from "./taskFiltering";

/**
 * Interface for task group with metadata
 */
export interface TaskGroup {
  /** Time label for the group (e.g., "11:00 AM", "2:30 PM") */
  timeLabel: string;
  /** Tasks in this group */
  tasks: Task[];
  /** Whether this group contains tasks in recall period */
  hasRecall: boolean;
}

/**
 * Groups tasks by their dueByLabel (time label)
 *
 * Handles recall period logic:
 * - Tasks in recall period get their dueByLabel updated based on recall expiration
 * - dueByUpdated field is set for tasks in recall period
 *
 * @param tasks - The list of tasks to group
 * @returns Record where keys are due time labels and values are arrays of tasks
 *
 * @example
 * ```typescript
 * const grouped = groupTasksByDueByLabel(tasks);
 * // Returns: { "11:00 AM": [task1, task2], "2:30 PM": [task3] }
 * ```
 */
export const groupTasksByDueByLabel = (
  tasks: Task[]
): { [key: string]: Task[] } => {
  if (!tasks || tasks.length === 0) {
    return {};
  }

  const result = tasks.reduce<{ [key: string]: Task[] }>((acc, task) => {
    // Create a shallow copy to avoid mutating original task
    const taskCopy = { ...task };

    // Compute dueByLabel from expireTimeInMillSec if not provided
    let groupByDueByLabel = taskCopy.dueByLabel;
    if (!groupByDueByLabel && taskCopy.expireTimeInMillSec) {
      const expireDate = new Date(taskCopy.expireTimeInMillSec);
      const hours = expireDate.getHours();
      const minutes = expireDate.getMinutes();
      const isPM = hours >= 12;
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
      groupByDueByLabel = `${displayHours}:${displayMinutes} ${isPM ? "PM" : "AM"}`;
    }
    if (!groupByDueByLabel) {
      groupByDueByLabel = "no-time";
    }

    // Check if task recall is active for scheduled or timed tasks
    if (isTaskInRecallPeriod(taskCopy)) {
      // Update groupByDueByLabel if task recall is active
      const expirationWithRecall = getTaskExpirationWithRecall(taskCopy);
      if (expirationWithRecall) {
        const recallDate = new Date(expirationWithRecall);
        // Format as time label (e.g., "11:00 AM")
        const hours = recallDate.getHours();
        const minutes = recallDate.getMinutes();
        const isPM = hours >= 12;
        const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
        const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
        groupByDueByLabel = `${displayHours}:${displayMinutes} ${isPM ? "PM" : "AM"}`;
        taskCopy.dueByUpdated = recallDate;
      } else {
        taskCopy.dueByUpdated = undefined;
      }
    } else {
      // Set dueByUpdated to current expiration for non-recall tasks
      if (taskCopy.expireTimeInMillSec) {
        taskCopy.dueByUpdated = new Date(taskCopy.expireTimeInMillSec);
      }
    }

    return {
      ...acc,
      [groupByDueByLabel]: [...(acc[groupByDueByLabel] || []), taskCopy],
    };
  }, {});

  return result;
};

/**
 * Sorts task groups by recall status and time
 *
 * Sorting rules:
 * 1. Recall tasks (with recall period active) come first
 * 2. Within same recall status, sort by time (earliest first)
 *
 * @param taskGroups - Task groups to sort (from groupTasksByDueByLabel)
 * @returns Array of [timeLabel, tasks] tuples, sorted
 *
 * @example
 * ```typescript
 * const grouped = groupTasksByDueByLabel(tasks);
 * const sorted = sortTaskGroups(grouped);
 * // Returns: [["11:00 AM", [task1]], ["2:30 PM", [task2]]]
 * ```
 */
export const sortTaskGroups = (taskGroups: {
  [key: string]: Task[];
}): [string, Task[]][] => {
  const sortedKeys = Object.keys(taskGroups).sort((a, b) => {
    // Check if groups contain recall tasks
    const aHasRecall = taskGroups[a]?.some(task => isTaskInRecallPeriod(task));
    const bHasRecall = taskGroups[b]?.some(task => isTaskInRecallPeriod(task));

    // Recall tasks should come first
    if (aHasRecall && !bHasRecall) return -1;
    if (!aHasRecall && bHasRecall) return 1;

    // If both are recall tasks or both are regular tasks, sort by time
    return getTimeInMinutes(a) - getTimeInMinutes(b);
  });

  return sortedKeys.map(key => [key, taskGroups[key]]);
};

/**
 * Groups and sorts tasks by dueByLabel in a single operation
 *
 * Convenience function that combines groupTasksByDueByLabel and sortTaskGroups.
 *
 * @param tasks - The list of tasks to group and sort
 * @returns Array of TaskGroup objects with metadata
 *
 * @example
 * ```typescript
 * const groups = groupAndSortTasks(tasks);
 * groups.forEach(group => {
 *   console.log(`${group.timeLabel}: ${group.tasks.length} tasks (recall: ${group.hasRecall})`);
 * });
 * ```
 */
export const groupAndSortTasks = (tasks: Task[]): TaskGroup[] => {
  const grouped = groupTasksByDueByLabel(tasks);
  const sorted = sortTaskGroups(grouped);

  return sorted.map(([timeLabel, groupTasks]) => ({
    timeLabel,
    tasks: groupTasks,
    hasRecall: groupTasks.some(task => isTaskInRecallPeriod(task)),
  }));
};
