import AsyncStorage from "@react-native-async-storage/async-storage";
import { TranslationMemoryService } from "@services/TranslationMemoryService";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock translations to prevent seed loading
jest.mock("@translations/index", () => ({
  seedTranslationMemories: [],
}));

describe("TranslationMemoryService", () => {
  beforeEach(async () => {
    TranslationMemoryService.clearInMemoryForTests();
    jest.clearAllMocks();
    (AsyncStorage.clear as jest.Mock).mockResolvedValue(undefined);
    await AsyncStorage.clear();
  });

  it("returns null when no translation exists", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const result = await TranslationMemoryService.getTranslation(
      "Hello",
      "en" as any,
      "es" as any
    );
    expect(result).toBeNull();
  });

  it("stores and retrieves a translation", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    await TranslationMemoryService.storeTranslation(
      "Hello",
      "Hola",
      "en" as any,
      "es" as any
    );

    // The translation should be in memory now, so getItem won't be called
    const result = await TranslationMemoryService.getTranslation(
      "Hello",
      "en" as any,
      "es" as any
    );
    expect(result).toBe("Hola");
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });

  it("rehydrates from AsyncStorage on subsequent reads", async () => {
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    // First, store the translation
    await TranslationMemoryService.storeTranslation(
      "Save",
      "Guardar",
      "en" as any,
      "es" as any
    );

    // Verify it was stored
    expect(AsyncStorage.setItem).toHaveBeenCalled();

    // simulate fresh process memory
    TranslationMemoryService.clearInMemoryForTests();

    // Mock AsyncStorage to return the stored entry (as JSON)
    const storedEntry = {
      sourceLanguage: "en",
      targetLanguage: "es",
      sourceText: "Save",
      translatedText: "Guardar",
      updatedAt: Date.now(),
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify(storedEntry)
    );

    const result = await TranslationMemoryService.getTranslation(
      "Save",
      "en" as any,
      "es" as any
    );

    // The service should call AsyncStorage.getItem to rehydrate
    expect(AsyncStorage.getItem).toHaveBeenCalled();
    // After rehydration, it should return the stored value
    expect(result).toBe("Guardar");
  });
});
