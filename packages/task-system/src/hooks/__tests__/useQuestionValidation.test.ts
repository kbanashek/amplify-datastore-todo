import { renderHook, act } from "@testing-library/react-native";
import { useQuestionValidation } from "@hooks/useQuestionValidation";
import { ParsedActivityData } from "@utils/parsers/activityParser";

// Mock validation utilities
jest.mock("@utils/validation/questionValidation", () => ({
  isScreenValid: jest.fn(),
  validateScreen: jest.fn(),
}));

import {
  isScreenValid,
  validateScreen,
} from "@utils/validation/questionValidation";

describe("useQuestionValidation", () => {
  const mockIsScreenValid = isScreenValid as jest.MockedFunction<
    typeof isScreenValid
  >;
  const mockValidateScreen = validateScreen as jest.MockedFunction<
    typeof validateScreen
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
      {
        id: "screen-2",
        name: "Screen 2",
        order: 2,
        elements: [
          {
            id: "q2",
            order: 1,
            question: {
              id: "q2",
              text: "Question 2",
              friendlyName: "Question 2",
              type: "number",
              required: false,
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

  const mockSetErrors = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("currentScreenValid", () => {
    it("returns true when activityData is null", () => {
      const { result } = renderHook(() =>
        useQuestionValidation({
          activityData: null,
          currentScreenIndex: 0,
          answers: {},
          setErrors: mockSetErrors,
        })
      );
      expect(result.current.currentScreenValid).toBe(true);
    });

    it("returns true when currentScreenIndex is out of bounds", () => {
      const { result } = renderHook(() =>
        useQuestionValidation({
          activityData: mockActivityData,
          currentScreenIndex: -1,
          answers: {},
          setErrors: mockSetErrors,
        })
      );
      expect(result.current.currentScreenValid).toBe(true);
    });

    it("returns true when currentScreenIndex exceeds screens length", () => {
      const { result } = renderHook(() =>
        useQuestionValidation({
          activityData: mockActivityData,
          currentScreenIndex: 999,
          answers: {},
          setErrors: mockSetErrors,
        })
      );
      expect(result.current.currentScreenValid).toBe(true);
    });

    it("calls isScreenValid with correct parameters", () => {
      mockIsScreenValid.mockReturnValue(true);
      const answers = { q1: "Answer 1" };
      renderHook(() =>
        useQuestionValidation({
          activityData: mockActivityData,
          currentScreenIndex: 0,
          answers,
          setErrors: mockSetErrors,
        })
      );
      expect(mockIsScreenValid).toHaveBeenCalledWith(
        mockActivityData.screens[0],
        answers
      );
    });

    it("returns validation result from isScreenValid", () => {
      mockIsScreenValid.mockReturnValue(false);
      const { result } = renderHook(() =>
        useQuestionValidation({
          activityData: mockActivityData,
          currentScreenIndex: 0,
          answers: {},
          setErrors: mockSetErrors,
        })
      );
      expect(result.current.currentScreenValid).toBe(false);
    });

    it("updates when answers change", () => {
      mockIsScreenValid.mockReturnValueOnce(false).mockReturnValueOnce(true);
      const { result, rerender } = renderHook(
        ({ answers }: { answers: Record<string, any> }) =>
          useQuestionValidation({
            activityData: mockActivityData,
            currentScreenIndex: 0,
            answers,
            setErrors: mockSetErrors,
          }),
        { initialProps: { answers: {} } }
      ) as {
        result: { current: ReturnType<typeof useQuestionValidation> };
        rerender: (props: { answers: Record<string, any> }) => void;
      };
      expect(result.current.currentScreenValid).toBe(false);
      rerender({ answers: { q1: "Answer 1" } });
      expect(result.current.currentScreenValid).toBe(true);
    });
  });

  describe("validateCurrentScreen", () => {
    it("returns true when activityData is null", () => {
      const { result } = renderHook(() =>
        useQuestionValidation({
          activityData: null,
          currentScreenIndex: 0,
          answers: {},
          setErrors: mockSetErrors,
        })
      );
      const isValid = result.current.validateCurrentScreen();
      expect(isValid).toBe(true);
      expect(mockValidateScreen).not.toHaveBeenCalled();
    });

    it("returns true when currentScreenIndex is out of bounds", () => {
      const { result } = renderHook(() =>
        useQuestionValidation({
          activityData: mockActivityData,
          currentScreenIndex: -1,
          answers: {},
          setErrors: mockSetErrors,
        })
      );
      const isValid = result.current.validateCurrentScreen();
      expect(isValid).toBe(true);
      expect(mockValidateScreen).not.toHaveBeenCalled();
    });

    it("calls validateScreen and setErrors with correct parameters", () => {
      const screenErrors = { q1: ["Required"] };
      mockValidateScreen.mockReturnValue(screenErrors);
      const answers = { q1: "" };
      const { result } = renderHook(() =>
        useQuestionValidation({
          activityData: mockActivityData,
          currentScreenIndex: 0,
          answers,
          setErrors: mockSetErrors,
        })
      );
      const isValid = result.current.validateCurrentScreen();
      expect(mockValidateScreen).toHaveBeenCalledWith(
        mockActivityData.screens[0],
        answers
      );
      expect(mockSetErrors).toHaveBeenCalledWith(screenErrors);
      expect(isValid).toBe(false);
    });

    it("returns true when validation passes", () => {
      mockValidateScreen.mockReturnValue({});
      const answers = { q1: "Answer 1" };
      const { result } = renderHook(() =>
        useQuestionValidation({
          activityData: mockActivityData,
          currentScreenIndex: 0,
          answers,
          setErrors: mockSetErrors,
        })
      );
      const isValid = result.current.validateCurrentScreen();
      expect(isValid).toBe(true);
      expect(mockSetErrors).toHaveBeenCalledWith({});
    });
  });
});
