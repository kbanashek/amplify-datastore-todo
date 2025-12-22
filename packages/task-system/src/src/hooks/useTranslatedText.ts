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
    // Always log when effect runs for debugging
    logger.debug(
      "useTranslatedText effect triggered",
      {
        text: text?.substring(0, 50) || "(empty)",
        currentLanguage,
        previousLanguage: previousLanguageRef.current,
        sourceLanguage,
        textChanged: text !== previousTextRef.current,
        languageChanged: currentLanguage !== previousLanguageRef.current,
      },
      undefined,
      "🌐"
    );

    // Save previous values BEFORE updating refs (needed for comparison)
    const previousLanguage = previousLanguageRef.current;
    const previousText = previousTextRef.current;
    const languageChanged = currentLanguage !== previousLanguage;
    const textChanged = text !== previousText;

    // Skip if text AND language haven't changed
    if (!languageChanged && !textChanged) {
      logger.debug(
        "Skipping - no changes detected",
        {
          text: text?.substring(0, 50) || "(empty)",
          currentLanguage,
        },
        undefined,
        "🌐"
      );
      return;
    }

    // Update refs immediately to prevent duplicate calls
    previousTextRef.current = text;
    previousLanguageRef.current = currentLanguage;

    if (!text || text.trim().length === 0) {
      logger.debug("Empty text, setting directly", undefined, undefined, "🌐");
      setTranslatedText(text);
      setIsTranslating(false);
      return;
    }

    // If current language is English (default), don't translate - return original immediately
    if (currentLanguage === "en" || currentLanguage === sourceLanguage) {
      logger.debug(
        "English or same language - returning original text immediately",
        {
          currentLanguage,
          sourceLanguage,
          text: text.substring(0, 50),
          previousLanguage,
          currentState: translatedText?.substring(0, 50),
          willUpdate: translatedText !== text,
        },
        undefined,
        "🌐"
      );
      // CRITICAL: Always update state when language changes, even if it's English
      // This ensures components re-render when switching back to English
      // Always update if language changed, even if text is the same
      if (languageChanged) {
        logger.debug(
          "Language changed to English - forcing state update",
          {
            previous: translatedText?.substring(0, 50),
            new: text.substring(0, 50),
            previousLanguage,
            currentLanguage,
          },
          undefined,
          "🌐"
        );
        // Force update by always setting new value when language changes
        setTranslatedText(text);
      } else {
        // Only update if text actually changed
        setTranslatedText(prev => {
          if (prev !== text) {
            logger.debug(
              "Text changed for English language",
              {
                previous: prev?.substring(0, 50),
                new: text.substring(0, 50),
              },
              undefined,
              "🌐"
            );
            return text;
          }
          return prev;
        });
      }
      setIsTranslating(false);
      return;
    }

    // Force re-translation if language changed (even if text is the same)
    if (languageChanged && !textChanged) {
      logger.debug(
        "Language changed, re-translating same text",
        {
          text: text.substring(0, 50),
          oldLanguage: previousLanguage,
          newLanguage: currentLanguage,
        },
        undefined,
        "🌐"
      );
    }

    logger.debug(
      "Triggering translation",
      {
        text: text.substring(0, 50),
        currentLanguage,
        sourceLanguage,
        previousLanguage,
      },
      undefined,
      "🌐"
    );

    // Translate the text
    setIsTranslating(true);

    // Capture current language at translation start to detect if it changed during translation
    const languageAtStart = currentLanguage;

    translate(text, sourceLanguage as any)
      .then(translated => {
        // Check if language changed during translation
        const languageChangedDuringTranslation =
          currentLanguage !== languageAtStart;
        const currentState = translatedText;
        const willUpdate = currentState !== translated;

        logger.debug(
          "Translation completed",
          {
            original: text.substring(0, 50),
            translated: translated.substring(0, 50),
            currentState: currentState?.substring(0, 50) || "(empty)",
            changed: translated !== text,
            currentLanguage,
            languageAtStart,
            previousLanguage,
            languageChangedDuringTranslation,
            languageStillMatches:
              currentLanguage === previousLanguageRef.current,
            willUpdate,
            willTriggerRerender: willUpdate,
          },
          undefined,
          "🌐"
        );

        // CRITICAL: Always update with translated text
        // Even if language changed during translation, we still want to show the translation
        // The effect will re-run if language changed and trigger a new translation
        if (willUpdate) {
          logger.debug(
            "Setting translated text state",
            {
              from: currentState?.substring(0, 50) || "(empty)",
              to: translated.substring(0, 50),
            },
            undefined,
            "🌐"
          );
        }
        setTranslatedText(translated);
      })
      .catch(error => {
        logger.error(
          "Translation error",
          error,
          {
            text: text.substring(0, 50),
            currentLanguage,
          },
          "🌐"
        );
        // Always update with original text on error
        setTranslatedText(text);
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
