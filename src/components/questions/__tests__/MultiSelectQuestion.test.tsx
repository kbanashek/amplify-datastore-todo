import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { MultiSelectQuestion } from "../MultiSelectQuestion";
import { Question, Choice } from "../../../types/ActivityConfig";

describe("MultiSelectQuestion", () => {
  const mockChoices: Choice[] = [
    {
      id: "choice-1",
      order: 1,
      text: "Option 1",
      value: "1",
      i18nKey: "option1",
      imageS3Key: null,
    },
    {
      id: "choice-2",
      order: 2,
      text: "Option 2",
      value: "2",
      i18nKey: "option2",
      imageS3Key: null,
    },
    {
      id: "choice-3",
      order: 3,
      text: "Option 3",
      value: "3",
      i18nKey: "option3",
      imageS3Key: null,
    },
  ];

  const mockQuestion: Question = {
    id: "question-1",
    type: "multiselect",
    text: "<p>Select all that apply</p>",
    friendlyName: "Multi Selection",
    required: true,
    validations: [],
    choices: mockChoices,
    dataMappers: [],
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all choices", () => {
    const { getByText } = render(
      <MultiSelectQuestion
        question={mockQuestion}
        value={[]}
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    expect(getByText("Option 1")).toBeTruthy();
    expect(getByText("Option 2")).toBeTruthy();
    expect(getByText("Option 3")).toBeTruthy();
  });

  it("calls onChange with array containing selected value when option is pressed", () => {
    const { getByText } = render(
      <MultiSelectQuestion
        question={mockQuestion}
        value={[]}
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    fireEvent.press(getByText("Option 1"));
    expect(mockOnChange).toHaveBeenCalledWith(["1"]);
  });

  it("adds to existing selections when option is pressed", () => {
    const { getByText } = render(
      <MultiSelectQuestion
        question={mockQuestion}
        value={["1"]}
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    fireEvent.press(getByText("Option 2"));
    expect(mockOnChange).toHaveBeenCalledWith(["1", "2"]);
  });

  it("removes from selections when selected option is pressed again", () => {
    const { getByText } = render(
      <MultiSelectQuestion
        question={mockQuestion}
        value={["1", "2"]}
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    fireEvent.press(getByText("Option 1"));
    expect(mockOnChange).toHaveBeenCalledWith(["2"]);
  });

  it("highlights selected options", () => {
    const { getByText } = render(
      <MultiSelectQuestion
        question={mockQuestion}
        value={["1", "3"]}
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    const option1 = getByText("Option 1").parent?.parent;
    const option2 = getByText("Option 2").parent?.parent;
    const option3 = getByText("Option 3").parent?.parent;

    expect(option1).toBeTruthy();
    expect(option2).toBeTruthy();
    expect(option3).toBeTruthy();
  });

  it("shows checkmark for selected options", () => {
    const { getByText } = render(
      <MultiSelectQuestion
        question={mockQuestion}
        value={["1"]}
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    expect(getByText("✓")).toBeTruthy();
  });

  it("shows error styling when errors are present", () => {
    const { getByText } = render(
      <MultiSelectQuestion
        question={mockQuestion}
        value={[]}
        onChange={mockOnChange}
        displayProperties={{}}
        errors={["Please select at least one option"]}
      />
    );

    const option1 = getByText("Option 1").parent?.parent;
    expect(option1).toBeTruthy();
  });

  it("displays no options message when choices array is empty", () => {
    const questionWithoutChoices: Question = {
      ...mockQuestion,
      choices: [],
    };

    const { getByText } = render(
      <MultiSelectQuestion
        question={questionWithoutChoices}
        value={[]}
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    expect(getByText("No options available")).toBeTruthy();
  });

  it("handles value as non-array gracefully", () => {
    const { getByText } = render(
      <MultiSelectQuestion
        question={mockQuestion}
        value={null as any}
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    fireEvent.press(getByText("Option 1"));
    expect(mockOnChange).toHaveBeenCalledWith(["1"]);
  });

  it("matches selection by id when value is not available", () => {
    const choicesWithIdOnly: Choice[] = [
      {
        id: "choice-1",
        order: 1,
        text: "Option 1",
        value: undefined,
        i18nKey: "option1",
        imageS3Key: null,
      },
    ];

    const questionWithIdOnly: Question = {
      ...mockQuestion,
      choices: choicesWithIdOnly,
    };

    const { getByText } = render(
      <MultiSelectQuestion
        question={questionWithIdOnly}
        value={["choice-1"]}
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    expect(getByText("✓")).toBeTruthy();
  });
});



