import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NumberQuestion } from "@components/questions/NumberQuestion";
import { Question } from "@task-types/ActivityConfig";
import { ValidationType } from "@task-types/activity-config-enums";
import { AppColors } from "@constants/AppColors";

// Mock useTranslatedText
jest.mock("@hooks/useTranslatedText", () => ({
  useTranslatedText: jest.fn((text: string) => ({
    translatedText: text,
    isTranslating: false,
  })),
}));

// Mock getUnitDisplayLabel
jest.mock("@utils/tasks/unitLabel", () => ({
  getUnitDisplayLabel: jest.fn((text: string) => text || ""),
}));

// Mock Slider component
jest.mock("@react-native-community/slider", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return React.forwardRef((props: any, _ref: any) => (
    <View testID={props.testID}>
      <Text>Slider</Text>
    </View>
  ));
});

describe("NumberQuestion", () => {
  const mockQuestion: Question = {
    id: "number-1",
    type: "number-field",
    text: "What is your weight?",
    friendlyName: "Weight",
    required: true,
  };

  const mockDisplayProperties = {};

  it("renders number input field", () => {
    const { getByPlaceholderText } = render(
      <NumberQuestion
        question={mockQuestion}
        value=""
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByPlaceholderText("Weight")).toBeTruthy();
  });

  it("displays existing value", () => {
    const { getByDisplayValue } = render(
      <NumberQuestion
        question={mockQuestion}
        value="70"
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByDisplayValue("70")).toBeTruthy();
  });

  it("calls onChange when value changes", () => {
    const mockOnChange = jest.fn();
    const { getByPlaceholderText } = render(
      <NumberQuestion
        question={mockQuestion}
        value=""
        onChange={mockOnChange}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const input = getByPlaceholderText("Weight");
    fireEvent.changeText(input, "70");

    expect(mockOnChange).toHaveBeenCalledWith("70");
  });

  it("renders slider for numeric scale", () => {
    const { getByText } = render(
      <NumberQuestion
        question={{
          ...mockQuestion,
          type: "numericScale",
          validations: [
            { type: ValidationType.MIN, value: "1" },
            { type: ValidationType.MAX, value: "10" },
          ],
        }}
        value="5"
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByText("Slider")).toBeTruthy();
  });

  it("displays unit text when provided", () => {
    const { getByText } = render(
      <NumberQuestion
        question={mockQuestion}
        value="70"
        onChange={() => {}}
        displayProperties={{ uniti18nKey: "kg" }}
        errors={[]}
      />
    );

    expect(getByText("kg")).toBeTruthy();
  });

  it("displays error state when errors are present", () => {
    const { getByPlaceholderText } = render(
      <NumberQuestion
        question={mockQuestion}
        value=""
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={["Weight is required"]}
      />
    );

    const input = getByPlaceholderText("Weight");
    expect(input.props.style).toContainEqual(
      expect.objectContaining({ borderColor: AppColors.errorRed })
    );
  });
});
