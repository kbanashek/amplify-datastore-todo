import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { DateQuestion } from "@components/questions/DateQuestion";
import { Question } from "@task-types/ActivityConfig";

// Mock DateTimeField
jest.mock("@components/ui/DateTimeField", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return {
    DateTimeField: ({
      mode,
      value,
      onChange,
      format,
      error,
      testID,
    }: {
      mode?: string;
      value?: Date;
      onChange?: (date: Date) => void;
      format?: string;
      error?: string;
      testID?: string;
    }) => (
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

// Mock DateInput
jest.mock("@components/ui/DateInput", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return {
    DateInput: ({
      day,
      monthIndex,
      year,
      onChange,
      testID,
    }: {
      day: number | null;
      monthIndex: number | null;
      year: number | null;
      onChange: (day: number, monthIndex: number, year: number) => void;
      testID?: string;
    }) => (
      <View testID={testID}>
        <Text>DateInput</Text>
        <Text>
          {day}/{monthIndex !== null ? monthIndex + 1 : "?"}/{year}
        </Text>
        <TouchableOpacity onPress={() => onChange(13, 11, 2024)}>
          <Text>Select Date Manual</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

// Mock TimeInput
jest.mock("@components/ui/TimeInput", () => {
  const React = require("react");
  const { View, Text, TouchableOpacity } = require("react-native");
  return {
    TimeInput: ({
      value,
      onChange,
      testID,
    }: {
      value: Date | null;
      onChange: (date: Date) => void;
      testID?: string;
    }) => (
      <View testID={testID}>
        <Text>TimeInput</Text>
        <Text>{value ? value.toLocaleTimeString() : "No time"}</Text>
        <TouchableOpacity
          onPress={() => {
            const time = new Date();
            time.setHours(10, 30, 0, 0);
            onChange(time);
          }}
        >
          <Text>Select Time</Text>
        </TouchableOpacity>
      </View>
    ),
  };
});

// Mock translations
jest.mock("@translations/index", () => ({
  useTaskTranslation: () => ({
    t: (key: string, options?: any) => {
      if (key === "dateTime.months" && options?.returnObjects) {
        return [
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
        ];
      }
      return key;
    },
  }),
}));

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

  describe("Lumiere display mode", () => {
    const lumiereDisplayProperties = {
      displayMode: "lumiere",
      fontSize: "16",
    };

    it("renders DateInput for date questions in Lumiere mode", () => {
      const { getByText, queryByText } = render(
        <DateQuestion
          question={{ ...mockQuestion, type: "date-field" }}
          value="2024-12-13T00:00:00.000Z"
          onChange={() => {}}
          displayProperties={lumiereDisplayProperties}
          errors={[]}
        />
      );

      expect(getByText("DateInput")).toBeTruthy();
      expect(queryByText("TimeInput")).toBeNull();
    });

    it("renders TimeInput for time questions in Lumiere mode", () => {
      const { getByText, queryByText } = render(
        <DateQuestion
          question={{ ...mockQuestion, type: "time" }}
          value="2024-12-13T10:30:00.000Z"
          onChange={() => {}}
          displayProperties={lumiereDisplayProperties}
          errors={[]}
        />
      );

      expect(getByText("TimeInput")).toBeTruthy();
      expect(queryByText("DateInput")).toBeNull();
    });

    it("renders both DateInput and TimeInput for datetime questions in Lumiere mode", () => {
      const { getByText } = render(
        <DateQuestion
          question={{ ...mockQuestion, type: "date-time-field" }}
          value="2024-12-13T10:30:00.000Z"
          onChange={() => {}}
          displayProperties={lumiereDisplayProperties}
          errors={[]}
        />
      );

      expect(getByText("DateInput")).toBeTruthy();
      expect(getByText("TimeInput")).toBeTruthy();
    });

    it("calls onChange when date is changed in Lumiere mode (datetime)", () => {
      const mockOnChange = jest.fn();

      const { getByText } = render(
        <DateQuestion
          question={{ ...mockQuestion, type: "date-time-field" }}
          value="2024-12-13T10:30:00.000Z"
          onChange={mockOnChange}
          displayProperties={lumiereDisplayProperties}
          errors={[]}
        />
      );

      // Simulate date change
      const selectButton = getByText("Select Date Manual");
      fireEvent.press(selectButton);

      expect(mockOnChange).toHaveBeenCalled();
      const calledValue = mockOnChange.mock.calls[0][0];
      expect(typeof calledValue).toBe("string");
    });

    it("calls onChange when time is changed in Lumiere mode (datetime)", () => {
      const mockOnChange = jest.fn();

      const { getByText } = render(
        <DateQuestion
          question={{ ...mockQuestion, type: "date-time-field" }}
          value="2024-12-13T10:30:00.000Z"
          onChange={mockOnChange}
          displayProperties={lumiereDisplayProperties}
          errors={[]}
        />
      );

      // Simulate time change
      const selectButton = getByText("Select Time");
      fireEvent.press(selectButton);

      expect(mockOnChange).toHaveBeenCalled();
      const calledValue = mockOnChange.mock.calls[0][0];
      expect(typeof calledValue).toBe("string");
    });

    it("calls onChange when date is changed in Lumiere mode (date only)", () => {
      const mockOnChange = jest.fn();

      const { getByText } = render(
        <DateQuestion
          question={{ ...mockQuestion, type: "date-field" }}
          value="2024-12-13T00:00:00.000Z"
          onChange={mockOnChange}
          displayProperties={lumiereDisplayProperties}
          errors={[]}
        />
      );

      const selectButton = getByText("Select Date Manual");
      fireEvent.press(selectButton);

      expect(mockOnChange).toHaveBeenCalled();
      const calledValue = mockOnChange.mock.calls[0][0];
      expect(typeof calledValue).toBe("string");
      // Should be an ISO string
      expect(calledValue).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("calls onChange when time is changed in Lumiere mode (time only)", () => {
      const mockOnChange = jest.fn();

      const { getByText } = render(
        <DateQuestion
          question={{ ...mockQuestion, type: "time" }}
          value="2024-12-13T10:30:00.000Z"
          onChange={mockOnChange}
          displayProperties={lumiereDisplayProperties}
          errors={[]}
        />
      );

      const selectButton = getByText("Select Time");
      fireEvent.press(selectButton);

      expect(mockOnChange).toHaveBeenCalled();
      const calledValue = mockOnChange.mock.calls[0][0];
      expect(typeof calledValue).toBe("string");
      // Should be an ISO string
      expect(calledValue).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("initializes Lumiere state from ISO value", () => {
      const { getByText } = render(
        <DateQuestion
          question={{ ...mockQuestion, type: "date-time-field" }}
          value="2024-12-13T10:30:00.000Z"
          onChange={() => {}}
          displayProperties={lumiereDisplayProperties}
          errors={[]}
        />
      );

      // Components should be rendered with parsed values
      expect(getByText("DateInput")).toBeTruthy();
      expect(getByText("TimeInput")).toBeTruthy();
    });
  });

  describe("Native display mode (default)", () => {
    it("uses DateTimeField for native mode", () => {
      const { getByTestId } = render(
        <DateQuestion
          question={{ ...mockQuestion, type: "date-field" }}
          value="2024-12-13T00:00:00.000Z"
          onChange={() => {}}
          displayProperties={{}} // No displayMode = defaults to native
          errors={[]}
        />
      );

      expect(getByTestId("date-question-date-1")).toBeTruthy();
    });

    it("uses DateTimeField when displayMode is explicitly set to native", () => {
      const { getByTestId } = render(
        <DateQuestion
          question={{ ...mockQuestion, type: "date-field" }}
          value="2024-12-13T00:00:00.000Z"
          onChange={() => {}}
          displayProperties={{ displayMode: "native" }}
          errors={[]}
        />
      );

      expect(getByTestId("date-question-date-1")).toBeTruthy();
    });
  });
});
