import {
  isRTLMode,
  getTranslationKey,
  safeTranslate,
  getDefaultNamespace,
} from "../translationUtils";
import type { TFunction } from "i18next";

describe("translationUtils", () => {
  describe("isRTLMode", () => {
    it("should return true for RTL languages", () => {
      expect(isRTLMode("ar")).toBe(true);
      expect(isRTLMode("he")).toBe(true);
      expect(isRTLMode("ur")).toBe(true);
    });

    it("should return false for LTR languages", () => {
      expect(isRTLMode("en")).toBe(false);
      expect(isRTLMode("es")).toBe(false);
      expect(isRTLMode("fr")).toBe(false);
    });
  });

  describe("getTranslationKey", () => {
    it("should build namespaced key with default namespace", () => {
      const key = getTranslationKey("task.begin");
      expect(key).toBe(`${getDefaultNamespace()}:task.begin`);
    });

    it("should build namespaced key with custom namespace", () => {
      const key = getTranslationKey("begin", "custom");
      expect(key).toBe("custom:begin");
    });
  });

  describe("safeTranslate", () => {
    it("should return translation when available", () => {
      const mockT: TFunction = jest.fn((key: string) => {
        if (key.includes("task.begin")) return "BEGIN";
        return key;
      }) as any;

      const result = safeTranslate(mockT, "task.begin", "Fallback");
      expect(result).toBe("BEGIN");
    });

    it("should return fallback when translation not found", () => {
      const mockT: TFunction = jest.fn((key: string) => key) as any;

      const result = safeTranslate(mockT, "task.unknown", "Fallback Text");
      expect(result).toBe("Fallback Text");
    });

    it("should return key when no fallback provided", () => {
      const mockT: TFunction = jest.fn((key: string) => key) as any;

      const result = safeTranslate(mockT, "task.unknown");
      expect(result).toBe("task.unknown");
    });
  });
});
