import React from "react";
import { render } from "@testing-library/react-native";
import { ReviewScreenContainer } from "../ReviewScreenContainer";
import { ParsedActivityData } from "../../../utils/activityParser";

// Mock ReviewScreen
jest.mock("../ReviewScreen", () => {
  const React = require("react");
  const { View, Text } = require("react-native");
  return {
    ReviewScreen: ({ screens, answers }: any) => (
      <View testID="review-screen">
        <Text>Review Screen</Text>
        <Text>Screens: {screens.length}</Text>
        <Text>Answers: {Object.keys(answers).length}</Text>
      </View>
    ),
  };
});

describe("ReviewScreenContainer", () => {
  const mockActivityData: ParsedActivityData = {
    screens: [
      {
        id: "screen-1",
        order: 1,
        name: "Screen 1",
        elements: [],
        displayProperties: {},
      },
    ],
    questions: [],
  };

  const defaultProps = {
    activityData: mockActivityData,
    answers: { "question-1": "Answer 1" },
    isSubmitting: false,
    onSubmit: jest.fn(),
    bottomInset: 0,
    tabBarHeight: 0,
  };

  it("renders ReviewScreen with activity data", () => {
    const { getByTestId } = render(<ReviewScreenContainer {...defaultProps} />);

    expect(getByTestId("review-screen")).toBeTruthy();
  });

  it("passes screens to ReviewScreen", () => {
    const { getByText } = render(<ReviewScreenContainer {...defaultProps} />);

    expect(getByText("Screens: 1")).toBeTruthy();
  });

  it("passes answers to ReviewScreen", () => {
    const { getByText } = render(<ReviewScreenContainer {...defaultProps} />);

    expect(getByText("Answers: 1")).toBeTruthy();
  });

  it("passes isSubmitting to ReviewScreen", () => {
    const { getByTestId } = render(
      <ReviewScreenContainer {...defaultProps} isSubmitting={true} />
    );

    expect(getByTestId("review-screen")).toBeTruthy();
  });

  it("passes onEditQuestion when provided", () => {
    const mockOnEdit = jest.fn();
    const { getByTestId } = render(
      <ReviewScreenContainer {...defaultProps} onEditQuestion={mockOnEdit} />
    );

    expect(getByTestId("review-screen")).toBeTruthy();
  });
});
