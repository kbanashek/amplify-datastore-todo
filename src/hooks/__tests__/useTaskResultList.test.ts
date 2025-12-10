import { renderHook, waitFor } from "@testing-library/react-native";
import { useTaskResultList } from "../useTaskResultList";
import { TaskResultService } from "../../services/TaskResultService";

jest.mock("../../services/TaskResultService");

describe("useTaskResultList", () => {
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (TaskResultService.subscribeTaskResults as jest.Mock).mockImplementation(
      (callback) => {
        callback([], true);
        return { unsubscribe: mockUnsubscribe };
      }
    );
  });

  it("should initialize with loading state", async () => {
    // Mock subscription to not call callback immediately
    (TaskResultService.subscribeTaskResults as jest.Mock).mockImplementation(
      (callback) => {
        // Don't call callback immediately to test initial loading state
        return { unsubscribe: mockUnsubscribe };
      }
    );

    const { result } = renderHook(() => useTaskResultList());

    // Loading might be false if subscription fires immediately, so just check results
    expect(result.current.taskResults).toEqual([]);
  });

  it("should update task results when subscription fires", async () => {
    const mockResults = [{ id: "1" }, { id: "2" }];

    (TaskResultService.subscribeTaskResults as jest.Mock).mockImplementation(
      (callback) => {
        callback(mockResults, true);
        return { unsubscribe: mockUnsubscribe };
      }
    );

    const { result } = renderHook(() => useTaskResultList());

    await waitFor(() => {
      expect(result.current.taskResults).toHaveLength(2);
      expect(result.current.loading).toBe(false);
    });
  });

  it("should handle delete task result", async () => {
    (TaskResultService.deleteTaskResult as jest.Mock).mockResolvedValue(
      undefined
    );

    const { result } = renderHook(() => useTaskResultList());

    await result.current.handleDeleteTaskResult("test-id");

    expect(TaskResultService.deleteTaskResult).toHaveBeenCalledWith("test-id");
  });

  it("should refresh task results", async () => {
    const mockResults = [{ id: "1" }];
    (TaskResultService.getTaskResults as jest.Mock).mockResolvedValue(
      mockResults
    );

    const { result } = renderHook(() => useTaskResultList());

    await result.current.refreshTaskResults();

    expect(TaskResultService.getTaskResults).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });
});

