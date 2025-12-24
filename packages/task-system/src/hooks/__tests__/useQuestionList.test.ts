import { renderHook, waitFor, act } from "@testing-library/react-native";
import { useQuestionList } from "../useQuestionList";

// Mock QuestionService
jest.mock("../../services/QuestionService", () => ({
  QuestionService: {
    subscribeQuestions: jest.fn(),
    getQuestions: jest.fn(),
    deleteQuestion: jest.fn(),
  },
}));

import { QuestionService } from "../../services/QuestionService";
import { Question as QuestionModel } from "../../models";
import { Question } from "../../types/Question";

describe("useQuestionList", () => {
  const mockSubscribeQuestions =
    QuestionService.subscribeQuestions as jest.MockedFunction<
      typeof QuestionService.subscribeQuestions
    >;
  const mockGetQuestions = QuestionService.getQuestions as jest.MockedFunction<
    typeof QuestionService.getQuestions
  >;
  const mockDeleteQuestion =
    QuestionService.deleteQuestion as jest.MockedFunction<
      typeof QuestionService.deleteQuestion
    >;

  const mockQuestions = [
    {
      id: "1",
      pk: "QUESTION-1",
      sk: "SK-1",
      text: "Question 1",
      friendlyName: "Question 1",
      type: "text",
      required: true,
      validations: null,
      choices: [],
      dataMappers: [],
    },
    {
      id: "2",
      pk: "QUESTION-2",
      sk: "SK-2",
      text: "Question 2",
      friendlyName: "Question 2",
      type: "number",
      required: false,
      validations: null,
      choices: [],
      dataMappers: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("initialization", () => {
    it("starts with loading state", () => {
      mockSubscribeQuestions.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      const { result } = renderHook(() => useQuestionList());
      expect(result.current.loading).toBe(true);
      expect(result.current.questions).toEqual([]);
    });

    it("subscribes to questions on mount", () => {
      const unsubscribe = jest.fn();
      mockSubscribeQuestions.mockReturnValue({
        unsubscribe,
      });
      renderHook(() => useQuestionList());
      expect(mockSubscribeQuestions).toHaveBeenCalled();
    });

    it("updates questions when subscription callback fires", async () => {
      let subscriptionCallback: any = null;
      mockSubscribeQuestions.mockImplementation(callback => {
        subscriptionCallback = callback;
        return { unsubscribe: jest.fn() };
      });
      const { result } = renderHook(() => useQuestionList());
      expect(result.current.loading).toBe(true);

      if (subscriptionCallback) {
        (
          subscriptionCallback as (
            items: QuestionModel[],
            synced: boolean
          ) => void
        )(mockQuestions as unknown as QuestionModel[], true);
      }

      await waitFor(() => {
        expect(result.current.questions).toEqual(mockQuestions);
        expect(result.current.loading).toBe(false);
      });
    });
  });

  describe("delete question", () => {
    it("deletes a question successfully", async () => {
      mockSubscribeQuestions.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockDeleteQuestion.mockResolvedValue(undefined);
      const { result } = renderHook(() => useQuestionList());

      await act(async () => {
        await result.current.handleDeleteQuestion("1");
      });

      expect(mockDeleteQuestion).toHaveBeenCalledWith("1");
    });

    it("handles delete errors", async () => {
      mockSubscribeQuestions.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockDeleteQuestion.mockRejectedValue(new Error("Delete failed"));
      const { result } = renderHook(() => useQuestionList());

      await act(async () => {
        await result.current.handleDeleteQuestion("1");
      });

      expect(result.current.error).toBe("Failed to delete question.");
    });
  });

  describe("refresh questions", () => {
    it("refreshes questions manually", async () => {
      mockSubscribeQuestions.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockGetQuestions.mockResolvedValue(
        mockQuestions as unknown as QuestionModel[]
      );
      const { result } = renderHook(() => useQuestionList());

      await act(async () => {
        await result.current.refreshQuestions();
      });

      expect(mockGetQuestions).toHaveBeenCalled();
      await waitFor(() => {
        expect(result.current.questions).toEqual(mockQuestions);
        expect(result.current.loading).toBe(false);
      });
    });

    it("handles refresh errors", async () => {
      mockSubscribeQuestions.mockReturnValue({
        unsubscribe: jest.fn(),
      });
      mockGetQuestions.mockRejectedValue(new Error("Refresh failed"));
      const { result } = renderHook(() => useQuestionList());

      await act(async () => {
        await result.current.refreshQuestions();
      });

      expect(result.current.error).toBe("Failed to refresh questions.");
      expect(result.current.loading).toBe(false);
    });
  });

  describe("cleanup", () => {
    it("unsubscribes on unmount", () => {
      const unsubscribe = jest.fn();
      mockSubscribeQuestions.mockReturnValue({
        unsubscribe,
      });
      const { unmount } = renderHook(() => useQuestionList());
      unmount();
      expect(unsubscribe).toHaveBeenCalled();
    });
  });
});
