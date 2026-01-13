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
import type { i18n, TFunction } from "i18next";
import {
  LanguageCode,
  SUPPORTED_LANGUAGES,
  isRTL,
  type TranslationConfig,
} from "@translations/translationTypes";
import { initializeI18n } from "@translations/config/i18nConfig";
import { getServiceLogger } from "@utils/logging/serviceLogger";

const logger = getServiceLogger("TranslationProvider");

const LANGUAGE_PREFERENCE_KEY = "user_language_preference";
const DEFAULT_LANGUAGE: LanguageCode = "en";

interface TranslationContextType {
  t: TFunction;
  i18n: i18n;
  ready: boolean;
  currentLanguage: LanguageCode;
  setLanguage: (language: LanguageCode) => Promise<void>;
  isRTL: boolean;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

export const TranslationContext = createContext<TranslationContextType | null>(
  null
);

export const useTaskTranslationContext = (): TranslationContextType => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error(
      "useTaskTranslationContext must be used within a TranslationProvider"
    );
  }
  return context;
};

interface TranslationProviderProps {
  children: ReactNode;
  /**
   * Optional parent i18next instance for integration with LX app
   */
  parentI18n?: i18n;
  /**
   * Preferred language from LX app
   */
  preferredLanguage?: LanguageCode;
  /**
   * Default locale (defaults to "en")
   */
  defaultLocale?: string;
  /**
   * Enable RTL support (defaults to true)
   */
  enableRTL?: boolean;
  /**
   * Debug mode for i18next
   */
  debug?: boolean;
}

