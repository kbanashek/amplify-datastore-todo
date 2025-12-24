import { useMemo } from "react";
import type { TFunction } from "i18next";
import { useTaskTranslationContext } from "@translations/TranslationProvider";
import { getDefaultNamespace } from "@translations/config/i18nConfig";
import type { TranslationOptions } from "@translations/translationTypes";

/**
 * Hook to access translation functionality with activity-specific support
 * Similar API to useTranslation() from react-i18next
 *
 * @returns Object with t function, i18n instance, ready state, and helper functions
 */
export const useTaskTranslation = () => {
  const context = useTaskTranslationContext();
  const {
    t: baseT,
    i18n,
    ready,
    currentLanguage,
    setLanguage,
    isRTL,
    supportedLanguages,
  } = context;

  /**
   * Enhanced translation function with activity-specific support
   * Supports merging activity translations and fallback handling
   *
   * Note: Include i18n.language in dependencies so t function updates when language changes
   */
  const t = useMemo(
    () => {
      const enhancedT = (key: string, options?: TranslationOptions): string => {
        const namespace = getDefaultNamespace();
        const namespacedKey = `${namespace}:${key}`;

        // If activity-specific translations are provided, try to merge them
        if (options?.activityTranslation) {
          const activityKey = options.activityTranslation[key];
          if (activityKey && typeof activityKey === "string") {
            return activityKey;
          }
        }

        const fallback = options?.fallback ?? key;
        const {
          activityTranslation: _activityTranslation,
          fallback: _fallback,
          ...i18nOptions
        } = options ?? {};

        // Try to translate with i18next
        const translated = baseT(namespacedKey, {
          defaultValue: fallback,
          ...i18nOptions,
        });

        // If translation returns the key (not found), use fallback
        if (translated === namespacedKey || translated === key) {
          return fallback;
        }

        return translated;
      };

      return enhancedT as TFunction;
    },
    [baseT, i18n.language, currentLanguage] // Include language in deps to force re-computation
  );

  return {
    t,
    i18n,
    ready,
    currentLanguage,
    setLanguage,
    isRTL,
    supportedLanguages,
  };
};
