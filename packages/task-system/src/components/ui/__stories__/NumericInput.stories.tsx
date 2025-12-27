import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { View, Text } from "react-native";
import { NumericInput } from "./NumericInput";
import { AppFonts } from "@constants/AppFonts";

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
      <Text style={[AppFonts.label, { marginBottom: 8 }]}>
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
        <Text
          style={[
            AppFonts.caption,
            { marginTop: 4, color: AppColors.mediumDarkGray },
          ]}
        >
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
  },
} satisfies Meta<typeof NumericInput>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default numeric input
 */
export const Default: Story = {
  render: () => <NumericInputWithState label="Enter Value" />,
};

/**
 * Weight input (kg)
 */
export const Weight: Story = {
  render: () => (
    <NumericInputWithState label="Weight" unit="kg" maxLength={3} />
  ),
};

/**
 * Height input (cm)
 */
export const Height: Story = {
  render: () => (
    <NumericInputWithState label="Height" unit="cm" maxLength={3} />
  ),
};

/**
 * Temperature input
 */
export const Temperature: Story = {
  render: () => (
    <NumericInputWithState
      label="Body Temperature"
      unit="°C"
      initialValue="37"
      maxLength={4}
    />
  ),
};

/**
 * Age input
 */
export const Age: Story = {
  render: () => (
    <NumericInputWithState label="Age" unit="years" maxLength={3} />
  ),
};

/**
 * With rectangle border style
 */
export const RectangleBorder: Story = {
  render: () => (
    <NumericInputWithState
      label="Blood Pressure (Systolic)"
      unit="mmHg"
      borderStyle="rectangle"
      maxLength={3}
    />
  ),
};

/**
 * With oval border style
 */
export const OvalBorder: Story = {
  render: () => (
    <NumericInputWithState
      label="Heart Rate"
      unit="bpm"
      borderStyle="oval"
      maxLength={3}
    />
  ),
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
            <Text style={[AppFonts.label, { marginBottom: 8 }]}>
              Weight (kg)
            </Text>
            <NumericInput value={weight} onChange={setWeight} maxLength={3} />
          </View>

          <View>
            <Text style={[AppFonts.label, { marginBottom: 8 }]}>
              Height (cm)
            </Text>
            <NumericInput value={height} onChange={setHeight} maxLength={3} />
          </View>

          <View>
            <Text style={[AppFonts.label, { marginBottom: 8 }]}>
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