export const TranslationProvider: React.FC<TranslationProviderProps> = ({
  children,
  parentI18n,
  preferredLanguage,
  defaultLocale = DEFAULT_LANGUAGE,
  enableRTL = true,
  debug = false,
}) => {
  // Initialize i18next instance
  const i18nInstance = useMemo(() => {
    return initializeI18n({
      parentI18n,
      defaultLocale,
      preferredLanguage,
      debug,
    });
  }, [parentI18n, defaultLocale, preferredLanguage, debug]);

  /**
   * IMPORTANT:
   * We do NOT rely on react-i18next hooks inside this provider.
   * The task-system package doesn't mount an I18nextProvider, so we manage
   * i18n subscriptions ourselves to guarantee reactive updates.
   */
  const [i18nLanguage, setI18nLanguage] = useState<string>(
    () => i18nInstance.language
  );
  const [ready, setReady] = useState<boolean>(() => i18nInstance.isInitialized);

  /**
   * Single source of truth: current language is derived from i18next.
   * We keep `i18nLanguage` in state so React can re-render on `languageChanged`.
   */
  const currentLanguage = useMemo<LanguageCode>(() => {
    const lng =
      i18nLanguage ||
      i18nInstance.language ||
      defaultLocale ||
      DEFAULT_LANGUAGE;
    return (
      SUPPORTED_LANGUAGES.some(l => l.code === lng) ? lng : DEFAULT_LANGUAGE
    ) as LanguageCode;
  }, [defaultLocale, i18nInstance.language, i18nLanguage]);

  const [isInitialized, setIsInitialized] = useState(false);
  const currentLanguageRef = useRef<LanguageCode>(currentLanguage);
  useEffect(() => {
    currentLanguageRef.current = currentLanguage;
  }, [currentLanguage]);

  // Subscribe to i18next events for deterministic reactivity + logging
  useEffect(() => {
    const handleInitialized = (): void => {
      setReady(true);
      if (debug) {
        logger.debug("i18n initialized", {
          language: i18nInstance.language,
          isInitialized: i18nInstance.isInitialized,
        });
      }
    };

    const handleLanguageChanged = (lng: string): void => {
      setI18nLanguage(lng);
      if (debug) {
        logger.debug("i18n languageChanged event", {
          language: lng,
          currentLanguage: currentLanguageRef.current,
        });
      }
    };

    // Initial snapshot log (high signal for debugging)
    if (debug) {
      logger.debug("i18n instance ready", {
        language: i18nInstance.language,
        isInitialized: i18nInstance.isInitialized,
        hasEnBundle: i18nInstance.hasResourceBundle("en", "task-system"),
        hasEsBundle: i18nInstance.hasResourceBundle("es", "task-system"),
      });
    }

    i18nInstance.on("initialized", handleInitialized);
    i18nInstance.on("languageChanged", handleLanguageChanged);

    return () => {
      i18nInstance.off("initialized", handleInitialized);
      i18nInstance.off("languageChanged", handleLanguageChanged);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debug, i18nInstance]);

  // Load language preference from AsyncStorage on mount
  useEffect(() => {
    const loadLanguagePreference = async () => {
      try {
        // If preferredLanguage is provided, use it and persist
        if (preferredLanguage) {
          await AsyncStorage.setItem(
            LANGUAGE_PREFERENCE_KEY,
            preferredLanguage
          );
          // Keep i18n in sync even before we mark initialized
          i18nInstance.changeLanguage(preferredLanguage);
          setIsInitialized(true);
          return;
        }

        // Otherwise, load from AsyncStorage
        const saved = await AsyncStorage.getItem(LANGUAGE_PREFERENCE_KEY);
        if (saved && SUPPORTED_LANGUAGES.some(lang => lang.code === saved)) {
          const savedLang = saved as LanguageCode;
          await i18nInstance.changeLanguage(savedLang);
          setI18nLanguage(savedLang);
        } else {
          const defaultLang = defaultLocale as LanguageCode;
          await i18nInstance.changeLanguage(defaultLang);
          setI18nLanguage(defaultLang);
        }
        setIsInitialized(true);
      } catch (error) {
        logger.error("Error loading language preference", error);
        setI18nLanguage(defaultLocale as LanguageCode);
        setIsInitialized(true);
      }
    };

    loadLanguagePreference();
  }, [preferredLanguage, defaultLocale, i18nInstance]);

  // Update RTL layout when language changes
  useEffect(() => {
    if (!isInitialized || !enableRTL) return;

    const rtl = isRTL(currentLanguage);
    if (I18nManager.isRTL !== rtl) {
      I18nManager.forceRTL(rtl);
      // Force layout update on next frame
      setTimeout(() => {
        I18nManager.swapLeftAndRightInRTL(rtl);
      }, 0);
    }
  }, [currentLanguage, isInitialized, enableRTL]);

  // Set language function
  const setLanguage = useCallback(
    async (language: LanguageCode) => {
      if (language === currentLanguage) {
        return;
      }

      if (debug) {
        logger.debug("Setting language", {
          previousLanguage: currentLanguage,
          newLanguage: language,
        });
      }

      await i18nInstance.changeLanguage(language);
      setI18nLanguage(language);

      // Persist to AsyncStorage
      try {
        await AsyncStorage.setItem(LANGUAGE_PREFERENCE_KEY, language);
      } catch (error) {
        logger.error("Error saving language preference", error);
      }
    },
    [currentLanguage, debug, i18nInstance]
  );

  /**
   * Base translation function from i18next.
   * We include i18nLanguage in dependencies so consumers relying on [t]
   * dependencies (useMemo/useEffect) still re-run on language changes.
   */
  const t = useCallback(
    ((key: string, options?: Record<string, unknown>) => {
      const result = i18nInstance.t(key, options as never);
      return typeof result === "string" ? result : String(result);
    }) as unknown as TFunction,
    [i18nInstance, i18nLanguage]
  );

  // Calculate RTL status
  const isRTLMode = useMemo(() => isRTL(currentLanguage), [currentLanguage]);

  // Context value
  const value = useMemo<TranslationContextType>(
    () => ({
      t,
      i18n: i18nInstance,
      ready,
      currentLanguage,
      setLanguage,
      isRTL: isRTLMode,
      supportedLanguages: SUPPORTED_LANGUAGES,
    }),
    // include i18nLanguage so context consumers re-render deterministically on language changes
    [
      t,
      i18nInstance,
      ready,
      currentLanguage,
      i18nLanguage,
      setLanguage,
      isRTLMode,
    ]
  );

  // Don't render children until initialized (prevents flash of wrong language)
  if (!isInitialized) {
    return null;
  }

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};
