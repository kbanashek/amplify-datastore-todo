import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useTaskList } from "../useTaskList";
import { TaskStatus, TaskType } from "../../types/Task";

// Mock TaskService
jest.mock("../../services/TaskService", () => ({
  TaskService: {
    subscribeTasks: jest.fn(),
    getTasks: jest.fn(),
    deleteTask: jest.fn(),
    clearDataStore: jest.fn(),
  },
}));

// Mock AmplifyContext
jest.mock("../../contexts/AmplifyContext", () => ({
  useAmplify: jest.fn(),
}));

import { TaskService } from "../../services/TaskService";
import { useAmplify } from "../../contexts/AmplifyContext";
import { NetworkStatus } from "../useAmplifyState";

describe("useTaskList - Initialization", () => {
  const mockSubscribeTasks = TaskService.subscribeTasks as jest.MockedFunction<
    typeof TaskService.subscribeTasks
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

  it("starts with loading state", () => {
    mockSubscribeTasks.mockReturnValue({
      unsubscribe: jest.fn(),
    });
    const { result } = renderHook(() => useTaskList());
    expect(result.current.loading).toBe(true);
    expect(result.current.tasks).toEqual([]);
  });

  it("subscribes to tasks on mount", () => {
    const unsubscribe = jest.fn();
    mockSubscribeTasks.mockReturnValue({
      unsubscribe,
    });
    renderHook(() => useTaskList());
    expect(mockSubscribeTasks).toHaveBeenCalled();
  });

  it("updates tasks when subscription callback fires", async () => {
    let subscriptionCallback: ((items: any[], synced: boolean) => void) | null =
      null;
    mockSubscribeTasks.mockImplementation(callback => {
      subscriptionCallback = callback;
      return { unsubscribe: jest.fn() };
    });
    const { result } = renderHook(() => useTaskList());
    expect(result.current.loading).toBe(true);

    await act(async () => {
      if (subscriptionCallback) {
        subscriptionCallback(mockTasks, true);
      }
    });

    await waitFor(() => {
      expect(result.current.tasks).toEqual(mockTasks);
      expect(result.current.loading).toBe(false);
      expect(result.current.isSynced).toBe(true);
    });
  });
});
