/**
 * Review screen component that displays all answers before submission
 */

import React from "react";
import { StyleSheet, Text, View, ScrollView } from "react-native";
import { ParsedScreen, ParsedElement } from "../../types/ActivityConfig";
import { useTranslatedText } from "../../hooks/useTranslatedText";

interface ReviewScreenProps {
  screens: ParsedScreen[];
  answers: Record<string, any>;
}

// Component for individual question review item with translation
const QuestionReviewItem: React.FC<{
  questionText: string;
  answer: string;
  hasAnswer: boolean;
}> = ({ questionText, answer, hasAnswer }) => {
  const { translatedText } = useTranslatedText(questionText);
  return (
    <View style={styles.questionItem}>
      <Text style={styles.questionText}>{translatedText}</Text>
      <Text
        style={[
          styles.answerText,
          !hasAnswer && styles.answerTextEmpty,
        ]}
      >
        {answer}
      </Text>
    </View>
  );
};

export const ReviewScreen: React.FC<ReviewScreenProps> = ({
  screens,
  answers,
}) => {
  console.log("📋 [ReviewScreen] Rendering review screen", {
    screensCount: screens.length,
    answersCount: Object.keys(answers).length,
  });

  const formatAnswer = (element: ParsedElement, answer: any): string => {
    if (answer === null || answer === undefined || answer === "") {
      return "Not answered";
    }

    const question = element.question;

    // Handle different question types
    if (question.type === "multiselect" && Array.isArray(answer)) {
      if (answer.length === 0) return "Not answered";
      // Find choice texts
      const choiceTexts = answer
        .map((val) => {
          const choice = question.choices?.find((c) => c.value === val || c.id === val);
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Review Your Answers</Text>
        <Text style={styles.subtitle}>
          Please review your answers before submitting.
        </Text>
      </View>

      {screens.map((screen) => (
        <View key={screen.id} style={styles.screenSection}>
          <Text style={styles.screenTitle}>{screen.name || `Page ${screen.order}`}</Text>
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
              />
            );
          })}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2f3542",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#57606f",
    lineHeight: 22,
  },
  screenSection: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  screenTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#3498db",
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#dfe4ea",
    paddingBottom: 8,
  },
  questionItem: {
    marginBottom: 16,
  },
  questionText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2f3542",
    marginBottom: 6,
  },
  answerText: {
    fontSize: 14,
    color: "#57606f",
    lineHeight: 20,
    paddingLeft: 12,
  },
  answerTextEmpty: {
    color: "#95a5a6",
    fontStyle: "italic",
  },
});


