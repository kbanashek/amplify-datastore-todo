import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useTaskHistoryList } from "../useTaskHistoryList";
import { createSubscriptionHolder } from "./testUtils";

// Mock TaskHistoryService
jest.mock("../../services/TaskHistoryService", () => ({
  TaskHistoryService: {
    subscribeTaskHistories: jest.fn(),
    getTaskHistories: jest.fn(),
    deleteTaskHistory: jest.fn(),
  },
}));

import { TaskHistoryService } from "../../services/TaskHistoryService";
import { TaskHistory as TaskHistoryModel } from "../../models";
import { TaskHistory } from "../../types/TaskHistory";

describe("useTaskHistoryList", () => {
  const mockSubscribeTaskHistories =
    TaskHistoryService.subscribeTaskHistories as jest.MockedFunction<
      typeof TaskHistoryService.subscribeTaskHistories
    >;
  const mockGetTaskHistories =
    TaskHistoryService.getTaskHistories as jest.MockedFunction<
      typeof TaskHistoryService.getTaskHistories
    >;
  const mockDeleteTaskHistory =
    TaskHistoryService.deleteTaskHistory as jest.MockedFunction<
      typeof TaskHistoryService.deleteTaskHistory
    >;

  const mockTaskHistories = [
    {
      id: "1",
      pk: "HISTORY-1",
      sk: "SK-1",
      taskInstanceId: "TASK-1",
      status: "COMPLETED",
      details: "Task completed",
    },
    {
      id: "2",
      pk: "HISTORY-2",
      sk: "SK-2",
      taskInstanceId: "TASK-2",
      status: "STARTED",
      details: "Task started",
    },
  ] as TaskHistoryModel[];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("starts with loading state", () => {
      mockSubscribeTaskHistories.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      const { result } = renderHook(() => useTaskHistoryList());
      expect(result.current.loading).toBe(true);
      expect(result.current.taskHistories).toEqual([]);
    });

    it("subscribes to task histories on mount", () => {
      const unsubscribe = jest.fn();
      mockSubscribeTaskHistories.mockReturnValue({
        unsubscribe,
      });
      renderHook(() => useTaskHistoryList());
      expect(mockSubscribeTaskHistories).toHaveBeenCalled();
    });

    it("updates task histories when subscription callback fires", async () => {
      const { holder, setCallback } =
        createSubscriptionHolder<TaskHistoryModel>();
      mockSubscribeTaskHistories.mockImplementation(callback => {
        setCallback(callback);
        return { unsubscribe: jest.fn() };
      });
      const { result } = renderHook(() => useTaskHistoryList());
      expect(result.current.loading).toBe(true);

      holder.callback?.(mockTaskHistories, true);

      await waitFor(() => {
        expect(result.current.taskHistories).toEqual(mockTaskHistories);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("delete task history", () => {
    it("deletes a task history successfully", async () => {
      mockSubscribeTaskHistories.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockDeleteTaskHistory.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTaskHistoryList());

      await act(async () => {
        await result.current.handleDeleteTaskHistory("1");
      });

      expect(mockDeleteTaskHistory).toHaveBeenCalledWith("1");
    });

    it("handles delete errors", async () => {
      mockSubscribeTaskHistories.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockDeleteTaskHistory.mockRejectedValue(new Error("Delete failed"));
      const { result } = renderHook(() => useTaskHistoryList());

      await act(async () => {
        await result.current.handleDeleteTaskHistory("1");
      });

      expect(result.current.error).toBe("Failed to delete task history.");
    });
  });

  describe("refresh task histories", () => {
    it("refreshes task histories manually", async () => {
      mockSubscribeTaskHistories.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockGetTaskHistories.mockResolvedValue(
        mockTaskHistories as TaskHistoryModel[]
      );
      const { result } = renderHook(() => useTaskHistoryList());

      await act(async () => {
        await result.current.refreshTaskHistories();
      });

      expect(mockGetTaskHistories).toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current.taskHistories).toEqual(mockTaskHistories);
        expect(result.current.loading).toBe(false);
      });
    });

    it("handles refresh errors", async () => {
      mockSubscribeTaskHistories.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockGetTaskHistories.mockRejectedValue(new Error("Refresh failed"));
      const { result } = renderHook(() => useTaskHistoryList());

      await act(async () => {
        await result.current.refreshTaskHistories();
      });

      expect(result.current.error).toBe("Failed to refresh task histories.");
      expect(result.current.loading).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("unsubscribes on unmount", () => {
      const unsubscribe = jest.fn();
      mockSubscribeTaskHistories.mockReturnValue({
        unsubscribe,
      });
      const { unmount } = renderHook(() => useTaskHistoryList());
      unmount();
      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});
