import { renderHook } from "@testing-library/react-native";
import { useRTL } from "../useRTL";
import { ViewStyle, TextStyle } from "react-native";

// Mock TranslationContext
jest.mock("../../contexts/TranslationContext", () => ({
  useTranslation: jest.fn(),
}));

import { useTranslation } from "../../contexts/TranslationContext";

describe("useRTL", () => {
  const mockUseTranslation = useTranslation as jest.MockedFunction<
    typeof useTranslation
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("LTR mode", () => {
    beforeEach(() => {
      mockUseTranslation.mockReturnValue({
        isRTL: false,
        currentLanguage: "en",
        setLanguage: jest.fn(),
        translate: jest.fn(async (text: string) => text),
        translateSync: (text: string) => text,
        isTranslating: false,
        supportedLanguages: [],
        translationService: {
          translateText: jest.fn(async (text: string) => text),
          translateBatch: jest.fn(async (texts: string[]) => texts),
        },
      } as any);
    });

    it("returns isRTL as false", () => {
      const { result } = renderHook(() => useRTL());
      expect(result.current.isRTL).toBe(false);
    });

    it("returns style unchanged when not RTL", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {
        marginLeft: 10,
        marginRight: 20,
        paddingLeft: 5,
        paddingRight: 15,
      };
      const flipped = result.current.rtlStyle(style);
      expect(flipped).toEqual(style);
    });

    it("handles createRTLStyles without modification", () => {
      const { result } = renderHook(() => useRTL());
      const styles = {
        container: { marginLeft: 10 } as ViewStyle,
        text: { paddingRight: 20 } as TextStyle,
      };
      const rtlStyles = result.current.createRTLStyles(styles);
      expect(rtlStyles).toEqual(styles);
    });
  });

  describe("RTL mode", () => {
    beforeEach(() => {
      mockUseTranslation.mockReturnValue({
        isRTL: true,
        currentLanguage: "ar",
        setLanguage: jest.fn(),
        translate: jest.fn(async (text: string) => text),
        translateSync: (text: string) => text,
        isTranslating: false,
        supportedLanguages: [],
        translationService: {
          translateText: jest.fn(async (text: string) => text),
          translateBatch: jest.fn(async (texts: string[]) => texts),
        },
      } as any);
    });

    it("returns isRTL as true", () => {
      const { result } = renderHook(() => useRTL());
      expect(result.current.isRTL).toBe(true);
    });

    it("flips marginLeft and marginRight", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {
        marginLeft: 10,
        marginRight: 20,
      };
      const flipped = result.current.rtlStyle(style) as ViewStyle;
      expect(flipped.marginLeft).toBe(20);
      expect(flipped.marginRight).toBe(10);
    });

    it("flips paddingLeft and paddingRight", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {
        paddingLeft: 5,
        paddingRight: 15,
      };
      const flipped = result.current.rtlStyle(style) as ViewStyle;
      expect(flipped.paddingLeft).toBe(15);
      expect(flipped.paddingRight).toBe(5);
    });

    it("flips borderLeftWidth and borderRightWidth", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {
        borderLeftWidth: 1,
        borderRightWidth: 2,
      };
      const flipped = result.current.rtlStyle(style) as ViewStyle;
      expect(flipped.borderLeftWidth).toBe(2);
      expect(flipped.borderRightWidth).toBe(1);
    });

    it("flips borderTopLeftRadius and borderTopRightRadius", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {
        borderTopLeftRadius: 5,
        borderTopRightRadius: 10,
      };
      const flipped = result.current.rtlStyle(style) as ViewStyle;
      expect(flipped.borderTopLeftRadius).toBe(10);
      expect(flipped.borderTopRightRadius).toBe(5);
    });

    it("flips borderBottomLeftRadius and borderBottomRightRadius", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {
        borderBottomLeftRadius: 3,
        borderBottomRightRadius: 7,
      };
      const flipped = result.current.rtlStyle(style) as ViewStyle;
      expect(flipped.borderBottomLeftRadius).toBe(7);
      expect(flipped.borderBottomRightRadius).toBe(3);
    });

    it("flips textAlign left to right", () => {
      const { result } = renderHook(() => useRTL());
      const style: TextStyle = {
        textAlign: "left",
      };
      const flipped = result.current.rtlStyle(style) as TextStyle;
      expect(flipped.textAlign).toBe("right");
    });

    it("flips textAlign right to left", () => {
      const { result } = renderHook(() => useRTL());
      const style: TextStyle = {
        textAlign: "right",
      };
      const flipped = result.current.rtlStyle(style) as TextStyle;
      expect(flipped.textAlign).toBe("left");
    });

    it("handles createRTLStyles with multiple styles", () => {
      const { result } = renderHook(() => useRTL());
      const styles = {
        container: {
          marginLeft: 10,
          marginRight: 20,
        } as ViewStyle,
        text: {
          paddingLeft: 5,
          paddingRight: 15,
          textAlign: "left" as const,
        } as TextStyle,
      };
      const rtlStyles = result.current.createRTLStyles(styles);
      expect(rtlStyles.container.marginLeft).toBe(20);
      expect(rtlStyles.container.marginRight).toBe(10);
      expect(rtlStyles.text.paddingLeft).toBe(15);
      expect(rtlStyles.text.paddingRight).toBe(5);
      expect(rtlStyles.text.textAlign).toBe("right");
    });

    it("preserves other style properties", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {
        marginLeft: 10,
        marginRight: 20,
        backgroundColor: "red",
        width: 100,
        height: 50,
      };
      const flipped = result.current.rtlStyle(style) as ViewStyle;
      expect(flipped.backgroundColor).toBe("red");
      expect(flipped.width).toBe(100);
      expect(flipped.height).toBe(50);
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      mockUseTranslation.mockReturnValue({
        isRTL: true,
        currentLanguage: "ar",
        setLanguage: jest.fn(),
        translate: jest.fn(async (text: string) => text),
        translateSync: (text: string) => text,
        isTranslating: false,
        supportedLanguages: [],
        translationService: {
          translateText: jest.fn(async (text: string) => text),
          translateBatch: jest.fn(async (texts: string[]) => texts),
        },
      } as any);
    });

    it("handles undefined margin values", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {
        marginLeft: 10,
      };
      const flipped = result.current.rtlStyle(style) as ViewStyle;
      expect(flipped.marginLeft).toBeUndefined();
      expect(flipped.marginRight).toBe(10);
    });

    it("handles undefined padding values", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {
        paddingRight: 15,
      };
      const flipped = result.current.rtlStyle(style) as ViewStyle;
      expect(flipped.paddingLeft).toBe(15);
      expect(flipped.paddingRight).toBeUndefined();
    });

    it("handles empty style object", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {};
      const flipped = result.current.rtlStyle(style);
      expect(flipped).toEqual({});
    });
  });
});
