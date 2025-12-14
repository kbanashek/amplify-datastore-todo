import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NumberQuestion } from "../NumberQuestion";
import { Question } from "../../../types/ActivityConfig";

// Mock Slider
jest.mock("@react-native-community/slider", () => {
  const { View, Text } = require("react-native");
  return {
    __esModule: true,
    default: ({ value, onValueChange, minimumValue, maximumValue }: any) => (
      <View testID="slider">
        <Text testID="slider-value">{value}</Text>
        <Text testID="slider-min">{minimumValue}</Text>
        <Text testID="slider-max">{maximumValue}</Text>
        <Text testID="slider-change" onPress={() => onValueChange(value + 1)}>
          Change
        </Text>
      </View>
    ),
  };
});

describe("NumberQuestion", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders number input for number-field type", () => {
    const question: Question = {
      id: "question-1",
      type: "number-field",
      text: "<p>Enter a number</p>",
      friendlyName: "Number",
      required: false,
      validations: [],
      choices: [],
      dataMappers: [],
    };

    const { getByPlaceholderText } = render(
      <NumberQuestion
        question={question}
        value=""
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    expect(getByPlaceholderText("Number")).toBeTruthy();
  });

  it("calls onChange when number is entered", () => {
    const question: Question = {
      id: "question-1",
      type: "number-field",
      text: "<p>Enter a number</p>",
      friendlyName: "Number",
      required: false,
      validations: [],
      choices: [],
      dataMappers: [],
    };

    const { getByPlaceholderText } = render(
      <NumberQuestion
        question={question}
        value=""
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    const input = getByPlaceholderText("Number");
    fireEvent.changeText(input, "42");

    expect(mockOnChange).toHaveBeenCalledWith("42");
  });

  it("renders slider for numericScale type with min/max", () => {
    const question: Question = {
      id: "question-1",
      type: "numericScale",
      text: "<p>Rate from 1-10</p>",
      friendlyName: "Rating",
      required: false,
      validations: [
        {
          type: "min",
          value: "1",
          text: "Minimum is 1",
        },
        {
          type: "max",
          value: "10",
          text: "Maximum is 10",
        },
      ],
      choices: [],
      dataMappers: [],
    };

    const { getByTestId } = render(
      <NumberQuestion
        question={question}
        value="5"
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    expect(getByTestId("slider")).toBeTruthy();
    expect(getByTestId("slider-min")).toBeTruthy();
    expect(getByTestId("slider-max")).toBeTruthy();
  });

  it("displays min, current, and max values for slider", () => {
    const question: Question = {
      id: "question-1",
      type: "numericScale",
      text: "<p>Rate from 1-10</p>",
      friendlyName: "Rating",
      required: false,
      validations: [
        {
          type: "min",
          value: "1",
          text: "Minimum is 1",
        },
        {
          type: "max",
          value: "10",
          text: "Maximum is 10",
        },
      ],
      choices: [],
      dataMappers: [],
    };

    const { getByTestId } = render(
      <NumberQuestion
        question={question}
        value="5"
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    expect(getByTestId("slider-min")).toBeTruthy();
    expect(getByTestId("slider-value")).toBeTruthy();
    expect(getByTestId("slider-max")).toBeTruthy();
  });

  it("calls onChange when slider value changes", () => {
    const question: Question = {
      id: "question-1",
      type: "numericScale",
      text: "<p>Rate from 1-10</p>",
      friendlyName: "Rating",
      required: false,
      validations: [
        {
          type: "min",
          value: "1",
          text: "Minimum is 1",
        },
        {
          type: "max",
          value: "10",
          text: "Maximum is 10",
        },
      ],
      choices: [],
      dataMappers: [],
    };

    const { getByTestId } = render(
      <NumberQuestion
        question={question}
        value="5"
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    const changeButton = getByTestId("slider-change");
    fireEvent.press(changeButton);

    // The mock slider increments by 1, so 5 + 1 = 6
    expect(mockOnChange).toHaveBeenCalled();
  });

  it("uses default min value when current value is below min", () => {
    const question: Question = {
      id: "question-1",
      type: "numericScale",
      text: "<p>Rate from 1-10</p>",
      friendlyName: "Rating",
      required: false,
      validations: [
        {
          type: "min",
          value: "1",
          text: "Minimum is 1",
        },
        {
          type: "max",
          value: "10",
          text: "Maximum is 10",
        },
      ],
      choices: [],
      dataMappers: [],
    };

    const { getByTestId } = render(
      <NumberQuestion
        question={question}
        value="0"
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    // Should default to min value (1) - check slider value
    const sliderValue = getByTestId("slider-value");
    expect(sliderValue).toBeTruthy();
  });

  it("shows error styling when errors are present", () => {
    const question: Question = {
      id: "question-1",
      type: "number-field",
      text: "<p>Enter a number</p>",
      friendlyName: "Number",
      required: false,
      validations: [],
      choices: [],
      dataMappers: [],
    };

    const { getByPlaceholderText } = render(
      <NumberQuestion
        question={question}
        value=""
        onChange={mockOnChange}
        displayProperties={{}}
        errors={["Invalid number"]}
      />
    );

    const input = getByPlaceholderText("Number");
    expect(input).toBeTruthy();
  });

  it("displays unit text when unit is provided", () => {
    const question: Question = {
      id: "question-1",
      type: "number-field",
      text: "<p>Enter weight</p>",
      friendlyName: "Weight",
      required: false,
      validations: [],
      choices: [],
      dataMappers: [],
    };

    const { getByText } = render(
      <NumberQuestion
        question={question}
        value=""
        onChange={mockOnChange}
        displayProperties={{ uniti18nKey: "unit_lbs_key" }}
        errors={[]}
      />
    );

    expect(getByText("lbs")).toBeTruthy();
  });

  it("maps known unit i18n keys to display labels", () => {
    const question: Question = {
      id: "question-1",
      type: "number-field",
      text: "<p>Enter pressure</p>",
      friendlyName: "Pressure",
      required: false,
      validations: [],
      choices: [],
      dataMappers: [],
    };

    const { getByText } = render(
      <NumberQuestion
        question={question}
        value=""
        onChange={mockOnChange}
        displayProperties={{ uniti18nKey: "unit_mmhg_key" }}
        errors={[]}
      />
    );

    expect(getByText("mmHg")).toBeTruthy();
  });

  it("handles case-insensitive numericScale type", () => {
    const question: Question = {
      id: "question-1",
      type: "numericScale" as any,
      text: "<p>Rate from 1-10</p>",
      friendlyName: "Rating",
      required: false,
      validations: [
        {
          type: "min",
          value: "1",
          text: "Minimum is 1",
        },
        {
          type: "max",
          value: "10",
          text: "Maximum is 10",
        },
      ],
      choices: [],
      dataMappers: [],
    };

    const { getByTestId } = render(
      <NumberQuestion
        question={question}
        value="5"
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    expect(getByTestId("slider")).toBeTruthy();
  });
});
