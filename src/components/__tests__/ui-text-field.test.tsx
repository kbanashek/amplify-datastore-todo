import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

import { TextField } from "@/components/ui/TextField";

describe("UI/TextField", () => {
  it("renders label", () => {
    const { getByText } = render(<TextField testID="tf" label="Email" />);
    expect(getByText("Email")).toBeTruthy();
  });

  it("calls onChangeText", () => {
    const onChangeText = jest.fn();
    const { getByTestId } = render(
      <TextField testID="tf" onChangeText={onChangeText} />
    );

    fireEvent.changeText(getByTestId("tf-input"), "hello");
    expect(onChangeText).toHaveBeenCalledWith("hello");
  });

  it("renders helperText when provided", () => {
    const { getByText } = render(
      <TextField testID="tf" helperText="Required" />
    );
    expect(getByText("Required")).toBeTruthy();
  });

  it("renders errorText and prefers it over helperText", () => {
    const { getByText, queryByText } = render(
      <TextField testID="tf" helperText="Required" errorText="Invalid" />
    );
    expect(getByText("Invalid")).toBeTruthy();
    expect(queryByText("Required")).toBeNull();
  });
});
