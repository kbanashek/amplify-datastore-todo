import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { DatePicker } from "@/components/ui/DatePicker";

describe("UI/DatePicker", () => {
  it("renders placeholder when no value is set", () => {
    const { getByText } = render(
      <DatePicker value={null} onChange={() => {}} placeholder="Pick a date" />
    );
    expect(getByText("Pick a date")).toBeTruthy();
  });

  it("opens picker and calls onChange with selected date", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <DatePicker value={null} onChange={onChange} testID="dp" />
    );

    fireEvent.press(getByTestId("dp-button"));
    const picked = new Date("2025-01-02T00:00:00.000Z");
    fireEvent(getByTestId("dp-picker"), "onChange", {}, picked);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as Date).toISOString()).toBe(
      picked.toISOString()
    );
  });
});
