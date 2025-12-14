import { useMemo } from "react";
import { ViewStyle } from "react-native";
import { ActivityConfig } from "../types/ActivityConfig";
import { useRTL } from "./useRTL";

interface UseQuestionScreenButtonsProps {
  displayProperties?: Record<string, string>;
  activityConfig?: ActivityConfig | null;
  currentScreenValid: boolean;
  cameFromReview: boolean;
  isLastScreen: boolean;
}

interface UseQuestionScreenButtonsReturn {
  buttonContainerStyle: ViewStyle;
  buttonText: string;
  isSubmitButtonEnabled: boolean;
  submitButtonDisabled: boolean;
}

/**
 * Hook for managing question screen button logic and styling
 */
export const useQuestionScreenButtons = ({
  displayProperties = {},
  activityConfig,
  currentScreenValid,
  cameFromReview,
  isLastScreen,
}: UseQuestionScreenButtonsProps): UseQuestionScreenButtonsReturn => {
  const { rtlStyle, isRTL } = useRTL();

  // Extract button styling from display properties
  const buttonWidth = displayProperties.width || "100%";
  const buttonMarginLeft = displayProperties.marginLeft
    ? parseInt(displayProperties.marginLeft, 10)
    : 0;
  const buttonMarginRight = displayProperties.marginRight
    ? parseInt(displayProperties.marginRight, 10)
    : 0;
  const buttonPaddingLeft = displayProperties.paddingLeft
    ? parseInt(displayProperties.paddingLeft, 10)
    : 20;
  const buttonPaddingRight = displayProperties.paddingRight
    ? parseInt(displayProperties.paddingRight, 10)
    : 20;

  // Build button container style using display properties and RTL
  const buttonContainerStyle = useMemo(
    () =>
      rtlStyle({
        width:
          buttonWidth === "100%"
            ? "100%"
            : parseFloat(buttonWidth) || undefined,
        marginLeft: buttonMarginLeft,
        marginRight: buttonMarginRight,
        paddingLeft: buttonPaddingLeft,
        paddingRight: buttonPaddingRight,
        marginTop: 24,
        marginBottom: 16,
        flexDirection: isRTL ? "row-reverse" : "row",
        gap: 12,
      }) as ViewStyle,
    [
      rtlStyle,
      isRTL,
      buttonWidth,
      buttonMarginLeft,
      buttonMarginRight,
      buttonPaddingLeft,
      buttonPaddingRight,
    ]
  );

  // Determine button text based on activity config
  const buttonText = useMemo(() => {
    return activityConfig?.summaryScreen?.showScreen ? "Review" : "Submit";
  }, [activityConfig]);

  // Determine if submit button should be enabled
  const isSubmitButtonEnabled = currentScreenValid || cameFromReview;
  const submitButtonDisabled = !currentScreenValid && !cameFromReview;

  return {
    buttonContainerStyle,
    buttonText,
    isSubmitButtonEnabled,
    submitButtonDisabled,
  };
};
