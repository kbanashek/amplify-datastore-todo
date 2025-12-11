import React from "react";
import { renderHook } from "@testing-library/react-native";
import { useTranslatedText } from "../useTranslatedText";
import { TranslationProvider } from "../../contexts/TranslationContext";

// Mock TranslationService
const mockTranslateText = jest.fn();
jest.mock("../../services/TranslationService", () => ({
  TranslationService: jest.fn().mockImplementation(() => ({
    translateText: mockTranslateText,
  })),
  getTranslationService: jest.fn(() => ({
    translateText: mockTranslateText,
  })),
  SUPPORTED_LANGUAGES: [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
  ],
}));

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe("useTranslatedText", () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <TranslationProvider>{children}</TranslationProvider>
  );

  beforeEach(() => {
    jest.clearAllMocks();
    mockTranslateText.mockClear();
  });

  it("should return original text when language is English", () => {
    const { result } = renderHook(() => useTranslatedText("Hello"), { wrapper });
    
    expect(result.current.translatedText).toBe("Hello");
    expect(result.current.isTranslating).toBe(false);
  });

  it("should return original text when text is empty", () => {
    const { result } = renderHook(() => useTranslatedText(""), { wrapper });
    
    expect(result.current.translatedText).toBe("");
    expect(result.current.isTranslating).toBe(false);
  });

  it("should not re-translate if text and language haven't changed", () => {
    const { result, rerender } = renderHook(
      () => useTranslatedText("Hello"),
      { wrapper }
    );

    expect(result.current.translatedText).toBe("Hello");
    
    // Rerender with same text - should not trigger new translation
    rerender();
    
    // Should still be original (no translation triggered for English)
    expect(result.current.translatedText).toBe("Hello");
    expect(mockTranslateText).not.toHaveBeenCalled();
  });

  it("should update translatedText when text changes", () => {
    const { result, rerender } = renderHook(
      ({ text }: { text: string }) => useTranslatedText(text),
      {
        wrapper,
        initialProps: { text: "Hello" },
      }
    );

    expect(result.current.translatedText).toBe("Hello");
    
    // Change text
    rerender({ text: "World" });
    
    // Should update to new text
    expect(result.current.translatedText).toBe("World");
  });
});


