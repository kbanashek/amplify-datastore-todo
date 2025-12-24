import React from "react";
import { Text } from "react-native";
import { fireEvent, render } from "@testing-library/react-native";

import { Button } from "@orion/task-system";

describe("UI/Button", () => {
  it("renders label", () => {
    const { getByText } = render(<Button label="Save" onPress={() => {}} />);
    expect(getByText("Save")).toBeTruthy();
  });

  it("calls onPress when pressed", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Button testID="btn" label="Save" onPress={onPress} />
    );
    fireEvent.press(getByTestId("btn"));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("does not call onPress when disabled", () => {
    const onPress = jest.fn();
    const { getByTestId } = render(
      <Button testID="btn" label="Save" onPress={onPress} disabled />
    );
    fireEvent.press(getByTestId("btn"));
    expect(onPress).not.toHaveBeenCalled();
  });

  it("renders spinner when loading", () => {
    const { getByTestId, queryByText } = render(
      <Button testID="btn" label="Save" loading onPress={() => {}} />
    );
    expect(getByTestId("btn-spinner")).toBeTruthy();
    expect(queryByText("Save")).toBeNull();
  });

  it("renders children when provided", () => {
    const { getByText } = render(
      <Button onPress={() => {}} testID="btn">
        <Text>Custom</Text>
      </Button>
    );
    expect(getByText("Custom")).toBeTruthy();
  });
});
