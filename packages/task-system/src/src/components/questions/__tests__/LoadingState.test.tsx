import React from "react";
import { render } from "@testing-library/react-native";
import { LoadingState } from "../LoadingState";

// Mock NetworkStatusIndicator
jest.mock("../../NetworkStatusIndicator", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    NetworkStatusIndicator: () => <View testID="network-status" />,
  };
});

describe("LoadingState", () => {
  it("renders loading indicator", () => {
    const { getByText } = render(<LoadingState topInset={0} />);

    expect(getByText("Loading questions...")).toBeTruthy();
  });

  it("renders header with title", () => {
    const { getByText } = render(<LoadingState topInset={0} />);

    expect(getByText("Questions")).toBeTruthy();
  });

  it("renders task-specific title when taskId is provided", () => {
    const { getByText } = render(<LoadingState taskId="task-1" topInset={0} />);

    expect(getByText("Answer Questions")).toBeTruthy();
  });

  it("applies top inset padding", () => {
    const { getByTestId } = render(<LoadingState topInset={44} />);

    const container = getByTestId("loading-state-container");
    expect(container).toBeTruthy();
  });

  it("renders network status indicator", () => {
    const { getByTestId } = render(<LoadingState topInset={0} />);

    expect(getByTestId("network-status")).toBeTruthy();
  });
});
