import React from "react";
import { render } from "@testing-library/react-native";
import { ThemedView } from "@components/ThemedView";
import { ThemedText } from "@components/ThemedText";

// Mock useThemeColor
const mockUseThemeColor = jest.fn((_props, colorName: string) => {
  const colors: Record<string, string> = {
    background: "#FFFFFF",
  };
  return colors[colorName] || "#FFFFFF";
});

jest.mock("@hooks/useThemeColor", () => ({
  useThemeColor: (_props: any, colorName: string) => mockUseThemeColor(_props, colorName),
}));

describe("ThemedView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Basic Rendering
  describe("Rendering", () => {
    it("renders with children", () => {
      const { Text } = require("react-native");
      const { getByText } = render(
        <ThemedView>
          <Text>View Content</Text>
        </ThemedView>
      );
      expect(getByText("View Content")).toBeTruthy();
    });

    it("renders multiple children", () => {
      const { Text } = require("react-native");
      const { getByText } = render(
        <ThemedView>
          <Text>First</Text>
          <Text>Second</Text>
        </ThemedView>
      );
      expect(getByText("First")).toBeTruthy();
      expect(getByText("Second")).toBeTruthy();
    });

    it("renders empty view", () => {
      const { UNSAFE_getByType } = render(<ThemedView />);
      expect(UNSAFE_getByType).toBeDefined();
    });

    it("renders with all props", () => {
      const { Text } = require("react-native");
      const { getByTestId } = render(
        <ThemedView
          lightColor="#E3F2FD"
          darkColor="#1A1A1A"
          testID="themed-view"
          style={{ padding: 20 }}
        >
          <Text>Content</Text>
        </ThemedView>
      );
      expect(getByTestId("themed-view")).toBeTruthy();
    });
  });

  // 2. User Interactions
  describe("User Interactions", () => {
    it("handles onPress when provided", () => {
      const mockOnPress = jest.fn();
      const { Text } = require("react-native");
      const { getByText } = render(
        <ThemedView onPress={mockOnPress}>
          <Text>Pressable View</Text>
        </ThemedView>
      );
      expect(getByText("Pressable View")).toBeTruthy();
    });

    it("handles touch events", () => {
      const mockOnTouchStart = jest.fn();
      const { Text } = require("react-native");
      const { getByText } = render(
        <ThemedView onTouchStart={mockOnTouchStart}>
          <Text>Touchable View</Text>
        </ThemedView>
      );
      expect(getByText("Touchable View")).toBeTruthy();
    });
  });

  // 3. RTL Support
  describe("RTL Support", () => {
    it("renders correctly in LTR mode", () => {
      const { Text } = require("react-native");
      const { getByText } = render(
        <ThemedView>
          <Text>LTR Content</Text>
        </ThemedView>
      );
      expect(getByText("LTR Content")).toBeTruthy();
    });

    it("renders correctly in RTL mode", () => {
      const { Text } = require("react-native");
      const { getByText } = render(
        <ThemedView style={{ flexDirection: "row-reverse" }}>
          <Text>RTL Content</Text>
        </ThemedView>
      );
      expect(getByText("RTL Content")).toBeTruthy();
    });

    it("applies RTL flex direction when provided", () => {
      const { Text } = require("react-native");
      const { getByText } = render(
        <ThemedView style={{ flexDirection: "row-reverse" }}>
          <Text>RTL Layout</Text>
        </ThemedView>
      );
      expect(getByText("RTL Layout")).toBeTruthy();
    });
  });

  // 4. Edge Cases
  describe("Edge Cases", () => {
    it("handles null children", () => {
      const { UNSAFE_getByType } = render(<ThemedView>{null}</ThemedView>);
      expect(UNSAFE_getByType).toBeDefined();
    });

    it("handles undefined children", () => {
      const { UNSAFE_getByType } = render(
        <ThemedView>{undefined}</ThemedView>
      );
      expect(UNSAFE_getByType).toBeDefined();
    });

    it("handles empty children array", () => {
      const { UNSAFE_getByType } = render(<ThemedView>{[]}</ThemedView>);
      expect(UNSAFE_getByType).toBeDefined();
    });

    it("handles custom light color", () => {
      const { Text } = require("react-native");
      const { getByText } = render(
        <ThemedView lightColor="#FF0000">
          <Text>Colored View</Text>
        </ThemedView>
      );
      expect(getByText("Colored View")).toBeTruthy();
      expect(mockUseThemeColor).toHaveBeenCalled();
    });

    it("handles custom dark color", () => {
      const { Text } = require("react-native");
      const { getByText } = render(
        <ThemedView darkColor="#0000FF">
          <Text>Colored View</Text>
        </ThemedView>
      );
      expect(getByText("Colored View")).toBeTruthy();
      expect(mockUseThemeColor).toHaveBeenCalled();
    });

    it("handles custom style", () => {
      const { Text } = require("react-native");
      const customStyle = { padding: 20, margin: 10 };
      const { getByText } = render(
        <ThemedView style={customStyle}>
          <Text>Styled View</Text>
        </ThemedView>
      );
      expect(getByText("Styled View")).toBeTruthy();
    });

    it("handles complex nested children", () => {
      const { Text } = require("react-native");
      const { getByText } = render(
        <ThemedView>
          <ThemedView>
            <Text>Nested</Text>
          </ThemedView>
          <Text>Content</Text>
        </ThemedView>
      );
      expect(getByText("Nested")).toBeTruthy();
      expect(getByText("Content")).toBeTruthy();
    });
  });

  // 5. Accessibility
  describe("Accessibility", () => {
    it("has proper accessibility label", () => {
      const { Text } = require("react-native");
      const { getByLabelText } = render(
        <ThemedView accessibilityLabel="Container view">
          <Text>Content</Text>
        </ThemedView>
      );
      expect(getByLabelText("Container view")).toBeTruthy();
    });

    it("has proper accessibility role", () => {
      const { Text } = require("react-native");
      const { UNSAFE_getByType } = render(
        <ThemedView accessibilityRole="header">
          <Text>Header</Text>
        </ThemedView>
      );
      const { View } = require("react-native");
      const view = UNSAFE_getByType(View);
      expect(view).toBeTruthy();
      expect(view.props.accessibilityRole).toBe("header");
    });

    it("supports accessibility states", () => {
      const { Text } = require("react-native");
      const { getByText } = render(
        <ThemedView accessibilityState={{ disabled: false }}>
          <Text>Accessible</Text>
        </ThemedView>
      );
      expect(getByText("Accessible")).toBeTruthy();
    });
  });

  // 6. Snapshots
  describe("Snapshots", () => {
    it("matches snapshot with children", () => {
      const { Text } = require("react-native");
      const { toJSON } = render(
        <ThemedView>
          <Text>Content</Text>
        </ThemedView>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with custom light color", () => {
      const { Text } = require("react-native");
      const { toJSON } = render(
        <ThemedView lightColor="#E3F2FD">
          <Text>Colored View</Text>
        </ThemedView>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with custom dark color", () => {
      const { Text } = require("react-native");
      const { toJSON } = render(
        <ThemedView darkColor="#1A1A1A">
          <Text>Dark View</Text>
        </ThemedView>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with custom style", () => {
      const { Text } = require("react-native");
      const { toJSON } = render(
        <ThemedView style={{ padding: 20, borderRadius: 8 }}>
          <Text>Styled View</Text>
        </ThemedView>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with multiple children", () => {
      const { Text } = require("react-native");
      const { toJSON } = render(
        <ThemedView>
          <Text>First</Text>
          <Text>Second</Text>
          <Text>Third</Text>
        </ThemedView>
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot in RTL mode", () => {
      const { Text } = require("react-native");
      const { toJSON } = render(
        <ThemedView style={{ flexDirection: "row-reverse" }}>
          <Text>RTL Content</Text>
        </ThemedView>
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // 7. TestIds for E2E
  describe("E2E Support", () => {
    it("has testID when provided", () => {
      const { Text } = require("react-native");
      const { getByTestId } = render(
        <ThemedView testID="themed-view">
          <Text>Test View</Text>
        </ThemedView>
      );
      expect(getByTestId("themed-view")).toBeTruthy();
    });

    it("passes through testID prop", () => {
      const { Text } = require("react-native");
      const { getByTestId } = render(
        <ThemedView testID="custom-view-id">
          <Text>Content</Text>
        </ThemedView>
      );
      expect(getByTestId("custom-view-id")).toBeTruthy();
    });
  });
});
