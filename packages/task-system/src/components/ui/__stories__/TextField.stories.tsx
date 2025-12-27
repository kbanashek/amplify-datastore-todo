import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { TextField } from "../TextField";

const meta = {
  title: "UI/TextField",
  component: TextField,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "Label text for the input field",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text when input is empty",
    },
    helperText: {
      control: "text",
      description: "Helper text shown below the input",
    },
    errorText: {
      control: "text",
      description: "Error text shown when validation fails",
    },
    editable: {
      control: "boolean",
      description: "Whether the input is editable",
    },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default text field with label
 */
export const Default: Story = {
  args: {
    label: "Full Name",
    placeholder: "Enter your full name",
  },
  render: args => {
    const [value, setValue] = useState("");
    return <TextField {...args} value={value} onChangeText={setValue} />;
  },
};

/**
 * Text field with helper text
 */
export const WithHelperText: Story = {
  args: {
    label: "Email Address",
    placeholder: "you@example.com",
    helperText: "We'll never share your email with anyone else.",
  },
  render: args => {
    const [value, setValue] = useState("");
    return <TextField {...args} value={value} onChangeText={setValue} />;
  },
};

/**
 * Text field showing an error state
 */
export const WithError: Story = {
  args: {
    label: "Email Address",
    placeholder: "you@example.com",
    errorText: "Please enter a valid email address.",
  },
  render: args => {
    const [value, setValue] = useState("invalid-email");
    return <TextField {...args} value={value} onChangeText={setValue} />;
  },
};

/**
 * Disabled text field
 */
export const Disabled: Story = {
  args: {
    label: "Username",
    placeholder: "Username",
    editable: false,
  },
  render: args => {
    const [value, setValue] = useState("john.doe");
    return <TextField {...args} value={value} onChangeText={setValue} />;
  },
};

/**
 * Text field with pre-filled value
 */
export const WithValue: Story = {
  args: {
    label: "City",
    placeholder: "Enter city",
  },
  render: args => {
    const [value, setValue] = useState("San Francisco");
    return <TextField {...args} value={value} onChangeText={setValue} />;
  },
};

/**
 * Multi-line text field
 */
export const MultiLine: Story = {
  args: {
    label: "Description",
    placeholder: "Enter a detailed description",
    multiline: true,
    numberOfLines: 4,
  },
  render: args => {
    const [value, setValue] = useState("");
    return <TextField {...args} value={value} onChangeText={setValue} />;
  },
};

/**
 * Password field with secure text entry
 */
export const Password: Story = {
  args: {
    label: "Password",
    placeholder: "Enter your password",
    secureTextEntry: true,
    helperText: "Must be at least 8 characters",
  },
  render: args => {
    const [value, setValue] = useState("");
    return <TextField {...args} value={value} onChangeText={setValue} />;
  },
};

/**
 * Text field with maximum length
 */
export const WithMaxLength: Story = {
  args: {
    label: "Bio",
    placeholder: "Tell us about yourself",
    maxLength: 100,
    helperText: "Maximum 100 characters",
  },
  render: args => {
    const [value, setValue] = useState("");
    return <TextField {...args} value={value} onChangeText={setValue} />;
  },
};

/**
 * Numeric input field
 */
export const NumericInput: Story = {
  args: {
    label: "Age",
    placeholder: "Enter your age",
    keyboardType: "numeric",
  },
  render: args => {
    const [value, setValue] = useState("");
    return <TextField {...args} value={value} onChangeText={setValue} />;
  },
};

/**
 * Email input field with appropriate keyboard
 */
export const EmailInput: Story = {
  args: {
    label: "Email",
    placeholder: "you@example.com",
    keyboardType: "email-address",
    autoCapitalize: "none",
    autoCorrect: false,
  },
  render: args => {
    const [value, setValue] = useState("");
    return <TextField {...args} value={value} onChangeText={setValue} />;
  },
};
