import AsyncStorage from "@react-native-async-storage/async-storage";
import { TranslationService } from "@services/TranslationService";
import { TranslationMemoryService } from "@services/TranslationMemoryService";
import {
  TranslateClient,
  TranslateTextCommand,
} from "@aws-sdk/client-translate";

// Mock AWS SDK
jest.mock("@aws-sdk/client-translate", () => ({
  TranslateClient: jest.fn().mockImplementation(() => ({
    send: jest.fn(),
  })),
  TranslateTextCommand: jest.fn().mockImplementation((params: any) => params),
}));

// Mock TranslationMemoryService
jest.mock("@services/TranslationMemoryService", () => ({
  TranslationMemoryService: {
    getTranslation: jest.fn(),
    storeTranslation: jest.fn(),
  },
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("TranslationService", () => {
  let service: TranslationService;
  let mockClient: { send: jest.Mock };

  beforeEach(() => {
    jest.clearAllMocks();
    (TranslationMemoryService.getTranslation as jest.Mock).mockResolvedValue(
      null
    );
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    // Create a new service instance with mocked client
    mockClient = {
      send: jest.fn(),
    };
    (TranslateClient as jest.Mock).mockReturnValue(mockClient);

    service = new TranslationService("us-east-1");
  });

  afterEach(() => {
    TranslationService.destroyCleanupInterval();
  });

  describe("translateText", () => {
    it("should return original text if source and target languages are the same", async () => {
      const result = await service.translateText("Hello", "en", "en");

      expect(result).toBe("Hello");
      expect(mockClient.send).not.toHaveBeenCalled();
    });

    it("should return original text if text is empty", async () => {
      const result = await service.translateText("", "es", "en");

      expect(result).toBe("");
      expect(mockClient.send).not.toHaveBeenCalled();
    });

    it("should return original text if text is only whitespace", async () => {
      const result = await service.translateText("   ", "es", "en");

      expect(result).toBe("   ");
      expect(mockClient.send).not.toHaveBeenCalled();
    });

    it("should check translation memory first", async () => {
      (TranslationMemoryService.getTranslation as jest.Mock).mockResolvedValue(
        "Hola"
      );

      const result = await service.translateText("Hello", "es", "en");

      expect(result).toBe("Hola");
      expect(TranslationMemoryService.getTranslation).toHaveBeenCalledWith(
        "Hello",
        "en",
        "es"
      );
      expect(mockClient.send).not.toHaveBeenCalled();
    });

    it("should use cached translation if available", async () => {
      const cacheData = {
        translatedText: "Cached Translation",
        timestamp: Date.now() - 1000, // 1 second ago
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(cacheData)
      );

      const result = await service.translateText("Hello", "es", "en");

      expect(result).toBe("Cached Translation");
      expect(mockClient.send).not.toHaveBeenCalled();
    });

    it("should remove expired cache and translate", async () => {
      const expiredCache = {
        translatedText: "Expired Translation",
        timestamp: Date.now() - 31 * 24 * 60 * 60 * 1000, // 31 days ago
      };
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
        JSON.stringify(expiredCache)
      );
      mockClient.send.mockResolvedValue({
        TranslatedText: "New Translation",
      });

      const result = await service.translateText("Hello", "es", "en");

      expect(AsyncStorage.removeItem).toHaveBeenCalled();
      expect(mockClient.send).toHaveBeenCalled();
      expect(result).toBe("New Translation");
    });

    it("should translate text successfully", async () => {
      mockClient.send.mockResolvedValue({
        TranslatedText: "Hola",
      });

      const result = await service.translateText("Hello", "es", "en");

      expect(mockClient.send).toHaveBeenCalled();
      expect(result).toBe("Hola");
      expect(AsyncStorage.setItem).toHaveBeenCalled(); // Should cache the result
    });

    it("should return original text if translation fails", async () => {
      mockClient.send.mockRejectedValue(new Error("Translation failed"));

      const result = await service.translateText("Hello", "es", "en");

      expect(result).toBe("Hello");
    });

    it("should return original text if client is not initialized", async () => {
      const serviceWithoutClient = new TranslationService("us-east-1");
      // Force client to be null
      (serviceWithoutClient as any).client = null;

      const result = await serviceWithoutClient.translateText(
        "Hello",
        "es",
        "en"
      );

      expect(result).toBe("Hello");
    });

    it("should deduplicate concurrent requests for same text", async () => {
      mockClient.send.mockImplementation(
        () =>
          new Promise(resolve =>
            setTimeout(() => resolve({ TranslatedText: "Hola" }), 100)
          )
      );

      const promise1 = service.translateText("Hello", "es", "en");
      const promise2 = service.translateText("Hello", "es", "en");

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe("Hola");
      expect(result2).toBe("Hola");
      // Should only call send once due to deduplication
      expect(mockClient.send).toHaveBeenCalledTimes(1);
    });

    it("should clean HTML tags before translation", async () => {
      mockClient.send.mockResolvedValue({
        TranslatedText: "Hola",
      });

      await service.translateText("<p>Hello</p>", "es", "en");

      expect(TranslateTextCommand).toHaveBeenCalledWith({
        Text: "Hello",
        SourceLanguageCode: "en",
        TargetLanguageCode: "es",
      });
    });
  });

  describe("translateBatch", () => {
    it("should translate multiple texts", async () => {
      mockClient.send
        .mockResolvedValueOnce({ TranslatedText: "Hola" })
        .mockResolvedValueOnce({ TranslatedText: "Mundo" });

      const result = await service.translateBatch(
        ["Hello", "World"],
        "es",
        "en"
      );

      expect(result).toEqual(["Hola", "Mundo"]);
      expect(mockClient.send).toHaveBeenCalledTimes(2);
    });

    it("should handle empty batch", async () => {
      const result = await service.translateBatch([], "es", "en");

      expect(result).toEqual([]);
      expect(mockClient.send).not.toHaveBeenCalled();
    });

    it("should return original texts if translation fails", async () => {
      mockClient.send.mockRejectedValue(new Error("Translation failed"));

      const result = await service.translateBatch(
        ["Hello", "World"],
        "es",
        "en"
      );

      expect(result).toEqual(["Hello", "World"]);
    });
  });
});
