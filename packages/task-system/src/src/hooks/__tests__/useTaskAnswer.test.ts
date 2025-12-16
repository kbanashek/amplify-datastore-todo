import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useTaskAnswer } from "../useTaskAnswer";

// Mock TaskAnswerService
jest.mock("@orion/task-system", () => ({
  TaskAnswerService: {
    subscribeTaskAnswers: jest.fn(),
    createTaskAnswer: jest.fn(),
    updateTaskAnswer: jest.fn(),
  },
}));

import { TaskAnswerService } from "@orion/task-system";
import { TaskAnswer, CreateTaskAnswerInput } from "../../types/TaskAnswer";

describe("useTaskAnswer", () => {
  const mockSubscribeTaskAnswers =
    TaskAnswerService.subscribeTaskAnswers as jest.MockedFunction<
      typeof TaskAnswerService.subscribeTaskAnswers
    >;
  const mockCreateTaskAnswer =
    TaskAnswerService.createTaskAnswer as jest.MockedFunction<
      typeof TaskAnswerService.createTaskAnswer
    >;
  const mockUpdateTaskAnswer =
    TaskAnswerService.updateTaskAnswer as jest.MockedFunction<
      typeof TaskAnswerService.updateTaskAnswer
    >;

  const mockTaskAnswers: TaskAnswer[] = [
    {
      id: "1",
      pk: "ANSWER-1",
      sk: "SK-1",
      taskInstanceId: "TASK-1",
      questionId: "QUESTION-1",
      answer: "Answer 1",
    },
    {
      id: "2",
      pk: "ANSWER-2",
      sk: "SK-2",
      taskInstanceId: "TASK-1",
      questionId: "QUESTION-2",
      answer: "Answer 2",
    },
    {
      id: "3",
      pk: "ANSWER-3",
      sk: "SK-3",
      taskInstanceId: "TASK-2",
      questionId: "QUESTION-1",
      answer: "Answer 3",
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("starts with loading state", () => {
      mockSubscribeTaskAnswers.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      const { result } = renderHook(() => useTaskAnswer());
      expect(result.current.loading).toBe(true);
      expect(result.current.taskAnswers).toEqual([]);
      expect(result.current.isCreating).toBe(false);
      expect(result.current.isUpdating).toBe(false);
    });

    it("subscribes to task answers on mount", () => {
      const unsubscribe = jest.fn();
      mockSubscribeTaskAnswers.mockReturnValue({
        unsubscribe,
      });
      renderHook(() => useTaskAnswer());
      expect(mockSubscribeTaskAnswers).toHaveBeenCalled();
    });

    it("updates task answers when subscription callback fires", async () => {
      let subscriptionCallback:
        | ((items: TaskAnswer[], synced: boolean) => void)
        | null = null;
      mockSubscribeTaskAnswers.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe: jest.fn() };
      });
      const { result } = renderHook(() => useTaskAnswer());
      expect(result.current.loading).toBe(true);

      if (subscriptionCallback) {
        subscriptionCallback(mockTaskAnswers, true);
      }

      await waitFor(() => {
        expect(result.current.taskAnswers).toEqual(mockTaskAnswers);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("getAnswersByTaskId", () => {
    it("filters answers by task ID", async () => {
      let subscriptionCallback:
        | ((items: TaskAnswer[], synced: boolean) => void)
        | null = null;
      mockSubscribeTaskAnswers.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe: jest.fn() };
      });
      const { result } = renderHook(() => useTaskAnswer());

      if (subscriptionCallback) {
        subscriptionCallback(mockTaskAnswers, true);
      }

      await waitFor(() => {
        expect(result.current.taskAnswers.length).toBeGreaterThan(0);
      });

      const task1Answers = result.current.getAnswersByTaskId("TASK-1");
      expect(task1Answers).toHaveLength(2);
      expect(task1Answers.every(a => a.taskInstanceId === "TASK-1")).toBe(true);
    });

    it("returns empty array when no answers for task", async () => {
      let subscriptionCallback:
        | ((items: TaskAnswer[], synced: boolean) => void)
        | null = null;
      mockSubscribeTaskAnswers.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe: jest.fn() };
      });
      const { result } = renderHook(() => useTaskAnswer());

      if (subscriptionCallback) {
        subscriptionCallback(mockTaskAnswers, true);
      }

      await waitFor(() => {
        expect(result.current.taskAnswers.length).toBeGreaterThan(0);
      });

      const task3Answers = result.current.getAnswersByTaskId("TASK-3");
      expect(task3Answers).toEqual([]);
    });
  });

  describe("getAnswerByQuestionId", () => {
    it("finds answer by task ID and question ID", async () => {
      let subscriptionCallback:
        | ((items: TaskAnswer[], synced: boolean) => void)
        | null = null;
      mockSubscribeTaskAnswers.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe: jest.fn() };
      });
      const { result } = renderHook(() => useTaskAnswer());

      if (subscriptionCallback) {
        subscriptionCallback(mockTaskAnswers, true);
      }

      await waitFor(() => {
        expect(result.current.taskAnswers.length).toBeGreaterThan(0);
      });

      const answer = result.current.getAnswerByQuestionId(
        "TASK-1",
        "QUESTION-1"
      );
      expect(answer).toBeDefined();
      expect(answer?.taskInstanceId).toBe("TASK-1");
      expect(answer?.questionId).toBe("QUESTION-1");
    });

    it("returns undefined when answer not found", async () => {
      let subscriptionCallback:
        | ((items: TaskAnswer[], synced: boolean) => void)
        | null = null;
      mockSubscribeTaskAnswers.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe: jest.fn() };
      });
      const { result } = renderHook(() => useTaskAnswer());

      if (subscriptionCallback) {
        subscriptionCallback(mockTaskAnswers, true);
      }

      await waitFor(() => {
        expect(result.current.taskAnswers.length).toBeGreaterThan(0);
      });

      const answer = result.current.getAnswerByQuestionId(
        "TASK-1",
        "QUESTION-999"
      );
      expect(answer).toBeUndefined();
    });
  });

  describe("createTaskAnswer", () => {
    it("creates a task answer successfully", async () => {
      mockSubscribeTaskAnswers.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      const newAnswer: TaskAnswer = {
        id: "4",
        pk: "ANSWER-4",
        sk: "SK-4",
        taskInstanceId: "TASK-1",
        questionId: "QUESTION-3",
        answer: "New Answer",
      };
      mockCreateTaskAnswer.mockResolvedValue(newAnswer);
      const { result } = renderHook(() => useTaskAnswer());

      const input: CreateTaskAnswerInput = {
        pk: "ANSWER-4",
        sk: "SK-4",
        taskInstanceId: "TASK-1",
        questionId: "QUESTION-3",
        answer: "New Answer",
      };

      await act(async () => {
        const created = await result.current.createTaskAnswer(input);
        expect(created).toEqual(newAnswer);
      });

      expect(mockCreateTaskAnswer).toHaveBeenCalledWith(input);
      expect(result.current.isCreating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("handles create errors", async () => {
      mockSubscribeTaskAnswers.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockCreateTaskAnswer.mockRejectedValue(new Error("Create failed"));
      const { result } = renderHook(() => useTaskAnswer());

      const input: CreateTaskAnswerInput = {
        pk: "ANSWER-4",
        sk: "SK-4",
        taskInstanceId: "TASK-1",
        questionId: "QUESTION-3",
        answer: "New Answer",
      };

      await act(async () => {
        const created = await result.current.createTaskAnswer(input);
        expect(created).toBeNull();
      });

      expect(result.current.error).toBe("Create failed");
      expect(result.current.isCreating).toBe(false);
    });

    it("sets isCreating during creation", async () => {
      mockSubscribeTaskAnswers.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockCreateTaskAnswer.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve(mockTaskAnswers[0]), 100)
          )
      );
      const { result } = renderHook(() => useTaskAnswer());

      const input: CreateTaskAnswerInput = {
        pk: "ANSWER-4",
        sk: "SK-4",
        taskInstanceId: "TASK-1",
        questionId: "QUESTION-3",
        answer: "New Answer",
      };

      let createPromise: Promise<TaskAnswer | null>;
      act(() => {
        createPromise = result.current.createTaskAnswer(input);
      });

      // Check immediately after calling (before awaiting)
      expect(result.current.isCreating).toBe(true);
      await act(async () => {
        await createPromise!;
      });
      expect(result.current.isCreating).toBe(false);
    });
  });

  describe("updateTaskAnswer", () => {
    it("updates a task answer successfully", async () => {
      mockSubscribeTaskAnswers.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      const updatedAnswer: TaskAnswer = {
        ...mockTaskAnswers[0],
        answer: "Updated Answer",
      };
      mockUpdateTaskAnswer.mockResolvedValue(updatedAnswer);
      const { result } = renderHook(() => useTaskAnswer());

      await act(async () => {
        const updated = await result.current.updateTaskAnswer("1", {
          answer: "Updated Answer",
        });
        expect(updated).toEqual(updatedAnswer);
      });

      expect(mockUpdateTaskAnswer).toHaveBeenCalledWith("1", {
        answer: "Updated Answer",
      });
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it("handles update errors", async () => {
      mockSubscribeTaskAnswers.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockUpdateTaskAnswer.mockRejectedValue(new Error("Update failed"));
      const { result } = renderHook(() => useTaskAnswer());

      await act(async () => {
        const updated = await result.current.updateTaskAnswer("1", {
          answer: "Updated Answer",
        });
        expect(updated).toBeNull();
      });

      expect(result.current.error).toBe("Update failed");
      expect(result.current.isUpdating).toBe(false);
    });

    it("sets isUpdating during update", async () => {
      mockSubscribeTaskAnswers.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockUpdateTaskAnswer.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve(mockTaskAnswers[0]), 100)
          )
      );
      const { result } = renderHook(() => useTaskAnswer());

      let updatePromise: Promise<TaskAnswer | null>;
      act(() => {
        updatePromise = result.current.updateTaskAnswer("1", {
          answer: "Updated",
        });
      });

      // Check immediately after calling (before awaiting)
      expect(result.current.isUpdating).toBe(true);
      await act(async () => {
        await updatePromise!;
      });
      expect(result.current.isUpdating).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("unsubscribes on unmount", () => {
      const unsubscribe = jest.fn();
      mockSubscribeTaskAnswers.mockReturnValue({
        unsubscribe,
      });
      const { unmount } = renderHook(() => useTaskAnswer());
      unmount();
      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});
