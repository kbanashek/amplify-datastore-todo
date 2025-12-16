import { renderHook, waitFor } from "@testing-library/react-native";
import { useTranslatedText } from "../useTranslatedText";

// Mock TranslationContext
jest.mock("../../contexts/TranslationContext", () => ({
  useTranslation: jest.fn(),
}));

import { useTranslation } from "../../contexts/TranslationContext";

describe("useTranslatedText", () => {
  const mockTranslate = jest.fn();
  const mockUseTranslation = useTranslation as jest.MockedFunction<
    typeof useTranslation
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTranslate.mockResolvedValue("translated text");
    mockUseTranslation.mockReturnValue({
      currentLanguage: "en",
      setLanguage: jest.fn(),
      translate: mockTranslate,
      translateSync: (text: string) => text,
      isTranslating: false,
      isRTL: false,
      supportedLanguages: [],
      translationService: {
        translateText: jest.fn(async (text: string) => text),
        translateBatch: jest.fn(async (texts: string[]) => texts),
      },
    } as any);
  });

  describe("English language (no translation)", () => {
    it("returns original text when language is English", async () => {
      const { result } = renderHook(() => useTranslatedText("Hello World"));
      await waitFor(() => {
        expect(result.current.translatedText).toBe("Hello World");
        expect(result.current.isTranslating).toBe(false);
      });
      expect(mockTranslate).not.toHaveBeenCalled();
    });

    it("returns original text when language matches source language", async () => {
      mockUseTranslation.mockReturnValue({
        currentLanguage: "es",
        setLanguage: jest.fn(),
        translate: mockTranslate,
        translateSync: (text: string) => text,
        isTranslating: false,
        isRTL: false,
        supportedLanguages: [],
        translationService: {
          translateText: jest.fn(async (text: string) => text),
          translateBatch: jest.fn(async (texts: string[]) => texts),
        },
      } as any);
      const { result } = renderHook(() =>
        useTranslatedText("Hello World", "es")
      );
      await waitFor(() => {
        expect(result.current.translatedText).toBe("Hello World");
        expect(result.current.isTranslating).toBe(false);
      });
      expect(mockTranslate).not.toHaveBeenCalled();
    });
  });

  describe("translation", () => {
    beforeEach(() => {
      mockUseTranslation.mockReturnValue({
        currentLanguage: "es",
        setLanguage: jest.fn(),
        translate: mockTranslate,
        translateSync: (text: string) => text,
        isTranslating: false,
        isRTL: false,
        supportedLanguages: [],
        translationService: {
          translateText: jest.fn(async (text: string) => text),
          translateBatch: jest.fn(async (texts: string[]) => texts),
        },
      } as any);
    });

    it("translates text when language is not English", async () => {
      mockTranslate.mockResolvedValue("Hola Mundo");
      const { result } = renderHook(() => useTranslatedText("Hello World"));
      expect(result.current.isTranslating).toBe(true);
      await waitFor(() => {
        expect(result.current.translatedText).toBe("Hola Mundo");
        expect(result.current.isTranslating).toBe(false);
      });
      expect(mockTranslate).toHaveBeenCalledWith("Hello World", undefined);
    });

    it("shows loading state while translating", () => {
      mockTranslate.mockImplementation(
        () =>
          new Promise(resolve => setTimeout(() => resolve("translated"), 100))
      );
      const { result } = renderHook(() => useTranslatedText("Hello World"));
      expect(result.current.isTranslating).toBe(true);
      expect(result.current.translatedText).toBe("Hello World");
    });

    it("handles translation errors gracefully", async () => {
      mockTranslate.mockRejectedValue(new Error("Translation failed"));
      const { result } = renderHook(() => useTranslatedText("Hello World"));
      await waitFor(() => {
        expect(result.current.translatedText).toBe("Hello World");
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
      expect(mockTranslate).not.toHaveBeenCalled();
    });

    it("returns whitespace-only text without translation", async () => {
      const { result } = renderHook(() => useTranslatedText("   "));
      await waitFor(() => {
        expect(result.current.translatedText).toBe("   ");
        expect(result.current.isTranslating).toBe(false);
      });
      expect(mockTranslate).not.toHaveBeenCalled();
    });
  });

  describe("language changes", () => {
    it("re-translates when language changes", async () => {
      mockUseTranslation.mockReturnValue({
        currentLanguage: "en",
        setLanguage: jest.fn(),
        translate: mockTranslate,
        translateSync: (text: string) => text,
        isTranslating: false,
        isRTL: false,
        supportedLanguages: [],
        translationService: {
          translateText: jest.fn(async (text: string) => text),
          translateBatch: jest.fn(async (texts: string[]) => texts),
        },
      } as any);
      const { result, rerender } = renderHook(
        ({ text }) => useTranslatedText(text),
        { initialProps: { text: "Hello World" } }
      );
      await waitFor(() => {
        expect(result.current.translatedText).toBe("Hello World");
      });

      mockUseTranslation.mockReturnValue({
        currentLanguage: "es",
        setLanguage: jest.fn(),
        translate: mockTranslate,
        translateSync: (text: string) => text,
        isTranslating: false,
        isRTL: false,
        supportedLanguages: [],
        translationService: {
          translateText: jest.fn(async (text: string) => text),
          translateBatch: jest.fn(async (texts: string[]) => texts),
        },
      } as any);
      mockTranslate.mockResolvedValue("Hola Mundo");
      rerender({ text: "Hello World" });
      await waitFor(() => {
        expect(mockTranslate).toHaveBeenCalled();
      });
    });
  });

  describe("global isTranslating", () => {
    it("includes global isTranslating state", () => {
      mockUseTranslation.mockReturnValue({
        currentLanguage: "es",
        setLanguage: jest.fn(),
        translate: mockTranslate,
        translateSync: (text: string) => text,
        isTranslating: true,
        isRTL: false,
        supportedLanguages: [],
        translationService: {
          translateText: jest.fn(async (text: string) => text),
          translateBatch: jest.fn(async (texts: string[]) => texts),
        },
      } as any);
      const { result } = renderHook(() => useTranslatedText("Hello World"));
      expect(result.current.isTranslating).toBe(true);
    });
  });
});
