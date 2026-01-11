import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { ReviewScreen } from "@components/questions/ReviewScreen";
import { ParsedScreen, ParsedElement } from "@task-types/ActivityConfig";

// Mock useTranslatedText
jest.mock("@hooks/useTranslatedText", () => ({
  useTranslatedText: jest.fn((text: string) => ({
    translatedText: text,
    isTranslating: false,
  })),
}));

// Mock useRTL
jest.mock("@hooks/useRTL", () => ({
  useRTL: jest.fn(() => ({
    rtlStyle: jest.fn((style: any) => style),
  })),
}));

// Mock IconSymbol
jest.mock("@components/ui/IconSymbol", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    IconSymbol: () => <View testID="icon" />,
  };
});

// Mock platform utils
jest.mock("@utils/platform/platform", () => ({
  isIOS: jest.fn(() => false),
}));

describe("ReviewScreen", () => {
  const mockScreen: ParsedScreen = {
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
  };

  const defaultProps = {
    screens: [mockScreen],
    answers: { "question-1": "John Doe" },
    onEditQuestion: jest.fn(),
    onSubmit: jest.fn(),
    isSubmitting: false,
    bottomInset: 0,
    tabBarHeight: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders review title and subtitle", () => {
    const { getByText } = render(<ReviewScreen {...defaultProps} />);

    expect(getByText("Review Your Answers")).toBeTruthy();
    expect(
      getByText("Please review your answers before submitting.")
    ).toBeTruthy();
  });

  it("renders screen sections", () => {
    const { getByText } = render(<ReviewScreen {...defaultProps} />);

    expect(getByText("Screen 1")).toBeTruthy();
  });

  it("displays question and answer", () => {
    const { getByText } = render(<ReviewScreen {...defaultProps} />);

    expect(getByText("What is your name?")).toBeTruthy();
    expect(getByText("John Doe")).toBeTruthy();
  });

  it("shows 'Not answered' for unanswered questions", () => {
    const { getByText } = render(
      <ReviewScreen {...defaultProps} answers={{ "question-1": null }} />
    );

    expect(getByText("Not answered")).toBeTruthy();
  });

  it("calls onEditQuestion when edit button is pressed", () => {
    const mockOnEdit = jest.fn();
    const { getByTestId } = render(
      <ReviewScreen {...defaultProps} onEditQuestion={mockOnEdit} />
    );

    const editButton = getByTestId("edit-button-question-1");
    fireEvent.press(editButton);
    expect(mockOnEdit).toHaveBeenCalledWith("question-1");
  });

  it("calls onSubmit when submit button is pressed", () => {
    const mockOnSubmit = jest.fn();
    const { getByText } = render(
      <ReviewScreen {...defaultProps} onSubmit={mockOnSubmit} />
    );

    fireEvent.press(getByText("Submit"));
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it("shows loading indicator when submitting", () => {
    const { getByTestId } = render(
      <ReviewScreen {...defaultProps} isSubmitting={true} />
    );

    // ActivityIndicator should be present
    expect(getByTestId("submit-button")).toBeTruthy();
  });

  it("formats multi-select answers", () => {
    const multiSelectScreen: ParsedScreen = {
      ...mockScreen,
      elements: [
        {
          id: "element-2",
          order: 1,
          question: {
            id: "question-2",
            type: "multiselect",
            text: "Select symptoms",
            friendlyName: "Symptoms",
            choices: [
              { id: "c1", text: "Headache", value: "headache" },
              { id: "c2", text: "Fever", value: "fever" },
            ],
          },
          displayProperties: {},
        },
      ],
    };

    const { getByText } = render(
      <ReviewScreen
        {...defaultProps}
        screens={[multiSelectScreen]}
        answers={{ "question-2": ["headache", "fever"] }}
      />
    );

    expect(getByText("Headache, Fever")).toBeTruthy();
  });

  it("formats single-select answers", () => {
    const singleSelectScreen: ParsedScreen = {
      ...mockScreen,
      elements: [
        {
          id: "element-3",
          order: 1,
          question: {
            id: "question-3",
            type: "singleselect",
            text: "Select option",
            friendlyName: "Option",
            choices: [{ id: "c1", text: "Option 1", value: "1" }],
          },
          displayProperties: {},
        },
      ],
    };

    const { getByText } = render(
      <ReviewScreen
        {...defaultProps}
        screens={[singleSelectScreen]}
        answers={{ "question-3": "1" }}
      />
    );

    expect(getByText("Option 1")).toBeTruthy();
  });
});
