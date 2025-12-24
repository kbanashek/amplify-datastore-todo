import type { TFunction, i18n } from "i18next";
import { getDefaultNamespace } from "@translations/config/i18nConfig";
import {
  LanguageCode,
  isRTL,
  type TranslationBundle,
} from "@translations/translationTypes";

// Re-export getDefaultNamespace for convenience
export { getDefaultNamespace };

/**
 * Initialize translations with configuration
 * This is a wrapper around initializeI18n for consistency
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
 * Add translation bundle dynamically to i18next instance
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
 * Check if a locale is RTL (Right-to-Left)
 * Reuses existing isRTL function from translationTypes
 */
export function isRTLMode(locale: string): boolean {
  return isRTL(locale as LanguageCode);
}

/**
 * Build a namespaced translation key
 */
export function getTranslationKey(
  key: string,
  namespace: string = getDefaultNamespace()
): string {
  return `${namespace}:${key}`;
}

/**
 * Safe translation function with fallback
 * Returns the translation if available, otherwise returns fallback or the key
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
 * Load default English translations
 * Returns the default English translation bundle
 */
export function loadDefaultTranslations(): TranslationBundle {
  const en_US = require("./locales/en_US").default;
  return en_US;
}
