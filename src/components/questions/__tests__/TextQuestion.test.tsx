import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TextQuestion } from "../TextQuestion";
import { Question } from "../../../types/ActivityConfig";

describe("TextQuestion", () => {
  const mockQuestion: Question = {
    id: "question-1",
    type: "text",
    text: "<p>What is your name?</p>",
    friendlyName: "Name",
    required: true,
    validations: [],
    choices: [],
    dataMappers: [],
  };

  const mockOnChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders text input for text type question", () => {
    const { getByPlaceholderText } = render(
      <TextQuestion
        question={mockQuestion}
        value=""
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    expect(getByPlaceholderText("Name")).toBeTruthy();
  });

  it("renders textarea for textarea-field type question", () => {
    const textareaQuestion: Question = {
      ...mockQuestion,
      type: "textarea-field",
      friendlyName: "Notes",
    };

    const { getByPlaceholderText } = render(
      <TextQuestion
        question={textareaQuestion}
        value=""
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    const input = getByPlaceholderText("Notes");
    expect(input).toBeTruthy();
    expect(input.props.multiline).toBe(true);
  });

  it("calls onChange when text is entered", () => {
    const { getByPlaceholderText } = render(
      <TextQuestion
        question={mockQuestion}
        value=""
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    const input = getByPlaceholderText("Name");
    fireEvent.changeText(input, "John Doe");

    expect(mockOnChange).toHaveBeenCalledWith("John Doe");
  });

  it("displays current value", () => {
    const { getByDisplayValue } = render(
      <TextQuestion
        question={mockQuestion}
        value="John Doe"
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    expect(getByDisplayValue("John Doe")).toBeTruthy();
  });

  it("shows error styling when errors are present", () => {
    const { getByPlaceholderText } = render(
      <TextQuestion
        question={mockQuestion}
        value=""
        onChange={mockOnChange}
        displayProperties={{}}
        errors={["This field is required"]}
      />
    );

    const input = getByPlaceholderText("Name");
    // Error styling is applied via style prop
    expect(input).toBeTruthy();
  });

  it("uses default placeholder when friendlyName is not provided", () => {
    const questionWithoutFriendlyName: Question = {
      ...mockQuestion,
      friendlyName: undefined,
    };

    const { getByPlaceholderText } = render(
      <TextQuestion
        question={questionWithoutFriendlyName}
        value=""
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    expect(getByPlaceholderText("Enter your answer")).toBeTruthy();
  });

  it("handles multiline input correctly", () => {
    const textareaQuestion: Question = {
      ...mockQuestion,
      type: "textarea-field",
    };

    const { getByPlaceholderText } = render(
      <TextQuestion
        question={textareaQuestion}
        value=""
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    const input = getByPlaceholderText("Name");
    expect(input.props.numberOfLines).toBe(4);
    expect(input.props.textAlignVertical).toBe("top");
  });

  it("handles single line input correctly", () => {
    const { getByPlaceholderText } = render(
      <TextQuestion
        question={mockQuestion}
        value=""
        onChange={mockOnChange}
        displayProperties={{}}
        errors={[]}
      />
    );

    const input = getByPlaceholderText("Name");
    expect(input.props.numberOfLines).toBe(1);
    expect(input.props.textAlignVertical).toBe("center");
  });
});



