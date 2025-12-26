import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { View, Text } from "react-native";
import { FieldLabel } from "./FieldLabel";

const meta = {
  title: "UI/FieldLabel",
  component: FieldLabel,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label text to display",
    },
    required: {
      control: "boolean",
      description: "Whether to show required indicator (*)",
    },
  },
} satisfies Meta<typeof FieldLabel>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default field label
 */
export const Default: Story = {
  args: {
    label: "Field Name",
  },
};

/**
 * Required field label with asterisk
 */
export const Required: Story = {
  args: {
    label: "Required Field",
    required: true,
  },
};

/**
 * Optional field label
 */
export const Optional: Story = {
  args: {
    label: "Optional Field",
    required: false,
  },
};

/**
 * Long label text
 */
export const LongLabel: Story = {
  args: {
    label: "This is a very long field label that might wrap to multiple lines",
    required: true,
  },
};

/**
 * Labels in a form context
 */
export const FormLabels: Story = {
  render: () => (
    <View style={{ gap: 20, minWidth: 300 }}>
      <View>
        <FieldLabel label="Full Name" required />
        <Text style={{ marginTop: 4, color: "#666" }}>John Doe</Text>
      </View>

      <View>
        <FieldLabel label="Email Address" required />
        <Text style={{ marginTop: 4, color: "#666" }}>john@example.com</Text>
      </View>

      <View>
        <FieldLabel label="Phone Number" />
        <Text style={{ marginTop: 4, color: "#666" }}>(Optional)</Text>
      </View>

      <View>
        <FieldLabel label="Date of Birth" required />
        <Text style={{ marginTop: 4, color: "#666" }}>01/01/1990</Text>
      </View>
    </View>
  ),
};

/**
 * Different label styles
 */
export const Variations: Story = {
  render: () => (
    <View style={{ gap: 16, minWidth: 300 }}>
      <FieldLabel label="Standard Label" />
      <FieldLabel label="Required Label" required />
      <FieldLabel label="Medical History" required />
      <FieldLabel label="Emergency Contact" />
      <FieldLabel label="Insurance Information" />
    </View>
  ),
};
