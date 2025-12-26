import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { View, Text } from "react-native";
import { NumericInput } from "./NumericInput";

/**
 * Wrapper component to use hooks in stories
 */
const NumericInputWithState: React.FC<{
  label: string;
  unit?: string;
  placeholder?: string;
  maxLength?: number;
  borderStyle?: "line" | "rectangle" | "oval";
  disabled?: boolean;
  initialValue?: string;
}> = ({
  label,
  unit,
  placeholder = "---",
  maxLength = 3,
  borderStyle,
  disabled,
  initialValue = "",
}) => {
  const [value, setValue] = useState<string>(initialValue);

  return (
    <View style={{ minWidth: 200 }}>
      <Text style={{ marginBottom: 8, fontWeight: "600" }}>
        {label} {unit && `(${unit})`}
      </Text>
      <NumericInput
        value={value}
        onChange={disabled ? () => {} : setValue}
        placeholder={placeholder}
        maxLength={maxLength}
        borderStyle={borderStyle}
      />
      {value && (
        <Text style={{ marginTop: 4, fontSize: 12, color: "#666" }}>
          Value: {value} {unit}
        </Text>
      )}
    </View>
  );
};

const meta = {
  title: "UI/NumericInput",
  component: NumericInput,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label text for the input",
    },
    unit: {
      control: "text",
      description: "Unit of measurement to display",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text when empty",
    },
    maxLength: {
      control: "number",
      description: "Maximum number of characters",
    },
    borderStyle: {
      control: "select",
      options: ["line", "rectangle", "oval"],
      description: "Border style of the input",
    },
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
    initialValue: {
      control: "text",
      description: "Initial value for the input",
    },
  },
} satisfies Meta<typeof NumericInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default numeric input
 */
export const Default: Story = {
  args: {
    label: "Enter Value",
  },
  render: args => <NumericInputWithState {...args} />,
};

/**
 * Weight input (kg)
 */
export const Weight: Story = {
  args: {
    label: "Weight",
    unit: "kg",
    maxLength: 3,
  },
  render: args => <NumericInputWithState {...args} />,
};

/**
 * Height input (cm)
 */
export const Height: Story = {
  args: {
    label: "Height",
    unit: "cm",
    maxLength: 3,
  },
  render: args => <NumericInputWithState {...args} />,
};

/**
 * Temperature input
 */
export const Temperature: Story = {
  args: {
    label: "Body Temperature",
    unit: "°C",
    initialValue: "37",
    maxLength: 4,
  },
  render: args => <NumericInputWithState {...args} />,
};

/**
 * Age input
 */
export const Age: Story = {
  args: {
    label: "Age",
    unit: "years",
    maxLength: 3,
  },
  render: args => <NumericInputWithState {...args} />,
};

/**
 * With rectangle border style
 */
export const RectangleBorder: Story = {
  args: {
    label: "Blood Pressure (Systolic)",
    unit: "mmHg",
    borderStyle: "rectangle",
    maxLength: 3,
  },
  render: args => <NumericInputWithState {...args} />,
};

/**
 * With oval border style
 */
export const OvalBorder: Story = {
  args: {
    label: "Heart Rate",
    unit: "bpm",
    borderStyle: "oval",
    maxLength: 3,
  },
  render: args => <NumericInputWithState {...args} />,
};

/**
 * Multiple numeric inputs in a health form
 */
export const HealthMetrics: Story = {
  render: () => {
    const HealthForm = () => {
      const [weight, setWeight] = useState<string>("");
      const [height, setHeight] = useState<string>("");
      const [temp, setTemp] = useState<string>("");

      return (
        <View style={{ gap: 20, minWidth: 300 }}>
          <View>
            <Text style={{ marginBottom: 8, fontWeight: "600" }}>
              Weight (kg)
            </Text>
            <NumericInput value={weight} onChange={setWeight} maxLength={3} />
          </View>

          <View>
            <Text style={{ marginBottom: 8, fontWeight: "600" }}>
              Height (cm)
            </Text>
            <NumericInput value={height} onChange={setHeight} maxLength={3} />
          </View>

          <View>
            <Text style={{ marginBottom: 8, fontWeight: "600" }}>
              Temperature (°C)
            </Text>
            <NumericInput value={temp} onChange={setTemp} maxLength={4} />
          </View>
        </View>
      );
    };

    return <HealthForm />;
  },
};
