/**
 * NavigationButtons component module.
 *
 * @module NavigationButtons
 */

import { TranslatedText } from "@components/TranslatedText";
import { AppColors } from "@constants/AppColors";
import { AppFonts } from "@constants/AppFonts";
import { useRTL } from "@hooks/useRTL";
import { useTranslatedText } from "@hooks/useTranslatedText";
import { ActivityConfig } from "@task-types/ActivityConfig";
import { isIOS } from "@utils/platform";
import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";

/**
 * Props for the NavigationButtons component
 */
interface NavigationButtonsProps {
  currentScreenIndex: number;
  totalScreens: number;
  currentScreenValid: boolean;
  activityConfig: ActivityConfig | null;
  onPrevious: () => void;
  onNext: () => void;
  onReviewOrSubmit: () => void;
  tabBarHeight?: number;
  bottomInset: number;
}

/**
 * NavigationButtons component.
 *
 * @param props - Component props
 * @returns Rendered NavigationButtons component
 */
export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  currentScreenIndex,
  totalScreens,
  currentScreenValid,
  activityConfig,
  onPrevious,
  onNext,
  onReviewOrSubmit,
  tabBarHeight,
  bottomInset,
}) => {
  const { rtlStyle } = useRTL();
  const isLastScreen = currentScreenIndex === totalScreens - 1;
  const { translatedText: reviewText } = useTranslatedText("Review");
  const { translatedText: submitText } = useTranslatedText("Submit");
  const buttonText = activityConfig?.summaryScreen?.showScreen
    ? reviewText
    : submitText;

  return (
    <View
      style={[
        styles.navigationContainer,
        rtlStyle(styles.navigationContainer) as ViewStyle,
        {
          paddingBottom: Math.max(bottomInset, 20),
          marginBottom: isIOS() ? Math.max(tabBarHeight || 60, 60) : 0,
        },
      ]}
    >
      {currentScreenIndex > 0 && (
        <TouchableOpacity style={styles.navButton} onPress={onPrevious}>
          <TranslatedText text="Previous" style={styles.navButtonText} />
        </TouchableOpacity>
      )}

      {isLastScreen ? (
        <TouchableOpacity
          style={[
            styles.navButton,
            currentScreenValid
              ? {
                  backgroundColor: "#3498db",
                }
              : [styles.reviewButton, styles.submitButtonDisabled],
          ]}
          onPress={onReviewOrSubmit}
          disabled={!currentScreenValid}
        >
          <TranslatedText
            text={buttonText}
            style={[
              styles.navButtonText,
              currentScreenValid ? { color: "#fff" } : undefined,
            ]}
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={[
            styles.navButton,
            currentScreenValid
              ? styles.nextButton
              : styles.nextButtonDisabled,
          ]}
          onPress={onNext}
          disabled={!currentScreenValid}
        >
          <TranslatedText
            text="Next"
            style={[
              styles.navButtonText,
              currentScreenValid
                ? styles.nextButtonText
                : styles.nextButtonTextDisabled,
            ]}
          />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  navigationContainer: {
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#dfe4ea",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
    minHeight: 70,
  },
  navButton: {
    flex: 1,
    backgroundColor: AppColors.lightGray,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  navButtonText: {
    ...AppFonts.button,
    color: AppColors.darkGray,
  },
  nextButton: {
    backgroundColor: AppColors.CIBlue,
  },
  nextButtonDisabled: {
    backgroundColor: AppColors.lightGray,
    opacity: 0.6,
  },
  nextButtonText: {
    ...AppFonts.button,
    color: AppColors.white,
  },
  nextButtonTextDisabled: {
    ...AppFonts.button,
    color: AppColors.darkGray,
  },
  reviewButton: {
    backgroundColor: AppColors.lightGray,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
});
