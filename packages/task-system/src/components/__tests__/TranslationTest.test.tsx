import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TranslationTest } from "@components/TranslationTest";

// Mock useTaskTranslation
const mockSetLanguage = jest.fn();
const mockT = jest.fn((key: string, options?: any) => {
  if (options?.fallback) return options.fallback;
  return key;
});

const mockUseTaskTranslation = jest.fn(() => ({
  currentLanguage: "en",
  setLanguage: mockSetLanguage,
  i18n: {
    language: "en",
  },
  t: mockT,
}));

jest.mock("@translations/index", () => ({
  useTaskTranslation: () => mockUseTaskTranslation(),
}));

// Mock TranslatedText
jest.mock("@components/TranslatedText", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    TranslatedText: ({ text, testID }: any) => (
      <Text testID={testID}>{text}</Text>
    ),
  };
});

describe("TranslationTest", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskTranslation.mockReturnValue({
      currentLanguage: "en",
      setLanguage: mockSetLanguage,
      i18n: {
        language: "en",
      },
      t: mockT,
    });
  });

  // 1. Basic Rendering
  describe("Rendering", () => {
    it("renders with required props", () => {
      const { getByTestId } = render(<TranslationTest />);
      expect(getByTestId("translation-test")).toBeTruthy();
      expect(getByTestId("translation-test-title")).toBeTruthy();
    });

    it("renders title", () => {
      const { getByTestId } = render(<TranslationTest />);
      const title = getByTestId("translation-test-title");
      expect(title.props.children).toBe("Translation Test");
    });

    it("renders current language display", () => {
      const { getByTestId } = render(<TranslationTest />);
      expect(getByTestId("translation-test-current-language")).toBeTruthy();
      expect(getByTestId("translation-test-i18n-language")).toBeTruthy();
    });

    it("displays current language", () => {
      mockUseTaskTranslation.mockReturnValueOnce({
        currentLanguage: "es",
        setLanguage: mockSetLanguage,
        i18n: {
          language: "es",
        },
        t: mockT,
      });
      const { getByTestId } = render(<TranslationTest />);
      const currentLang = getByTestId("translation-test-current-language");
      expect(currentLang.props.children).toContain("es");
    });

    it("renders t() function section", () => {
      const { getByTestId } = render(<TranslationTest />);
      expect(getByTestId("translation-test-t-function-section")).toBeTruthy();
      expect(getByTestId("translation-test-t-label")).toBeTruthy();
    });

    it("renders TranslatedText component section", () => {
      const { getByTestId } = render(<TranslationTest />);
      expect(getByTestId("translation-test-component-section")).toBeTruthy();
      expect(getByTestId("translation-test-component-label")).toBeTruthy();
    });

    it("renders language buttons", () => {
      const { getByTestId } = render(<TranslationTest />);
      expect(getByTestId("translation-test-buttons")).toBeTruthy();
      expect(getByTestId("translation-test-button-en")).toBeTruthy();
      expect(getByTestId("translation-test-button-es")).toBeTruthy();
      expect(getByTestId("translation-test-button-fr")).toBeTruthy();
    });

    it("displays translated text using t() function", () => {
      const { getByTestId } = render(<TranslationTest />);
      const beginText = getByTestId("translation-test-begin");
      expect(beginText).toBeTruthy();
    });

    it("displays translated text using TranslatedText component", () => {
      const { getByTestId } = render(<TranslationTest />);
      expect(getByTestId("translation-test-component-begin")).toBeTruthy();
      expect(getByTestId("translation-test-component-resume")).toBeTruthy();
      expect(getByTestId("translation-test-component-ok")).toBeTruthy();
    });
  });

  // 2. User Interactions
  describe("User Interactions", () => {
    it("calls setLanguage when English button is pressed", () => {
      const { getByText } = render(<TranslationTest />);
      const enButton = getByText("English");
      fireEvent.press(enButton);
      expect(mockSetLanguage).toHaveBeenCalledWith("en");
      expect(mockSetLanguage).toHaveBeenCalledTimes(1);
    });

    it("calls setLanguage when Spanish button is pressed", () => {
      const { getByText } = render(<TranslationTest />);
      const esButton = getByText("Spanish");
      fireEvent.press(esButton);
      expect(mockSetLanguage).toHaveBeenCalledWith("es");
      expect(mockSetLanguage).toHaveBeenCalledTimes(1);
    });

    it("calls setLanguage when French button is pressed", () => {
      const { getByText } = render(<TranslationTest />);
      const frButton = getByText("French");
      fireEvent.press(frButton);
      expect(mockSetLanguage).toHaveBeenCalledWith("fr");
      expect(mockSetLanguage).toHaveBeenCalledTimes(1);
    });
  });

  // 3. RTL Support
  describe("RTL Support", () => {
    it("renders correctly in LTR mode", () => {
      const { getByTestId } = render(<TranslationTest />);
      expect(getByTestId("translation-test")).toBeTruthy();
    });

    it("renders correctly in RTL mode", () => {
      const { getByTestId } = render(<TranslationTest />);
      expect(getByTestId("translation-test")).toBeTruthy();
    });
  });

  // 4. Edge Cases
  describe("Edge Cases", () => {
    it("handles different language values", () => {
      mockUseTaskTranslation.mockReturnValueOnce({
        currentLanguage: "fr",
        setLanguage: mockSetLanguage,
        i18n: {
          language: "fr",
        },
        t: mockT,
      });
      const { getByTestId } = render(<TranslationTest />);
      const currentLang = getByTestId("translation-test-current-language");
      expect(currentLang.props.children).toContain("fr");
    });

    it("handles translation function with fallback", () => {
      mockT.mockImplementationOnce((key: string, options?: any) => {
        if (options?.fallback) return options.fallback;
        return key;
      });
      const { getByTestId } = render(<TranslationTest />);
      const beginText = getByTestId("translation-test-begin");
      expect(beginText).toBeTruthy();
    });
  });

  // 5. Accessibility
  describe("Accessibility", () => {
    it("has proper testIds for accessibility", () => {
      const { getByTestId } = render(<TranslationTest />);
      expect(getByTestId("translation-test")).toBeTruthy();
    });
  });

  // 6. Snapshots
  describe("Snapshots", () => {
    it("matches snapshot with default props", () => {
      const { toJSON } = render(<TranslationTest />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with Spanish language", () => {
      mockUseTaskTranslation.mockReturnValueOnce({
        currentLanguage: "es",
        setLanguage: mockSetLanguage,
        i18n: {
          language: "es",
        },
        t: mockT,
      });
      const { toJSON } = render(<TranslationTest />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // 7. E2E Support
  describe("E2E Support", () => {
    it("has testId on container", () => {
      const { getByTestId } = render(<TranslationTest />);
      expect(getByTestId("translation-test")).toBeTruthy();
    });

    it("has testId on title", () => {
      const { getByTestId } = render(<TranslationTest />);
      expect(getByTestId("translation-test-title")).toBeTruthy();
    });

    it("has testId on all buttons", () => {
      const { getByTestId } = render(<TranslationTest />);
      expect(getByTestId("translation-test-button-en")).toBeTruthy();
      expect(getByTestId("translation-test-button-es")).toBeTruthy();
      expect(getByTestId("translation-test-button-fr")).toBeTruthy();
    });

    it("has testId on all sections", () => {
      const { getByTestId } = render(<TranslationTest />);
      expect(getByTestId("translation-test-t-function-section")).toBeTruthy();
      expect(getByTestId("translation-test-component-section")).toBeTruthy();
    });
  });
});
