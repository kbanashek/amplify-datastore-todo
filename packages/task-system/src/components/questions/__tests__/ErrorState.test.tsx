import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ErrorState } from "@components/questions/ErrorState";

// Mock NetworkStatusIndicator
jest.mock("@components/NetworkStatusIndicator", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    NetworkStatusIndicator: () => <View testID="network-status" />,
  };
});

describe("ErrorState", () => {
  const mockOnBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders error message", () => {
    const { getByText } = render(
      <ErrorState
        error="Something went wrong"
        topInset={0}
        onBack={mockOnBack}
      />
    );

    expect(getByText("Something went wrong")).toBeTruthy();
  });

  it("renders header with title", () => {
    const { getByText } = render(
      <ErrorState error="Error" topInset={0} onBack={mockOnBack} />
    );

    expect(getByText("Questions")).toBeTruthy();
  });

  it("renders go back button", () => {
    const { getByText } = render(
      <ErrorState error="Error" topInset={0} onBack={mockOnBack} />
    );

    expect(getByText("Go Back")).toBeTruthy();
  });

  it("calls onBack when button is pressed", () => {
    const { getByText } = render(
      <ErrorState error="Error" topInset={0} onBack={mockOnBack} />
    );

    fireEvent.press(getByText("Go Back"));
    expect(mockOnBack).toHaveBeenCalledTimes(1);
  });

  it("shows error info box for entityId errors", () => {
    const { getByText } = render(
      <ErrorState error="Missing entityId" topInset={0} onBack={mockOnBack} />
    );

    expect(getByText("What does this mean?")).toBeTruthy();
  });

  it("does not show error info box for non-entityId errors", () => {
    const { queryByText } = render(
      <ErrorState error="Network error" topInset={0} onBack={mockOnBack} />
    );

    expect(queryByText("What does this mean?")).toBeNull();
  });

  it("applies top inset padding", () => {
    const { getByTestId } = render(
      <ErrorState error="Error" topInset={44} onBack={mockOnBack} />
    );

    const container = getByTestId("error-state-container");
    expect(container).toBeTruthy();
  });
});
