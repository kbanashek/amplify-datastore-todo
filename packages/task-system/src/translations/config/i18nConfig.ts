import type { i18n as I18nType } from "i18next";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en_US from "../locales/en_US";
import es_ES from "../locales/es_ES";
import { LanguageCode } from "../translationTypes";

const DEFAULT_NAMESPACE = "task-system";
const DEFAULT_LOCALE = "en";

/**
 * Configure and return an i18next instance scoped for the task-system namespace.
 *
 * Initializes a new i18next instance or augments a provided parent instance with the task-system namespace and translations.
 *
 * @param config - Optional configuration for initialization
 * @param config.parentI18n - Existing i18next instance to extend with the task-system namespace
 * @param config.defaultLocale - Fallback locale to use when no preferred language is provided
 * @param config.preferredLanguage - Language code to set as the active language
 * @param config.debug - Enable i18next debug mode
 * @returns The i18next instance configured with the "task-system" namespace (either the provided parent instance or a newly created instance)
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
 * Get the default namespace used for task-system translations.
 *
 * @returns The default namespace string for the task-system module
 */
export function getDefaultNamespace(): string {
  return DEFAULT_NAMESPACE;
}