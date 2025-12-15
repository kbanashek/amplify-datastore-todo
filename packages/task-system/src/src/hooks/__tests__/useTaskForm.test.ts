import { renderHook, act } from "@testing-library/react-native";
import { useTaskForm } from "../useTaskForm";
import { TaskStatus, TaskType } from "../../types/Task";

// Mock TaskService
jest.mock("@orion/task-system", () => ({
  TaskService: {
    createTask: jest.fn(),
  },
}));

import { TaskService } from "@orion/task-system";
import { Task } from "../../types/Task";

describe("useTaskForm", () => {
  const mockCreateTask = TaskService.createTask as jest.MockedFunction<
    typeof TaskService.createTask
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("initializes with default values", () => {
      const { result } = renderHook(() => useTaskForm());
      expect(result.current.title).toBe("");
      expect(result.current.description).toBe("");
      expect(result.current.taskType).toBe(TaskType.SCHEDULED);
      expect(result.current.status).toBe(TaskStatus.OPEN);
      expect(result.current.pk).toContain("TASK-");
      expect(result.current.sk).toContain("SK-");
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("initializes with provided task", () => {
      const { result } = renderHook(() =>
        useTaskForm({ initialTask: mockTask })
      );
      expect(result.current.title).toBe(mockTask.title);
      expect(result.current.description).toBe(mockTask.description);
      expect(result.current.taskType).toBe(mockTask.taskType);
      expect(result.current.status).toBe(mockTask.status);
      expect(result.current.pk).toBe(mockTask.pk);
      expect(result.current.sk).toBe(mockTask.sk);
    });
  });

  describe("form state updates", () => {
    it("updates title", () => {
      const { result } = renderHook(() => useTaskForm());
      act(() => {
        result.current.setTitle("New Title");
      });
      expect(result.current.title).toBe("New Title");
    });

    it("updates description", () => {
      const { result } = renderHook(() => useTaskForm());
      act(() => {
        result.current.setDescription("New Description");
      });
      expect(result.current.description).toBe("New Description");
    });

    it("updates task type", () => {
      const { result } = renderHook(() => useTaskForm());
      act(() => {
        result.current.setTaskType(TaskType.TIMED);
      });
      expect(result.current.taskType).toBe(TaskType.TIMED);
    });

    it("updates status", () => {
      const { result } = renderHook(() => useTaskForm());
      act(() => {
        result.current.setStatus(TaskStatus.STARTED);
      });
      expect(result.current.status).toBe(TaskStatus.STARTED);
    });

    it("updates pk", () => {
      const { result } = renderHook(() => useTaskForm());
      act(() => {
        result.current.setPk("NEW-PK");
      });
      expect(result.current.pk).toBe("NEW-PK");
    });

    it("updates sk", () => {
      const { result } = renderHook(() => useTaskForm());
      act(() => {
        result.current.setSk("NEW-SK");
      });
      expect(result.current.sk).toBe("NEW-SK");
    });

    it("updates due date", () => {
      const { result } = renderHook(() => useTaskForm());
      act(() => {
        result.current.setDueDate("2024-01-15");
      });
      expect(result.current.dueDate).toBe("2024-01-15");
    });

    it("updates due time", () => {
      const { result } = renderHook(() => useTaskForm());
      act(() => {
        result.current.setDueTime("14:30");
      });
      expect(result.current.dueTime).toBe("14:30");
    });
  });

  describe("form submission", () => {
    it("creates task successfully", async () => {
      mockCreateTask.mockResolvedValue(mockTask);
      const onTaskCreated = jest.fn();
      const { result } = renderHook(() => useTaskForm({ onTaskCreated }));

      act(() => {
        result.current.setTitle("Test Task");
        result.current.setPk("TASK-1");
        result.current.setSk("SK-1");
      });

      await act(async () => {
        const task = await result.current.handleSubmit();
        expect(task).toEqual(mockTask);
      });

      expect(mockCreateTask).toHaveBeenCalled();
      expect(onTaskCreated).toHaveBeenCalledWith(mockTask);
      expect(result.current.isSubmitting).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("validates title is required", async () => {
      const { result } = renderHook(() => useTaskForm());
      act(() => {
        result.current.setTitle("");
        result.current.setPk("TASK-1");
        result.current.setSk("SK-1");
      });

      await act(async () => {
        const task = await result.current.handleSubmit();
        expect(task).toBeNull();
      });

      expect(result.current.error).toBe("Title is required");
      expect(mockCreateTask).not.toHaveBeenCalled();
    });

    it("validates pk is required", async () => {
      const { result } = renderHook(() => useTaskForm());
      act(() => {
        result.current.setTitle("Test Task");
        result.current.setPk("");
        result.current.setSk("SK-1");
      });

      await act(async () => {
        const task = await result.current.handleSubmit();
        expect(task).toBeNull();
      });

      expect(result.current.error).toBe("PK is required");
      expect(mockCreateTask).not.toHaveBeenCalled();
    });

    it("validates sk is required", async () => {
      const { result } = renderHook(() => useTaskForm());
      act(() => {
        result.current.setTitle("Test Task");
        result.current.setPk("TASK-1");
        result.current.setSk("");
      });

      await act(async () => {
        const task = await result.current.handleSubmit();
        expect(task).toBeNull();
      });

      expect(result.current.error).toBe("SK is required");
      expect(mockCreateTask).not.toHaveBeenCalled();
    });

    it("trims title, pk, and sk before submission", async () => {
      mockCreateTask.mockResolvedValue(mockTask);
      const { result } = renderHook(() => useTaskForm());
      act(() => {
        result.current.setTitle("  Test Task  ");
        result.current.setPk("  TASK-1  ");
        result.current.setSk("  SK-1  ");
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test Task",
          pk: "TASK-1",
          sk: "SK-1",
        })
      );
    });

    it("handles create task errors", async () => {
      mockCreateTask.mockRejectedValue(new Error("Create failed"));
      const { result } = renderHook(() => useTaskForm());
      act(() => {
        result.current.setTitle("Test Task");
        result.current.setPk("TASK-1");
        result.current.setSk("SK-1");
      });

      await act(async () => {
        const task = await result.current.handleSubmit();
        expect(task).toBeNull();
      });

      expect(result.current.error).toBe("Create failed");
      expect(result.current.isSubmitting).toBe(false);
    });

    it("sets isSubmitting during submission", async () => {
      mockCreateTask.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockTask), 100))
      );
      const { result } = renderHook(() => useTaskForm());
      act(() => {
        result.current.setTitle("Test Task");
        result.current.setPk("TASK-1");
        result.current.setSk("SK-1");
      });

      let submitPromise: Promise<void>;
      act(() => {
        submitPromise = result.current.handleSubmit();
      });

      // Check immediately after calling (before awaiting)
      expect(result.current.isSubmitting).toBe(true);
      await act(async () => {
        await submitPromise!;
      });
      expect(result.current.isSubmitting).toBe(false);
    });
  });

  describe("reset", () => {
    it("resets form to initial state", () => {
      const { result } = renderHook(() => useTaskForm());
      act(() => {
        result.current.setTitle("Test Task");
        result.current.setDescription("Test Description");
        result.current.setTaskType(TaskType.TIMED);
        result.current.setStatus(TaskStatus.STARTED);
      });

      act(() => {
        result.current.reset();
      });

      expect(result.current.title).toBe("");
      expect(result.current.description).toBe("");
      expect(result.current.taskType).toBe(TaskType.SCHEDULED);
      expect(result.current.status).toBe(TaskStatus.OPEN);
      expect(result.current.error).toBeNull();
    });
  });

  describe("date and time handling", () => {
    it("combines date and time into timestamp", async () => {
      mockCreateTask.mockResolvedValue(mockTask);
      const { result } = renderHook(() => useTaskForm());
      act(() => {
        result.current.setTitle("Test Task");
        result.current.setPk("TASK-1");
        result.current.setSk("SK-1");
        result.current.setDueDate("2024-01-15");
        result.current.setDueTime("14:30");
      });

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockCreateTask).toHaveBeenCalledWith(
        expect.objectContaining({
          expireTimeInMillSec: expect.any(Number),
        })
      );
    });
  });
});
