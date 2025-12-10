import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { ActivityService } from "../services/ActivityService";
import { DataPointService } from "../services/DataPointService";
import { TaskAnswerService } from "../services/TaskAnswerService";
import { TaskService } from "../services/TaskService";
import {
  ActivityConfig,
  ParsedElement,
  ParsedScreen,
  Validation,
} from "../types/ActivityConfig";
import { TaskStatus } from "../types/Task";
import {
  ParsedActivityData,
  parseActivityConfig,
} from "../utils/activityParser";

export interface UseQuestionsScreenReturn {
  // State
  loading: boolean;
  error: string | null;
  activityData: ParsedActivityData | null;
  activityConfig: ActivityConfig | null;
  answers: Record<string, any>;
  errors: Record<string, string[]>;
  isSubmitting: boolean;
  currentScreenIndex: number;
  showIntroduction: boolean;
  showReview: boolean;
  showCompletion: boolean;
  currentScreenValid: boolean;
  taskId: string | undefined;
  entityId: string | undefined;

  // Actions
  handleAnswerChange: (questionId: string, answer: any) => void;
  handleSubmit: () => Promise<void>;
  handleNext: () => void;
  handlePrevious: () => void;
  handleBegin: () => void;
  handleBackToQuestions: () => void;
  handleReviewSubmit: () => void;
  handleCompletionDone: () => void;
  handleBack: () => void;
}

