import { Platform } from "react-native";
import { getFontFamily, getFontStyle } from "../fontUtils";

// Mock Platform
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
  StyleSheet: {
    create: jest.fn(styles => styles),
  },
}));

describe("fontUtils", () => {
  describe("getFontFamily", () => {
    describe("iOS", () => {
      beforeEach(() => {
        (Platform.OS as string) = "ios";
      });

      it("should return Ubuntu-Light for weight 300", () => {
        expect(getFontFamily(300, false)).toBe("Ubuntu-Light");
      });

      it("should return Ubuntu-LightItalic for weight 300 italic", () => {
        expect(getFontFamily(300, true)).toBe("Ubuntu-LightItalic");
      });

      it("should return Ubuntu-Regular for weight 400", () => {
        expect(getFontFamily(400, false)).toBe("Ubuntu-Regular");
      });

      it("should return Ubuntu-Regular for weight 400 italic (no italic variant)", () => {
        expect(getFontFamily(400, true)).toBe("Ubuntu-Regular");
      });

      it("should return Ubuntu-Medium for weight 500", () => {
        expect(getFontFamily(500, false)).toBe("Ubuntu-Medium");
      });

      it("should return Ubuntu-Medium for weight 500 italic (no italic variant)", () => {
        expect(getFontFamily(500, true)).toBe("Ubuntu-Medium");
      });

      it("should return Ubuntu-Bold for weight 800", () => {
        expect(getFontFamily(800, false)).toBe("Ubuntu-Bold");
      });

      it("should return Ubuntu-BoldItalic for weight 800 italic", () => {
        expect(getFontFamily(800, true)).toBe("Ubuntu-BoldItalic");
      });

      it("should return undefined for unknown weight", () => {
        // @ts-expect-error Testing invalid weight
        expect(getFontFamily(600, false)).toBeUndefined();
      });
    });

    describe("Android", () => {
      beforeEach(() => {
        (Platform.OS as string) = "android";
      });

      it("should return Ubuntu-L for weight 300", () => {
        expect(getFontFamily(300, false)).toBe("Ubuntu-L");
      });

      it("should return Ubuntu-LI for weight 300 italic", () => {
        expect(getFontFamily(300, true)).toBe("Ubuntu-LI");
      });

      it("should return Ubuntu-R for weight 400", () => {
        expect(getFontFamily(400, false)).toBe("Ubuntu-R");
      });

      it("should return Ubuntu-R for weight 400 italic (no italic variant)", () => {
        expect(getFontFamily(400, true)).toBe("Ubuntu-R");
      });

      it("should return Ubuntu-M for weight 500", () => {
        expect(getFontFamily(500, false)).toBe("Ubuntu-M");
      });

      it("should return Ubuntu-M for weight 500 italic (no italic variant)", () => {
        expect(getFontFamily(500, true)).toBe("Ubuntu-M");
      });

      it("should return Ubuntu-B for weight 800", () => {
        expect(getFontFamily(800, false)).toBe("Ubuntu-B");
      });

      it("should return Ubuntu-BI for weight 800 italic", () => {
        expect(getFontFamily(800, true)).toBe("Ubuntu-BI");
      });

      it("should return undefined for unknown weight", () => {
        // @ts-expect-error Testing invalid weight
        expect(getFontFamily(600, false)).toBeUndefined();
      });
    });
  });

  describe("getFontStyle", () => {
    describe("iOS", () => {
      beforeEach(() => {
        (Platform.OS as string) = "ios";
      });

      it("should return correct style object for regular text", () => {
        const style = getFontStyle(400, 16, false);
        expect(style).toEqual({
          fontFamily: "Ubuntu-Regular",
          fontSize: 16,
          fontWeight: "400",
        });
      });

      it("should return correct style object for italic text (bold italic)", () => {
        const style = getFontStyle(800, 18, true);
        expect(style).toEqual({
          fontFamily: "Ubuntu-BoldItalic",
          fontSize: 18,
          fontWeight: "800",
        });
      });

      it("should return correct style object for bold text", () => {
        const style = getFontStyle(800, 24, false);
        expect(style).toEqual({
          fontFamily: "Ubuntu-Bold",
          fontSize: 24,
          fontWeight: "800",
        });
      });

      it("should default to non-italic when italic parameter is omitted", () => {
        const style = getFontStyle(400, 16);
        expect(style).toEqual({
          fontFamily: "Ubuntu-Regular",
          fontSize: 16,
          fontWeight: "400",
        });
      });
    });

    describe("Android", () => {
      beforeEach(() => {
        (Platform.OS as string) = "android";
      });

      it("should return correct style object with fontWeight normal", () => {
        const style = getFontStyle(400, 16, false);
        expect(style).toEqual({
          fontFamily: "Ubuntu-R",
          fontSize: 16,
          fontWeight: "normal",
        });
      });

      it("should return correct style object for italic text (bold italic)", () => {
        const style = getFontStyle(800, 18, true);
        expect(style).toEqual({
          fontFamily: "Ubuntu-BI",
          fontSize: 18,
          fontWeight: "normal",
        });
      });

      it("should return correct style object for bold text", () => {
        const style = getFontStyle(800, 24, false);
        expect(style).toEqual({
          fontFamily: "Ubuntu-B",
          fontSize: 24,
          fontWeight: "normal",
        });
      });

      it("should default to non-italic when italic parameter is omitted", () => {
        const style = getFontStyle(400, 16);
        expect(style).toEqual({
          fontFamily: "Ubuntu-R",
          fontSize: 16,
          fontWeight: "normal",
        });
      });
    });
  });
});
