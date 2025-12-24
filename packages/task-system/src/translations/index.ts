/**
 * Main exports for task-system translation system
 * Provides i18next-based translation functionality with optional LX integration
 */

// Provider and hook
export {
  TranslationProvider,
  useTaskTranslationContext,
} from "@translations/TranslationProvider";
export { useTaskTranslation } from "@translations/useTaskTranslation";

// Utilities
export {
  initializeTranslations,
  addTranslationBundle,
  isRTLMode,
  getTranslationKey,
  safeTranslate,
  loadDefaultTranslations,
} from "@translations/translationUtils";

// Types
export type {
  TranslationConfig,
  TranslationBundle,
  ActivityTranslation,
  TranslationOptions,
  TaskTranslationKeys,
  ActivityTranslationKeys,
  CommonTranslationKeys,
  QuestionTranslationKeys,
  TaskSystemTranslations,
} from "@translations/translationTypes";

// Re-export language types and constants
export type { LanguageCode } from "@translations/translationTypes";
export { SUPPORTED_LANGUAGES, isRTL } from "@translations/translationTypes";

// Default translations
export { en_US } from "@translations/locales/index";

// Configuration
export { getDefaultNamespace } from "@translations/config/i18nConfig";

// Compatibility: Export seedTranslationMemories for old TranslationMemoryService
// This is a temporary compatibility layer for the old AWS Translate system
import enEsMemory from "@translations/memory.en-es.json";

export const seedTranslationMemories = [enEsMemory] as const;
