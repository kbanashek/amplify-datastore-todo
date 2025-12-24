import { renderHook } from "@testing-library/react-native";
import { useRTL } from "@hooks/useRTL";
import { ViewStyle, TextStyle } from "react-native";
import { createMockTFunction } from "../../MOCKS/translationMocks";
import type { LanguageCode } from "@translations/translationTypes";

// Mock useTaskTranslation hook
const mockUseTaskTranslation = jest.fn();

jest.mock("@translations/index", () => ({
  ...jest.requireActual("../../translations"),
  useTaskTranslation: () => mockUseTaskTranslation(),
}));

describe("useRTL", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("LTR mode", () => {
    beforeEach(() => {
      mockUseTaskTranslation.mockReturnValue({
        t: createMockTFunction("en"),
        i18n: {
          language: "en",
          changeLanguage: jest.fn(),
        },
        ready: true,
        currentLanguage: "en" as LanguageCode,
        setLanguage: jest.fn(),
        isRTL: false,
      });
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
      const rtlStyle = result.current.rtlStyle(style);
      expect(rtlStyle).toEqual(style);
    });

    it("handles createRTLStyles without modification", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = { width: 100, height: 50 };
      const rtlStyle = result.current.rtlStyle(style);
      expect(rtlStyle).toEqual(style);
    });
  });

  describe("RTL mode", () => {
    beforeEach(() => {
      mockUseTaskTranslation.mockReturnValue({
        t: createMockTFunction("ar"),
        i18n: {
          language: "ar",
          changeLanguage: jest.fn(),
        },
        ready: true,
        currentLanguage: "ar" as LanguageCode,
        setLanguage: jest.fn(),
        isRTL: true,
      });
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
      const rtlStyle = result.current.rtlStyle(style);
      expect(rtlStyle.marginLeft).toBe(20);
      expect(rtlStyle.marginRight).toBe(10);
    });

    it("flips paddingLeft and paddingRight", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {
        paddingLeft: 5,
        paddingRight: 15,
      };
      const rtlStyle = result.current.rtlStyle(style);
      expect(rtlStyle.paddingLeft).toBe(15);
      expect(rtlStyle.paddingRight).toBe(5);
    });

    it("flips borderLeftWidth and borderRightWidth", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {
        borderLeftWidth: 1,
        borderRightWidth: 2,
      };
      const rtlStyle = result.current.rtlStyle(style);
      expect(rtlStyle.borderLeftWidth).toBe(2);
      expect(rtlStyle.borderRightWidth).toBe(1);
    });

    it("flips borderTopLeftRadius and borderTopRightRadius", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {
        borderTopLeftRadius: 5,
        borderTopRightRadius: 10,
      };
      const rtlStyle = result.current.rtlStyle(style);
      expect(rtlStyle.borderTopLeftRadius).toBe(10);
      expect(rtlStyle.borderTopRightRadius).toBe(5);
    });

    it("flips borderBottomLeftRadius and borderBottomRightRadius", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {
        borderBottomLeftRadius: 3,
        borderBottomRightRadius: 7,
      };
      const rtlStyle = result.current.rtlStyle(style);
      expect(rtlStyle.borderBottomLeftRadius).toBe(7);
      expect(rtlStyle.borderBottomRightRadius).toBe(3);
    });

    it("flips textAlign left to right", () => {
      const { result } = renderHook(() => useRTL());
      const style: TextStyle = {
        textAlign: "left",
      };
      const rtlStyle = result.current.rtlStyle(style);
      expect((rtlStyle as TextStyle).textAlign).toBe("right");
    });

    it("flips textAlign right to left", () => {
      const { result } = renderHook(() => useRTL());
      const style: TextStyle = {
        textAlign: "right",
      };
      const rtlStyle = result.current.rtlStyle(style);
      expect((rtlStyle as TextStyle).textAlign).toBe("left");
    });

    it("handles createRTLStyles with multiple styles", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {
        marginLeft: 10,
        marginRight: 20,
        paddingLeft: 5,
        paddingRight: 15,
        borderLeftWidth: 1,
        borderRightWidth: 2,
      };
      const rtlStyle = result.current.rtlStyle(style);
      expect(rtlStyle.marginLeft).toBe(20);
      expect(rtlStyle.marginRight).toBe(10);
      expect(rtlStyle.paddingLeft).toBe(15);
      expect(rtlStyle.paddingRight).toBe(5);
      expect(rtlStyle.borderLeftWidth).toBe(2);
      expect(rtlStyle.borderRightWidth).toBe(1);
    });

    it("preserves other style properties", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {
        width: 100,
        height: 50,
        backgroundColor: "red",
        marginLeft: 10,
        marginRight: 20,
      };
      const rtlStyle = result.current.rtlStyle(style);
      expect(rtlStyle.width).toBe(100);
      expect(rtlStyle.height).toBe(50);
      expect(rtlStyle.backgroundColor).toBe("red");
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      mockUseTaskTranslation.mockReturnValue({
        t: createMockTFunction("ar"),
        i18n: {
          language: "ar",
          changeLanguage: jest.fn(),
        },
        ready: true,
        currentLanguage: "ar" as LanguageCode,
        setLanguage: jest.fn(),
        isRTL: true,
      });
    });

    it("handles undefined margin values", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {
        marginLeft: undefined,
        marginRight: 20,
      };
      const rtlStyle = result.current.rtlStyle(style);
      expect(rtlStyle.marginLeft).toBe(20);
      expect(rtlStyle.marginRight).toBeUndefined();
    });

    it("handles undefined padding values", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {
        paddingLeft: 5,
        paddingRight: undefined,
      };
      const rtlStyle = result.current.rtlStyle(style);
      expect(rtlStyle.paddingLeft).toBeUndefined();
      expect(rtlStyle.paddingRight).toBe(5);
    });

    it("handles empty style object", () => {
      const { result } = renderHook(() => useRTL());
      const style: ViewStyle = {};
      const rtlStyle = result.current.rtlStyle(style);
      expect(rtlStyle).toEqual({});
    });
  });
});
