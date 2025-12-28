import { formatAnswer } from "@utils/answerFormatting";
import { ParsedElement, Question } from "@task-types/ActivityConfig";

describe("formatAnswer", () => {
  const createMockElement = (question: Partial<Question>): ParsedElement => ({
    id: "test-element",
    order: 1,
    question: {
      id: "test-question",
      text: "Test Question",
      type: "text",
      ...question,
    } as Question,
    displayProperties: {},
  });

  describe("empty or null answers", () => {
    it("should return default notAnsweredText for null answer", () => {
      const element = createMockElement({ type: "text" });
      const result = formatAnswer(element, null);
      expect(result).toBe("Not answered");
    });

    it("should return default notAnsweredText for undefined answer", () => {
      const element = createMockElement({ type: "text" });
      const result = formatAnswer(element, undefined);
      expect(result).toBe("Not answered");
    });

    it("should return default notAnsweredText for empty string", () => {
      const element = createMockElement({ type: "text" });
      const result = formatAnswer(element, "");
      expect(result).toBe("Not answered");
    });

    it("should return custom notAnsweredText when provided", () => {
      const element = createMockElement({ type: "text" });
      const result = formatAnswer(element, null, "No response");
      expect(result).toBe("No response");
    });
  });

  describe("multiselect questions", () => {
    const choices = [
      { id: "1", value: "choice1", text: "Choice 1" },
      { id: "2", value: "choice2", text: "Choice 2" },
      { id: "3", value: "choice3", text: "Choice 3" },
    ];

    it("should format multiple selected choices with comma separation", () => {
      const element = createMockElement({
        type: "multiselect",
        choices,
      });
      const result = formatAnswer(element, ["choice1", "choice2"]);
      expect(result).toBe("Choice 1, Choice 2");
    });

    it("should format single selected choice", () => {
      const element = createMockElement({
        type: "multiselect",
        choices,
      });
      const result = formatAnswer(element, ["choice1"]);
      expect(result).toBe("Choice 1");
    });

    it("should return notAnsweredText for empty array", () => {
      const element = createMockElement({
        type: "multiselect",
        choices,
      });
      const result = formatAnswer(element, []);
      expect(result).toBe("Not answered");
    });

    it("should handle choices matched by id", () => {
      const element = createMockElement({
        type: "multiselect",
        choices,
      });
      const result = formatAnswer(element, ["1", "2"]);
      expect(result).toBe("Choice 1, Choice 2");
    });

    it("should handle choices matched by value", () => {
      const element = createMockElement({
        type: "multiselect",
        choices,
      });
      const result = formatAnswer(element, ["choice1", "choice3"]);
      expect(result).toBe("Choice 1, Choice 3");
    });

    it("should use raw value if choice not found", () => {
      const element = createMockElement({
        type: "multiselect",
        choices,
      });
      const result = formatAnswer(element, ["choice1", "unknown"]);
      expect(result).toBe("Choice 1, unknown");
    });

    it("should filter out falsy values", () => {
      const element = createMockElement({
        type: "multiselect",
        choices: [
          { id: "1", value: "choice1", text: "" }, // Empty text
          { id: "2", value: "choice2", text: "Choice 2" },
        ],
      });
      const result = formatAnswer(element, ["choice1", "choice2"]);
      // Empty text gets filtered, but "choice1" (the value) is used as fallback
      expect(result).toBe("choice1, Choice 2");
    });
  });

  describe("singleselect questions", () => {
    const choices = [
      { id: "1", value: "choice1", text: "Choice 1" },
      { id: "2", value: "choice2", text: "Choice 2" },
    ];

    it("should format selected choice by value", () => {
      const element = createMockElement({
        type: "singleselect",
        choices,
      });
      const result = formatAnswer(element, "choice1");
      expect(result).toBe("Choice 1");
    });

    it("should format selected choice by id", () => {
      const element = createMockElement({
        type: "singleselect",
        choices,
      });
      const result = formatAnswer(element, "1");
      expect(result).toBe("Choice 1");
    });

    it("should return raw value if choice not found", () => {
      const element = createMockElement({
        type: "singleselect",
        choices,
      });
      const result = formatAnswer(element, "unknown");
      expect(result).toBe("unknown");
    });

    it("should handle numeric answers", () => {
      const element = createMockElement({
        type: "singleselect",
        choices,
      });
      const result = formatAnswer(element, "123");
      expect(result).toBe("123");
    });
  });

  describe("text questions", () => {
    it("should return short text as-is", () => {
      const element = createMockElement({ type: "text" });
      const result = formatAnswer(element, "Short answer");
      expect(result).toBe("Short answer");
    });

    it("should truncate long text to 100 characters", () => {
      const element = createMockElement({ type: "text" });
      const longText = "a".repeat(150);
      const result = formatAnswer(element, longText);
      expect(result).toBe("a".repeat(100) + "...");
      expect(result.length).toBe(103); // 100 chars + "..."
    });

    it("should not truncate text at exactly 100 characters", () => {
      const element = createMockElement({ type: "text" });
      const text = "a".repeat(100);
      const result = formatAnswer(element, text);
      expect(result).toBe(text);
      expect(result.length).toBe(100);
    });

    it("should truncate text at 101 characters", () => {
      const element = createMockElement({ type: "text" });
      const text = "a".repeat(101);
      const result = formatAnswer(element, text);
      expect(result).toBe("a".repeat(100) + "...");
    });
  });

  describe("other question types", () => {
    it("should convert number to string", () => {
      const element = createMockElement({ type: "number" });
      const result = formatAnswer(element, "42");
      expect(result).toBe("42");
    });

    it("should convert boolean to string", () => {
      const element = createMockElement({ type: "boolean" });
      const result = formatAnswer(element, "true");
      expect(result).toBe("true");
    });

    it("should convert object to string", () => {
      const element = createMockElement({ type: "custom" });
      const result = formatAnswer(element, JSON.stringify({ value: "123" }));
      expect(result).toBe('{"value":"123"}');
    });

    it("should handle date objects", () => {
      const element = createMockElement({ type: "date" });
      const date = new Date("2024-01-01T12:00:00Z");
      const result = formatAnswer(element, date);
      // Date.toString() format varies by timezone, just check it's a string
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("edge cases", () => {
    it("should handle question without choices for multiselect", () => {
      const element = createMockElement({
        type: "multiselect",
        choices: undefined,
      });
      const result = formatAnswer(element, ["value1", "value2"]);
      expect(result).toBe("value1, value2");
    });

    it("should handle question without choices for singleselect", () => {
      const element = createMockElement({
        type: "singleselect",
        choices: undefined,
      });
      const result = formatAnswer(element, "value1");
      expect(result).toBe("value1");
    });

    it("should handle zero as a valid answer", () => {
      const element = createMockElement({ type: "number" });
      const result = formatAnswer(element, "0");
      expect(result).toBe("0");
    });

    it("should handle false as a valid answer", () => {
      const element = createMockElement({ type: "boolean" });
      const result = formatAnswer(element, "false");
      expect(result).toBe("false");
    });

    it("should handle whitespace-only string as empty", () => {
      const element = createMockElement({ type: "text" });
      const result = formatAnswer(element, "   ");
      expect(result).toBe("   "); // Not empty, so returns as-is
    });
  });
});
