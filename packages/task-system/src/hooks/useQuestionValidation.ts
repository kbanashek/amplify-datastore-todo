import { useMemo } from "react";
import { ParsedActivityData } from "@utils/activityParser";
import { isScreenValid, validateScreen } from "@utils/questionValidation";

export interface UseQuestionValidationReturn {
  currentScreenValid: boolean;
  validateCurrentScreen: () => boolean;
}

export interface UseQuestionValidationOptions {
  activityData: ParsedActivityData | null;
  currentScreenIndex: number;
  answers: Record<string, any>;
  setErrors: (errors: Record<string, string[]>) => void;
}

/**
 * Hook for question validation
 * Provides validation state and validation functions
 */
export const useQuestionValidation = ({
  activityData,
  currentScreenIndex,
  answers,
  setErrors,
}: UseQuestionValidationOptions): UseQuestionValidationReturn => {
  // Memoized validation result for current screen
  const currentScreenValid = useMemo(() => {
    if (
      !activityData ||
      currentScreenIndex < 0 ||
      currentScreenIndex >= activityData.screens.length
    ) {
      return true; // Introduction/review screens don't need validation
    }

    const currentScreen = activityData.screens[currentScreenIndex];
    return isScreenValid(currentScreen, answers);
  }, [activityData, currentScreenIndex, answers]);

  const validateCurrentScreen = (): boolean => {
    if (
      !activityData ||
      currentScreenIndex < 0 ||
      currentScreenIndex >= activityData.screens.length
    ) {
      return true; // Introduction/review screens don't need validation
    }

    const currentScreen = activityData.screens[currentScreenIndex];
    const screenErrors = validateScreen(currentScreen, answers);
    setErrors(screenErrors);

    return Object.keys(screenErrors).length === 0;
  };

  return {
    currentScreenValid,
    validateCurrentScreen,
  };
};
