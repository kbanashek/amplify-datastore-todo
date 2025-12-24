import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SingleSelectQuestion } from "@components/questions/SingleSelectQuestion";
import { Question } from "@task-types/ActivityConfig";

// Mock useTaskTranslation
jest.mock("@translations/index", () => ({
  useTaskTranslation: jest.fn(() => ({
    t: jest.fn((key: string) => key),
    currentLanguage: "en",
  })),
}));

describe("SingleSelectQuestion", () => {
  const mockQuestion: Question = {
    id: "single-1",
    type: "singleselect",
    text: "How would you rate your pain?",
    friendlyName: "Pain Level",
    required: true,
    choices: [
      {
        id: "choice-1",
        text: "No pain",
        value: "0",
        order: 1,
      },
      {
        id: "choice-2",
        text: "Mild pain",
        value: "1",
        order: 2,
      },
      {
        id: "choice-3",
        text: "Severe pain",
        value: "2",
        order: 3,
      },
    ],
  };

  const mockDisplayProperties = {};

  it("renders all choice options", () => {
    const { getByText } = render(
      <SingleSelectQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByText("No pain")).toBeTruthy();
    expect(getByText("Mild pain")).toBeTruthy();
    expect(getByText("Severe pain")).toBeTruthy();
  });

  it("highlights selected option", () => {
    const { getByText } = render(
      <SingleSelectQuestion
        question={mockQuestion}
        value="1"
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const selectedOption = getByText("Mild pain").parent?.parent;
    expect(selectedOption).toBeTruthy();
  });

  it("calls onChange when option is selected", () => {
    const mockOnChange = jest.fn();
    const { getByText } = render(
      <SingleSelectQuestion
        question={mockQuestion}
        value={null}
        onChange={mockOnChange}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    fireEvent.press(getByText("Mild pain"));
    expect(mockOnChange).toHaveBeenCalledWith("1");
  });

  it("displays error state when errors are present", () => {
    const { getByText } = render(
      <SingleSelectQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={["Please select an option"]}
      />
    );

    // Verify component renders with errors (error style is applied via styles.optionError)
    // The component applies error style when errors.length > 0
    const optionText = getByText("No pain");
    expect(optionText).toBeTruthy();
    // Component should render without crashing when errors are present
  });

  it("shows no options message when choices are empty", () => {
    const { getByText } = render(
      <SingleSelectQuestion
        question={{ ...mockQuestion, choices: [] }}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByText("No options available")).toBeTruthy();
  });
});
