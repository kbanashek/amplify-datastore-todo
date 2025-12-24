import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { I18nManager } from "react-native";
import {
  TranslationService,
  getTranslationService,
} from "@services/TranslationService";
import {
  LanguageCode,
  SUPPORTED_LANGUAGES,
  isRTL as isRTLanguage,
} from "@services/translationTypes";
import { DEBUG_TRANSLATION_LOGS } from "@utils/debug";
import { getServiceLogger } from "@utils/serviceLogger";

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

  // Log when context is accessed to track if components are getting updates
  // This runs on EVERY render to see if the hook is being called
  const logger = getServiceLogger("useTranslation");
  const prevContextRef = useRef<TranslationContextType | null>(null);
  const renderCountRef = useRef<number>(0);

  // Track every render - this runs synchronously on every render
  renderCountRef.current += 1;
  const contextChanged = prevContextRef.current !== context;
  const languageChanged =
    prevContextRef.current?.currentLanguage !== context.currentLanguage;

  // Log on every render if context changed or first render
  if (contextChanged || languageChanged || renderCountRef.current === 1) {
    logger.debug(
      "useTranslation hook - RENDER",
      {
        renderCount: renderCountRef.current,
        currentLanguage: context.currentLanguage,
        previousLanguage: prevContextRef.current?.currentLanguage,
        contextChanged,
        languageChanged,
        contextValueReference:
          context === prevContextRef.current ? "same" : "new",
        willComponentRerender: contextChanged || languageChanged,
      },
      undefined,
      "🌍"
    );
  }

  useEffect(() => {
    prevContextRef.current = context;
  }, [context]);

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
      const willChange = language !== currentLanguage;

      logger.debug(
        "setLanguage() called",
        {
          newLanguage: language,
          currentLanguage,
          previousLanguage: currentLanguage,
          willChange,
          willTriggerStateUpdate: willChange,
          willTriggerContextUpdate: willChange,
          willTriggerRerenders: willChange,
        },
        undefined,
        "🌍"
      );

      if (!willChange) {
        logger.debug(
          "Language unchanged, skipping update",
          { language },
          undefined,
          "🌍"
        );
        return;
      }

      try {
        logger.debug(
          "Saving language preference to AsyncStorage",
          { language },
          undefined,
          "🌍"
        );
        await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
        logger.debug(
          "Language preference saved to AsyncStorage",
          { language },
          undefined,
          "🌍"
        );

        logger.debug(
          "Calling setCurrentLanguage() - this will trigger state update",
          {
            from: currentLanguage,
            to: language,
            willUpdateEffectiveLanguage: true,
            willUpdateContextValue: true,
            willTriggerRerenders: true,
          },
          undefined,
          "🌍"
        );
        setCurrentLanguage(language);
        logger.debug(
          "setCurrentLanguage() called - state update should trigger soon",
          { language },
          undefined,
          "🌍"
        );
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

  // Force a version counter to ensure context value always gets a new reference
  // when language changes, even if other dependencies don't change
  const [contextVersion, setContextVersion] = useState<number>(0);
  useEffect(() => {
    if (prevEffectiveLanguageRef.current !== effectiveLanguage) {
      setContextVersion(prev => {
        const newVersion = prev + 1;
        logger.debug(
          "Language changed - incrementing context version",
          {
            previousLanguage: prevEffectiveLanguageRef.current,
            newLanguage: effectiveLanguage,
            newVersion,
          },
          undefined,
          "🌍"
        );
        return newVersion;
      });
    }
  }, [effectiveLanguage]);

  // Memoize context value to ensure it updates when dependencies change
  // This is critical for triggering re-renders in consuming components
  // Note: isRTL is derived from effectiveLanguage, so it's included for completeness
  // CRITICAL: Include contextVersion to force new reference when language changes
  const value: TranslationContextType = useMemo(() => {
    // Create a new object every time - this ensures React detects the change
    logger.debug(
      "Creating new context value",
      {
        currentLanguage: effectiveLanguage,
        version: contextVersion,
        willBeNewReference: true,
      },
      undefined,
      "🌍"
    );

    return {
      currentLanguage: effectiveLanguage,
      setLanguage,
      translate,
      translateSync,
      isTranslating,
      isRTL,
      supportedLanguages: SUPPORTED_LANGUAGES,
      translationService,
    };
  }, [
    effectiveLanguage,
    setLanguage,
    translate,
    translateSync,
    isTranslating,
    isRTL,
    translationService,
    contextVersion, // Include version to force update when language changes
  ]);

  const prevEffectiveLanguageRef = useRef<LanguageCode>(effectiveLanguage);
  const prevValueRef = useRef<TranslationContextType | null>(null);
  const valueCreationCountRef = useRef<number>(0);

  // Log when context value changes
  useEffect(() => {
    const languageChanged =
      prevEffectiveLanguageRef.current !== effectiveLanguage;
    const valueChanged = prevValueRef.current !== value;
    const valueReferenceSame = prevValueRef.current === value;

    // Increment counter each time useMemo creates a new value
    if (valueChanged) {
      valueCreationCountRef.current += 1;
    }

    logger.debug(
      "Context value updated",
      {
        currentLanguage: effectiveLanguage,
        previousLanguage: prevEffectiveLanguageRef.current,
        isTranslating,
        supportedLanguagesCount: SUPPORTED_LANGUAGES.length,
        isLoading: currentLanguage === null,
        languageChanged,
        valueChanged,
        valueReferenceSame,
        valueCreationCount: valueCreationCountRef.current,
        willTriggerRerender: valueChanged,
        contextValueKeys: valueChanged ? Object.keys(value) : [],
        // Log all dependencies to see what's changing
        effectiveLanguageChanged: languageChanged,
        setLanguageReference:
          setLanguage === prevValueRef.current?.setLanguage ? "same" : "new",
        translateReference:
          translate === prevValueRef.current?.translate ? "same" : "new",
      },
      undefined,
      "🌍"
    );

    prevEffectiveLanguageRef.current = effectiveLanguage;
    prevValueRef.current = value;
  }, [
    effectiveLanguage,
    isTranslating,
    currentLanguage,
    value,
    setLanguage,
    translate,
  ]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
