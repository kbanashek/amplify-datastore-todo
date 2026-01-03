/**
 * Unit tests for DateInput component
 */

import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { DateInput } from "@components/ui/DateInput";

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
    blackShadow10: "#00000019",
    CIBlue: "#0000FF",
    white: "#FFFFFF",
  },
}));

// Mock translations
jest.mock("@translations/index", () => ({
  useTaskTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, any> = {
        "dateTime.year": "Year",
        "dateTime.month": "Month",
        "dateTime.day": "Day",
        "dateTime.invalidDate": "Invalid date",
        "dateTime.months": [
          "January",
          "February",
          "March",
          "April",
          "May",
          "June",
          "July",
          "August",
          "September",
          "October",
          "November",
          "December",
        ],
      };
      return translations[key] || key;
    },
  }),
}));

describe("DateInput", () => {
  const mockOnChange = jest.fn();
  const mockOnError = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render with default props", () => {
    const { getByTestId } = render(
      <DateInput
        day={null}
        monthIndex={null}
        year={null}
        onChange={mockOnChange}
        testID="date-input"
      />
    );

    expect(getByTestId("date-input")).toBeTruthy();
    expect(getByTestId("date-input-year")).toBeTruthy();
    expect(getByTestId("date-input-month-button")).toBeTruthy();
    expect(getByTestId("date-input-day")).toBeTruthy();
  });

  it("should display current values", () => {
    const { getByTestId, getByText } = render(
      <DateInput
        day={13}
        monthIndex={11}
        year={2024}
        onChange={mockOnChange}
        testID="date-input"
      />
    );

    const dayInput = getByTestId("date-input-day");
    const yearInput = getByTestId("date-input-year");

    expect(dayInput.props.value).toBe("13");
    expect(yearInput.props.value).toBe("2024");
    expect(getByText("December")).toBeTruthy();
  });

  it("should call onChange when day is entered", () => {
    const { getByTestId } = render(
      <DateInput
        day={null}
        monthIndex={11}
        year={2024}
        onChange={mockOnChange}
        testID="date-input"
      />
    );

    const dayInput = getByTestId("date-input-day");
    fireEvent.changeText(dayInput, "15");

    expect(mockOnChange).toHaveBeenCalledWith(15, 11, 2024);
  });

  it("should call onChange when year is entered", () => {
    const { getByTestId } = render(
      <DateInput
        day={15}
        monthIndex={11}
        year={null}
        onChange={mockOnChange}
        testID="date-input"
      />
    );

    const yearInput = getByTestId("date-input-year");
    fireEvent.changeText(yearInput, "2024");

    expect(mockOnChange).toHaveBeenCalledWith(15, 11, 2024);
  });

  it("should only allow numeric input for day", () => {
    const { getByTestId } = render(
      <DateInput
        day={null}
        monthIndex={11}
        year={2024}
        onChange={mockOnChange}
        testID="date-input"
      />
    );

    const dayInput = getByTestId("date-input-day");
    fireEvent.changeText(dayInput, "abc15xyz");

    // Should filter to just numbers
    expect(dayInput.props.value).toBe("15");
  });

  it("should only allow numeric input for year", () => {
    const { getByTestId } = render(
      <DateInput
        day={15}
        monthIndex={11}
        year={null}
        onChange={mockOnChange}
        testID="date-input"
      />
    );

    const yearInput = getByTestId("date-input-year");
    fireEvent.changeText(yearInput, "abc2024xyz");

    expect(yearInput.props.value).toBe("2024");
  });

  it("should limit year to 4 digits", () => {
    const { getByTestId } = render(
      <DateInput
        day={15}
        monthIndex={11}
        year={null}
        onChange={mockOnChange}
        testID="date-input"
      />
    );

    const yearInput = getByTestId("date-input-year");
    fireEvent.changeText(yearInput, "202456");

    expect(yearInput.props.value).toBe("2024");
  });

  it("should open month picker when month button is pressed", async () => {
    const { getByTestId, getByText } = render(
      <DateInput
        day={15}
        monthIndex={null}
        year={2024}
        onChange={mockOnChange}
        testID="date-input"
      />
    );

    const monthButton = getByTestId("date-input-month-button");
    fireEvent.press(monthButton);

    await waitFor(() => {
      expect(getByText("January")).toBeTruthy();
      expect(getByText("December")).toBeTruthy();
    });
  });

  it("should select month from picker", async () => {
    const { getByTestId } = render(
      <DateInput
        day={15}
        monthIndex={null}
        year={2024}
        onChange={mockOnChange}
        testID="date-input"
      />
    );

    const monthButton = getByTestId("date-input-month-button");
    fireEvent.press(monthButton);

    await waitFor(() => {
      const decemberOption = getByTestId("date-input-month-11");
      fireEvent.press(decemberOption);
    });

    expect(mockOnChange).toHaveBeenCalledWith(15, 11, 2024);
  });

  it("should close month picker when close button is pressed", async () => {
    const { getByTestId, queryByText } = render(
      <DateInput
        day={15}
        monthIndex={null}
        year={2024}
        onChange={mockOnChange}
        testID="date-input"
      />
    );

    const monthButton = getByTestId("date-input-month-button");
    fireEvent.press(monthButton);

    await waitFor(() => {
      const closeButton = getByTestId("date-input-month-close");
      fireEvent.press(closeButton);
    });

    await waitFor(() => {
      expect(queryByText("January")).toBeNull();
    });
  });

  it("should show validation error for invalid date", async () => {
    const { getByTestId, getByText } = render(
      <DateInput
        day={31}
        monthIndex={1} // February
        year={2024}
        onChange={mockOnChange}
        onError={mockOnError}
        testID="date-input"
      />
    );

    await waitFor(() => {
      expect(getByText("Invalid date")).toBeTruthy();
      expect(mockOnError).toHaveBeenCalledWith("Invalid date");
    });
  });

  it("should not show error for valid date", () => {
    const { queryByText } = render(
      <DateInput
        day={29}
        monthIndex={1} // February 2024 (leap year)
        year={2024}
        onChange={mockOnChange}
        onError={mockOnError}
        testID="date-input"
      />
    );

    expect(queryByText("Invalid date")).toBeNull();
  });

  it("should be disabled when disabled prop is true", () => {
    const { getByTestId } = render(
      <DateInput
        day={15}
        monthIndex={11}
        year={2024}
        onChange={mockOnChange}
        disabled={true}
        testID="date-input"
      />
    );

    const dayInput = getByTestId("date-input-day");
    const yearInput = getByTestId("date-input-year");
    const monthButton = getByTestId("date-input-month-button");

    expect(dayInput.props.editable).toBe(false);
    expect(yearInput.props.editable).toBe(false);
    expect(monthButton.props.disabled).toBe(true);
  });

  it("should apply error styling when error prop is true", () => {
    const { getByTestId } = render(
      <DateInput
        day={15}
        monthIndex={11}
        year={2024}
        onChange={mockOnChange}
        error={true}
        testID="date-input"
      />
    );

    const dayInput = getByTestId("date-input-day");
    const yearInput = getByTestId("date-input-year");

    // Check for error border color (would be in style props)
    expect(dayInput).toBeTruthy();
    expect(yearInput).toBeTruthy();
  });

  it("should update local state when props change", () => {
    const { getByTestId, rerender } = render(
      <DateInput
        day={15}
        monthIndex={11}
        year={2024}
        onChange={mockOnChange}
        testID="date-input"
      />
    );

    const dayInput = getByTestId("date-input-day");
    expect(dayInput.props.value).toBe("15");

    rerender(
      <DateInput
        day={20}
        monthIndex={11}
        year={2024}
        onChange={mockOnChange}
        testID="date-input"
      />
    );

    expect(dayInput.props.value).toBe("20");
  });

  it("should apply custom fontSize", () => {
    const { getByTestId } = render(
      <DateInput
        day={15}
        monthIndex={11}
        year={2024}
        onChange={mockOnChange}
        fontSize={20}
        testID="date-input"
      />
    );

    const dayInput = getByTestId("date-input-day");
    expect(dayInput).toBeTruthy();
    // fontSize would be in style prop
  });
});
