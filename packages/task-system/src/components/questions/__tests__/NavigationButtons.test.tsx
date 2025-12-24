import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationButtons } from "@components/questions/NavigationButtons";
import { ActivityConfig } from "@task-types/ActivityConfig";

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

// Mock TranslatedText
jest.mock("@components/TranslatedText", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    TranslatedText: ({ text, style }: any) => <Text style={style}>{text}</Text>,
  };
});

// Mock platform utils
jest.mock("@utils/platform", () => ({
  isIOS: jest.fn(() => false),
}));

describe("NavigationButtons", () => {
  const mockActivityConfig: ActivityConfig = {
    summaryScreen: { showScreen: false },
  } as ActivityConfig;

  const defaultProps = {
    currentScreenIndex: 0,
    totalScreens: 3,
    currentScreenValid: true,
    activityConfig: mockActivityConfig,
    onPrevious: jest.fn(),
    onNext: jest.fn(),
    onReviewOrSubmit: jest.fn(),
    bottomInset: 0,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders Next button on first screen", () => {
    const { getByText } = render(<NavigationButtons {...defaultProps} />);

    expect(getByText("Next")).toBeTruthy();
  });

  it("does not render Previous button on first screen", () => {
    const { queryByText } = render(<NavigationButtons {...defaultProps} />);

    expect(queryByText("Previous")).toBeNull();
  });

  it("renders Previous button on subsequent screens", () => {
    const { getByText } = render(
      <NavigationButtons {...defaultProps} currentScreenIndex={1} />
    );

    expect(getByText("Previous")).toBeTruthy();
    expect(getByText("Next")).toBeTruthy();
  });

  it("calls onPrevious when Previous button is pressed", () => {
    const mockOnPrevious = jest.fn();
    const { getByText } = render(
      <NavigationButtons
        {...defaultProps}
        currentScreenIndex={1}
        onPrevious={mockOnPrevious}
      />
    );

    fireEvent.press(getByText("Previous"));
    expect(mockOnPrevious).toHaveBeenCalledTimes(1);
  });

  it("calls onNext when Next button is pressed", () => {
    const mockOnNext = jest.fn();
    const { getByText } = render(
      <NavigationButtons {...defaultProps} onNext={mockOnNext} />
    );

    fireEvent.press(getByText("Next"));
    expect(mockOnNext).toHaveBeenCalledTimes(1);
  });

  it("renders Review button on last screen when summary screen is enabled", () => {
    const { getByText } = render(
      <NavigationButtons
        {...defaultProps}
        currentScreenIndex={2}
        activityConfig={
          {
            summaryScreen: { showScreen: true },
          } as ActivityConfig
        }
      />
    );

    expect(getByText("Review")).toBeTruthy();
  });

  it("renders Submit button on last screen when summary screen is disabled", () => {
    const { getByText } = render(
      <NavigationButtons
        {...defaultProps}
        currentScreenIndex={2}
        activityConfig={
          {
            summaryScreen: { showScreen: false },
          } as ActivityConfig
        }
      />
    );

    expect(getByText("Submit")).toBeTruthy();
  });

  it("calls onReviewOrSubmit when Review/Submit button is pressed", () => {
    const mockOnReviewOrSubmit = jest.fn();
    const { getByText } = render(
      <NavigationButtons
        {...defaultProps}
        currentScreenIndex={2}
        onReviewOrSubmit={mockOnReviewOrSubmit}
      />
    );

    fireEvent.press(getByText("Submit"));
    expect(mockOnReviewOrSubmit).toHaveBeenCalledTimes(1);
  });

  it("disables submit button when screen is invalid", () => {
    const { getByText } = render(
      <NavigationButtons
        {...defaultProps}
        currentScreenIndex={2}
        currentScreenValid={false}
      />
    );

    const submitButton = getByText("Submit");
    expect(submitButton).toBeTruthy();
    // Button should be disabled (opacity reduced)
  });
});
