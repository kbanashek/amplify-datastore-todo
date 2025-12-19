import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { WeightHeightQuestion } from "../WeightHeightQuestion";
import { Question } from "../../../types/ActivityConfig";

// Mock useTranslatedText
jest.mock("../../../hooks/useTranslatedText", () => ({
  useTranslatedText: jest.fn((text: string) => ({
    translatedText: text,
    isTranslating: false,
  })),
}));

describe("WeightHeightQuestion", () => {
  const mockQuestion: Question = {
    id: "weight-1",
    type: "weight",
    text: "What is your weight?",
    friendlyName: "Weight",
    required: true,
  };

  const mockDisplayProperties = {
    others: {
      fieldType: "weight",
      unitType: "both",
      fieldDisplayStyle: "line",
    },
  };

  it("renders weight input field", () => {
    const { getByTestId } = render(
      <WeightHeightQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByTestId("weight-height-main-weight-1")).toBeTruthy();
  });

  it("parses and displays existing value", () => {
    const { getByTestId } = render(
      <WeightHeightQuestion
        question={mockQuestion}
        value="70 kg"
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const input = getByTestId("weight-height-main-weight-1");
    expect(input.props.value).toBe("70");
  });

  it("shows both unit buttons when unitType is 'both'", () => {
    const { getByTestId } = render(
      <WeightHeightQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByTestId("weight-height-unit-0-weight-1")).toBeTruthy();
    expect(getByTestId("weight-height-unit-1-weight-1")).toBeTruthy();
  });

  it("renders compound inputs when compoundUnitType is set", () => {
    const { getByTestId } = render(
      <WeightHeightQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={{
          others: {
            fieldType: "weight",
            compoundUnitType: "weight-height",
            fieldDisplayStyle: "line",
          },
        }}
        errors={[]}
      />
    );

    expect(getByTestId("weight-height-main-weight-1")).toBeTruthy();
    expect(getByTestId("weight-height-secondary-weight-1")).toBeTruthy();
  });

  it("updates answer when value changes", () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <WeightHeightQuestion
        question={mockQuestion}
        value={null}
        onChange={mockOnChange}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const input = getByTestId("weight-height-main-weight-1");
    fireEvent.changeText(input, "70");

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("updates unit when unit button is pressed", () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <WeightHeightQuestion
        question={mockQuestion}
        value="70 kg"
        onChange={mockOnChange}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const lbButton = getByTestId("weight-height-unit-1-weight-1");
    fireEvent.press(lbButton);

    expect(mockOnChange).toHaveBeenCalled();
  });

  it("displays error state when errors are present", () => {
    const { getByTestId } = render(
      <WeightHeightQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={["Weight is required"]}
      />
    );

    const input = getByTestId("weight-height-main-weight-1");
    expect(input.props.style).toContainEqual(
      expect.objectContaining({ borderColor: "#e74c3c" })
    );
  });
});
