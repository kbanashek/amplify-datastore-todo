import AsyncStorage from "@react-native-async-storage/async-storage";

import { seedTranslationMemories } from "../translations";
import { LanguageCode } from "./translationTypes";
import { simpleHash } from "../utils/simpleHash";

const MEMORY_PREFIX = "translation_memory:";

export interface TranslationMemoryEntry {
  readonly sourceLanguage: LanguageCode;
  readonly targetLanguage: LanguageCode;
  readonly sourceText: string;
  readonly translatedText: string;
  readonly updatedAt: number;
}

/**
 * Long-lived translation memory.
 *
 * - Uses bundled seed files under `src/translations/` as an offline baseline.
 * - Persists learned translations to AsyncStorage for future offline use.
 *
 * This does NOT replace the TTL-based cache in TranslationService; it complements it.
 */
export class TranslationMemoryService {
  private static inMemory = new Map<string, TranslationMemoryEntry>();
  private static isSeedLoaded = false;

  private static getKey(
    sourceLanguage: LanguageCode,
    targetLanguage: LanguageCode,
    sourceText: string
  ): string {
    return `${MEMORY_PREFIX}${sourceLanguage}:${targetLanguage}:${simpleHash(
      sourceText
    )}`;
  }

  private static ensureSeedLoaded(): void {
    if (this.isSeedLoaded) return;
    this.isSeedLoaded = true;

    for (const file of seedTranslationMemories) {
      const source = file._meta.sourceLanguage as LanguageCode;
      const target = file._meta.targetLanguage as LanguageCode;

      for (const [sourceText, translatedText] of Object.entries(file.entries)) {
        const entry: TranslationMemoryEntry = {
          sourceLanguage: source,
          targetLanguage: target,
          sourceText,
          translatedText,
          updatedAt: Date.now(),
        };
        const key = this.getKey(source, target, sourceText);
        this.inMemory.set(key, entry);
      }
    }
  }

  static async getTranslation(
    sourceText: string,
    sourceLanguage: LanguageCode,
    targetLanguage: LanguageCode
  ): Promise<string | null> {
    this.ensureSeedLoaded();
    const key = this.getKey(sourceLanguage, targetLanguage, sourceText);

    const fromMemory = this.inMemory.get(key);
    if (fromMemory) return fromMemory.translatedText;

    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as TranslationMemoryEntry;
      // Rehydrate in-memory cache for faster follow-up lookups
      this.inMemory.set(key, parsed);
      return parsed.translatedText;
    } catch {
      return null;
    }
  }

  static async storeTranslation(
    sourceText: string,
    translatedText: string,
    sourceLanguage: LanguageCode,
    targetLanguage: LanguageCode
  ): Promise<void> {
    this.ensureSeedLoaded();
    const key = this.getKey(sourceLanguage, targetLanguage, sourceText);

    const entry: TranslationMemoryEntry = {
      sourceLanguage,
      targetLanguage,
      sourceText,
      translatedText,
      updatedAt: Date.now(),
    };

    this.inMemory.set(key, entry);

    try {
      await AsyncStorage.setItem(key, JSON.stringify(entry));
    } catch {
      // Non-fatal; still benefits from in-memory during this session
    }
  }

  /**
   * Export all stored translations currently in memory (seed + any rehydrated).
   * Useful for debugging or future export tooling.
   */
  static exportInMemory(): readonly TranslationMemoryEntry[] {
    this.ensureSeedLoaded();
    return Array.from(this.inMemory.values());
  }

  static clearInMemoryForTests(): void {
    this.inMemory.clear();
    this.isSeedLoaded = false;
  }
}
