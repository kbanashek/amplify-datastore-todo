import { useRouter } from "expo-router";
import { useCallback } from "react";
import { Alert } from "react-native";
import { useTranslatedText } from "./useTranslatedText";
import { ActivityConfig } from "../types/ActivityConfig";
import { ParsedActivityData } from "../utils/activityParser";

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
  setErrors,
  setCurrentScreenIndex,
  setShowIntroduction,
  setShowReview,
  setShowCompletion,
  setCameFromReview,
}: UseQuestionNavigationOptions): UseQuestionNavigationReturn => {
  const router = useRouter();

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
      setCameFromReview(false);
      setShowReview(true);
      setErrors({});
      return;
    }

    // Normal flow: validate before proceeding
    if (validateCurrentScreen()) {
      setCurrentScreenIndex(prev => prev + 1);
      setErrors({});
    } else {
      Alert.alert(validationErrorTitle, validationErrorMessage);
    }
  }, [
    cameFromReview,
    validateCurrentScreen,
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
      setCameFromReview(false);
      setShowReview(true);
      setErrors({});
      return;
    }

    // Normal flow: validate before proceeding
    if (validateCurrentScreen()) {
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
    setErrors,
    setCameFromReview,
    setShowReview,
    validationErrorTitle,
    validationReviewMessage,
  ]);

  const handlePrevious = useCallback(() => {
    // If we're on the first screen and came from review, go back to review
    if (cameFromReview && currentScreenIndex === 0) {
      setCameFromReview(false);
      setShowReview(true);
      setErrors({});
      return;
    }
    setCurrentScreenIndex(prev => prev - 1);
    setErrors({});
  }, [
    currentScreenIndex,
    cameFromReview,
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
    router.replace("/(tabs)/" as any);
  }, [router]);

  const handleBack = useCallback(() => {
    // If we came from review, go back to review instead of dashboard
    if (cameFromReview) {
      setCameFromReview(false);
      setShowReview(true);
      return;
    }
    router.replace("/(tabs)/" as any);
  }, [router, cameFromReview, setCameFromReview, setShowReview]);

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
