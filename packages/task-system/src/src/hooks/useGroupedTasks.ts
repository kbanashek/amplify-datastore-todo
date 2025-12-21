import React from "react";
import { Task, TaskStatus } from "../types/Task";

export interface GroupedTask {
  dayLabel: string;
  dayDate: string;
  tasksWithoutTime: Task[];
  timeGroups: { time: string; tasks: Task[] }[];
}

export const useGroupedTasks = (tasks: Task[]): GroupedTask[] => {
  return React.useMemo(() => {
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
    const tasksWithTime = allTasks.filter(task => task.expireTimeInMillSec);
    const tasksWithoutTime = allTasks.filter(task => !task.expireTimeInMillSec);

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
    if (tasksWithoutTime.length > 0) {
      const today = new Date();
      const todayKey = createDayKey(today);
      if (!byDay[todayKey]) {
        byDay[todayKey] = [];
      }
      byDay[todayKey].unshift(...tasksWithoutTime);
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
      const withTime = dayTasks.filter(task => task.expireTimeInMillSec);
      const withoutTime = dayTasks.filter(task => !task.expireTimeInMillSec);

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

      // Format date for display
      const dayDate = firstTaskDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      // Use "Today" or "Tomorrow" for labels, actual date for others
      let dayLabel: string;
      if (diffDays === 0) {
        dayLabel = "Today";
      } else if (diffDays === 1) {
        dayLabel = "Tomorrow";
      } else {
        dayLabel = dayDate; // Use actual date for future dates
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

      result.push({
        dayLabel,
        dayDate,
        tasksWithoutTime: withoutTime,
        timeGroups,
      });
    });

    return result;
  }, [tasks]);
};
