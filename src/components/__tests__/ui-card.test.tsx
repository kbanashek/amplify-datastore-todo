import React from "react";
import { Text } from "react-native";
import { render } from "@testing-library/react-native";

import { Card } from "@/components/ui/Card";

describe("UI/Card", () => {
  it("renders children", () => {
    const { getByText } = render(
      <Card>
        <Text>Inside</Text>
      </Card>
    );
    expect(getByText("Inside")).toBeTruthy();
  });

  it("supports testID", () => {
    const { getByTestId } = render(
      <Card testID="card">
        <Text>Inside</Text>
      </Card>
    );
    expect(getByTestId("card")).toBeTruthy();
  });
});
