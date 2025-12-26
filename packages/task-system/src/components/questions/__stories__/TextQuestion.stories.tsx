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
        value={answer}
        onChange={setAnswer}
        displayProperties={{}}
        errors={[]}
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
        value={answer}
        onChange={setAnswer}
        displayProperties={{}}
        errors={[]}
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
        value={answer}
        onChange={setAnswer}
        displayProperties={{}}
        errors={[]}
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
        value={answer}
        onChange={setAnswer}
        displayProperties={{}}
        errors={[]}
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
        value={answer}
        onChange={setAnswer}
        displayProperties={{}}
        errors={[]}
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
        value={answer}
        onChange={setAnswer}
        displayProperties={{}}
        errors={[]}
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
        value={answer}
        onChange={setAnswer}
        displayProperties={{}}
        errors={[]}
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
        value={answer}
        onChange={setAnswer}
        displayProperties={{}}
        errors={[]}
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
        value={answer}
        onChange={setAnswer}
        displayProperties={{}}
        errors={[]}
      />
    );
  },
};
