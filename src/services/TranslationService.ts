// Import polyfill FIRST before AWS SDK
import "../polyfills/structuredClone";

import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Try to load credentials from config file (created by load-aws-credentials script)
let awsCredentials: {
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
} | null = null;

try {
  // Try to import credentials from config file
  // Use dynamic require that works in both Node.js and React Native
  awsCredentials = require("../config/aws-credentials.json");
  console.log("[TranslationService] Loaded credentials from config file");
} catch (error) {
  // Config file doesn't exist, will use environment variables or default provider
  awsCredentials = null;
}

// Simple hash function for cache keys (since React Native doesn't have Node.js crypto)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

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

/**
 * Check if a language code is RTL (Right-to-Left)
 */
export function isRTL(languageCode: LanguageCode): boolean {
  return (RTL_LANGUAGES as readonly string[]).includes(languageCode);
}

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]["code"];

const DEFAULT_SOURCE_LANGUAGE: LanguageCode = "en";
const CACHE_PREFIX = "translation_cache:";
const CACHE_EXPIRY_DAYS = 30; // Cache translations for 30 days

interface TranslationCache {
  translatedText: string;
  timestamp: number;
}

// In-memory cache for pending requests (prevents duplicate API calls)
interface PendingRequest {
  promise: Promise<string>;
  timestamp: number;
}

const pendingRequests = new Map<string, PendingRequest>();
const PENDING_REQUEST_TIMEOUT = 60000; // 1 minute timeout for pending requests
let globalCleanupInterval: ReturnType<typeof setInterval> | null = null;

/**
 * Service for translating text using AWS Translate
 * Includes caching to minimize API calls and request deduplication
 */
export class TranslationService {
  private client: TranslateClient | null = null;
  private region: string;

  constructor(region: string = "us-east-1") {
    this.region = region;
    this.initializeClient();
    // Clean up stale pending requests periodically (only start once globally)
    this.startCleanupInterval();
  }

  /**
   * Start the cleanup interval for stale pending requests
   * Only creates one global interval to avoid memory leaks
   */
  private startCleanupInterval(): void {
    // Only start one interval globally (check if already exists)
    if (!globalCleanupInterval) {
      globalCleanupInterval = setInterval(() => {
        const now = Date.now();
        for (const [key, request] of pendingRequests.entries()) {
          if (now - request.timestamp > PENDING_REQUEST_TIMEOUT) {
            pendingRequests.delete(key);
          }
        }
      }, 30000); // Clean up every 30 seconds
    }
  }

  /**
   * Cleanup method to clear intervals (useful for testing)
   */
  static destroyCleanupInterval(): void {
    if (globalCleanupInterval) {
      clearInterval(globalCleanupInterval);
      globalCleanupInterval = null;
    }
  }

  /**
   * Initialize AWS Translate client
   * Uses credentials from (in order of priority):
   * 1. Config file (src/config/aws-credentials.json) - created by load-aws-credentials script
   * 2. Environment variables (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)
   * 3. AWS credentials file (~/.aws/credentials) - if available
   * 4. IAM role (if running on EC2/Lambda)
   * 
   * To use AWS profiles, run:
   *   tsx scripts/load-aws-credentials.ts <profile-name> --config
   */
  private initializeClient(): void {
    try {
      const config: { region: string; credentials?: any } = {
        region: this.region,
      };

      // Priority 1: Use credentials from config file if available
      if (awsCredentials?.accessKeyId && awsCredentials?.secretAccessKey) {
        console.log("[TranslationService] Using credentials from config file");
        config.credentials = {
          accessKeyId: awsCredentials.accessKeyId,
          secretAccessKey: awsCredentials.secretAccessKey,
        };
        if (awsCredentials.region) {
          config.region = awsCredentials.region;
        }
      } else if (
        process.env.AWS_ACCESS_KEY_ID &&
        process.env.AWS_SECRET_ACCESS_KEY
      ) {
        // Priority 2: Use environment variables
        console.log("[TranslationService] Using credentials from environment variables");
        config.credentials = {
          accessKeyId: process.env.AWS_ACCESS_KEY_ID,
          secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        };
        if (process.env.AWS_SESSION_TOKEN) {
          config.credentials.sessionToken = process.env.AWS_SESSION_TOKEN;
        }
      } else {
        // Priority 3: Let SDK use default credential provider chain
        // This will try: env vars, credentials file, IAM role
        console.log(
          "[TranslationService] Using default credential provider chain"
        );
      }

      this.client = new TranslateClient(config);
    } catch (error) {
      console.error("[TranslationService] Error initializing Translate client:", error);
      this.client = null;
    }
  }

