import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { QuestionRenderer } from "./QuestionRenderer";
import { ParsedActivityData } from "../../utils/activityParser";

interface QuestionScreenContentProps {
  activityData: ParsedActivityData;
  currentScreenIndex: number;
  answers: Record<string, any>;
  errors: Record<string, string[]>;
  onAnswerChange: (questionId: string, answer: any) => void;
  bottomInset: number;
}

export const QuestionScreenContent: React.FC<QuestionScreenContentProps> = ({
  activityData,
  currentScreenIndex,
  answers,
  errors,
  onAnswerChange,
  bottomInset,
}) => {
  const currentScreen = activityData.screens[currentScreenIndex];

  if (!currentScreen) {
    return null;
  }

  return (
    <ScrollView
      style={[styles.scrollView, { marginBottom: 80 }]}
      contentContainerStyle={[
        styles.scrollContent,
        { paddingBottom: bottomInset + 20 },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={true}
    >
      {currentScreen.elements.map((element) => (
        <QuestionRenderer
          key={element.id}
          element={element}
          currentAnswer={answers[element.question.id]}
          onAnswerChange={onAnswerChange}
          errors={errors}
        />
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
    flexGrow: 1,
  },
});

