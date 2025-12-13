import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useRTL } from "../../hooks/useRTL";
import { AppColors } from "../../constants/AppColors";
import { Shadows, TextStyles } from "../../constants/AppStyles";
import { ParsedActivityData } from "../../utils/activityParser";
import { TranslatedText } from "../TranslatedText";
import { QuestionRenderer } from "./QuestionRenderer";

interface QuestionScreenContentProps {
  activityData: ParsedActivityData;
  currentScreenIndex: number;
  answers: Record<string, any>;
  errors: Record<string, string[]>;
  onAnswerChange: (questionId: string, answer: any) => void;
  bottomInset: number;
  currentScreenValid: boolean;
  cameFromReview?: boolean;
  isLastScreen: boolean;
  onPrevious?: () => void;
  onNext?: () => void;
  onReviewOrSubmit?: () => void;
  activityConfig?: any;
}

export const QuestionScreenContent: React.FC<QuestionScreenContentProps> = ({
  activityData,
  currentScreenIndex,
  answers,
  errors,
  onAnswerChange,
  bottomInset,
  currentScreenValid,
  cameFromReview = false,
  isLastScreen,
  onPrevious,
  onNext,
  onReviewOrSubmit,
  activityConfig,
}) => {
  const currentScreen = activityData.screens[currentScreenIndex];
  const { rtlStyle, isRTL } = useRTL();

  console.log("📄 [QuestionScreenContent] Rendering", {
    currentScreenIndex,
    totalScreens: activityData.screens.length,
    currentScreenName: currentScreen?.name,
    elementsCount: currentScreen?.elements.length || 0,
    hasScreen: !!currentScreen,
  });

  if (!currentScreen) {
    console.warn(
      "📄 [QuestionScreenContent] No current screen, returning null"
    );
    return null;
  }

  // Get screen display properties for button styling
  const screenDisplayProperties = currentScreen.displayProperties || {};
  const buttonWidth = screenDisplayProperties.width || "100%";
  const buttonMarginLeft = screenDisplayProperties.marginLeft
    ? parseInt(screenDisplayProperties.marginLeft, 10)
    : 0;
  const buttonMarginRight = screenDisplayProperties.marginRight
    ? parseInt(screenDisplayProperties.marginRight, 10)
    : 0;
  const buttonPaddingLeft = screenDisplayProperties.paddingLeft
    ? parseInt(screenDisplayProperties.paddingLeft, 10)
    : 20;
  const buttonPaddingRight = screenDisplayProperties.paddingRight
    ? parseInt(screenDisplayProperties.paddingRight, 10)
    : 20;
  const buttonFontSize = screenDisplayProperties.fontSize
    ? parseInt(screenDisplayProperties.fontSize, 10)
    : 16;

  // Build button container style using display properties and RTL
  const buttonContainerStyle = rtlStyle({
    width:
      buttonWidth === "100%" ? "100%" : parseFloat(buttonWidth) || undefined,
    marginLeft: buttonMarginLeft,
    marginRight: buttonMarginRight,
    paddingLeft: buttonPaddingLeft,
    paddingRight: buttonPaddingRight,
    marginTop: 24,
    marginBottom: 16,
    flexDirection: isRTL ? "row-reverse" : "row",
    gap: 12,
  });

  const buttonText = activityConfig?.summaryScreen?.showScreen
    ? "Review"
    : "Submit";

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[
        styles.scrollContent,
        {
          // Ensure button is always visible with generous bottom padding
          // Account for tab bar (60px) + safe area + extra spacing (40px)
          paddingBottom: Math.max(bottomInset + 100, 140),
        },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={true}
    >
      {currentScreen.elements.map(element => {
        console.log("📄 [QuestionScreenContent] Rendering element", {
          elementId: element.id,
          questionId: element.question.id,
          questionText: element.question.text?.substring(0, 30),
        });
        return (
          <QuestionRenderer
            key={element.id}
            element={element}
            currentAnswer={answers[element.question.id]}
            onAnswerChange={onAnswerChange}
            errors={errors}
          />
        );
      })}

      {/* Navigation Buttons - Rendered as part of form using display properties */}
      {/* Add extra spacing before buttons to ensure visibility */}
      <View style={styles.buttonSpacer} />
      <View style={buttonContainerStyle}>
        {currentScreenIndex > 0 && onPrevious && (
          <TouchableOpacity
            style={[styles.navButton, styles.previousButton]}
            onPress={onPrevious}
          >
            <TranslatedText text="Previous" style={styles.navButtonText} />
          </TouchableOpacity>
        )}

        {isLastScreen ? (
          <TouchableOpacity
            style={[
              styles.navButton,
              styles.submitButton,
              currentScreenValid || cameFromReview
                ? styles.submitButtonEnabled
                : styles.submitButtonDisabled,
            ]}
            onPress={onReviewOrSubmit}
            disabled={!currentScreenValid && !cameFromReview}
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  buttonSpacer: {
    height: 20, // Extra spacing before buttons
  },
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
