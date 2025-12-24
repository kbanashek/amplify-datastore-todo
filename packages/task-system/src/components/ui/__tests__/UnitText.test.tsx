import React from "react";
import { render } from "@testing-library/react-native";
import { UnitText } from "@components/ui/UnitText";

// Mock useTranslatedText
jest.mock("@hooks/useTranslatedText", () => ({
  useTranslatedText: jest.fn((text: string) => ({
    translatedText: text,
    isTranslating: false,
  })),
}));

describe("UnitText", () => {
  it("renders unit text", () => {
    const { getByText } = render(<UnitText unit="kg" />);
    expect(getByText("kg")).toBeTruthy();
  });

  it("applies custom styles", () => {
    const { getByText } = render(
      <UnitText unit="mmHg" fontSize={16} fontWeight="bold" color="#000000" />
    );
    const text = getByText("mmHg");
    expect(text).toBeTruthy();
  });
});
