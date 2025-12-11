import { TranslationService, getTranslationService, LanguageCode } from "../TranslationService";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { TranslateClient, TranslateTextCommand } from "@aws-sdk/client-translate";

const PENDING_REQUEST_TIMEOUT = 60000; // 1 minute - matches TranslationService

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  getAllKeys: jest.fn(),
  multiRemove: jest.fn(),
}));

// Mock AWS SDK
jest.mock("@aws-sdk/client-translate", () => ({
  TranslateClient: jest.fn(),
  TranslateTextCommand: jest.fn(),
}));

describe("TranslationService", () => {
  let service: TranslationService;
  let mockClient: jest.Mocked<TranslateClient>;
  let mockSend: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    
    // Setup mock client
    mockSend = jest.fn();
    mockClient = {
      send: mockSend,
    } as any;
    
    (TranslateClient as jest.Mock).mockImplementation(() => mockClient);
    
    // Create fresh service instance
    service = new TranslationService("us-east-1");
    // Manually set the client since we can't easily mock the initialization
    (service as any).client = mockClient;
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
    // Clean up global interval
    TranslationService.destroyCleanupInterval();
  });

  afterAll(() => {
    // Ensure cleanup in case tests fail
    TranslationService.destroyCleanupInterval();
  });

  describe("translateText", () => {
    it("should return original text if source and target languages are the same", async () => {
      const result = await service.translateText("Hello", "en", "en");
      expect(result).toBe("Hello");
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("should return original text if text is empty", async () => {
      const result = await service.translateText("", "en", "es");
      expect(result).toBe("");
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("should return original text if client is not initialized", async () => {
      (service as any).client = null;
      const result = await service.translateText("Hello", "en", "es");
      expect(result).toBe("Hello");
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("should return cached translation if available", async () => {
      const cacheKey = "translation_cache:en:es:abc123";
      const cachedData = {
        translatedText: "Hola",
        timestamp: Date.now(),
      };
      
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(cachedData));
      
      // Mock the getCacheKey method by setting up the cache
      const result = await service.translateText("Hello", "es", "en");
      
      // Should check cache first
      expect(AsyncStorage.getItem).toHaveBeenCalled();
    });

    it("should call AWS Translate API when translation is needed", async () => {
      const mockResponse = {
        TranslatedText: "Hola",
        SourceLanguageCode: "en",
        TargetLanguageCode: "es",
      };
      
      mockSend.mockResolvedValue(mockResponse);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      const result = await service.translateText("Hello", "es", "en");
      
      expect(mockSend).toHaveBeenCalled();
      expect(TranslateTextCommand).toHaveBeenCalledWith({
        Text: "Hello",
        SourceLanguageCode: "en",
        TargetLanguageCode: "es",
      });
      expect(result).toBe("Hola");
      expect(AsyncStorage.setItem).toHaveBeenCalled(); // Should cache the result
    });

    it("should deduplicate simultaneous requests for the same text", async () => {
      const mockResponse = {
        TranslatedText: "Hola",
        SourceLanguageCode: "en",
        TargetLanguageCode: "es",
      };
      
      mockSend.mockResolvedValue(mockResponse);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      // Make two simultaneous requests for the same text
      const promise1 = service.translateText("Hello", "es", "en");
      const promise2 = service.translateText("Hello", "es", "en");
      
      const [result1, result2] = await Promise.all([promise1, promise2]);
      
      // Should only call API once (deduplication)
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(result1).toBe("Hola");
      expect(result2).toBe("Hola");
    });

    it("should handle API errors gracefully", async () => {
      const error = new Error("API Error");
      mockSend.mockRejectedValue(error);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const result = await service.translateText("Hello", "es", "en");
      
      expect(result).toBe("Hello"); // Should return original text on error
    });

    it("should handle empty response from API", async () => {
      const mockResponse = {
        TranslatedText: undefined,
        SourceLanguageCode: "en",
        TargetLanguageCode: "es",
      };
      
      mockSend.mockResolvedValue(mockResponse);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      
      const result = await service.translateText("Hello", "es", "en");
      
      expect(result).toBe("Hello"); // Should return original if no translation
    });

    it("should clean HTML tags before translation", async () => {
      const mockResponse = {
        TranslatedText: "Hola",
        SourceLanguageCode: "en",
        TargetLanguageCode: "es",
      };
      
      mockSend.mockResolvedValue(mockResponse);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      await service.translateText("<p>Hello</p>", "es", "en");
      
      expect(TranslateTextCommand).toHaveBeenCalledWith({
        Text: "Hello", // HTML tags should be removed
        SourceLanguageCode: "en",
        TargetLanguageCode: "es",
      });
    });

    it("should handle text that exceeds 10KB limit", async () => {
      // Create text that exceeds 10KB (approximately)
      const longText = "Hello ".repeat(2000); // ~12KB
      const mockResponse = {
        TranslatedText: "Hola ".repeat(2000),
        SourceLanguageCode: "en",
        TargetLanguageCode: "es",
      };
      
      mockSend.mockResolvedValue(mockResponse);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      const result = await service.translateText(longText, "es", "en");
      
      // Should truncate and translate
      expect(mockSend).toHaveBeenCalled();
      const commandCall = (TranslateTextCommand as jest.Mock).mock.calls[0][0];
      expect(commandCall.Text.length).toBeLessThanOrEqual(longText.length);
    });
  });

  describe("translateBatch", () => {
    it("should translate multiple texts in parallel", async () => {
      const texts = ["Hello", "World", "Test"];
      const mockResponse = {
        TranslatedText: "Hola",
        SourceLanguageCode: "en",
        TargetLanguageCode: "es",
      };
      
      mockSend.mockResolvedValue(mockResponse);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      const results = await service.translateBatch(texts, "es", "en");
      
      expect(results).toHaveLength(3);
      expect(mockSend).toHaveBeenCalledTimes(3);
    });

    it("should use cached translations when available", async () => {
      const texts = ["Hello", "World"];
      const cachedData = {
        translatedText: "Hola",
        timestamp: Date.now(),
      };
      
      // First text is cached, second is not
      (AsyncStorage.getItem as jest.Mock)
        .mockResolvedValueOnce(JSON.stringify(cachedData))
        .mockResolvedValueOnce(null);
      
      const mockResponse = {
        TranslatedText: "Mundo",
        SourceLanguageCode: "en",
        TargetLanguageCode: "es",
      };
      mockSend.mockResolvedValue(mockResponse);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      const results = await service.translateBatch(texts, "es", "en");
      
      expect(results).toHaveLength(2);
      expect(mockSend).toHaveBeenCalledTimes(1); // Only one API call for uncached text
    });
  });

  describe("clearCache", () => {
    it("should clear all cached translations", async () => {
      const keys = [
        "translation_cache:en:es:abc123",
        "translation_cache:en:fr:def456",
        "other_key",
      ];
      
      (AsyncStorage.getAllKeys as jest.Mock).mockResolvedValue(keys);
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);
      
      await service.clearCache();
      
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        "translation_cache:en:es:abc123",
        "translation_cache:en:fr:def456",
      ]);
    });
  });

  describe("getTranslationService", () => {
    it("should return singleton instance", () => {
      const instance1 = getTranslationService();
      const instance2 = getTranslationService();
      
      expect(instance1).toBe(instance2);
    });
  });

  describe("edge cases", () => {
    it("should handle null client in performTranslation", async () => {
      (service as any).client = null;
      const result = await (service as any).performTranslation("Hello", "en", "es");
      expect(result).toBe("Hello");
    });

    it("should handle cleanup interval properly", () => {
      // Test that cleanup interval can be destroyed
      TranslationService.destroyCleanupInterval();
      // Create a new service - should recreate the interval
      const newService = new TranslationService("us-east-1");
      (newService as any).client = mockClient;
      // Should not throw
      expect(newService).toBeDefined();
      TranslationService.destroyCleanupInterval();
    });

    it("should handle whitespace-only text", async () => {
      const result = await service.translateText("   ", "es", "en");
      expect(result).toBe("   ");
      expect(mockSend).not.toHaveBeenCalled();
    });

    it("should handle special characters", async () => {
      const mockResponse = {
        TranslatedText: "¿Cómo estás?",
        SourceLanguageCode: "en",
        TargetLanguageCode: "es",
      };
      
      mockSend.mockResolvedValue(mockResponse);
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      
      const result = await service.translateText("How are you?", "es", "en");
      
      expect(result).toBe("¿Cómo estás?");
    });
  });
});

