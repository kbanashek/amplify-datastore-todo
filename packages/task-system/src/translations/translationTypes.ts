import type { i18n } from "i18next";
import {
  LanguageCode,
  SUPPORTED_LANGUAGES,
  isRTL,
} from "../services/translationTypes";

// Re-export existing types and constants
export { SUPPORTED_LANGUAGES, isRTL };
export type { LanguageCode };

/**
 * Configuration for the translation system
 */
export interface TranslationConfig {
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
   * Available locales
   */
  locales?: string[];

  /**
   * Translation bundles to load
   */
  translations?: Record<string, TranslationBundle>;

  /**
   * Enable RTL support (defaults to true)
   */
  enableRTL?: boolean;

  /**
   * Debug mode for i18next
   */
  debug?: boolean;
}

/**
 * Structure for translation objects
 */
export interface TranslationBundle {
  [namespace: string]: {
    [key: string]: string | TranslationBundle;
  };
}

/**
 * Type for activity-specific translations
 */
export interface ActivityTranslation {
  [key: string]: string | ActivityTranslation;
}

/**
 * Type-safe translation key definitions
 * These represent the structure of our default translations
 */
export interface TaskTranslationKeys {
  dueBy: string;
  begin: string;
  resume: string;
  completed: string;
  expired: string;
  loading: string;
  noTasks: string;
  today: string;
}

export interface ActivityTranslationKeys {
  required: string;
  noAnswerProvided: string;
  title?: string;
  description?: string;
}

export interface CommonTranslationKeys {
  ok: string;
  cancel: string;
  back: string;
  next: string;
  submit: string;
  save: string;
  delete: string;
  edit: string;
  close: string;
}

export interface QuestionTranslationKeys {
  validationError: string;
  required: string;
  invalidFormat: string;
  outOfRange: string;
}

/**
 * Complete translation structure
 */
export interface TaskSystemTranslations {
  task: TaskTranslationKeys;
  activity: ActivityTranslationKeys;
  common: CommonTranslationKeys;
  questions: QuestionTranslationKeys;
}

/**
 * Options for translation function
 */
export interface TranslationOptions {
  /**
   * Activity-specific translations to merge
   */
  activityTranslation?: ActivityTranslation;

  /**
   * Fallback text if translation is missing
   */
  fallback?: string;

  /**
   * Interpolation values
   */
  [key: string]: unknown;
}
