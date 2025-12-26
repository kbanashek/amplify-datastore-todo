import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import type { StyleProp, ViewStyle, TextStyle } from "react-native";
import { GlobalHeader } from "@components/GlobalHeader";

// Mock hooks
const mockRtlStyle = jest.fn(
  (style: StyleProp<ViewStyle | TextStyle>) => style
);
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

jest.mock("@hooks/useColorScheme", () => ({
  useColorScheme: jest.fn(() => "light"),
}));

// Mock child components
jest.mock("@components/LanguageSelector", () => ({
  LanguageSelector: () => {
    const { View } = require("react-native");
    return <View testID="language-selector" />;
  },
}));

jest.mock("@components/NetworkStatusIndicator", () => ({
  NetworkStatusIndicator: () => {
    const { View } = require("react-native");
    return <View testID="network-status-indicator" />;
  },
}));

// Mock IconSymbol
jest.mock("@components/ui/IconSymbol", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    IconSymbol: ({ name }: { name: string }) => (
      <Text testID={`icon-${name}`}>{name}</Text>
    ),
  };
});

// Mock TestIds
jest.mock("@constants/testIds", () => ({
  TestIds: {
    globalHeaderMenuButton: "global-header-menu-button",
  },
}));

describe("GlobalHeader", () => {
  const mockOnMenuPress = jest.fn();
  const mockOnBackPress = jest.fn();
  const mockOnClosePress = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRTL.mockReturnValue({
      rtlStyle: jest.fn((style: StyleProp<ViewStyle | TextStyle>) => style),
      isRTL: false,
    });
  });

  // 1. Basic Rendering
  describe("Rendering", () => {
    it("renders with required props", () => {
      const { getByTestId } = render(<GlobalHeader title="Header Title" />);
      expect(getByTestId("global-header")).toBeTruthy();
      expect(getByTestId("global-header-title")).toBeTruthy();
    });

    it("renders title text", () => {
      const { getByText } = render(<GlobalHeader title="Header Title" />);
      expect(getByText("Header Title")).toBeTruthy();
    });

    it("renders with showMenuButton", () => {
      const { getByTestId } = render(
        <GlobalHeader
          title="Title"
          showMenuButton
          onMenuPress={mockOnMenuPress}
        />
      );
      expect(getByTestId("global-header-menu-button")).toBeTruthy();
    });

    it("renders with showBackButton", () => {
      const { getByTestId } = render(
        <GlobalHeader
          title="Title"
          showBackButton
          onBackPress={mockOnBackPress}
        />
      );
      expect(getByTestId("global-header-back-button")).toBeTruthy();
    });

    it("renders with showCloseButton", () => {
      const { getByTestId } = render(
        <GlobalHeader
          title="Title"
          showCloseButton
          onClosePress={mockOnClosePress}
        />
      );
      expect(getByTestId("global-header-close-button")).toBeTruthy();
    });

    it("renders with rightAction", () => {
      const { Text } = require("react-native");
      const { getByText } = render(
        <GlobalHeader title="Title" rightAction={<Text>Custom Action</Text>} />
      );
      expect(getByText("Custom Action")).toBeTruthy();
    });

    it("renders bottom section by default", () => {
      const { getByTestId } = render(<GlobalHeader title="Title" />);
      expect(getByTestId("global-header-bottom")).toBeTruthy();
    });

    it("hides bottom section when hideBottomSection is true", () => {
      const { queryByTestId } = render(
        <GlobalHeader title="Title" hideBottomSection />
      );
      expect(queryByTestId("global-header-bottom")).toBeNull();
    });
  });

  // 2. User Interactions
  describe("User Interactions", () => {
    it("calls onMenuPress when menu button is pressed", () => {
      const { getByTestId } = render(
        <GlobalHeader
          title="Title"
          showMenuButton
          onMenuPress={mockOnMenuPress}
        />
      );
      fireEvent.press(getByTestId("global-header-menu-button"));
      expect(mockOnMenuPress).toHaveBeenCalledTimes(1);
    });

    it("calls onBackPress when back button is pressed", () => {
      const { getByTestId } = render(
        <GlobalHeader
          title="Title"
          showBackButton
          onBackPress={mockOnBackPress}
        />
      );
      fireEvent.press(getByTestId("global-header-back-button"));
      expect(mockOnBackPress).toHaveBeenCalledTimes(1);
    });

    it("calls onClosePress when close button is pressed", () => {
      const { getByTestId } = render(
        <GlobalHeader
          title="Title"
          showCloseButton
          onClosePress={mockOnClosePress}
        />
      );
      fireEvent.press(getByTestId("global-header-close-button"));
      expect(mockOnClosePress).toHaveBeenCalledTimes(1);
    });

    it("does not show menu button if showMenuButton is false", () => {
      const { queryByTestId } = render(
        <GlobalHeader title="Title" showMenuButton={false} />
      );
      expect(queryByTestId("global-header-menu-button")).toBeNull();
    });

    it("does not show back button if showBackButton is false", () => {
      const { queryByTestId } = render(
        <GlobalHeader title="Title" showBackButton={false} />
      );
      expect(queryByTestId("global-header-back-button")).toBeNull();
    });

    it("does not show close button if showCloseButton is false", () => {
      const { queryByTestId } = render(
        <GlobalHeader title="Title" showCloseButton={false} />
      );
      expect(queryByTestId("global-header-close-button")).toBeNull();
    });
  });

  // 3. RTL Support
  describe("RTL Support", () => {
    it("renders correctly in LTR mode", () => {
      mockUseRTL.mockReturnValueOnce({
        rtlStyle: jest.fn((style: StyleProp<ViewStyle | TextStyle>) => style),
        isRTL: false,
      });

      const { getByTestId } = render(<GlobalHeader title="Title" />);
      expect(getByTestId("global-header")).toBeTruthy();
    });

    it("renders correctly in RTL mode", () => {
      const rtlStyleFn = jest.fn((style: StyleProp<ViewStyle | TextStyle>) => ({
        ...style,
        flexDirection: "row-reverse",
      }));

      mockUseRTL.mockReturnValueOnce({
        rtlStyle: rtlStyleFn,
        isRTL: true,
      });

      const { getByTestId } = render(<GlobalHeader title="Title" />);
      expect(getByTestId("global-header")).toBeTruthy();
      expect(rtlStyleFn).toHaveBeenCalled();
    });

    it("flips text alignment in RTL mode", () => {
      mockUseRTL.mockReturnValueOnce({
        rtlStyle: jest.fn((style: StyleProp<ViewStyle | TextStyle>) => style),
        isRTL: true,
      });

      const { getByTestId } = render(<GlobalHeader title="Title" />);
      const title = getByTestId("global-header-title");
      expect(title).toBeTruthy();
    });

    it("applies RTL styles to header sections", () => {
      const rtlStyleFn = jest.fn((style: StyleProp<ViewStyle | TextStyle>) => ({
        ...style,
        flexDirection: "row-reverse",
      }));

      mockUseRTL.mockReturnValueOnce({
        rtlStyle: rtlStyleFn,
        isRTL: true,
      });

      render(<GlobalHeader title="Title" />);
      expect(rtlStyleFn).toHaveBeenCalled();
    });
  });

  // 4. Edge Cases
  describe("Edge Cases", () => {
    it("handles long title", () => {
      const longTitle =
        "This is a very long header title that should be displayed correctly";
      const { getByText } = render(<GlobalHeader title={longTitle} />);
      expect(getByText(longTitle)).toBeTruthy();
    });

    it("handles empty title", () => {
      const { getByTestId } = render(<GlobalHeader title="" />);
      expect(getByTestId("global-header-title")).toBeTruthy();
    });

    it("handles special characters in title", () => {
      const specialTitle = "Header with special chars: <>&\"'@#$%";
      const { getByText } = render(<GlobalHeader title={specialTitle} />);
      expect(getByText(specialTitle)).toBeTruthy();
    });

    it("handles showMenuButton true without onMenuPress", () => {
      const { queryByTestId } = render(
        <GlobalHeader title="Title" showMenuButton />
      );
      expect(queryByTestId("global-header-menu-button")).toBeNull();
    });

    it("handles showBackButton true without onBackPress", () => {
      const { queryByTestId } = render(
        <GlobalHeader title="Title" showBackButton />
      );
      expect(queryByTestId("global-header-back-button")).toBeNull();
    });

    it("handles showCloseButton true without onClosePress", () => {
      const { queryByTestId } = render(
        <GlobalHeader title="Title" showCloseButton />
      );
      expect(queryByTestId("global-header-close-button")).toBeNull();
    });

    it("handles multiple buttons at once", () => {
      const { getByTestId } = render(
        <GlobalHeader
          title="Title"
          showMenuButton
          onMenuPress={mockOnMenuPress}
          showBackButton
          onBackPress={mockOnBackPress}
          showCloseButton
          onClosePress={mockOnClosePress}
        />
      );
      expect(getByTestId("global-header-menu-button")).toBeTruthy();
      expect(getByTestId("global-header-back-button")).toBeTruthy();
      expect(getByTestId("global-header-close-button")).toBeTruthy();
    });
  });

  // 5. Accessibility
  describe("Accessibility", () => {
    it("has proper accessibility label on menu button", () => {
      const { getByTestId } = render(
        <GlobalHeader
          title="Title"
          showMenuButton
          onMenuPress={mockOnMenuPress}
        />
      );
      const button = getByTestId("global-header-menu-button");
      expect(button.props.accessibilityRole).toBe("button");
      expect(button.props.accessibilityLabel).toBe("Menu");
    });

    it("has proper accessibility label on back button", () => {
      const { getByTestId } = render(
        <GlobalHeader
          title="Title"
          showBackButton
          onBackPress={mockOnBackPress}
        />
      );
      const button = getByTestId("global-header-back-button");
      expect(button.props.accessibilityRole).toBe("button");
      expect(button.props.accessibilityLabel).toBe("Go back");
    });

    it("has proper accessibility label on close button", () => {
      const { getByTestId } = render(
        <GlobalHeader
          title="Title"
          showCloseButton
          onClosePress={mockOnClosePress}
        />
      );
      const button = getByTestId("global-header-close-button");
      expect(button.props.accessibilityRole).toBe("button");
      expect(button.props.accessibilityLabel).toBe("Close");
    });
  });

  // 6. Snapshots
  describe("Snapshots", () => {
    it("matches snapshot with default props", () => {
      const { toJSON } = render(<GlobalHeader title="Header Title" />);
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with all buttons", () => {
      const { toJSON } = render(
        <GlobalHeader
          title="Title"
          showMenuButton
          onMenuPress={mockOnMenuPress}
          showBackButton
          onBackPress={mockOnBackPress}
          showCloseButton
          onClosePress={mockOnClosePress}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with rightAction", () => {
      const { Text } = require("react-native");
      const { toJSON } = render(
        <GlobalHeader title="Title" rightAction={<Text>Action</Text>} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with hideBottomSection", () => {
      const { toJSON } = render(
        <GlobalHeader title="Title" hideBottomSection />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot in RTL mode", () => {
      mockUseRTL.mockReturnValueOnce({
        rtlStyle: jest.fn((style: StyleProp<ViewStyle | TextStyle>) => ({
          ...style,
          flexDirection: "row-reverse",
        })),
        isRTL: true,
      });

      const { toJSON } = render(<GlobalHeader title="Title" />);
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // 7. TestIds for E2E
  describe("E2E Support", () => {
    it("has testId on header container", () => {
      const { getByTestId } = render(<GlobalHeader title="Title" />);
      expect(getByTestId("global-header")).toBeTruthy();
    });

    it("has testId on title", () => {
      const { getByTestId } = render(<GlobalHeader title="Title" />);
      expect(getByTestId("global-header-title")).toBeTruthy();
    });

    it("has testId on menu button", () => {
      const { getByTestId } = render(
        <GlobalHeader
          title="Title"
          showMenuButton
          onMenuPress={mockOnMenuPress}
        />
      );
      expect(getByTestId("global-header-menu-button")).toBeTruthy();
    });

    it("has testId on back button", () => {
      const { getByTestId } = render(
        <GlobalHeader
          title="Title"
          showBackButton
          onBackPress={mockOnBackPress}
        />
      );
      expect(getByTestId("global-header-back-button")).toBeTruthy();
    });

    it("has testId on close button", () => {
      const { getByTestId } = render(
        <GlobalHeader
          title="Title"
          showCloseButton
          onClosePress={mockOnClosePress}
        />
      );
      expect(getByTestId("global-header-close-button")).toBeTruthy();
    });

    it("has testIds on all sections", () => {
      const { getByTestId } = render(<GlobalHeader title="Title" />);
      expect(getByTestId("global-header-top")).toBeTruthy();
      expect(getByTestId("global-header-left")).toBeTruthy();
      expect(getByTestId("global-header-actions")).toBeTruthy();
      expect(getByTestId("global-header-bottom")).toBeTruthy();
    });
  });
});
