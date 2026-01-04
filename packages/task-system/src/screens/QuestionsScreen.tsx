import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QuestionHeader } from "@components/QuestionHeader";
import { AppFonts } from "@constants/AppFonts";
import { CompletionScreen } from "@components/questions/CompletionScreen";
import { ErrorState } from "@components/questions/ErrorState";
import { IntroductionScreen } from "@components/questions/IntroductionScreen";
import { LoadingState } from "@components/questions/LoadingState";
import { QuestionScreenContent } from "@components/questions/QuestionScreenContent";
import { ReviewScreenContainer } from "@components/questions/ReviewScreenContainer";
import { useQuestionsScreen } from "@hooks/useQuestionsScreen";
import { useTranslatedText } from "@hooks/useTranslatedText";

const CONTENT_PADDING = 20;

interface QuestionsScreenProps {
  /**
   * When the module is embedded under a host header (e.g. Dashboard), the host
   * has already applied safe-area padding. Disable the extra top inset to avoid
   * large empty space above the header.
   */
  disableSafeAreaTopInset?: boolean;
}

export default function QuestionsScreen({
  disableSafeAreaTopInset = false,
}: QuestionsScreenProps) {
  const insets = useSafeAreaInsets();
  const topInset = disableSafeAreaTopInset ? 0 : insets.top;

  const {
    loading,
    error,
    activityData,
    activityConfig,
    answers,
    errors,
    isSubmitting,
    currentScreenIndex,
    showIntroduction,
    showReview,
    showCompletion,
    currentScreenValid,
    cameFromReview,
    taskId,
    task,
    handleAnswerChange,
    handleSubmit,
    handleNext,
    handlePrevious,
    handleBegin,
    handleEditQuestion,
    handleReviewSubmit,
    handleCompletionDone,
    handleBack,
  } = useQuestionsScreen();

  // Use task title if available, otherwise fall back to default
  const defaultTitle = taskId ? "Answer Questions" : "Questions";
  const taskTitle = task?.title || defaultTitle;
  const { translatedText: headerTitle } = useTranslatedText(taskTitle);

  if (loading) {
    return <LoadingState taskId={taskId} topInset={topInset} />;
  }

  if (error) {
    return (
      <ErrorState
        error={error}
        taskId={taskId}
        topInset={topInset}
        onBack={handleBack}
      />
    );
  }

  if (!activityData || activityData.screens.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.headerWrapper}>
          <QuestionHeader
            title={headerTitle}
            showBackButton={!!taskId}
            onBackPress={handleBack}
          />
        </View>
        <View
          style={[
            styles.contentWrapper,
            { paddingTop: insets.top, paddingHorizontal: CONTENT_PADDING },
          ]}
        >
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>No questions available</Text>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.headerWrapper}>
        <QuestionHeader
          title={headerTitle}
          showBackButton={
            !!(taskId && !showIntroduction && !showCompletion && !showReview)
          }
          onBackPress={handleBack}
          showCloseButton={
            !!(taskId && !showIntroduction && !showCompletion && !showReview)
          }
          onClosePress={handleBack}
        />
      </View>
      <View
        style={[
          styles.contentWrapper,
          { paddingTop: topInset, paddingHorizontal: CONTENT_PADDING },
        ]}
      >
        {/* Completion Screen - Show first if completed (highest priority) */}
        {showCompletion &&
          !showIntroduction &&
          !showReview &&
          activityConfig && (
            <CompletionScreen
              activityConfig={activityConfig}
              onDone={handleCompletionDone}
            />
          )}

        {/* Introduction Screen - Only show if not completed */}
        {showIntroduction && !showCompletion && (
          <IntroductionScreen
            activityConfig={activityConfig || {}}
            onBegin={handleBegin}
            task={task}
          />
        )}

        {/* Review Screen */}
        {showReview && !showIntroduction && !showCompletion && activityData && (
          <ReviewScreenContainer
            activityData={activityData}
            answers={answers}
            isSubmitting={isSubmitting}
            onEditQuestion={handleEditQuestion}
            onSubmit={handleSubmit}
            bottomInset={insets.bottom}
            tabBarHeight={60}
          />
        )}

        {!showIntroduction &&
          !showReview &&
          !showCompletion &&
          activityData &&
          activityData.screens.length > 0 && (
            <View style={styles.questionContainer}>
              <QuestionScreenContent
                activityData={activityData}
                currentScreenIndex={currentScreenIndex}
                answers={answers}
                errors={errors}
                onAnswerChange={handleAnswerChange}
                bottomInset={insets.bottom}
                currentScreenValid={currentScreenValid}
                cameFromReview={cameFromReview}
                isLastScreen={
                  currentScreenIndex === activityData.screens.length - 1
                }
                onPrevious={handlePrevious}
                onNext={handleNext}
                onReviewOrSubmit={handleReviewSubmit}
                activityConfig={activityConfig}
                task={task || undefined}
              />
            </View>
          )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
    margin: 0,
    paddingHorizontal: 0,
    marginHorizontal: 0,
  },
  contentWrapper: {
    flex: 1,
    paddingHorizontal: CONTENT_PADDING, // body padding
  },
  headerWrapper: {
    alignSelf: "stretch",
    width: "100%",
    marginHorizontal: 0,
    paddingHorizontal: 0,
  },
  questionContainer: { flex: 1, flexDirection: "column" },
  centerContainer: {
    flex: 1,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    ...AppFonts.body,
    color: "#747d8c",
    textAlign: "center",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "#ecf0f1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: { ...AppFonts.label, color: "#57606f" },
});
