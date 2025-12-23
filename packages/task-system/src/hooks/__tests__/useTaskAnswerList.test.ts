import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useTaskAnswerList } from "../useTaskAnswerList";

// Mock TaskAnswerService
jest.mock("../../services/TaskAnswerService", () => ({
  TaskAnswerService: {
    subscribeTaskAnswers: jest.fn(),
    getTaskAnswers: jest.fn(),
    deleteTaskAnswer: jest.fn(),
  },
}));

import { TaskAnswerService } from "../../services/TaskAnswerService";
import { TaskAnswer } from "../../types/TaskAnswer";

describe("useTaskAnswerList", () => {
  const mockSubscribeTaskAnswers =
    TaskAnswerService.subscribeTaskAnswers as jest.MockedFunction<
      typeof TaskAnswerService.subscribeTaskAnswers
    >;
  const mockGetTaskAnswers =
    TaskAnswerService.getTaskAnswers as jest.MockedFunction<
      typeof TaskAnswerService.getTaskAnswers
    >;
  const mockDeleteTaskAnswer =
    TaskAnswerService.deleteTaskAnswer as jest.MockedFunction<
      typeof TaskAnswerService.deleteTaskAnswer
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
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("starts with loading state", () => {
      mockSubscribeTaskAnswers.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      const { result } = renderHook(() => useTaskAnswerList());
      expect(result.current.loading).toBe(true);
      expect(result.current.taskAnswers).toEqual([]);
    });

    it("subscribes to task answers on mount", () => {
      const unsubscribe = jest.fn();
      mockSubscribeTaskAnswers.mockReturnValue({
        unsubscribe,
      });
      renderHook(() => useTaskAnswerList());
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
      const { result } = renderHook(() => useTaskAnswerList());
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

  describe("delete task answer", () => {
    it("deletes a task answer successfully", async () => {
      mockSubscribeTaskAnswers.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockDeleteTaskAnswer.mockResolvedValue(undefined);
      const { result } = renderHook(() => useTaskAnswerList());

      await act(async () => {
        await result.current.handleDeleteTaskAnswer("1");
      });

      expect(mockDeleteTaskAnswer).toHaveBeenCalledWith("1");
    });

    it("handles delete errors", async () => {
      mockSubscribeTaskAnswers.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockDeleteTaskAnswer.mockRejectedValue(new Error("Delete failed"));
      const { result } = renderHook(() => useTaskAnswerList());

      await act(async () => {
        await result.current.handleDeleteTaskAnswer("1");
      });

      expect(result.current.error).toBe("Failed to delete task answer.");
    });
  });

  describe("refresh task answers", () => {
    it("refreshes task answers manually", async () => {
      mockSubscribeTaskAnswers.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockGetTaskAnswers.mockResolvedValue(mockTaskAnswers);
      const { result } = renderHook(() => useTaskAnswerList());

      await act(async () => {
        await result.current.refreshTaskAnswers();
      });

      expect(mockGetTaskAnswers).toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current.taskAnswers).toEqual(mockTaskAnswers);
        expect(result.current.loading).toBe(false);
      });
    });

    it("handles refresh errors", async () => {
      mockSubscribeTaskAnswers.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockGetTaskAnswers.mockRejectedValue(new Error("Refresh failed"));
      const { result } = renderHook(() => useTaskAnswerList());

      await act(async () => {
        await result.current.refreshTaskAnswers();
      });

      expect(result.current.error).toBe("Failed to refresh task answers.");
      expect(result.current.loading).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("unsubscribes on unmount", () => {
      const unsubscribe = jest.fn();
      mockSubscribeTaskAnswers.mockReturnValue({
        unsubscribe,
      });
      const { unmount } = renderHook(() => useTaskAnswerList());
      unmount();
      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});