export const useQuestionsScreen = (): UseQuestionsScreenReturn => {
  const params = useLocalSearchParams();
  const router = useRouter();

  const taskId = params.taskId as string | undefined;
  const entityId = params.entityId as string | undefined;

  console.log("📱 [useQuestionsScreen] Hook initialized", {
    taskId,
    entityId,
    allParams: params,
    hasTaskId: !!taskId,
    hasEntityId: !!entityId,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activityData, setActivityData] = useState<ParsedActivityData | null>(
    null
  );
  const [activityConfig, setActivityConfig] = useState<ActivityConfig | null>(
    null
  );
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Multi-page navigation state
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [showIntroduction, setShowIntroduction] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  // Fetch Activity and parse questions
  useEffect(() => {
    const fetchActivity = async () => {
      console.log("🔍 [useQuestionsScreen] fetchActivity started", {
        entityId,
        taskId,
      });

      if (!entityId) {
        console.error("❌ [useQuestionsScreen] No entityId provided", {
          taskId,
          entityId,
          params,
          taskTitle: "Unknown",
        });
        setError(
          "This task does not have an associated activity. Please ensure the task has an entityId that links to an Activity."
        );
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Fetch Activity by entityId (which is the Activity pk)
        const activities = await ActivityService.getActivities();
        const activity = activities.find(
          (a) => a.pk === entityId || a.id === entityId
        );

        if (!activity) {
          setError(`Activity not found: ${entityId}`);
          setLoading(false);
          return;
        }

        // Reconstruct the full JSON structure matching the provided format
        let activityConfig: ActivityConfig = {};

        // Parse layouts - check if it contains the full JSON structure
        if (activity.layouts) {
          try {
            const parsedLayouts = JSON.parse(activity.layouts);

            // Check if this is the full JSON structure
            if (
              typeof parsedLayouts === "object" &&
              !Array.isArray(parsedLayouts) &&
              (parsedLayouts.activityGroups ||
                parsedLayouts.introductionScreen ||
                parsedLayouts.summaryScreen ||
                parsedLayouts.completionScreen)
            ) {
              // Full JSON structure - extract all parts
              activityConfig.activityGroups = parsedLayouts.activityGroups;
              activityConfig.layouts = parsedLayouts.layouts || [];
              activityConfig.introductionScreen =
                parsedLayouts.introductionScreen;
              activityConfig.summaryScreen = parsedLayouts.summaryScreen;
              activityConfig.completionScreen = parsedLayouts.completionScreen;
            } else if (Array.isArray(parsedLayouts)) {
              activityConfig.layouts = parsedLayouts;
            } else {
              activityConfig.layouts = parsedLayouts;
            }
          } catch (e) {
            console.error("Error parsing layouts:", e);
          }
        }

        // Parse activityGroups (if not already extracted)
        if (!activityConfig.activityGroups && activity.activityGroups) {
          try {
            activityConfig.activityGroups = JSON.parse(activity.activityGroups);
          } catch (e) {
            console.error("Error parsing activityGroups:", e);
          }
        }

        // Check if they're stored as separate fields
        if (activity.introductionScreen) {
          try {
            activityConfig.introductionScreen = JSON.parse(
              activity.introductionScreen
            );
          } catch (e) {
            console.error("Error parsing introductionScreen:", e);
          }
        }

        if (activity.summaryScreen) {
          try {
            activityConfig.summaryScreen = JSON.parse(activity.summaryScreen);
          } catch (e) {
            console.error("Error parsing summaryScreen:", e);
          }
        }

        if (activity.completionScreen) {
          try {
            activityConfig.completionScreen = JSON.parse(
              activity.completionScreen
            );
          } catch (e) {
            console.error("Error parsing completionScreen:", e);
          }
        }

        // Load existing answers from TaskAnswer
        const existingAnswers: Record<string, any> = {};
        if (taskId) {
          console.log("💾 [useQuestionsScreen] Loading existing answers", {
            taskId,
          });
          const taskAnswers = await TaskAnswerService.getTaskAnswers();
          console.log("📦 [useQuestionsScreen] TaskAnswers fetched", {
            totalAnswers: taskAnswers.length,
          });
          const taskAnswersForTask = taskAnswers.filter(
            (ta) => ta.taskInstanceId === taskId
          );
          console.log("📋 [useQuestionsScreen] TaskAnswers for task", {
            taskId,
            count: taskAnswersForTask.length,
            answers: taskAnswersForTask.map((ta) => ({
              questionId: ta.questionId,
              hasAnswer: !!ta.answer,
            })),
          });
          taskAnswersForTask.forEach((ta) => {
            if (ta.questionId && ta.answer) {
              try {
                existingAnswers[ta.questionId] = JSON.parse(ta.answer);
              } catch {
                existingAnswers[ta.questionId] = ta.answer;
              }
            }
          });
          console.log("✅ [useQuestionsScreen] Existing answers loaded", {
            questionIds: Object.keys(existingAnswers),
            count: Object.keys(existingAnswers).length,
          });
        }

        // Parse activity config
        console.log("🔧 [useQuestionsScreen] Parsing activity config", {
          hasLayouts: !!activityConfig.layouts,
          hasActivityGroups: !!activityConfig.activityGroups,
          layoutsCount: activityConfig.layouts?.length || 0,
          activityGroupsCount: activityConfig.activityGroups?.length || 0,
        });
        const parsed = parseActivityConfig(activityConfig, existingAnswers);
        console.log("✅ [useQuestionsScreen] Activity parsed successfully", {
          screensCount: parsed.screens.length,
          questionsCount: parsed.questions.length,
          totalElements: parsed.screens.reduce(
            (sum, screen) => sum + screen.elements.length,
            0
          ),
        });
        setActivityData(parsed);
        setActivityConfig(activityConfig);
        setAnswers(existingAnswers);

        // Check if introduction screen should be shown
        if (activityConfig.introductionScreen?.showScreen) {
          setShowIntroduction(true);
          setCurrentScreenIndex(-1); // -1 means introduction screen
        } else {
          setCurrentScreenIndex(0); // Start at first question screen
        }
      } catch (err: any) {
        console.error("Error fetching activity:", err);
        setError(err?.message || "Failed to load activity");
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityId, taskId]);

  // Handle answer change
  const handleAnswerChange = useCallback((questionId: string, answer: any) => {
    console.log("✏️ [useQuestionsScreen] Answer changed", {
      questionId,
      answerType: typeof answer,
      isArray: Array.isArray(answer),
      answerPreview:
        typeof answer === "string"
          ? answer.substring(0, 50) + (answer.length > 50 ? "..." : "")
          : Array.isArray(answer)
          ? `[${answer.length} items]`
          : String(answer).substring(0, 50),
      answerLength:
        typeof answer === "string"
          ? answer.length
          : Array.isArray(answer)
          ? answer.length
          : undefined,
    });

    setAnswers((prev) => {
      const previousAnswer = prev[questionId];
      const newAnswers = {
        ...prev,
        [questionId]: answer,
      };
      console.log("💾 [useQuestionsScreen] Answers state updated", {
        questionId,
        previousAnswer:
          previousAnswer !== undefined
            ? typeof previousAnswer === "string"
              ? previousAnswer.substring(0, 30)
              : previousAnswer
            : "none",
        newAnswer:
          typeof answer === "string" ? answer.substring(0, 30) : answer,
        totalAnswers: Object.keys(newAnswers).length,
        allQuestionIds: Object.keys(newAnswers),
      });
      return newAnswers;
    });

    // Clear errors for this question
    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[questionId];
      if (Object.keys(prev).length !== Object.keys(newErrors).length) {
        console.log("[useQuestionsScreen] Errors cleared for question", {
          questionId,
          remainingErrors: Object.keys(newErrors),
        });
      }
      return newErrors;
    });
  }, []);

  // Memoized validation result for current screen
  const currentScreenValid = useMemo(() => {
    if (
      !activityData ||
      currentScreenIndex < 0 ||
      currentScreenIndex >= activityData.screens.length
    ) {
      return true; // Introduction/review screens don't need validation
    }

    const currentScreen = activityData.screens[currentScreenIndex];
    let isValid = true;
    const validationDetails: any[] = [];

    currentScreen.elements.forEach((element) => {
      const question = element.question;
      const answer = answers[question.id];

      const detail: any = {
        questionId: question.id,
        friendlyName: question.friendlyName,
        required: question.required,
        hasAnswer: answer !== null && answer !== undefined && answer !== "",
        answerValue: answer,
        answerType: typeof answer,
        isValid: true,
      };

      // Required field validation
      if (
        question.required &&
        (answer === null ||
          answer === undefined ||
          answer === "" ||
          (Array.isArray(answer) && answer.length === 0))
      ) {
        isValid = false;
        detail.isValid = false;
        detail.reason = "Required field missing";
      }

      // Check validations (min/max for numbers)
      if (
        question.validations &&
        answer !== null &&
        answer !== undefined &&
        answer !== ""
      ) {
        question.validations.forEach((validation: Validation) => {
          if (validation.type === "min" && validation.value) {
            const min = parseFloat(validation.value);
            const numValue = parseFloat(answer);
            if (!isNaN(numValue) && numValue < min) {
              isValid = false;
              detail.isValid = false;
              detail.reason = `Value ${numValue} is less than minimum ${min}`;
            }
          }
          if (validation.type === "max" && validation.value) {
            const max = parseFloat(validation.value);
            const numValue = parseFloat(answer);
            if (!isNaN(numValue) && numValue > max) {
              isValid = false;
              detail.isValid = false;
              detail.reason = `Value ${numValue} is greater than maximum ${max}`;
            }
          }
        });
      }

      validationDetails.push(detail);
    });

    console.log("🔍 [useQuestionsScreen] checkCurrentScreenValid (memoized)", {
      currentScreenIndex,
      screenName: currentScreen?.name,
      isValid,
      totalAnswers: Object.keys(answers).length,
      allAnswerKeys: Object.keys(answers),
      validationDetails,
    });

    return isValid;
  }, [activityData, currentScreenIndex, answers]);

  // Validate current screen answers (sets errors state)
  const validateCurrentScreen = useCallback((): boolean => {
    if (
      !activityData ||
      currentScreenIndex < 0 ||
      currentScreenIndex >= activityData.screens.length
    ) {
      return true; // Introduction/review screens don't need validation
    }

    const currentScreen = activityData.screens[currentScreenIndex];
    const newErrors: Record<string, string[]> = {};
    let isValid = true;

    console.log("🔍 [useQuestionsScreen] validateCurrentScreen called", {
      currentScreenIndex,
      screenName: currentScreen?.name,
      elementsCount: currentScreen?.elements.length || 0,
      totalAnswers: Object.keys(answers).length,
    });

    currentScreen.elements.forEach((element) => {
      const question = element.question;
      const answer = answers[question.id];
      const questionErrors: string[] = [];

      console.log("🔍 [useQuestionsScreen] Validating question", {
        questionId: question.id,
        questionType: question.type,
        friendlyName: question.friendlyName,
        required: question.required,
        hasAnswer: answer !== null && answer !== undefined && answer !== "",
        answerValue: Array.isArray(answer)
          ? `[${answer.length} items]`
          : answer,
        answerType: typeof answer,
      });

      // Required field validation
      if (
        question.required &&
        (answer === null ||
          answer === undefined ||
          answer === "" ||
          (Array.isArray(answer) && answer.length === 0))
      ) {
        const errorMsg =
          question.validations?.find((v) => v.type === "required")?.text ||
          "This field is required.";
        questionErrors.push(errorMsg);
        isValid = false;
        console.warn("⚠️ [useQuestionsScreen] Required field missing", {
          questionId: question.id,
          friendlyName: question.friendlyName,
          errorMsg,
        });
      }

      // Check validations (min/max for numbers)
      if (
        question.validations &&
        answer !== null &&
        answer !== undefined &&
        answer !== ""
      ) {
        question.validations.forEach((validation: Validation) => {
          if (validation.type === "min" && validation.value) {
            const min = parseFloat(validation.value);
            const numValue = parseFloat(answer);
            if (!isNaN(numValue) && numValue < min) {
              questionErrors.push(
                validation.text || `Value must be at least ${min}`
              );
              isValid = false;
            }
          }
          if (validation.type === "max" && validation.value) {
            const max = parseFloat(validation.value);
            const numValue = parseFloat(answer);
            if (!isNaN(numValue) && numValue > max) {
              questionErrors.push(
                validation.text || `Value must be at most ${max}`
              );
              isValid = false;
            }
          }
        });
      }

      if (questionErrors.length > 0) {
        newErrors[question.id] = questionErrors;
      }
    });

    setErrors(newErrors);
    if (isValid) {
      console.log("✅ [useQuestionsScreen] Current screen validation passed", {
        currentScreenIndex,
        screenName: currentScreen?.name,
        validatedQuestions: currentScreen.elements.map((el: ParsedElement) => ({
          id: el.question.id,
          friendlyName: el.question.friendlyName,
          hasAnswer:
            answers[el.question.id] !== null &&
            answers[el.question.id] !== undefined,
        })),
      });
    } else {
      console.warn("⚠️ [useQuestionsScreen] Current screen validation failed", {
        currentScreenIndex,
        screenName: currentScreen?.name,
        errorsCount: Object.keys(newErrors).length,
        errorQuestionIds: Object.keys(newErrors),
        errors: newErrors,
        allAnswers: Object.keys(answers),
      });
    }
    return isValid;
  }, [activityData, currentScreenIndex, answers]);

  // Validate all answers (for final submission)
  const validateAnswers = (): boolean => {
    console.log("✔️ [useQuestionsScreen] validateAnswers called", {
      answersCount: Object.keys(answers).length,
      activityDataScreens: activityData?.screens.length || 0,
    });

    const newErrors: Record<string, string[]> = {};
    let isValid = true;

    if (!activityData) return false;

    activityData.screens.forEach((screen: ParsedScreen) => {
      screen.elements.forEach((element: ParsedElement) => {
        const question = element.question;
        const answer = answers[question.id];

        // Check required
        if (
          question.required &&
          (answer === null ||
            answer === undefined ||
            answer === "" ||
            (Array.isArray(answer) && answer.length === 0))
        ) {
          if (!newErrors[question.id]) {
            newErrors[question.id] = [];
          }
          newErrors[question.id].push("This field is required");
          isValid = false;
        }

        // Check validations
        if (
          question.validations &&
          answer !== null &&
          answer !== undefined &&
          answer !== ""
        ) {
          question.validations.forEach((validation: Validation) => {
            if (validation.type === "min" && validation.value) {
              const min = parseFloat(validation.value);
              const numValue = parseFloat(answer);
              if (!isNaN(numValue) && numValue < min) {
                if (!newErrors[question.id]) {
                  newErrors[question.id] = [];
                }
                newErrors[question.id].push(
                  validation.text || `Value must be at least ${min}`
                );
                isValid = false;
              }
            }
            if (validation.type === "max" && validation.value) {
              const max = parseFloat(validation.value);
              const numValue = parseFloat(answer);
              if (!isNaN(numValue) && numValue > max) {
                if (!newErrors[question.id]) {
                  newErrors[question.id] = [];
                }
                newErrors[question.id].push(
                  validation.text || `Value must be at most ${max}`
                );
                isValid = false;
              }
            }
          });
        }
      });
    });

    setErrors(newErrors);
    if (isValid) {
      console.log("✅ [useQuestionsScreen] Validation passed", {
        answersCount: Object.keys(answers).length,
      });
    } else {
      console.warn("⚠️ [useQuestionsScreen] Validation failed", {
        errorsCount: Object.keys(newErrors).length,
        errorQuestionIds: Object.keys(newErrors),
        errors: newErrors,
      });
    }
    return isValid;
  };

  // Submit answers
  const handleSubmit = useCallback(async () => {
    console.log("📤 [useQuestionsScreen] Submit button pressed", {
      taskId,
      entityId,
      answersCount: Object.keys(answers).length,
      answerKeys: Object.keys(answers),
    });

    if (!validateAnswers()) {
      console.warn("⚠️ [useQuestionsScreen] Validation failed, cannot submit", {
        errors: errors,
      });
      Alert.alert(
        "Validation Error",
        "Please fix the errors before submitting."
      );
      return;
    }

    if (!taskId || !entityId) {
      console.error("❌ [useQuestionsScreen] Missing required information", {
        taskId,
        entityId,
      });
      Alert.alert("Error", "Missing task or activity information.");
      return;
    }

    setIsSubmitting(true);
    const savedAnswers: string[] = [];
    const failedAnswers: { questionId: string; error: string }[] = [];

    try {
      console.log("💾 [useQuestionsScreen] Starting to save answers", {
        totalAnswers: Object.entries(answers).length,
        taskId,
        entityId,
      });

      // Get all existing answers and data point instances once (more efficient)
      const existingAnswers = await TaskAnswerService.getTaskAnswers();
      const existingDataPointInstances =
        await DataPointService.getDataPointInstances();
      console.log("📦 [useQuestionsScreen] Loaded existing TaskAnswers", {
        totalExisting: existingAnswers.length,
        forThisTask: existingAnswers.filter(
          (ta) => ta.taskInstanceId === taskId
        ).length,
      });
      console.log(
        "📦 [useQuestionsScreen] Loaded existing DataPointInstances",
        {
          totalExisting: existingDataPointInstances.length,
          forThisActivity: existingDataPointInstances.filter(
            (dpi) => dpi.activityId === entityId
          ).length,
        }
      );

      // Save each answer as TaskAnswer with individual error handling
      for (const [questionId, answer] of Object.entries(answers)) {
        try {
          // Skip empty/null answers (but log them)
          if (
            answer === null ||
            answer === undefined ||
            answer === "" ||
            (Array.isArray(answer) && answer.length === 0)
          ) {
            console.warn("⚠️ [useQuestionsScreen] Skipping empty answer", {
              questionId,
              answer,
            });
            continue;
          }

          console.log("💾 [useQuestionsScreen] Processing answer", {
            questionId,
            answerType: typeof answer,
            isArray: Array.isArray(answer),
            answerPreview:
              typeof answer === "string"
                ? answer.substring(0, 50) + (answer.length > 50 ? "..." : "")
                : Array.isArray(answer)
                ? `[${answer.length} items]`
                : String(answer).substring(0, 50),
          });

          const answerString =
            typeof answer === "string" ? answer : JSON.stringify(answer);
          const pk = `TASK-ANSWER-${taskId}-${questionId}`;
          const sk = `SK-${Date.now()}-${questionId}`;

          // Find existing answer for this question
          const existing = existingAnswers.find(
            (ta) => ta.taskInstanceId === taskId && ta.questionId === questionId
          );

          if (existing) {
            console.log(
              "🔄 [useQuestionsScreen] Updating existing TaskAnswer",
              {
                taskAnswerId: existing.id,
                questionId,
                previousAnswer: existing.answer?.substring(0, 50),
                newAnswer: answerString.substring(0, 50),
              }
            );
            const updated = await TaskAnswerService.updateTaskAnswer(
              existing.id,
              {
                answer: answerString,
              }
            );
            console.log(
              "✅ [useQuestionsScreen] TaskAnswer updated successfully",
              {
                taskAnswerId: updated.id,
                questionId,
              }
            );
            savedAnswers.push(questionId);

            // Create or update DataPointInstance
            try {
              const dataPointPk = `DATAPOINT-${entityId}-${questionId}`;
              const dataPointSk = `SK-${Date.now()}-${questionId}`;
              const existingDataPoint = existingDataPointInstances.find(
                (dpi) =>
                  dpi.activityId === entityId && dpi.questionId === questionId
              );

              if (existingDataPoint) {
                console.log(
                  "🔄 [useQuestionsScreen] Updating existing DataPointInstance",
                  {
                    dataPointInstanceId: existingDataPoint.id,
                    questionId,
                    activityId: entityId,
                  }
                );
                await DataPointService.updateDataPointInstance(
                  existingDataPoint.id,
                  {
                    answers: answerString,
                  }
                );
                console.log(
                  "✅ [useQuestionsScreen] DataPointInstance updated successfully",
                  {
                    dataPointInstanceId: existingDataPoint.id,
                    questionId,
                  }
                );
              } else {
                console.log(
                  "➕ [useQuestionsScreen] Creating new DataPointInstance",
                  {
                    pk: dataPointPk,
                    sk: dataPointSk,
                    questionId,
                    activityId: entityId,
                    dataPointKey: questionId,
                  }
                );
                await DataPointService.createDataPointInstance({
                  pk: dataPointPk,
                  sk: dataPointSk,
                  dataPointKey: questionId,
                  activityId: entityId,
                  questionId,
                  answers: answerString,
                });
                console.log(
                  "✅ [useQuestionsScreen] DataPointInstance created successfully",
                  {
                    questionId,
                    activityId: entityId,
                  }
                );
              }
            } catch (dataPointError: any) {
              console.error(
                "❌ [useQuestionsScreen] Error saving DataPointInstance",
                {
                  questionId,
                  error:
                    dataPointError instanceof Error
                      ? dataPointError.message
                      : String(dataPointError),
                  stack:
                    dataPointError instanceof Error
                      ? dataPointError.stack
                      : undefined,
                }
              );
              // Don't fail the entire submission if data point creation fails
              // Log it but continue
            }
          } else {
            console.log("➕ [useQuestionsScreen] Creating new TaskAnswer", {
              pk,
              sk,
              questionId,
              taskId,
              entityId,
            });
            const created = await TaskAnswerService.createTaskAnswer({
              pk,
              sk,
              taskInstanceId: taskId,
              activityId: entityId,
              questionId,
              answer: answerString,
            });
            console.log(
              "✅ [useQuestionsScreen] TaskAnswer created successfully",
              {
                taskAnswerId: created.id,
                questionId,
                pk: created.pk,
              }
            );
            savedAnswers.push(questionId);

            // Create or update DataPointInstance
            try {
              const dataPointPk = `DATAPOINT-${entityId}-${questionId}`;
              const dataPointSk = `SK-${Date.now()}-${questionId}`;
              const existingDataPoint = existingDataPointInstances.find(
                (dpi) =>
                  dpi.activityId === entityId && dpi.questionId === questionId
              );

              if (existingDataPoint) {
                console.log(
                  "🔄 [useQuestionsScreen] Updating existing DataPointInstance",
                  {
                    dataPointInstanceId: existingDataPoint.id,
                    questionId,
                    activityId: entityId,
                  }
                );
                await DataPointService.updateDataPointInstance(
                  existingDataPoint.id,
                  {
                    answers: answerString,
                  }
                );
                console.log(
                  "✅ [useQuestionsScreen] DataPointInstance updated successfully",
                  {
                    dataPointInstanceId: existingDataPoint.id,
                    questionId,
                  }
                );
              } else {
                console.log(
                  "➕ [useQuestionsScreen] Creating new DataPointInstance",
                  {
                    pk: dataPointPk,
                    sk: dataPointSk,
                    questionId,
                    activityId: entityId,
                    dataPointKey: questionId,
                  }
                );
                await DataPointService.createDataPointInstance({
                  pk: dataPointPk,
                  sk: dataPointSk,
                  dataPointKey: questionId,
                  activityId: entityId,
                  questionId,
                  answers: answerString,
                });
                console.log(
                  "✅ [useQuestionsScreen] DataPointInstance created successfully",
                  {
                    questionId,
                    activityId: entityId,
                  }
                );
              }
            } catch (dataPointError: any) {
              console.error(
                "❌ [useQuestionsScreen] Error saving DataPointInstance",
                {
                  questionId,
                  error:
                    dataPointError instanceof Error
                      ? dataPointError.message
                      : String(dataPointError),
                  stack:
                    dataPointError instanceof Error
                      ? dataPointError.stack
                      : undefined,
                }
              );
              // Don't fail the entire submission if data point creation fails
              // Log it but continue
            }
          }
        } catch (error: any) {
          console.error("❌ [useQuestionsScreen] Error saving answer", {
            questionId,
            error: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
          failedAnswers.push({
            questionId,
            error: error?.message || "Unknown error",
          });
        }
      }

      // Report results
      console.log("📊 [useQuestionsScreen] Save operation complete", {
        totalAnswers: Object.keys(answers).length,
        savedCount: savedAnswers.length,
        failedCount: failedAnswers.length,
        savedQuestionIds: savedAnswers,
        failedQuestionIds: failedAnswers.map((f) => f.questionId),
      });

      // If some answers failed, show warning but continue
      if (failedAnswers.length > 0) {
        console.warn("⚠️ [useQuestionsScreen] Some answers failed to save", {
          failedAnswers,
        });
        Alert.alert(
          "Partial Success",
          `${savedAnswers.length} of ${
            Object.keys(answers).length
          } answers saved. Some answers failed to save.`
        );
      }

      // Determine task status based on answers
      if (taskId && activityData) {
        const totalQuestions = activityData.screens.reduce(
          (sum, screen) => sum + screen.elements.length,
          0
        );
        const answeredQuestions = savedAnswers.length;
        const allQuestionsAnswered =
          answeredQuestions === totalQuestions && failedAnswers.length === 0;
        const someQuestionsAnswered = answeredQuestions > 0;

        if (allQuestionsAnswered) {
          console.log(
            "🔄 [useQuestionsScreen] All questions answered - updating task status to COMPLETED",
            {
              taskId,
              totalQuestions,
              answeredQuestions,
            }
          );
          await TaskService.updateTask(taskId, {
            status: TaskStatus.COMPLETED,
          });
          console.log(
            "✅ [useQuestionsScreen] Task status updated to COMPLETED",
            {
              taskId,
              newStatus: TaskStatus.COMPLETED,
            }
          );
        } else if (someQuestionsAnswered) {
          console.log(
            "🔄 [useQuestionsScreen] Some questions answered - updating task status to INPROGRESS",
            {
              taskId,
              totalQuestions,
              answeredQuestions,
            }
          );
          await TaskService.updateTask(taskId, {
            status: TaskStatus.INPROGRESS,
          });
          console.log(
            "✅ [useQuestionsScreen] Task status updated to INPROGRESS",
            {
              taskId,
              newStatus: TaskStatus.INPROGRESS,
            }
          );
        } else {
          console.warn(
            "⚠️ [useQuestionsScreen] No answers saved - not updating task status",
            {
              taskId,
              savedCount: savedAnswers.length,
              failedCount: failedAnswers.length,
            }
          );
        }
      }

      if (failedAnswers.length === 0) {
        console.log("🎉 [useQuestionsScreen] Submission successful!", {
          taskId,
          entityId,
          answersSaved: savedAnswers.length,
        });

        // Show completion screen if configured, otherwise navigate
        if (activityConfig?.completionScreen?.showScreen) {
          console.log("✅ [useQuestionsScreen] Showing completion screen");
          setShowReview(false);
          setShowCompletion(true);
        } else {
          Alert.alert("Success", "All answers submitted and task completed!", [
            {
              text: "OK",
              onPress: () => {
                console.log(
                  "🧭 [useQuestionsScreen] User confirmed success, navigating to dashboard"
                );
                router.push("/(tabs)/dashboard-sim");
              },
            },
          ]);
        }
      } else {
        Alert.alert(
          "Warning",
          `Only ${savedAnswers.length} of ${
            Object.keys(answers).length
          } answers were saved. Please try again.`,
          [
            {
              text: "OK",
              onPress: () => {
                // Don't navigate away if answers failed
              },
            },
          ]
        );
      }
    } catch (error: any) {
      console.error("❌ [useQuestionsScreen] Error submitting answers:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        taskId,
        entityId,
        answersCount: Object.keys(answers).length,
      });
      Alert.alert(
        "Error",
        error?.message || "Failed to save answers. Please try again."
      );
    } finally {
      setIsSubmitting(false);
      console.log("🏁 [useQuestionsScreen] Submit process finished", {
        isSubmitting: false,
      });
    }
  }, [taskId, entityId, answers, activityData, activityConfig, router]);

  // Navigation handlers
  const handleNext = useCallback(() => {
    console.log("➡️ [useQuestionsScreen] Next button pressed", {
      currentScreen: currentScreenIndex,
      nextScreen: currentScreenIndex + 1,
    });
    if (validateCurrentScreen()) {
      setCurrentScreenIndex(currentScreenIndex + 1);
      setErrors({});
    } else {
      Alert.alert(
        "Validation Error",
        "Please answer all required questions before continuing."
      );
    }
  }, [currentScreenIndex, activityData, answers, validateCurrentScreen]);

  const handleReviewOrSubmit = useCallback(() => {
    if (validateCurrentScreen()) {
      if (activityConfig?.summaryScreen?.showScreen) {
        setShowReview(true);
      } else {
        handleSubmit();
      }
    } else {
      Alert.alert(
        "Validation Error",
        "Please answer all required questions before reviewing."
      );
    }
  }, [activityConfig, validateCurrentScreen, handleSubmit]);

  const handlePrevious = useCallback(() => {
    console.log("⬅️ [useQuestionsScreen] Previous button pressed", {
      currentScreen: currentScreenIndex,
      previousScreen: currentScreenIndex - 1,
    });
    setCurrentScreenIndex(currentScreenIndex - 1);
    setErrors({});
  }, [currentScreenIndex]);

  const handleBegin = useCallback(() => {
    console.log("🚀 [useQuestionsScreen] Begin button pressed");
    setShowIntroduction(false);
    setCurrentScreenIndex(0);
  }, []);

  const handleBackToQuestions = useCallback(() => {
    console.log("⬅️ [useQuestionsScreen] Back to questions from review");
    setShowReview(false);
    if (activityData) {
      setCurrentScreenIndex(activityData.screens.length - 1);
    }
  }, [activityData]);

  const handleCompletionDone = useCallback(() => {
    console.log(
      "✅ [useQuestionsScreen] Completion screen - navigating to dashboard"
    );
    router.push("/(tabs)/dashboard-sim");
  }, [router]);

  const handleBack = useCallback(() => {
    console.log(
      "🧭 [useQuestionsScreen] Back button pressed, navigating to dashboard"
    );
    router.push("/(tabs)/dashboard-sim");
  }, [router]);

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
    taskId,
    entityId,

    // Actions
    handleAnswerChange,
    handleSubmit,
    handleNext,
    handlePrevious,
    handleBegin,
    handleBackToQuestions,
    handleReviewSubmit: handleReviewOrSubmit,
    handleCompletionDone,
    handleBack,
  };
};
