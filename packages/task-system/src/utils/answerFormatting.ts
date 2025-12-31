import { ParsedElement } from "@task-types/ActivityConfig";
import type { AnswerValue } from "@task-types/AnswerValue";

/**
 * Formats an answer value for display in the review screen.
 *
 * Handles different question types and formats the answer appropriately:
 * - **multiselect**: Joins selected choice texts with commas
 * - **singleselect**: Returns the selected choice text
 * - **text**: Truncates long strings to 100 characters
 * - **other types**: Converts to string representation
 *
 * @param element - The parsed element containing the question configuration
 * @param answer - The answer value to format (can be string, array, or any type)
 * @param notAnsweredText - Text to display when no answer is provided (default: "Not answered")
 * @returns Formatted answer string suitable for display
 *
 * @example
 * ```typescript
 * // Multiselect question
 * const element = { question: { type: "multiselect", choices: [...] } };
 * const answer = ["choice1", "choice2"];
 * const formatted = formatAnswer(element, answer);
 * // Returns: "Choice 1, Choice 2"
 *
 * // Single select question
 * const element = { question: { type: "singleselect", choices: [...] } };
 * const answer = "choice1";
 * const formatted = formatAnswer(element, answer);
 * // Returns: "Choice 1"
 *
 * // Empty answer
 * const formatted = formatAnswer(element, null, "No answer");
 * // Returns: "No answer"
 * ```
 */
export const formatAnswer = (
  element: ParsedElement,
  answer: AnswerValue,
  notAnsweredText: string = "Not answered"
): string => {
  if (answer === null || answer === undefined || answer === "") {
    return notAnsweredText;
  }

  const question = element.question;

  // Handle multiselect questions
  if (question.type === "multiselect" && Array.isArray(answer)) {
    if (answer.length === 0) return notAnsweredText;

    // Find choice texts for selected values
    const choiceTexts = answer
      .map(val => {
        const choice = question.choices?.find(
          c => c.value === val || c.id === val
        );
        return choice?.text || val;
      })
      .filter(Boolean);

    return choiceTexts.join(", ");
  }

  // Handle singleselect questions
  if (question.type === "singleselect") {
    const choice = question.choices?.find(
      c => c.value === answer || c.id === answer
    );
    return choice?.text || String(answer);
  }

  // Truncate long text answers
  if (typeof answer === "string" && answer.length > 100) {
    return answer.substring(0, 100) + "...";
  }

  // Handle objects (convert to JSON string)
  if (typeof answer === "object" && answer !== null) {
    return JSON.stringify(answer);
  }

  // Default: convert to string
  return String(answer);
};
