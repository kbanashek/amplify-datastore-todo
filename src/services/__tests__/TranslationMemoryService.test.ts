import AsyncStorage from "@react-native-async-storage/async-storage";

import { TranslationMemoryService } from "../TranslationMemoryService";

describe("TranslationMemoryService", () => {
  beforeEach(async () => {
    TranslationMemoryService.clearInMemoryForTests();
    // @ts-expect-error - jest mock type
    await AsyncStorage.clear();
  });

  it("returns null when no translation exists", async () => {
    const result = await TranslationMemoryService.getTranslation(
      "Hello",
      "en" as any,
      "es" as any
    );
    expect(result).toBeNull();
  });

  it("stores and retrieves a translation", async () => {
    await TranslationMemoryService.storeTranslation(
      "Hello",
      "Hola",
      "en" as any,
      "es" as any
    );

    const result = await TranslationMemoryService.getTranslation(
      "Hello",
      "en" as any,
      "es" as any
    );
    expect(result).toBe("Hola");
  });

  it("rehydrates from AsyncStorage on subsequent reads", async () => {
    await TranslationMemoryService.storeTranslation(
      "Save",
      "Guardar",
      "en" as any,
      "es" as any
    );

    // simulate fresh process memory
    TranslationMemoryService.clearInMemoryForTests();

    const result = await TranslationMemoryService.getTranslation(
      "Save",
      "en" as any,
      "es" as any
    );
    expect(result).toBe("Guardar");
  });
});
