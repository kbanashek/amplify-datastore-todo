import React from "react";
import { AppColors } from "@constants/AppColors";
import { render, fireEvent } from "@testing-library/react-native";
import { NumericInput } from "@components/ui/NumericInput";

describe("NumericInput", () => {
  it("renders input field", () => {
    const { getByPlaceholderText } = render(
      <NumericInput value="" onChange={() => {}} />
    );
    expect(getByPlaceholderText("---")).toBeTruthy();
  });

  it("calls onChange when text changes", () => {
    const mockOnChange = jest.fn();
    const { getByPlaceholderText } = render(
      <NumericInput value="" onChange={mockOnChange} />
    );

    const input = getByPlaceholderText("---");
    fireEvent.changeText(input, "123");

    expect(mockOnChange).toHaveBeenCalledWith("123");
  });

  it("applies error style when error is true", () => {
    const { getByPlaceholderText } = render(
      <NumericInput value="" onChange={() => {}} error />
    );

    const input = getByPlaceholderText("---");
    expect(input.props.style).toContainEqual(
      expect.objectContaining({ borderColor: AppColors.errorRed })
    );
  });

  it("applies different border styles", () => {
    const { getByPlaceholderText, rerender } = render(
      <NumericInput value="" onChange={() => {}} borderStyle="rectangle" />
    );

    let input = getByPlaceholderText("---");
    expect(input.props.style).toContainEqual(
      expect.objectContaining({ borderWidth: 1 })
    );

    rerender(<NumericInput value="" onChange={() => {}} borderStyle="oval" />);
    input = getByPlaceholderText("---");
    expect(input.props.style).toContainEqual(
      expect.objectContaining({ borderRadius: 20 })
    );
  });
});
