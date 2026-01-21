import { Task, TaskStatus, TaskType } from "@task-types/Task";
import React from "react";

/**
 * Represents a group of tasks organized by day and time.
 */
export interface GroupedTask {
  /** Human-readable day label (e.g., "Today", "Tomorrow", "Monday") */
  dayLabel: string;
  /** Date string in YYYY-MM-DD format */
  dayDate: string;
  /** Tasks without a specific start time */
  tasksWithoutTime: Task[];
  /** Tasks grouped by their start time */
  timeGroups: { time: string; tasks: Task[] }[];
}

/**
 * React hook for grouping tasks by day and time.
 *
 * Groups tasks into a hierarchical structure organized by:
 * 1. Day (Today, Tomorrow, or weekday name)
 * 2. Time within each day
 *
 * Tasks are filtered to exclude expired tasks (unless they have active status)
 * and sorted chronologically.
 *
 * @param tasks - Array of tasks to group
 * @returns Array of grouped task objects, one per day
 *
 * @example
 * ```tsx
 * const groupedTasks = useGroupedTasks(tasks);
 *
 * // Render grouped tasks
 * groupedTasks.map(group => (
 *   <View key={group.dayDate}>
 *     <Text>{group.dayLabel}</Text>
 *     {group.timeGroups.map(timeGroup => (
 *       <View key={timeGroup.time}>
 *         <Text>{timeGroup.time}</Text>
 *         {timeGroup.tasks.map(task => <TaskCard task={task} />)}
 *       </View>
 *     ))}
 *   </View>
 * ));
 * ```
 */
