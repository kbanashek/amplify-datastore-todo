import React from "react";
import { AppColors } from "@constants/AppColors";
import { render, fireEvent } from "@testing-library/react-native";
import { BloodPressureQuestion } from "@components/questions/BloodPressureQuestion";
import { Question } from "@task-types/ActivityConfig";

// Mock useTranslatedText
jest.mock("@hooks/useTranslatedText", () => ({
  useTranslatedText: jest.fn((text: string) => ({
    translatedText: text,
    isTranslating: false,
  })),
}));

describe("BloodPressureQuestion", () => {
  const mockQuestion: Question = {
    id: "bp-1",
    type: "bloodPressure",
    text: "What is your blood pressure?",
    friendlyName: "Blood Pressure",
    required: true,
  };

  const mockDisplayProperties = {
    bloodPressure: {
      displayType: "line",
      leftLabeli18nKey: "Systolic",
      rightLabeli18nKey: "Diastolic",
      uniti18nKey: "mmHg",
    },
  };

  it("renders systolic and diastolic input fields", () => {
    const { getByTestId } = render(
      <BloodPressureQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    expect(getByTestId("blood-pressure-systolic-bp-1")).toBeTruthy();
    expect(getByTestId("blood-pressure-diastolic-bp-1")).toBeTruthy();
  });

  it("parses and displays existing value", () => {
    const { getByTestId } = render(
      <BloodPressureQuestion
        question={mockQuestion}
        value="120/80 mmHg"
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const systolicInput = getByTestId("blood-pressure-systolic-bp-1");
    const diastolicInput = getByTestId("blood-pressure-diastolic-bp-1");

    expect(systolicInput.props.value).toBe("120");
    expect(diastolicInput.props.value).toBe("80");
  });

  it("updates answer when values change", () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <BloodPressureQuestion
        question={mockQuestion}
        value={null}
        onChange={mockOnChange}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const systolicInput = getByTestId("blood-pressure-systolic-bp-1");
    const diastolicInput = getByTestId("blood-pressure-diastolic-bp-1");

    fireEvent.changeText(systolicInput, "120");
    fireEvent.changeText(diastolicInput, "80");

    // Should call onChange with formatted answer
    expect(mockOnChange).toHaveBeenCalled();
  });

  it("only accepts numeric input", () => {
    const mockOnChange = jest.fn();
    const { getByTestId } = render(
      <BloodPressureQuestion
        question={mockQuestion}
        value={null}
        onChange={mockOnChange}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const systolicInput = getByTestId("blood-pressure-systolic-bp-1");
    fireEvent.changeText(systolicInput, "abc123");

    // Should only contain numbers
    expect(systolicInput.props.value).toBe("123");
  });

  it("limits input to 3 characters", () => {
    const { getByTestId } = render(
      <BloodPressureQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={[]}
      />
    );

    const systolicInput = getByTestId("blood-pressure-systolic-bp-1");
    fireEvent.changeText(systolicInput, "1234");

    expect(systolicInput.props.value.length).toBeLessThanOrEqual(3);
  });

  it("displays error state when errors are present", () => {
    const { getByTestId } = render(
      <BloodPressureQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={mockDisplayProperties}
        errors={["Blood pressure is required"]}
      />
    );

    const systolicInput = getByTestId("blood-pressure-systolic-bp-1");
    expect(systolicInput.props.style).toContainEqual(
      expect.objectContaining({ borderColor: AppColors.errorRed })
    );
  });

  it("renders different border styles based on displayType", () => {
    const { getByTestId, rerender } = render(
      <BloodPressureQuestion
        question={mockQuestion}
        value={null}
        onChange={() => {}}
        displayProperties={{
          bloodPressure: {
            ...mockDisplayProperties.bloodPressure,
            displayType: "rectangle",
          },
        }}
        errors={[]}
      />
    );

    const systolicInput = getByTestId("blood-pressure-systolic-bp-1");
    expect(systolicInput.props.style).toContainEqual(
      expect.objectContaining({ borderWidth: 1 })
    );
  });
});
