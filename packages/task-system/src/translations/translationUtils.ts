import type { TFunction, i18n } from "i18next";
import { getDefaultNamespace } from "./config/i18nConfig";
import {
  LanguageCode,
  isRTL,
  type TranslationBundle,
} from "./translationTypes";

// Re-export getDefaultNamespace for convenience
export { getDefaultNamespace };

/**
 * Initialize and configure the i18n translation instance for the application.
 *
 * @param config - Configuration options for initialization.
 *   - parentI18n: Optional existing i18n instance to use as a parent.
 *   - defaultLocale: Locale string to use as the default (e.g., "en_US").
 *   - preferredLanguage: Preferred language code to initialize (e.g., "en").
 *   - debug: Enable debug mode when true.
 * @returns The configured i18n instance
 */
export function initializeTranslations(
  config: {
    parentI18n?: i18n;
    defaultLocale?: string;
    preferredLanguage?: LanguageCode;
    debug?: boolean;
  } = {}
): i18n {
  const { initializeI18n } = require("./config/i18nConfig");
  return initializeI18n(config);
}

/**
 * Adds a translation bundle to an i18next instance under the given locale and namespace.
 *
 * Merges the provided translations into the target namespace and overwrites any existing keys.
 *
 * @param i18nInstance - The i18next instance to modify
 * @param locale - The locale identifier for the translations (e.g., "en_US")
 * @param translations - The translation bundle mapping keys to localized strings
 * @param namespace - The namespace to add the translations to; defaults to the project's default namespace
 */
export function addTranslationBundle(
  i18nInstance: i18n,
  locale: string,
  translations: TranslationBundle,
  namespace: string = getDefaultNamespace()
): void {
  i18nInstance.addResourceBundle(locale, namespace, translations, true, true);
}

/**
 * Determine whether a locale uses a right-to-left writing system.
 *
 * @param locale - Locale identifier (e.g., "en_US", "ar")
 * @returns `true` if the locale is right-to-left, `false` otherwise.
 */
export function isRTLMode(locale: string): boolean {
  return isRTL(locale as LanguageCode);
}

/**
 * Constructs a namespaced translation key.
 *
 * @param key - The translation key (without namespace).
 * @param namespace - Namespace to prefix the key; defaults to the configured default namespace.
 * @returns The combined key in the form `namespace:key`.
 */
export function getTranslationKey(
  key: string,
  namespace: string = getDefaultNamespace()
): string {
  return `${namespace}:${key}`;
}

/**
 * Translate a namespaced key and fall back to a provided value or the key when no translation exists.
 *
 * @param t - Translation function used to resolve the key
 * @param key - Translation key to resolve
 * @param fallback - Optional fallback string returned when the translation is missing
 * @param namespace - Optional namespace to prepend to the key; defaults to getDefaultNamespace()
 * @returns The resolved translation; `fallback` if the translation is missing, otherwise `key` when no `fallback` is provided
 */
export function safeTranslate(
  t: TFunction,
  key: string,
  fallback?: string,
  namespace: string = getDefaultNamespace()
): string {
  const namespacedKey = getTranslationKey(key, namespace);
  const translated = t(namespacedKey, { defaultValue: fallback || key });

  // If translation returns the key (meaning not found), use fallback
  if (translated === namespacedKey || translated === key) {
    return fallback || key;
  }

  return translated;
}

/**
 * Load the default English translation bundle.
 *
 * @returns The default English TranslationBundle
 */
export function loadDefaultTranslations(): TranslationBundle {
  const en_US = require("./locales/en_US").default;
  return en_US;
}