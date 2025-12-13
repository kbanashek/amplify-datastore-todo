import { DataStore, OpType } from "@aws-amplify/datastore";
import { TaskService } from "../TaskService";
import { Task } from "../../../models";
import {
  TaskStatus,
  TaskType,
  CreateTaskInput,
  UpdateTaskInput,
} from "../../types/Task";
import { createMockTask } from "../../__tests__/__mocks__/DataStore.mock";

// Mock DataStore
jest.mock("@aws-amplify/datastore");

describe("TaskService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTask", () => {
    it("should create a task successfully", async () => {
      const mockTask = createMockTask();
      const input: CreateTaskInput = {
        pk: "test-pk",
        sk: "test-sk",
        title: "Test Task",
        description: "Test Description",
        taskType: TaskType.SCHEDULED,
        status: TaskStatus.OPEN,
      };

      (DataStore.save as jest.Mock).mockResolvedValue(mockTask);

      const result = await TaskService.createTask(input);

      expect(DataStore.save).toHaveBeenCalledWith(expect.any(Task));
      expect(result).toEqual(mockTask);
    });

    it("should throw error on create failure", async () => {
      const input: CreateTaskInput = {
        pk: "test-pk",
        sk: "test-sk",
        title: "Test Task",
        taskType: TaskType.SCHEDULED,
        status: TaskStatus.OPEN,
      };

      const error = new Error("Create failed");
      (DataStore.save as jest.Mock).mockRejectedValue(error);

      await expect(TaskService.createTask(input)).rejects.toThrow(
        "Create failed"
      );
    });
  });

  describe("getTasks", () => {
    it("should return all tasks when no filters provided", async () => {
      const mockTasks = [
        createMockTask({ id: "1" }),
        createMockTask({ id: "2" }),
      ];
      (DataStore.query as jest.Mock).mockResolvedValue(mockTasks);

      const result = await TaskService.getTasks();

      expect(DataStore.query).toHaveBeenCalledWith(Task);
      expect(result).toEqual(mockTasks);
    });

    it("should filter tasks by status", async () => {
      const mockTasks = [
        createMockTask({ id: "1", status: TaskStatus.OPEN }),
        createMockTask({ id: "2", status: TaskStatus.COMPLETED }),
        createMockTask({ id: "3", status: TaskStatus.OPEN }),
      ];
      (DataStore.query as jest.Mock).mockResolvedValue(mockTasks);

      const result = await TaskService.getTasks({ status: [TaskStatus.OPEN] });

      expect(result).toHaveLength(2);
      expect(result.every(t => t.status === TaskStatus.OPEN)).toBe(true);
    });

    it("should filter tasks by taskType", async () => {
      const mockTasks = [
        createMockTask({ id: "1", taskType: TaskType.SCHEDULED }),
        createMockTask({ id: "2", taskType: TaskType.TIMED }),
        createMockTask({ id: "3", taskType: TaskType.SCHEDULED }),
      ];
      (DataStore.query as jest.Mock).mockResolvedValue(mockTasks);

      const result = await TaskService.getTasks({
        taskType: [TaskType.SCHEDULED],
      });

      expect(result).toHaveLength(2);
      expect(result.every(t => t.taskType === TaskType.SCHEDULED)).toBe(true);
    });

    it("should filter tasks by searchText", async () => {
      const mockTasks = [
        createMockTask({ id: "1", title: "Task One" }),
        createMockTask({ id: "2", title: "Task Two" }),
        createMockTask({ id: "3", title: "Another Task" }),
      ];
      (DataStore.query as jest.Mock).mockResolvedValue(mockTasks);

      const result = await TaskService.getTasks({ searchText: "One" });

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Task One");
    });

    it("should filter tasks by date range", async () => {
      const now = Date.now();
      const mockTasks = [
        createMockTask({ id: "1", startTimeInMillSec: now - 86400000 }), // Yesterday
        createMockTask({ id: "2", startTimeInMillSec: now }), // Today
        createMockTask({ id: "3", startTimeInMillSec: now + 86400000 }), // Tomorrow
      ];
      (DataStore.query as jest.Mock).mockResolvedValue(mockTasks);

      const dateFrom = new Date(now - 43200000); // 12 hours ago
      const dateTo = new Date(now + 43200000); // 12 hours from now

      const result = await TaskService.getTasks({ dateFrom, dateTo });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("2");
    });
  });

  describe("getTaskById", () => {
    it("should return a task by id", async () => {
      const mockTask = createMockTask({ id: "test-id" });
      (DataStore.query as jest.Mock).mockResolvedValue(mockTask);

      const result = await TaskService.getTaskById("test-id");

      expect(DataStore.query).toHaveBeenCalledWith(Task, "test-id");
      expect(result).toEqual(mockTask);
    });

    it("should return null if task not found", async () => {
      (DataStore.query as jest.Mock).mockResolvedValue(null);

      const result = await TaskService.getTaskById("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("updateTask", () => {
    it("should update a task successfully", async () => {
      const originalTask = createMockTask({ id: "test-id", title: "Original" });
      const updatedTask = createMockTask({ id: "test-id", title: "Updated" });

      (DataStore.query as jest.Mock).mockResolvedValue(originalTask);
      (DataStore.save as jest.Mock).mockResolvedValue(updatedTask);

      const updateData: Omit<UpdateTaskInput, "id" | "_version"> = {
        title: "Updated",
      };

      const result = await TaskService.updateTask("test-id", updateData);

      expect(DataStore.query).toHaveBeenCalledWith(Task, "test-id");
      expect(DataStore.save).toHaveBeenCalled();
      expect(result.title).toBe("Updated");
    });

    it("should throw error if task not found", async () => {
      (DataStore.query as jest.Mock).mockResolvedValue(null);

      await expect(
        TaskService.updateTask("non-existent", { title: "Updated" })
      ).rejects.toThrow("Task with id non-existent not found");
    });
  });

  describe("deleteTask", () => {
    it("should delete a task successfully", async () => {
      const mockTask = createMockTask({ id: "test-id" });
      (DataStore.query as jest.Mock).mockResolvedValue(mockTask);
      (DataStore.delete as jest.Mock).mockResolvedValue(mockTask);

      await TaskService.deleteTask("test-id");

      expect(DataStore.query).toHaveBeenCalledWith(Task, "test-id");
      expect(DataStore.delete).toHaveBeenCalledWith(mockTask);
    });

    it("should throw error if task not found", async () => {
      (DataStore.query as jest.Mock).mockResolvedValue(null);

      await expect(TaskService.deleteTask("non-existent")).rejects.toThrow(
        "Task with id non-existent not found"
      );
    });
  });

  describe("subscribeTasks", () => {
    it("should subscribe to task changes", () => {
      const mockTasks = [createMockTask({ id: "1" })];
      const mockSubscription = {
        subscribe: jest.fn(callback => {
          callback({ items: mockTasks, isSynced: true });
          return { unsubscribe: jest.fn() };
        }),
      };

      (DataStore.observeQuery as jest.Mock).mockReturnValue(mockSubscription);

      const callback = jest.fn();
      const result = TaskService.subscribeTasks(callback);

      expect(DataStore.observeQuery).toHaveBeenCalledWith(Task);
      expect(callback).toHaveBeenCalledWith(mockTasks, true);
      expect(result).toHaveProperty("unsubscribe");
    });
  });

  describe("deleteAllTasks", () => {
    it("should delete all tasks", async () => {
      const mockTasks = [
        createMockTask({ id: "1" }),
        createMockTask({ id: "2" }),
        createMockTask({ id: "3" }),
      ];
      (DataStore.query as jest.Mock).mockResolvedValue(mockTasks);
      (DataStore.delete as jest.Mock).mockResolvedValue(undefined);

      await TaskService.deleteAllTasks();

      expect(DataStore.query).toHaveBeenCalledWith(Task);
      expect(DataStore.delete).toHaveBeenCalledTimes(3);
    });
  });
});
