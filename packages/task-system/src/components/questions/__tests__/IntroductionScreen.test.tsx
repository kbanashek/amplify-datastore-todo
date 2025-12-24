import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { IntroductionScreen } from "@components/questions/IntroductionScreen";
import { ActivityConfig } from "@task-types/ActivityConfig";
import { TaskStatus } from "@task-types/Task";

// Mock useTranslatedText
jest.mock("@hooks/useTranslatedText", () => ({
  useTranslatedText: jest.fn((text: string) => ({
    translatedText: text,
    isTranslating: false,
  })),
}));

describe("IntroductionScreen", () => {
  const mockActivityConfig: ActivityConfig = {
    introductionScreen: {
      showScreen: true,
      title: "Welcome",
      description: "Please complete all questions.",
      buttonText: "Begin",
    },
  } as ActivityConfig;

  it("renders introduction screen with title and description", () => {
    const { getByText } = render(
      <IntroductionScreen
        activityConfig={mockActivityConfig}
        onBegin={() => {}}
      />
    );

    expect(getByText("Welcome")).toBeTruthy();
    expect(getByText("Please complete all questions.")).toBeTruthy();
  });

  it("renders begin button", () => {
    const { getByText } = render(
      <IntroductionScreen
        activityConfig={mockActivityConfig}
        onBegin={() => {}}
      />
    );

    expect(getByText("Begin")).toBeTruthy();
  });

  it("calls onBegin when button is pressed", () => {
    const mockOnBegin = jest.fn();
    const { getByText } = render(
      <IntroductionScreen
        activityConfig={mockActivityConfig}
        onBegin={mockOnBegin}
      />
    );

    fireEvent.press(getByText("Begin"));
    expect(mockOnBegin).toHaveBeenCalledTimes(1);
  });

  it("shows resume button when task is started", () => {
    const mockTask = {
      status: TaskStatus.STARTED,
    };

    const { getByText } = render(
      <IntroductionScreen
        activityConfig={mockActivityConfig}
        onBegin={() => {}}
        task={mockTask as any}
      />
    );

    expect(getByText("RESUME")).toBeTruthy();
  });

  it("shows resume button when task is in progress", () => {
    const mockTask = {
      status: TaskStatus.INPROGRESS,
    };

    const { getByText } = render(
      <IntroductionScreen
        activityConfig={mockActivityConfig}
        onBegin={() => {}}
        task={mockTask as any}
      />
    );

    expect(getByText("RESUME")).toBeTruthy();
  });

  it("uses default values when config is missing", () => {
    const { getByText } = render(
      <IntroductionScreen
        activityConfig={{} as ActivityConfig}
        onBegin={() => {}}
      />
    );

    expect(getByText("Welcome")).toBeTruthy();
    expect(getByText("Please complete all questions.")).toBeTruthy();
  });
});
