/**
 * Mock data for translation system tests
 * Centralized location for all translation-related test mocks
 */

import type { i18n, TFunction } from "i18next";
import type { LanguageCode } from "@translations/translationTypes";

/**
 * Mock i18next instance for testing
 */
export const createMockI18n = (language: LanguageCode = "en"): i18n => {
  const mockI18n = {
    language,
    isInitialized: true,
    changeLanguage: jest.fn((lng: string) => Promise.resolve(lng)),
    hasResourceBundle: jest.fn(() => true),
    addResourceBundle: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    t: jest.fn((key: string, options?: any) => {
      if (language === "es") {
        const translations: Record<string, string> = {
          "task-system:task.begin": "COMENZAR",
          "task-system:task.resume": "REANUDAR",
          "task-system:task.completed": "COMPLETADO",
          "task-system:common.ok": "OK",
          "task-system:common.cancel": "CANCELAR",
        };
        return translations[key] || options?.defaultValue || key;
      }
      const translations: Record<string, string> = {
        "task-system:task.begin": "BEGIN",
        "task-system:task.resume": "RESUME",
        "task-system:task.completed": "COMPLETED",
        "task-system:common.ok": "OK",
        "task-system:common.cancel": "CANCEL",
      };
      return translations[key] || options?.defaultValue || key;
    }),
    options: {
      debug: false,
    },
  } as unknown as i18n;

  return mockI18n;
};

/**
 * Mock translation function (TFunction)
 */
export const createMockTFunction = (
  language: LanguageCode = "en"
): TFunction => {
  const translations: Record<string, Record<string, string>> = {
    en: {
      "task.begin": "BEGIN",
      "task.resume": "RESUME",
      "task.completed": "COMPLETED",
      "task.dueBy": "DUE BY",
      "common.ok": "OK",
      "common.cancel": "CANCEL",
      "common.next": "Next",
      "common.previous": "Previous",
    },
    es: {
      "task.begin": "COMENZAR",
      "task.resume": "REANUDAR",
      "task.completed": "COMPLETADO",
      "task.dueBy": "VENCE A LAS",
      "common.ok": "OK",
      "common.cancel": "CANCELAR",
      "common.next": "Siguiente",
      "common.previous": "Anterior",
    },
    ar: {
      "task.begin": "ابدأ",
      "task.resume": "استئناف",
      "task.completed": "مكتمل",
      "common.ok": "حسناً",
      "common.cancel": "إلغاء",
    },
  };

  const t: TFunction = ((key: string, options?: any) => {
    const langTranslations = translations[language] || translations.en;
    const namespacedKey = key.includes(":") ? key : `task-system:${key}`;
    const simpleKey = key.replace("task-system:", "");

    if (langTranslations[simpleKey]) {
      return langTranslations[simpleKey];
    }

    return options?.defaultValue || options?.fallback || key;
  }) as TFunction;

  return t;
};

/**
 * Mock translation context values
 */
export const createMockTranslationContext = (language: LanguageCode = "en") => {
  const mockI18n = createMockI18n(language);
  const mockT = createMockTFunction(language);

  return {
    t: mockT,
    i18n: mockI18n,
    ready: true,
    currentLanguage: language,
    setLanguage: jest.fn((lng: LanguageCode) => Promise.resolve()),
    isRTL: language === "ar" || language === "he" || language === "ur",
    supportedLanguages: [
      { code: "en", name: "English" },
      { code: "es", name: "Spanish" },
      { code: "ar", name: "Arabic" },
      { code: "fr", name: "French" },
    ],
  };
};

/**
 * Mock TranslationMemoryService responses
 */
export const mockTranslationMemory = {
  enToEs: {
    "Sample Task": "Tarea de ejemplo",
    "Episodic Task 01 (All required)": "Tarea Episódica 01 (Todas requeridas)",
    "Multi Page (3 screens) Test (Fixture)":
      "Prueba de múltiples páginas (3 pantallas) (Fixture)",
    "All Question Types Test (Fixture)":
      "Prueba de todos los tipos de preguntas (Fixture)",
    "Sample Task 2 (Fixture)": "Tarea de ejemplo 2 (Fixture)",
    "Sample Task 3 (Fixture)": "Tarea de ejemplo 3 (Fixture)",
  },
  enToAr: {
    "Sample Task": "مهمة نموذجية",
    "Episodic Task 01 (All required)": "المهمة العرضية 01 (كلها مطلوبة)",
    "All Question Types Test (Fixture)": "اختبار جميع أنواع الأسئلة (Fixture)",
  },
};

/**
 * Test data for snapshot tests
 */
export const snapshotTestData = {
  uiLabels: {
    begin: "BEGIN",
    resume: "RESUME",
    completed: "COMPLETED",
    dueBy: "DUE BY",
    ok: "OK",
    cancel: "CANCEL",
    next: "Next",
    previous: "Previous",
  },
  dynamicContent: {
    sampleTask: "Sample Task",
    episodicTask: "Episodic Task 01 (All required)",
    multiPageTask: "Multi Page (3 screens) Test (Fixture)",
    allQuestionTypes: "All Question Types Test (Fixture)",
  },
  longText:
    "This is a very long text string that should be handled properly by the TranslatedText component without breaking the layout or causing any rendering issues.",
  specialChars: "Text with special chars: !@#$%^&*()",
  empty: "",
  whitespace: "   ",
};

/**
 * Mock AsyncStorage responses for language preference
 */
export const mockAsyncStorage = {
  getItem: jest.fn((key: string) => {
    if (key === "user_language_preference") {
      return Promise.resolve("en");
    }
    return Promise.resolve(null);
  }),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
  clear: jest.fn(() => Promise.resolve()),
};

/**
 * Mock I18nManager for RTL testing
 */
export const createMockI18nManager = (isRTL: boolean = false) => ({
  isRTL,
  forceRTL: jest.fn(),
  swapLeftAndRightInRTL: jest.fn(),
  allowRTL: jest.fn(),
  setRTL: jest.fn(),
});
