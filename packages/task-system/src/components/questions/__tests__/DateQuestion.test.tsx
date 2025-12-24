import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { DateQuestion } from "@components/questions/DateQuestion";
import { Question } from "@task-types/ActivityConfig";

// Mock DateTimeField
jest.mock("@components/ui/DateTimeField", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return {
    DateTimeField: ({ mode, value, onChange, format, error, testID }: any) => (
      <View testID={testID}>
        <Text>{mode}</Text>
        <Text>{value ? value.toISOString() : "No date"}</Text>
        <TouchableOpacity
          onPress={() => {
            if (onChange) {
              onChange(new Date("2024-01-15"));
            }
          }}
        >
          <Text>Select Date</Text>
        </TouchableOpacity>
        {error && <Text>Error</Text>}
      </View>
    ),
  };
});

describe("DateQuestion", () => {
  const mockQuestion: Question = {
    id: "date-1",
    type: "date-field",
    text: "What is your date of birth?",
    friendlyName: "Date of Birth",
    required: true,
  };

  const mockDisplayProperties = {};

  it("renders date picker", () => {
    const { getByTestId } = render(
      <DateQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByTestId("date-question-date-1")).toBeTruthy();
  });

  it("parses string date value", () => {
    const { getByText } = render(
      <DateQuestion
        question={mockQuestion}
        value="2024-01-15T00:00:00.000Z"
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByText(/2024-01-15/)).toBeTruthy();
  });

  it("parses Date object value", () => {
    const date = new Date("2024-01-15");
    const { getByText } = render(
      <DateQuestion
        question={mockQuestion}
        value={date}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByText(/2024-01-15/)).toBeTruthy();
  });

  it("calls onChange when date is selected", () => {
    const mockOnChange = jest.fn();
    const { getByText } = render(
      <DateQuestion
        question={mockQuestion}
        value={null}
        onChange={mockOnChange}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    fireEvent.press(getByText("Select Date"));
    expect(mockOnChange).toHaveBeenCalled();
  });

  it("displays error state when errors are present", () => {
    const { getByText } = render(
      <DateQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={["Date is required"]}
      />
    );

    expect(getByText("Error")).toBeTruthy();
  });

  it("renders time mode for time questions", () => {
    const { getByText } = render(
      <DateQuestion
        question={{ ...mockQuestion, type: "time" }}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByText("time")).toBeTruthy();
  });

  it("renders datetime mode for date-time questions", () => {
    const { getByText } = render(
      <DateQuestion
        question={{ ...mockQuestion, type: "date-time-field" }}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByText("datetime")).toBeTruthy();
  });
});
