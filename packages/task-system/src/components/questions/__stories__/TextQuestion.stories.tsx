import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { View } from "react-native";
import { TextQuestion } from "./TextQuestion";
import { QuestionType } from "@task-types/Question";

const meta = {
  title: "Questions/TextQuestion",
  component: TextQuestion,
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
} satisfies Meta<typeof TextQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Simple text question
 */
export const SimpleText: Story = {
  render: () => {
    const [answer, setAnswer] = useState<string>("");

    return (
      <TextQuestion
        question={{
          id: "q1",
          text: "What is your name?",
          questionType: QuestionType.TEXT,
          required: true,
          screenIndex: 0,
        }}
        answer={answer}
        onAnswerChange={setAnswer}
      />
    );
  },
};

/**
 * Email question
 */
export const EmailQuestion: Story = {
  render: () => {
    const [answer, setAnswer] = useState<string>("");

    return (
      <TextQuestion
        question={{
          id: "q2",
          text: "What is your email address?",
          questionType: QuestionType.TEXT,
          required: true,
          screenIndex: 0,
          placeholder: "you@example.com",
        }}
        answer={answer}
        onAnswerChange={setAnswer}
      />
    );
  },
};

/**
 * Phone number question
 */
export const PhoneQuestion: Story = {
  render: () => {
    const [answer, setAnswer] = useState<string>("");

    return (
      <TextQuestion
        question={{
          id: "q3",
          text: "What is your phone number?",
          questionType: QuestionType.TEXT,
          required: true,
          screenIndex: 0,
          placeholder: "(555) 123-4567",
        }}
        answer={answer}
        onAnswerChange={setAnswer}
      />
    );
  },
};

/**
 * Multi-line feedback question
 */
export const FeedbackQuestion: Story = {
  render: () => {
    const [answer, setAnswer] = useState<string>("");

    return (
      <TextQuestion
        question={{
          id: "q4",
          text: "Please describe any symptoms you're experiencing:",
          questionType: QuestionType.TEXT,
          required: false,
          screenIndex: 0,
          placeholder: "Describe your symptoms in detail...",
          multiline: true,
        }}
        answer={answer}
        onAnswerChange={setAnswer}
      />
    );
  },
};

/**
 * Optional question
 */
export const OptionalQuestion: Story = {
  render: () => {
    const [answer, setAnswer] = useState<string>("");

    return (
      <TextQuestion
        question={{
          id: "q5",
          text: "Do you have any additional comments? (Optional)",
          questionType: QuestionType.TEXT,
          required: false,
          screenIndex: 0,
          placeholder: "Share any additional information...",
        }}
        answer={answer}
        onAnswerChange={setAnswer}
      />
    );
  },
};

/**
 * With pre-filled answer
 */
export const WithAnswer: Story = {
  render: () => {
    const [answer, setAnswer] = useState<string>("John Doe");

    return (
      <TextQuestion
        question={{
          id: "q6",
          text: "Patient name:",
          questionType: QuestionType.TEXT,
          required: true,
          screenIndex: 0,
        }}
        answer={answer}
        onAnswerChange={setAnswer}
      />
    );
  },
};

/**
 * Medication details question
 */
export const MedicationDetails: Story = {
  render: () => {
    const [answer, setAnswer] = useState<string>("");

    return (
      <TextQuestion
        question={{
          id: "q7",
          text: "List all medications you are currently taking:",
          questionType: QuestionType.TEXT,
          required: true,
          screenIndex: 0,
          placeholder:
            "e.g., Metformin 500mg twice daily, Lisinopril 10mg once daily...",
          multiline: true,
        }}
        answer={answer}
        onAnswerChange={setAnswer}
      />
    );
  },
};

/**
 * Allergy information
 */
export const AllergyQuestion: Story = {
  render: () => {
    const [answer, setAnswer] = useState<string>("");

    return (
      <TextQuestion
        question={{
          id: "q8",
          text: "Do you have any known allergies?",
          questionType: QuestionType.TEXT,
          required: true,
          screenIndex: 0,
          placeholder:
            "List any allergies to medications, foods, or other substances",
          multiline: true,
        }}
        answer={answer}
        onAnswerChange={setAnswer}
      />
    );
  },
};

/**
 * Emergency contact
 */
export const EmergencyContact: Story = {
  render: () => {
    const [answer, setAnswer] = useState<string>("");

    return (
      <TextQuestion
        question={{
          id: "q9",
          text: "Emergency contact name and phone number:",
          questionType: QuestionType.TEXT,
          required: true,
          screenIndex: 0,
          placeholder: "Name and phone number",
        }}
        answer={answer}
        onAnswerChange={setAnswer}
      />
    );
  },
};
