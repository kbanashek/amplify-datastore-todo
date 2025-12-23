import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { TextQuestion } from "../TextQuestion";
import { Question } from "../../../types/ActivityConfig";

// Mock useTranslatedText
jest.mock("../../../hooks/useTranslatedText", () => ({
  useTranslatedText: jest.fn((text: string) => ({
    translatedText: text,
    isTranslating: false,
  })),
}));

// Mock useTaskTranslation
jest.mock("../../../translations", () => ({
  useTaskTranslation: jest.fn(() => ({
    translate: jest.fn(),
    currentLanguage: "en",
    isRTL: false,
  })),
}));

describe("TextQuestion", () => {
  const mockQuestion: Question = {
    id: "text-1",
    type: "text",
    text: "What is your name?",
    friendlyName: "Name",
    required: true,
  };

  const mockDisplayProperties = {};

  it("renders text input field", () => {
    const { getByPlaceholderText } = render(
      <TextQuestion
        question={mockQuestion}
        value=""
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByPlaceholderText("Name")).toBeTruthy();
  });

  it("displays existing value", () => {
    const { getByDisplayValue } = render(
      <TextQuestion
        question={mockQuestion}
        value="John Doe"
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByDisplayValue("John Doe")).toBeTruthy();
  });

  it("calls onChange when text changes", () => {
    const mockOnChange = jest.fn();
    const { getByPlaceholderText } = render(
      <TextQuestion
        question={mockQuestion}
        value=""
        onChange={mockOnChange}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const input = getByPlaceholderText("Name");
    fireEvent.changeText(input, "John");

    expect(mockOnChange).toHaveBeenCalledWith("John");
  });

  it("renders as textarea for textarea-field type", () => {
    const { getByPlaceholderText } = render(
      <TextQuestion
        question={{ ...mockQuestion, type: "textarea-field" }}
        value=""
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const input = getByPlaceholderText("Name");
    expect(input.props.multiline).toBe(true);
    expect(input.props.numberOfLines).toBe(4);
  });

  it("displays error state when errors are present", () => {
    const { getByPlaceholderText } = render(
      <TextQuestion
        question={mockQuestion}
        value=""
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={["Name is required"]}
      />
    );

    const input = getByPlaceholderText("Name");
    expect(input.props.style).toContainEqual(
      expect.objectContaining({ borderColor: "#e74c3c" })
    );
  });
});
