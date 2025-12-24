import { groupTasksByDate, GroupedTasks } from "@utils/taskGrouping";
import { Task, TaskType, TaskStatus } from "@task-types/Task";

describe("groupTasksByDate", () => {
  const createMockTask = (id: string, startTimeInMillSec?: number): Task => ({
    id,
    pk: `task-${id}`,
    sk: `task-${id}`,
    title: `Task ${id}`,
    taskType: TaskType.SCHEDULED,
    status: TaskStatus.OPEN,
    startTimeInMillSec,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const getTodayTimestamps = () => {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );
    const todayEnd = new Date(todayStart);
    todayEnd.setDate(todayEnd.getDate() + 1);

    return {
      todayStart: todayStart.getTime(),
      todayMidpoint: todayStart.getTime() + 12 * 60 * 60 * 1000, // Noon today
      todayEnd: todayEnd.getTime(),
      yesterday: todayStart.getTime() - 24 * 60 * 60 * 1000,
      tomorrow: todayEnd.getTime(),
      nextWeek: todayEnd.getTime() + 7 * 24 * 60 * 60 * 1000,
    };
  };

  describe("basic grouping", () => {
    it("should group tasks into today category", () => {
      const { todayMidpoint } = getTodayTimestamps();
      const tasks = [createMockTask("1", todayMidpoint)];

      const result = groupTasksByDate(tasks);

      expect(result.today).toHaveLength(1);
      expect(result.today[0].id).toBe("1");
      expect(result.upcoming).toHaveLength(0);
      expect(result.past).toHaveLength(0);
    });

    it("should group tasks into upcoming category", () => {
      const { tomorrow } = getTodayTimestamps();
      const tasks = [createMockTask("1", tomorrow)];

      const result = groupTasksByDate(tasks);

      expect(result.upcoming).toHaveLength(1);
      expect(result.upcoming[0].id).toBe("1");
      expect(result.today).toHaveLength(0);
      expect(result.past).toHaveLength(0);
    });

    it("should group tasks into past category", () => {
      const { yesterday } = getTodayTimestamps();
      const tasks = [createMockTask("1", yesterday)];

      const result = groupTasksByDate(tasks);

      expect(result.past).toHaveLength(1);
      expect(result.past[0].id).toBe("1");
      expect(result.today).toHaveLength(0);
      expect(result.upcoming).toHaveLength(0);
    });
  });

  describe("boundary conditions", () => {
    it("should group task at exact start of today as today", () => {
      const { todayStart } = getTodayTimestamps();
      const tasks = [createMockTask("1", todayStart)];

      const result = groupTasksByDate(tasks);

      expect(result.today).toHaveLength(1);
      expect(result.today[0].id).toBe("1");
    });

    it("should group task at exact end of today (start of tomorrow) as upcoming", () => {
      const { todayEnd } = getTodayTimestamps();
      const tasks = [createMockTask("1", todayEnd)];

      const result = groupTasksByDate(tasks);

      expect(result.upcoming).toHaveLength(1);
      expect(result.upcoming[0].id).toBe("1");
    });

    it("should group task one millisecond before end of today as today", () => {
      const { todayEnd } = getTodayTimestamps();
      const tasks = [createMockTask("1", todayEnd - 1)];

      const result = groupTasksByDate(tasks);

      expect(result.today).toHaveLength(1);
      expect(result.today[0].id).toBe("1");
    });
  });

  describe("tasks without startTimeInMillSec", () => {
    it("should group task without startTimeInMillSec in upcoming", () => {
      const tasks = [createMockTask("1", undefined)];

      const result = groupTasksByDate(tasks);

      expect(result.upcoming).toHaveLength(1);
      expect(result.upcoming[0].id).toBe("1");
      expect(result.today).toHaveLength(0);
      expect(result.past).toHaveLength(0);
    });

    it("should handle mix of tasks with and without startTimeInMillSec", () => {
      const { todayMidpoint, tomorrow } = getTodayTimestamps();
      const tasks = [
        createMockTask("1", todayMidpoint),
        createMockTask("2", undefined),
        createMockTask("3", tomorrow),
      ];

      const result = groupTasksByDate(tasks);

      expect(result.today).toHaveLength(1);
      expect(result.upcoming).toHaveLength(2);
      expect(result.past).toHaveLength(0);
    });
  });

  describe("multiple tasks per group", () => {
    it("should group multiple tasks correctly", () => {
      const { todayMidpoint, tomorrow, yesterday, nextWeek } =
        getTodayTimestamps();
      const tasks = [
        createMockTask("1", todayMidpoint),
        createMockTask("2", todayMidpoint + 1000),
        createMockTask("3", tomorrow),
        createMockTask("4", nextWeek),
        createMockTask("5", yesterday),
        createMockTask("6", yesterday - 1000),
      ];

      const result = groupTasksByDate(tasks);

      expect(result.today).toHaveLength(2);
      expect(result.upcoming).toHaveLength(2);
      expect(result.past).toHaveLength(2);
    });
  });

  describe("sorting within groups", () => {
    it("should sort today tasks by startTimeInMillSec ascending", () => {
      const { todayStart } = getTodayTimestamps();
      const tasks = [
        createMockTask("3", todayStart + 3 * 60 * 60 * 1000), // 3am
        createMockTask("1", todayStart + 1 * 60 * 60 * 1000), // 1am
        createMockTask("2", todayStart + 2 * 60 * 60 * 1000), // 2am
      ];

      const result = groupTasksByDate(tasks);

      expect(result.today).toHaveLength(3);
      expect(result.today[0].id).toBe("1");
      expect(result.today[1].id).toBe("2");
      expect(result.today[2].id).toBe("3");
    });

    it("should sort upcoming tasks by startTimeInMillSec ascending", () => {
      const { todayEnd } = getTodayTimestamps();
      const tasks = [
        createMockTask("3", todayEnd + 3 * 24 * 60 * 60 * 1000), // 3 days
        createMockTask("1", todayEnd), // Tomorrow
        createMockTask("2", todayEnd + 1 * 24 * 60 * 60 * 1000), // 2 days
      ];

      const result = groupTasksByDate(tasks);

      expect(result.upcoming).toHaveLength(3);
      expect(result.upcoming[0].id).toBe("1");
      expect(result.upcoming[1].id).toBe("2");
      expect(result.upcoming[2].id).toBe("3");
    });

    it("should sort past tasks by startTimeInMillSec ascending", () => {
      const { todayStart } = getTodayTimestamps();
      const tasks = [
        createMockTask("2", todayStart - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        createMockTask("3", todayStart - 1 * 24 * 60 * 60 * 1000), // Yesterday
        createMockTask("1", todayStart - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      ];

      const result = groupTasksByDate(tasks);

      expect(result.past).toHaveLength(3);
      expect(result.past[0].id).toBe("1");
      expect(result.past[1].id).toBe("2");
      expect(result.past[2].id).toBe("3");
    });

    it("should sort tasks without startTimeInMillSec as 0 (first in group)", () => {
      const { todayEnd } = getTodayTimestamps();
      const tasks = [
        createMockTask("2", todayEnd + 1000),
        createMockTask("1", undefined),
        createMockTask("3", todayEnd + 2000),
      ];

      const result = groupTasksByDate(tasks);

      expect(result.upcoming).toHaveLength(3);
      expect(result.upcoming[0].id).toBe("1"); // No timestamp = 0, so first
      expect(result.upcoming[1].id).toBe("2");
      expect(result.upcoming[2].id).toBe("3");
    });
  });

  describe("edge cases", () => {
    it("should handle empty array", () => {
      const tasks: Task[] = [];

      const result = groupTasksByDate(tasks);

      expect(result.today).toHaveLength(0);
      expect(result.upcoming).toHaveLength(0);
      expect(result.past).toHaveLength(0);
    });

    it("should handle single task", () => {
      const { todayMidpoint } = getTodayTimestamps();
      const tasks = [createMockTask("1", todayMidpoint)];

      const result = groupTasksByDate(tasks);

      expect(result.today).toHaveLength(1);
    });

    it("should handle tasks with same startTimeInMillSec", () => {
      const { todayMidpoint } = getTodayTimestamps();
      const tasks = [
        createMockTask("1", todayMidpoint),
        createMockTask("2", todayMidpoint),
        createMockTask("3", todayMidpoint),
      ];

      const result = groupTasksByDate(tasks);

      expect(result.today).toHaveLength(3);
      // Order is stable when times are equal
    });

    it("should not mutate original array", () => {
      const { todayMidpoint, tomorrow } = getTodayTimestamps();
      const tasks = [
        createMockTask("2", tomorrow),
        createMockTask("1", todayMidpoint),
      ];
      const originalOrder = tasks.map(t => t.id);

      groupTasksByDate(tasks);

      expect(tasks.map(t => t.id)).toEqual(originalOrder);
    });
  });

  describe("return type structure", () => {
    it("should return object with correct structure", () => {
      const tasks: Task[] = [];

      const result = groupTasksByDate(tasks);

      expect(result).toHaveProperty("today");
      expect(result).toHaveProperty("upcoming");
      expect(result).toHaveProperty("past");
      expect(Array.isArray(result.today)).toBe(true);
      expect(Array.isArray(result.upcoming)).toBe(true);
      expect(Array.isArray(result.past)).toBe(true);
    });

    it("should satisfy GroupedTasks type", () => {
      const tasks: Task[] = [];

      const result: GroupedTasks = groupTasksByDate(tasks);

      expect(result).toBeDefined();
    });
  });
});
