/**
 * Mock Task data factory for testing.
 *
 * Provides consistent Task object creation across all tests.
 */

import { Task, TaskStatus, TaskType } from "@task-types/Task";

/**
 * Creates a mock Task with sensible defaults.
 *
 * @param id - Unique task identifier
 * @param title - Task title
 * @param startTime - Optional start time in milliseconds
 * @returns A complete mock Task object
 *
 * @example
 * ```typescript
 * const task = createMockTask("task-1", "Complete report", Date.now());
 * ```
 */
export const createMockTask = (
  id: string,
  title: string,
  startTime?: number
): Task => ({
  id,
  pk: `PK-${id}`,
  sk: `SK-${id}`,
  title,
  taskType: TaskType.SCHEDULED,
  status: TaskStatus.OPEN,
  startTimeInMillSec: startTime,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
