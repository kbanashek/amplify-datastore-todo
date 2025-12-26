import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { TextField } from "./TextField";

/**
 * Validation function types
 */
type ValidationRule = {
  validate: (value: string) => boolean;
  errorMessage: string;
};

/**
 * Common validation rules
 */
const validationRules = {
  required: (message = "This field is required"): ValidationRule => ({
    validate: value => value.trim().length > 0,
    errorMessage: message,
  }),
  email: (message = "Please enter a valid email address"): ValidationRule => ({
    validate: value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    errorMessage: message,
  }),
  minLength: (min: number, message?: string): ValidationRule => ({
    validate: value => value.length >= min,
    errorMessage: message || `Minimum ${min} characters required`,
  }),
  maxLength: (max: number, message?: string): ValidationRule => ({
    validate: value => value.length <= max,
    errorMessage: message || `Maximum ${max} characters allowed`,
  }),
  pattern: (regex: RegExp, message: string): ValidationRule => ({
    validate: value => regex.test(value),
    errorMessage: message,
  }),
};

/**
 * Wrapper component to use hooks in stories
 */
const TextFieldWithState: React.FC<{
  label?: string;
  placeholder?: string;
  helperText?: string;
  errorText?: string;
  disabled?: boolean;
  initialValue?: string;
  multiline?: boolean;
  numberOfLines?: number;
  secureTextEntry?: boolean;
  maxLength?: number;
  keyboardType?: "default" | "numeric" | "email-address";
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  autoCorrect?: boolean;
  enableValidation?: boolean;
  validationType?: "required" | "email" | "minLength" | "custom";
  minLengthValue?: number;
}> = ({
  initialValue = "",
  enableValidation = false,
  validationType = "required",
  minLengthValue = 3,
  errorText,
  ...props
}) => {
  const [value, setValue] = useState(initialValue);
  const [validationError, setValidationError] = useState<string | undefined>();

  const validateValue = (newValue: string): void => {
    if (!enableValidation) {
      setValidationError(undefined);
      return;
    }

    let rule: ValidationRule | undefined;

    switch (validationType) {
      case "required":
        rule = validationRules.required();
        break;
      case "email":
        rule = validationRules.email();
        break;
      case "minLength":
        rule = validationRules.minLength(minLengthValue);
        break;
    }

    if (rule && !rule.validate(newValue)) {
      setValidationError(rule.errorMessage);
    } else {
      setValidationError(undefined);
    }
  };

  const handleChange = (newValue: string): void => {
    setValue(newValue);
    validateValue(newValue);
  };

  return (
    <TextField
      {...props}
      value={value}
      onChangeText={handleChange}
      errorText={enableValidation ? validationError : errorText}
    />
  );
};

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
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
    multiline: {
      control: "boolean",
      description: "Whether the input supports multiple lines",
    },
    secureTextEntry: {
      control: "boolean",
      description: "Whether to obscure text entry (for passwords)",
    },
    maxLength: {
      control: "number",
      description: "Maximum length of text",
    },
    enableValidation: {
      control: "boolean",
      description: "Enable real-time validation",
    },
    validationType: {
      control: "select",
      options: ["required", "email", "minLength"],
      description: "Type of validation to apply",
    },
    minLengthValue: {
      control: "number",
      description: "Minimum length when using minLength validation",
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
  render: args => <TextFieldWithState {...args} />,
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
  render: args => <TextFieldWithState {...args} />,
};

/**
 * Text field showing an error state
 */
export const WithError: Story = {
  args: {
    label: "Email Address",
    placeholder: "you@example.com",
    errorText: "Please enter a valid email address.",
    initialValue: "invalid-email",
  },
  render: args => <TextFieldWithState {...args} />,
};

/**
 * Disabled text field
 */
export const Disabled: Story = {
  args: {
    label: "Username",
    placeholder: "Username",
    disabled: true,
    initialValue: "john.doe",
  },
  render: args => <TextFieldWithState {...args} />,
};

/**
 * Text field with pre-filled value
 */
export const WithValue: Story = {
  args: {
    label: "City",
    placeholder: "Enter city",
    initialValue: "San Francisco",
  },
  render: args => <TextFieldWithState {...args} />,
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
  render: args => <TextFieldWithState {...args} />,
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
  render: args => <TextFieldWithState {...args} />,
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
  render: args => <TextFieldWithState {...args} />,
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
  render: args => <TextFieldWithState {...args} />,
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
  render: args => <TextFieldWithState {...args} />,
};

/**
 * With real-time required field validation
 */
export const WithRequiredValidation: Story = {
  args: {
    label: "Full Name",
    placeholder: "Enter your full name",
    helperText: "This field is required",
    enableValidation: true,
    validationType: "required",
  },
  render: args => <TextFieldWithState {...args} />,
};

/**
 * With real-time email validation
 */
export const WithEmailValidation: Story = {
  args: {
    label: "Email Address",
    placeholder: "you@example.com",
    helperText: "Enter a valid email address",
    enableValidation: true,
    validationType: "email",
    keyboardType: "email-address",
    autoCapitalize: "none",
  },
  render: args => <TextFieldWithState {...args} />,
};

/**
 * With minimum length validation
 */
export const WithMinLengthValidation: Story = {
  args: {
    label: "Username",
    placeholder: "Choose a username",
    helperText: "Username must be at least 3 characters",
    enableValidation: true,
    validationType: "minLength",
    minLengthValue: 3,
  },
  render: args => <TextFieldWithState {...args} />,
};
