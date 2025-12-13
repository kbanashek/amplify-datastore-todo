import enEs from "./memory.en-es.json";

export interface SeedTranslationMemoryFile {
  readonly _meta: {
    readonly sourceLanguage: string;
    readonly targetLanguage: string;
    readonly generatedAt?: string;
    readonly notes?: string;
  };
  readonly entries: Record<string, string>;
}

/**
 * Seed translation memory files bundled with the app.
 *
 * These are used as an offline fallback and as a starting point if AWS Translate
 * becomes unavailable. The runtime translation memory still persists to AsyncStorage.
 */
export const seedTranslationMemories: readonly SeedTranslationMemoryFile[] = [
  enEs as SeedTranslationMemoryFile,
];
