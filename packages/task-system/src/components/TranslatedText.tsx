import React from "react";
import { Text, TextProps } from "react-native";
import { TranslationMemoryService } from "@services/TranslationMemoryService";
import { useTaskTranslation, type LanguageCode } from "@translations/index";
import { getServiceLogger } from "@utils/serviceLogger";

const logger = getServiceLogger("TranslatedText");

interface TranslatedTextProps extends Omit<TextProps, "children"> {
  text: string;
  sourceLanguage?: string;
  /**
   * Optional translation key (e.g., "task.begin", "common.ok")
   * If not provided, will attempt to find key from text or use text as-is
   */
  translationKey?: string;
}

/**
 * Maps common text strings to translation keys
 * This helps migrate from old string-based translations to key-based
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
 * Component that automatically translates text based on current language
 * Also applies RTL text alignment for RTL languages
 * Usage: <TranslatedText text="Hello" /> or <TranslatedText text="BEGIN" translationKey="task.begin" />
 */
export const TranslatedText: React.FC<TranslatedTextProps> = ({
  text,
  sourceLanguage,
  translationKey,
  style,
  ...props
}) => {
  const { t, isRTL, currentLanguage, i18n } = useTaskTranslation();

  // Determine the translation key
  const key = translationKey || TEXT_TO_KEY_MAP[text] || text;

  // Get current language from i18n instance (this is reactive to language changes)
  const lang = i18n.language || currentLanguage;

  // Compute translation directly - no useMemo, so it recomputes on every render
  // This ensures it updates immediately when language changes
  let translatedText: string;

  // Priority 1: Use translation key (i18next)
  if (TEXT_TO_KEY_MAP[text] || translationKey) {
    translatedText = t(key, { fallback: text });
  }
  // Priority 2: Use translation memory for dynamic text (task titles, etc.)
  else if (lang !== "en" && text) {
    const memoryTranslation = TranslationMemoryService.getTranslationSync(
      text,
      (sourceLanguage || "en") as LanguageCode,
      lang as LanguageCode
    );
    translatedText = memoryTranslation || text;
  }
  // Priority 3: Fallback to original text
  else {
    translatedText = text;
  }

  // Debug logging is gated behind i18next debug flag (TranslationProvider debug prop)
  const debugEnabled = Boolean(
    (i18n as unknown as { options?: { debug?: boolean } }).options?.debug
  );
  if (debugEnabled) {
    logger.debug("render", {
      text: text?.substring(0, 60),
      lang,
      i18nLanguage: i18n.language,
      currentLanguage,
      key,
      translatedText: translatedText?.substring(0, 60),
    });
  }

  return (
    <Text
      key={`translated-${lang}-${text?.substring(0, 20)}`}
      style={[style, isRTL && { textAlign: "right" }]}
      {...props}
    >
      {translatedText}
    </Text>
  );
};
