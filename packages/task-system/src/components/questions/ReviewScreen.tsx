/**
 * Review screen component that displays all answers before submission
 */

import { IconSymbol } from "@components/ui/IconSymbol";
import { AppColors } from "@constants/AppColors";
import { AppFonts } from "@constants/AppFonts";
import { useRTL } from "@hooks/useRTL";
import { useTranslatedText } from "@hooks/useTranslatedText";
import { ParsedElement, ParsedScreen } from "@task-types/ActivityConfig";
import { AnswerValue } from "@task-types/AnswerValue";
import { formatAnswer } from "@utils/answerFormatting";
import { isIOS } from "@utils/platform";
import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";

/**
 * Component for screen section with translated title
 *
 * @param props - Component props
 * @param props.screenTitle - Title of the screen section
 * @param props.screen - Parsed screen data containing elements
 * @param props.answers - Map of question IDs to their answer values
 * @param props.onEditQuestion - Optional callback when edit button is clicked
 * @param props.formatAnswer - Function to format answer for display
 * @param props.notAnsweredText - Text to show when question is not answered
 * @returns Screen section component with questions and answers
 */
const ScreenSection: React.FC<{
  screenTitle: string;
  screen: ParsedScreen;
  answers: Record<string, AnswerValue>;
  onEditQuestion?: (questionId: string) => void;
  formatAnswer: (element: ParsedElement, answer: AnswerValue) => string;
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
      {screen.elements.map(element => {
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

/**
 * Props for the ReviewScreen component
 */
interface ReviewScreenProps {
  screens: ParsedScreen[];
  answers: Record<string, AnswerValue>;
  onEditQuestion?: (questionId: string) => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
  bottomInset?: number;
  tabBarHeight?: number;
}

/**
 * Component for individual question review item with translation and edit button
 *
 * @param props - Component props
 * @param props.questionText - The question text to display
 * @param props.answer - The formatted answer string
 * @param props.hasAnswer - Whether the question has been answered
 * @param props.questionId - Unique identifier for the question
 * @param props.onEdit - Optional callback when edit button is clicked
 * @returns Question review item component
 */
const QuestionReviewItem: React.FC<{
  questionText: string;
  answer: string;
  hasAnswer: boolean;
  questionId: string;
  onEdit?: (questionId: string) => void;
}> = ({ questionText, answer, hasAnswer, questionId, onEdit }) => {
  const { translatedText } = useTranslatedText(questionText);
  const { rtlStyle, isRTL } = useRTL();

  return (
    <View style={styles.questionItem}>
      <View
        style={[styles.questionRow, rtlStyle(styles.questionRow) as ViewStyle]}
      >
        <Text style={styles.questionText}>{translatedText}</Text>
        {onEdit && (
          <TouchableOpacity
            testID={`edit-button-${questionId}`}
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

/**
 * Main ReviewScreen component that displays all screens with their questions and answers.
 * Provides a comprehensive review interface for users to verify their answers before submission.
 *
 * @param props - Component props
 * @param props.screens - Array of parsed screen data containing questions
 * @param props.answers - Map of question IDs to their answer values
 * @param props.onEditQuestion - Optional callback when user wants to edit a question
 * @param props.onSubmit - Optional callback when user submits the review
 * @param props.isSubmitting - Whether the submission is in progress
 * @param props.bottomInset - Bottom safe area inset for iOS devices
 * @param props.tabBarHeight - Height of the tab bar for proper spacing
 * @returns A scrollable review screen with all questions and answers
 *
 * @example
 * ```tsx
 * <ReviewScreen
 *   screens={parsedScreens}
 *   answers={userAnswers}
 *   onEditQuestion={(questionId) => navigateToQuestion(questionId)}
 *   onSubmit={handleSubmit}
 *   isSubmitting={false}
 * />
 * ```
 */
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
    (isIOS() ? Math.max(tabBarHeight || 60, 60) : 0) +
    20;

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

      {screens.map(screen => {
        const screenTitle = screen.name || `Page ${screen.order}`;
        return (
          <ScreenSection
            key={screen.id}
            screenTitle={screenTitle}
            screen={screen}
            answers={answers}
            onEditQuestion={onEditQuestion}
            formatAnswer={(element, answer) =>
              formatAnswer(element, answer, notAnsweredText)
            }
            notAnsweredText={notAnsweredText}
          />
        );
      })}

      {/* Submit Button - Part of scrollable content */}
      {onSubmit && (
        <View style={styles.submitButtonContainer}>
          <TouchableOpacity
            testID="submit-button"
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
    ...AppFonts.heading,
    color: AppColors.gray,
    marginBottom: 8,
  },
  subtitle: {
    ...AppFonts.body,
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
    ...AppFonts.subheading,
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
    ...AppFonts.label,
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
    ...AppFonts.small,
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
    ...AppFonts.button,
    color: AppColors.white,
  },
});
