import type { Meta, StoryObj } from "@storybook/react";
import { AppColors } from "@constants/AppColors";
import { AppFonts } from "@constants/AppFonts";
import React, { useState, useEffect } from "react";
import { View, Text } from "react-native";
import { SingleSelectQuestion } from "../SingleSelectQuestion";
import { Choice, Question } from "@task-types/ActivityConfig";

/**
 * Wrapper component to use hooks in stories with validation
 */
const SingleSelectQuestionWithState: React.FC<{
  text: string;
  required?: boolean;
  choices: Choice[];
  initialAnswer?: string;
  enableValidation?: boolean;
  showValidationOnMount?: boolean;
}> = ({
  text,
  required = false,
  choices,
  initialAnswer,
  enableValidation = false,
  showValidationOnMount = false,
}) => {
  const [answer, setAnswer] = useState<string | undefined>(initialAnswer);
  const [showError, setShowError] = useState(showValidationOnMount);

  useEffect(() => {
    if (enableValidation && answer !== undefined) {
      setShowError(false);
    }
  }, [answer, enableValidation]);

  const handleChange = (value: string): void => {
    setAnswer(value);
    if (enableValidation) {
      setShowError(!value && required);
    }
  };

  const hasError = enableValidation && required && !answer && showError;
  const errors = hasError ? ["Please select an option"] : [];

  return (
    <View>
      <SingleSelectQuestion
        question={{
          id: "story-question",
          text,
          type: "SINGLE_SELECT",
          friendlyName: "Single Select Question",
          required,
          choices,
        }}
        value={answer || null}
        onChange={handleChange}
        displayProperties={{ optionPlacement: "below" }}
        errors={errors}
      />
      {hasError && (
        <View style={{ marginTop: 4, paddingHorizontal: 4 }}>
          <Text style={[AppFonts.caption, { color: AppColors.errorRed }]}>
            {errors[0]}
          </Text>
        </View>
      )}
    </View>
  );
};

const meta = {
  title: "Questions/SingleSelectQuestion",
  component: SingleSelectQuestion,
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
    enableValidation: {
      control: "boolean",
      description: "Enable required field validation",
    },
    showValidationOnMount: {
      control: "boolean",
      description: "Show validation error immediately",
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <View style={{ minWidth: 400, padding: 20 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof SingleSelectQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Simple yes/no question
 */
export const YesNoQuestion: Story = {
  args: {
    text: "Did you take your medication today?",
    required: true,
    choices: [
      { id: "yes", text: "Yes", value: "yes" },
      { id: "no", text: "No", value: "no" },
    ],
  },
  render: (args) => <SingleSelectQuestionWithState {...args} />,
};

/**
 * Pain level assessment
 */
export const PainLevelQuestion: Story = {
  args: {
    text: "How would you rate your pain level today?",
    required: true,
    choices: [
      { id: "none", text: "No Pain (0)", value: "0" },
      { id: "mild", text: "Mild Pain (1-3)", value: "1-3" },
      { id: "moderate", text: "Moderate Pain (4-6)", value: "4-6" },
      { id: "severe", text: "Severe Pain (7-10)", value: "7-10" },
    ],
  },
  render: (args) => <SingleSelectQuestionWithState {...args} />,
};

/**
 * Symptom frequency question
 */
export const FrequencyQuestion: Story = {
  args: {
    text: "How often do you experience headaches?",
    required: true,
    choices: [
      { id: "never", text: "Never", value: "never" },
      { id: "rarely", text: "Rarely (once a month or less)", value: "rarely" },
      {
        id: "sometimes",
        text: "Sometimes (2-4 times a month)",
        value: "sometimes",
      },
      { id: "often", text: "Often (weekly)", value: "often" },
      { id: "daily", text: "Daily", value: "daily" },
    ],
  },
  render: (args) => <SingleSelectQuestionWithState {...args} />,
};

/**
 * Mood assessment
 */
export const MoodQuestion: Story = {
  args: {
    text: "How are you feeling today?",
    required: false,
    choices: [
      { id: "great", text: "😄 Great", value: "great" },
      { id: "good", text: "🙂 Good", value: "good" },
      { id: "okay", text: "😐 Okay", value: "okay" },
      { id: "not-good", text: "😟 Not Good", value: "not-good" },
      { id: "bad", text: "😢 Bad", value: "bad" },
    ],
  },
  render: (args) => <SingleSelectQuestionWithState {...args} />,
};

/**
 * With pre-selected answer
 */
export const WithSelectedAnswer: Story = {
  args: {
    text: "Rate your current pain level:",
    required: true,
    choices: [
      { id: "none", text: "No Pain", value: "none" },
      { id: "mild", text: "Mild", value: "mild" },
      { id: "moderate", text: "Moderate", value: "moderate" },
      { id: "severe", text: "Severe", value: "severe" },
    ],
    initialAnswer: "moderate",
  },
  render: (args) => <SingleSelectQuestionWithState {...args} />,
};

/**
 * Optional question (not required)
 */
export const OptionalQuestion: Story = {
  args: {
    text: "Would you like to provide additional feedback?",
    required: false,
    choices: [
      { id: "yes", text: "Yes, I have feedback", value: "yes" },
      { id: "no", text: "No, skip this", value: "no" },
    ],
  },
  render: (args) => <SingleSelectQuestionWithState {...args} />,
};

/**
 * Many options question
 */
export const ManyOptions: Story = {
  args: {
    text: "Which specialist did you see?",
    required: true,
    choices: [
      { id: "cardio", text: "Cardiologist", value: "cardio" },
      { id: "endo", text: "Endocrinologist", value: "endo" },
      { id: "gastro", text: "Gastroenterologist", value: "gastro" },
      { id: "neuro", text: "Neurologist", value: "neuro" },
      { id: "ortho", text: "Orthopedist", value: "ortho" },
      { id: "psych", text: "Psychiatrist", value: "psych" },
      { id: "other", text: "Other Specialist", value: "other" },
    ],
  },
  render: (args) => <SingleSelectQuestionWithState {...args} />,
};

/**
 * With required field validation
 */
export const WithRequiredValidation: Story = {
  args: {
    text: "Did you take your medication today? (Required)",
    required: true,
    choices: [
      { id: "yes", text: "Yes", value: "yes" },
      { id: "no", text: "No", value: "no" },
    ],
    enableValidation: true,
    showValidationOnMount: true,
  },
  render: (args) => <SingleSelectQuestionWithState {...args} />,
};
