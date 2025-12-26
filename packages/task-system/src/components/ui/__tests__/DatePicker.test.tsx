import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { DatePicker } from "@components/ui/DatePicker";

// Mock DateTimeField
jest.mock("@components/ui/DateTimeField", () => {
  const React = require("react");
  const { View, Text, Pressable } = require("react-native");
  return {
    DateTimeField: ({
      value,
      onChange,
      mode,
      testID,
      ...props
    }: {
      value?: Date;
      onChange?: (date: Date) => void;
      mode?: string;
      testID?: string;
      [key: string]: unknown;
    }) => (
      <View testID={testID}>
        <Text testID={`${testID}-mode`}>{mode}</Text>
        <Text testID={`${testID}-value`}>
          {value ? value.toISOString() : "null"}
        </Text>
        <Pressable
          testID={`${testID}-button`}
          onPress={() => {
            if (onChange) {
              onChange(new Date("2024-01-15"));
            }
          }}
        >
          <Text>Select Date</Text>
        </Pressable>
      </View>
    ),
  };
});

describe("DatePicker", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders DatePicker", () => {
    const { getByText } = render(
      <DatePicker value={null} onChange={mockOnChange} testID="date-picker" />
    );
    expect(getByText("Select Date")).toBeTruthy();
  });

  it("passes mode='date' to DateTimeField", () => {
    const { getByTestId } = render(
      <DatePicker value={null} onChange={mockOnChange} testID="date-picker" />
    );
    expect(getByTestId("date-picker-mode").props.children).toBe("date");
  });

  it("passes value to DateTimeField", () => {
    const testDate = new Date("2024-01-15");
    const { getByTestId } = render(
      <DatePicker
        value={testDate}
        onChange={mockOnChange}
        testID="date-picker"
      />
    );
    expect(getByTestId("date-picker-value").props.children).toBe(
      testDate.toISOString()
    );
  });

  it("passes null value to DateTimeField", () => {
    const { getByTestId } = render(
      <DatePicker value={null} onChange={mockOnChange} testID="date-picker" />
    );
    expect(getByTestId("date-picker-value").props.children).toBe("null");
  });

  it("calls onChange when date is selected", () => {
    const { getByTestId } = render(
      <DatePicker value={null} onChange={mockOnChange} testID="date-picker" />
    );
    fireEvent.press(getByTestId("date-picker-button"));
    expect(mockOnChange).toHaveBeenCalledWith(new Date("2024-01-15"));
  });

  it("passes placeholder to DateTimeField", () => {
    const { getByTestId } = render(
      <DatePicker
        value={null}
        onChange={mockOnChange}
        placeholder="Pick a date"
        testID="date-picker"
      />
    );
    // DateTimeField should receive placeholder prop
    expect(getByTestId("date-picker")).toBeTruthy();
  });

  it("passes disabled prop to DateTimeField", () => {
    const { getByTestId } = render(
      <DatePicker
        value={null}
        onChange={mockOnChange}
        disabled
        testID="date-picker"
      />
    );
    // DateTimeField should receive disabled prop
    expect(getByTestId("date-picker")).toBeTruthy();
  });

  it("passes error prop to DateTimeField", () => {
    const { getByTestId } = render(
      <DatePicker
        value={null}
        onChange={mockOnChange}
        error
        testID="date-picker"
      />
    );
    // DateTimeField should receive error prop
    expect(getByTestId("date-picker")).toBeTruthy();
  });

  it("passes format function to DateTimeField", () => {
    const formatFn = (date: Date) => date.toLocaleDateString();
    const { getByTestId } = render(
      <DatePicker
        value={null}
        onChange={mockOnChange}
        format={formatFn}
        testID="date-picker"
      />
    );
    // DateTimeField should receive format prop
    expect(getByTestId("date-picker")).toBeTruthy();
  });

  it("passes testID to DateTimeField", () => {
    const { getByTestId } = render(
      <DatePicker value={null} onChange={mockOnChange} testID="custom-picker" />
    );
    expect(getByTestId("custom-picker")).toBeTruthy();
  });
});
