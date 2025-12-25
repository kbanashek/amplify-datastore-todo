import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { Button } from "@components/ui/Button";

// Mock useThemeColor
jest.mock("@hooks/useThemeColor", () => ({
  useThemeColor: jest.fn((_props, colorName: string) => {
    const colors: Record<string, string> = {
      tint: "#007AFF",
      background: "#FFFFFF",
      text: "#000000",
      icon: "#8E8E93",
    };
    return colors[colorName] || "#000000";
  }),
}));

describe("Button", () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders with label", () => {
    const { getByText } = render(<Button label="Click me" />);
    expect(getByText("Click me")).toBeTruthy();
  });

  it("renders with children", () => {
    const { Text } = require("react-native");
    const { getByText } = render(
      <Button>
        <Text>Custom Content</Text>
      </Button>
    );
    expect(getByText("Custom Content")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const { getByText } = render(
      <Button label="Click me" onPress={mockOnPress} />
    );
    fireEvent.press(getByText("Click me"));
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const { getByText } = render(
      <Button label="Click me" onPress={mockOnPress} disabled />
    );
    fireEvent.press(getByText("Click me"));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it("does not call onPress when loading", () => {
    const { getByTestId } = render(
      <Button label="Click me" onPress={mockOnPress} loading testID="loading-button" />
    );
    fireEvent.press(getByTestId("loading-button"));
    expect(mockOnPress).not.toHaveBeenCalled();
  });

  it("shows loading spinner when loading", () => {
    const { getByTestId, queryByText } = render(
      <Button label="Click me" loading testID="test-button" />
    );
    expect(getByTestId("test-button-spinner")).toBeTruthy();
    expect(queryByText("Click me")).toBeNull();
  });

  it("renders with primary variant by default", () => {
    const { getByText } = render(<Button label="Primary" />);
    expect(getByText("Primary")).toBeTruthy();
  });

  it("renders with secondary variant", () => {
    const { getByText } = render(<Button label="Secondary" variant="secondary" />);
    expect(getByText("Secondary")).toBeTruthy();
  });

  it("renders with outline variant", () => {
    const { getByText } = render(<Button label="Outline" variant="outline" />);
    expect(getByText("Outline")).toBeTruthy();
  });

  it("renders with ghost variant", () => {
    const { getByText } = render(<Button label="Ghost" variant="ghost" />);
    expect(getByText("Ghost")).toBeTruthy();
  });

  it("renders with small size", () => {
    const { getByText } = render(<Button label="Small" size="sm" />);
    expect(getByText("Small")).toBeTruthy();
  });

  it("renders with medium size by default", () => {
    const { getByText } = render(<Button label="Medium" />);
    expect(getByText("Medium")).toBeTruthy();
  });

  it("renders with large size", () => {
    const { getByText } = render(<Button label="Large" size="lg" />);
    expect(getByText("Large")).toBeTruthy();
  });

  it("renders with start adornment", () => {
    const { Text } = require("react-native");
    const { getByText } = render(
      <Button label="With Icon" startAdornment={<Text>Icon</Text>} />
    );
    expect(getByText("With Icon")).toBeTruthy();
    expect(getByText("Icon")).toBeTruthy();
  });

  it("renders with end adornment", () => {
    const { Text } = require("react-native");
    const { getByText } = render(
      <Button label="With Icon" endAdornment={<Text>Icon</Text>} />
    );
    expect(getByText("With Icon")).toBeTruthy();
    expect(getByText("Icon")).toBeTruthy();
  });

  it("applies custom testID", () => {
    const { getByTestId } = render(
      <Button label="Test" testID="custom-test-id" />
    );
    expect(getByTestId("custom-test-id")).toBeTruthy();
  });

  it("uses accessibilityLabel when provided", () => {
    const { getByLabelText } = render(
      <Button label="Button" accessibilityLabel="Custom Label" />
    );
    expect(getByLabelText("Custom Label")).toBeTruthy();
  });

  it("uses label as accessibilityLabel when accessibilityLabel not provided", () => {
    const { getByLabelText } = render(<Button label="Button Label" />);
    expect(getByLabelText("Button Label")).toBeTruthy();
  });
});

