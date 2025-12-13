import { simpleHash } from "../simpleHash";

describe("simpleHash", () => {
  it("is deterministic for the same input", () => {
    expect(simpleHash("abc")).toBe(simpleHash("abc"));
  });

  it("changes when input changes", () => {
    expect(simpleHash("abc")).not.toBe(simpleHash("abcd"));
  });

  it("returns a non-empty string", () => {
    expect(simpleHash("abc").length).toBeGreaterThan(0);
  });
});