  /**
   * Generate cache key for a translation
   */
  private getCacheKey(
    text: string,
    sourceLanguage: LanguageCode,
    targetLanguage: LanguageCode
  ): string {
    // Use first 100 chars + hash for key (to avoid extremely long keys)
    const textKey = text.length > 100 ? text.substring(0, 100) + simpleHash(text) : text;
    const textHash = simpleHash(textKey);
    return `${CACHE_PREFIX}${sourceLanguage}:${targetLanguage}:${textHash}`;
  }

  /**
   * Get request key for deduplication
   */
  private getRequestKey(
    text: string,
    sourceLanguage: LanguageCode,
    targetLanguage: LanguageCode
  ): string {
    return `${sourceLanguage}:${targetLanguage}:${simpleHash(text)}`;
  }

  /**
   * Get cached translation if available
   */
  private async getCachedTranslation(
    text: string,
    sourceLanguage: LanguageCode,
    targetLanguage: LanguageCode
  ): Promise<string | null> {
    try {
      const cacheKey = this.getCacheKey(text, sourceLanguage, targetLanguage);
      const cached = await AsyncStorage.getItem(cacheKey);

      if (cached) {
        const cacheData: TranslationCache = JSON.parse(cached);
        const now = Date.now();
        const expiryTime = CACHE_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

        // Check if cache is still valid
        if (now - cacheData.timestamp < expiryTime) {
          return cacheData.translatedText;
        } else {
          // Cache expired, remove it
          await AsyncStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      console.error("[TranslationService] Error reading cache:", error);
    }

    return null;
  }

  /**
   * Cache a translation
   */
  private async cacheTranslation(
    text: string,
    sourceLanguage: LanguageCode,
    targetLanguage: LanguageCode,
    translatedText: string
  ): Promise<void> {
    try {
      const cacheKey = this.getCacheKey(text, sourceLanguage, targetLanguage);
      const cacheData: TranslationCache = {
        translatedText,
        timestamp: Date.now(),
      };
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      console.error("[TranslationService] Error caching translation:", error);
    }
  }

  /**
   * Translate text using AWS Translate
   * @param text - Text to translate
   * @param targetLanguage - Target language code (default: "en")
   * @param sourceLanguage - Source language code (default: "en", auto-detect if not provided)
   * @returns Translated text or original text if translation fails
   */
  async translateText(
    text: string,
    targetLanguage: LanguageCode = "en",
    sourceLanguage: LanguageCode = DEFAULT_SOURCE_LANGUAGE
  ): Promise<string> {
    // Return original text if no translation needed
    if (sourceLanguage === targetLanguage || !text || text.trim().length === 0) {
      console.log("📝 [TranslationService] Skipping translation", {
        sourceLanguage,
        targetLanguage,
        reason: sourceLanguage === targetLanguage ? "same language" : "empty text",
      });
      return text;
    }

    console.log("📝 [TranslationService] translateText called", {
      text: text.substring(0, 50),
      sourceLanguage,
      targetLanguage,
      hasClient: !!this.client,
    });

    // Check cache first
    const cached = await this.getCachedTranslation(text, sourceLanguage, targetLanguage);
    if (cached) {
      console.log("📝 [TranslationService] Using cached translation", {
        text: text.substring(0, 50),
        cached: cached.substring(0, 50),
      });
      return cached;
    }

    // Check for pending request (deduplication)
    const requestKey = this.getRequestKey(text, sourceLanguage, targetLanguage);
    const pending = pendingRequests.get(requestKey);
    if (pending) {
      return pending.promise;
    }

    // If client not initialized, return original text
    if (!this.client) {
      return text;
    }

    // Create new request promise
    const translationPromise = this.performTranslation(text, sourceLanguage, targetLanguage);
    
    // Store pending request
    pendingRequests.set(requestKey, {
      promise: translationPromise,
      timestamp: Date.now(),
    });

    // Clean up after completion (catch errors to prevent unhandled rejections)
    translationPromise
      .then(() => {
        pendingRequests.delete(requestKey);
      })
      .catch(() => {
        pendingRequests.delete(requestKey);
      });

    return translationPromise;
  }

  /**
   * Perform the actual translation API call
   */
  private async performTranslation(
    text: string,
    sourceLanguage: LanguageCode,
    targetLanguage: LanguageCode
  ): Promise<string> {
    // Safety check: client should be initialized before calling this method
    if (!this.client) {
      console.warn("[TranslationService] Client not initialized in performTranslation, returning original text");
      return text;
    }

    try {
      // Clean HTML tags from text before translation
      const cleanText = text.replace(/<[^>]*>/g, "").trim();

      if (!cleanText) {
        return text; // Return original if cleaned text is empty
      }

      // AWS Translate has a limit of 10,000 bytes per request
      // Split long text into chunks if needed
      const maxBytes = 10000;
      
      // Calculate UTF-8 byte length (React Native compatible)
      let textBytes: number;
      try {
        // Try using TextEncoder if available (modern React Native)
        if (typeof TextEncoder !== "undefined") {
          textBytes = new TextEncoder().encode(cleanText).length;
        } else {
          // Fallback: approximate UTF-8 byte length
          // Most characters are 1 byte, but some are 2-4 bytes
          // This is a conservative estimate
          textBytes = cleanText.length * 2; // Approximate: assume average 2 bytes per char
        }
      } catch (error) {
        // Fallback to character count * 2 (conservative estimate)
        textBytes = cleanText.length * 2;
      }

      if (textBytes > maxBytes) {
        // Truncate to fit within limit (approximate)
        const truncated = cleanText.substring(0, Math.floor((maxBytes / textBytes) * cleanText.length));
        return await this.translateText(truncated, targetLanguage, sourceLanguage);
      }

      const command = new TranslateTextCommand({
        Text: cleanText,
        SourceLanguageCode: sourceLanguage,
        TargetLanguageCode: targetLanguage,
      });

      const response = await this.client.send(command);

      if (response.TranslatedText) {
        const translatedText = response.TranslatedText;

        // Cache the translation
        await this.cacheTranslation(text, sourceLanguage, targetLanguage, translatedText);

        return translatedText;
      } else {
        return text;
      }
    } catch (error: any) {
      const errorMessage = error?.message || String(error);
      const errorStack = error?.stack;
      const errorName = error?.name;
      
      // Check if it's a clock skew error
      const isClockSkewError = errorMessage.includes("Signature not yet current") ||
                               errorMessage.includes("InvalidSignatureException") ||
                               errorName === "InvalidSignatureException";
      
      // Provide specific guidance for clock skew
      if (isClockSkewError) {
        console.error(
          "📝 [TranslationService] ❌ Clock Skew Error Detected!",
          {
            issue: "Device clock is out of sync with AWS servers",
            solution: "Sync your device's date/time with network time",
            details: "AWS requires requests to be within 15 minutes of server time. Your device appears to be ahead by several days.",
            quickFix: "Check device settings → Date & Time → Set Automatically",
          }
        );
      }
      
      // Provide helpful error message for missing credentials
      if (errorMessage.includes("Credential") || errorMessage.includes("credentials")) {
        console.warn(
          "📝 [TranslationService] AWS credentials not found. Translation disabled.",
          {
            suggestion: "Run: npm run load-aws-credentials <profile-name>",
          }
        );
      }
      
      // Return original text on error
      return text;
    }
  }

  /**
   * Translate multiple texts in batch (optimized)
   * @param texts - Array of texts to translate
   * @param targetLanguage - Target language code
   * @param sourceLanguage - Source language code
   * @returns Array of translated texts
   */
  async translateBatch(
    texts: string[],
    targetLanguage: LanguageCode = "en",
    sourceLanguage: LanguageCode = DEFAULT_SOURCE_LANGUAGE
  ): Promise<string[]> {
    // Check cache for all texts first
    const results: string[] = [];
    const textsToTranslate: { index: number; text: string }[] = [];

    for (let i = 0; i < texts.length; i++) {
      const text = texts[i];
      const cached = await this.getCachedTranslation(text, sourceLanguage, targetLanguage);
      if (cached) {
        results[i] = cached;
      } else {
        results[i] = ""; // Placeholder
        textsToTranslate.push({ index: i, text });
      }
    }

    // Translate remaining texts in parallel (with deduplication)
    const translationPromises = textsToTranslate.map(({ index, text }) =>
      this.translateText(text, targetLanguage, sourceLanguage).then((translated) => {
        results[index] = translated;
      })
    );

    await Promise.all(translationPromises);

    return results;
  }

  /**
   * Clear translation cache
   */
  async clearCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
      console.log(`[TranslationService] Cleared ${cacheKeys.length} cached translations`);
    } catch (error) {
      console.error("[TranslationService] Error clearing cache:", error);
    }
  }
}

// Singleton instance
let translationServiceInstance: TranslationService | null = null;

/**
 * Get or create the translation service instance
 */
export const getTranslationService = (region?: string): TranslationService => {
  if (!translationServiceInstance) {
    translationServiceInstance = new TranslationService(region);
  }
  return translationServiceInstance;
};
