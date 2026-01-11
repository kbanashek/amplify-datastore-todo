import {
  ParsedElement,
  ParsedScreen,
  Validation,
} from "@task-types/ActivityConfig";
import {
  CompareFact,
  QuestionType,
  ValidationType,
} from "@task-types/activity-config-enums";
import type { AnswerValue } from "@task-types/AnswerValue";
import { getServiceLogger } from "@utils/logging/serviceLogger";

/**
 * Type for validation answer map used in cross-field comparisons.
 * Maps question IDs to their answer values.
 */
export type ValidationAnswers = Record<string, AnswerValue>;

/**
 * Validates a single question answer
 * Returns array of error messages (empty if valid)
 */
export const validateQuestionAnswer = (
  question: ParsedElement["question"],
  answer: AnswerValue,
  allAnswers?: ValidationAnswers
): string[] => {
  const errors: string[] = [];
  const isNumberField =
    question.type === QuestionType.NUMBER ||
    question.type === QuestionType.NUMBER_FIELD ||
    question.type === QuestionType.NUMERIC_SCALE;

  // For number fields, check if the value is a valid number
  if (
    isNumberField &&
    answer !== null &&
    answer !== undefined &&
    answer !== ""
  ) {
    const answerStr = String(answer).trim();
    const isValidNumberFormat = /^-?\d+(\.\d+)?$/.test(answerStr);
    const answerNum = parseFloat(answerStr);
    const isNaNValue = isNaN(answerNum);

    if (!isValidNumberFormat || isNaNValue || answerStr === "") {
      errors.push("Please enter a valid number");
      return errors; // Exit early - can't validate min/max on invalid number
    }
  }

  // Required field validation
  if (
    question.required &&
    (answer === null ||
      answer === undefined ||
      answer === "" ||
      (Array.isArray(answer) && answer.length === 0))
  ) {
    const errorMsg =
      question.validations?.find(v => v.type === ValidationType.REQUIRED)
        ?.text || "This field is required.";
    errors.push(errorMsg);
  }

  // Check other validations if answer is not empty
  if (
    question.validations &&
    answer !== null &&
    answer !== undefined &&
    answer !== ""
  ) {
    question.validations.forEach((validation: Validation) => {
      if (validation.warningOnly) {
        return;
      }

      const answerStr = String(answer);
      const answerNum = parseFloat(answerStr);

      // Min validation
      if (validation.type === ValidationType.MIN && validation.value) {
        const min = parseFloat(validation.value);
        if (!isNaN(answerNum) && !isNaN(min) && answerNum < min) {
          errors.push(validation.text || `Value must be at least ${min}`);
        }
      }

      // Max validation
      if (validation.type === ValidationType.MAX && validation.value) {
        const max = parseFloat(validation.value);
        if (!isNaN(answerNum) && !isNaN(max) && answerNum > max) {
          errors.push(validation.text || `Value must be at most ${max}`);
        }
      }

      // Pattern validation
      if (validation.type === ValidationType.PATTERN && validation.value) {
        try {
          const regex = new RegExp(validation.value);
          if (!regex.test(answerStr)) {
            errors.push(
              validation.text || "Value does not match required format"
            );
          }
        } catch (error) {
          const logger = getServiceLogger("questionValidation");
          logger.warn(
            "Invalid regex pattern in validation",
            {
              error: error instanceof Error ? error.message : String(error),
              pattern: validation.value,
            },
            undefined,
            "⚠️"
          );
        }
      }

      // Email validation
      if (validation.type === ValidationType.EMAIL) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(answerStr)) {
          errors.push(validation.text || "Please enter a valid email address");
        }
      }

      // URL validation
      if (validation.type === ValidationType.URL) {
        try {
          new URL(answerStr);
        } catch {
          errors.push(validation.text || "Please enter a valid URL");
        }
      }

      // String length validation
      if (validation.type === ValidationType.MIN_LENGTH && validation.value) {
        const minLength = parseInt(validation.value, 10);
        if (!isNaN(minLength) && answerStr.length < minLength) {
          errors.push(
            validation.text || `Value must be at least ${minLength} characters`
          );
        }
      }

      if (validation.type === ValidationType.MAX_LENGTH && validation.value) {
        const maxLength = parseInt(validation.value, 10);
        if (!isNaN(maxLength) && answerStr.length > maxLength) {
          errors.push(
            validation.text || `Value must be at most ${maxLength} characters`
          );
        }
      }

      // Cross-field comparison
      if (
        validation.type === ValidationType.COMPARE &&
        validation.comparePath &&
        validation.value &&
        allAnswers
      ) {
        const compareAnswer = allAnswers[validation.comparePath];
        if (compareAnswer !== undefined && compareAnswer !== null) {
          const compareValue = parseFloat(String(compareAnswer));
          const currentValue = parseFloat(answerStr);
          if (!isNaN(compareValue) && !isNaN(currentValue)) {
            const fact = validation.compareFact || CompareFact.EQUAL;
            let comparisonFailed = false;

            switch (fact) {
              case CompareFact.GREATER_THAN:
                comparisonFailed = currentValue <= compareValue;
                break;
              case CompareFact.LESS_THAN:
                comparisonFailed = currentValue >= compareValue;
                break;
              case CompareFact.EQUAL:
                comparisonFailed = currentValue !== compareValue;
                break;
              case CompareFact.NOT_EQUAL:
                comparisonFailed = currentValue === compareValue;
                break;
            }

            if (comparisonFailed) {
              errors.push(validation.text || `Value comparison failed`);
            }
          }
        }
      }
    });
  }

  return errors;
};

/**
 * Validates all questions in a screen
 * Returns object mapping questionId to error messages
 */
export const validateScreen = (
  screen: ParsedScreen,
  answers: ValidationAnswers
): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  screen.elements.forEach(element => {
    const question = element.question;
    const answer = answers[question.id];
    const questionErrors = validateQuestionAnswer(question, answer, answers);

    if (questionErrors.length > 0) {
      errors[question.id] = questionErrors;
    }
  });

  return errors;
};

/**
 * Validates all questions across all screens
 * Returns object mapping questionId to error messages
 */
export const validateAllScreens = (
  screens: ParsedScreen[],
  answers: ValidationAnswers
): Record<string, string[]> => {
  const errors: Record<string, string[]> = {};

  screens.forEach(screen => {
    const screenErrors = validateScreen(screen, answers);
    Object.assign(errors, screenErrors);
  });

  return errors;
};

/**
 * Checks if a screen is valid (no errors)
 */
export const isScreenValid = (
  screen: ParsedScreen,
  answers: ValidationAnswers
): boolean => {
  const errors = validateScreen(screen, answers);
  return Object.keys(errors).length === 0;
};
