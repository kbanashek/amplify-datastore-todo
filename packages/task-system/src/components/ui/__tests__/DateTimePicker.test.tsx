import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { DateTimePicker } from "@components/ui/DateTimePicker";

// Mock DateTimeField
jest.mock("@components/ui/DateTimeField", () => {
  const React = require("react");
  const { View, Text, Pressable } = require("react-native");
  return {
    DateTimeField: ({ value, onChange, mode, testID, ...props }: any) => (
      <View testID={testID}>
        <Text testID={`${testID}-mode`}>{mode}</Text>
        <Text testID={`${testID}-value`}>
          {value ? value.toISOString() : "null"}
        </Text>
        <Pressable
          testID={`${testID}-button`}
          onPress={() => {
            if (onChange) {
              onChange(new Date("2024-01-15T10:30:00"));
            }
          }}
        >
          <Text>Select Date/Time</Text>
        </Pressable>
      </View>
    ),
  };
});

describe("DateTimePicker", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders DateTimePicker", () => {
    const { getByText } = render(
      <DateTimePicker
        value={null}
        onChange={mockOnChange}
        testID="datetime-picker"
      />
    );
    expect(getByText("Select Date/Time")).toBeTruthy();
  });

  it("passes mode='datetime' to DateTimeField", () => {
    const { getByTestId } = render(
      <DateTimePicker
        value={null}
        onChange={mockOnChange}
        testID="datetime-picker"
      />
    );
    expect(getByTestId("datetime-picker-mode").props.children).toBe("datetime");
  });

  it("passes value to DateTimeField", () => {
    const testDate = new Date("2024-01-15T10:30:00");
    const { getByTestId } = render(
      <DateTimePicker
        value={testDate}
        onChange={mockOnChange}
        testID="datetime-picker"
      />
    );
    expect(getByTestId("datetime-picker-value").props.children).toBe(
      testDate.toISOString()
    );
  });

  it("passes null value to DateTimeField", () => {
    const { getByTestId } = render(
      <DateTimePicker
        value={null}
        onChange={mockOnChange}
        testID="datetime-picker"
      />
    );
    expect(getByTestId("datetime-picker-value").props.children).toBe("null");
  });

  it("calls onChange when date/time is selected", () => {
    const { getByTestId } = render(
      <DateTimePicker
        value={null}
        onChange={mockOnChange}
        testID="datetime-picker"
      />
    );
    fireEvent.press(getByTestId("datetime-picker-button"));
    expect(mockOnChange).toHaveBeenCalledWith(new Date("2024-01-15T10:30:00"));
  });

  it("passes all props to DateTimeField", () => {
    const formatFn = (date: Date) => date.toLocaleString();
    const { getByTestId } = render(
      <DateTimePicker
        value={null}
        onChange={mockOnChange}
        placeholder="Pick a date/time"
        format={formatFn}
        disabled
        error
        testID="custom-datetime-picker"
      />
    );
    expect(getByTestId("custom-datetime-picker")).toBeTruthy();
  });
});
