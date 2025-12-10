import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { IntroductionScreen } from "../IntroductionScreen";
import { ActivityConfig } from "../../../types/ActivityConfig";

describe("IntroductionScreen", () => {
  const mockOnBegin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders default title and description when not provided", () => {
    const activityConfig: ActivityConfig = {
      layouts: [],
      activityGroups: [],
    };

    const { getByText } = render(
      <IntroductionScreen
        activityConfig={activityConfig}
        onBegin={mockOnBegin}
      />
    );

    expect(getByText("Welcome")).toBeTruthy();
    expect(getByText("Please complete all questions.")).toBeTruthy();
  });

  it("renders custom title and description from activityConfig", () => {
    const activityConfig: ActivityConfig = {
      layouts: [],
      activityGroups: [],
      introductionScreen: {
        showScreen: true,
        title: "Welcome to the Assessment",
        description: "This will take 5 minutes to complete.",
        buttonText: "Start Assessment",
      },
    };

    const { getByText } = render(
      <IntroductionScreen
        activityConfig={activityConfig}
        onBegin={mockOnBegin}
      />
    );

    expect(getByText("Welcome to the Assessment")).toBeTruthy();
    expect(getByText("This will take 5 minutes to complete.")).toBeTruthy();
    expect(getByText("Start Assessment")).toBeTruthy();
  });

  it("calls onBegin when begin button is pressed", () => {
    const activityConfig: ActivityConfig = {
      layouts: [],
      activityGroups: [],
      introductionScreen: {
        showScreen: true,
        title: "Welcome",
        description: "Description",
        buttonText: "Begin",
      },
    };

    const { getByText } = render(
      <IntroductionScreen
        activityConfig={activityConfig}
        onBegin={mockOnBegin}
      />
    );

    fireEvent.press(getByText("Begin"));
    expect(mockOnBegin).toHaveBeenCalledTimes(1);
  });

  it("renders default button text when not provided", () => {
    const activityConfig: ActivityConfig = {
      layouts: [],
      activityGroups: [],
      introductionScreen: {
        showScreen: true,
        title: "Welcome",
        description: "Description",
      },
    };

    const { getByText } = render(
      <IntroductionScreen
        activityConfig={activityConfig}
        onBegin={mockOnBegin}
      />
    );

    expect(getByText("Begin")).toBeTruthy();
  });
});

