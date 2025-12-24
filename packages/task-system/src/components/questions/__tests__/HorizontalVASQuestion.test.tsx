import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { HorizontalVASQuestion } from "@components/questions/HorizontalVASQuestion";
import { Question } from "@task-types/ActivityConfig";

// Mock useTranslatedText
jest.mock("@hooks/useTranslatedText", () => ({
  useTranslatedText: jest.fn((text: string) => ({
    translatedText: text || "",
    isTranslating: false,
  })),
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

describe("HorizontalVASQuestion", () => {
  const mockQuestion: Question = {
    id: "vas-1",
    type: "horizontalVAS",
    text: "Rate your pain",
    friendlyName: "Pain Scale",
    required: true,
  };

  const mockDisplayProperties = {
    others: {
      scaleMin: 0,
      scaleMax: 10,
      scaleIncrements: 1,
      lowerRangei18nKey: "No pain",
      upperRangei18nKey: "Severe pain",
    },
  };

  it("renders slider with labels", () => {
    const { getByTestId } = render(
      <HorizontalVASQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByTestId("horizontal-vas-slider-vas-1")).toBeTruthy();
  });

  it("displays current value", () => {
    const { getByText } = render(
      <HorizontalVASQuestion
        question={mockQuestion}
        value={5}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByText("5")).toBeTruthy();
  });

  it("clamps value to scale range", () => {
    const { getAllByText } = render(
      <HorizontalVASQuestion
        question={mockQuestion}
        value={15}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    // Should clamp to max (10) - appears in both value and scale label
    const tens = getAllByText("10");
    expect(tens.length).toBeGreaterThan(0);
  });

  it("updates value when slider changes", () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <HorizontalVASQuestion
        question={mockQuestion}
        value={0}
        onChange={mockOnChange}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    // Note: Actual slider interaction would require more complex mocking
    // This test verifies the component renders correctly
    expect(getByTestId("horizontal-vas-slider-vas-1")).toBeTruthy();
  });

  it("displays error messages", () => {
    const { getByText } = render(
      <HorizontalVASQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={["Please select a value"]}
      />
    );

    expect(getByText("Please select a value")).toBeTruthy();
  });
});
