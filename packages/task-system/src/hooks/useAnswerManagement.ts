import { useCallback, useState } from "react";
import { ParsedActivityData } from "@utils/activityParser";
import { validateQuestionAnswer } from "@utils/questionValidation";
import type { AnswerValue } from "@task-types/AnswerValue";

/**
 * Return type for the useAnswerManagement hook.
 */
export interface UseAnswerManagementReturn {
  /** Current answers keyed by question ID */
  answers: Record<string, AnswerValue>;
  /** Validation errors keyed by question ID */
  errors: Record<string, string[]>;
  /** Setter for answers state */
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, AnswerValue>>>;
  /** Setter for errors state */
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  /** Handler for answer changes with immediate validation */
  handleAnswerChange: (questionId: string, answer: AnswerValue) => void;
}

/**
 * Configuration options for the useAnswerManagement hook.
 */
export interface UseAnswerManagementOptions {
  /** Parsed activity data containing questions and validation rules */
  activityData: ParsedActivityData | null;
  /** Current screen index in the question flow */
  currentScreenIndex: number;
  /** Optional initial answers to pre-populate */
  initialAnswers?: Record<string, AnswerValue>;
}

/**
 * React hook for managing answer state and real-time validation.
 *
 * Handles answer changes and triggers immediate validation against
 * the question's validation rules. Errors are cleared when answers
 * become valid.
 *
 * @param options - Configuration including activity data and current screen
 * @returns Object containing answers, errors, and change handlers
 *
 * @example
 * ```tsx
 * const {
 *   answers,
 *   errors,
 *   handleAnswerChange,
 * } = useAnswerManagement({
 *   activityData,
 *   currentScreenIndex,
 *   initialAnswers: previousAnswers,
 * });
 *
 * // Handle a text input change
 * <TextInput
 *   value={answers["question-1"] as string}
 *   onChangeText={(text) => handleAnswerChange("question-1", text)}
 * />
 *
 * // Display validation errors
 * {errors["question-1"]?.map(err => <ErrorText key={err}>{err}</ErrorText>)}
 * ```
 */
export const useAnswerManagement = ({
  activityData,
  currentScreenIndex,
  initialAnswers = {},
}: UseAnswerManagementOptions): UseAnswerManagementReturn => {
  const [answers, setAnswers] =
    useState<Record<string, AnswerValue>>(initialAnswers);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleAnswerChange = useCallback(
    (questionId: string, answer: AnswerValue) => {
      // Update answer state
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer,
      }));

      // Validate immediately if we're on a question screen
      if (
        activityData &&
        currentScreenIndex >= 0 &&
        currentScreenIndex < activityData.screens.length
      ) {
        const currentScreen = activityData.screens[currentScreenIndex];
        const element = currentScreen.elements.find(
          el => el.question.id === questionId
        );

        if (element) {
          const question = element.question;
          const questionErrors = validateQuestionAnswer(
            question,
            answer,
            { ...answers, [questionId]: answer } // Include the new answer
          );

          // Update errors for this question
          setErrors(prev => {
            const newErrors = { ...prev };
            if (questionErrors.length > 0) {
              newErrors[questionId] = questionErrors;
            } else {
              delete newErrors[questionId];
            }
            return newErrors;
          });
        }
      }
    },
    [activityData, currentScreenIndex, answers]
  );

  return {
    answers,
    errors,
    setAnswers,
    setErrors,
    handleAnswerChange,
  };
};
