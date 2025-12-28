import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { View, Text } from "react-native";
import { TextQuestion } from "./TextQuestion";
import { Question } from "@task-types/ActivityConfig";
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";

/**
 * Wrapper component to use hooks in stories with validation
 */
const TextQuestionWithState: React.FC<{
  text: string;
  required?: boolean;
  placeholder?: string;
  multiline?: boolean;
  initialAnswer?: string;
  enableValidation?: boolean;
  minLength?: number;
  maxLength?: number;
}> = ({
  text,
  required = false,
  placeholder,
  multiline,
  initialAnswer = "",
  enableValidation = false,
  minLength,
  maxLength,
}) => {
  const [answer, setAnswer] = useState<string>(initialAnswer);
  const [error, setError] = useState<string>("");

  const validateAnswer = (value: string): void => {
    if (!enableValidation) {
      setError("");
      return;
    }

    if (required && value.trim().length === 0) {
      setError("This question is required");
      return;
    }

    if (minLength && value.length > 0 && value.length < minLength) {
      setError(`Answer must be at least ${minLength} characters`);
      return;
    }

    if (maxLength && value.length > maxLength) {
      setError(`Answer must not exceed ${maxLength} characters`);
      return;
    }

    setError("");
  };

  const handleChange = (value: string): void => {
    setAnswer(value);
    validateAnswer(value);
  };

  const errors = enableValidation && error ? [error] : [];

  return (
    <View>
      <TextQuestion
        question={{
          id: "story-question",
          text,
          type: "TEXT",
          friendlyName: "Text Question",
          required,
        }}
        value={answer}
        onChange={handleChange}
        displayProperties={{}}
        errors={errors}
      />
      {enableValidation && error && (
        <View style={{ marginTop: 4, paddingHorizontal: 4 }}>
          <Text style={[AppFonts.caption, { color: AppColors.errorRed }]}>
            {error}
          </Text>
        </View>
      )}
    </View>
  );
};

const meta = {
  title: "Questions/TextQuestion",
  component: TextQuestion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    text: {
      control: "text",
      description: "The question text to display",
    },
    required: {
      control: "boolean",
      description: "Whether the question is required",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text for the input",
    },
    multiline: {
      control: "boolean",
      description: "Whether to allow multiple lines of text",
    },
    initialAnswer: {
      control: "text",
      description: "Initial answer value",
    },
    enableValidation: {
      control: "boolean",
      description: "Enable real-time validation",
    },
    minLength: {
      control: "number",
      description: "Minimum answer length",
    },
    maxLength: {
      control: "number",
      description: "Maximum answer length",
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <View style={{ minWidth: 400, padding: 20 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof TextQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Simple text question
 */
export const SimpleText: Story = {
  args: {
    text: "What is your name?",
    required: true,
  },
  render: (args: any) => <TextQuestionWithState {...args} />,
};

/**
 * Email question
 */
export const EmailQuestion: Story = {
  args: {
    text: "What is your email address?",
    required: true,
    placeholder: "you@example.com",
  },
  render: (args: any) => <TextQuestionWithState {...args} />,
};

/**
 * Phone number question
 */
export const PhoneQuestion: Story = {
  args: {
    text: "What is your phone number?",
    required: true,
    placeholder: "(555) 123-4567",
  },
  render: (args: any) => <TextQuestionWithState {...args} />,
};

/**
 * Multi-line feedback question
 */
export const FeedbackQuestion: Story = {
  args: {
    text: "Please describe any symptoms you're experiencing:",
    required: false,
    placeholder: "Describe your symptoms in detail...",
    multiline: true,
  },
  render: (args: any) => <TextQuestionWithState {...args} />,
};

/**
 * Optional question
 */
export const OptionalQuestion: Story = {
  args: {
    text: "Do you have any additional comments? (Optional)",
    required: false,
    placeholder: "Share any additional information...",
  },
  render: (args: any) => <TextQuestionWithState {...args} />,
};

/**
 * With pre-filled answer
 */
export const WithAnswer: Story = {
  args: {
    text: "Patient name:",
    required: true,
    initialAnswer: "John Doe",
  },
  render: (args: any) => <TextQuestionWithState {...args} />,
};

/**
 * Medication details question
 */
export const MedicationDetails: Story = {
  args: {
    text: "List all medications you are currently taking:",
    required: true,
    placeholder:
      "e.g., Metformin 500mg twice daily, Lisinopril 10mg once daily...",
    multiline: true,
  },
  render: (args: any) => <TextQuestionWithState {...args} />,
};

/**
 * Allergy information
 */
export const AllergyQuestion: Story = {
  args: {
    text: "Do you have any known allergies?",
    required: true,
    placeholder:
      "List any allergies to medications, foods, or other substances",
    multiline: true,
  },
  render: (args: any) => <TextQuestionWithState {...args} />,
};

/**
 * Emergency contact
 */
export const EmergencyContact: Story = {
  args: {
    text: "Emergency contact name and phone number:",
    required: true,
    placeholder: "Name and phone number",
  },
  render: (args: any) => <TextQuestionWithState {...args} />,
};

/**
 * With required field validation
 */
export const WithRequiredValidation: Story = {
  args: {
    text: "What is your full name?",
    required: true,
    placeholder: "Enter your name",
    enableValidation: true,
  },
  render: (args: any) => <TextQuestionWithState {...args} />,
};

/**
 * With minimum length validation
 */
export const WithMinLengthValidation: Story = {
  args: {
    text: "Please provide a brief description of your symptoms:",
    required: true,
    placeholder: "Describe your symptoms (minimum 10 characters)",
    multiline: true,
    enableValidation: true,
    minLength: 10,
  },
  render: (args: any) => <TextQuestionWithState {...args} />,
};

/**
 * With maximum length validation
 */
export const WithMaxLengthValidation: Story = {
  args: {
    text: "Enter a short note (max 50 characters):",
    required: false,
    placeholder: "Your note here",
    enableValidation: true,
    maxLength: 50,
  },
  render: (args: any) => <TextQuestionWithState {...args} />,
};
