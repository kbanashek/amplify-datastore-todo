import React from "react";
import { render } from "@testing-library/react-native";
import { Card } from "@components/ui/Card";

// Mock useThemeColor
jest.mock("@hooks/useThemeColor", () => ({
  useThemeColor: jest.fn((_props, colorName: string) => {
    const colors: Record<string, string> = {
      icon: "#8E8E93",
      background: "#FFFFFF",
    };
    return colors[colorName] || "#000000";
  }),
}));

// Mock ThemedView
jest.mock("@components/ThemedView", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    ThemedView: ({ children, testID, style, ...props }: any) => (
      <View testID={testID} style={style} {...props}>
        {children}
      </View>
    ),
  };
});

describe("Card", () => {
  it("renders children", () => {
    const { Text } = require("react-native");
    const { getByText } = render(
      <Card>
        <Text>Card Content</Text>
      </Card>
    );
    expect(getByText("Card Content")).toBeTruthy();
  });

  it("renders multiple children", () => {
    const { Text } = require("react-native");
    const { getByText } = render(
      <Card>
        <Text>First</Text>
        <Text>Second</Text>
      </Card>
    );
    expect(getByText("First")).toBeTruthy();
    expect(getByText("Second")).toBeTruthy();
  });

  it("applies custom testID", () => {
    const { getByTestId } = render(
      <Card testID="custom-card">
        <button>Content</button>
      </Card>
    );
    expect(getByTestId("custom-card")).toBeTruthy();
  });

  it("applies custom styles", () => {
    const { Text } = require("react-native");
    const customStyle = { marginTop: 20 };
    const { getByTestId } = render(
      <Card testID="styled-card" style={customStyle}>
        <Text>Content</Text>
      </Card>
    );
    const card = getByTestId("styled-card");
    expect(card).toBeTruthy();
  });

  it("renders empty card", () => {
    const { getByTestId } = render(<Card testID="empty-card" />);
    expect(getByTestId("empty-card")).toBeTruthy();
  });
});

