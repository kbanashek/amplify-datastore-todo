import { useEffect, useState, useRef } from "react";
import { useTranslation } from "../contexts/TranslationContext";
import { DEBUG_TRANSLATION_LOGS } from "../utils/debug";

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
      console.log("🌐 [useTranslatedText] Effect triggered", {
        text: text.substring(0, 50),
        currentLanguage,
        previousLanguage: previousLanguageRef.current,
        sourceLanguage,
        textChanged: text !== previousTextRef.current,
        languageChanged: currentLanguage !== previousLanguageRef.current,
      });
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
        console.log(
          "🌐 [useTranslatedText] Skipping translation (English or same language)",
          {
            currentLanguage,
            sourceLanguage,
          }
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
        console.log(
          "🌐 [useTranslatedText] Language changed, re-translating same text",
          {
            text: text.substring(0, 50),
            oldLanguage: previousLanguageRef.current,
            newLanguage: currentLanguage,
          }
        );
      }
    }

    if (DEBUG_TRANSLATION_LOGS) {
      console.log("🌐 [useTranslatedText] Triggering translation", {
        text: text.substring(0, 50),
        currentLanguage,
        sourceLanguage,
        previousLanguage: previousLanguageRef.current,
      });
    }

    // Translate the text
    setIsTranslating(true);

    translate(text, sourceLanguage as any)
      .then(translated => {
        if (DEBUG_TRANSLATION_LOGS) {
          console.log("🌐 [useTranslatedText] Translation completed", {
            original: text.substring(0, 50),
            translated: translated.substring(0, 50),
            changed: translated !== text,
            currentLanguage,
            previousLanguage: previousLanguageRef.current,
          });
        }
        // Only update if language hasn't changed during translation
        if (currentLanguage === previousLanguageRef.current) {
          setTranslatedText(translated);
        } else {
          if (DEBUG_TRANSLATION_LOGS) {
            console.log(
              "🌐 [useTranslatedText] Language changed during translation, skipping update"
            );
          }
        }
      })
      .catch(error => {
        if (DEBUG_TRANSLATION_LOGS) {
          console.error("🌐 [useTranslatedText] Translation error", {
            text: text.substring(0, 50),
            error: error?.message || String(error),
            currentLanguage,
          });
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
