import { renderHook, act } from "@testing-library/react-native";
import { useTaskUpdate } from "@hooks/useTaskUpdate";

// Mock TaskService
jest.mock("@services/TaskService", () => ({
  TaskService: {
    updateTask: jest.fn(),
  },
}));

import { TaskService } from "@services/TaskService";
import { Task, TaskStatus, TaskType } from "@task-types/Task";

describe("useTaskUpdate", () => {
  const mockUpdateTask = TaskService.updateTask as jest.MockedFunction<
    typeof TaskService.updateTask
  >;

  const mockTask: Task = {
    id: "1",
    pk: "TASK-1",
    sk: "SK-1",
    title: "Test Task",
    description: "Test Description",
    status: TaskStatus.OPEN,
    taskType: TaskType.SCHEDULED,
    startTimeInMillSec: Date.now(),
    expireTimeInMillSec: Date.now() + 86400000,
  };

  const updatedTask: Task = {
    ...mockTask,
    status: TaskStatus.STARTED,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("starts with isUpdating false and no error", () => {
      const { result } = renderHook(() => useTaskUpdate());
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe("updateTask", () => {
    it("updates a task successfully", async () => {
      mockUpdateTask.mockResolvedValue(updatedTask);
      const { result } = renderHook(() => useTaskUpdate());

      await act(async () => {
        const task = await result.current.updateTask("1", {
          status: TaskStatus.STARTED,
        });
        expect(task).toEqual(updatedTask);
      });

      expect(mockUpdateTask).toHaveBeenCalledWith("1", {
        status: TaskStatus.STARTED,
      });
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("handles update errors", async () => {
      mockUpdateTask.mockRejectedValue(new Error("Update failed"));
      const { result } = renderHook(() => useTaskUpdate());

      await act(async () => {
        const task = await result.current.updateTask("1", {
          status: TaskStatus.STARTED,
        });
        expect(task).toBeNull();
      });

      expect(result.current.error).toBe("Update failed");
      expect(result.current.isUpdating).toBe(false);
    });

    it("sets isUpdating during update", async () => {
      mockUpdateTask.mockImplementation(
        () =>
          new Promise(resolve => setTimeout(() => resolve(updatedTask), 100))
      );
      const { result } = renderHook(() => useTaskUpdate());

      let updatePromise: Promise<Task | null>;
      act(() => {
        updatePromise = result.current.updateTask("1", {
          status: TaskStatus.STARTED,
        });
      });

      // Check immediately after calling (before awaiting)
      expect(result.current.isUpdating).toBe(true);
      await act(async () => {
        await updatePromise!;
      });
      expect(result.current.isUpdating).toBe(false);
    });

    it("clears error on new update attempt", async () => {
      mockUpdateTask.mockRejectedValueOnce(new Error("First error"));
      mockUpdateTask.mockResolvedValueOnce(updatedTask);
      const { result, unmount } = renderHook(() => useTaskUpdate());

      await act(async () => {
        await result.current.updateTask("1", { status: TaskStatus.STARTED });
      });
      expect(result.current.error).toBe("First error");

      // Ensure previous render is fully cleaned up
      unmount();

      const { result: result2 } = renderHook(() => useTaskUpdate());
      await act(async () => {
        await result2.current.updateTask("1", { status: TaskStatus.STARTED });
      });
      expect(result2.current.error).toBeNull();
    });
  });
});
