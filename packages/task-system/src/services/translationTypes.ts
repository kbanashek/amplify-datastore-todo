// Shared translation types/constants used by TranslationService, UI, and storage layers.

// RTL (Right-to-Left) languages
export const RTL_LANGUAGES = ["ar", "he", "ur", "fa", "yi"] as const;

// AWS Translate supported languages (common ones)
export const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "zh", name: "Chinese (Simplified)" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "ar", name: "Arabic" },
  { code: "he", name: "Hebrew" },
  { code: "ur", name: "Urdu" },
  { code: "fa", name: "Persian (Farsi)" },
  { code: "hi", name: "Hindi" },
  { code: "ru", name: "Russian" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "tr", name: "Turkish" },
  { code: "sv", name: "Swedish" },
  { code: "da", name: "Danish" },
  { code: "fi", name: "Finnish" },
  { code: "no", name: "Norwegian" },
  { code: "vi", name: "Vietnamese" },
] as const;

export type LanguageCode = (typeof SUPPORTED_LANGUAGES)[number]["code"];

/**
 * Check if a language code is RTL (Right-to-Left)
 */
export function isRTL(languageCode: LanguageCode): boolean {
  return (RTL_LANGUAGES as readonly string[]).includes(languageCode);
}
