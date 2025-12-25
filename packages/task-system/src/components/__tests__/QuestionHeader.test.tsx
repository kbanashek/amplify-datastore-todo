import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { QuestionHeader } from "@components/QuestionHeader";

// Mock hooks
const mockRtlStyle = jest.fn((style: any) => style);
const mockUseRTL = jest.fn(() => ({
  rtlStyle: mockRtlStyle,
  isRTL: false,
}));

jest.mock("@hooks/useRTL", () => ({
  useRTL: () => mockUseRTL(),
}));

jest.mock("@hooks/useTranslatedText", () => ({
  useTranslatedText: jest.fn((text: string) => ({
    translatedText: text,
    isTranslating: false,
  })),
}));

// Mock IconSymbol
jest.mock("@components/ui/IconSymbol", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    IconSymbol: ({ name }: any) => <Text testID={`icon-${name}`}>{name}</Text>,
  };
});

describe("QuestionHeader", () => {
  const mockOnBackPress = jest.fn();
  const mockOnClosePress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRTL.mockReturnValue({
      rtlStyle: jest.fn((style: any) => style),
      isRTL: false,
    });
  });

  // 1. Basic Rendering
  describe("Rendering", () => {
    it("renders with required props", () => {
      const { getByTestId } = render(<QuestionHeader title="Question Title" />);
      expect(getByTestId("question-header")).toBeTruthy();
      expect(getByTestId("question-header-title")).toBeTruthy();
    });

    it("renders title text", () => {
      const { getByText } = render(<QuestionHeader title="Question Title" />);
      expect(getByText("Question Title")).toBeTruthy();
    });

    it("renders with optional showBackButton", () => {
      const { getByTestId } = render(
        <QuestionHeader
          title="Question Title"
          showBackButton
          onBackPress={mockOnBackPress}
        />
      );
      expect(getByTestId("question-header-back-button")).toBeTruthy();
    });

    it("renders with optional showCloseButton", () => {
      const { getByTestId } = render(
        <QuestionHeader
          title="Question Title"
          showCloseButton
          onClosePress={mockOnClosePress}
        />
      );
      expect(getByTestId("question-header-close-button")).toBeTruthy();
    });

    it("renders placeholder when back button not shown", () => {
      const { getByTestId } = render(
        <QuestionHeader title="Question Title" showBackButton={false} />
      );
      expect(getByTestId("question-header-placeholder")).toBeTruthy();
    });

    it("renders without buttons", () => {
      const { getByTestId, queryByTestId } = render(
        <QuestionHeader title="Question Title" />
      );
      expect(getByTestId("question-header")).toBeTruthy();
      expect(queryByTestId("question-header-back-button")).toBeNull();
      expect(queryByTestId("question-header-close-button")).toBeNull();
    });
  });

  // 2. User Interactions
  describe("User Interactions", () => {
    it("calls onBackPress when back button is pressed", () => {
      const { getByTestId } = render(
        <QuestionHeader
          title="Question Title"
          showBackButton
          onBackPress={mockOnBackPress}
        />
      );
      fireEvent.press(getByTestId("question-header-back-button"));
      expect(mockOnBackPress).toHaveBeenCalledTimes(1);
    });

    it("calls onClosePress when close button is pressed", () => {
      const { getByTestId } = render(
        <QuestionHeader
          title="Question Title"
          showCloseButton
          onClosePress={mockOnClosePress}
        />
      );
      fireEvent.press(getByTestId("question-header-close-button"));
      expect(mockOnClosePress).toHaveBeenCalledTimes(1);
    });

    it("does not call onBackPress when button not shown", () => {
      const { queryByTestId } = render(
        <QuestionHeader title="Question Title" showBackButton={false} />
      );
      expect(queryByTestId("question-header-back-button")).toBeNull();
    });

    it("handles both buttons being pressed", () => {
      const { getByTestId } = render(
        <QuestionHeader
          title="Question Title"
          showBackButton
          onBackPress={mockOnBackPress}
          showCloseButton
          onClosePress={mockOnClosePress}
        />
      );
      fireEvent.press(getByTestId("question-header-back-button"));
      fireEvent.press(getByTestId("question-header-close-button"));
      expect(mockOnBackPress).toHaveBeenCalledTimes(1);
      expect(mockOnClosePress).toHaveBeenCalledTimes(1);
    });
  });

  // 3. RTL Support
  describe("RTL Support", () => {
    it("renders correctly in LTR mode", () => {
      mockUseRTL.mockReturnValueOnce({
        rtlStyle: jest.fn((style: any) => style),
        isRTL: false,
      });

      const { getByTestId } = render(<QuestionHeader title="Question Title" />);
      expect(getByTestId("question-header")).toBeTruthy();
    });

    it("renders correctly in RTL mode", () => {
      const rtlStyleFn = jest.fn((style: any) => ({
        ...style,
        flexDirection: "row-reverse",
      }));

      mockUseRTL.mockReturnValueOnce({
        rtlStyle: rtlStyleFn,
        isRTL: true,
      });

      const { getByTestId } = render(<QuestionHeader title="Question Title" />);
      expect(getByTestId("question-header")).toBeTruthy();
      expect(rtlStyleFn).toHaveBeenCalled();
    });

    it("flips text alignment in RTL mode", () => {
      mockUseRTL.mockReturnValueOnce({
        rtlStyle: jest.fn((style: any) => style),
        isRTL: true,
      });

      const { getByTestId } = render(<QuestionHeader title="Question Title" />);
      const title = getByTestId("question-header-title");
      expect(title).toBeTruthy();
    });

    it("applies RTL styles to header top", () => {
      const rtlStyleFn = jest.fn((style: any) => ({
        ...style,
        flexDirection: "row-reverse",
      }));

      mockUseRTL.mockReturnValueOnce({
        rtlStyle: rtlStyleFn,
        isRTL: true,
      });

      render(<QuestionHeader title="Question Title" />);
      expect(rtlStyleFn).toHaveBeenCalled();
    });
  });

  // 4. Edge Cases
  describe("Edge Cases", () => {
    it("handles long title text", () => {
      const longTitle =
        "This is a very long question title that should wrap to multiple lines properly";
      const { getByTestId, getByText } = render(
        <QuestionHeader title={longTitle} />
      );
      expect(getByTestId("question-header-title")).toBeTruthy();
      expect(getByText(longTitle)).toBeTruthy();
    });

    it("handles empty title", () => {
      const { getByTestId } = render(<QuestionHeader title="" />);
      expect(getByTestId("question-header-title")).toBeTruthy();
    });

    it("handles special characters in title", () => {
      const specialTitle = "Question with special chars: <>&\"'";
      const { getByText } = render(<QuestionHeader title={specialTitle} />);
      expect(getByText(specialTitle)).toBeTruthy();
    });

    it("handles showBackButton true without onBackPress", () => {
      const { queryByTestId } = render(
        <QuestionHeader title="Title" showBackButton />
      );
      // Should show placeholder, not button
      expect(queryByTestId("question-header-back-button")).toBeNull();
    });

    it("handles showCloseButton true without onClosePress", () => {
      const { queryByTestId } = render(
        <QuestionHeader title="Title" showCloseButton />
      );
      expect(queryByTestId("question-header-close-button")).toBeNull();
    });
  });

  // 5. Accessibility
  describe("Accessibility", () => {
    it("has proper accessibility label on back button", () => {
      const { getByTestId } = render(
        <QuestionHeader
          title="Title"
          showBackButton
          onBackPress={mockOnBackPress}
        />
      );
      const button = getByTestId("question-header-back-button");
      expect(button.props.accessibilityRole).toBe("button");
      expect(button.props.accessibilityLabel).toBe("Go back");
    });

    it("has proper accessibility label on close button", () => {
      const { getByTestId } = render(
        <QuestionHeader
          title="Title"
          showCloseButton
          onClosePress={mockOnClosePress}
        />
      );
      const button = getByTestId("question-header-close-button");
      expect(button.props.accessibilityRole).toBe("button");
      expect(button.props.accessibilityLabel).toBe("Close");
    });

    it("has proper accessibility roles", () => {
      const { getByTestId } = render(
        <QuestionHeader
          title="Title"
          showBackButton
          onBackPress={mockOnBackPress}
          showCloseButton
          onClosePress={mockOnClosePress}
        />
      );
      expect(
        getByTestId("question-header-back-button").props.accessibilityRole
      ).toBe("button");
      expect(
        getByTestId("question-header-close-button").props.accessibilityRole
      ).toBe("button");
    });
  });

  // 6. Snapshots
  describe("Snapshots", () => {
    it("matches snapshot with default props", () => {
      const { toJSON } = render(<QuestionHeader title="Question Title" />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with back button", () => {
      const { toJSON } = render(
        <QuestionHeader
          title="Question Title"
          showBackButton
          onBackPress={mockOnBackPress}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with close button", () => {
      const { toJSON } = render(
        <QuestionHeader
          title="Question Title"
          showCloseButton
          onClosePress={mockOnClosePress}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with both buttons", () => {
      const { toJSON } = render(
        <QuestionHeader
          title="Question Title"
          showBackButton
          onBackPress={mockOnBackPress}
          showCloseButton
          onClosePress={mockOnClosePress}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot in RTL mode", () => {
      mockUseRTL.mockReturnValueOnce({
        rtlStyle: jest.fn((style: any) => ({
          ...style,
          flexDirection: "row-reverse",
        })),
        isRTL: true,
      });

      const { toJSON } = render(<QuestionHeader title="Question Title" />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // 7. TestIds for E2E
  describe("E2E Support", () => {
    it("has testId on header container", () => {
      const { getByTestId } = render(<QuestionHeader title="Title" />);
      expect(getByTestId("question-header")).toBeTruthy();
    });

    it("has testId on title", () => {
      const { getByTestId } = render(<QuestionHeader title="Title" />);
      expect(getByTestId("question-header-title")).toBeTruthy();
    });

    it("has testId on back button", () => {
      const { getByTestId } = render(
        <QuestionHeader
          title="Title"
          showBackButton
          onBackPress={mockOnBackPress}
        />
      );
      expect(getByTestId("question-header-back-button")).toBeTruthy();
    });

    it("has testId on close button", () => {
      const { getByTestId } = render(
        <QuestionHeader
          title="Title"
          showCloseButton
          onClosePress={mockOnClosePress}
        />
      );
      expect(getByTestId("question-header-close-button")).toBeTruthy();
    });

    it("has testIds on all sections", () => {
      const { getByTestId } = render(
        <QuestionHeader
          title="Title"
          showBackButton
          onBackPress={mockOnBackPress}
          showCloseButton
          onClosePress={mockOnClosePress}
        />
      );
      expect(getByTestId("question-header")).toBeTruthy();
      expect(getByTestId("question-header-top")).toBeTruthy();
      expect(getByTestId("question-header-left")).toBeTruthy();
      expect(getByTestId("question-header-right")).toBeTruthy();
    });
  });
});
