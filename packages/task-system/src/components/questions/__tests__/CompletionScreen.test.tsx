import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { CompletionScreen } from "@components/questions/CompletionScreen";
import { ActivityConfig } from "@task-types/ActivityConfig";

describe("CompletionScreen", () => {
  const mockActivityConfig: ActivityConfig = {
    completionScreen: {
      showScreen: true,
      title: "Thank You!",
      description: "Your assessment has been submitted successfully.",
    },
  } as ActivityConfig;

  it("renders completion screen with title and description", () => {
    const { getByText } = render(
      <CompletionScreen activityConfig={mockActivityConfig} onDone={() => {}} />
    );

    expect(getByText("Thank You!")).toBeTruthy();
    expect(
      getByText("Your assessment has been submitted successfully.")
    ).toBeTruthy();
  });

  it("renders done button", () => {
    const { getByText } = render(
      <CompletionScreen activityConfig={mockActivityConfig} onDone={() => {}} />
    );

    expect(getByText("Done")).toBeTruthy();
  });

  it("calls onDone when button is pressed", () => {
    const mockOnDone = jest.fn();
    const { getByText } = render(
      <CompletionScreen
        activityConfig={mockActivityConfig}
        onDone={mockOnDone}
      />
    );

    fireEvent.press(getByText("Done"));
    expect(mockOnDone).toHaveBeenCalledTimes(1);
  });

  it("uses default values when config is missing", () => {
    const { getByText } = render(
      <CompletionScreen
        activityConfig={{} as ActivityConfig}
        onDone={() => {}}
      />
    );

    expect(getByText("Thank You!")).toBeTruthy();
    expect(
      getByText("Your assessment has been submitted successfully.")
    ).toBeTruthy();
  });
});
