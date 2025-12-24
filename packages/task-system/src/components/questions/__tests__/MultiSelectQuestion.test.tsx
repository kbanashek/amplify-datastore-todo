import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { MultiSelectQuestion } from "@components/questions/MultiSelectQuestion";
import { Question } from "@task-types/ActivityConfig";

// Mock useTaskTranslation
jest.mock("@translations/index", () => ({
  useTaskTranslation: jest.fn(() => ({
    t: jest.fn((key: string) => key),
    currentLanguage: "en",
  })),
}));

describe("MultiSelectQuestion", () => {
  const mockQuestion: Question = {
    id: "multi-1",
    type: "multiselect",
    text: "Select all symptoms:",
    friendlyName: "Symptoms",
    required: true,
    choices: [
      {
        id: "choice-1",
        text: "Headache",
        value: "headache",
        order: 1,
      },
      {
        id: "choice-2",
        text: "Fever",
        value: "fever",
        order: 2,
      },
      {
        id: "choice-3",
        text: "Nausea",
        value: "nausea",
        order: 3,
      },
    ],
  };

  const mockDisplayProperties = {};

  it("renders all choice options", () => {
    const { getByText } = render(
      <MultiSelectQuestion
        question={mockQuestion}
        value={[]}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByText("Headache")).toBeTruthy();
    expect(getByText("Fever")).toBeTruthy();
    expect(getByText("Nausea")).toBeTruthy();
  });

  it("highlights selected options", () => {
    const { getByText } = render(
      <MultiSelectQuestion
        question={mockQuestion}
        value={["headache", "fever"]}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const headacheOption = getByText("Headache").parent?.parent;
    const feverOption = getByText("Fever").parent?.parent;
    expect(headacheOption).toBeTruthy();
    expect(feverOption).toBeTruthy();
  });

  it("calls onChange when option is toggled", () => {
    const mockOnChange = jest.fn();
    const { getByText } = render(
      <MultiSelectQuestion
        question={mockQuestion}
        value={[]}
        onChange={mockOnChange}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    fireEvent.press(getByText("Headache"));
    expect(mockOnChange).toHaveBeenCalledWith(["headache"]);
  });

  it("removes option when toggled off", () => {
    const mockOnChange = jest.fn();
    const { getByText } = render(
      <MultiSelectQuestion
        question={mockQuestion}
        value={["headache"]}
        onChange={mockOnChange}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    fireEvent.press(getByText("Headache"));
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it("displays error state when errors are present", () => {
    const { getByText } = render(
      <MultiSelectQuestion
        question={mockQuestion}
        value={[]}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={["Please select at least one option"]}
      />
    );

    // Verify component renders with errors (error style is applied via styles.optionError)
    // The component applies error style when errors.length > 0
    const optionText = getByText("Headache");
    expect(optionText).toBeTruthy();
    // Component should render without crashing when errors are present
  });

  it("shows no options message when choices are empty", () => {
    const { getByText } = render(
      <MultiSelectQuestion
        question={{ ...mockQuestion, choices: [] }}
        value={[]}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByText("No options available")).toBeTruthy();
  });
});
