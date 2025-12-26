import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TextField } from "@components/ui/TextField";

// Mock useThemeColor
jest.mock("@hooks/useThemeColor", () => ({
  useThemeColor: jest.fn((_props, colorName: string) => {
    const colors: Record<string, string> = {
      text: "#000000",
      background: "#FFFFFF",
      icon: "#8E8E93",
      tint: "#007AFF",
    };
    return colors[colorName] || "#000000";
  }),
}));

// Mock ThemedText
jest.mock("@components/ThemedText", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    ThemedText: ({
      children,
      style,
      ...props
    }: {
      children: React.ReactNode;
      style?: unknown;
      [key: string]: unknown;
    }) => (
      <Text style={style} {...props}>
        {children}
      </Text>
    ),
  };
});

describe("TextField", () => {
  const mockOnChangeText = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders text input", () => {
    const { getByTestId } = render(
      <TextField testID="text-field" onChangeText={mockOnChangeText} />
    );
    expect(getByTestId("text-field-input")).toBeTruthy();
  });

  it("renders with label", () => {
    const { getByText } = render(
      <TextField label="Username" onChangeText={mockOnChangeText} />
    );
    expect(getByText("Username")).toBeTruthy();
  });

  it("renders with placeholder", () => {
    const { getByPlaceholderText } = render(
      <TextField
        placeholder="Enter text"
        onChangeText={mockOnChangeText}
        testID="text-field"
      />
    );
    expect(getByPlaceholderText("Enter text")).toBeTruthy();
  });

  it("calls onChangeText when text changes", () => {
    const { getByTestId } = render(
      <TextField testID="text-field" onChangeText={mockOnChangeText} value="" />
    );
    const input = getByTestId("text-field-input");
    fireEvent.changeText(input, "New text");
    expect(mockOnChangeText).toHaveBeenCalledWith("New text");
  });

  it("displays helper text", () => {
    const { getByText } = render(
      <TextField
        helperText="This is helpful"
        onChangeText={mockOnChangeText}
        testID="text-field"
      />
    );
    expect(getByText("This is helpful")).toBeTruthy();
  });

  it("displays error text", () => {
    const { getByText } = render(
      <TextField
        errorText="This is an error"
        onChangeText={mockOnChangeText}
        testID="text-field"
      />
    );
    expect(getByText("This is an error")).toBeTruthy();
  });

  it("prioritizes error text over helper text", () => {
    const { getByText, queryByText } = render(
      <TextField
        helperText="Helper"
        errorText="Error"
        onChangeText={mockOnChangeText}
        testID="text-field"
      />
    );
    expect(getByText("Error")).toBeTruthy();
    expect(queryByText("Helper")).toBeNull();
  });

  it("renders as disabled when editable is false", () => {
    const { getByTestId } = render(
      <TextField
        testID="text-field"
        onChangeText={mockOnChangeText}
        editable={false}
      />
    );
    const input = getByTestId("text-field-input");
    expect(input.props.editable).toBe(false);
  });

  it("renders as enabled by default", () => {
    const { getByTestId } = render(
      <TextField testID="text-field" onChangeText={mockOnChangeText} />
    );
    const input = getByTestId("text-field-input");
    expect(input.props.editable).toBe(true);
  });

  it("applies custom testID", () => {
    const { getByTestId } = render(
      <TextField testID="custom-field" onChangeText={mockOnChangeText} />
    );
    expect(getByTestId("custom-field")).toBeTruthy();
    expect(getByTestId("custom-field-input")).toBeTruthy();
  });

  it("uses label as accessibilityLabel when not provided", () => {
    const { getByLabelText } = render(
      <TextField
        label="Email"
        onChangeText={mockOnChangeText}
        testID="text-field"
      />
    );
    expect(getByLabelText("Email")).toBeTruthy();
  });

  it("uses custom accessibilityLabel when provided", () => {
    const { getByLabelText } = render(
      <TextField
        label="Email"
        accessibilityLabel="Email Address"
        onChangeText={mockOnChangeText}
        testID="text-field"
      />
    );
    expect(getByLabelText("Email Address")).toBeTruthy();
  });

  it("passes through TextInput props", () => {
    const { getByTestId } = render(
      <TextField
        testID="text-field"
        onChangeText={mockOnChangeText}
        keyboardType="email-address"
        autoCapitalize="none"
      />
    );
    const input = getByTestId("text-field-input");
    expect(input.props.keyboardType).toBe("email-address");
    expect(input.props.autoCapitalize).toBe("none");
  });
});
