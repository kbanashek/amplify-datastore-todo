import { renderHook, act, waitFor } from "@testing-library/react-native";
import { useTaskCard, areTaskCardPropsEqual } from "@hooks/useTaskCard";
import { Task, TaskStatus, TaskType } from "@task-types/Task";

// Mock TaskService
const mockUpdateTask = jest.fn().mockResolvedValue({});

jest.mock("@services/TaskService", () => ({
  TaskService: {
    updateTask: (id: string, input: any) => mockUpdateTask(id, input),
  },
}));

// Mock useTaskTranslation
const mockT = jest.fn((key: string) => key);

jest.mock("@translations/index", () => ({
  useTaskTranslation: jest.fn(() => ({
    t: mockT,
    currentLanguage: "en",
    isRTL: false,
  })),
}));

// Mock getTaskIcon
jest.mock("@utils/icons/taskIcon", () => ({
  getTaskIcon: jest.fn((task: Task) => ({
    name: "pills",
    color: "#007AFF",
  })),
}));

// Mock logger
jest.mock("@utils/logging/serviceLogger", () => ({
  getServiceLogger: jest.fn(() => ({
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  })),
}));

describe("useTaskCard", () => {
  const mockTask: Task = {
    id: "task-1",
    pk: "USER#1",
    sk: "TASK#1",
    title: "Test Task",
    taskType: TaskType.SCHEDULED,
    status: TaskStatus.OPEN,
  };

  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockT.mockImplementation((key: string) => key);
  });

  describe("Initial State", () => {
    it("returns correct initial values for non-started task", () => {
      const { result } = renderHook(() =>
        useTaskCard({ task: mockTask, onPress: mockOnPress })
      );

      expect(result.current!.icon).toEqual({ name: "pills", color: "#007AFF" });
      expect(result.current!.beginButtonText).toBe("task.begin");
      expect(result.current!.completedText).toBe("task.completed");
      expect(result.current!.isCompleted).toBe(false);
      expect(result.current!.isDisabled).toBe(false);
    });

    it("returns RESUME text for started task", () => {
      const startedTask: Task = { ...mockTask, status: TaskStatus.STARTED };
      const { result } = renderHook(() =>
        useTaskCard({ task: startedTask, onPress: mockOnPress })
      );

      expect(result.current!.beginButtonText).toBe("task.resume");
    });

    it("returns RESUME text for in-progress task", () => {
      const inProgressTask: Task = {
        ...mockTask,
        status: TaskStatus.INPROGRESS,
      };
      const { result } = renderHook(() =>
        useTaskCard({ task: inProgressTask, onPress: mockOnPress })
      );

      expect(result.current!.beginButtonText).toBe("task.resume");
    });

    it("returns correct status for completed task", () => {
      const completedTask: Task = {
        ...mockTask,
        status: TaskStatus.COMPLETED,
      };
      const { result } = renderHook(() =>
        useTaskCard({ task: completedTask, onPress: mockOnPress })
      );

      expect(result.current!.isCompleted).toBe(true);
      expect(result.current!.isDisabled).toBe(true);
    });

    it("provides translation function", () => {
      const { result } = renderHook(() =>
        useTaskCard({ task: mockTask, onPress: mockOnPress })
      );

      expect(result.current!.t).toBeDefined();
      expect(result.current!.t("test.key")).toBe("test.key");
    });
  });

  describe("handleBeginPress", () => {
    it("updates task status to STARTED for non-started task", async () => {
      const { result } = renderHook(() =>
        useTaskCard({ task: mockTask, onPress: mockOnPress })
      );

      await act(async () => {
        await result.current!.handleBeginPress();
      });

      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(mockTask.id, {
          status: TaskStatus.STARTED,
        });
        expect(mockOnPress).toHaveBeenCalledWith(mockTask);
      });
    });

    it("does not update status if task is already started", async () => {
      const startedTask: Task = { ...mockTask, status: TaskStatus.STARTED };
      const { result } = renderHook(() =>
        useTaskCard({ task: startedTask, onPress: mockOnPress })
      );

      await act(async () => {
        await result.current!.handleBeginPress();
      });

      await waitFor(() => {
        expect(mockUpdateTask).not.toHaveBeenCalled();
        expect(mockOnPress).toHaveBeenCalledWith(startedTask);
      });
    });

    it("does not update status if task is in progress", async () => {
      const inProgressTask: Task = {
        ...mockTask,
        status: TaskStatus.INPROGRESS,
      };
      const { result } = renderHook(() =>
        useTaskCard({ task: inProgressTask, onPress: mockOnPress })
      );

      await act(async () => {
        await result.current!.handleBeginPress();
      });

      await waitFor(() => {
        expect(mockUpdateTask).not.toHaveBeenCalled();
        expect(mockOnPress).toHaveBeenCalledWith(inProgressTask);
      });
    });

    it("handles TaskService error gracefully", async () => {
      mockUpdateTask.mockRejectedValueOnce(new Error("Update failed"));
      const { result } = renderHook(() =>
        useTaskCard({ task: mockTask, onPress: mockOnPress })
      );

      await act(async () => {
        await result.current!.handleBeginPress();
      });

      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalled();
        // onPress is still called even when update fails (consistent UX)
        expect(mockOnPress).toHaveBeenCalledWith(mockTask);
      });
    });

    it("works without onPress callback", async () => {
      const { result } = renderHook(() => useTaskCard({ task: mockTask }));

      await act(async () => {
        await result.current!.handleBeginPress();
      });

      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(mockTask.id, {
          status: TaskStatus.STARTED,
        });
      });
    });
  });

  describe("handleCardPress", () => {
    it("updates task status to STARTED for non-started task", async () => {
      const { result } = renderHook(() =>
        useTaskCard({ task: mockTask, onPress: mockOnPress })
      );

      await act(async () => {
        await result.current!.handleCardPress();
      });

      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(mockTask.id, {
          status: TaskStatus.STARTED,
        });
        expect(mockOnPress).toHaveBeenCalledWith(mockTask);
      });
    });

    it("does not update status if task is already started", async () => {
      const startedTask: Task = { ...mockTask, status: TaskStatus.STARTED };
      const { result } = renderHook(() =>
        useTaskCard({ task: startedTask, onPress: mockOnPress })
      );

      await act(async () => {
        await result.current!.handleCardPress();
      });

      await waitFor(() => {
        expect(mockUpdateTask).not.toHaveBeenCalled();
        expect(mockOnPress).toHaveBeenCalledWith(startedTask);
      });
    });

    it("ignores press when task is completed", async () => {
      const completedTask: Task = {
        ...mockTask,
        status: TaskStatus.COMPLETED,
      };
      const { result } = renderHook(() =>
        useTaskCard({ task: completedTask, onPress: mockOnPress })
      );

      await act(async () => {
        await result.current!.handleCardPress();
      });

      expect(mockUpdateTask).not.toHaveBeenCalled();
      expect(mockOnPress).not.toHaveBeenCalled();
    });

    it("calls onPress even if TaskService update fails", async () => {
      mockUpdateTask.mockRejectedValueOnce(new Error("Update failed"));
      const { result } = renderHook(() =>
        useTaskCard({ task: mockTask, onPress: mockOnPress })
      );

      await act(async () => {
        await result.current!.handleCardPress();
      });

      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalled();
        // Still navigates even if update fails
        expect(mockOnPress).toHaveBeenCalledWith(mockTask);
      });
    });

    it("works without onPress callback", async () => {
      const { result } = renderHook(() => useTaskCard({ task: mockTask }));

      await act(async () => {
        await result.current!.handleCardPress();
      });

      await waitFor(() => {
        expect(mockUpdateTask).toHaveBeenCalledWith(mockTask.id, {
          status: TaskStatus.STARTED,
        });
      });
    });
  });

  describe("Icon Memoization", () => {
    it("memoizes icon based on task", () => {
      const { result, rerender } = renderHook(
        ({ task }: { task: Task }) =>
          useTaskCard({ task, onPress: mockOnPress }),
        { initialProps: { task: mockTask } }
      );

      const firstIcon = result.current!.icon;

      // Rerender with same task
      rerender({ task: mockTask });
      expect(result.current!.icon).toBe(firstIcon); // Same reference

      // Rerender with different task
      const newTask = { ...mockTask, id: "task-2" };
      rerender({ task: newTask });
      expect(result.current!.icon).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    it("handles task with VISIBLE status", () => {
      const visibleTask: Task = { ...mockTask, status: TaskStatus.VISIBLE };
      const { result } = renderHook(() =>
        useTaskCard({ task: visibleTask, onPress: mockOnPress })
      );

      expect(result.current!.isCompleted).toBe(false);
      expect(result.current!.beginButtonText).toBe("task.begin");
    });

    it("handles task with EXPIRED status", () => {
      const expiredTask: Task = { ...mockTask, status: TaskStatus.EXPIRED };
      const { result } = renderHook(() =>
        useTaskCard({ task: expiredTask, onPress: mockOnPress })
      );

      expect(result.current!.isCompleted).toBe(false);
      expect(result.current!.beginButtonText).toBe("task.begin");
    });

    it("returns all required values", () => {
      const { result } = renderHook(() =>
        useTaskCard({ task: mockTask, onPress: mockOnPress })
      );

      expect(result.current!.icon).toBeDefined();
      expect(result.current!.beginButtonText).toBeDefined();
      expect(result.current!.completedText).toBeDefined();
      expect(result.current!.isCompleted).toBeDefined();
      expect(result.current!.isDisabled).toBeDefined();
      expect(result.current!.handleBeginPress).toBeDefined();
      expect(result.current!.handleCardPress).toBeDefined();
      expect(result.current!.t).toBeDefined();
    });
  });

  describe("Callback Dependencies", () => {
    it("updates handleBeginPress when task changes", async () => {
      const { result, rerender } = renderHook(
        ({ task }: { task: Task }) =>
          useTaskCard({ task, onPress: mockOnPress }),
        { initialProps: { task: mockTask } }
      );

      const firstHandler = result.current!.handleBeginPress;

      const newTask = { ...mockTask, id: "task-2" };
      rerender({ task: newTask });

      const secondHandler = result.current!.handleBeginPress;
      expect(secondHandler).not.toBe(firstHandler);
    });

    it("updates handleCardPress when task changes", async () => {
      const { result, rerender } = renderHook(
        ({ task }: { task: Task }) =>
          useTaskCard({ task, onPress: mockOnPress }),
        { initialProps: { task: mockTask } }
      );

      const firstHandler = result.current!.handleCardPress;

      const newTask = { ...mockTask, id: "task-2" };
      rerender({ task: newTask });

      const secondHandler = result.current!.handleCardPress;
      expect(secondHandler).not.toBe(firstHandler);
    });

    it("updates handlers when onPress changes", () => {
      const { result, rerender } = renderHook(
        ({ onPress }: { onPress: ((task: Task) => void) | undefined }) =>
          useTaskCard({ task: mockTask, onPress }),
        { initialProps: { onPress: mockOnPress } }
      );

      const firstBeginHandler = result.current!.handleBeginPress;
      const firstCardHandler = result.current!.handleCardPress;

      const newOnPress = jest.fn();
      rerender({ onPress: newOnPress });

      expect(result.current!.handleBeginPress).not.toBe(firstBeginHandler);
      expect(result.current!.handleCardPress).not.toBe(firstCardHandler);
    });
  });

  describe("areTaskCardPropsEqual Memoization", () => {
    const baseProps = {
      task: mockTask,
      onPress: mockOnPress,
      onDelete: jest.fn(),
      simple: false,
    };

    it("returns true when all props are equal", () => {
      const result = areTaskCardPropsEqual(baseProps, baseProps);
      expect(result).toBe(true);
    });

    it("returns false when task.id changes", () => {
      const nextProps = {
        ...baseProps,
        task: { ...mockTask, id: "task-2" },
      };
      const result = areTaskCardPropsEqual(baseProps, nextProps);
      expect(result).toBe(false);
    });

    it("returns false when task.title changes", () => {
      const nextProps = {
        ...baseProps,
        task: { ...mockTask, title: "Different Title" },
      };
      const result = areTaskCardPropsEqual(baseProps, nextProps);
      expect(result).toBe(false);
    });

    it("returns false when task.status changes", () => {
      const nextProps = {
        ...baseProps,
        task: { ...mockTask, status: TaskStatus.COMPLETED },
      };
      const result = areTaskCardPropsEqual(baseProps, nextProps);
      expect(result).toBe(false);
    });

    it("returns false when task.taskType changes (CRITICAL for icon rendering)", () => {
      const nextProps = {
        ...baseProps,
        task: { ...mockTask, taskType: TaskType.TIMED },
      };
      const result = areTaskCardPropsEqual(baseProps, nextProps);
      expect(result).toBe(false);
    });

    it("returns false when onPress changes", () => {
      const newOnPress = jest.fn();
      const nextProps = { ...baseProps, onPress: newOnPress };
      const result = areTaskCardPropsEqual(baseProps, nextProps);
      expect(result).toBe(false);
    });

    it("returns false when onDelete changes", () => {
      const newOnDelete = jest.fn();
      const nextProps = { ...baseProps, onDelete: newOnDelete };
      const result = areTaskCardPropsEqual(baseProps, nextProps);
      expect(result).toBe(false);
    });

    it("returns false when simple flag changes", () => {
      const nextProps = { ...baseProps, simple: true };
      const result = areTaskCardPropsEqual(baseProps, nextProps);
      expect(result).toBe(false);
    });

    it("returns true when unrelated task properties change", () => {
      const nextProps = {
        ...baseProps,
        task: {
          ...mockTask,
          pk: "USER#2", // Unrelated property
          sk: "TASK#2", // Unrelated property
          dueDate: "2025-01-01", // Unrelated property
        },
      };
      const result = areTaskCardPropsEqual(baseProps, nextProps);
      expect(result).toBe(true);
    });

    it("prevents re-render when taskType is same but other props change", () => {
      const nextProps = {
        ...baseProps,
        task: {
          ...mockTask,
          // taskType stays SCHEDULED
          dueDate: "2025-01-01", // Unrelated property
        },
      };
      const result = areTaskCardPropsEqual(baseProps, nextProps);
      expect(result).toBe(true);
    });

    it("triggers re-render when multiple relevant props change", () => {
      const nextProps = {
        ...baseProps,
        task: {
          ...mockTask,
          title: "New Title",
          status: TaskStatus.STARTED,
          taskType: TaskType.EPISODIC,
        },
      };
      const result = areTaskCardPropsEqual(baseProps, nextProps);
      expect(result).toBe(false);
    });
  });
});
