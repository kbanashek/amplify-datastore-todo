import type { Meta, StoryObj } from "@storybook/react";
import React, { useState } from "react";
import { View } from "react-native";
import { SingleSelectQuestion } from "./SingleSelectQuestion";
import { QuestionType } from "@task-types/Question";

const meta = {
  title: "Questions/SingleSelectQuestion",
  component: SingleSelectQuestion,
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
} satisfies Meta<typeof SingleSelectQuestion>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Simple yes/no question
 */
export const YesNoQuestion: Story = {
  render: () => {
    const [answer, setAnswer] = useState<string | undefined>(undefined);

    return (
      <SingleSelectQuestion
        question={{
          id: "q1",
          text: "Did you take your medication today?",
          questionType: QuestionType.SINGLE_SELECT,
          required: true,
          screenIndex: 0,
          choices: [
            { id: "yes", text: "Yes", value: "yes" },
            { id: "no", text: "No", value: "no" },
          ],
        }}
        value={answer || null}
        onChange={setAnswer}
        displayProperties={{ optionPlacement: "below" }}
        errors={[]}
      />
    );
  },
};

/**
 * Pain level assessment
 */
export const PainLevelQuestion: Story = {
  render: () => {
    const [answer, setAnswer] = useState<string | undefined>(undefined);

    return (
      <SingleSelectQuestion
        question={{
          id: "q2",
          text: "How would you rate your pain level today?",
          questionType: QuestionType.SINGLE_SELECT,
          required: true,
          screenIndex: 0,
          choices: [
            { id: "none", text: "No Pain (0)", value: "0" },
            { id: "mild", text: "Mild Pain (1-3)", value: "1-3" },
            { id: "moderate", text: "Moderate Pain (4-6)", value: "4-6" },
            { id: "severe", text: "Severe Pain (7-10)", value: "7-10" },
          ],
        }}
        value={answer || null}
        onChange={setAnswer}
        displayProperties={{ optionPlacement: "below" }}
        errors={[]}
      />
    );
  },
};

/**
 * Symptom frequency question
 */
export const FrequencyQuestion: Story = {
  render: () => {
    const [answer, setAnswer] = useState<string | undefined>(undefined);

    return (
      <SingleSelectQuestion
        question={{
          id: "q3",
          text: "How often do you experience headaches?",
          questionType: QuestionType.SINGLE_SELECT,
          required: true,
          screenIndex: 0,
          choices: [
            { id: "never", text: "Never", value: "never" },
            {
              id: "rarely",
              text: "Rarely (once a month or less)",
              value: "rarely",
            },
            {
              id: "sometimes",
              text: "Sometimes (2-4 times a month)",
              value: "sometimes",
            },
            { id: "often", text: "Often (weekly)", value: "often" },
            { id: "daily", text: "Daily", value: "daily" },
          ],
        }}
        value={answer || null}
        onChange={setAnswer}
        displayProperties={{ optionPlacement: "below" }}
        errors={[]}
      />
    );
  },
};

/**
 * Mood assessment
 */
export const MoodQuestion: Story = {
  render: () => {
    const [answer, setAnswer] = useState<string | undefined>(undefined);

    return (
      <SingleSelectQuestion
        question={{
          id: "q4",
          text: "How are you feeling today?",
          questionType: QuestionType.SINGLE_SELECT,
          required: false,
          screenIndex: 0,
          choices: [
            { id: "great", text: "😄 Great", value: "great" },
            { id: "good", text: "🙂 Good", value: "good" },
            { id: "okay", text: "😐 Okay", value: "okay" },
            { id: "not-good", text: "😟 Not Good", value: "not-good" },
            { id: "bad", text: "😢 Bad", value: "bad" },
          ],
        }}
        value={answer || null}
        onChange={setAnswer}
        displayProperties={{ optionPlacement: "below" }}
        errors={[]}
      />
    );
  },
};

/**
 * With pre-selected answer
 */
export const WithSelectedAnswer: Story = {
  render: () => {
    const [answer, setAnswer] = useState<string | undefined>("moderate");

    return (
      <SingleSelectQuestion
        question={{
          id: "q5",
          text: "Rate your current pain level:",
          questionType: QuestionType.SINGLE_SELECT,
          required: true,
          screenIndex: 0,
          choices: [
            { id: "none", text: "No Pain", value: "none" },
            { id: "mild", text: "Mild", value: "mild" },
            { id: "moderate", text: "Moderate", value: "moderate" },
            { id: "severe", text: "Severe", value: "severe" },
          ],
        }}
        value={answer || null}
        onChange={setAnswer}
        displayProperties={{ optionPlacement: "below" }}
        errors={[]}
      />
    );
  },
};

/**
 * Optional question (not required)
 */
export const OptionalQuestion: Story = {
  render: () => {
    const [answer, setAnswer] = useState<string | undefined>(undefined);

    return (
      <SingleSelectQuestion
        question={{
          id: "q6",
          text: "Would you like to provide additional feedback?",
          questionType: QuestionType.SINGLE_SELECT,
          required: false,
          screenIndex: 0,
          choices: [
            { id: "yes", text: "Yes, I have feedback", value: "yes" },
            { id: "no", text: "No, skip this", value: "no" },
          ],
        }}
        value={answer || null}
        onChange={setAnswer}
        displayProperties={{ optionPlacement: "below" }}
        errors={[]}
      />
    );
  },
};

/**
 * Many options question
 */
export const ManyOptions: Story = {
  render: () => {
    const [answer, setAnswer] = useState<string | undefined>(undefined);

    return (
      <SingleSelectQuestion
        question={{
          id: "q7",
          text: "Which specialist did you see?",
          questionType: QuestionType.SINGLE_SELECT,
          required: true,
          screenIndex: 0,
          choices: [
            { id: "cardio", text: "Cardiologist", value: "cardio" },
            { id: "endo", text: "Endocrinologist", value: "endo" },
            { id: "gastro", text: "Gastroenterologist", value: "gastro" },
            { id: "neuro", text: "Neurologist", value: "neuro" },
            { id: "ortho", text: "Orthopedist", value: "ortho" },
            { id: "psych", text: "Psychiatrist", value: "psych" },
            { id: "other", text: "Other Specialist", value: "other" },
          ],
        }}
        value={answer || null}
        onChange={setAnswer}
        displayProperties={{ optionPlacement: "below" }}
        errors={[]}
      />
    );
  },
};
