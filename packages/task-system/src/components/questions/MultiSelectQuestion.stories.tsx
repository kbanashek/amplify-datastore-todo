import type { Meta, StoryObj } from "@storybook/react";
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";
import React, { useState } from "react";
import { View, Text } from "react-native";
import { MultiSelectQuestion } from "./MultiSelectQuestion";
import { Choice } from "@task-types/ActivityConfig";

/**
 * Wrapper component to use hooks in stories with validation
 */
const MultiSelectQuestionWithState: React.FC<{
  text: string;
  required?: boolean;
  choices: Choice[];
  initialAnswers?: string[];
  enableValidation?: boolean;
  minSelections?: number;
  maxSelections?: number;
}> = ({
  text,
  required = false,
  choices,
  initialAnswers = [],
  enableValidation = false,
  minSelections,
  maxSelections,
}) => {
  const [answers, setAnswers] = useState<string[]>(initialAnswers);
  const [error, setError] = useState<string>("");

  const validateAnswers = (selectedAnswers: string[]): void => {
    if (!enableValidation) {
      setError("");
      return;
    }

    if (required && selectedAnswers.length === 0) {
      setError("Please select at least one option");
      return;
    }

    if (minSelections && selectedAnswers.length < minSelections) {
      setError(
        `Please select at least ${minSelections} option${minSelections > 1 ? "s" : ""}`
      );
      return;
    }

    if (maxSelections && selectedAnswers.length > maxSelections) {
      setError(
        `Please select no more than ${maxSelections} option${maxSelections > 1 ? "s" : ""}`
      );
      return;
    }

    setError("");
  };

  const handleChange = (selectedAnswers: string[]): void => {
    setAnswers(selectedAnswers);
    validateAnswers(selectedAnswers);
  };

  const errors = enableValidation && error ? [error] : [];

  return (
    <View>
      <MultiSelectQuestion
        question={{
          id: "story-question",
          text,
          type: "MULTI_SELECT",
          friendlyName: "Multi Select Question",
          required,
          choices,
        }}
        value={answers}
        onChange={handleChange}
        displayProperties={{ optionPlacement: "below" }}
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
  title: "Questions/MultiSelectQuestion",
  component: MultiSelectQuestion,
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
      description: "Enable real-time validation",
    },
    minSelections: {
      control: "number",
      description: "Minimum number of selections required",
    },
    maxSelections: {
      control: "number",
      description: "Maximum number of selections allowed",
    },
  },
  decorators: [
    (Story: React.ComponentType) => (
      <View style={{ minWidth: 400, padding: 20 }}>
        <Story />
      </View>
    ),
  ],
} satisfies Meta<typeof MultiSelectQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Symptoms checklist
 */
export const SymptomsQuestion: Story = {
  args: {
    text: "Which symptoms are you experiencing? (Select all that apply)",
    required: true,
    choices: [
      { id: "headache", text: "Headache", value: "headache" },
      { id: "fever", text: "Fever", value: "fever" },
      { id: "cough", text: "Cough", value: "cough" },
      { id: "fatigue", text: "Fatigue", value: "fatigue" },
      { id: "nausea", text: "Nausea", value: "nausea" },
      { id: "none", text: "None of the above", value: "none" },
    ],
  },
  render: (args: any) => <MultiSelectQuestionWithState {...args} />,
};

/**
 * Medications checklist
 */
export const MedicationsQuestion: Story = {
  args: {
    text: "Which medications did you take today?",
    required: true,
    choices: [
      { id: "med1", text: "Blood Pressure Medication", value: "bp-med" },
      { id: "med2", text: "Diabetes Medication", value: "diabetes-med" },
      { id: "med3", text: "Pain Reliever", value: "pain-reliever" },
      { id: "med4", text: "Vitamin Supplement", value: "vitamin" },
      { id: "none", text: "Did not take any medication", value: "none" },
    ],
  },
  render: (args: any) => <MultiSelectQuestionWithState {...args} />,
};

/**
 * Activities checklist
 */
export const ActivitiesQuestion: Story = {
  args: {
    text: "What physical activities did you do this week?",
    required: false,
    choices: [
      { id: "walking", text: "🚶 Walking", value: "walking" },
      { id: "running", text: "🏃 Running", value: "running" },
      { id: "swimming", text: "🏊 Swimming", value: "swimming" },
      { id: "cycling", text: "🚴 Cycling", value: "cycling" },
      { id: "yoga", text: "🧘 Yoga", value: "yoga" },
      { id: "gym", text: "💪 Gym Workout", value: "gym" },
      { id: "none", text: "No exercise", value: "none" },
    ],
  },
  render: (args: any) => <MultiSelectQuestionWithState {...args} />,
};

