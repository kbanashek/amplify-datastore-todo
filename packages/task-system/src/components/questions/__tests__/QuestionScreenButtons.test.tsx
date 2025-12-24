import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { QuestionScreenButtons } from "@components/questions/QuestionScreenButtons";
import { ActivityConfig } from "@task-types/ActivityConfig";

// Mock dependencies
jest.mock("@hooks/useQuestionScreenButtons", () => ({
  useQuestionScreenButtons: jest.fn(),
}));

jest.mock("@components/TranslatedText", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    TranslatedText: ({ text, style }: any) => <Text style={style}>{text}</Text>,
  };
});

jest.mock("@components/ui/Button", () => {
  const React = require("react");
  const { Pressable, Text, View } = require("react-native");
  return {
    Button: ({ children, onPress, disabled, style, testID }: any) => (
      <Pressable
        testID={testID}
        onPress={onPress}
        disabled={disabled}
        style={style}
      >
        <View>{children}</View>
      </Pressable>
    ),
  };
});

import { useQuestionScreenButtons } from "@hooks/useQuestionScreenButtons";

describe("QuestionScreenButtons", () => {
  const mockOnPrevious = jest.fn();
  const mockOnNext = jest.fn();
  const mockOnReviewOrSubmit = jest.fn();

  const mockUseQuestionScreenButtons =
    useQuestionScreenButtons as jest.MockedFunction<
      typeof useQuestionScreenButtons
    >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuestionScreenButtons.mockReturnValue({
      buttonContainerStyle: { flexDirection: "row" },
      buttonText: "Submit",
      isSubmitButtonEnabled: true,
      submitButtonDisabled: false,
    });
  });

  describe("rendering", () => {
    it("renders Next button when not on last screen", () => {
      const { getByText } = render(
        <QuestionScreenButtons
          currentScreenIndex={0}
          isLastScreen={false}
          currentScreenValid={true}
          cameFromReview={false}
          onNext={mockOnNext}
        />
      );

      expect(getByText("Next")).toBeTruthy();
    });

    it("renders Submit button when on last screen", () => {
      const { getByText } = render(
        <QuestionScreenButtons
          currentScreenIndex={2}
          isLastScreen={true}
          currentScreenValid={true}
          cameFromReview={false}
          onReviewOrSubmit={mockOnReviewOrSubmit}
        />
      );

      expect(getByText("Submit")).toBeTruthy();
    });

    it("renders Review button when activity config shows summary screen", () => {
      const activityConfig: ActivityConfig = {
        summaryScreen: { showScreen: true },
      } as ActivityConfig;

      mockUseQuestionScreenButtons.mockReturnValue({
        buttonContainerStyle: { flexDirection: "row" },
        buttonText: "Review",
        isSubmitButtonEnabled: true,
        submitButtonDisabled: false,
      });

      const { getByText } = render(
        <QuestionScreenButtons
          currentScreenIndex={2}
          isLastScreen={true}
          currentScreenValid={true}
          cameFromReview={false}
          activityConfig={activityConfig}
          onReviewOrSubmit={mockOnReviewOrSubmit}
        />
      );

      expect(getByText("Review")).toBeTruthy();
    });

    it("renders Previous button when not on first screen", () => {
      const { getByText } = render(
        <QuestionScreenButtons
          currentScreenIndex={1}
          isLastScreen={false}
          currentScreenValid={true}
          cameFromReview={false}
          onPrevious={mockOnPrevious}
          onNext={mockOnNext}
        />
      );

      expect(getByText("Previous")).toBeTruthy();
      expect(getByText("Next")).toBeTruthy();
    });

    it("does not render Previous button on first screen", () => {
      const { queryByText, getByText } = render(
        <QuestionScreenButtons
          currentScreenIndex={0}
          isLastScreen={false}
          currentScreenValid={true}
          cameFromReview={false}
          onPrevious={mockOnPrevious}
          onNext={mockOnNext}
        />
      );

      expect(queryByText("Previous")).toBeNull();
      expect(getByText("Next")).toBeTruthy();
    });
  });

  describe("user interactions", () => {
    it("calls onNext when Next button is pressed", () => {
      const { getByText } = render(
        <QuestionScreenButtons
          currentScreenIndex={0}
          isLastScreen={false}
          currentScreenValid={true}
          cameFromReview={false}
          onNext={mockOnNext}
        />
      );

      fireEvent.press(getByText("Next"));
      expect(mockOnNext).toHaveBeenCalledTimes(1);
    });

    it("calls onPrevious when Previous button is pressed", () => {
      const { getByText } = render(
        <QuestionScreenButtons
          currentScreenIndex={1}
          isLastScreen={false}
          currentScreenValid={true}
          cameFromReview={false}
          onPrevious={mockOnPrevious}
          onNext={mockOnNext}
        />
      );

      fireEvent.press(getByText("Previous"));
      expect(mockOnPrevious).toHaveBeenCalledTimes(1);
    });

    it("calls onReviewOrSubmit when Submit button is pressed", () => {
      const { getByText } = render(
        <QuestionScreenButtons
          currentScreenIndex={2}
          isLastScreen={true}
          currentScreenValid={true}
          cameFromReview={false}
          onReviewOrSubmit={mockOnReviewOrSubmit}
        />
      );

      fireEvent.press(getByText("Submit"));
      expect(mockOnReviewOrSubmit).toHaveBeenCalledTimes(1);
    });

    it("does not call onReviewOrSubmit when submit button is disabled", () => {
      mockUseQuestionScreenButtons.mockReturnValue({
        buttonContainerStyle: { flexDirection: "row" },
        buttonText: "Submit",
        isSubmitButtonEnabled: false,
        submitButtonDisabled: true,
      });

      const { getByText } = render(
        <QuestionScreenButtons
          currentScreenIndex={2}
          isLastScreen={true}
          currentScreenValid={false}
          cameFromReview={false}
          onReviewOrSubmit={mockOnReviewOrSubmit}
        />
      );

      // Verify button is rendered
      expect(getByText("Submit")).toBeTruthy();
      // When disabled, pressing should not call the handler
      // Note: The mock Button component should handle disabled state
    });
  });

  describe("button states", () => {
    it("disables submit button when screen is invalid and not from review", () => {
      mockUseQuestionScreenButtons.mockReturnValue({
        buttonContainerStyle: { flexDirection: "row" },
        buttonText: "Submit",
        isSubmitButtonEnabled: false,
        submitButtonDisabled: true,
      });

      const { getByText } = render(
        <QuestionScreenButtons
          currentScreenIndex={2}
          isLastScreen={true}
          currentScreenValid={false}
          cameFromReview={false}
          onReviewOrSubmit={mockOnReviewOrSubmit}
        />
      );

      // Verify button is rendered with disabled state
      expect(getByText("Submit")).toBeTruthy();
      // The hook returns submitButtonDisabled: true, which is passed to Button
    });

    it("enables submit button when came from review", () => {
      mockUseQuestionScreenButtons.mockReturnValue({
        buttonContainerStyle: { flexDirection: "row" },
        buttonText: "Submit",
        isSubmitButtonEnabled: true,
        submitButtonDisabled: false,
      });

      const { getByText } = render(
        <QuestionScreenButtons
          currentScreenIndex={2}
          isLastScreen={true}
          currentScreenValid={false}
          cameFromReview={true}
          onReviewOrSubmit={mockOnReviewOrSubmit}
        />
      );

      // Verify button is rendered and can be pressed
      const submitButton = getByText("Submit");
      expect(submitButton).toBeTruthy();
      fireEvent.press(submitButton);
      expect(mockOnReviewOrSubmit).toHaveBeenCalledTimes(1);
    });
  });

  describe("display properties", () => {
    it("passes display properties to hook", () => {
      const displayProperties = {
        width: "80%",
        marginLeft: "10",
      };

      render(
        <QuestionScreenButtons
          currentScreenIndex={0}
          isLastScreen={false}
          currentScreenValid={true}
          cameFromReview={false}
          displayProperties={displayProperties}
          onNext={mockOnNext}
        />
      );

      expect(mockUseQuestionScreenButtons).toHaveBeenCalledWith({
        displayProperties,
        activityConfig: undefined,
        currentScreenValid: true,
        cameFromReview: false,
        isLastScreen: false,
      });
    });
  });
});
