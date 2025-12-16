import { renderHook } from "@testing-library/react-native";
import { useThemeColor } from "../useThemeColor";

// Mock useColorScheme
jest.mock("../useColorScheme", () => ({
  useColorScheme: jest.fn(),
}));

import { useColorScheme } from "../useColorScheme";

// Mock Colors
jest.mock("../../constants/Colors", () => ({
  Colors: {
    light: {
      background: "#ffffff",
      text: "#000000",
      tint: "#007AFF",
    },
    dark: {
      background: "#000000",
      text: "#ffffff",
      tint: "#0A84FF",
    },
  },
}));

describe("useThemeColor", () => {
  const mockUseColorScheme = useColorScheme as jest.MockedFunction<
    typeof useColorScheme
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("light theme", () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue("light");
    });

    it("returns color from props when provided", () => {
      const { result } = renderHook(() =>
        useThemeColor({ light: "#custom-light" }, "background")
      );
      expect(result.current).toBe("#custom-light");
    });

    it("returns color from Colors when not in props", () => {
      const { result } = renderHook(() => useThemeColor({}, "background"));
      expect(result.current).toBe("#ffffff");
    });

    it("prioritizes light prop over Colors", () => {
      const { result } = renderHook(() =>
        useThemeColor({ light: "#custom", dark: "#custom-dark" }, "text")
      );
      expect(result.current).toBe("#custom");
    });
  });

  describe("dark theme", () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue("dark");
    });

    it("returns color from props when provided", () => {
      const { result } = renderHook(() =>
        useThemeColor({ dark: "#custom-dark" }, "background")
      );
      expect(result.current).toBe("#custom-dark");
    });

    it("returns color from Colors when not in props", () => {
      const { result } = renderHook(() => useThemeColor({}, "background"));
      expect(result.current).toBe("#000000");
    });

    it("prioritizes dark prop over Colors", () => {
      const { result } = renderHook(() =>
        useThemeColor({ light: "#custom", dark: "#custom-dark" }, "text")
      );
      expect(result.current).toBe("#custom-dark");
    });
  });

  describe("null theme", () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue(null);
    });

    it("defaults to light theme when null", () => {
      const { result } = renderHook(() => useThemeColor({}, "background"));
      expect(result.current).toBe("#ffffff");
    });
  });

  describe("undefined theme", () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue(undefined);
    });

    it("defaults to light theme when undefined", () => {
      const { result } = renderHook(() => useThemeColor({}, "background"));
      expect(result.current).toBe("#ffffff");
    });
  });

  describe("edge cases", () => {
    beforeEach(() => {
      mockUseColorScheme.mockReturnValue("light");
    });

    it("handles missing color in Colors gracefully", () => {
      const { result } = renderHook(() => useThemeColor({}, "tint" as any));
      expect(result.current).toBe("#007AFF");
    });

    it("handles partial props", () => {
      const { result } = renderHook(() =>
        useThemeColor({ light: "#custom" }, "background")
      );
      expect(result.current).toBe("#custom");
    });
  });
});
