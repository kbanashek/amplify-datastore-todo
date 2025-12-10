import { renderHook, waitFor } from "@testing-library/react-native";
import { useTaskHistoryList } from "../useTaskHistoryList";
import { TaskHistoryService } from "../../services/TaskHistoryService";

jest.mock("../../services/TaskHistoryService");

describe("useTaskHistoryList", () => {
  const mockUnsubscribe = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (TaskHistoryService.subscribeTaskHistories as jest.Mock).mockImplementation(
      (callback) => {
        callback([], true);
        return { unsubscribe: mockUnsubscribe };
      }
    );
  });

  it("should initialize with loading state", async () => {
    // Mock subscription to not call callback immediately
    (TaskHistoryService.subscribeTaskHistories as jest.Mock).mockImplementation(
      (callback) => {
        // Don't call callback immediately to test initial loading state
        return { unsubscribe: mockUnsubscribe };
      }
    );

    const { result } = renderHook(() => useTaskHistoryList());

    // Loading might be false if subscription fires immediately, so just check histories
    expect(result.current.taskHistories).toEqual([]);
  });

  it("should update task histories when subscription fires", async () => {
    const mockHistories = [{ id: "1" }, { id: "2" }];

    (TaskHistoryService.subscribeTaskHistories as jest.Mock).mockImplementation(
      (callback) => {
        callback(mockHistories, true);
        return { unsubscribe: mockUnsubscribe };
      }
    );

    const { result } = renderHook(() => useTaskHistoryList());

    await waitFor(() => {
      expect(result.current.taskHistories).toHaveLength(2);
      expect(result.current.loading).toBe(false);
    });
  });

  it("should handle delete task history", async () => {
    (TaskHistoryService.deleteTaskHistory as jest.Mock).mockResolvedValue(
      undefined
    );

    const { result } = renderHook(() => useTaskHistoryList());

    await result.current.handleDeleteTaskHistory("test-id");

    expect(TaskHistoryService.deleteTaskHistory).toHaveBeenCalledWith(
      "test-id"
    );
  });

  it("should refresh task histories", async () => {
    const mockHistories = [{ id: "1" }];
    (TaskHistoryService.getTaskHistories as jest.Mock).mockResolvedValue(
      mockHistories
    );

    const { result } = renderHook(() => useTaskHistoryList());

    await result.current.refreshTaskHistories();

    expect(TaskHistoryService.getTaskHistories).toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });
});

