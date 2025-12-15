import { DataStore } from "@aws-amplify/datastore";
import { TaskHistory } from "../../models";
import { TaskHistoryService } from "../TaskHistoryService";
import { CreateTaskHistoryInput } from "../../types/TaskHistory";

jest.mock("@aws-amplify/datastore");

const createMockTaskHistory = (overrides: Partial<any> = {}): any => ({
  id: "test-history-id",
  pk: "test-pk",
  sk: "test-sk",
  taskInstanceId: "test-task-id",
  status: "OPEN",
  timestamp: new Date().toISOString(),
  action: "CREATED",
  ...overrides,
});

describe("TaskHistoryService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createTaskHistory", () => {
    it("should create a task history successfully", async () => {
      const mockHistory = createMockTaskHistory();
      const input: CreateTaskHistoryInput = {
        pk: "test-pk",
        sk: "test-sk",
        taskInstanceId: "test-task-id",
        status: "OPEN",
        action: "CREATED",
      };

      (DataStore.save as jest.Mock).mockResolvedValue(mockHistory);

      const result = await TaskHistoryService.createTaskHistory(input);

      expect(DataStore.save).toHaveBeenCalledWith(expect.any(TaskHistory));
      expect(result).toEqual(mockHistory);
    });

    it("should throw error on create failure", async () => {
      const input: CreateTaskHistoryInput = {
        pk: "test-pk",
        sk: "test-sk",
        taskInstanceId: "test-task-id",
        status: "OPEN",
        action: "CREATED",
      };

      const error = new Error("Create failed");
      (DataStore.save as jest.Mock).mockRejectedValue(error);

      await expect(TaskHistoryService.createTaskHistory(input)).rejects.toThrow(
        "Create failed"
      );
    });
  });

  describe("getTaskHistories", () => {
    it("should return all task histories", async () => {
      const mockHistories = [
        createMockTaskHistory({ id: "1" }),
        createMockTaskHistory({ id: "2" }),
      ];
      (DataStore.query as jest.Mock).mockResolvedValue(mockHistories);

      const result = await TaskHistoryService.getTaskHistories();

      expect(DataStore.query).toHaveBeenCalledWith(TaskHistory);
      expect(result).toEqual(mockHistories);
    });
  });

  describe("getTaskHistory", () => {
    it("should return a task history by id", async () => {
      const mockHistory = createMockTaskHistory({ id: "test-id" });
      (DataStore.query as jest.Mock).mockResolvedValue(mockHistory);

      const result = await TaskHistoryService.getTaskHistory("test-id");

      expect(DataStore.query).toHaveBeenCalledWith(TaskHistory, "test-id");
      expect(result).toEqual(mockHistory);
    });

    it("should return null if task history not found", async () => {
      (DataStore.query as jest.Mock).mockResolvedValue(null);

      const result = await TaskHistoryService.getTaskHistory("non-existent");

      expect(result).toBeNull();
    });
  });

  describe("updateTaskHistory", () => {
    it("should update a task history successfully", async () => {
      const originalHistory = createMockTaskHistory({
        id: "test-id",
        status: "OPEN",
      });
      const updatedHistory = createMockTaskHistory({
        id: "test-id",
        status: "COMPLETED",
      });

      (DataStore.query as jest.Mock).mockResolvedValue(originalHistory);
      (DataStore.save as jest.Mock).mockResolvedValue(updatedHistory);

      const result = await TaskHistoryService.updateTaskHistory("test-id", {
        status: "COMPLETED",
      });

      expect(DataStore.query).toHaveBeenCalledWith(TaskHistory, "test-id");
      expect(DataStore.save).toHaveBeenCalled();
      expect(result.status).toBe("COMPLETED");
    });

    it("should throw error if task history not found", async () => {
      (DataStore.query as jest.Mock).mockResolvedValue(null);

      await expect(
        TaskHistoryService.updateTaskHistory("non-existent", {
          status: "COMPLETED",
        })
      ).rejects.toThrow("TaskHistory with id non-existent not found");
    });
  });

  describe("deleteTaskHistory", () => {
    it("should delete a task history successfully", async () => {
      const mockHistory = createMockTaskHistory({ id: "test-id" });
      (DataStore.query as jest.Mock).mockResolvedValue(mockHistory);
      (DataStore.delete as jest.Mock).mockResolvedValue(mockHistory);

      await TaskHistoryService.deleteTaskHistory("test-id");

      expect(DataStore.query).toHaveBeenCalledWith(TaskHistory, "test-id");
      expect(DataStore.delete).toHaveBeenCalledWith(mockHistory);
    });

    it("should throw error if task history not found", async () => {
      (DataStore.query as jest.Mock).mockResolvedValue(null);

      await expect(
        TaskHistoryService.deleteTaskHistory("non-existent")
      ).rejects.toThrow("TaskHistory with id non-existent not found");
    });
  });

  describe("subscribeTaskHistories", () => {
    it("should subscribe to task history changes", () => {
      const mockHistories = [createMockTaskHistory({ id: "1" })];
      const mockSubscription = {
        subscribe: jest.fn(callback => {
          callback({ items: mockHistories, isSynced: true });
          return { unsubscribe: jest.fn() };
        }),
      };

      (DataStore.observeQuery as jest.Mock).mockReturnValue(mockSubscription);
      (DataStore.observe as jest.Mock).mockReturnValue({
        subscribe: jest.fn(() => ({ unsubscribe: jest.fn() })),
      });

      const callback = jest.fn();
      const result = TaskHistoryService.subscribeTaskHistories(callback);

      expect(DataStore.observeQuery).toHaveBeenCalledWith(TaskHistory);
      expect(callback).toHaveBeenCalledWith(mockHistories, true);
      expect(result).toHaveProperty("unsubscribe");
    });
  });
});
