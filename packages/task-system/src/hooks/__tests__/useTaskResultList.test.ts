import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useTaskResultList } from "@hooks/useTaskResultList";

// Mock TaskResultService
jest.mock("@services/TaskResultService", () => ({
  TaskResultService: {
    subscribeTaskResults: jest.fn(),
    getTaskResults: jest.fn(),
    deleteTaskResult: jest.fn(),
  },
}));

import { TaskResultService } from "@services/TaskResultService";
import { TaskResult as TaskResultModel } from "@models/index";
import { TaskResult } from "@task-types/TaskResult";

describe("useTaskResultList", () => {
  const mockSubscribeTaskResults =
    TaskResultService.subscribeTaskResults as jest.MockedFunction<
      typeof TaskResultService.subscribeTaskResults
    >;
  const mockGetTaskResults =
    TaskResultService.getTaskResults as jest.MockedFunction<
      typeof TaskResultService.getTaskResults
    >;
  const mockDeleteTaskResult =
    TaskResultService.deleteTaskResult as jest.MockedFunction<
      typeof TaskResultService.deleteTaskResult
    >;

  const mockTaskResults = [
    {
      id: "1",
      pk: "RESULT-1",
      sk: "SK-1",
      taskInstanceId: "TASK-1",
      status: "COMPLETED",
    },
    {
      id: "2",
      pk: "RESULT-2",
      sk: "SK-2",
      taskInstanceId: "TASK-2",
      status: "STARTED",
    },
  ] as TaskResultModel[];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("starts with loading state", () => {
      mockSubscribeTaskResults.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      const { result } = renderHook(() => useTaskResultList());
      expect(result.current.loading).toBe(true);
      expect(result.current.taskResults).toEqual([]);
    });

    it("subscribes to task results on mount", () => {
      const unsubscribe = jest.fn();
      mockSubscribeTaskResults.mockReturnValue({
        unsubscribe,
      });
      renderHook(() => useTaskResultList());
      expect(mockSubscribeTaskResults).toHaveBeenCalled();
    });

    it("updates task results when subscription callback fires", async () => {
      let subscriptionCallback: any = null;
      mockSubscribeTaskResults.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe: jest.fn() };
      });
      const { result } = renderHook(() => useTaskResultList());
      expect(result.current.loading).toBe(true);

      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: TaskResultModel[],
            synced: boolean
          ) => void
        )(mockTaskResults, true);
      }

      await waitFor(() => {
        expect(result.current.taskResults).toEqual(mockTaskResults);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("delete task result", () => {
    it("deletes a task result successfully", async () => {
      mockSubscribeTaskResults.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockDeleteTaskResult.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTaskResultList());

      await act(async () => {
        await result.current.handleDeleteTaskResult("1");
      });

      expect(mockDeleteTaskResult).toHaveBeenCalledWith("1");
    });

    it("handles delete errors", async () => {
      mockSubscribeTaskResults.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockDeleteTaskResult.mockRejectedValue(new Error("Delete failed"));
      const { result } = renderHook(() => useTaskResultList());

      await act(async () => {
        await result.current.handleDeleteTaskResult("1");
      });

      expect(result.current.error).toBe("Failed to delete task result.");
    });
  });

  describe("refresh task results", () => {
    it("refreshes task results manually", async () => {
      mockSubscribeTaskResults.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockGetTaskResults.mockResolvedValue(
        mockTaskResults as TaskResultModel[]
      );
      const { result } = renderHook(() => useTaskResultList());

      await act(async () => {
        await result.current.refreshTaskResults();
      });

      expect(mockGetTaskResults).toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current.taskResults).toEqual(mockTaskResults);
        expect(result.current.loading).toBe(false);
      });
    });

    it("handles refresh errors", async () => {
      mockSubscribeTaskResults.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockGetTaskResults.mockRejectedValue(new Error("Refresh failed"));
      const { result } = renderHook(() => useTaskResultList());

      await act(async () => {
        await result.current.refreshTaskResults();
      });

      expect(result.current.error).toBe("Failed to refresh task results.");
      expect(result.current.loading).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("unsubscribes on unmount", () => {
      const unsubscribe = jest.fn();
      mockSubscribeTaskResults.mockReturnValue({
        unsubscribe,
      });
      const { unmount } = renderHook(() => useTaskResultList());
      unmount();
      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});
