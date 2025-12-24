import { CommonActions, useNavigation } from "@react-navigation/native";
import { useCallback } from "react";
import { Alert } from "react-native";
import { ActivityConfig } from "../types/ActivityConfig";
import { ParsedActivityData } from "../utils/activityParser";
import { getServiceLogger } from "../utils/serviceLogger";
import { useTranslatedText } from "./useTranslatedText";

const logger = getServiceLogger("useQuestionNavigation");

export interface UseQuestionNavigationReturn {
  handleNext: () => void;
  handlePrevious: () => void;
  handleBegin: () => void;
  handleBackToQuestions: () => void;
  handleEditQuestion: (questionId: string) => void;
  handleReviewOrSubmit: () => void;
  handleCompletionDone: () => void;
  handleBack: () => void;
}

export interface UseQuestionNavigationOptions {
  activityData: ParsedActivityData | null;
  activityConfig: ActivityConfig | null;
  currentScreenIndex: number;
  cameFromReview: boolean;
  currentScreenValid: boolean;
  validateCurrentScreen: () => boolean;
  onSubmit: () => Promise<void>;
  onLeaveScreen?: () => void;
  setErrors: (errors: Record<string, string[]>) => void;
  setCurrentScreenIndex: React.Dispatch<React.SetStateAction<number>>;
  setShowIntroduction: React.Dispatch<React.SetStateAction<boolean>>;
  setShowReview: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCompletion: React.Dispatch<React.SetStateAction<boolean>>;
  setCameFromReview: React.Dispatch<React.SetStateAction<boolean>>;
}

/**
 * Hook for managing question screen navigation
 * Handles screen transitions, review flow, and navigation state
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
