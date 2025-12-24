import React from "react";
import { StyleSheet, View } from "react-native";
import { AppColors } from "../../constants/AppColors";
import { Shadows } from "../../constants/AppStyles";
import { useQuestionScreenButtons } from "../../hooks/useQuestionScreenButtons";
import { ActivityConfig } from "../../types/ActivityConfig";
import { TranslatedText } from "../TranslatedText";
import { Button } from "../ui/Button";

interface QuestionScreenButtonsProps {
  currentScreenIndex: number;
  isLastScreen: boolean;
  currentScreenValid: boolean;
  cameFromReview: boolean;
  displayProperties?: Record<string, string>;
  activityConfig?: ActivityConfig | null;
  onPrevious?: () => void;
  onNext?: () => void;
  onReviewOrSubmit?: () => void;
}

/**
 * Navigation buttons component for question screens
 * Handles Previous, Next, and Submit/Review buttons with custom styling
 */
export const QuestionScreenButtons: React.FC<QuestionScreenButtonsProps> = ({
  currentScreenIndex,
  isLastScreen,
  currentScreenValid,
  cameFromReview,
  displayProperties,
  activityConfig,
  onPrevious,
  onNext,
  onReviewOrSubmit,
}) => {
  const {
    buttonContainerStyle,
    buttonText,
    isSubmitButtonEnabled,
    submitButtonDisabled,
  } = useQuestionScreenButtons({
    displayProperties,
    activityConfig,
    currentScreenValid,
    cameFromReview,
    isLastScreen,
  });

  return (
    <View style={buttonContainerStyle}>
      {currentScreenIndex > 0 && onPrevious && (
        <Button
          variant="ghost"
          style={[styles.navButton, styles.previousButton]}
          onPress={onPrevious}
        >
          <TranslatedText text="Previous" style={styles.navButtonText} />
        </Button>
      )}

      {isLastScreen ? (
        <Button
          variant="ghost"
          style={[
            styles.navButton,
            styles.submitButton,
            isSubmitButtonEnabled
              ? styles.submitButtonEnabled
              : styles.submitButtonDisabled,
          ]}
          onPress={onReviewOrSubmit}
          disabled={submitButtonDisabled}
        >
          <TranslatedText
            text={buttonText}
            style={[
              styles.navButtonText,
              currentScreenValid
                ? styles.submitButtonTextEnabled
                : styles.submitButtonTextDisabled,
            ]}
          />
        </Button>
      ) : (
        <Button
          variant="ghost"
          style={[styles.navButton, styles.nextButton]}
          onPress={onNext}
        >
          <TranslatedText
            text="Next"
            style={[styles.navButtonText, styles.nextButtonText]}
          />
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navButton: {
    flex: 1,
    paddingVertical: 16, // Increased padding for better touch target
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50, // Ensure minimum height for visibility
  },
  previousButton: {
    backgroundColor: AppColors.powderGray,
  },
  nextButton: {
    backgroundColor: AppColors.CIBlue,
  },
  submitButton: {
    backgroundColor: AppColors.powderGray,
  },
  submitButtonEnabled: {
    backgroundColor: AppColors.CIBlue,
    ...Shadows.card, // Add shadow to enabled submit button for emphasis
  },
  submitButtonDisabled: {
    opacity: 0.5,
    backgroundColor: AppColors.ltGray,
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: AppColors.mediumDarkGray,
  },
  nextButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: "600",
  },
  submitButtonTextEnabled: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: "700", // Bolder for submit button
  },
  submitButtonTextDisabled: {
    color: AppColors.mediumDarkGray,
    fontSize: 16,
    fontWeight: "600",
  },
});
