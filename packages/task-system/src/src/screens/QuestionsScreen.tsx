import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlobalHeader } from "../components/GlobalHeader";
import { CompletionScreen } from "../components/questions/CompletionScreen";
import { ErrorState } from "../components/questions/ErrorState";
import { IntroductionScreen } from "../components/questions/IntroductionScreen";
import { LoadingState } from "../components/questions/LoadingState";
import { ProgressIndicator } from "../components/questions/ProgressIndicator";
import { QuestionScreenContent } from "../components/questions/QuestionScreenContent";
import { ReviewScreenContainer } from "../components/questions/ReviewScreenContainer";
import { useQuestionsScreen } from "../hooks/useQuestionsScreen";
import { useTranslatedText } from "../hooks/useTranslatedText";

export default function QuestionsScreen() {
  const insets = useSafeAreaInsets();

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

  const { translatedText: headerTitle } = useTranslatedText(
    taskId ? "Answer Questions" : "Questions"
  );

  if (loading) {
    return <LoadingState taskId={taskId} topInset={insets.top} />;
  }

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

      {showIntroduction && (
        <IntroductionScreen
          activityConfig={activityConfig || {}}
          onBegin={handleBegin}
          task={task}
        />
      )}

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

      {showCompletion && activityConfig && (
        <CompletionScreen
          activityConfig={activityConfig}
          onDone={handleCompletionDone}
        />
      )}

      {!showIntroduction &&
        !showReview &&
        !showCompletion &&
        activityData &&
        activityData.screens.length > 0 && (
          <View style={styles.questionContainer}>
            <ProgressIndicator
              currentPage={currentScreenIndex + 1}
              totalPages={activityData.screens.length}
            />
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
  container: { flex: 1, backgroundColor: "#f5f6fa" },
  questionContainer: { flex: 1, flexDirection: "column" },
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
  backButtonText: { color: "#57606f", fontSize: 14, fontWeight: "600" },
});
