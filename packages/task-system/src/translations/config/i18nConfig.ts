import type { i18n as I18nType } from "i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en_US from "@translations/locales/en_US";
import es_ES from "@translations/locales/es_ES";
import { LanguageCode } from "@translations/translationTypes";

const DEFAULT_NAMESPACE = "task-system";
const DEFAULT_LOCALE = "en";

/**
 * Initialize i18next instance for task-system module
 * Supports both standalone mode and integration with parent app's i18next
 */
export function initializeI18n(
  config: {
    parentI18n?: I18nType;
    defaultLocale?: string;
    preferredLanguage?: LanguageCode;
    debug?: boolean;
  } = {}
): I18nType {
  const {
    parentI18n,
    defaultLocale = DEFAULT_LOCALE,
    preferredLanguage,
    debug = false,
  } = config;

  // If parent i18next instance is provided, use it with namespace isolation
  if (parentI18n) {
    // Add our namespace and translations to parent instance
    if (!parentI18n.hasResourceBundle("en", DEFAULT_NAMESPACE)) {
      parentI18n.addResourceBundle("en", DEFAULT_NAMESPACE, en_US, true, true);
    }
    if (!parentI18n.hasResourceBundle("es", DEFAULT_NAMESPACE)) {
      parentI18n.addResourceBundle("es", DEFAULT_NAMESPACE, es_ES, true, true);
    }

    // Set language if preferred language is provided
    if (preferredLanguage) {
      parentI18n.changeLanguage(preferredLanguage);
    }

    return parentI18n;
  }

  // Standalone mode: create new i18next instance
  const i18nInstance = i18n.createInstance();

  i18nInstance.use(initReactI18next).init({
    compatibilityJSON: "v3", // For React Native compatibility
    lng: preferredLanguage || defaultLocale,
    fallbackLng: defaultLocale,
    debug,
    defaultNS: DEFAULT_NAMESPACE,
    ns: [DEFAULT_NAMESPACE],
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    resources: {
      en: {
        [DEFAULT_NAMESPACE]: en_US,
      },
      es: {
        [DEFAULT_NAMESPACE]: es_ES,
      },
    },
    react: {
      useSuspense: false, // Disable suspense for React Native
    },
  });

  return i18nInstance;
}

/**
 * Get the default namespace for task-system translations
 */
export function getDefaultNamespace(): string {
  return DEFAULT_NAMESPACE;
}
