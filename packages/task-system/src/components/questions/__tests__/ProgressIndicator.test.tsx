import { render } from "@testing-library/react-native";
import React from "react";
import { ProgressIndicator } from "@components/questions/ProgressIndicator";

describe("ProgressIndicator", () => {
  it("renders progress text", () => {
    const { getByText } = render(
      <ProgressIndicator currentPage={1} totalPages={5} />
    );

    expect(getByText("Page 1 of 5")).toBeTruthy();
  });

  it("calculates progress bar width correctly", () => {
    const { getByTestId } = render(
      <ProgressIndicator currentPage={2} totalPages={5} />
    );

    const progressFill = getByTestId("progress-fill");
    expect(progressFill).toBeTruthy();
    // 2/5 = 40%
    expect(progressFill.props.style).toContainEqual(
      expect.objectContaining({ width: "40%" })
    );
  });

  it("shows 100% when on last page", () => {
    const { getByTestId } = render(
      <ProgressIndicator currentPage={5} totalPages={5} />
    );

    const progressFill = getByTestId("progress-fill");
    expect(progressFill.props.style).toContainEqual(
      expect.objectContaining({ width: "100%" })
    );
  });

  it("shows 0% when on first page", () => {
    const { getByTestId } = render(
      <ProgressIndicator currentPage={1} totalPages={10} />
    );

    const progressFill = getByTestId("progress-fill");
    expect(progressFill.props.style).toContainEqual(
      expect.objectContaining({ width: "10%" })
    );
  });
});
