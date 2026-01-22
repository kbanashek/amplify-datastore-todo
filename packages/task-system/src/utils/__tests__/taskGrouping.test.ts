/**
 * Unit tests for taskGrouping utilities - LX Parity
 */

import { Task, TaskStatus, TaskType } from "@task-types/Task";
import { groupTasksByDueByLabel, sortTaskGroups } from "../taskGrouping";

describe("taskGrouping", () => {
  const now = Date.now();

  const createTask = (overrides: Partial<Task> = {}): Task => ({
    id: `task-${Date.now()}-${Math.random()}`,
    pk: "TASK-PK",
    sk: "SK",
    title: "Test Task",
    status: TaskStatus.OPEN,
    taskType: TaskType.SCHEDULED,
    startTimeInMillSec: now,
    expireTimeInMillSec: now + 1000 * 60 * 60,
    ...overrides,
  });

  describe("groupTasksByDueByLabel", () => {
    it("groups tasks by dueByLabel", () => {
      const task1 = createTask({ dueByLabel: "11:00 AM", title: "Task 1" });
      const task2 = createTask({ dueByLabel: "11:00 AM", title: "Task 2" });
      const task3 = createTask({ dueByLabel: "2:00 PM", title: "Task 3" });

      const grouped = groupTasksByDueByLabel([task1, task2, task3]);

      expect(grouped["11:00 AM"]).toHaveLength(2);
      expect(grouped["2:00 PM"]).toHaveLength(1);
    });

    it("uses 'no-time' for tasks without dueByLabel and expireTime", () => {
      const task = createTask({
        dueByLabel: undefined,
        expireTimeInMillSec: undefined, // No expireTime to compute dueByLabel from
      });

      const grouped = groupTasksByDueByLabel([task]);

      expect(grouped["no-time"]).toHaveLength(1);
    });

    it("handles empty array", () => {
      const grouped = groupTasksByDueByLabel([]);
      expect(grouped).toEqual({});
    });

    it("adds dueByUpdated for tasks in recall period", () => {
      const expireTime = now - 1000 * 60 * 60; // 1 hour ago
      const task = createTask({
        dueByLabel: "11:00 AM",
        expireTimeInMillSec: expireTime,
        canRecall: 60, // 60 minute recall period
      });

      const grouped = groupTasksByDueByLabel([task]);
      const groupedTask = grouped[Object.keys(grouped)[0]][0];

      expect(groupedTask.dueByUpdated).toBeDefined();
    });

    it("uses expireTimeInMillSec for dueByUpdated when not in recall period", () => {
      const expireTime = now + 1000 * 60 * 60; // 1 hour from now
      const task = createTask({
        dueByLabel: "11:00 AM",
        expireTimeInMillSec: expireTime,
      });

      const grouped = groupTasksByDueByLabel([task]);
      const groupedTask = grouped["11:00 AM"][0];

      expect(groupedTask.dueByUpdated).toEqual(new Date(expireTime));
    });
  });

  describe("sortTaskGroups", () => {
    it("sorts groups by time (AM/PM)", () => {
      const groups = {
        "2:00 PM": [createTask()],
        "11:00 AM": [createTask()],
        "9:00 AM": [createTask()],
      };

      const sorted = sortTaskGroups(groups);

      expect(sorted[0][0]).toBe("9:00 AM");
      expect(sorted[1][0]).toBe("11:00 AM");
      expect(sorted[2][0]).toBe("2:00 PM");
    });

    it("prioritizes recall tasks first", () => {
      const recallTask = createTask({
        expireTimeInMillSec: now - 1000 * 60 * 60,
        canRecall: 60,
      });
      const normalTask = createTask({
        expireTimeInMillSec: now + 1000 * 60 * 60,
      });

      const groups = {
        "2:00 PM": [normalTask],
        "11:00 AM": [recallTask],
      };

      const sorted = sortTaskGroups(groups);

      // Group with recall task should come first
      expect(sorted[0][0]).toBe("11:00 AM");
    });

    it("handles no-time group correctly (puts it last)", () => {
      const groups = {
        "2:00 PM": [createTask()],
        "no-time": [createTask()],
        "11:00 AM": [createTask()],
      };

      const sorted = sortTaskGroups(groups);

      expect(sorted[sorted.length - 1][0]).toBe("no-time");
    });

    it("handles empty groups object", () => {
      const sorted = sortTaskGroups({});
      expect(sorted).toEqual([]);
    });

    it("sorts 12-hour time format correctly", () => {
      const groups = {
        "12:00 PM": [createTask()], // Noon
        "12:00 AM": [createTask()], // Midnight
        "1:00 PM": [createTask()],
        "11:59 PM": [createTask()],
      };

      const sorted = sortTaskGroups(groups);

      expect(sorted[0][0]).toBe("12:00 AM"); // Midnight first
      expect(sorted[1][0]).toBe("12:00 PM"); // Noon
      expect(sorted[2][0]).toBe("1:00 PM");
      expect(sorted[3][0]).toBe("11:59 PM"); // Last
    });

    it("maintains original task order within groups", () => {
      const task1 = createTask({ title: "Task 1" });
      const task2 = createTask({ title: "Task 2" });
      const task3 = createTask({ title: "Task 3" });

      const groups = {
        "11:00 AM": [task1, task2, task3],
      };

      const sorted = sortTaskGroups(groups);

      expect(sorted[0][1]).toEqual([task1, task2, task3]);
    });
  });
});
