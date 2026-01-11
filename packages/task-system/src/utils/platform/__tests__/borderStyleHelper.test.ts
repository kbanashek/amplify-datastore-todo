import { getBorderStyle, BorderStyleType } from "@utils/platform/borderStyleHelper";
import { StyleSheet } from "react-native";

describe("getBorderStyle", () => {
  const mockStyles = {
    ovalBorder: StyleSheet.create({ container: { borderRadius: 20 } })
      .container,
    rectangleBorder: StyleSheet.create({ container: { borderRadius: 4 } })
      .container,
    lineBorder: StyleSheet.create({ container: { borderBottomWidth: 1 } })
      .container,
  } as any;

  describe("basic style mapping", () => {
    it("should return ovalBorder style for 'oval' type", () => {
      const result = getBorderStyle("oval", mockStyles);
      expect(result).toBe(mockStyles.ovalBorder);
    });

    it("should return rectangleBorder style for 'rectangle' type", () => {
      const result = getBorderStyle("rectangle", mockStyles);
      expect(result).toBe(mockStyles.rectangleBorder);
    });

    it("should return lineBorder style for 'line' type", () => {
      const result = getBorderStyle("line", mockStyles);
      expect(result).toBe(mockStyles.lineBorder);
    });
  });

  describe("default behavior", () => {
    it("should return lineBorder style for undefined", () => {
      const result = getBorderStyle(undefined, mockStyles);
      expect(result).toBe(mockStyles.lineBorder);
    });

    it("should return lineBorder style for empty string", () => {
      const result = getBorderStyle("", mockStyles);
      expect(result).toBe(mockStyles.lineBorder);
    });

    it("should return lineBorder style for unknown type", () => {
      const result = getBorderStyle("unknown", mockStyles);
      expect(result).toBe(mockStyles.lineBorder);
    });

    it("should return lineBorder style for invalid type", () => {
      const result = getBorderStyle("circle", mockStyles);
      expect(result).toBe(mockStyles.lineBorder);
    });
  });

  describe("type safety", () => {
    it("should accept BorderStyleType values", () => {
      const types: BorderStyleType[] = ["oval", "rectangle", "line"];
      types.forEach(type => {
        const result = getBorderStyle(type, mockStyles);
        expect(result).toBeDefined();
      });
    });

    it("should work with different style objects", () => {
      const customStyles = {
        ovalBorder: { borderRadius: 30, borderWidth: 2 },
        rectangleBorder: { borderRadius: 8, borderWidth: 1 },
        lineBorder: { borderBottomWidth: 2 },
      } as any;

      const result = getBorderStyle("oval", customStyles);
      expect(result).toBe(customStyles.ovalBorder);
    });
  });

  describe("edge cases", () => {
    it("should handle case-sensitive strings correctly", () => {
      // Only exact matches should work
      const result1 = getBorderStyle("Oval", mockStyles);
      const result2 = getBorderStyle("OVAL", mockStyles);

      // Both should default to lineBorder since they don't match exactly
      expect(result1).toBe(mockStyles.lineBorder);
      expect(result2).toBe(mockStyles.lineBorder);
    });

    it("should handle whitespace in strings", () => {
      const result = getBorderStyle(" oval ", mockStyles);
      expect(result).toBe(mockStyles.lineBorder); // Doesn't match exactly
    });

    it("should return consistent results for same input", () => {
      const result1 = getBorderStyle("oval", mockStyles);
      const result2 = getBorderStyle("oval", mockStyles);
      expect(result1).toBe(result2);
    });
  });

  describe("all border types", () => {
    it("should handle all three border types correctly in sequence", () => {
      const ovalResult = getBorderStyle("oval", mockStyles);
      const rectangleResult = getBorderStyle("rectangle", mockStyles);
      const lineResult = getBorderStyle("line", mockStyles);

      expect(ovalResult).toBe(mockStyles.ovalBorder);
      expect(rectangleResult).toBe(mockStyles.rectangleBorder);
      expect(lineResult).toBe(mockStyles.lineBorder);

      // All should be different
      expect(ovalResult).not.toBe(rectangleResult);
      expect(rectangleResult).not.toBe(lineResult);
      expect(ovalResult).not.toBe(lineResult);
    });
  });
});
