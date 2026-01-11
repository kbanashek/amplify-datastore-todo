import { CommonActions, useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { Alert } from "react-native";
import { ActivityConfig } from "@task-types/ActivityConfig";
import { ParsedActivityData } from "@utils/parsers/activityParser";
import { getServiceLogger } from "@utils/logging/serviceLogger";
import { useTranslatedText } from "@hooks/useTranslatedText";

const logger = getServiceLogger("useQuestionNavigation");

/**
 * Return type for the useQuestionNavigation hook.
 */
export interface UseQuestionNavigationReturn {
  /** Navigate to the next screen or back to review if editing */
  handleNext: () => void;
  /** Navigate to the previous screen */
  handlePrevious: () => void;
  /** Start the questionnaire from the introduction screen */
  handleBegin: () => void;
  /** Return from review screen to the last question screen */
  handleBackToQuestions: () => void;
  /** Navigate to edit a specific question from the review screen */
  handleEditQuestion: (questionId: string) => void;
  /** Show review screen or submit directly based on config */
  handleReviewOrSubmit: () => void;
  /** Navigate away after completion (reset to dashboard) */
  handleCompletionDone: () => void;
  /** Handle back button press with review flow awareness */
  handleBack: () => void;
}

/**
 * Configuration options for the useQuestionNavigation hook.
 */
export interface UseQuestionNavigationOptions {
  /** Parsed activity data containing screens and questions */
  activityData: ParsedActivityData | null;
  /** Activity configuration including summary screen settings */
  activityConfig: ActivityConfig | null;
  /** Current screen index in the question flow */
  currentScreenIndex: number;
  /** Whether user navigated here from the review screen */
  cameFromReview: boolean;
  /** Whether the current screen passes validation */
  currentScreenValid: boolean;
  /** Function to validate the current screen */
  validateCurrentScreen: () => boolean;
  /** Async function to submit all answers */
  onSubmit: () => Promise<void>;
  /** Optional callback when leaving the current screen */
  onLeaveScreen?: () => void;
  /** Setter for validation errors */
  setErrors: (errors: Record<string, string[]>) => void;
  /** Setter for current screen index */
  setCurrentScreenIndex: React.Dispatch<React.SetStateAction<number>>;
  /** Setter for introduction screen visibility */
  setShowIntroduction: React.Dispatch<React.SetStateAction<boolean>>;
  /** Setter for review screen visibility */
  setShowReview: React.Dispatch<React.SetStateAction<boolean>>;
  /** Setter for completion screen visibility */
  setShowCompletion: React.Dispatch<React.SetStateAction<boolean>>;
  /** Setter for review flow tracking */
  setCameFromReview: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * React hook for managing question screen navigation and flow control.
 *
 * Handles all navigation logic for the question flow including:
 * - Forward/backward navigation between screens
 * - Introduction → Questions → Review → Completion flow
 * - Edit mode from review screen (tracks `cameFromReview` state)
 * - Validation before navigation
 * - Alert dialogs for validation errors
 *
 * @param options - Navigation configuration and state setters
 * @returns Object containing navigation handler functions
 *
 * @example
 * ```tsx
 * const {
 *   handleNext,
 *   handlePrevious,
 *   handleReviewOrSubmit,
 * } = useQuestionNavigation({
 *   activityData,
 *   activityConfig,
 *   currentScreenIndex,
 *   cameFromReview,
 *   currentScreenValid,
 *   validateCurrentScreen,
 *   onSubmit: handleSubmitAnswers,
 *   setErrors,
 *   setCurrentScreenIndex,
 *   setShowIntroduction,
 *   setShowReview,
 *   setShowCompletion,
 *   setCameFromReview,
 * });
 * ```
 */
export const useQuestionNavigation = ({
  activityData,
  activityConfig,
  currentScreenIndex,
  cameFromReview,
  currentScreenValid,
  validateCurrentScreen,
  onSubmit,
  onLeaveScreen,
  setErrors,
  setCurrentScreenIndex,
  setShowIntroduction,
  setShowReview,
  setShowCompletion,
  setCameFromReview,
}: UseQuestionNavigationOptions): UseQuestionNavigationReturn => {
  const navigation = useNavigation<any>();

  // Translate validation messages
  const { translatedText: validationErrorTitle } =
    useTranslatedText("Validation Error");
  const { translatedText: validationErrorMessage } = useTranslatedText(
    "Please answer all required questions before continuing."
  );
  const { translatedText: validationReviewMessage } = useTranslatedText(
    "Please answer all required questions before reviewing."
  );

  const handleNext = useCallback(() => {
    // If we came from review, always return to review screen (bypass validation)
    if (cameFromReview) {
      onLeaveScreen?.();
      setCameFromReview(false);
      setShowReview(true);
      setErrors({});
      return;
    }

    // Normal flow: validate before proceeding
    if (validateCurrentScreen()) {
      onLeaveScreen?.();
      setCurrentScreenIndex(prev => prev + 1);
      setErrors({});
    } else {
      Alert.alert(validationErrorTitle, validationErrorMessage);
    }
  }, [
    cameFromReview,
    validateCurrentScreen,
    onLeaveScreen,
    setErrors,
    setCameFromReview,
    setShowReview,
    setCurrentScreenIndex,
    validationErrorTitle,
    validationErrorMessage,
  ]);

  const handleReviewOrSubmit = useCallback(() => {
    // If we came from review, always go back to review screen
    if (cameFromReview) {
      onLeaveScreen?.();
      setCameFromReview(false);
      setShowReview(true);
      setErrors({});
      return;
    }

    // Normal flow: validate before proceeding
    if (validateCurrentScreen()) {
      onLeaveScreen?.();
      if (activityConfig?.summaryScreen?.showScreen) {
        setShowReview(true);
      } else {
        onSubmit();
      }
    } else {
      Alert.alert(validationErrorTitle, validationReviewMessage);
    }
  }, [
    cameFromReview,
    activityConfig,
    validateCurrentScreen,
    onSubmit,
    onLeaveScreen,
    setErrors,
    setCameFromReview,
    setShowReview,
    validationErrorTitle,
    validationReviewMessage,
  ]);

  const handlePrevious = useCallback(() => {
    // If we're on the first screen and came from review, go back to review
    if (cameFromReview && currentScreenIndex === 0) {
      onLeaveScreen?.();
      setCameFromReview(false);
      setShowReview(true);
      setErrors({});
      return;
    }
    onLeaveScreen?.();
    setCurrentScreenIndex(prev => prev - 1);
    setErrors({});
  }, [
    currentScreenIndex,
    cameFromReview,
    onLeaveScreen,
    setErrors,
    setCameFromReview,
    setShowReview,
    setCurrentScreenIndex,
  ]);

  const handleBegin = useCallback(() => {
    setShowIntroduction(false);
    setCurrentScreenIndex(0);
  }, [setShowIntroduction, setCurrentScreenIndex]);

  const handleBackToQuestions = useCallback(() => {
    setShowReview(false);
    if (activityData) {
      setCurrentScreenIndex(activityData.screens.length - 1);
    }
  }, [activityData, setShowReview, setCurrentScreenIndex]);

  const handleEditQuestion = useCallback(
    (questionId: string) => {
      if (!activityData) return;

      // Find which screen contains this question
      let targetScreenIndex = -1;
      for (let i = 0; i < activityData.screens.length; i++) {
        const screen = activityData.screens[i];
        const hasQuestion = screen.elements.some(
          (el: ParsedActivityData["screens"][number]["elements"][number]) =>
            el.question.id === questionId
        );
        if (hasQuestion) {
          targetScreenIndex = i;
          break;
        }
      }

      if (targetScreenIndex >= 0) {
        setShowReview(false);
        setCurrentScreenIndex(targetScreenIndex);
        setCameFromReview(true);
      }
    },
    [activityData, setShowReview, setCurrentScreenIndex, setCameFromReview]
  );

  const handleCompletionDone = useCallback(() => {
    try {
      // Module-only behavior: reset back to the module dashboard route.
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "TaskDashboard" as never }],
        })
      );
    } catch (error) {
      logger.warn("Failed to reset to module dashboard", error);
      // Last resort: try goBack
      try {
        const navAny = navigation as any;
        if (navAny.canGoBack && navAny.canGoBack()) {
          navAny.goBack();
        }
      } catch (fallbackError) {
        logger.error("All navigation methods failed", fallbackError);
      }
    }
  }, [navigation]);

  const handleBack = useCallback(() => {
    // If we came from review, go back to review instead of dashboard
    if (cameFromReview) {
      setCameFromReview(false);
      setShowReview(true);
      return;
    }
    navigation.goBack?.();
  }, [navigation, cameFromReview, setCameFromReview, setShowReview]);

  return {
    handleNext,
    handlePrevious,
    handleBegin,
    handleBackToQuestions,
    handleEditQuestion,
    handleReviewOrSubmit,
    handleCompletionDone,
    handleBack,
  };
};
