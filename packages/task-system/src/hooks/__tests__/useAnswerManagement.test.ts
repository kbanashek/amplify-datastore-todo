import { renderHook, act } from "@testing-library/react-native";
import { useAnswerManagement } from "../useAnswerManagement";
import { ParsedActivityData } from "../../utils/activityParser";

// Mock validation utilities
jest.mock("../../utils/questionValidation", () => ({
  validateQuestionAnswer: jest.fn(),
}));

import { validateQuestionAnswer } from "../../utils/questionValidation";

describe("useAnswerManagement", () => {
  const mockValidateQuestionAnswer =
    validateQuestionAnswer as jest.MockedFunction<
      typeof validateQuestionAnswer
    >;

  const mockActivityData: ParsedActivityData = {
    questions: [],
    screens: [
      {
        id: "screen-1",
        name: "Screen 1",
        order: 1,
        elements: [
          {
            id: "q1",
            order: 1,
            question: {
              id: "q1",
              text: "Question 1",
              friendlyName: "Question 1",
              type: "text",
              required: true,
              validations: [],
              choices: [],
              dataMappers: [],
            },
            displayProperties: {},
          },
        ],
        displayProperties: {},
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Default mock return value - empty array (no errors)
    mockValidateQuestionAnswer.mockReturnValue([]);
  });

  describe("initialization", () => {
    it("initializes with empty answers when no initialAnswers provided", () => {
      const { result } = renderHook(() =>
        useAnswerManagement({
          activityData: null,
          currentScreenIndex: 0,
        })
      );
      expect(result.current.answers).toEqual({});
      expect(result.current.errors).toEqual({});
    });

    it("initializes with provided initialAnswers", () => {
      const initialAnswers = { q1: "Initial Answer" };
      const { result } = renderHook(() =>
        useAnswerManagement({
          activityData: null,
          currentScreenIndex: 0,
          initialAnswers,
        })
      );
      expect(result.current.answers).toEqual(initialAnswers);
    });
  });

  describe("handleAnswerChange", () => {
    it("updates answer state", () => {
      const { result } = renderHook(() =>
        useAnswerManagement({
          activityData: mockActivityData,
          currentScreenIndex: 0,
        })
      );

      act(() => {
        result.current.handleAnswerChange("q1", "New Answer");
      });

      expect(result.current.answers.q1).toBe("New Answer");
    });

    it("preserves other answers when updating one", () => {
      const { result } = renderHook(() =>
        useAnswerManagement({
          activityData: mockActivityData,
          currentScreenIndex: 0,
          initialAnswers: { q2: "Answer 2" },
        })
      );

      act(() => {
        result.current.handleAnswerChange("q1", "Answer 1");
      });

      expect(result.current.answers.q1).toBe("Answer 1");
      expect(result.current.answers.q2).toBe("Answer 2");
    });

    it("validates answer when on a question screen", () => {
      mockValidateQuestionAnswer.mockReturnValue([]);
      const { result } = renderHook(() =>
        useAnswerManagement({
          activityData: mockActivityData,
          currentScreenIndex: 0,
        })
      );

      act(() => {
        result.current.handleAnswerChange("q1", "Answer");
      });

      expect(mockValidateQuestionAnswer).toHaveBeenCalledWith(
        mockActivityData.screens[0].elements[0].question,
        "Answer",
        { q1: "Answer" }
      );
    });

    it("sets errors when validation fails", () => {
      mockValidateQuestionAnswer.mockReturnValue(["Required field"]);
      const { result } = renderHook(() =>
        useAnswerManagement({
          activityData: mockActivityData,
          currentScreenIndex: 0,
        })
      );

      act(() => {
        result.current.handleAnswerChange("q1", "");
      });

      expect(result.current.errors.q1).toEqual(["Required field"]);
    });

    it("clears errors when validation passes", () => {
      mockValidateQuestionAnswer
        .mockReturnValueOnce(["Required field"])
        .mockReturnValueOnce([]);
      const { result } = renderHook(() =>
        useAnswerManagement({
          activityData: mockActivityData,
          currentScreenIndex: 0,
        })
      );

      act(() => {
        result.current.handleAnswerChange("q1", "");
      });
      expect(result.current.errors.q1).toEqual(["Required field"]);

      act(() => {
        result.current.handleAnswerChange("q1", "Valid Answer");
      });
      expect(result.current.errors.q1).toBeUndefined();
    });

    it("does not validate when activityData is null", () => {
      const { result } = renderHook(() =>
        useAnswerManagement({
          activityData: null,
          currentScreenIndex: 0,
        })
      );

      act(() => {
        result.current.handleAnswerChange("q1", "Answer");
      });

      expect(mockValidateQuestionAnswer).not.toHaveBeenCalled();
    });

    it("does not validate when currentScreenIndex is out of bounds", () => {
      const { result } = renderHook(() =>
        useAnswerManagement({
          activityData: mockActivityData,
          currentScreenIndex: -1,
        })
      );

      act(() => {
        result.current.handleAnswerChange("q1", "Answer");
      });

      expect(mockValidateQuestionAnswer).not.toHaveBeenCalled();
    });

    it("does not validate when question not found in current screen", () => {
      const { result } = renderHook(() =>
        useAnswerManagement({
          activityData: mockActivityData,
          currentScreenIndex: 0,
        })
      );

      act(() => {
        result.current.handleAnswerChange("q999", "Answer");
      });

      expect(mockValidateQuestionAnswer).not.toHaveBeenCalled();
    });
  });

  describe("setAnswers and setErrors", () => {
    it("allows direct setting of answers", () => {
      const { result } = renderHook(() =>
        useAnswerManagement({
          activityData: null,
          currentScreenIndex: 0,
        })
      );

      act(() => {
        result.current.setAnswers({ q1: "Answer 1", q2: "Answer 2" });
      });

      expect(result.current.answers).toEqual({
        q1: "Answer 1",
        q2: "Answer 2",
      });
    });

    it("allows direct setting of errors", () => {
      const { result } = renderHook(() =>
        useAnswerManagement({
          activityData: null,
          currentScreenIndex: 0,
        })
      );

      act(() => {
        result.current.setErrors({ q1: ["Error 1"] });
      });

      expect(result.current.errors).toEqual({ q1: ["Error 1"] });
    });
  });
});
