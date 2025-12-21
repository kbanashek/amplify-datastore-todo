import { useEffect, useState, useRef } from "react";
import { useTranslation } from "../contexts/TranslationContext";
import { DEBUG_TRANSLATION_LOGS } from "../utils/debug";
import { getServiceLogger } from "../utils/serviceLogger";

const logger = getServiceLogger("useTranslatedText");

/**
 * Hook to translate text with loading state
 * Returns the translated text when ready, or original text while translating
 *
 * Optimizations:
 * - Checks cache synchronously before triggering translation
 * - Uses memoization to prevent unnecessary re-translations
 * - Deduplicates requests (handled by TranslationService)
 */
export const useTranslatedText = (
  text: string,
  sourceLanguage?: string
): { translatedText: string; isTranslating: boolean } => {
  const {
    translate,
    currentLanguage,
    isTranslating: globalIsTranslating,
  } = useTranslation();
  const [translatedText, setTranslatedText] = useState<string>(text);
  const [isTranslating, setIsTranslating] = useState(false);
  const previousTextRef = useRef<string>("");
  const previousLanguageRef = useRef<string>("");

  useEffect(() => {
    // Skip if text or language hasn't changed
    if (
      text === previousTextRef.current &&
      currentLanguage === previousLanguageRef.current
    ) {
      return;
    }

    if (DEBUG_TRANSLATION_LOGS) {
      logger.debug(
        "Effect triggered",
        {
          text: text.substring(0, 50),
          currentLanguage,
          previousLanguage: previousLanguageRef.current,
          sourceLanguage,
          textChanged: text !== previousTextRef.current,
          languageChanged: currentLanguage !== previousLanguageRef.current,
        },
        undefined,
        "🌐"
      );
    }

    // Update refs immediately to prevent duplicate calls
    previousTextRef.current = text;
    previousLanguageRef.current = currentLanguage;

    if (!text || text.trim().length === 0) {
      setTranslatedText(text);
      setIsTranslating(false);
      return;
    }

    // If current language is English (default), don't translate
    if (currentLanguage === "en" || currentLanguage === sourceLanguage) {
      if (DEBUG_TRANSLATION_LOGS) {
        logger.debug(
          "Skipping translation (English or same language)",
          {
            currentLanguage,
            sourceLanguage,
          },
          undefined,
          "🌐"
        );
      }
      setTranslatedText(text);
      setIsTranslating(false);
      return;
    }

    // Force re-translation if language changed (even if text is the same)
    if (
      currentLanguage !== previousLanguageRef.current &&
      text === previousTextRef.current
    ) {
      if (DEBUG_TRANSLATION_LOGS) {
        logger.debug(
          "Language changed, re-translating same text",
          {
            text: text.substring(0, 50),
            oldLanguage: previousLanguageRef.current,
            newLanguage: currentLanguage,
          },
          undefined,
          "🌐"
        );
      }
    }

    if (DEBUG_TRANSLATION_LOGS) {
      logger.debug(
        "Triggering translation",
        {
          text: text.substring(0, 50),
          currentLanguage,
          sourceLanguage,
          previousLanguage: previousLanguageRef.current,
        },
        undefined,
        "🌐"
      );
    }

    // Translate the text
    setIsTranslating(true);

    translate(text, sourceLanguage as any)
      .then(translated => {
        if (DEBUG_TRANSLATION_LOGS) {
          logger.debug(
            "Translation completed",
            {
              original: text.substring(0, 50),
              translated: translated.substring(0, 50),
              changed: translated !== text,
              currentLanguage,
              previousLanguage: previousLanguageRef.current,
            },
            undefined,
            "🌐"
          );
        }
        // Only update if language hasn't changed during translation
        if (currentLanguage === previousLanguageRef.current) {
          setTranslatedText(translated);
        } else {
          if (DEBUG_TRANSLATION_LOGS) {
            logger.debug(
              "Language changed during translation, skipping update",
              undefined,
              undefined,
              "🌐"
            );
          }
        }
      })
      .catch(error => {
        if (DEBUG_TRANSLATION_LOGS) {
          logger.error("Translation error", error, undefined, "🌐");
        }
        // Only update if language hasn't changed during translation
        if (currentLanguage === previousLanguageRef.current) {
          setTranslatedText(text); // Fallback to original
        }
      })
      .finally(() => {
        setIsTranslating(false);
      });
  }, [text, currentLanguage, sourceLanguage, translate]);

  return {
    translatedText,
    isTranslating: isTranslating || globalIsTranslating,
  };
};
