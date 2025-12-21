import React from "react";
import { render } from "@testing-library/react-native";
import { QuestionScreenContent } from "../QuestionScreenContent";
import { ParsedActivityData } from "../../../utils/activityParser";

// Mock QuestionRenderer
jest.mock("../QuestionRenderer", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    QuestionRenderer: ({ element }: any) => (
      <View testID={`question-${element.id}`}>
        <Text>{element.question.friendlyName}</Text>
      </View>
    ),
  };
});

// Mock QuestionScreenButtons
jest.mock("../QuestionScreenButtons", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    QuestionScreenButtons: () => (
      <View testID="question-screen-buttons">
        <Text>Buttons</Text>
      </View>
    ),
  };
});

// Mock platform utils
jest.mock("../../../utils/platform", () => ({
  isAndroid: jest.fn(() => false),
  getPlatform: jest.fn(() => "ios"),
}));

describe("QuestionScreenContent", () => {
  const mockActivityData: ParsedActivityData = {
    screens: [
      {
        id: "screen-1",
        order: 1,
        name: "Screen 1",
        elements: [
          {
            id: "element-1",
            order: 1,
            question: {
              id: "question-1",
              type: "text",
              text: "What is your name?",
              friendlyName: "Name",
            },
            displayProperties: {},
          },
        ],
        displayProperties: {},
      },
    ],
    questions: [],
  };

  const defaultProps = {
    activityData: mockActivityData,
    currentScreenIndex: 0,
    answers: {},
    errors: {},
    onAnswerChange: jest.fn(),
    bottomInset: 0,
    currentScreenValid: true,
    isLastScreen: false,
    onNext: jest.fn(),
  };

  it("renders questions from current screen", () => {
    const { getByTestId } = render(<QuestionScreenContent {...defaultProps} />);

    expect(getByTestId("question-element-1")).toBeTruthy();
  });

  it("renders navigation buttons", () => {
    const { getByTestId } = render(<QuestionScreenContent {...defaultProps} />);

    expect(getByTestId("question-screen-buttons")).toBeTruthy();
  });

  it("returns null when current screen is not found", () => {
    const { queryByTestId } = render(
      <QuestionScreenContent {...defaultProps} currentScreenIndex={999} />
    );

    expect(queryByTestId("question-element-1")).toBeNull();
  });

  it("passes answers to QuestionRenderer", () => {
    const answers = { "question-1": "John Doe" };
    const { getByTestId } = render(
      <QuestionScreenContent {...defaultProps} answers={answers} />
    );

    expect(getByTestId("question-element-1")).toBeTruthy();
  });

  it("passes errors to QuestionRenderer", () => {
    const errors = { "question-1": ["Name is required"] };
    const { getByTestId } = render(
      <QuestionScreenContent {...defaultProps} errors={errors} />
    );

    expect(getByTestId("question-element-1")).toBeTruthy();
  });
});
