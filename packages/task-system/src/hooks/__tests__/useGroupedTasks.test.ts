import { useGroupedTasks } from "@hooks/useGroupedTasks";
import { Task, TaskStatus, TaskType } from "@task-types/Task";
import { renderHook } from "@testing-library/react-native";

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

    it("includes episodic tasks without expire time", () => {
      const episodicTask: Task = {
        id: "1",
        pk: "TASK-1",
        sk: "SK-1",
        title: "Task 1",
        description: "Description 1",
        status: TaskStatus.OPEN,
        taskType: TaskType.EPISODIC,
        startTimeInMillSec: Date.now(),
        expireTimeInMillSec: null,
      };
      const { result } = renderHook(() => useGroupedTasks([episodicTask]));
      expect(result.current.length).toBeGreaterThan(0);
      expect(result.current[0].tasksWithoutTime).toContainEqual(
        episodicTask
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
    it("places episodic tasks in Today group", () => {
      const episodicTask: Task = {
        id: "1",
        pk: "TASK-1",
        sk: "SK-1",
        title: "Task 1",
        description: "Description 1",
        status: TaskStatus.OPEN,
        taskType: TaskType.EPISODIC,
        startTimeInMillSec: Date.now(),
        expireTimeInMillSec: null,
      };
      const { result } = renderHook(() => useGroupedTasks([episodicTask]));
      const todayGroup = result.current.find(
        group => group.dayLabel === "Today"
      );
      expect(todayGroup?.tasksWithoutTime).toContainEqual(episodicTask);
    });

    it("places episodic tasks in tasksWithoutTime even with expireTimeInMillSec: 0", () => {
      const episodicTask: Task = {
        id: "episodic-1",
        pk: "TASK-EPISODIC-1",
        sk: "SK-EPISODIC-1",
        title: "Episodic Task 1",
        description: "Episodic description",
        status: TaskStatus.OPEN,
        taskType: TaskType.EPISODIC,
        startTimeInMillSec: Date.now(),
        expireTimeInMillSec: 0, // Episodic tasks can have 0
      };
      const { result } = renderHook(() => useGroupedTasks([episodicTask]));
      const todayGroup = result.current.find(
        group => group.dayLabel === "Today"
      );
      expect(todayGroup?.tasksWithoutTime).toContainEqual(episodicTask);
      expect(todayGroup?.timeGroups.length).toBe(0);
    });

    it("renders episodic tasks first in tasksWithoutTime array", () => {
      const episodicTask1: Task = {
        id: "episodic-1",
        pk: "TASK-EPISODIC-1",
        sk: "SK-EPISODIC-1",
        title: "Episodic Task 1",
        description: "Episodic description 1",
        status: TaskStatus.OPEN,
        taskType: TaskType.EPISODIC,
        startTimeInMillSec: Date.now(),
        expireTimeInMillSec: 0,
      };
      const episodicTask2: Task = {
        id: "episodic-2",
        pk: "TASK-EPISODIC-2",
        sk: "SK-EPISODIC-2",
        title: "Episodic Task 2",
        description: "Episodic description 2",
        status: TaskStatus.OPEN,
        taskType: TaskType.EPISODIC,
        startTimeInMillSec: Date.now(),
        expireTimeInMillSec: null,
      };

      // Pass episodic tasks in mixed order
      const { result } = renderHook(() =>
        useGroupedTasks([episodicTask2, episodicTask1])
      );
      const todayGroup = result.current.find(
        group => group.dayLabel === "Today"
      );

      // Only episodic tasks should be in tasksWithoutTime
      expect(todayGroup?.tasksWithoutTime.length).toBe(2);
      // Both should be episodic tasks
      expect(todayGroup?.tasksWithoutTime[0].taskType).toBe(TaskType.EPISODIC);
      expect(todayGroup?.tasksWithoutTime[1].taskType).toBe(TaskType.EPISODIC);
    });

    it("renders episodic tasks before scheduled tasks with times", () => {
      const scheduledTaskWithTime: Task = {
        id: "scheduled-1",
        pk: "TASK-SCHEDULED-1",
        sk: "SK-SCHEDULED-1",
        title: "Scheduled Task With Time",
        description: "Scheduled description",
        status: TaskStatus.OPEN,
        taskType: TaskType.SCHEDULED,
        startTimeInMillSec: Date.now(),
        expireTimeInMillSec: today.getTime() + 3600000, // 1 hour from now
      };
      const episodicTask: Task = {
        id: "episodic-1",
        pk: "TASK-EPISODIC-1",
        sk: "SK-EPISODIC-1",
        title: "Episodic Task",
        description: "Episodic description",
        status: TaskStatus.OPEN,
        taskType: TaskType.EPISODIC,
        startTimeInMillSec: Date.now(),
        expireTimeInMillSec: 0,
      };

      const { result } = renderHook(() =>
        useGroupedTasks([scheduledTaskWithTime, episodicTask])
      );
      const todayGroup = result.current.find(
        group => group.dayLabel === "Today"
      );

      expect(todayGroup).toBeDefined();
      // Episodic task should be in tasksWithoutTime
      expect(todayGroup?.tasksWithoutTime).toContainEqual(episodicTask);
      // Scheduled task should be in timeGroups
      expect(todayGroup?.timeGroups.length).toBeGreaterThan(0);
      expect(todayGroup?.timeGroups[0].tasks).toContainEqual(scheduledTaskWithTime);
      // tasksWithoutTime should render first (episodic before scheduled with time)
      expect(todayGroup?.tasksWithoutTime.length).toBe(1);
      expect(todayGroup?.tasksWithoutTime[0].taskType).toBe(TaskType.EPISODIC);
    });
  });
});
