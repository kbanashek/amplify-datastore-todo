import { useEffect, useState, useRef, useMemo } from "react";
import { useTaskTranslation } from "@translations/index";
import { getServiceLogger } from "@utils/serviceLogger";

const logger = getServiceLogger("useTranslatedText");

/**
 * Maps common text strings to translation keys for i18next
 */
const TEXT_TO_KEY_MAP: Record<string, string> = {
  BEGIN: "task.begin",
  RESUME: "task.resume",
  COMPLETED: "task.completed",
  "DUE BY": "task.dueBy",
  "Loading tasks...": "task.loading",
  Today: "task.today",
  Dashboard: "task.dashboard",
  "starts at": "task.startsAt",
  Required: "activity.required",
  "Not answered": "activity.notAnswered",
  "Answer Questions": "activity.answerQuestions",
  OK: "common.ok",
  CANCEL: "common.cancel",
  Back: "common.back",
  Next: "common.next",
  Previous: "common.previous",
  Submit: "common.submit",
  Review: "common.review",
  Save: "common.save",
  Delete: "common.delete",
  Edit: "common.edit",
  Close: "common.close",
  "Validation Error": "questions.validationError",
  "Please answer all required questions before continuing.":
    "questions.pleaseAnswerRequired",
  "Please answer all required questions before reviewing.":
    "questions.pleaseAnswerRequiredReview",
};

/**
 * React hook to translate text with loading state awareness.
 *
 * Provides a compatibility wrapper for the i18next translation system.
 * Maps common text strings to translation keys and falls back to dynamic
 * translation for unmapped strings.
 *
 * With i18next, translations are synchronous after initialization,
 * so `isTranslating` is mainly for API compatibility and initial load.
 *
 * @param text - The text to translate (can be a key or literal text)
 * @param sourceLanguage - Optional source language code (currently unused, for API compatibility)
 * @returns Object containing:
 *   - `translatedText`: The translated string (or original if translation unavailable)
 *   - `isTranslating`: Whether translation is still loading
 *
 * @example
 * ```tsx
 * // Translate a button label
 * const { translatedText } = useTranslatedText("Submit");
 * return <Button title={translatedText} />;
 *
 * // With loading awareness
 * const { translatedText, isTranslating } = useTranslatedText("Loading tasks...");
 * if (isTranslating) return <Skeleton />;
 * return <Text>{translatedText}</Text>;
 * ```
 */
export const useTranslatedText = (
  text: string,
  sourceLanguage?: string
): { translatedText: string; isTranslating: boolean } => {
  const { t, currentLanguage, ready } = useTaskTranslation();
  const [translatedText, setTranslatedText] = useState<string>(text);
  const previousTextRef = useRef<string>("");
  const previousLanguageRef = useRef<string>("");

  // Translate text using i18next (synchronous)
  const translated = useMemo(() => {
    if (!text || text.trim().length === 0) {
      return text;
    }

    // If current language is English or same as source, return original
    if (currentLanguage === "en" || currentLanguage === sourceLanguage) {
      return text;
    }

    // Try to find translation key for known strings
    const translationKey = TEXT_TO_KEY_MAP[text];
    if (translationKey) {
      return t(translationKey, { fallback: text });
    }

    // For unknown strings, return as-is (will be handled by activity-specific translations or fallback)
    return text;
  }, [text, currentLanguage, sourceLanguage, t]);

  // Update state when translation changes
  useEffect(() => {
    const languageChanged = currentLanguage !== previousLanguageRef.current;
    const textChanged = text !== previousTextRef.current;

    if (languageChanged || textChanged) {
      setTranslatedText(translated);
      previousTextRef.current = text;
      previousLanguageRef.current = currentLanguage;
    }
  }, [translated, text, currentLanguage]);

  return {
    translatedText: translated,
    isTranslating: !ready,
  };
};
