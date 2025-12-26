import type { Meta } from "@storybook/react";
import React, { useState } from "react";
import { Text, View } from "react-native";
import { DatePicker } from "./DatePicker";

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
      <Text style={{ marginBottom: 8, fontWeight: "600" }}>
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
    initialValue: {
      control: "date",
      description: "Initial date value",
    },
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
  args: {
    placeholder: "Choose a date",
    disabled: false,
  },
  render: (args: { placeholder?: string; disabled?: boolean }) => (
    <DatePickerWithState {...args} />
  ),
};

/**
 * Date picker with pre-selected date
 */
export const WithValue = {
  args: {
    initialValue: new Date(),
    placeholder: "Choose a date",
    disabled: false,
  },
  render: (args: {
    initialValue?: Date | null;
    placeholder?: string;
    disabled?: boolean;
  }) => <DatePickerWithState {...args} />,
};

/**
 * Disabled date picker
 */
export const Disabled = {
  args: {
    initialValue: new Date(),
    placeholder: "Choose a date",
    disabled: true,
  },
  render: (args: {
    initialValue?: Date | null;
    placeholder?: string;
    disabled?: boolean;
  }) => <DatePickerWithState {...args} />,
};

/**
 * Date picker for birth date
 */
export const BirthDate = {
  args: {
    placeholder: "MM/DD/YYYY",
    disabled: false,
  },
  render: (args: { placeholder?: string; disabled?: boolean }) => (
    <DatePickerWithState {...args} />
  ),
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
            <Text style={{ marginBottom: 8, fontWeight: "600" }}>
              Start Date
            </Text>
            <DatePicker
              value={startDate}
              onChange={setStartDate}
              placeholder="Select start date"
            />
          </View>
          <View>
            <Text style={{ marginBottom: 8, fontWeight: "600" }}>End Date</Text>
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
