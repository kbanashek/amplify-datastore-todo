import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TemperatureQuestion } from "@components/questions/TemperatureQuestion";
import { Question } from "@task-types/ActivityConfig";

// Mock useTranslatedText
jest.mock("@hooks/useTranslatedText", () => ({
  useTranslatedText: jest.fn((text: string) => ({
    translatedText: text,
    isTranslating: false,
  })),
}));

describe("TemperatureQuestion", () => {
  const mockQuestion: Question = {
    id: "temp-1",
    type: "temperature",
    text: "What is your temperature?",
    friendlyName: "Temperature",
    required: true,
  };

  const mockDisplayProperties = {
    others: {
      unitType: "both",
      fieldDisplayStyle: "line",
    },
  };

  it("renders temperature input field", () => {
    const { getByTestId } = render(
      <TemperatureQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByTestId("temperature-input-temp-1")).toBeTruthy();
  });

  it("parses and displays existing value", () => {
    const { getByTestId } = render(
      <TemperatureQuestion
        question={mockQuestion}
        value="37.5 celsius"
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const input = getByTestId("temperature-input-temp-1");
    expect(input.props.value).toBe("37.5");
  });

  it("shows both unit buttons when unitType is 'both'", () => {
    const { getByTestId } = render(
      <TemperatureQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByTestId("temperature-unit-celsius-temp-1")).toBeTruthy();
    expect(getByTestId("temperature-unit-fahrenheit-temp-1")).toBeTruthy();
  });

  it("shows single unit when unitType is not 'both'", () => {
    const { queryByTestId, getByText } = render(
      <TemperatureQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={{
          others: { unitType: "celsius", fieldDisplayStyle: "line" },
        }}
        errors={[]}
      />
    );

    expect(queryByTestId("temperature-unit-celsius-temp-1")).toBeNull();
    expect(getByText("°C")).toBeTruthy();
  });

  it("updates answer when temperature changes", () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <TemperatureQuestion
        question={mockQuestion}
        value={null}
        onChange={mockOnChange}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const input = getByTestId("temperature-input-temp-1");
    fireEvent.changeText(input, "375");

    // Should auto-format to "37.5"
    expect(input.props.value).toBe("37.5");
    expect(mockOnChange).toHaveBeenCalled();
  });

  it("updates unit when unit button is pressed", () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <TemperatureQuestion
        question={mockQuestion}
        value="37.5 celsius"
        onChange={mockOnChange}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const fahrenheitButton = getByTestId("temperature-unit-fahrenheit-temp-1");
    fireEvent.press(fahrenheitButton);

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.stringContaining("fahrenheit")
    );
  });

  it("displays error state when errors are present", () => {
    const { getByTestId } = render(
      <TemperatureQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={["Temperature is required"]}
      />
    );

    const input = getByTestId("temperature-input-temp-1");
    expect(input.props.style).toContainEqual(
      expect.objectContaining({ borderColor: "#e74c3c" })
    );
  });
});
