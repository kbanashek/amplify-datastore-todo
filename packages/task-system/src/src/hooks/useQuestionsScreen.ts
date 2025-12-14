import { DataStore } from "@aws-amplify/datastore";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { Task as DataStoreTask } from "../models";
import { TaskService } from "../services/TaskService";
import { Task, TaskStatus } from "../types/Task";
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
  task: Task | null;

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
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const taskId = route?.params?.taskId as string | undefined;
  const entityId = route?.params?.entityId as string | undefined;

  // Fetch task to get status
  const [task, setTask] = useState<Task | null>(null);

  useEffect(() => {
    if (!taskId) {
      console.log("[useQuestionsScreen] No taskId provided");
      setTask(null);
      return;
    }

    // Fetch initial task
    const fetchTask = async () => {
      try {
        console.log("[useQuestionsScreen] Fetching task:", taskId);
        const fetchedTask = await TaskService.getTaskById(taskId);
        console.log("[useQuestionsScreen] Fetched task:", {
          id: fetchedTask?.id,
          status: fetchedTask?.status,
          statusType: typeof fetchedTask?.status,
          title: fetchedTask?.title,
        });
        // Type assertion: DataStore Task is compatible with our Task interface
        setTask(fetchedTask as Task | null);
      } catch (error) {
        console.error("[useQuestionsScreen] Error fetching task:", error);
        // Don't set error state here - task status is optional for button text
      }
    };

    fetchTask();

    // Subscribe to task updates for real-time status changes
    const subscription = DataStore.observe(DataStoreTask).subscribe(msg => {
      if (msg.element.id === taskId) {
        console.log("[useQuestionsScreen] Task updated via subscription:", {
          id: msg.element.id,
          status: msg.element.status,
          opType: msg.opType,
        });
        setTask(msg.element as Task);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [taskId]);

  // Fetch and parse activity data
  const { loading, error, activityData, activityConfig, initialAnswers } =
    useActivityData({ entityId, taskId });

  // Initialize screen state based on activity config
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [showIntroduction, setShowIntroduction] = useState(false);

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

  // Initialize screen state based on activity config
  useEffect(() => {
    // Only show introduction screen if activity config specifies it
    // BUT don't show introduction if completion screen is showing
    if (activityConfig?.introductionScreen?.showScreen) {
      setShowIntroduction(true);
      setCurrentScreenIndex(-1);
    } else {
      setCurrentScreenIndex(0);
      setShowIntroduction(false);
    }
  }, [activityConfig]);

  // Reset completion state when showing introduction (they're mutually exclusive)
  useEffect(() => {
    if (showIntroduction) {
      setShowCompletion(false);
    }
  }, [showIntroduction]);

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
      nav.popToTop?.();
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

  // Enhanced handleBegin that updates task status before navigation
  const handleBeginWithStatusUpdate = useCallback(async () => {
    // If task exists and is not already started, update status to STARTED
    if (
      task &&
      task.status !== TaskStatus.STARTED &&
      task.status !== TaskStatus.INPROGRESS
    ) {
      try {
        console.log(
          "[useQuestionsScreen] Updating task status to STARTED before begin"
        );
        await TaskService.updateTask(task.id, {
          status: TaskStatus.STARTED,
        });
        // The DataStore subscription will pick up the update and refresh the task state
      } catch (error) {
        console.error(
          "[useQuestionsScreen] Error updating task status:",
          error
        );
      }
    }
    // Proceed with navigation
    navigation.handleBegin();
  }, [task, navigation]);

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
    task,

    // Actions
    handleAnswerChange,
    handleSubmit,
    handleNext: navigation.handleNext,
    handlePrevious: navigation.handlePrevious,
    handleBegin: handleBeginWithStatusUpdate,
    handleBackToQuestions: navigation.handleBackToQuestions,
    handleEditQuestion: navigation.handleEditQuestion,
    handleReviewSubmit: navigation.handleReviewOrSubmit,
    handleCompletionDone: navigation.handleCompletionDone,
    handleBack: navigation.handleBack,
  };
};
