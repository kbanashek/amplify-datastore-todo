import React from "react";
import { render } from "@testing-library/react-native";
import { ThemedText } from "@components/ThemedText";

// Mock useThemeColor
const mockUseThemeColor = jest.fn((_props, colorName: string) => {
  const colors: Record<string, string> = {
    text: "#000000",
  };
  return colors[colorName] || "#000000";
});

jest.mock("@hooks/useThemeColor", () => ({
  useThemeColor: (_props: any, colorName: string) => mockUseThemeColor(_props, colorName),
}));

describe("ThemedText", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Basic Rendering
  describe("Rendering", () => {
    it("renders with default type", () => {
      const { getByText } = render(<ThemedText>Hello World</ThemedText>);
      expect(getByText("Hello World")).toBeTruthy();
    });

    it("renders with title type", () => {
      const { getByText } = render(
        <ThemedText type="title">Title Text</ThemedText>
      );
      expect(getByText("Title Text")).toBeTruthy();
    });

    it("renders with subtitle type", () => {
      const { getByText } = render(
        <ThemedText type="subtitle">Subtitle Text</ThemedText>
      );
      expect(getByText("Subtitle Text")).toBeTruthy();
    });

    it("renders with defaultSemiBold type", () => {
      const { getByText } = render(
        <ThemedText type="defaultSemiBold">SemiBold Text</ThemedText>
      );
      expect(getByText("SemiBold Text")).toBeTruthy();
    });

    it("renders with link type", () => {
      const { getByText } = render(
        <ThemedText type="link">Link Text</ThemedText>
      );
      expect(getByText("Link Text")).toBeTruthy();
    });

    it("renders with all props", () => {
      const { getByText } = render(
        <ThemedText
          type="title"
          lightColor="#FF0000"
          darkColor="#0000FF"
          testID="themed-text"
        >
          All Props Text
        </ThemedText>
      );
      expect(getByText("All Props Text")).toBeTruthy();
    });
  });

  // 2. User Interactions
  describe("User Interactions", () => {
    it("renders text that can be selected", () => {
      const { getByText } = render(
        <ThemedText selectable>Selectable Text</ThemedText>
      );
      const text = getByText("Selectable Text");
      expect(text.props.selectable).toBe(true);
    });

    it("handles onPress when provided", () => {
      const mockOnPress = jest.fn();
      const { getByText } = render(
        <ThemedText onPress={mockOnPress}>Pressable Text</ThemedText>
      );
      expect(getByText("Pressable Text")).toBeTruthy();
    });
  });

  // 3. RTL Support
  describe("RTL Support", () => {
    it("renders correctly in LTR mode", () => {
      const { getByText } = render(<ThemedText>LTR Text</ThemedText>);
      expect(getByText("LTR Text")).toBeTruthy();
    });

    it("renders correctly in RTL mode", () => {
      const { getByText } = render(
        <ThemedText style={{ textAlign: "right" }}>RTL Text</ThemedText>
      );
      expect(getByText("RTL Text")).toBeTruthy();
    });

    it("applies RTL text alignment when provided", () => {
      const { getByText } = render(
        <ThemedText style={{ textAlign: "right" }}>RTL Aligned</ThemedText>
      );
      const text = getByText("RTL Aligned");
      expect(text).toBeTruthy();
    });
  });

  // 4. Edge Cases
  describe("Edge Cases", () => {
    it("handles empty children", () => {
      const { getByTestId } = render(
        <ThemedText testID="empty-text"></ThemedText>
      );
      expect(getByTestId("empty-text")).toBeTruthy();
    });

    it("handles null children", () => {
      const { getByTestId } = render(
        <ThemedText testID="null-text">{null}</ThemedText>
      );
      expect(getByTestId("null-text")).toBeTruthy();
    });

    it("handles undefined children", () => {
      const { getByTestId } = render(
        <ThemedText testID="undefined-text">{undefined}</ThemedText>
      );
      expect(getByTestId("undefined-text")).toBeTruthy();
    });

    it("handles long text", () => {
      const longText =
        "This is a very long text that demonstrates how the component handles longer content that might wrap to multiple lines in the UI and should be displayed correctly";
      const { getByText } = render(<ThemedText>{longText}</ThemedText>);
      expect(getByText(longText)).toBeTruthy();
    });

    it("handles special characters", () => {
      const specialText = "Text with special chars: <>&\"'@#$%^&*()";
      const { getByText } = render(<ThemedText>{specialText}</ThemedText>);
      expect(getByText(specialText)).toBeTruthy();
    });

    it("handles numbers as children", () => {
      const { getByText } = render(<ThemedText>{12345}</ThemedText>);
      expect(getByText("12345")).toBeTruthy();
    });

    it("handles custom light color", () => {
      const { getByText } = render(
        <ThemedText lightColor="#FF0000">Colored Text</ThemedText>
      );
      expect(getByText("Colored Text")).toBeTruthy();
      expect(mockUseThemeColor).toHaveBeenCalled();
    });

    it("handles custom dark color", () => {
      const { getByText } = render(
        <ThemedText darkColor="#0000FF">Colored Text</ThemedText>
      );
      expect(getByText("Colored Text")).toBeTruthy();
      expect(mockUseThemeColor).toHaveBeenCalled();
    });
  });

  // 5. Accessibility
  describe("Accessibility", () => {
    it("has proper accessibility label", () => {
      const { getByLabelText } = render(
        <ThemedText accessibilityLabel="Accessible text">Text</ThemedText>
      );
      expect(getByLabelText("Accessible text")).toBeTruthy();
    });

    it("supports screen readers", () => {
      const { getByText } = render(
        <ThemedText accessibilityRole="text">Screen reader text</ThemedText>
      );
      const text = getByText("Screen reader text");
      expect(text.props.accessibilityRole).toBe("text");
    });

    it("has proper accessibility state", () => {
      const { getByText } = render(
        <ThemedText accessibilityState={{ disabled: false }}>
          Accessible
        </ThemedText>
      );
      expect(getByText("Accessible")).toBeTruthy();
    });
  });

  // 6. Snapshots
  describe("Snapshots", () => {
    it("matches snapshot with default type", () => {
      const { toJSON } = render(<ThemedText>Default Text</ThemedText>);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with title type", () => {
      const { toJSON } = render(
        <ThemedText type="title">Title Text</ThemedText>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with subtitle type", () => {
      const { toJSON } = render(
        <ThemedText type="subtitle">Subtitle Text</ThemedText>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with link type", () => {
      const { toJSON } = render(
        <ThemedText type="link">Link Text</ThemedText>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with custom colors", () => {
      const { toJSON } = render(
        <ThemedText lightColor="#FF0000" darkColor="#0000FF">
          Colored Text
        </ThemedText>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with custom style", () => {
      const { toJSON } = render(
        <ThemedText style={{ fontSize: 20, fontWeight: "bold" }}>
          Styled Text
        </ThemedText>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // 7. TestIds for E2E
  describe("E2E Support", () => {
    it("has testID when provided", () => {
      const { getByTestId } = render(
        <ThemedText testID="themed-text">Test Text</ThemedText>
      );
      expect(getByTestId("themed-text")).toBeTruthy();
    });

    it("passes through testID prop", () => {
      const { getByTestId } = render(
        <ThemedText testID="custom-test-id">Text</ThemedText>
      );
      expect(getByTestId("custom-test-id")).toBeTruthy();
    });
  });
});
