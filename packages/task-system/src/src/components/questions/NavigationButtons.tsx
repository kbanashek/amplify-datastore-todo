import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityConfig } from "../../types/ActivityConfig";
import { useRTL } from "../../hooks/useRTL";
import { TranslatedText } from "../TranslatedText";

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
  const buttonText = activityConfig?.summaryScreen?.showScreen
    ? "Review"
    : "Submit";

  return (
    <View
      style={[
        styles.navigationContainer,
        rtlStyle(styles.navigationContainer),
        {
          paddingBottom: Math.max(bottomInset, 20),
          marginBottom:
            Platform.OS === "ios" ? Math.max(tabBarHeight || 60, 60) : 0,
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
