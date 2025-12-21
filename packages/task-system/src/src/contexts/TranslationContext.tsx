import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { I18nManager } from "react-native";
import {
  TranslationService,
  getTranslationService,
} from "../services/TranslationService";
import {
  LanguageCode,
  SUPPORTED_LANGUAGES,
  isRTL as isRTLanguage,
} from "../services/translationTypes";
import { DEBUG_TRANSLATION_LOGS } from "../utils/debug";
import { getServiceLogger } from "../utils/serviceLogger";

const logger = getServiceLogger("TranslationProvider");

const LANGUAGE_PREFERENCE_KEY = "user_language_preference";
const DEFAULT_LANGUAGE: LanguageCode = "en";

interface TranslationContextType {
  currentLanguage: LanguageCode;
  setLanguage: (language: LanguageCode) => Promise<void>;
  translate: (text: string, sourceLanguage?: LanguageCode) => Promise<string>;
  translateSync: (text: string) => string; // Returns original text immediately, translation happens async
  isTranslating: boolean;
  isRTL: boolean; // Whether current language is RTL
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
  translationService: TranslationService;
}

const TranslationContext = createContext<TranslationContextType | null>(null);

export const useTranslation = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
};

interface TranslationProviderProps {
  children: ReactNode;
  defaultLanguage?: LanguageCode;
  region?: string;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({
  children,
  defaultLanguage = DEFAULT_LANGUAGE,
  region,
}) => {
  // Initialize with null to indicate loading state
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode | null>(
    null
  );
  const [isTranslating, setIsTranslating] = useState(false);
  const translationService = getTranslationService(region);

  // Load saved language preference on mount - CRITICAL: Must load before first render
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        if (DEBUG_TRANSLATION_LOGS) {
          logger.debug(
            "Loading language preference from AsyncStorage...",
            undefined,
            undefined,
            "🌍"
          );
        }
        const saved = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
        if (DEBUG_TRANSLATION_LOGS) {
          logger.debug(
            "Loaded from AsyncStorage",
            {
              saved,
              isValid:
                saved && SUPPORTED_LANGUAGES.some(lang => lang.code === saved),
            },
            undefined,
            "🌍"
          );
        }

        let languageToUse: LanguageCode;
        if (saved && SUPPORTED_LANGUAGES.some(lang => lang.code === saved)) {
          if (DEBUG_TRANSLATION_LOGS) {
            logger.debug(
              "Setting language to saved preference",
              { saved },
              undefined,
              "🌍"
            );
          }
          languageToUse = saved as LanguageCode;
        } else {
          if (DEBUG_TRANSLATION_LOGS) {
            logger.debug(
              "No valid saved preference, using default",
              { defaultLanguage },
              undefined,
              "🌍"
            );
          }
          languageToUse = defaultLanguage;
        }

        // Set the language (this will trigger RTL update and context update)
        setCurrentLanguage(languageToUse);
      } catch (error) {
        logger.error("Error loading language preference", error);
        setCurrentLanguage(defaultLanguage);
      }
      if (DEBUG_TRANSLATION_LOGS) {
        logger.debug(
          "Language preference loading complete",
          undefined,
          undefined,
          "🌍"
        );
      }
    };

    loadLanguagePreference();
  }, [defaultLanguage]);

  // Use defaultLanguage while loading, or currentLanguage once loaded
  const effectiveLanguage: LanguageCode = currentLanguage ?? defaultLanguage;
  const isRTL = isRTLanguage(effectiveLanguage);

  // Update I18nManager when language changes to enable/disable RTL
  useEffect(() => {
    if (currentLanguage === null) return; // Don't update RTL while loading

    const shouldBeRTL = isRTLanguage(currentLanguage);
    if (I18nManager.isRTL !== shouldBeRTL) {
      I18nManager.forceRTL(shouldBeRTL);
      // Note: I18nManager.forceRTL requires app restart on Android
      // On iOS, it works immediately
      if (DEBUG_TRANSLATION_LOGS) {
        logger.debug(
          "RTL mode updated",
          {
            language: currentLanguage,
            isRTL: shouldBeRTL,
            previousRTL: I18nManager.isRTL,
            note: "Android may require app restart for RTL changes",
          },
          undefined,
          "🌍"
        );
      }
    }
  }, [currentLanguage]);

  // Save language preference when it changes
  const setLanguage = useCallback(
    async (language: LanguageCode) => {
      if (DEBUG_TRANSLATION_LOGS) {
        logger.debug(
          "setLanguage() called",
          {
            newLanguage: language,
            currentLanguage,
            willChange: language !== currentLanguage,
          },
          undefined,
          "🌍"
        );
      }
      try {
        await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
        if (DEBUG_TRANSLATION_LOGS) {
          logger.debug(
            "Language preference saved to AsyncStorage",
            undefined,
            undefined,
            "🌍"
          );
        }
        setCurrentLanguage(language);
        if (DEBUG_TRANSLATION_LOGS) {
          logger.debug("Language state updated", { language }, undefined, "🌍");
        }
      } catch (error) {
        logger.error(
          "Error saving language preference",
          error,
          undefined,
          "🌍"
        );
      }
    },
    [currentLanguage]
  );

  // Translate text (async) - optimized with minimal logging
  const translate = useCallback(
    async (
      text: string,
      sourceLanguage: LanguageCode = DEFAULT_LANGUAGE
    ): Promise<string> => {
      if (!text || text.trim().length === 0) {
        return text;
      }

      // Use effective language (defaultLanguage while loading, currentLanguage once loaded)
      const targetLanguage = effectiveLanguage;

      // If same language, return original
      if (
        targetLanguage === sourceLanguage ||
        targetLanguage === DEFAULT_LANGUAGE
      ) {
        if (DEBUG_TRANSLATION_LOGS) {
          logger.debug(
            "Skipping translation",
            {
              targetLanguage,
              sourceLanguage,
              reason:
                targetLanguage === sourceLanguage
                  ? "same language"
                  : "target language is English",
            },
            undefined,
            "🔤"
          );
        }
        return text;
      }

      if (DEBUG_TRANSLATION_LOGS) {
        logger.debug(
          "Translating",
          {
            text: text.substring(0, 50),
            from: sourceLanguage,
            to: targetLanguage,
          },
          undefined,
          "🔤"
        );
      }

      setIsTranslating(true);

      try {
        const translated = await translationService.translateText(
          text,
          targetLanguage,
          sourceLanguage
        );
        if (DEBUG_TRANSLATION_LOGS) {
          logger.debug(
            "Translation result",
            {
              original: text.substring(0, 50),
              translated: translated.substring(0, 50),
              changed: translated !== text,
            },
            undefined,
            "🔤"
          );
        }
        return translated;
      } catch (error: unknown) {
        if (DEBUG_TRANSLATION_LOGS) {
          logger.error("Error translating", error, undefined, "🔤");
        }
        return text; // Return original on error
      } finally {
        setIsTranslating(false);
      }
    },
    [effectiveLanguage, translationService]
  );

  // Synchronous version that returns original text immediately
  // Translation happens in background and updates when ready
  const translateSync = useCallback((text: string): string => {
    // For now, just return original text
    // In a more advanced implementation, we could use a state-based approach
    // where components subscribe to translation updates
    return text;
  }, []);

  const value: TranslationContextType = {
    currentLanguage: effectiveLanguage,
    setLanguage,
    translate,
    translateSync,
    isTranslating,
    isRTL,
    supportedLanguages: SUPPORTED_LANGUAGES,
    translationService,
  };

  // Log when context value changes
  useEffect(() => {
    if (DEBUG_TRANSLATION_LOGS) {
      logger.debug(
        "Context value updated",
        {
          currentLanguage: effectiveLanguage,
          isTranslating,
          supportedLanguagesCount: SUPPORTED_LANGUAGES.length,
          isLoading: currentLanguage === null,
        },
        undefined,
        "🌍"
      );
    }
  }, [effectiveLanguage, isTranslating, currentLanguage]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
