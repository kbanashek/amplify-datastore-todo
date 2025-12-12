import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useActivityData } from "./useActivityData";
import { useAnswerManagement } from "./useAnswerManagement";
import { useQuestionNavigation } from "./useQuestionNavigation";
import { useQuestionSubmission } from "./useQuestionSubmission";
import { useQuestionValidation } from "./useQuestionValidation";

export interface UseQuestionsScreenReturn {
  // State
  loading: boolean;
  error: string | null;
  activityData: ReturnType<typeof useActivityData>["activityData"];
  activityConfig: ReturnType<typeof useActivityData>["activityConfig"];
  answers: ReturnType<typeof useAnswerManagement>["answers"];
  errors: ReturnType<typeof useAnswerManagement>["errors"];
  isSubmitting: boolean;
  currentScreenIndex: number;
  showIntroduction: boolean;
  showReview: boolean;
  showCompletion: boolean;
  currentScreenValid: boolean;
  cameFromReview: boolean;
  taskId: string | undefined;
  entityId: string | undefined;

  // Actions
  handleAnswerChange: (questionId: string, answer: any) => void;
  handleSubmit: () => Promise<void>;
  handleNext: () => void;
  handlePrevious: () => void;
  handleBegin: () => void;
  handleBackToQuestions: () => void;
  handleEditQuestion: (questionId: string) => void;
  handleReviewSubmit: () => void;
  handleCompletionDone: () => void;
  handleBack: () => void;
}

/**
 * Main hook for questions screen
 * Composes smaller hooks for activity data, answers, validation, navigation, and submission
 */
export const useQuestionsScreen = (): UseQuestionsScreenReturn => {
  const params = useLocalSearchParams();
  const router = useRouter();
  const taskId = params.taskId as string | undefined;
  const entityId = params.entityId as string | undefined;

  // Fetch and parse activity data
  const { loading, error, activityData, activityConfig, initialAnswers } =
    useActivityData({ entityId, taskId });

  // Initialize screen state based on activity config
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [showIntroduction, setShowIntroduction] = useState(false);

  useEffect(() => {
    if (activityConfig?.introductionScreen?.showScreen) {
      setShowIntroduction(true);
      setCurrentScreenIndex(-1);
    } else {
      setCurrentScreenIndex(0);
    }
  }, [activityConfig]);

  // Manage answers and real-time validation
  const { answers, errors, setAnswers, setErrors, handleAnswerChange } =
    useAnswerManagement({
      activityData,
      currentScreenIndex,
      initialAnswers,
    });

  // Update answers when initialAnswers change
  useEffect(() => {
    if (Object.keys(initialAnswers).length > 0) {
      setAnswers(initialAnswers);
    }
  }, [initialAnswers, setAnswers]);

  // Validation
  const { currentScreenValid, validateCurrentScreen } = useQuestionValidation({
    activityData,
    currentScreenIndex,
    answers,
    setErrors,
  });

  // Navigation state management
  const [showReview, setShowReview] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [cameFromReview, setCameFromReview] = useState(false);

  // Submission
  const { isSubmitting, handleSubmit } = useQuestionSubmission({
    taskId,
    entityId,
    answers,
    activityData,
    activityConfig,
    onSuccess: () => {
      setShowReview(false);
      setShowCompletion(true);
      setCameFromReview(false);
    },
    onNavigateToDashboard: () => {
      router.replace("/(tabs)/" as any);
    },
  });

  // Navigation handlers
  const navigation = useQuestionNavigation({
    activityData,
    activityConfig,
    currentScreenIndex,
    cameFromReview,
    currentScreenValid,
    validateCurrentScreen,
    onSubmit: handleSubmit,
    setErrors,
    setCurrentScreenIndex,
    setShowIntroduction,
    setShowReview,
    setShowCompletion,
    setCameFromReview,
  });

  return {
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
    entityId,

    // Actions
    handleAnswerChange,
    handleSubmit,
    handleNext: navigation.handleNext,
    handlePrevious: navigation.handlePrevious,
    handleBegin: navigation.handleBegin,
    handleBackToQuestions: navigation.handleBackToQuestions,
    handleEditQuestion: navigation.handleEditQuestion,
    handleReviewSubmit: navigation.handleReviewOrSubmit,
    handleCompletionDone: navigation.handleCompletionDone,
    handleBack: navigation.handleBack,
  };
};
