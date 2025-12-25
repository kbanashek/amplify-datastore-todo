/**
 * Mock GroupedTask data factory for testing.
 *
 * Provides consistent GroupedTask object creation across all tests.
 */

import { Task } from "@task-types/Task";
import { GroupedTask } from "@hooks/useGroupedTasks";

/**
 * Creates a mock GroupedTask with optional tasks.
 *
 * Supports two usage patterns:
 * 1. Simple: createMockGroupedTask("Today") - empty group
 * 2. With tasks: createMockGroupedTask("Today", [task1, task2]) - tasks go into timeGroups
 * 3. Advanced: createMockGroupedTask("Today", [task1], [task2]) - separate time/no-time tasks
 *
 * @param dayLabel - Day label (e.g., "Today", "Tomorrow", "Wed, Jan 15")
 * @param tasks - Tasks to add to timeGroups (default: empty array)
 * @param tasksWithoutTime - Tasks without specific times (default: empty array)
 * @returns A complete mock GroupedTask object
 *
 * @example
 * ```typescript
 * // Simple grouped task for "Today"
 * const todayGroup = createMockGroupedTask("Today");
 *
 * // Grouped task with tasks (automatically creates timeGroups)
 * const groupWithTasks = createMockGroupedTask("Today", [task1, task2]);
 *
 * // Grouped task with separate time/no-time tasks
 * const advancedGroup = createMockGroupedTask("Today", [timedTask], [untimedTask]);
 * ```
 */
export const createMockGroupedTask = (
  dayLabel: string,
  tasks: Task[] = [],
  tasksWithoutTime: Task[] = []
): GroupedTask => ({
  dayLabel,
  dayDate: new Date().toISOString().split("T")[0],
  tasksWithoutTime,
  timeGroups: tasks.map(task => ({
    time: task.startTimeInMillSec
      ? new Date(task.startTimeInMillSec).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      : "12:00 PM",
    tasks: [task],
  })),
});