export const useGroupedTasks = (tasks: Task[]): GroupedTask[] => {
  // Log immediately when hook is called (before useMemo)
  console.warn('[useGroupedTasks] 🔥 HOOK CALLED', {
    totalTasks: tasks.length,
    episodicCount: tasks.filter(t => {
      const taskTypeStr = String(t.taskType).toUpperCase();
      return taskTypeStr === "EPISODIC" || t.taskType === TaskType.EPISODIC;
    }).length,
    allTaskTypes: tasks.map(t => ({
      title: t.title,
      taskType: t.taskType,
      taskTypeStr: String(t.taskType).toUpperCase(),
      expireTime: t.expireTimeInMillSec,
    })),
  });

  return React.useMemo(() => {
    console.warn('[useGroupedTasks] 🚀 Starting task grouping', {
      totalTasks: tasks.length,
      taskTypes: tasks.map(t => ({ title: t.title, taskType: t.taskType, expireTime: t.expireTimeInMillSec })),
    });
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Include all tasks, but handle COMPLETED, INPROGRESS, and STARTED tasks differently
    // These statuses indicate active work and should always be shown regardless of date
    const allTasks = tasks.filter(task => {
      // Always show COMPLETED, INPROGRESS, and STARTED tasks (active work)
      if (
        task.status === TaskStatus.COMPLETED ||
        task.status === TaskStatus.INPROGRESS ||
        task.status === TaskStatus.STARTED
      ) {
        return true;
      }

      // Include tasks without expire time
      if (!task.expireTimeInMillSec) return true;

      // Include tasks that are due today or in the future (by date, not exact time)
      const taskDate = new Date(task.expireTimeInMillSec);
      const taskDay = new Date(
        taskDate.getFullYear(),
        taskDate.getMonth(),
        taskDate.getDate()
      );

      // Show tasks from today onwards (don't filter out past times on today)
      return taskDay >= today;
    });

    // Separate tasks with and without due times
    // Episodic tasks should always be in tasksWithoutTime, even if they have expireTimeInMillSec: 0
    // Handle both enum and string comparisons (LX data might have strings)
    const isEpisodic = (task: Task): boolean => {
      const taskTypeStr = String(task.taskType).toUpperCase();
      const result = taskTypeStr === "EPISODIC" || task.taskType === TaskType.EPISODIC;
      // Debug logging for episodic task detection
      if (result) {
        console.warn('[useGroupedTasks] ✅ Episodic task detected', {
          id: task.id,
          title: task.title,
          taskType: task.taskType,
          taskTypeStr,
          expireTimeInMillSec: task.expireTimeInMillSec,
        });
      }
      return result;
    };

    const tasksWithTime = allTasks.filter(task => {
      // Episodic tasks should not be in tasksWithTime
      if (isEpisodic(task)) return false;
      // Only include tasks with a valid expireTimeInMillSec (> 0)
      return task.expireTimeInMillSec && task.expireTimeInMillSec > 0;
    });
    
    const tasksWithoutTime = allTasks.filter(task => {
      // Only EPISODIC tasks go in tasksWithoutTime
      return isEpisodic(task);
    });

    // Debug logging
    console.warn('[useGroupedTasks] 📊 Task separation', {
      totalTasks: allTasks.length,
      tasksWithTime: tasksWithTime.length,
      tasksWithoutTime: tasksWithoutTime.length,
      episodicInWithoutTime: tasksWithoutTime.filter(isEpisodic).length,
    });

    // Helper function to create consistent dayKey in YYYY-MM-DD format
    const createDayKey = (date: Date): string => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth() returns 0-11, so add 1
      const day = date.getDate().toString().padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    // Group by day (date only, no time)
    const byDay: { [dayKey: string]: Task[] } = {};
    tasksWithTime.forEach(task => {
      if (!task.expireTimeInMillSec) return;
      const taskDate = new Date(task.expireTimeInMillSec);
      const dayKey = createDayKey(taskDate);
      if (!byDay[dayKey]) {
        byDay[dayKey] = [];
      }
      byDay[dayKey].push(task);
    });

    // Add tasks without time to "Today"
    // Sort episodic tasks first before adding to today
    // Handle both enum and string comparisons (LX data might have strings)
    const isEpisodicForSort = (task: Task): boolean => {
      const taskTypeStr = String(task.taskType).toUpperCase();
      return taskTypeStr === "EPISODIC" || task.taskType === TaskType.EPISODIC;
    };

    const sortedTasksWithoutTime = [...tasksWithoutTime].sort((a, b) => {
      // Episodic tasks should always come first
      const aIsEpisodic = isEpisodicForSort(a);
      const bIsEpisodic = isEpisodicForSort(b);
      if (aIsEpisodic && !bIsEpisodic) {
        console.warn('[useGroupedTasks] 🔄 Sorting: Episodic before non-episodic', {
          episodic: { title: a.title, taskType: a.taskType },
          nonEpisodic: { title: b.title, taskType: b.taskType },
        });
        return -1;
      }
      if (!aIsEpisodic && bIsEpisodic) {
        console.warn('[useGroupedTasks] 🔄 Sorting: Non-episodic after episodic', {
          nonEpisodic: { title: a.title, taskType: a.taskType },
          episodic: { title: b.title, taskType: b.taskType },
        });
        return 1;
      }
      // If both are episodic or both are not, maintain original order
      return 0;
    });

    console.warn('[useGroupedTasks] 📋 Sorted tasksWithoutTime before adding to Today', {
      before: tasksWithoutTime.map(t => ({ title: t.title, taskType: t.taskType, isEpisodic: isEpisodicForSort(t) })),
      after: sortedTasksWithoutTime.map(t => ({ title: t.title, taskType: t.taskType, isEpisodic: isEpisodicForSort(t) })),
    });

    if (sortedTasksWithoutTime.length > 0) {
      const today = new Date();
      const todayKey = createDayKey(today);
      if (!byDay[todayKey]) {
        byDay[todayKey] = [];
      }
      byDay[todayKey].unshift(...sortedTasksWithoutTime);
    }

    // Process each day
    const result: GroupedTask[] = [];

    // Sort days: Today first, then Tomorrow, then by date
    const sortedDayKeys = Object.keys(byDay).sort((a, b) => {
      const dayA = byDay[a];
      const dayB = byDay[b];

      // Get dates for comparison
      let dateA: Date, dateB: Date;
      const withTimeA = dayA.filter(task => task.expireTimeInMillSec);
      const withTimeB = dayB.filter(task => task.expireTimeInMillSec);

      if (withTimeA.length > 0) {
        dateA = new Date(withTimeA[0].expireTimeInMillSec!);
      } else {
        dateA = new Date();
      }

      if (withTimeB.length > 0) {
        dateB = new Date(withTimeB[0].expireTimeInMillSec!);
      } else {
        dateB = new Date();
      }

      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const dayAStart = new Date(
        dateA.getFullYear(),
        dateA.getMonth(),
        dateA.getDate()
      );
      const dayBStart = new Date(
        dateB.getFullYear(),
        dateB.getMonth(),
        dateB.getDate()
      );

      const diffA = Math.floor(
        (dayAStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      const diffB = Math.floor(
        (dayBStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Today always first
      if (diffA === 0) return -1;
      if (diffB === 0) return 1;

      // Tomorrow second
      if (diffA === 1) return -1;
      if (diffB === 1) return 1;

      // Then sort by date
      return diffA - diffB;
    });

    sortedDayKeys.forEach(dayKey => {
      const dayTasks = byDay[dayKey];

      // Separate tasks with and without time for this day
      // Episodic tasks should always be in withoutTime, even if they have expireTimeInMillSec: 0
      // Handle both enum and string comparisons (LX data might have strings)
      const isEpisodic = (task: Task): boolean => {
        const taskTypeStr = String(task.taskType).toUpperCase();
        return taskTypeStr === "EPISODIC" || task.taskType === TaskType.EPISODIC;
      };

      const withTime = dayTasks.filter(task => {
        // Episodic tasks should not be in withTime
        if (isEpisodic(task)) return false;
        // Only include tasks with a valid expireTimeInMillSec (> 0)
        return task.expireTimeInMillSec && task.expireTimeInMillSec > 0;
      });
      const withoutTime = dayTasks.filter(task => {
        // Episodic tasks should always be in withoutTime
        if (isEpisodic(task)) return true;
        // Other tasks without expireTimeInMillSec
        return !task.expireTimeInMillSec || task.expireTimeInMillSec === 0;
      });

      // Get date from first task with time, or use today for tasks without time
      let firstTaskDate: Date;
      if (withTime.length > 0) {
        firstTaskDate = new Date(withTime[0].expireTimeInMillSec!);
      } else {
        firstTaskDate = new Date();
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const taskDay = new Date(
        firstTaskDate.getFullYear(),
        firstTaskDate.getMonth(),
        firstTaskDate.getDate()
      );
      const diffDays = Math.floor(
        (taskDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Format date for display - use actual device date for Today/Tomorrow
      let dayDate: string;
      let dayLabel: string;

      if (diffDays === 0 || diffDays < 0) {
        // Today or past: use actual current date
        dayLabel = "Today";
        dayDate = now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      } else if (diffDays === 1) {
        // Tomorrow: use actual tomorrow date
        dayLabel = "Tomorrow";
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        dayDate = tomorrow.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
      } else {
        // Future dates: use task's date
        dayDate = firstTaskDate.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        });
        dayLabel = dayDate;
      }

      // Group by time within the day
      const byTime: { [timeKey: string]: Task[] } = {};
      withTime.forEach(task => {
        if (!task.expireTimeInMillSec) return;
        const taskDate = new Date(task.expireTimeInMillSec);
        const hours = taskDate.getHours();
        const minutes = taskDate.getMinutes();
        const timeKey = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;
        if (!byTime[timeKey]) {
          byTime[timeKey] = [];
        }
        byTime[timeKey].push(task);
      });

      // Sort time groups and format time
      const timeGroups = Object.keys(byTime)
        .sort()
        .map(timeKey => {
          const [hours, minutes] = timeKey.split(":").map(Number);
          const timeDate = new Date();
          timeDate.setHours(hours, minutes);
          const timeStr = timeDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
          return {
            time: timeStr,
            tasks: byTime[timeKey],
          };
        });

      // Sort tasksWithoutTime so episodic tasks appear first
      // Handle both enum and string comparisons (LX data might have strings)
      const isEpisodicForSort = (task: Task): boolean => {
        const taskTypeStr = String(task.taskType).toUpperCase();
        return taskTypeStr === "EPISODIC" || task.taskType === TaskType.EPISODIC;
      };

      console.warn(`[useGroupedTasks] 🔄 Starting sort for ${dayLabel}`, {
        beforeSort: withoutTime.map((t, idx) => ({
          index: idx,
          title: t.title,
          taskType: t.taskType,
          isEpisodic: isEpisodicForSort(t),
        })),
      });

      const sortedWithoutTime = [...withoutTime].sort((a, b) => {
        // Episodic tasks should always come first
        const aIsEpisodic = isEpisodicForSort(a);
        const bIsEpisodic = isEpisodicForSort(b);
        if (aIsEpisodic && !bIsEpisodic) {
          console.warn(`[useGroupedTasks] 🔄 Sorting: Episodic "${a.title}" BEFORE non-episodic "${b.title}"`);
          return -1;
        }
        if (!aIsEpisodic && bIsEpisodic) {
          console.warn(`[useGroupedTasks] 🔄 Sorting: Non-episodic "${a.title}" AFTER episodic "${b.title}"`);
          return 1;
        }
        // If both are episodic or both are not, maintain original order
        return 0;
      });

      // Debug logging for sorting
      if (sortedWithoutTime.length > 0) {
        console.warn(`[useGroupedTasks] 📋 Sorted tasksWithoutTime for ${dayLabel}`, {
          total: sortedWithoutTime.length,
          firstTaskType: sortedWithoutTime[0]?.taskType,
          firstTaskTitle: sortedWithoutTime[0]?.title,
          firstIsEpisodic: isEpisodicForSort(sortedWithoutTime[0]),
          episodicCount: sortedWithoutTime.filter(isEpisodicForSort).length,
          order: sortedWithoutTime.map((t, idx) => ({
            index: idx,
            title: t.title,
            taskType: t.taskType,
            isEpisodic: isEpisodicForSort(t),
            expireTime: t.expireTimeInMillSec,
          })),
        });
      }

      result.push({
        dayLabel,
        dayDate,
        tasksWithoutTime: sortedWithoutTime,
        timeGroups,
      });
    });

    console.warn('[useGroupedTasks] ✅ Final grouped result', {
      totalGroups: result.length,
      groups: result.map(g => ({
        dayLabel: g.dayLabel,
        tasksWithoutTimeCount: g.tasksWithoutTime.length,
        timeGroupsCount: g.timeGroups.length,
        firstTaskWithoutTime: g.tasksWithoutTime[0] ? {
          title: g.tasksWithoutTime[0].title,
          taskType: g.tasksWithoutTime[0].taskType,
        } : null,
        allTasksWithoutTime: g.tasksWithoutTime.map(t => ({
          title: t.title,
          taskType: t.taskType,
        })),
      })),
    });

    return result;
  }, [tasks]);
};
