import { isAndroid, isIOS, getPlatform } from "@utils/platform";

// Mock Platform module
jest.mock("react-native", () => ({
  Platform: {
    OS: "ios",
  },
}));

describe("platform utilities", () => {
  describe("isAndroid", () => {
    it("returns false when platform is iOS (default mock)", () => {
      expect(isAndroid()).toBe(false);
    });
  });

  describe("isIOS", () => {
    it("returns true when platform is iOS (default mock)", () => {
      expect(isIOS()).toBe(true);
    });
  });

  describe("getPlatform", () => {
    it("returns the current platform OS string", () => {
      expect(getPlatform()).toBe("ios");
    });
  });
});
