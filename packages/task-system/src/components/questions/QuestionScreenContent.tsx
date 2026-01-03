/**
 * QuestionScreenContent component module.
 *
 * @module QuestionScreenContent
 */

import React, { useEffect, useRef } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { ParsedActivityData } from "@utils/activityParser";
import { isAndroid } from "@utils/platform";
import { getServiceLogger } from "@utils/serviceLogger";
import { QuestionRenderer } from "@components/questions/QuestionRenderer";
import { QuestionScreenButtons } from "@components/questions/QuestionScreenButtons";
import { Task } from "@task-types/Task";
import { getTaskSystemConfig } from "@runtime/taskSystem";

const logger = getServiceLogger("QuestionScreenContent");

/**
 * Props for the QuestionScreenContent component
 */
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
  task?: Task;
}

/**
 * QuestionScreenContent component.
 *
 * @param props - Component props
 * @returns Rendered QuestionScreenContent component
 */
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
  task,
}) => {
  const currentScreen = activityData.screens[currentScreenIndex];
  const scrollViewRef = useRef<ScrollView>(null);

  // Hide scrollbar on Android using native method
  useEffect(() => {
    if (isAndroid() && scrollViewRef.current) {
      // @ts-ignore - Android-specific native method
      scrollViewRef.current?.setNativeProps?.({
        scrollBarThumbImage: { uri: "transparent" },
        scrollBarTrackImage: { uri: "transparent" },
      });
    }
  }, []);

  // console.log("📄 [QuestionScreenContent] Rendering", {
  //   currentScreenIndex,
  //   totalScreens: activityData.screens.length,
  //   currentScreenName: currentScreen?.name,
  //   elementsCount: currentScreen?.elements.length || 0,
  //   hasScreen: !!currentScreen,
  // });

  if (!currentScreen) {
    logger.warn(
      "No current screen, returning null",
      undefined,
      undefined,
      "📄"
    );
    return null;
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      style={[styles.scrollView, isAndroid() && styles.scrollViewAndroid]}
      contentContainerStyle={[
        styles.scrollContent,
        {
          // Ensure button is always visible with generous bottom padding
          // Account for tab bar (60px) + safe area + extra spacing (40px)
          paddingBottom: Math.max(bottomInset + 100, 140),
        },
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      showsHorizontalScrollIndicator={false}
      nestedScrollEnabled={false}
      bounces={false}
      overScrollMode="never"
    >
      {currentScreen.elements.map(element => {
        // console.log("📄 [QuestionScreenContent] Rendering element", {
        //   elementId: element.id,
        //   questionId: element.question.id,
        //   questionText: element.question.text?.substring(0, 30),
        // });

        // Inject task context and S3 hierarchy into displayProperties for ImageCapture questions
        const config = getTaskSystemConfig();
        const enhancedElement = task
          ? {
              ...element,
              displayProperties: {
                ...element.displayProperties,
                // Task context
                taskId: task.id,
                taskType: String(task.taskType),
                uuid: task.taskInstanceId || "",
                // S3 hierarchy from package configuration
                organizationId: config.organizationId || "",
                studyId: config.studyId || "",
                studyInstanceId: config.studyInstanceId || "",
              },
            }
          : element;

        return (
          <QuestionRenderer
            key={element.id}
            element={enhancedElement}
            currentAnswer={answers[element.question.id]}
            onAnswerChange={onAnswerChange}
            errors={errors}
          />
        );
      })}

      {/* Navigation Buttons - Rendered as part of form using display properties */}
      {/* Add extra spacing before buttons to ensure visibility */}
      <View style={styles.buttonSpacer} />
      <QuestionScreenButtons
        currentScreenIndex={currentScreenIndex}
        isLastScreen={isLastScreen}
        currentScreenValid={currentScreenValid}
        cameFromReview={cameFromReview}
        displayProperties={currentScreen.displayProperties}
        activityConfig={activityConfig}
        onPrevious={onPrevious}
        onNext={onNext}
        onReviewOrSubmit={onReviewOrSubmit}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollViewAndroid: {
    // Android-specific: Additional styling to ensure scrollbar is hidden
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
  },
  buttonSpacer: {
    height: 20, // Extra spacing before buttons
  },
});
