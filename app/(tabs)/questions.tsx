import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlobalHeader } from "../../src/components/GlobalHeader";
import { CompletionScreen } from "../../src/components/questions/CompletionScreen";
import { ErrorState } from "../../src/components/questions/ErrorState";
import { IntroductionScreen } from "../../src/components/questions/IntroductionScreen";
import { LoadingState } from "../../src/components/questions/LoadingState";
import { ProgressIndicator } from "../../src/components/questions/ProgressIndicator";
import { QuestionScreenContent } from "../../src/components/questions/QuestionScreenContent";
import { ReviewScreenContainer } from "../../src/components/questions/ReviewScreenContainer";
import { useQuestionsScreen } from "../../src/hooks/useQuestionsScreen";
import { useTranslatedText } from "../../src/hooks/useTranslatedText";

export default function QuestionsScreen() {
  const insets = useSafeAreaInsets();

  const {
    // State
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

    // Actions
    handleAnswerChange,
    handleSubmit,
    handleNext,
    handlePrevious,
    handleBegin,
    handleBackToQuestions,
    handleEditQuestion,
    handleReviewSubmit,
    handleCompletionDone,
    handleBack,
  } = useQuestionsScreen();

  // Hooks must be called before early returns
  const { translatedText: headerTitle } = useTranslatedText(
    taskId ? "Answer Questions" : "Questions"
  );

  // Loading state
  if (loading) {
    return <LoadingState taskId={taskId} topInset={insets.top} />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        error={error}
        taskId={taskId}
        topInset={insets.top}
        onBack={handleBack}
      />
    );
  }

  // Empty state
  if (!activityData || activityData.screens.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <GlobalHeader
          title={headerTitle}
          showBackButton={!!taskId}
          onBackPress={handleBack}
        />
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No questions available</Text>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlobalHeader
        title={headerTitle}
        showBackButton={!!(taskId && !showIntroduction && !showCompletion)}
        onBackPress={handleBack}
      />

      {/* Completion Screen - Show first if completed (highest priority) */}
      {showCompletion && !showIntroduction && !showReview && activityConfig && (
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

      {/* Question Screens (Multi-page) */}
      {!showIntroduction &&
        !showReview &&
        !showCompletion &&
        activityData &&
        activityData.screens.length > 0 && (
          <View style={styles.questionContainer}>
            {/* Progress Indicator */}
            <ProgressIndicator
              currentPage={currentScreenIndex + 1}
              totalPages={activityData.screens.length}
            />

            {/* Question Content - Scrollable with integrated navigation buttons */}
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
            />
          </View>
        )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  questionContainer: {
    flex: 1,
    flexDirection: "column",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#dfe4ea",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2f3542",
    flex: 1,
  },
  headerBottom: {
    flexDirection: "row",
    alignItems: "center",
  },
  centerContainer: {
    flex: 1,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#747d8c",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
  },
  backButton: {
    backgroundColor: "#ecf0f1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#57606f",
    fontSize: 14,
    fontWeight: "600",
  },
});
