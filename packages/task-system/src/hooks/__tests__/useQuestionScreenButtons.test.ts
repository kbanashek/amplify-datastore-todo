import { renderHook } from "@testing-library/react-native";
import { useQuestionScreenButtons } from "../useQuestionScreenButtons";
import { ActivityConfig } from "../../types/ActivityConfig";

// Mock useRTL hook
jest.mock("../useRTL", () => ({
  useRTL: jest.fn(),
}));

import { useRTL } from "../useRTL";

describe("useQuestionScreenButtons", () => {
  const mockRtlStyle = jest.fn(style => style);
  const mockUseRTL = useRTL as jest.MockedFunction<typeof useRTL>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRTL.mockReturnValue({
      isRTL: false,
      rtlStyle: mockRtlStyle,
      createRTLStyles: jest.fn(),
    });
  });

  describe("button container style", () => {
    it("applies default styles when no display properties provided", () => {
      const { result } = renderHook(() =>
        useQuestionScreenButtons({
          displayProperties: {},
          activityConfig: null,
          currentScreenValid: true,
          cameFromReview: false,
          isLastScreen: false,
        })
      );

      expect(mockRtlStyle).toHaveBeenCalledWith(
        expect.objectContaining({
          width: "100%",
          marginLeft: 0,
          marginRight: 0,
          paddingLeft: 20,
          paddingRight: 20,
          marginTop: 24,
          marginBottom: 16,
          flexDirection: "row",
          gap: 12,
        })
      );
    });

    it("applies custom display properties", () => {
      const { result } = renderHook(() =>
        useQuestionScreenButtons({
          displayProperties: {
            width: "80%",
            marginLeft: "10",
            marginRight: "20",
            paddingLeft: "15",
            paddingRight: "25",
          },
          activityConfig: null,
          currentScreenValid: true,
          cameFromReview: false,
          isLastScreen: false,
        })
      );

      expect(mockRtlStyle).toHaveBeenCalledWith(
        expect.objectContaining({
          width: 80,
          marginLeft: 10,
          marginRight: 20,
          paddingLeft: 15,
          paddingRight: 25,
        })
      );
    });

    it("handles RTL layout correctly", () => {
      mockUseRTL.mockReturnValue({
        isRTL: true,
        rtlStyle: mockRtlStyle,
        createRTLStyles: jest.fn(),
      });

      const { result } = renderHook(() =>
        useQuestionScreenButtons({
          displayProperties: {},
          activityConfig: null,
          currentScreenValid: true,
          cameFromReview: false,
          isLastScreen: false,
        })
      );

      expect(mockRtlStyle).toHaveBeenCalledWith(
        expect.objectContaining({
          flexDirection: "row-reverse",
        })
      );
    });
  });

  describe("button text", () => {
    it("returns 'Submit' when summary screen is not shown", () => {
      const { result } = renderHook(() =>
        useQuestionScreenButtons({
          displayProperties: {},
          activityConfig: null,
          currentScreenValid: true,
          cameFromReview: false,
          isLastScreen: true,
        })
      );

      expect(result.current.buttonText).toBe("Submit");
    });

    it("returns 'Review' when summary screen is shown", () => {
      const activityConfig: ActivityConfig = {
        summaryScreen: {
          showScreen: true,
        },
      } as ActivityConfig;

      const { result } = renderHook(() =>
        useQuestionScreenButtons({
          displayProperties: {},
          activityConfig,
          currentScreenValid: true,
          cameFromReview: false,
          isLastScreen: true,
        })
      );

      expect(result.current.buttonText).toBe("Review");
    });
  });

  describe("submit button state", () => {
    it("enables submit button when screen is valid", () => {
      const { result } = renderHook(() =>
        useQuestionScreenButtons({
          displayProperties: {},
          activityConfig: null,
          currentScreenValid: true,
          cameFromReview: false,
          isLastScreen: true,
        })
      );

      expect(result.current.isSubmitButtonEnabled).toBe(true);
      expect(result.current.submitButtonDisabled).toBe(false);
    });

    it("enables submit button when came from review", () => {
      const { result } = renderHook(() =>
        useQuestionScreenButtons({
          displayProperties: {},
          activityConfig: null,
          currentScreenValid: false,
          cameFromReview: true,
          isLastScreen: true,
        })
      );

      expect(result.current.isSubmitButtonEnabled).toBe(true);
      expect(result.current.submitButtonDisabled).toBe(false);
    });

    it("disables submit button when screen is invalid and not from review", () => {
      const { result } = renderHook(() =>
        useQuestionScreenButtons({
          displayProperties: {},
          activityConfig: null,
          currentScreenValid: false,
          cameFromReview: false,
          isLastScreen: true,
        })
      );

      expect(result.current.isSubmitButtonEnabled).toBe(false);
      expect(result.current.submitButtonDisabled).toBe(true);
    });
  });

  describe("edge cases", () => {
    it("handles undefined displayProperties", () => {
      const { result } = renderHook(() =>
        useQuestionScreenButtons({
          displayProperties: undefined,
          activityConfig: null,
          currentScreenValid: true,
          cameFromReview: false,
          isLastScreen: false,
        })
      );

      expect(result.current.buttonContainerStyle).toBeDefined();
      expect(result.current.buttonText).toBe("Submit");
    });

    it("handles invalid numeric display properties", () => {
      const { result } = renderHook(() =>
        useQuestionScreenButtons({
          displayProperties: {
            marginLeft: "invalid",
            paddingLeft: "not-a-number",
          },
          activityConfig: null,
          currentScreenValid: true,
          cameFromReview: false,
          isLastScreen: false,
        })
      );

      // parseInt("invalid") returns NaN, which is passed through
      // The test verifies the hook handles invalid input gracefully
      const callArgs = mockRtlStyle.mock.calls[0][0];
      expect(isNaN(callArgs.marginLeft as number)).toBe(true);
      expect(isNaN(callArgs.paddingLeft as number)).toBe(true);
    });
  });
});
