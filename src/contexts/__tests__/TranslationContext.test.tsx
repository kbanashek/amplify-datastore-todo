import React from "react";
import { renderHook, waitFor } from "@testing-library/react-native";
import { TranslationProvider, useTranslation } from "../TranslationContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Mock AsyncStorage
jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
}));

// Mock TranslationService
jest.mock("../../services/TranslationService", () => ({
  TranslationService: jest.fn().mockImplementation(() => ({
    translateText: jest.fn().mockResolvedValue("translated"),
  })),
  getTranslationService: jest.fn(() => ({
    translateText: jest.fn().mockResolvedValue("translated"),
  })),
  SUPPORTED_LANGUAGES: [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
  ],
}));

describe("TranslationContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should load saved language preference on mount", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("es");

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TranslationProvider>{children}</TranslationProvider>
    );

    const { result } = renderHook(() => useTranslation(), { wrapper });

    await waitFor(() => {
      expect(result.current.currentLanguage).toBe("es");
    });

    expect(AsyncStorage.getItem).toHaveBeenCalledWith("user_language_preference");
  });

  it("should use default language if no saved preference", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TranslationProvider>{children}</TranslationProvider>
    );

    const { result } = renderHook(() => useTranslation(), { wrapper });

    await waitFor(() => {
      expect(result.current.currentLanguage).toBe("en");
    });
  });

  it("should save language preference when changed", async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <TranslationProvider>{children}</TranslationProvider>
    );

    const { result } = renderHook(() => useTranslation(), { wrapper });

    await waitFor(() => {
      expect(result.current.currentLanguage).toBe("en");
    });

    await result.current.setLanguage("es");

    expect(AsyncStorage.setItem).toHaveBeenCalledWith("user_language_preference", "es");
    
    await waitFor(() => {
      expect(result.current.currentLanguage).toBe("es");
    });
  });

  it("should persist language preference across reloads", async () => {
    // Simulate first app load - save Spanish
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    
    const wrapper1 = ({ children }: { children: React.ReactNode }) => (
      <TranslationProvider>{children}</TranslationProvider>
    );

    const { result: result1 } = renderHook(() => useTranslation(), { wrapper: wrapper1 });
    
    await result1.current.setLanguage("es");
    
    await waitFor(() => {
      expect(result1.current.currentLanguage).toBe("es");
    });

    // Simulate app reload - should load Spanish
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue("es");
    
    const wrapper2 = ({ children }: { children: React.ReactNode }) => (
      <TranslationProvider>{children}</TranslationProvider>
    );

    const { result: result2 } = renderHook(() => useTranslation(), { wrapper: wrapper2 });

    await waitFor(() => {
      expect(result2.current.currentLanguage).toBe("es");
    });
  });
});

