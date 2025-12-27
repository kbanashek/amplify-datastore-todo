import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { DatePicker } from "./DatePicker";
import { AppFonts } from "@constants/AppFonts";

/**
 * Wrapper component to use hooks in stories
 */
const DatePickerWithState: React.FC<{
  initialValue?: Date | null;
  placeholder?: string;
  disabled?: boolean;
}> = ({ initialValue = null, placeholder, disabled }) => {
  const [date, setDate] = useState<Date | null>(initialValue);
  return (
    <View>
      <Text style={[AppFonts.label, { marginBottom: 8 }]}>
        Selected: {date?.toLocaleDateString() || "None"}
      </Text>
      <DatePicker
        value={date}
        onChange={setDate}
        placeholder={placeholder}
        disabled={disabled}
      />
    </View>
  );
};

const meta = {
  title: "UI/DatePicker",
  component: DatePicker,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder text when no date is selected",
    },
    disabled: {
      control: "boolean",
      description: "Whether the date picker is disabled",
    },
  },
} satisfies Meta<typeof DatePicker>;

export default meta;

/**
 * Default date picker
 */
export const Default = {
  render: () => <DatePickerWithState placeholder="Choose a date" />,
};

/**
 * Date picker with pre-selected date
 */
export const WithValue = {
  render: () => (
    <DatePickerWithState
      initialValue={new Date()}
      placeholder="Choose a date"
    />
  ),
};

/**
 * Disabled date picker
 */
export const Disabled = {
  render: () => (
    <DatePickerWithState
      initialValue={new Date()}
      placeholder="Choose a date"
      disabled
    />
  ),
};

/**
 * Date picker for birth date
 */
export const BirthDate = {
  render: () => <DatePickerWithState placeholder="MM/DD/YYYY" />,
};

/**
 * Multiple date pickers in a form
 */
export const FormExample = {
  render: () => {
    const FormWithDates = () => {
      const [startDate, setStartDate] = useState<Date | null>(null);
      const [endDate, setEndDate] = useState<Date | null>(null);

      return (
        <View style={{ gap: 20, minWidth: 300 }}>
          <View>
            <Text style={[AppFonts.label, { marginBottom: 8 }]}>
              Start Date
            </Text>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="Select start date"
            />
          </View>
          <View>
            <Text style={[AppFonts.label, { marginBottom: 8 }]}>End Date</Text>
            <DatePicker
              value={endDate}
              onChange={setEndDate}
              placeholder="Select end date"
            />
          </View>
        </View>
      );
    };

    return <FormWithDates />;
  },
};
