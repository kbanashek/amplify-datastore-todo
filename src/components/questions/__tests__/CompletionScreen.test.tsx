import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CompletionScreen } from "../CompletionScreen";
import { ActivityConfig } from "../../../types/ActivityConfig";

describe("CompletionScreen", () => {
  const mockOnDone = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders default title and description when not provided", () => {
    const activityConfig: ActivityConfig = {
      layouts: [],
      activityGroups: [],
    };

    const { getByText } = render(
      <CompletionScreen activityConfig={activityConfig} onDone={mockOnDone} />
    );

    expect(getByText("Thank You!")).toBeTruthy();
    expect(
      getByText("Your assessment has been submitted successfully.")
    ).toBeTruthy();
  });

  it("renders custom title and description from activityConfig", () => {
    const activityConfig: ActivityConfig = {
      layouts: [],
      activityGroups: [],
      completionScreen: {
        showScreen: true,
        title: "Assessment Complete!",
        description: "Thank you for completing the assessment.",
      },
    };

    const { getByText } = render(
      <CompletionScreen activityConfig={activityConfig} onDone={mockOnDone} />
    );

    expect(getByText("Assessment Complete!")).toBeTruthy();
    expect(getByText("Thank you for completing the assessment.")).toBeTruthy();
  });

  it("calls onDone when Done button is pressed", () => {
    const activityConfig: ActivityConfig = {
      layouts: [],
      activityGroups: [],
    };

    const { getByText } = render(
      <CompletionScreen activityConfig={activityConfig} onDone={mockOnDone} />
    );

    fireEvent.press(getByText("Done"));
    expect(mockOnDone).toHaveBeenCalledTimes(1);
  });
});
