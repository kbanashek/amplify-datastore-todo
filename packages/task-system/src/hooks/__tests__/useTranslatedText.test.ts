import { renderHook, waitFor } from "@testing-library/react-native";
import { createMockTFunction } from "../../__mocks__/translationMocks";
import type { LanguageCode } from "@translations/translationTypes";

// Mock useTaskTranslation hook BEFORE importing useTranslatedText
const mockUseTaskTranslation = jest.fn();

jest.mock("@translations/index", () => ({
  ...jest.requireActual("../../translations"),
  useTaskTranslation: () => mockUseTaskTranslation(),
}));

// Import after mock setup
import { useTranslatedText } from "@hooks/useTranslatedText";

describe("useTranslatedText", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset to default English
    mockUseTaskTranslation.mockReturnValue({
      t: createMockTFunction("en"),
      i18n: {
        language: "en",
        changeLanguage: jest.fn(),
      },
      ready: true,
      currentLanguage: "en" as LanguageCode,
      setLanguage: jest.fn(),
      isRTL: false,
    });
  });

  describe("English language (no translation)", () => {
    it("returns original text when language is English", async () => {
      const { result } = renderHook(() => useTranslatedText("Hello World"));
      await waitFor(() => {
        expect(result.current.translatedText).toBe("Hello World");
        expect(result.current.isTranslating).toBe(false);
      });
    });

    it("returns original text when language matches source language", async () => {
      mockUseTaskTranslation.mockReturnValue({
        t: createMockTFunction("es"),
        i18n: {
          language: "es",
          changeLanguage: jest.fn(),
        },
        ready: true,
        currentLanguage: "es" as LanguageCode,
        setLanguage: jest.fn(),
        isRTL: false,
      });
      const { result } = renderHook(() =>
        useTranslatedText("Hello World", "es")
      );
      await waitFor(() => {
        expect(result.current.translatedText).toBe("Hello World");
        expect(result.current.isTranslating).toBe(false);
      });
    });
  });

  describe("translation", () => {
    beforeEach(() => {
      mockUseTaskTranslation.mockReturnValue({
        t: createMockTFunction("es"),
        i18n: {
          language: "es",
          changeLanguage: jest.fn(),
        },
        ready: true,
        currentLanguage: "es" as LanguageCode,
        setLanguage: jest.fn(),
        isRTL: false,
      });
    });

    it("translates text when language is not English", async () => {
      const { result } = renderHook(() => useTranslatedText("BEGIN"));
      await waitFor(() => {
        // BEGIN should translate to COMENZAR via TEXT_TO_KEY_MAP
        expect(result.current.translatedText).toBe("COMENZAR");
        expect(result.current.isTranslating).toBe(false);
      });
    });

    it("handles unknown text gracefully", async () => {
      const { result } = renderHook(() => useTranslatedText("Unknown Text"));
      await waitFor(() => {
        // Unknown text should return as-is
        expect(result.current.translatedText).toBe("Unknown Text");
        expect(result.current.isTranslating).toBe(false);
      });
    });
  });

  describe("empty text", () => {
    it("returns empty string for empty text", async () => {
      const { result } = renderHook(() => useTranslatedText(""));
      await waitFor(() => {
        expect(result.current.translatedText).toBe("");
        expect(result.current.isTranslating).toBe(false);
      });
    });

    it("returns whitespace-only text without translation", async () => {
      const { result } = renderHook(() => useTranslatedText("   "));
      await waitFor(() => {
        expect(result.current.translatedText).toBe("   ");
        expect(result.current.isTranslating).toBe(false);
      });
    });
  });

  describe("isTranslating state", () => {
    it("returns false when translation is ready", () => {
      const { result } = renderHook(() => useTranslatedText("Hello World"));
      // With i18next, translations are synchronous, so isTranslating should be false once ready
      expect(result.current.isTranslating).toBe(false);
    });

    it("returns true when translation is not ready", () => {
      mockUseTaskTranslation.mockReturnValue({
        t: createMockTFunction("en"),
        i18n: {
          language: "en",
          changeLanguage: jest.fn(),
        },
        ready: false,
        currentLanguage: "en" as LanguageCode,
        setLanguage: jest.fn(),
        isRTL: false,
      });
      const { result } = renderHook(() => useTranslatedText("Hello World"));
      expect(result.current.isTranslating).toBe(true);
    });
  });
});
