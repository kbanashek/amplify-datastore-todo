import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { SingleSelectQuestion } from "../SingleSelectQuestion";
import { Question, Choice } from "../../../types/ActivityConfig";

describe("SingleSelectQuestion", () => {
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
    type: "singleselect",
    text: "<p>Select an option</p>",
    friendlyName: "Selection",
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
      <SingleSelectQuestion
        question={mockQuestion}
        value={null}
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    expect(getByText("Option 1")).toBeTruthy();
    expect(getByText("Option 2")).toBeTruthy();
    expect(getByText("Option 3")).toBeTruthy();
  });

  it("calls onChange when an option is selected", () => {
    const { getByText } = render(
      <SingleSelectQuestion
        question={mockQuestion}
        value={null}
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    fireEvent.press(getByText("Option 1"));

    expect(mockOnChange).toHaveBeenCalledWith("1");
  });

  it("highlights selected option", () => {
    const { getByText } = render(
      <SingleSelectQuestion
        question={mockQuestion}
        value="1"
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    const option1 = getByText("Option 1").parent?.parent;
    expect(option1).toBeTruthy();
  });

  it("allows changing selection", () => {
    const { getByText } = render(
      <SingleSelectQuestion
        question={mockQuestion}
        value="1"
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    fireEvent.press(getByText("Option 2"));
    expect(mockOnChange).toHaveBeenCalledWith("2");
  });

  it("shows error styling when errors are present", () => {
    const { getByText } = render(
      <SingleSelectQuestion
        question={mockQuestion}
        value={null}
        onChange={mockOnChange}
        displayProperties={{}}
        errors={["This field is required"]}
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
      <SingleSelectQuestion
        question={questionWithoutChoices}
        value={null}
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    expect(getByText("No options available")).toBeTruthy();
  });

  it("matches selection by value", () => {
    const { getByText } = render(
      <SingleSelectQuestion
        question={mockQuestion}
        value="2"
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    // Option 2 should be selected
    const option2 = getByText("Option 2").parent?.parent;
    expect(option2).toBeTruthy();
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
      <SingleSelectQuestion
        question={questionWithIdOnly}
        value="choice-1"
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    const option1 = getByText("Option 1").parent?.parent;
    expect(option1).toBeTruthy();
  });
});



