import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useTaskList } from "@hooks/useTaskList";

// Mock TaskService
jest.mock("@services/TaskService", () => ({
  TaskService: {
    subscribeTasks: jest.fn(),
    getTasks: jest.fn(),
    deleteTask: jest.fn(),
    clearDataStore: jest.fn(),
  },
}));

// Mock AmplifyContext
jest.mock("@contexts/AmplifyContext", () => ({
  useAmplify: jest.fn(),
}));

import { TaskService } from "@services/TaskService";
import { useAmplify } from "@contexts/AmplifyContext";
import { NetworkStatus } from "@hooks/useAmplifyState";
import { TaskStatus, TaskType } from "@task-types/Task";

describe("useTaskList - Operations", () => {
  const mockSubscribeTasks = TaskService.subscribeTasks as jest.MockedFunction<
    typeof TaskService.subscribeTasks
  >;
  const mockGetTasks = TaskService.getTasks as jest.MockedFunction<
    typeof TaskService.getTasks
  >;
  const mockDeleteTask = TaskService.deleteTask as jest.MockedFunction<
    typeof TaskService.deleteTask
  >;
  const mockClearDataStore = TaskService.clearDataStore as jest.MockedFunction<
    typeof TaskService.clearDataStore
  >;
  const mockUseAmplify = useAmplify as jest.MockedFunction<typeof useAmplify>;

  const mockTasks = [
    {
      id: "1",
      pk: "TASK-1",
      sk: "SK-1",
      title: "Task 1",
      description: "Description 1",
      status: TaskStatus.OPEN,
      taskType: TaskType.SCHEDULED,
      startTimeInMillSec: Date.now(),
      expireTimeInMillSec: Date.now() + 86400000,
    },
    {
      id: "2",
      pk: "TASK-2",
      sk: "SK-2",
      title: "Task 2",
      description: "Description 2",
      status: TaskStatus.STARTED,
      taskType: TaskType.TIMED,
      startTimeInMillSec: Date.now(),
      expireTimeInMillSec: Date.now() + 86400000,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAmplify.mockReturnValue({
      networkStatus: NetworkStatus.Online,
      syncState: "SYNCED" as any,
      isReady: true,
      conflictCount: 0,
    } as any);
  });

  describe("delete task", () => {
    it("deletes a task successfully", async () => {
      mockSubscribeTasks.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockDeleteTask.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTaskList());

      await act(async () => {
        await result.current.handleDeleteTask("1");
      });

      expect(mockDeleteTask).toHaveBeenCalledWith("1");
    });

    it("handles delete errors", async () => {
      mockSubscribeTasks.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockDeleteTask.mockRejectedValue(new Error("Delete failed"));
      const { result } = renderHook(() => useTaskList());

      await act(async () => {
        await result.current.handleDeleteTask("1");
      });

      expect(result.current.error).toBe(
        "Failed to delete task. Please try again."
      );
    });
  });

  describe("refresh tasks", () => {
    it("refreshes tasks manually", async () => {
      mockSubscribeTasks.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockGetTasks.mockResolvedValue(mockTasks);
      const { result } = renderHook(() => useTaskList());

      await act(async () => {
        await result.current.refreshTasks();
      });

      expect(mockGetTasks).toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current.tasks).toEqual(mockTasks);
      });
    });

    it("handles refresh errors", async () => {
      mockSubscribeTasks.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockGetTasks.mockRejectedValue(new Error("Refresh failed"));
      const { result } = renderHook(() => useTaskList());

      await act(async () => {
        await result.current.refreshTasks();
      });

      expect(result.current.error).toBe(
        "Failed to refresh tasks. Please try again."
      );
    });
  });

  describe("clearDataStore", () => {
    it("clears DataStore and reinitializes", async () => {
      let subscriptionCallback:
        | ((items: any[], synced: boolean) => void)
        | null = null;
      mockSubscribeTasks.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe: jest.fn() };
      });
      mockClearDataStore.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTaskList());

      await act(async () => {
        await result.current.clearDataStore();
      });

      expect(mockClearDataStore).toHaveBeenCalled();
      expect(mockSubscribeTasks).toHaveBeenCalledTimes(2); // Initial + after clear
    });
  });
});
