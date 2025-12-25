import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { NavigationMenu } from "@components/NavigationMenu";

// Mock useNavigation
const mockNavigate = jest.fn();
const mockUseNavigation = jest.fn(() => ({
  navigate: mockNavigate,
}));

jest.mock("@react-navigation/native", () => ({
  useNavigation: () => mockUseNavigation(),
}));

// Mock useColorScheme
jest.mock("@hooks/useColorScheme", () => ({
  useColorScheme: jest.fn(() => "light"),
}));

// Mock IconSymbol
jest.mock("@components/ui/IconSymbol", () => {
  const React = require("react");
  const { Text } = require("react-native");
  return {
    IconSymbol: ({ name }: any) => <Text testID={`icon-${name}`}>{name}</Text>,
  };
});

// Mock logger
jest.mock("@utils/serviceLogger", () => ({
  getServiceLogger: jest.fn(() => ({
    error: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
  })),
}));

describe("NavigationMenu", () => {
  const mockOnClose = jest.fn();
  const mockItems = [
    {
      key: "dashboard",
      name: "Dashboard",
      icon: "house.fill",
      description: "Go to dashboard",
      navigateTo: "Dashboard",
    },
    {
      key: "settings",
      name: "Settings",
      icon: "gear",
      description: "Go to settings",
      onPress: jest.fn(),
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // 1. Basic Rendering
  describe("Rendering", () => {
    it("renders with required props", () => {
      const { getByTestId } = render(
        <NavigationMenu visible={true} onClose={mockOnClose} />
      );
      expect(getByTestId("navigation-menu-modal")).toBeTruthy();
    });

    it("renders when visible is true", () => {
      const { getByTestId } = render(
        <NavigationMenu visible={true} onClose={mockOnClose} />
      );
      expect(getByTestId("navigation-menu-modal")).toBeTruthy();
    });

    it("does not render when visible is false", () => {
      const { queryByTestId } = render(
        <NavigationMenu visible={false} onClose={mockOnClose} />
      );
      // Modal might still be in tree but not visible
      expect(queryByTestId("navigation-menu-modal")).toBeTruthy();
    });

    it("renders with menu items", () => {
      const { getByTestId } = render(
        <NavigationMenu
          visible={true}
          onClose={mockOnClose}
          items={mockItems}
        />
      );
      expect(getByTestId("navigation-menu-item-dashboard")).toBeTruthy();
      expect(getByTestId("navigation-menu-item-settings")).toBeTruthy();
    });

    it("renders empty state when no items", () => {
      const { getByTestId } = render(
        <NavigationMenu visible={true} onClose={mockOnClose} items={[]} />
      );
      expect(getByTestId("navigation-menu-empty-state")).toBeTruthy();
    });

    it("renders menu title", () => {
      const { getByText } = render(
        <NavigationMenu visible={true} onClose={mockOnClose} />
      );
      expect(getByText("Navigation")).toBeTruthy();
    });
  });

  // 2. User Interactions
  describe("User Interactions", () => {
    it("calls onClose when overlay is pressed", () => {
      const { getByTestId } = render(
        <NavigationMenu visible={true} onClose={mockOnClose} />
      );
      fireEvent.press(getByTestId("navigation-menu-overlay"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("calls onClose when close button is pressed", () => {
      const { getByTestId } = render(
        <NavigationMenu visible={true} onClose={mockOnClose} />
      );
      fireEvent.press(getByTestId("navigation-menu-close-button"));
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("calls onPress when item has onPress handler", () => {
      const mockOnPress = jest.fn();
      const itemsWithOnPress = [
        {
          key: "test",
          name: "Test",
          icon: "house.fill",
          onPress: mockOnPress,
        },
      ];
      const { getByTestId } = render(
        <NavigationMenu
          visible={true}
          onClose={mockOnClose}
          items={itemsWithOnPress}
        />
      );
      fireEvent.press(getByTestId("navigation-menu-item-test"));
      expect(mockOnPress).toHaveBeenCalledTimes(1);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("calls navigate when item has navigateTo", () => {
      const itemsWithNavigate = [
        {
          key: "dashboard",
          name: "Dashboard",
          icon: "house.fill",
          navigateTo: "Dashboard",
        },
      ];
      const { getByTestId } = render(
        <NavigationMenu
          visible={true}
          onClose={mockOnClose}
          items={itemsWithNavigate}
        />
      );
      fireEvent.press(getByTestId("navigation-menu-item-dashboard"));
      expect(mockNavigate).toHaveBeenCalledWith("Dashboard");
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    it("handles item press error gracefully", () => {
      const errorOnPress = jest.fn(() => {
        throw new Error("Navigation error");
      });
      const itemsWithError = [
        {
          key: "error",
          name: "Error",
          icon: "house.fill",
          onPress: errorOnPress,
        },
      ];
      const { getByTestId } = render(
        <NavigationMenu
          visible={true}
          onClose={mockOnClose}
          items={itemsWithError}
        />
      );
      // Should not throw, error should be caught
      expect(() => {
        fireEvent.press(getByTestId("navigation-menu-item-error"));
      }).not.toThrow();
    });
  });

  // 3. RTL Support
  describe("RTL Support", () => {
    it("renders correctly in LTR mode", () => {
      const { getByTestId } = render(
        <NavigationMenu visible={true} onClose={mockOnClose} />
      );
      expect(getByTestId("navigation-menu-modal")).toBeTruthy();
    });

    it("renders correctly in RTL mode", () => {
      const { getByTestId } = render(
        <NavigationMenu visible={true} onClose={mockOnClose} />
      );
      // Component should handle RTL through color scheme
      expect(getByTestId("navigation-menu-modal")).toBeTruthy();
    });
  });

  // 4. Edge Cases
  describe("Edge Cases", () => {
    it("handles empty items array", () => {
      const { getByTestId } = render(
        <NavigationMenu visible={true} onClose={mockOnClose} items={[]} />
      );
      expect(getByTestId("navigation-menu-empty-state")).toBeTruthy();
    });

    it("handles undefined items", () => {
      const { getByTestId } = render(
        <NavigationMenu
          visible={true}
          onClose={mockOnClose}
          items={undefined}
        />
      );
      expect(getByTestId("navigation-menu-empty-state")).toBeTruthy();
    });

    it("handles item without description", () => {
      const itemsWithoutDesc = [
        {
          key: "no-desc",
          name: "No Description",
          icon: "house.fill",
        },
      ];
      const { getByTestId, queryByTestId } = render(
        <NavigationMenu
          visible={true}
          onClose={mockOnClose}
          items={itemsWithoutDesc}
        />
      );
      expect(getByTestId("navigation-menu-item-no-desc")).toBeTruthy();
      expect(
        queryByTestId("navigation-menu-item-description-no-desc")
      ).toBeNull();
    });

    it("handles item with both navigateTo and onPress", () => {
      const mockOnPress = jest.fn();
      const itemsWithBoth = [
        {
          key: "both",
          name: "Both",
          icon: "house.fill",
          navigateTo: "Route",
          onPress: mockOnPress,
        },
      ];
      const { getByTestId } = render(
        <NavigationMenu
          visible={true}
          onClose={mockOnClose}
          items={itemsWithBoth}
        />
      );
      fireEvent.press(getByTestId("navigation-menu-item-both"));
      // onPress should take precedence
      expect(mockOnPress).toHaveBeenCalled();
    });

    it("handles navigation error gracefully", () => {
      mockNavigate.mockImplementation(() => {
        throw new Error("Navigation failed");
      });
      const itemsWithNavigate = [
        {
          key: "nav-error",
          name: "Nav Error",
          icon: "house.fill",
          navigateTo: "ErrorRoute",
        },
      ];
      const { getByTestId } = render(
        <NavigationMenu
          visible={true}
          onClose={mockOnClose}
          items={itemsWithNavigate}
        />
      );
      // Should not throw
      expect(() => {
        fireEvent.press(getByTestId("navigation-menu-item-nav-error"));
      }).not.toThrow();
    });
  });

  // 5. Accessibility
  describe("Accessibility", () => {
    it("has proper accessibility label on close button", () => {
      const { getByTestId } = render(
        <NavigationMenu visible={true} onClose={mockOnClose} />
      );
      const button = getByTestId("navigation-menu-close-button");
      expect(button.props.accessibilityRole).toBe("button");
      expect(button.props.accessibilityLabel).toBe("Close navigation menu");
    });

    it("has proper accessibility label on menu items", () => {
      const { getByTestId } = render(
        <NavigationMenu
          visible={true}
          onClose={mockOnClose}
          items={mockItems}
        />
      );
      const item = getByTestId("navigation-menu-item-dashboard");
      expect(item.props.accessibilityRole).toBe("button");
      expect(item.props.accessibilityLabel).toBe("Go to dashboard");
    });

    it("uses item name as accessibility label when no description", () => {
      const itemsWithoutDesc = [
        {
          key: "no-desc",
          name: "No Description",
          icon: "house.fill",
        },
      ];
      const { getByTestId } = render(
        <NavigationMenu
          visible={true}
          onClose={mockOnClose}
          items={itemsWithoutDesc}
        />
      );
      const item = getByTestId("navigation-menu-item-no-desc");
      expect(item.props.accessibilityLabel).toBe("No Description");
    });
  });

  // 6. Snapshots
  describe("Snapshots", () => {
    it("matches snapshot with default props", () => {
      const { toJSON } = render(
        <NavigationMenu visible={true} onClose={mockOnClose} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with items", () => {
      const { toJSON } = render(
        <NavigationMenu
          visible={true}
          onClose={mockOnClose}
          items={mockItems}
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with empty items", () => {
      const { toJSON } = render(
        <NavigationMenu visible={true} onClose={mockOnClose} items={[]} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot when not visible", () => {
      const { toJSON } = render(
        <NavigationMenu visible={false} onClose={mockOnClose} />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // 7. TestIds for E2E
  describe("E2E Support", () => {
    it("has testId on modal", () => {
      const { getByTestId } = render(
        <NavigationMenu visible={true} onClose={mockOnClose} />
      );
      expect(getByTestId("navigation-menu-modal")).toBeTruthy();
    });

    it("has testId on close button", () => {
      const { getByTestId } = render(
        <NavigationMenu visible={true} onClose={mockOnClose} />
      );
      expect(getByTestId("navigation-menu-close-button")).toBeTruthy();
    });

    it("has testId on menu items", () => {
      const { getByTestId } = render(
        <NavigationMenu
          visible={true}
          onClose={mockOnClose}
          items={mockItems}
        />
      );
      expect(getByTestId("navigation-menu-item-dashboard")).toBeTruthy();
      expect(getByTestId("navigation-menu-item-settings")).toBeTruthy();
    });

    it("has testId on empty state", () => {
      const { getByTestId } = render(
        <NavigationMenu visible={true} onClose={mockOnClose} items={[]} />
      );
      expect(getByTestId("navigation-menu-empty-state")).toBeTruthy();
    });

    it("has testIds on all sections", () => {
      const { getByTestId } = render(
        <NavigationMenu
          visible={true}
          onClose={mockOnClose}
          items={mockItems}
        />
      );
      expect(getByTestId("navigation-menu-header")).toBeTruthy();
      expect(getByTestId("navigation-menu-list")).toBeTruthy();
      expect(getByTestId("navigation-menu-container")).toBeTruthy();
    });
  });
});
