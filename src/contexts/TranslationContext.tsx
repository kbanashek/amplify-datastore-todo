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
        console.log(
          "🌍 [TranslationProvider] Loading language preference from AsyncStorage..."
        );
        const saved = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
        console.log("🌍 [TranslationProvider] Loaded from AsyncStorage:", {
          saved,
          isValid:
            saved && SUPPORTED_LANGUAGES.some(lang => lang.code === saved),
        });

        let languageToUse: LanguageCode;
        if (saved && SUPPORTED_LANGUAGES.some(lang => lang.code === saved)) {
          console.log(
            "🌍 [TranslationProvider] Setting language to saved preference:",
            saved
          );
          languageToUse = saved as LanguageCode;
        } else {
          console.log(
            "🌍 [TranslationProvider] No valid saved preference, using default:",
            defaultLanguage
          );
          languageToUse = defaultLanguage;
        }

        // Set the language (this will trigger RTL update and context update)
        setCurrentLanguage(languageToUse);
      } catch (error) {
        console.error(
          "[TranslationProvider] Error loading language preference:",
          error
        );
        setCurrentLanguage(defaultLanguage);
      }
      console.log(
        "🌍 [TranslationProvider] Language preference loading complete"
      );
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
      console.log("🌍 [TranslationProvider] RTL mode updated", {
        language: currentLanguage,
        isRTL: shouldBeRTL,
        previousRTL: I18nManager.isRTL,
        note: "Android may require app restart for RTL changes",
      });
    }
  }, [currentLanguage]);

  // Save language preference when it changes
  const setLanguage = useCallback(
    async (language: LanguageCode) => {
      console.log("🌍 [TranslationProvider] setLanguage() called", {
        newLanguage: language,
        currentLanguage,
        willChange: language !== currentLanguage,
      });
      try {
        await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
        console.log(
          "🌍 [TranslationProvider] Language preference saved to AsyncStorage"
        );
        setCurrentLanguage(language);
        console.log(
          "🌍 [TranslationProvider] Language state updated to:",
          language
        );
      } catch (error) {
        console.error(
          "🌍 [TranslationProvider] Error saving language preference:",
          error
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
        console.log("🔤 [TranslationProvider] Skipping translation", {
          targetLanguage,
          sourceLanguage,
          reason:
            targetLanguage === sourceLanguage
              ? "same language"
              : "target language is English",
        });
        return text;
      }

      console.log("🔤 [TranslationProvider] Translating", {
        text: text.substring(0, 50),
        from: sourceLanguage,
        to: targetLanguage,
      });

      setIsTranslating(true);

      try {
        const translated = await translationService.translateText(
          text,
          targetLanguage,
          sourceLanguage
        );
        console.log("🔤 [TranslationProvider] Translation result", {
          original: text.substring(0, 50),
          translated: translated.substring(0, 50),
          changed: translated !== text,
        });
        return translated;
      } catch (error: any) {
        console.error("🔤 [TranslationProvider] Error translating", {
          text: text.substring(0, 50),
          error: error?.message || String(error),
          targetLanguage,
          sourceLanguage,
        });
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
    console.log("🌍 [TranslationProvider] Context value updated", {
      currentLanguage: effectiveLanguage,
      isTranslating,
      supportedLanguagesCount: SUPPORTED_LANGUAGES.length,
      isLoading: currentLanguage === null,
    });
  }, [effectiveLanguage, isTranslating, currentLanguage]);

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
