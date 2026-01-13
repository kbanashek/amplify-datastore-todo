import { Task } from "@task-types/Task";

/**
 * Grouped tasks by date category
 */
export interface GroupedTasks {
  today: Task[];
  upcoming: Task[];
  past: Task[];
}

/**
 * Groups tasks by date into today, upcoming, and past categories.
 *
 * Tasks are categorized as follows:
 * - **today**: Tasks with startTimeInMillSec within today's date range (00:00 to 23:59)
 * - **upcoming**: Tasks with startTimeInMillSec in the future, or tasks without a startTimeInMillSec
 * - **past**: Tasks with startTimeInMillSec before today
 *
 * Within each group, tasks are sorted by startTimeInMillSec in ascending order.
 * Tasks without startTimeInMillSec are placed at the beginning of their group (sorted as 0).
 *
 * @param tasks - Array of tasks to group
 * @returns Object containing tasks grouped by date category
 *
 * @example
 * ```typescript
 * const tasks = [
 *   { id: "1", startTimeInMillSec: Date.now(), ... },
 *   { id: "2", startTimeInMillSec: Date.now() + 86400000, ... }, // Tomorrow
 * ];
 * const grouped = groupTasksByDate(tasks);
 * // grouped.today contains tasks for today
 * // grouped.upcoming contains tasks for tomorrow and beyond
 * ```
 */
export const groupTasksByDate = (tasks: Task[]): GroupedTasks => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const grouped: GroupedTasks = {
    today: [],
    upcoming: [],
    past: [],
  };

  tasks.forEach(task => {
    // If no startTimeInMillSec, put in upcoming
    if (!task.startTimeInMillSec) {
      grouped.upcoming.push(task);
      return;
    }

    const taskDate = new Date(task.startTimeInMillSec);

    if (taskDate >= todayStart && taskDate < todayEnd) {
      grouped.today.push(task);
    } else if (taskDate >= todayEnd) {
      grouped.upcoming.push(task);
    } else {
      grouped.past.push(task);
    }
  });

  // Sort each group by start time
  const sortByStartTime = (a: Task, b: Task) => {
    const aTime = a.startTimeInMillSec || 0;
    const bTime = b.startTimeInMillSec || 0;
    return aTime - bTime;
  };

  grouped.today.sort(sortByStartTime);
  grouped.upcoming.sort(sortByStartTime);
  grouped.past.sort(sortByStartTime);

  return grouped;
};
