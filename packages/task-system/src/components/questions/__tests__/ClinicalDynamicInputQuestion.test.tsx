import React from "react";
import { AppColors } from "@constants/AppColors";
import { render, fireEvent } from "@testing-library/react-native";
import { ClinicalDynamicInputQuestion } from "@components/questions/ClinicalDynamicInputQuestion";
import { Question } from "@task-types/ActivityConfig";

// Mock useTranslatedText
jest.mock("@hooks/useTranslatedText", () => ({
  useTranslatedText: jest.fn((text: string) => ({
    translatedText: text,
    isTranslating: false,
  })),
}));

describe("ClinicalDynamicInputQuestion", () => {
  const mockQuestion: Question = {
    id: "pulse-1",
    type: "pulse",
    text: "What is your pulse?",
    friendlyName: "Pulse",
    required: true,
  };

  const mockDisplayProperties = {
    type: "pulse",
    unitText: "bpm",
    fieldLabelText: "Pulse Rate",
    others: {
      fieldDisplayStyle: "line",
    },
    bloodPressure: {
      displayType: "line",
    },
  };

  it("renders input field with label", () => {
    const { getByTestId, getByText } = render(
      <ClinicalDynamicInputQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByTestId("clinical-dynamic-input-pulse-1")).toBeTruthy();
    expect(getByText("Pulse Rate")).toBeTruthy();
  });

  it("parses and displays existing value from string", () => {
    const { getByTestId } = render(
      <ClinicalDynamicInputQuestion
        question={mockQuestion}
        value="72"
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const input = getByTestId("clinical-dynamic-input-pulse-1");
    expect(input.props.value).toBe("72");
  });

  it("parses and displays existing value from object", () => {
    const { getByTestId } = render(
      <ClinicalDynamicInputQuestion
        question={mockQuestion}
        value={{ text: "72", unitType: "bpm" }}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const input = getByTestId("clinical-dynamic-input-pulse-1");
    expect(input.props.value).toBe("72");
  });

  it("limits pulse input to 3 characters", () => {
    const { getByTestId } = render(
      <ClinicalDynamicInputQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const input = getByTestId("clinical-dynamic-input-pulse-1");
    fireEvent.changeText(input, "1234");
    expect(input.props.value.length).toBeLessThanOrEqual(3);
  });

  it("updates answer with object format", () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <ClinicalDynamicInputQuestion
        question={mockQuestion}
        value={null}
        onChange={mockOnChange}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const input = getByTestId("clinical-dynamic-input-pulse-1");
    fireEvent.changeText(input, "72");

    expect(mockOnChange).toHaveBeenCalledWith(
      expect.objectContaining({
        text: "72",
        unitType: expect.any(String),
      })
    );
  });

  it("displays error state when errors are present", () => {
    const { getByTestId } = render(
      <ClinicalDynamicInputQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={["Pulse is required"]}
      />
    );

    const input = getByTestId("clinical-dynamic-input-pulse-1");
    expect(input.props.style).toContainEqual(
      expect.objectContaining({ borderColor: AppColors.errorRed })
    );
  });
});
