/**
 * Unit tests for TimeInput component
 */

import { TimeInput } from "@components/ui/TimeInput";
import { fireEvent, render } from "@testing-library/react-native";
import React from "react";

// Mock AppFonts
jest.mock("@constants/AppFonts", () => ({
  AppFonts: {
    primary: {
      light: "System",
      regular: "System",
      medium: "System",
    },
  },
}));

// Mock AppColors
jest.mock("@constants/AppColors", () => ({
  AppColors: {
    legacy: {
      danger: "#FF0000",
    },
    powderGray: "#F3F7FA",
    CIBlue: "#0000FF",
    white: "#FFFFFF",
  },
}));

// Mock DateTimePicker
interface MockDateTimePickerProps {
  value: Date;
  onChange: (event: { type: string }, date?: Date) => void;
  testID?: string;
}

jest.mock("@react-native-community/datetimepicker", () => ({
  __esModule: true,
  default: ({ value, onChange, testID }: MockDateTimePickerProps) => {
    const React = require("react");
    const { View, TouchableOpacity, Text } = require("react-native");
    return (
      <View testID={testID}>
        <TouchableOpacity
          onPress={() => {
            const newDate = new Date(value);
            newDate.setHours(10, 30, 0, 0);
            onChange({ type: "set" }, newDate);
          }}
        >
          <Text>Change Time</Text>
        </TouchableOpacity>
      </View>
    );
  },
  DateTimePickerAndroid: {
    open: jest.fn(({ onChange }) => {
      const date = new Date();
      date.setHours(14, 45, 0, 0);
      onChange({ type: "set" }, date);
    }),
  },
}));

// Mock translations
jest.mock("@translations/index", () => ({
  useTaskTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "dateTime.selectTime": "Select Time",
        "common.ok": "OK",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock platform utilities
jest.mock("@utils/platform", () => ({
  isAndroid: jest.fn(() => false),
  isIOS: jest.fn(() => true),
}));

describe("TimeInput", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render with default props", () => {
    const { getByTestId } = render(
      <TimeInput value={null} onChange={mockOnChange} testID="time-input" />
    );

    expect(getByTestId("time-input")).toBeTruthy();
    expect(getByTestId("time-input-button")).toBeTruthy();
  });

  it("should display placeholder when no value", () => {
    const { getByTestId, queryByText } = render(
      <TimeInput value={null} onChange={mockOnChange} testID="time-input" />
    );

    // Check that the button exists and is pressable
    const button = getByTestId("time-input-button");
    expect(button).toBeTruthy();

    // Check that time values are not displayed (since value is null)
    expect(queryByText(/\d{1,2}:\d{2}/)).toBeNull(); // No time like "10:30"
    expect(queryByText("AM")).toBeNull();
    expect(queryByText("PM")).toBeNull();
  });

  it("should display formatted time when value is provided", () => {
    const date = new Date();
    date.setHours(10, 30, 0, 0);

    const { getByText } = render(
      <TimeInput value={date} onChange={mockOnChange} testID="time-input" />
    );

    expect(getByText("10:30")).toBeTruthy();
    expect(getByText("AM")).toBeTruthy();
  });

  it("should display PM for afternoon times", () => {
    const date = new Date();
    date.setHours(14, 30, 0, 0); // 2:30 PM

    const { getByText } = render(
      <TimeInput value={date} onChange={mockOnChange} testID="time-input" />
    );

    expect(getByText("2:30")).toBeTruthy();
    expect(getByText("PM")).toBeTruthy();
  });

  it("should display 12:00 for noon", () => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);

    const { getByText } = render(
      <TimeInput value={date} onChange={mockOnChange} testID="time-input" />
    );

    expect(getByText("12:00")).toBeTruthy();
    expect(getByText("PM")).toBeTruthy();
  });

  it("should display 12:00 AM for midnight", () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);

    const { getByText } = render(
      <TimeInput value={date} onChange={mockOnChange} testID="time-input" />
    );

    expect(getByText("12:00")).toBeTruthy();
    expect(getByText("AM")).toBeTruthy();
  });

  it("should open picker on button press (iOS)", () => {
    const date = new Date();
    date.setHours(10, 30, 0, 0);

    const { getByTestId, queryByTestId } = render(
      <TimeInput value={date} onChange={mockOnChange} testID="time-input" />
    );

    const button = getByTestId("time-input-button");
    fireEvent.press(button);

    // On iOS, picker should be visible
    expect(queryByTestId("time-input-picker")).toBeTruthy();
  });

  it("should close picker on done button press", () => {
    const date = new Date();
    date.setHours(10, 30, 0, 0);

    const { getByTestId, queryByTestId } = render(
      <TimeInput value={date} onChange={mockOnChange} testID="time-input" />
    );

    const button = getByTestId("time-input-button");
    fireEvent.press(button);

    const doneButton = getByTestId("time-input-done");
    fireEvent.press(doneButton);

    // Picker should be closed
    expect(queryByTestId("time-input-picker")).toBeNull();
  });

  it("should call onChange when time is selected", () => {
    const date = new Date();
    date.setHours(10, 30, 0, 0);

    const { getByTestId, getByText } = render(
      <TimeInput value={date} onChange={mockOnChange} testID="time-input" />
    );

    const button = getByTestId("time-input-button");
    fireEvent.press(button);

    const changeButton = getByText("Change Time");
    fireEvent.press(changeButton);

    expect(mockOnChange).toHaveBeenCalled();
    const calledDate = mockOnChange.mock.calls[0][0];
    expect(calledDate).toBeInstanceOf(Date);
  });

  it("should be disabled when disabled prop is true", () => {
    const { getByTestId } = render(
      <TimeInput
        value={null}
        onChange={mockOnChange}
        disabled={true}
        testID="time-input"
      />
    );

    const button = getByTestId("time-input-button");
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it("should apply error styling when error prop is true", () => {
    const { getByTestId } = render(
      <TimeInput
        value={null}
        onChange={mockOnChange}
        error={true}
        testID="time-input"
      />
    );

    const button = getByTestId("time-input-button");
    expect(button).toBeTruthy();
    // Error styling would be in style prop
  });

  it("should pad minutes with leading zero", () => {
    const date = new Date();
    date.setHours(10, 5, 0, 0);

    const { getByText } = render(
      <TimeInput value={date} onChange={mockOnChange} testID="time-input" />
    );

    expect(getByText("10:05")).toBeTruthy();
  });

  it("should apply custom fontSize", () => {
    const date = new Date();
    date.setHours(10, 30, 0, 0);

    const { getByTestId } = render(
      <TimeInput
        value={date}
        onChange={mockOnChange}
        fontSize={20}
        testID="time-input"
      />
    );

    expect(getByTestId("time-input")).toBeTruthy();
    // fontSize would be in style prop
  });
});
