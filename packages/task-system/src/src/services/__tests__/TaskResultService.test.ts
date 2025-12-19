import { DataStore } from "@aws-amplify/datastore";
import { TaskResult } from "../../models";
import { TaskResultService } from "../TaskResultService";
import { CreateTaskResultInput } from "../../types/TaskResult";

jest.mock("@aws-amplify/datastore");

const createMockTaskResult = (overrides: Partial<any> = {}): any => ({
  id: "test-result-id",
  pk: "test-pk",
  sk: "test-sk",
  taskInstanceId: "test-task-id",
  status: "OPEN",
  startedAt: new Date().toISOString(),
  ...overrides,
});

describe("TaskResultService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTaskResult", () => {
    it("should create a task result successfully", async () => {
      const mockResult = createMockTaskResult();
      const input: CreateTaskResultInput = {
        pk: "test-pk",
        sk: "test-sk",
        taskInstanceId: "test-task-id",
        status: "OPEN",
      };

      (DataStore.save as jest.Mock).mockResolvedValue(mockResult);

      const result = await TaskResultService.createTaskResult(input);

      expect(DataStore.save).toHaveBeenCalledWith(expect.any(TaskResult));
      expect(result).toEqual(mockResult);
    });

    it("should throw error on create failure", async () => {
      const input: CreateTaskResultInput = {
        pk: "test-pk",
        sk: "test-sk",
        taskInstanceId: "test-task-id",
        status: "OPEN",
      };

      const error = new Error("Create failed");
      (DataStore.save as jest.Mock).mockRejectedValue(error);

      await expect(TaskResultService.createTaskResult(input)).rejects.toThrow(
        "Create failed"
      );
    });
  });

  describe("getTaskResults", () => {
    it("should return all task results", async () => {
      const mockResults = [
        createMockTaskResult({ id: "1" }),
        createMockTaskResult({ id: "2" }),
      ];
      (DataStore.query as jest.Mock).mockResolvedValue(mockResults);

      const result = await TaskResultService.getTaskResults();

      expect(DataStore.query).toHaveBeenCalledWith(TaskResult);
      expect(result).toEqual(mockResults);
    });
  });

  describe("getTaskResult", () => {
    it("should return a task result by id", async () => {
      const mockResult = createMockTaskResult({ id: "test-id" });
      (DataStore.query as jest.Mock).mockResolvedValue(mockResult);

      const result = await TaskResultService.getTaskResult("test-id");

      expect(DataStore.query).toHaveBeenCalledWith(TaskResult, "test-id");
      expect(result).toEqual(mockResult);
    });

    it("should return null if task result not found", async () => {
      (DataStore.query as jest.Mock).mockResolvedValue(null);

      const result = await TaskResultService.getTaskResult("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("updateTaskResult", () => {
    it("should update a task result successfully", async () => {
      const originalResult = createMockTaskResult({
        id: "test-id",
        status: "OPEN",
      });
      const updatedResult = createMockTaskResult({
        id: "test-id",
        status: "COMPLETED",
      });

      (DataStore.query as jest.Mock).mockResolvedValue(originalResult);
      (DataStore.save as jest.Mock).mockResolvedValue(updatedResult);

      const result = await TaskResultService.updateTaskResult("test-id", {
        status: "COMPLETED",
      });

      expect(DataStore.query).toHaveBeenCalledWith(TaskResult, "test-id");
      expect(DataStore.save).toHaveBeenCalled();
      expect(result.status).toBe("COMPLETED");
    });

    it("should throw error if task result not found", async () => {
      (DataStore.query as jest.Mock).mockResolvedValue(null);

      await expect(
        TaskResultService.updateTaskResult("non-existent", {
          status: "COMPLETED",
        })
      ).rejects.toThrow("TaskResult with id non-existent not found");
    });
  });

  describe("deleteTaskResult", () => {
    it("should delete a task result successfully", async () => {
      const mockResult = createMockTaskResult({ id: "test-id" });
      (DataStore.query as jest.Mock).mockResolvedValue(mockResult);
      (DataStore.delete as jest.Mock).mockResolvedValue(mockResult);

      await TaskResultService.deleteTaskResult("test-id");

      expect(DataStore.query).toHaveBeenCalledWith(TaskResult, "test-id");
      expect(DataStore.delete).toHaveBeenCalledWith(mockResult);
    });

    it("should throw error if task result not found", async () => {
      (DataStore.query as jest.Mock).mockResolvedValue(null);

      await expect(
        TaskResultService.deleteTaskResult("non-existent")
      ).rejects.toThrow("TaskResult with id non-existent not found");
    });
  });

  describe("subscribeTaskResults", () => {
    it("should subscribe to task result changes", () => {
      const mockResults = [createMockTaskResult({ id: "1" })];
      const mockSubscription = {
        subscribe: jest.fn(callback => {
          callback({ items: mockResults, isSynced: true });
          return { unsubscribe: jest.fn() };
        }),
      };

      (DataStore.observeQuery as jest.Mock).mockReturnValue(mockSubscription);
      (DataStore.observe as jest.Mock).mockReturnValue({
        subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
      });

      const callback = jest.fn();
      const result = TaskResultService.subscribeTaskResults(callback);

      expect(DataStore.observeQuery).toHaveBeenCalledWith(TaskResult);
      expect(callback).toHaveBeenCalledWith(mockResults, true);
      expect(result).toHaveProperty("unsubscribe");
    });

    it("filters out _deleted tombstones from subscription items", () => {
      const mockResults = [
        createMockTaskResult({ id: "1" }),
        createMockTaskResult({ id: "2", _deleted: true }),
      ];
      const mockSubscription = {
        subscribe: jest.fn(callback => {
          callback({ items: mockResults, isSynced: true });
          return { unsubscribe: jest.fn() };
        }),
      };

      (DataStore.observeQuery as jest.Mock).mockReturnValue(mockSubscription);
      (DataStore.observe as jest.Mock).mockReturnValue({
        subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
      });

      const callback = jest.fn();
      TaskResultService.subscribeTaskResults(callback);

      expect(callback).toHaveBeenCalledWith([mockResults[0]], true);
    });
  });
});