/**
 * With pre-selected answers
 */
export const WithSelectedAnswers: Story = {
  args: {
    text: "Current symptoms:",
    required: true,
    choices: [
      { id: "headache", text: "Headache", value: "headache" },
      { id: "fever", text: "Fever", value: "fever" },
      { id: "cough", text: "Cough", value: "cough" },
      { id: "fatigue", text: "Fatigue", value: "fatigue" },
    ],
    initialAnswers: ["headache", "fatigue"],
  },
  render: (args: any) => <MultiSelectQuestionWithState {...args} />,
};

/**
 * Dietary preferences
 */
export const DietaryQuestion: Story = {
  args: {
    text: "Select any dietary restrictions or preferences:",
    required: false,
    choices: [
      { id: "vegetarian", text: "Vegetarian", value: "vegetarian" },
      { id: "vegan", text: "Vegan", value: "vegan" },
      { id: "gluten-free", text: "Gluten-Free", value: "gluten-free" },
      { id: "dairy-free", text: "Dairy-Free", value: "dairy-free" },
      { id: "nut-allergy", text: "Nut Allergy", value: "nut-allergy" },
      { id: "low-sodium", text: "Low Sodium", value: "low-sodium" },
      { id: "none", text: "No restrictions", value: "none" },
    ],
  },
  render: (args: any) => <MultiSelectQuestionWithState {...args} />,
};

/**
 * Medical history
 */
export const MedicalHistoryQuestion: Story = {
  args: {
    text: "Select any conditions you have been diagnosed with:",
    required: true,
    choices: [
      {
        id: "hypertension",
        text: "Hypertension (High Blood Pressure)",
        value: "hypertension",
      },
      { id: "diabetes", text: "Diabetes", value: "diabetes" },
      { id: "asthma", text: "Asthma", value: "asthma" },
      { id: "arthritis", text: "Arthritis", value: "arthritis" },
      { id: "heart", text: "Heart Disease", value: "heart-disease" },
      { id: "none", text: "None of these", value: "none" },
    ],
  },
  render: (args: any) => <MultiSelectQuestionWithState {...args} />,
};

/**
 * With required field validation
 */
export const WithRequiredValidation: Story = {
  args: {
    text: "Which symptoms are you experiencing? (Required)",
    required: true,
    choices: [
      { id: "headache", text: "Headache", value: "headache" },
      { id: "fever", text: "Fever", value: "fever" },
      { id: "cough", text: "Cough", value: "cough" },
      { id: "fatigue", text: "Fatigue", value: "fatigue" },
    ],
    enableValidation: true,
  },
  render: (args: any) => <MultiSelectQuestionWithState {...args} />,
};

/**
 * With minimum selections validation
 */
export const WithMinSelectionsValidation: Story = {
  args: {
    text: "Select at least 2 activities you did this week:",
    required: true,
    choices: [
      { id: "walking", text: "🚶 Walking", value: "walking" },
      { id: "running", text: "🏃 Running", value: "running" },
      { id: "swimming", text: "🏊 Swimming", value: "swimming" },
      { id: "cycling", text: "🚴 Cycling", value: "cycling" },
      { id: "yoga", text: "🧘 Yoga", value: "yoga" },
    ],
    enableValidation: true,
    minSelections: 2,
  },
  render: (args: any) => <MultiSelectQuestionWithState {...args} />,
};

/**
 * With maximum selections validation
 */
export const WithMaxSelectionsValidation: Story = {
  args: {
    text: "Select up to 3 of your top concerns:",
    required: false,
    choices: [
      { id: "pain", text: "Pain Management", value: "pain" },
      { id: "sleep", text: "Sleep Quality", value: "sleep" },
      { id: "energy", text: "Energy Levels", value: "energy" },
      { id: "mood", text: "Mood", value: "mood" },
      { id: "appetite", text: "Appetite", value: "appetite" },
      { id: "mobility", text: "Mobility", value: "mobility" },
    ],
    enableValidation: true,
    maxSelections: 3,
  },
  render: (args: any) => <MultiSelectQuestionWithState {...args} />,
};
