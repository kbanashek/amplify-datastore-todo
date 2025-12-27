/**
 * NavigationButtons component module.
 *
 * @module NavigationButtons
 */

import React from "react";
import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native";
import { useRTL } from "@hooks/useRTL";
import { useTranslatedText } from "@hooks/useTranslatedText";
import { ActivityConfig } from "@task-types/ActivityConfig";
import { isIOS } from "@utils/platform";
import { TranslatedText } from "@components/TranslatedText";

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
          style={[styles.navButton, styles.nextButton]}
          onPress={onNext}
        >
          <TranslatedText
            text="Next"
            style={[styles.navButtonText, styles.nextButtonText]}
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
    backgroundColor: "#ecf0f1",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  navButtonText: {
    color: "#57606f",
    fontSize: 16,
    fontWeight: "600",
  },
  nextButton: {
    backgroundColor: "#3498db",
  },
  nextButtonText: {
    color: "#fff",
  },
  reviewButton: {
    backgroundColor: "#ecf0f1",
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
});
