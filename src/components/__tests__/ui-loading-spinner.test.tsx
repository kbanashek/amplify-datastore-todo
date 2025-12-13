import React from "react";
import { render } from "@testing-library/react-native";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

describe("UI/LoadingSpinner", () => {
  it("renders ActivityIndicator", () => {
    const { getByTestId } = render(<LoadingSpinner testID="spin" />);
    expect(getByTestId("spin-indicator")).toBeTruthy();
  });
});
