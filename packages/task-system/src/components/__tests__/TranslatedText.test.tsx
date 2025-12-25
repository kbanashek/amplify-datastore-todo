import React from "react";
import { render } from "@testing-library/react-native";
import { TranslatedText } from "@components/TranslatedText";

// Mock useTaskTranslation
const mockT = jest.fn((key: string, options?: { fallback?: string }) => {
  return options?.fallback || key;
});

const mockUseTaskTranslation = jest.fn(() => ({
  t: mockT,
  isRTL: false,
  currentLanguage: "en",
  i18n: {
    language: "en",
    options: { debug: false },
  },
}));

jest.mock("@translations/index", () => ({
  useTaskTranslation: () => mockUseTaskTranslation(),
}));

// Mock TranslationMemoryService
const mockGetTranslationSync = jest.fn((text: string) => null as string | null);

jest.mock("@services/TranslationMemoryService", () => ({
  TranslationMemoryService: {
    getTranslationSync: mockGetTranslationSync,
  },
}));

// Mock logger
jest.mock("@utils/serviceLogger", () => ({
  getServiceLogger: jest.fn(() => ({
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
  })),
}));

describe("TranslatedText", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTaskTranslation.mockReturnValue({
      t: mockT,
      isRTL: false,
      currentLanguage: "en",
      i18n: {
        language: "en",
        options: { debug: false },
      },
    });
    mockGetTranslationSync.mockReturnValue(null);
  });

  // 1. Basic Rendering
  describe("Rendering", () => {
    it("renders text with required props", () => {
      const { getByText } = render(<TranslatedText text="Hello" />);
      expect(getByText("Hello")).toBeTruthy();
    });

    it("renders text with translation key", () => {
      const { getByText } = render(
        <TranslatedText text="BEGIN" translationKey="task.begin" />
      );
      expect(getByText("BEGIN")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("task.begin", { fallback: "BEGIN" });
    });

    it("renders text from TEXT_TO_KEY_MAP", () => {
      const { getByText } = render(<TranslatedText text="BEGIN" />);
      expect(getByText("BEGIN")).toBeTruthy();
      expect(mockT).toHaveBeenCalledWith("task.begin", { fallback: "BEGIN" });
    });

    it("renders text with sourceLanguage", () => {
      const { getByText } = render(
        <TranslatedText text="Hello" sourceLanguage="en" />
      );
      expect(getByText("Hello")).toBeTruthy();
    });

    it("renders text with custom style", () => {
      const customStyle = { fontSize: 20 };
      const { getByText } = render(
        <TranslatedText text="Hello" style={customStyle} />
      );
      expect(getByText("Hello")).toBeTruthy();
    });
  });

  // 2. User Interactions
  describe("User Interactions", () => {
    it("handles onPress when provided", () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <TranslatedText text="Pressable" onPress={mockOnPress} />
      );
      expect(getByText("Pressable")).toBeTruthy();
    });

    it("handles selectable text", () => {
      const { getByText } = render(
        <TranslatedText text="Selectable" selectable />
      );
      const text = getByText("Selectable");
      expect(text.props.selectable).toBe(true);
    });
  });

  // 3. RTL Support
  describe("RTL Support", () => {
    it("renders correctly in LTR mode", () => {
      mockUseTaskTranslation.mockReturnValueOnce({
        t: mockT,
        isRTL: false,
        currentLanguage: "en",
        i18n: {
          language: "en",
          options: { debug: false },
        },
      });

      const { getByText } = render(<TranslatedText text="LTR Text" />);
      expect(getByText("LTR Text")).toBeTruthy();
    });

    it("renders correctly in RTL mode", () => {
      mockUseTaskTranslation.mockReturnValueOnce({
        t: mockT,
        isRTL: true,
        currentLanguage: "ar",
        i18n: {
          language: "ar",
          options: { debug: false },
        },
      });

      const { getByText } = render(<TranslatedText text="RTL Text" />);
      const text = getByText("RTL Text");
      expect(text).toBeTruthy();
      const styles = Array.isArray(text.props.style)
        ? text.props.style
        : [text.props.style];
      expect(styles).toContainEqual(
        expect.objectContaining({ textAlign: "right" })
      );
    });

    it("applies RTL text alignment when isRTL is true", () => {
      mockUseTaskTranslation.mockReturnValueOnce({
        t: mockT,
        isRTL: true,
        currentLanguage: "ar",
        i18n: {
          language: "ar",
          options: { debug: false },
        },
      });

      const { getByText } = render(<TranslatedText text="Hello" />);
      const text = getByText("Hello");
      const styles = Array.isArray(text.props.style)
        ? text.props.style
        : [text.props.style];
      expect(styles).toContainEqual(
        expect.objectContaining({ textAlign: "right" })
      );
    });

    it("does not apply RTL alignment when isRTL is false", () => {
      mockUseTaskTranslation.mockReturnValueOnce({
        t: mockT,
        isRTL: false,
        currentLanguage: "en",
        i18n: {
          language: "en",
          options: { debug: false },
        },
      });

      const { getByText } = render(<TranslatedText text="Hello" />);
      const text = getByText("Hello");
      // Should not have textAlign: "right"
      const hasRTLStyle = text.props.style?.some(
        (s: any) => s?.textAlign === "right"
      );
      expect(hasRTLStyle).toBeFalsy();
    });
  });

  // 4. Edge Cases
  describe("Edge Cases", () => {
    it("handles empty text", () => {
      const { getByTestId } = render(
        <TranslatedText text="" testID="translated-text-default" />
      );
      expect(getByTestId("translated-text-default")).toBeTruthy();
    });

    it("handles long text", () => {
      const longText =
        "This is a very long text that should be handled properly by the component";
      const { getByText } = render(<TranslatedText text={longText} />);
      expect(getByText(longText)).toBeTruthy();
    });

    it("handles special characters", () => {
      const specialText = "Text with special chars: <>&\"'@#$%^&*()";
      const { getByText } = render(<TranslatedText text={specialText} />);
      expect(getByText(specialText)).toBeTruthy();
    });

    it("handles text not in TEXT_TO_KEY_MAP", () => {
      const { getByText } = render(<TranslatedText text="Unknown Text" />);
      expect(getByText("Unknown Text")).toBeTruthy();
    });

    it("uses translation memory when available", () => {
      mockGetTranslationSync.mockReturnValueOnce("Hola");

      mockUseTaskTranslation.mockReturnValueOnce({
        t: mockT,
        isRTL: false,
        currentLanguage: "es",
        i18n: {
          language: "es",
          options: { debug: false },
        },
      });

      const { getByText } = render(
        <TranslatedText text="Hello" sourceLanguage="en" />
      );
      expect(getByText("Hola")).toBeTruthy();
      expect(mockGetTranslationSync).toHaveBeenCalledWith("Hello", "en", "es");
    });

    it("falls back to original text when translation memory unavailable", () => {
      mockGetTranslationSync.mockReturnValueOnce(null);

      mockUseTaskTranslation.mockReturnValueOnce({
        t: mockT,
        isRTL: false,
        currentLanguage: "es",
        i18n: {
          language: "es",
          options: { debug: false },
        },
      });

      const { getByText } = render(
        <TranslatedText text="Hello" sourceLanguage="en" />
      );
      expect(getByText("Hello")).toBeTruthy();
    });

    it("handles English language (no translation needed)", () => {
      mockUseTaskTranslation.mockReturnValueOnce({
        t: mockT,
        isRTL: false,
        currentLanguage: "en",
        i18n: {
          language: "en",
          options: { debug: false },
        },
      });

      const { getByText } = render(
        <TranslatedText text="Dynamic Text" sourceLanguage="en" />
      );
      expect(getByText("Dynamic Text")).toBeTruthy();
      // Should not call translation memory for English
      expect(mockGetTranslationSync).not.toHaveBeenCalled();
    });
  });

  // 5. Accessibility
  describe("Accessibility", () => {
    it("has proper accessibility label", () => {
      const { getByLabelText } = render(
        <TranslatedText text="Hello" accessibilityLabel="Greeting" />
      );
      expect(getByLabelText("Greeting")).toBeTruthy();
    });

    it("supports screen readers", () => {
      const { getByText } = render(
        <TranslatedText text="Screen reader text" accessibilityRole="text" />
      );
      const text = getByText("Screen reader text");
      expect(text.props.accessibilityRole).toBe("text");
    });

    it("has proper accessibility state", () => {
      const { getByText } = render(
        <TranslatedText
          text="Accessible"
          accessibilityState={{ disabled: false }}
        />
      );
      expect(getByText("Accessible")).toBeTruthy();
    });
  });

  // 6. Snapshots
  describe("Snapshots", () => {
    it("matches snapshot with default text", () => {
      const { toJSON } = render(<TranslatedText text="Hello" />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with translation key", () => {
      const { toJSON } = render(
        <TranslatedText text="BEGIN" translationKey="task.begin" />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot in RTL mode", () => {
      mockUseTaskTranslation.mockReturnValueOnce({
        t: mockT,
        isRTL: true,
        currentLanguage: "ar",
        i18n: {
          language: "ar",
          options: { debug: false },
        },
      });

      const { toJSON } = render(<TranslatedText text="RTL Text" />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with custom style", () => {
      const { toJSON } = render(
        <TranslatedText text="Styled" style={{ fontSize: 20, color: "red" }} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with translation memory", () => {
      mockGetTranslationSync.mockReturnValueOnce("Hola");

      mockUseTaskTranslation.mockReturnValueOnce({
        t: mockT,
        isRTL: false,
        currentLanguage: "es",
        i18n: {
          language: "es",
          options: { debug: false },
        },
      });

      const { toJSON } = render(
        <TranslatedText text="Hello" sourceLanguage="en" />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // 7. TestIds for E2E
  describe("E2E Support", () => {
    it("has auto-generated testID", () => {
      const { getByTestId } = render(<TranslatedText text="Hello" />);
      expect(getByTestId("translated-text-Hello")).toBeTruthy();
    });

    it("uses custom testID when provided", () => {
      const { getByTestId } = render(
        <TranslatedText text="Hello" testID="custom-translated-text" />
      );
      expect(getByTestId("custom-translated-text")).toBeTruthy();
    });

    it("generates testID for empty text", () => {
      const { getByTestId } = render(<TranslatedText text="" />);
      expect(getByTestId("translated-text-default")).toBeTruthy();
    });

    it("generates testID for long text (truncated)", () => {
      const longText =
        "This is a very long text that will be truncated in testID";
      const { getByTestId } = render(<TranslatedText text={longText} />);
      // TestID should be truncated to first 20 chars
      expect(
        getByTestId(`translated-text-${longText.substring(0, 20)}`)
      ).toBeTruthy();
    });
  });
});
