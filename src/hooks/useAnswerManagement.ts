import { useCallback, useState } from "react";
import { ParsedActivityData } from "../utils/activityParser";
import { validateQuestionAnswer } from "../utils/questionValidation";

export interface UseAnswerManagementReturn {
  answers: Record<string, any>;
  errors: Record<string, string[]>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  setErrors: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  handleAnswerChange: (questionId: string, answer: any) => void;
}

export interface UseAnswerManagementOptions {
  activityData: ParsedActivityData | null;
  currentScreenIndex: number;
  initialAnswers?: Record<string, any>;
}

/**
 * Hook for managing answer state and real-time validation
 * Handles answer changes and triggers immediate validation
 */
export const useAnswerManagement = ({
  activityData,
  currentScreenIndex,
  initialAnswers = {},
}: UseAnswerManagementOptions): UseAnswerManagementReturn => {
  const [answers, setAnswers] = useState<Record<string, any>>(initialAnswers);
  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const handleAnswerChange = useCallback(
    (questionId: string, answer: any) => {
      // Update answer state
      setAnswers((prev) => ({
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
          (el) => el.question.id === questionId
        );

        if (element) {
          const question = element.question;
          const questionErrors = validateQuestionAnswer(
            question,
            answer,
            { ...answers, [questionId]: answer } // Include the new answer
          );

          // Update errors for this question
          setErrors((prev) => {
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
