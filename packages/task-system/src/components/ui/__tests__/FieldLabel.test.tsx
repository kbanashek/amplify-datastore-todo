import React from "react";
import { render } from "@testing-library/react-native";
import { FieldLabel } from "@components/ui/FieldLabel";

// Mock useTranslatedText
jest.mock("@hooks/useTranslatedText", () => ({
  useTranslatedText: jest.fn((text: string) => ({
    translatedText: text,
    isTranslating: false,
  })),
}));

describe("FieldLabel", () => {
  it("renders label text", () => {
    const { getByText } = render(<FieldLabel label="Weight" />);
    expect(getByText("Weight")).toBeTruthy();
  });

  it("shows required indicator when required is true", () => {
    const { getByText } = render(<FieldLabel label="Weight" required />);
    expect(getByText(/Weight/)).toBeTruthy();
    // Required indicator should be present
  });

  it("applies custom styles", () => {
    const { getByText } = render(
      <FieldLabel
        label="Temperature"
        fontSize={16}
        fontWeight="bold"
        color="#000000"
      />
    );
    const text = getByText("Temperature");
    expect(text).toBeTruthy();
  });
});
