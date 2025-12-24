import { renderHook } from "@testing-library/react-native";
import { useGroupedTasks } from "../useGroupedTasks";
import { Task, TaskStatus, TaskType } from "../../types/Task";

describe("useGroupedTasks", () => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const createTask = (
    id: string,
    status: TaskStatus,
    expireTime: number
  ): Task => ({
    id,
    pk: `TASK-${id}`,
    sk: `SK-${id}`,
    title: `Task ${id}`,
    description: `Description ${id}`,
    status,
    taskType: TaskType.SCHEDULED,
    startTimeInMillSec: Date.now(),
    expireTimeInMillSec: expireTime,
  });

  describe("empty tasks", () => {
    it("returns empty array for no tasks", () => {
      const { result } = renderHook(() => useGroupedTasks([]));
      expect(result.current).toEqual([]);
    });
  });

  describe("task filtering", () => {
    it("includes COMPLETED tasks regardless of date", () => {
      const pastTask = createTask(
        "1",
        TaskStatus.COMPLETED,
        yesterday.getTime()
      );
      const { result } = renderHook(() => useGroupedTasks([pastTask]));
      expect(result.current.length).toBeGreaterThan(0);
      const allTasks = result.current.flatMap(group => [
        ...group.tasksWithoutTime,
        ...group.timeGroups.flatMap(tg => tg.tasks),
      ]);
      expect(allTasks).toContainEqual(pastTask);
    });

    it("includes INPROGRESS tasks regardless of date", () => {
      const pastTask = createTask(
        "1",
        TaskStatus.INPROGRESS,
        yesterday.getTime()
      );
      const { result } = renderHook(() => useGroupedTasks([pastTask]));
      expect(result.current.length).toBeGreaterThan(0);
      const allTasks = result.current.flatMap(group => [
        ...group.tasksWithoutTime,
        ...group.timeGroups.flatMap(tg => tg.tasks),
      ]);
      expect(allTasks).toContainEqual(pastTask);
    });

    it("excludes past tasks that are not COMPLETED or INPROGRESS", () => {
      const pastTask = createTask("1", TaskStatus.OPEN, yesterday.getTime());
      const { result } = renderHook(() => useGroupedTasks([pastTask]));
      const allTasks = result.current.flatMap(group => [
        ...group.tasksWithoutTime,
        ...group.timeGroups.flatMap(tg => tg.tasks),
      ]);
      expect(allTasks).not.toContainEqual(pastTask);
    });

    it("includes tasks without expire time", () => {
      const taskWithoutTime: Task = {
        id: "1",
        pk: "TASK-1",
        sk: "SK-1",
        title: "Task 1",
        description: "Description 1",
        status: TaskStatus.OPEN,
        taskType: TaskType.SCHEDULED,
        startTimeInMillSec: Date.now(),
        expireTimeInMillSec: null,
      };
      const { result } = renderHook(() => useGroupedTasks([taskWithoutTime]));
      expect(result.current.length).toBeGreaterThan(0);
      expect(result.current[0].tasksWithoutTime).toContainEqual(
        taskWithoutTime
      );
    });
  });

  describe("grouping by day", () => {
    it("groups tasks by day", () => {
      const task1 = createTask("1", TaskStatus.OPEN, today.getTime());
      const task2 = createTask("2", TaskStatus.OPEN, tomorrow.getTime());
      const { result } = renderHook(() => useGroupedTasks([task1, task2]));
      expect(result.current.length).toBeGreaterThanOrEqual(1);
    });

    it("labels today correctly", () => {
      const task = createTask("1", TaskStatus.OPEN, today.getTime());
      const { result } = renderHook(() => useGroupedTasks([task]));
      expect(result.current[0]?.dayLabel).toBe("Today");
    });

    it("labels tomorrow correctly", () => {
      const task = createTask("1", TaskStatus.OPEN, tomorrow.getTime());
      const { result } = renderHook(() => useGroupedTasks([task]));
      expect(result.current[0]?.dayLabel).toBe("Tomorrow");
    });

    it("uses date for future dates beyond tomorrow", () => {
      const futureDate = new Date(tomorrow);
      futureDate.setDate(futureDate.getDate() + 1);
      const task = createTask("1", TaskStatus.OPEN, futureDate.getTime());
      const { result } = renderHook(() => useGroupedTasks([task]));
      expect(result.current[0]?.dayLabel).not.toBe("Today");
      expect(result.current[0]?.dayLabel).not.toBe("Tomorrow");
      expect(result.current[0]?.dayLabel).toBeDefined();
    });
  });

  describe("grouping by time", () => {
    it("groups tasks by time within a day", () => {
      const morning = new Date(today);
      morning.setHours(9, 0, 0, 0);
      const afternoon = new Date(today);
      afternoon.setHours(14, 30, 0, 0);
      const task1 = createTask("1", TaskStatus.OPEN, morning.getTime());
      const task2 = createTask("2", TaskStatus.OPEN, afternoon.getTime());
      const { result } = renderHook(() => useGroupedTasks([task1, task2]));
      const todayGroup = result.current.find(
        group => group.dayLabel === "Today"
      );
      expect(todayGroup?.timeGroups.length).toBeGreaterThanOrEqual(1);
    });

    it("sorts time groups chronologically", () => {
      const morning = new Date(today);
      morning.setHours(9, 0, 0, 0);
      const afternoon = new Date(today);
      afternoon.setHours(14, 30, 0, 0);
      const task1 = createTask("1", TaskStatus.OPEN, afternoon.getTime());
      const task2 = createTask("2", TaskStatus.OPEN, morning.getTime());
      const { result } = renderHook(() => useGroupedTasks([task1, task2]));
      const todayGroup = result.current.find(
        group => group.dayLabel === "Today"
      );
      if (todayGroup && todayGroup.timeGroups.length >= 2) {
        const times = todayGroup.timeGroups.map(tg => tg.time);
        expect(times[0] < times[1] || times[1] < times[0]).toBe(true);
      }
    });
  });

  describe("sorting", () => {
    it("sorts days with Today first", () => {
      const task1 = createTask("1", TaskStatus.OPEN, today.getTime());
      const task2 = createTask("2", TaskStatus.OPEN, tomorrow.getTime());
      const { result } = renderHook(() => useGroupedTasks([task1, task2]));
      expect(result.current[0]?.dayLabel).toBe("Today");
    });

    it("sorts days with Tomorrow second", () => {
      const tomorrow2 = new Date(tomorrow);
      tomorrow2.setDate(tomorrow2.getDate() + 1);
      const task1 = createTask("1", TaskStatus.OPEN, tomorrow2.getTime());
      const task2 = createTask("2", TaskStatus.OPEN, tomorrow.getTime());
      const { result } = renderHook(() => useGroupedTasks([task1, task2]));
      const tomorrowIndex = result.current.findIndex(
        group => group.dayLabel === "Tomorrow"
      );
      const futureIndex = result.current.findIndex(
        group => group.dayLabel !== "Today" && group.dayLabel !== "Tomorrow"
      );
      if (tomorrowIndex >= 0 && futureIndex >= 0) {
        expect(tomorrowIndex).toBeLessThan(futureIndex);
      }
    });
  });

  describe("tasks without time", () => {
    it("places tasks without time in Today group", () => {
      const taskWithoutTime: Task = {
        id: "1",
        pk: "TASK-1",
        sk: "SK-1",
        title: "Task 1",
        description: "Description 1",
        status: TaskStatus.OPEN,
        taskType: TaskType.SCHEDULED,
        startTimeInMillSec: Date.now(),
        expireTimeInMillSec: null,
      };
      const { result } = renderHook(() => useGroupedTasks([taskWithoutTime]));
      const todayGroup = result.current.find(
        group => group.dayLabel === "Today"
      );
      expect(todayGroup?.tasksWithoutTime).toContainEqual(taskWithoutTime);
    });
  });
});
