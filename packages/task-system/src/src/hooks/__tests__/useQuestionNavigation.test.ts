import { renderHook, act } from "@testing-library/react-native";
import { useQuestionNavigation } from "../useQuestionNavigation";
import { Alert } from "react-native";
import { ParsedActivityData } from "../../utils/activityParser";
import { ActivityConfig } from "../../types/ActivityConfig";

// Mock react-navigation
jest.mock("@react-navigation/native", () => ({
  useNavigation: jest.fn(),
  CommonActions: {
    reset: jest.fn(),
  },
}));

// Mock useTranslatedText
jest.mock("../useTranslatedText", () => ({
  useTranslatedText: jest.fn(),
}));

// Mock validation utilities
jest.mock("../../utils/questionValidation", () => ({
  validateScreen: jest.fn(),
}));

import { useNavigation, CommonActions } from "@react-navigation/native";
import { useTranslatedText } from "../useTranslatedText";
import { validateScreen } from "../../utils/questionValidation";

describe("useQuestionNavigation", () => {
  const mockNavigate = jest.fn();
  const mockGoBack = jest.fn();
  const mockDispatch = jest.fn();
  const mockGetParent = jest.fn();
  const mockUseNavigation = useNavigation as jest.MockedFunction<
    typeof useNavigation
  >;
  const mockUseTranslatedText = useTranslatedText as jest.MockedFunction<
    typeof useTranslatedText
  >;
  const mockValidateScreen = validateScreen as jest.MockedFunction<
    typeof validateScreen
  >;

  const mockActivityData: ParsedActivityData = {
    screens: [
      {
        id: "screen-1",
        name: "Screen 1",
        order: 1,
        text: "Screen 1",
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
            displayProperties: [],
          },
        ],
        displayProperties: [],
      },
      {
        id: "screen-2",
        name: "Screen 2",
        order: 2,
        text: "Screen 2",
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
            displayProperties: [],
          },
        ],
        displayProperties: [],
      },
    ],
  };

  const mockActivityConfig: ActivityConfig = {
    summaryScreen: { showScreen: true },
  };

  const mockSetCurrentScreenIndex = jest.fn();
  const mockSetShowIntroduction = jest.fn();
  const mockSetShowReview = jest.fn();
  const mockSetShowCompletion = jest.fn();
  const mockSetCameFromReview = jest.fn();
  const mockSetErrors = jest.fn();
  const mockValidateCurrentScreen = jest.fn();
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigation.mockReturnValue({
      navigate: mockNavigate,
      goBack: mockGoBack,
      dispatch: mockDispatch,
      getParent: mockGetParent,
      canGoBack: jest.fn(() => true),
    } as any);
    mockUseTranslatedText.mockReturnValue({
      translatedText: "Validation Error",
      isTranslating: false,
    });
    mockValidateScreen.mockReturnValue({});
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  describe("handleNext", () => {
    it("returns to review when cameFromReview is true", () => {
      const { result } = renderHook(() =>
        useQuestionNavigation({
          activityData: mockActivityData,
          activityConfig: mockActivityConfig,
          currentScreenIndex: 0,
          cameFromReview: true,
          currentScreenValid: false,
          validateCurrentScreen: mockValidateCurrentScreen,
          onSubmit: mockOnSubmit,
          setErrors: mockSetErrors,
          setCurrentScreenIndex: mockSetCurrentScreenIndex,
          setShowIntroduction: mockSetShowIntroduction,
          setShowReview: mockSetShowReview,
          setShowCompletion: mockSetShowCompletion,
          setCameFromReview: mockSetCameFromReview,
        })
      );

      act(() => {
        result.current.handleNext();
      });

      expect(mockSetCameFromReview).toHaveBeenCalledWith(false);
      expect(mockSetShowReview).toHaveBeenCalledWith(true);
      expect(mockSetErrors).toHaveBeenCalledWith({});
      expect(mockValidateCurrentScreen).not.toHaveBeenCalled();
    });

    it("advances to next screen when validation passes", () => {
      mockValidateCurrentScreen.mockReturnValue(true);
      const { result } = renderHook(() =>
        useQuestionNavigation({
          activityData: mockActivityData,
          activityConfig: mockActivityConfig,
          currentScreenIndex: 0,
          cameFromReview: false,
          currentScreenValid: true,
          validateCurrentScreen: mockValidateCurrentScreen,
          onSubmit: mockOnSubmit,
          setErrors: mockSetErrors,
          setCurrentScreenIndex: mockSetCurrentScreenIndex,
          setShowIntroduction: mockSetShowIntroduction,
          setShowReview: mockSetShowReview,
          setShowCompletion: mockSetShowCompletion,
          setCameFromReview: mockSetCameFromReview,
        })
      );

      act(() => {
        result.current.handleNext();
      });

      expect(mockSetCurrentScreenIndex).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockSetErrors).toHaveBeenCalledWith({});
    });

    it("shows alert when validation fails", () => {
      mockValidateCurrentScreen.mockReturnValue(false);
      const { result } = renderHook(() =>
        useQuestionNavigation({
          activityData: mockActivityData,
          activityConfig: mockActivityConfig,
          currentScreenIndex: 0,
          cameFromReview: false,
          currentScreenValid: false,
          validateCurrentScreen: mockValidateCurrentScreen,
          onSubmit: mockOnSubmit,
          setErrors: mockSetErrors,
          setCurrentScreenIndex: mockSetCurrentScreenIndex,
          setShowIntroduction: mockSetShowIntroduction,
          setShowReview: mockSetShowReview,
          setShowCompletion: mockSetShowCompletion,
          setCameFromReview: mockSetCameFromReview,
        })
      );

      act(() => {
        result.current.handleNext();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Validation Error",
        expect.any(String)
      );
      expect(mockSetCurrentScreenIndex).not.toHaveBeenCalled();
    });
  });

  describe("handlePrevious", () => {
    it("returns to review when on first screen and cameFromReview", () => {
      const { result } = renderHook(() =>
        useQuestionNavigation({
          activityData: mockActivityData,
          activityConfig: mockActivityConfig,
          currentScreenIndex: 0,
          cameFromReview: true,
          currentScreenValid: true,
          validateCurrentScreen: mockValidateCurrentScreen,
          onSubmit: mockOnSubmit,
          setErrors: mockSetErrors,
          setCurrentScreenIndex: mockSetCurrentScreenIndex,
          setShowIntroduction: mockSetShowIntroduction,
          setShowReview: mockSetShowReview,
          setShowCompletion: mockSetShowCompletion,
          setCameFromReview: mockSetCameFromReview,
        })
      );

      act(() => {
        result.current.handlePrevious();
      });

      expect(mockSetCameFromReview).toHaveBeenCalledWith(false);
      expect(mockSetShowReview).toHaveBeenCalledWith(true);
      expect(mockSetErrors).toHaveBeenCalledWith({});
    });

    it("goes to previous screen when not on first screen", () => {
      const { result } = renderHook(() =>
        useQuestionNavigation({
          activityData: mockActivityData,
          activityConfig: mockActivityConfig,
          currentScreenIndex: 1,
          cameFromReview: false,
          currentScreenValid: true,
          validateCurrentScreen: mockValidateCurrentScreen,
          onSubmit: mockOnSubmit,
          setErrors: mockSetErrors,
          setCurrentScreenIndex: mockSetCurrentScreenIndex,
          setShowIntroduction: mockSetShowIntroduction,
          setShowReview: mockSetShowReview,
          setShowCompletion: mockSetShowCompletion,
          setCameFromReview: mockSetCameFromReview,
        })
      );

      act(() => {
        result.current.handlePrevious();
      });

      expect(mockSetCurrentScreenIndex).toHaveBeenCalledWith(
        expect.any(Function)
      );
      expect(mockSetErrors).toHaveBeenCalledWith({});
    });
  });

  describe("handleBegin", () => {
    it("hides introduction and sets screen index to 0", () => {
      const { result } = renderHook(() =>
        useQuestionNavigation({
          activityData: mockActivityData,
          activityConfig: mockActivityConfig,
          currentScreenIndex: -1,
          cameFromReview: false,
          currentScreenValid: true,
          validateCurrentScreen: mockValidateCurrentScreen,
          onSubmit: mockOnSubmit,
          setErrors: mockSetErrors,
          setCurrentScreenIndex: mockSetCurrentScreenIndex,
          setShowIntroduction: mockSetShowIntroduction,
          setShowReview: mockSetShowReview,
          setShowCompletion: mockSetShowCompletion,
          setCameFromReview: mockSetCameFromReview,
        })
      );

      act(() => {
        result.current.handleBegin();
      });

      expect(mockSetShowIntroduction).toHaveBeenCalledWith(false);
      expect(mockSetCurrentScreenIndex).toHaveBeenCalledWith(0);
    });
  });

  describe("handleBackToQuestions", () => {
    it("hides review and goes to last screen", () => {
      const { result } = renderHook(() =>
        useQuestionNavigation({
          activityData: mockActivityData,
          activityConfig: mockActivityConfig,
          currentScreenIndex: 0,
          cameFromReview: false,
          currentScreenValid: true,
          validateCurrentScreen: mockValidateCurrentScreen,
          onSubmit: mockOnSubmit,
          setErrors: mockSetErrors,
          setCurrentScreenIndex: mockSetCurrentScreenIndex,
          setShowIntroduction: mockSetShowIntroduction,
          setShowReview: mockSetShowReview,
          setShowCompletion: mockSetShowCompletion,
          setCameFromReview: mockSetCameFromReview,
        })
      );

      act(() => {
        result.current.handleBackToQuestions();
      });

      expect(mockSetShowReview).toHaveBeenCalledWith(false);
      expect(mockSetCurrentScreenIndex).toHaveBeenCalledWith(1);
    });
  });

  describe("handleEditQuestion", () => {
    it("navigates to screen containing question and sets cameFromReview", () => {
      const { result } = renderHook(() =>
        useQuestionNavigation({
          activityData: mockActivityData,
          activityConfig: mockActivityConfig,
          currentScreenIndex: 0,
          cameFromReview: false,
          currentScreenValid: true,
          validateCurrentScreen: mockValidateCurrentScreen,
          onSubmit: mockOnSubmit,
          setErrors: mockSetErrors,
          setCurrentScreenIndex: mockSetCurrentScreenIndex,
          setShowIntroduction: mockSetShowIntroduction,
          setShowReview: mockSetShowReview,
          setShowCompletion: mockSetShowCompletion,
          setCameFromReview: mockSetCameFromReview,
        })
      );

      act(() => {
        result.current.handleEditQuestion("q1");
      });

      expect(mockSetShowReview).toHaveBeenCalledWith(false);
      expect(mockSetCurrentScreenIndex).toHaveBeenCalledWith(0);
      expect(mockSetCameFromReview).toHaveBeenCalledWith(true);
    });

    it("does nothing when question not found", () => {
      const { result } = renderHook(() =>
        useQuestionNavigation({
          activityData: mockActivityData,
          activityConfig: mockActivityConfig,
          currentScreenIndex: 0,
          cameFromReview: false,
          currentScreenValid: true,
          validateCurrentScreen: mockValidateCurrentScreen,
          onSubmit: mockOnSubmit,
          setErrors: mockSetErrors,
          setCurrentScreenIndex: mockSetCurrentScreenIndex,
          setShowIntroduction: mockSetShowIntroduction,
          setShowReview: mockSetShowReview,
          setShowCompletion: mockSetShowCompletion,
          setCameFromReview: mockSetCameFromReview,
        })
      );

      act(() => {
        result.current.handleEditQuestion("q999");
      });

      expect(mockSetCurrentScreenIndex).not.toHaveBeenCalled();
    });
  });

  describe("handleReviewOrSubmit", () => {
    it("returns to review when cameFromReview is true", () => {
      const { result } = renderHook(() =>
        useQuestionNavigation({
          activityData: mockActivityData,
          activityConfig: mockActivityConfig,
          currentScreenIndex: 0,
          cameFromReview: true,
          currentScreenValid: false,
          validateCurrentScreen: mockValidateCurrentScreen,
          onSubmit: mockOnSubmit,
          setErrors: mockSetErrors,
          setCurrentScreenIndex: mockSetCurrentScreenIndex,
          setShowIntroduction: mockSetShowIntroduction,
          setShowReview: mockSetShowReview,
          setShowCompletion: mockSetShowCompletion,
          setCameFromReview: mockSetCameFromReview,
        })
      );

      act(() => {
        result.current.handleReviewOrSubmit();
      });

      expect(mockSetCameFromReview).toHaveBeenCalledWith(false);
      expect(mockSetShowReview).toHaveBeenCalledWith(true);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("shows review screen when validation passes and summary screen is enabled", () => {
      mockValidateCurrentScreen.mockReturnValue(true);
      const { result } = renderHook(() =>
        useQuestionNavigation({
          activityData: mockActivityData,
          activityConfig: mockActivityConfig,
          currentScreenIndex: 0,
          cameFromReview: false,
          currentScreenValid: true,
          validateCurrentScreen: mockValidateCurrentScreen,
          onSubmit: mockOnSubmit,
          setErrors: mockSetErrors,
          setCurrentScreenIndex: mockSetCurrentScreenIndex,
          setShowIntroduction: mockSetShowIntroduction,
          setShowReview: mockSetShowReview,
          setShowCompletion: mockSetShowCompletion,
          setCameFromReview: mockSetCameFromReview,
        })
      );

      act(() => {
        result.current.handleReviewOrSubmit();
      });

      expect(mockSetShowReview).toHaveBeenCalledWith(true);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it("calls onSubmit when validation passes and summary screen is disabled", () => {
      mockValidateCurrentScreen.mockReturnValue(true);
      const { result } = renderHook(() =>
        useQuestionNavigation({
          activityData: mockActivityData,
          activityConfig: { summaryScreen: { showScreen: false } },
          currentScreenIndex: 0,
          cameFromReview: false,
          currentScreenValid: true,
          validateCurrentScreen: mockValidateCurrentScreen,
          onSubmit: mockOnSubmit,
          setErrors: mockSetErrors,
          setCurrentScreenIndex: mockSetCurrentScreenIndex,
          setShowIntroduction: mockSetShowIntroduction,
          setShowReview: mockSetShowReview,
          setShowCompletion: mockSetShowCompletion,
          setCameFromReview: mockSetCameFromReview,
        })
      );

      act(() => {
        result.current.handleReviewOrSubmit();
      });

      expect(mockOnSubmit).toHaveBeenCalled();
      expect(mockSetShowReview).not.toHaveBeenCalled();
    });

    it("shows alert when validation fails", () => {
      mockValidateCurrentScreen.mockReturnValue(false);
      const { result } = renderHook(() =>
        useQuestionNavigation({
          activityData: mockActivityData,
          activityConfig: mockActivityConfig,
          currentScreenIndex: 0,
          cameFromReview: false,
          currentScreenValid: false,
          validateCurrentScreen: mockValidateCurrentScreen,
          onSubmit: mockOnSubmit,
          setErrors: mockSetErrors,
          setCurrentScreenIndex: mockSetCurrentScreenIndex,
          setShowIntroduction: mockSetShowIntroduction,
          setShowReview: mockSetShowReview,
          setShowCompletion: mockSetShowCompletion,
          setCameFromReview: mockSetCameFromReview,
        })
      );

      act(() => {
        result.current.handleReviewOrSubmit();
      });

      expect(Alert.alert).toHaveBeenCalledWith(
        "Validation Error",
        expect.any(String)
      );
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe("handleBack", () => {
    it("returns to review when cameFromReview is true", () => {
      const { result } = renderHook(() =>
        useQuestionNavigation({
          activityData: mockActivityData,
          activityConfig: mockActivityConfig,
          currentScreenIndex: 0,
          cameFromReview: true,
          currentScreenValid: true,
          validateCurrentScreen: mockValidateCurrentScreen,
          onSubmit: mockOnSubmit,
          setErrors: mockSetErrors,
          setCurrentScreenIndex: mockSetCurrentScreenIndex,
          setShowIntroduction: mockSetShowIntroduction,
          setShowReview: mockSetShowReview,
          setShowCompletion: mockSetShowCompletion,
          setCameFromReview: mockSetCameFromReview,
        })
      );

      act(() => {
        result.current.handleBack();
      });

      expect(mockSetCameFromReview).toHaveBeenCalledWith(false);
      expect(mockSetShowReview).toHaveBeenCalledWith(true);
      expect(mockGoBack).not.toHaveBeenCalled();
    });

    it("calls navigation.goBack when not from review", () => {
      const { result } = renderHook(() =>
        useQuestionNavigation({
          activityData: mockActivityData,
          activityConfig: mockActivityConfig,
          currentScreenIndex: 0,
          cameFromReview: false,
          currentScreenValid: true,
          validateCurrentScreen: mockValidateCurrentScreen,
          onSubmit: mockOnSubmit,
          setErrors: mockSetErrors,
          setCurrentScreenIndex: mockSetCurrentScreenIndex,
          setShowIntroduction: mockSetShowIntroduction,
          setShowReview: mockSetShowReview,
          setShowCompletion: mockSetShowCompletion,
          setCameFromReview: mockSetCameFromReview,
        })
      );

      act(() => {
        result.current.handleBack();
      });

      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  describe("handleCompletionDone", () => {
    it("attempts multiple navigation strategies", () => {
      const { result } = renderHook(() =>
        useQuestionNavigation({
          activityData: mockActivityData,
          activityConfig: mockActivityConfig,
          currentScreenIndex: 0,
          cameFromReview: false,
          currentScreenValid: true,
          validateCurrentScreen: mockValidateCurrentScreen,
          onSubmit: mockOnSubmit,
          setErrors: mockSetErrors,
          setCurrentScreenIndex: mockSetCurrentScreenIndex,
          setShowIntroduction: mockSetShowIntroduction,
          setShowReview: mockSetShowReview,
          setShowCompletion: mockSetShowCompletion,
          setCameFromReview: mockSetCameFromReview,
        })
      );

      act(() => {
        result.current.handleCompletionDone();
      });

      // Should attempt navigation
      expect(mockNavigate).toHaveBeenCalled();
    });

    it("falls back to CommonActions.reset when navigate fails", () => {
      mockNavigate.mockImplementation(() => {
        throw new Error("Navigate failed");
      });
      const { result } = renderHook(() =>
        useQuestionNavigation({
          activityData: mockActivityData,
          activityConfig: mockActivityConfig,
          currentScreenIndex: 0,
          cameFromReview: false,
          currentScreenValid: true,
          validateCurrentScreen: mockValidateCurrentScreen,
          onSubmit: mockOnSubmit,
          setErrors: mockSetErrors,
          setCurrentScreenIndex: mockSetCurrentScreenIndex,
          setShowIntroduction: mockSetShowIntroduction,
          setShowReview: mockSetShowReview,
          setShowCompletion: mockSetShowCompletion,
          setCameFromReview: mockSetCameFromReview,
        })
      );

      act(() => {
        result.current.handleCompletionDone();
      });

      expect(mockDispatch).toHaveBeenCalled();
    });
  });
});
