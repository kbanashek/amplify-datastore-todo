/**
 * Type definitions for question answer values
 *
 * This module provides type-safe handling of question answers throughout
 * the application. Different question types require different answer formats,
 * and these types ensure proper handling at compile time.
 *
 * @module AnswerValue
 */

/**
 * Union type for all possible question answer values.
 *
 * Provides type safety for answer handling across the application.
 * Different question types use different value formats:
 *
 * - Text questions: `string`
 * - Number questions: `string` (numeric string)
 * - Single-select: `string` (option ID)
 * - Multi-select: `string[]` (array of option IDs)
 * - Date questions: `Date`
 * - Weight/Height: `{ value: string; unit: string }`
 * - Not answered: `null` or `undefined`
 *
 * @example
 * ```typescript
 * const textAnswer: AnswerValue = "Patient response";
 * const selectAnswer: AnswerValue = "option-1";
 * const multiAnswer: AnswerValue = ["option-1", "option-2"];
 * const weightAnswer: AnswerValue = { value: "70", unit: "kg" };
 * ```
 */
export type AnswerValue =
  | string // Text, Single-select
  | string[] // Multi-select
  | Date // Date questions
  | { value: string; unit: string } // Weight/Height
  | null // No answer yet
  | undefined; // Not answered

/**
 * Discriminated union for type-safe answer handling.
 *
 * Use this when you need to handle different answer types
 * with type narrowing based on the question type.
 *
 * @example
 * ```typescript
 * function processAnswer(answer: TypedAnswer) {
 *   switch (answer.type) {
 *     case 'text':
 *       return answer.value.toUpperCase();
 *     case 'multi-select':
 *       return answer.value.join(', ');
 *     // TypeScript ensures all cases are handled
 *   }
 * }
 * ```
 */
export type TypedAnswer =
  | { type: "text"; value: string }
  | { type: "number"; value: string }
  | { type: "single-select"; value: string }
  | { type: "multi-select"; value: string[] }
  | { type: "date"; value: Date }
  | { type: "weight-height"; value: { value: string; unit: string } }
  | { type: "empty"; value: null };

/**
 * Type guard to check if an answer is empty (null or undefined).
 *
 * @param answer - The answer value to check
 * @returns True if the answer is null or undefined
 *
 * @example
 * ```typescript
 * if (isEmptyAnswer(answer)) {
 *   showRequiredError();
 * }
 * ```
 */
export const isEmptyAnswer = (
  answer: AnswerValue
): answer is null | undefined => {
  return answer === null || answer === undefined;
};

/**
 * Type guard to check if an answer is a string.
 *
 * Use this to safely handle text and single-select answers.
 *
 * @param answer - The answer value to check
 * @returns True if the answer is a string
 *
 * @example
 * ```typescript
 * if (isStringAnswer(answer)) {
 *   validateTextLength(answer);
 * }
 * ```
 */
export const isStringAnswer = (answer: AnswerValue): answer is string => {
  return typeof answer === "string";
};

/**
 * Type guard to check if an answer is an array (multi-select).
 *
 * @param answer - The answer value to check
 * @returns True if the answer is a string array
 *
 * @example
 * ```typescript
 * if (isArrayAnswer(answer)) {
 *   validateMaxSelections(answer.length);
 * }
 * ```
 */
export const isArrayAnswer = (answer: AnswerValue): answer is string[] => {
  return Array.isArray(answer);
};

/**
 * Type guard to check if an answer is a Date.
 *
 * @param answer - The answer value to check
 * @returns True if the answer is a Date object
 *
 * @example
 * ```typescript
 * if (isDateAnswer(answer)) {
 *   formatDate(answer);
 * }
 * ```
 */
export const isDateAnswer = (answer: AnswerValue): answer is Date => {
  return answer instanceof Date;
};

/**
 * Type guard to check if an answer is a weight/height measurement.
 *
 * @param answer - The answer value to check
 * @returns True if the answer has value and unit properties
 *
 * @example
 * ```typescript
 * if (isWeightHeightAnswer(answer)) {
 *   console.log(`${answer.value} ${answer.unit}`);
 * }
 * ```
 */
export const isWeightHeightAnswer = (
  answer: AnswerValue
): answer is { value: string; unit: string } => {
  return (
    typeof answer === "object" &&
    answer !== null &&
    "value" in answer &&
    "unit" in answer
  );
};

/**
 * Validates if an answer value is valid for its type.
 *
 * @param answer - The answer value to validate
 * @returns True if the answer is in a valid format
 *
 * @example
 * ```typescript
 * if (!isValidAnswer(answer)) {
 *   throw new Error('Invalid answer format');
 * }
 * ```
 */
export const isValidAnswer = (answer: AnswerValue): boolean => {
  // Empty answers are valid (not required)
  if (isEmptyAnswer(answer)) {
    return true;
  }

  // String answers must not be empty strings
  if (isStringAnswer(answer)) {
    return answer.trim().length > 0;
  }

  // Array answers must not be empty arrays
  if (isArrayAnswer(answer)) {
    return answer.length > 0;
  }

  // Date answers must be valid dates
  if (isDateAnswer(answer)) {
    return !isNaN(answer.getTime());
  }

  // Weight/height answers must have both value and unit
  if (isWeightHeightAnswer(answer)) {
    return answer.value.trim().length > 0 && answer.unit.trim().length > 0;
  }

  return false;
};

/**
 * Converts an answer value to a display string.
 *
 * @param answer - The answer value to convert
 * @returns A human-readable string representation
 *
 * @example
 * ```typescript
 * const display = answerToString(answer);
 * // "70 kg" or "Option 1, Option 2" or "2024-01-15"
 * ```
 */
export const answerToString = (answer: AnswerValue): string => {
  if (isEmptyAnswer(answer)) {
    return "";
  }

  if (isStringAnswer(answer)) {
    return answer;
  }

  if (isArrayAnswer(answer)) {
    return answer.join(", ");
  }

  if (isDateAnswer(answer)) {
    return answer.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  if (isWeightHeightAnswer(answer)) {
    return `${answer.value} ${answer.unit}`;
  }

  return String(answer);
};
