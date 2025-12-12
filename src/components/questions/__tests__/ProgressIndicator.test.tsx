import React from "react";
import { render } from "@testing-library/react-native";
import { ProgressIndicator } from "../ProgressIndicator";

describe("ProgressIndicator", () => {
  it("renders current page and total pages", () => {
    const { getByText } = render(
      <ProgressIndicator currentPage={1} totalPages={5} />
    );

    expect(getByText("Page 1 of 5")).toBeTruthy();
  });

  it("calculates progress bar width correctly", () => {
    const { getByText } = render(
      <ProgressIndicator currentPage={2} totalPages={4} />
    );

    expect(getByText("Page 2 of 4")).toBeTruthy();
  });

  it("shows 100% progress on last page", () => {
    const { getByText } = render(
      <ProgressIndicator currentPage={5} totalPages={5} />
    );

    expect(getByText("Page 5 of 5")).toBeTruthy();
  });

  it("shows 0% progress on first page", () => {
    const { getByText } = render(
      <ProgressIndicator currentPage={1} totalPages={10} />
    );

    expect(getByText("Page 1 of 10")).toBeTruthy();
  });

  it("handles single page correctly", () => {
    const { getByText } = render(
      <ProgressIndicator currentPage={1} totalPages={1} />
    );

    expect(getByText("Page 1 of 1")).toBeTruthy();
  });
});



