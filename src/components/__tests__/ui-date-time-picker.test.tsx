import React from "react";
import { fireEvent, render } from "@testing-library/react-native";

import { DateTimePicker } from "@/components/ui/DateTimePicker";

describe("UI/DateTimePicker", () => {
  it("renders placeholder when no value is set", () => {
    const { getByText } = render(
      <DateTimePicker
        value={null}
        onChange={() => {}}
        placeholder="Pick date/time"
      />
    );
    expect(getByText("Pick date/time")).toBeTruthy();
  });

  it("opens picker and calls onChange with selected datetime", () => {
    const onChange = jest.fn();
    const { getByTestId } = render(
      <DateTimePicker value={null} onChange={onChange} testID="dtp" />
    );

    fireEvent.press(getByTestId("dtp-button"));
    const picked = new Date("2025-01-02T10:30:00.000Z");
    fireEvent(getByTestId("dtp-picker"), "onChange", {}, picked);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect((onChange.mock.calls[0][0] as Date).toISOString()).toBe(
      picked.toISOString()
    );
  });
});
