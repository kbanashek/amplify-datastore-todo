/**
 * Main exports for task-system translation system
 * Provides i18next-based translation functionality with optional LX integration
 */

// Provider and hook
export {
  TranslationProvider,
  useTaskTranslationContext,
} from "./TranslationProvider";
export { useTaskTranslation } from "./useTaskTranslation";

// Utilities
export {
  initializeTranslations,
  addTranslationBundle,
  isRTLMode,
  getTranslationKey,
  safeTranslate,
  loadDefaultTranslations,
} from "./translationUtils";

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
} from "./translationTypes";

// Re-export language types and constants
export type { LanguageCode } from "./translationTypes";
export { SUPPORTED_LANGUAGES, isRTL } from "./translationTypes";

// Default translations
export { en_US } from "./locales/index";

// Configuration
export { getDefaultNamespace } from "./config/i18nConfig";

// Compatibility: Export seedTranslationMemories for old TranslationMemoryService
// This is a temporary compatibility layer for the old AWS Translate system
import enEsMemory from "./memory.en-es.json";

export const seedTranslationMemories = [enEsMemory] as const;
