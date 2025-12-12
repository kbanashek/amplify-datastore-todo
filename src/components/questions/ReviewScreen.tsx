/**
 * Review screen component that displays all answers before submission
 */

import { IconSymbol } from "@/components/ui/IconSymbol";
import React from "react";
import {
  ActivityIndicator,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { AppColors } from "../../constants/AppColors";
import { useRTL } from "../../hooks/useRTL";
import { useTranslatedText } from "../../hooks/useTranslatedText";
import { ParsedElement, ParsedScreen } from "../../types/ActivityConfig";

// Component for screen section with translated title
const ScreenSection: React.FC<{
  screenTitle: string;
  screen: ParsedScreen;
  answers: Record<string, any>;
  onEditQuestion?: (questionId: string) => void;
  formatAnswer: (element: ParsedElement, answer: any) => string;
  notAnsweredText: string;
}> = ({
  screenTitle,
  screen,
  answers,
  onEditQuestion,
  formatAnswer,
  notAnsweredText,
}) => {
  const { translatedText: translatedScreenTitle } =
    useTranslatedText(screenTitle);

  return (
    <View style={styles.screenSection}>
      <Text style={styles.screenTitle}>{translatedScreenTitle}</Text>
      {screen.elements.map((element) => {
        const answer = answers[element.question.id];
        const originalQuestionText = element.question.text
          .replace(/<[^>]*>/g, "")
          .trim();

        return (
          <QuestionReviewItem
            key={element.id}
            questionText={originalQuestionText}
            answer={formatAnswer(element, answer)}
            hasAnswer={!!answer}
            questionId={element.question.id}
            onEdit={onEditQuestion}
          />
        );
      })}
    </View>
  );
};

interface ReviewScreenProps {
  screens: ParsedScreen[];
  answers: Record<string, any>;
  onEditQuestion?: (questionId: string) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  bottomInset?: number;
  tabBarHeight?: number;
}

// Component for individual question review item with translation and edit button
const QuestionReviewItem: React.FC<{
  questionText: string;
  answer: string;
  hasAnswer: boolean;
  questionId: string;
  onEdit?: (questionId: string) => void;
}> = ({ questionText, answer, hasAnswer, questionId, onEdit }) => {
  const { translatedText } = useTranslatedText(questionText);
  const { rtlStyle } = useRTL();

  return (
    <View style={styles.questionItem}>
      <View style={[styles.questionRow, rtlStyle(styles.questionRow) as any]}>
        <Text style={styles.questionText}>{translatedText}</Text>
        {onEdit && (
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => onEdit(questionId)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <IconSymbol name="pencil" size={18} color={AppColors.CIBlue} />
          </TouchableOpacity>
        )}
      </View>
      <Text style={[styles.answerText, !hasAnswer && styles.answerTextEmpty]}>
        {answer}
      </Text>
    </View>
  );
};

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  screens,
  answers,
  onEditQuestion,
  onSubmit,
  isSubmitting = false,
  bottomInset = 0,
  tabBarHeight = 0,
}) => {
  const { translatedText: submitText } = useTranslatedText("Submit");
  const { translatedText: reviewTitle } = useTranslatedText(
    "Review Your Answers"
  );
  const { translatedText: reviewSubtitle } = useTranslatedText(
    "Please review your answers before submitting."
  );
  const { translatedText: notAnsweredText } = useTranslatedText("Not answered");

  // Calculate bottom padding for tab bar and safe area
  const calculatedBottomPadding =
    Math.max(bottomInset || 0, 20) +
    (Platform.OS === "ios" ? Math.max(tabBarHeight || 60, 60) : 0) +
    20;

  console.log("📋 [ReviewScreen] Rendering review screen", {
    screensCount: screens.length,
    answersCount: Object.keys(answers).length,
  });

  const formatAnswer = (element: ParsedElement, answer: any): string => {
    if (answer === null || answer === undefined || answer === "") {
      return notAnsweredText;
    }

    const question = element.question;

    // Handle different question types
    if (question.type === "multiselect" && Array.isArray(answer)) {
      if (answer.length === 0) return notAnsweredText;
      // Find choice texts
      const choiceTexts = answer
        .map((val) => {
          const choice = question.choices?.find(
            (c) => c.value === val || c.id === val
          );
          return choice?.text || val;
        })
        .filter(Boolean);
      return choiceTexts.join(", ");
    }

    if (question.type === "singleselect") {
      const choice = question.choices?.find(
        (c) => c.value === answer || c.id === answer
      );
      return choice?.text || String(answer);
    }

    if (typeof answer === "string" && answer.length > 100) {
      return answer.substring(0, 100) + "...";
    }

    return String(answer);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingBottom: calculatedBottomPadding },
      ]}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{reviewTitle}</Text>
        <Text style={styles.subtitle}>{reviewSubtitle}</Text>
      </View>

      {screens.map((screen) => {
        const screenTitle = screen.name || `Page ${screen.order}`;
        return (
          <ScreenSection
            key={screen.id}
            screenTitle={screenTitle}
            screen={screen}
            answers={answers}
            onEditQuestion={onEditQuestion}
            formatAnswer={formatAnswer}
            notAnsweredText={notAnsweredText}
          />
        );
      })}

      {/* Submit Button - Part of scrollable content */}
      {onSubmit && (
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={onSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color={AppColors.white} />
            ) : (
              <Text style={styles.submitButtonText}>{submitText}</Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.white,
  },
  content: {
    padding: 20,
    paddingBottom: 40, // Base padding, will be adjusted dynamically
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.gray,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: AppColors.mediumDarkGray,
    lineHeight: 22,
  },
  screenSection: {
    backgroundColor: AppColors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: AppColors.lightGray,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: AppColors.CINavy,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.ltGray,
    paddingBottom: 8,
  },
  questionItem: {
    marginBottom: 16,
  },
  questionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  questionText: {
    fontSize: 14,
    fontWeight: "600",
    color: AppColors.gray,
    flex: 1,
    marginRight: 8,
  },
  editButton: {
    padding: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  answerText: {
    fontSize: 14,
    color: AppColors.mediumDarkGray,
    lineHeight: 20,
    paddingLeft: 12,
  },
  answerTextEmpty: {
    color: AppColors.mediumDarkGray,
    fontStyle: "italic",
    opacity: 0.6,
  },
  submitButtonContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  submitButton: {
    backgroundColor: AppColors.CIBlue,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 50,
  },
  submitButtonText: {
    color: AppColors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
