import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { View } from "react-native";
import { MultiSelectQuestion } from "./MultiSelectQuestion";
import { QuestionType } from "@task-types/Question";

const meta = {
  title: "Questions/MultiSelectQuestion",
  component: MultiSelectQuestion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  decorators: [
    Story => (
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
  render: () => {
    const [answers, setAnswers] = useState<string[]>([]);

    return (
      <MultiSelectQuestion
        question={{
          id: "q1",
          text: "Which symptoms are you experiencing? (Select all that apply)",
          questionType: QuestionType.MULTI_SELECT,
          required: true,
          screenIndex: 0,
          choices: [
            { id: "headache", text: "Headache", value: "headache" },
            { id: "fever", text: "Fever", value: "fever" },
            { id: "cough", text: "Cough", value: "cough" },
            { id: "fatigue", text: "Fatigue", value: "fatigue" },
            { id: "nausea", text: "Nausea", value: "nausea" },
            { id: "none", text: "None of the above", value: "none" },
          ],
        }}
        value={answers}
        onChange={setAnswers}
        displayProperties={{ optionPlacement: "below" }}
        errors={[]}
      />
    );
  },
};

/**
 * Medications checklist
 */
export const MedicationsQuestion: Story = {
  render: () => {
    const [answers, setAnswers] = useState<string[]>([]);

    return (
      <MultiSelectQuestion
        question={{
          id: "q2",
          text: "Which medications did you take today?",
          questionType: QuestionType.MULTI_SELECT,
          required: true,
          screenIndex: 0,
          choices: [
            { id: "med1", text: "Blood Pressure Medication", value: "bp-med" },
            { id: "med2", text: "Diabetes Medication", value: "diabetes-med" },
            { id: "med3", text: "Pain Reliever", value: "pain-reliever" },
            { id: "med4", text: "Vitamin Supplement", value: "vitamin" },
            { id: "none", text: "Did not take any medication", value: "none" },
          ],
        }}
        value={answers}
        onChange={setAnswers}
        displayProperties={{ optionPlacement: "below" }}
        errors={[]}
      />
    );
  },
};

/**
 * Activities checklist
 */
export const ActivitiesQuestion: Story = {
  render: () => {
    const [answers, setAnswers] = useState<string[]>([]);

    return (
      <MultiSelectQuestion
        question={{
          id: "q3",
          text: "What physical activities did you do this week?",
          questionType: QuestionType.MULTI_SELECT,
          required: false,
          screenIndex: 0,
          choices: [
            { id: "walking", text: "🚶 Walking", value: "walking" },
            { id: "running", text: "🏃 Running", value: "running" },
            { id: "swimming", text: "🏊 Swimming", value: "swimming" },
            { id: "cycling", text: "🚴 Cycling", value: "cycling" },
            { id: "yoga", text: "🧘 Yoga", value: "yoga" },
            { id: "gym", text: "💪 Gym Workout", value: "gym" },
            { id: "none", text: "No exercise", value: "none" },
          ],
        }}
        value={answers}
        onChange={setAnswers}
        displayProperties={{ optionPlacement: "below" }}
        errors={[]}
      />
    );
  },
};

/**
 * With pre-selected answers
 */
export const WithSelectedAnswers: Story = {
  render: () => {
    const [answers, setAnswers] = useState<string[]>(["headache", "fatigue"]);

    return (
      <MultiSelectQuestion
        question={{
          id: "q4",
          text: "Current symptoms:",
          questionType: QuestionType.MULTI_SELECT,
          required: true,
          screenIndex: 0,
          choices: [
            { id: "headache", text: "Headache", value: "headache" },
            { id: "fever", text: "Fever", value: "fever" },
            { id: "cough", text: "Cough", value: "cough" },
            { id: "fatigue", text: "Fatigue", value: "fatigue" },
          ],
        }}
        value={answers}
        onChange={setAnswers}
        displayProperties={{ optionPlacement: "below" }}
        errors={[]}
      />
    );
  },
};

/**
 * Dietary preferences
 */
export const DietaryQuestion: Story = {
  render: () => {
    const [answers, setAnswers] = useState<string[]>([]);

    return (
      <MultiSelectQuestion
        question={{
          id: "q5",
          text: "Select any dietary restrictions or preferences:",
          questionType: QuestionType.MULTI_SELECT,
          required: false,
          screenIndex: 0,
          choices: [
            { id: "vegetarian", text: "Vegetarian", value: "vegetarian" },
            { id: "vegan", text: "Vegan", value: "vegan" },
            { id: "gluten-free", text: "Gluten-Free", value: "gluten-free" },
            { id: "dairy-free", text: "Dairy-Free", value: "dairy-free" },
            { id: "nut-allergy", text: "Nut Allergy", value: "nut-allergy" },
            { id: "low-sodium", text: "Low Sodium", value: "low-sodium" },
            { id: "none", text: "No restrictions", value: "none" },
          ],
        }}
        value={answers}
        onChange={setAnswers}
        displayProperties={{ optionPlacement: "below" }}
        errors={[]}
      />
    );
  },
};

/**
 * Medical history
 */
export const MedicalHistoryQuestion: Story = {
  render: () => {
    const [answers, setAnswers] = useState<string[]>([]);

    return (
      <MultiSelectQuestion
        question={{
          id: "q6",
          text: "Select any conditions you have been diagnosed with:",
          questionType: QuestionType.MULTI_SELECT,
          required: true,
          screenIndex: 0,
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
        }}
        value={answers}
        onChange={setAnswers}
        displayProperties={{ optionPlacement: "below" }}
        errors={[]}
      />
    );
  },
};
