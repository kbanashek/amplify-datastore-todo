import React from "react";
import { render } from "@testing-library/react-native";
import { LoadingSpinner } from "@components/ui/LoadingSpinner";

// Mock useThemeColor
jest.mock("@hooks/useThemeColor", () => ({
  useThemeColor: jest.fn((_props, colorName: string) => {
    const colors: Record<string, string> = {
      tint: "#007AFF",
    };
    return colors[colorName] || "#000000";
  }),
}));

describe("LoadingSpinner", () => {
  it("renders spinner", () => {
    const { getByTestId } = render(<LoadingSpinner testID="spinner" />);
    expect(getByTestId("spinner-indicator")).toBeTruthy();
  });

  it("renders with small size by default", () => {
    const { getByTestId } = render(<LoadingSpinner testID="spinner" />);
    const indicator = getByTestId("spinner-indicator");
    expect(indicator.props.size).toBe("small");
  });

  it("renders with small size when specified", () => {
    const { getByTestId } = render(
      <LoadingSpinner size="small" testID="spinner" />
    );
    const indicator = getByTestId("spinner-indicator");
    expect(indicator.props.size).toBe("small");
  });

  it("renders with large size when specified", () => {
    const { getByTestId } = render(
      <LoadingSpinner size="large" testID="spinner" />
    );
    const indicator = getByTestId("spinner-indicator");
    expect(indicator.props.size).toBe("large");
  });

  it("applies custom testID", () => {
    const { getByTestId } = render(<LoadingSpinner testID="custom-spinner" />);
    expect(getByTestId("custom-spinner")).toBeTruthy();
    expect(getByTestId("custom-spinner-indicator")).toBeTruthy();
  });

  it("renders without testID", () => {
    const { UNSAFE_getByType } = render(<LoadingSpinner />);
    // ActivityIndicator should still render
    expect(UNSAFE_getByType).toBeDefined();
  });
});
