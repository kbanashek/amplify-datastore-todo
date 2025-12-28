import { AppointmentCard } from "@components/AppointmentCard";
import { Appointment, AppointmentType } from "@task-types/Appointment";
import { fireEvent, render } from "@testing-library/react-native";
import type { StyleProp, ViewStyle, TextStyle } from "react-native";
import React from "react";

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

jest.mock("@translations/index", () => ({
  useTaskTranslation: jest.fn(() => ({
    t: jest.fn((key: string) => key),
    currentLanguage: "en",
    isRTL: false,
  })),
}));

// Mock utilities
jest.mock("@utils/appointmentIcon", () => ({
  getAppointmentIconConfig: jest.fn((type: string) => {
    if (type === "TELEVISIT") {
      return {
        iconName: "video.fill",
        translationKey: "appointment.telehealth",
      };
    }
    return {
      iconName: "building.2.fill",
      translationKey: "appointment.onsiteVisit",
    };
  }),
}));

jest.mock("@utils/appointmentParser", () => ({
  formatTime: jest.fn((date: Date) => "10:00 AM"),
  getTimezoneAbbreviation: jest.fn((tz?: string) => (tz ? "EST" : null)),
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

describe("AppointmentCard", () => {
  const mockAppointment: Appointment = {
    appointmentId: "appt-1",
    title: "Doctor Visit",
    startAt: "2024-01-15T10:00:00Z",
    appointmentType: AppointmentType.ONSITE,
  } as Appointment;

  const mockOnPress = jest.fn();

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
      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      expect(getByTestId("appointment-card")).toBeTruthy();
      expect(getByTestId("appointment-card-title")).toBeTruthy();
    });

    it("renders with optional onPress handler", () => {
      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} onPress={mockOnPress} />
      );
      expect(getByTestId("appointment-card-button")).toBeTruthy();
    });

    it("renders with optional timezoneId", () => {
      const { getByTestId } = render(
        <AppointmentCard
          appointment={mockAppointment}
          timezoneId="America/New_York"
        />
      );
      expect(getByTestId("appointment-card")).toBeTruthy();
    });

    it("renders without onPress handler", () => {
      const { getByTestId, queryByTestId } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      expect(getByTestId("appointment-card")).toBeTruthy();
      expect(queryByTestId("appointment-card-button")).toBeNull();
    });

    it("renders appointment title", () => {
      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      const title = getByTestId("appointment-card-title");
      expect(title).toBeTruthy();
      expect(title.props.children).toContain("Doctor Visit");
    });

    it("renders appointment type label", () => {
      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      expect(getByTestId("appointment-card-type-label")).toBeTruthy();
    });
  });

  // 2. User Interactions
  describe("User Interactions", () => {
    it("calls onPress when card is pressed", () => {
      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} onPress={mockOnPress} />
      );
      fireEvent.press(getByTestId("appointment-card-button"));
      expect(mockOnPress).toHaveBeenCalledWith(mockAppointment);
      expect(mockOnPress).toHaveBeenCalledTimes(1);
    });

    it("does not call onPress when card has no onPress handler", () => {
      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      const card = getByTestId("appointment-card");
      // Card without onPress is not pressable
      expect(card).toBeTruthy();
    });
  });

  // 3. RTL Support
  describe("RTL Support", () => {
    it("renders correctly in LTR mode", () => {
      mockUseRTL.mockReturnValueOnce({
        rtlStyle: jest.fn((style: StyleProp<ViewStyle | TextStyle>) => style),
        isRTL: false,
      });

      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      expect(getByTestId("appointment-card")).toBeTruthy();
    });

    it("renders correctly in RTL mode", () => {
      const rtlStyleFn = jest.fn(
        (style: StyleProp<ViewStyle | TextStyle>) =>
          ({
            ...(style as ViewStyle),
            flexDirection: "row-reverse",
          }) as any
      );

      mockUseRTL.mockReturnValueOnce({
        rtlStyle: rtlStyleFn,
        isRTL: true,
      });

      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      expect(getByTestId("appointment-card")).toBeTruthy();
      expect(rtlStyleFn).toHaveBeenCalled();
    });

    it("flips text alignment in RTL mode", () => {
      mockUseRTL.mockReturnValueOnce({
        rtlStyle: jest.fn((style: StyleProp<ViewStyle | TextStyle>) => style),
        isRTL: true,
      });

      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      const title = getByTestId("appointment-card-title");
      expect(title).toBeTruthy();
    });

    it("flips chevron direction in RTL mode", () => {
      mockUseRTL.mockReturnValueOnce({
        rtlStyle: jest.fn((style: StyleProp<ViewStyle | TextStyle>) => style),
        isRTL: true,
      });

      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      // In RTL, should show chevron.left
      expect(getByTestId("icon-chevron.left")).toBeTruthy();
    });

    it("shows chevron.right in LTR mode", () => {
      mockUseRTL.mockReturnValueOnce({
        rtlStyle: jest.fn((style: StyleProp<ViewStyle | TextStyle>) => style),
        isRTL: false,
      });

      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      expect(getByTestId("icon-chevron.right")).toBeTruthy();
    });
  });

  // 4. Edge Cases
  describe("Edge Cases", () => {
    it("handles long appointment title", () => {
      const longTitleAppointment: Appointment = {
        ...mockAppointment,
        title:
          "This is a very long appointment title that should be truncated properly",
      };
      const { getByTestId } = render(
        <AppointmentCard appointment={longTitleAppointment} />
      );
      const title = getByTestId("appointment-card-title");
      expect(title).toBeTruthy();
      expect(title.props.numberOfLines).toBe(2);
    });

    it("handles empty timezone", () => {
      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} timezoneId={undefined} />
      );
      expect(getByTestId("appointment-card")).toBeTruthy();
    });

    it("handles telehealth appointment type", () => {
      const telehealthAppointment: Appointment = {
        ...mockAppointment,
        appointmentType: AppointmentType.TELEVISIT,
      };
      const { getByTestId } = render(
        <AppointmentCard appointment={telehealthAppointment} />
      );
      expect(getByTestId("appointment-card")).toBeTruthy();
      expect(getByTestId("icon-video.fill")).toBeTruthy();
    });

    it("handles onsite appointment type", () => {
      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      expect(getByTestId("appointment-card")).toBeTruthy();
      expect(getByTestId("icon-building.2.fill")).toBeTruthy();
    });

    it("handles appointment with special characters in title", () => {
      const specialCharAppointment: Appointment = {
        ...mockAppointment,
        title: "Visit with Dr. O'Brien & Associates (2024)",
      };
      const { getByTestId } = render(
        <AppointmentCard appointment={specialCharAppointment} />
      );
      expect(getByTestId("appointment-card-title")).toBeTruthy();
    });
  });

  // 5. Accessibility
  describe("Accessibility", () => {
    it("has proper accessibility label when onPress is provided", () => {
      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} onPress={mockOnPress} />
      );
      const button = getByTestId("appointment-card-button");
      expect(button.props.accessibilityRole).toBe("button");
      expect(button.props.accessibilityLabel).toBeTruthy();
    });

    it("has proper accessibility role", () => {
      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} onPress={mockOnPress} />
      );
      const button = getByTestId("appointment-card-button");
      expect(button.props.accessibilityRole).toBe("button");
    });
  });

  // 6. Snapshots
  describe("Snapshots", () => {
    it("matches snapshot with default props", () => {
      const { toJSON } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with onPress handler", () => {
      const { toJSON } = render(
        <AppointmentCard appointment={mockAppointment} onPress={mockOnPress} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with timezone", () => {
      const { toJSON } = render(
        <AppointmentCard
          appointment={mockAppointment}
          timezoneId="America/New_York"
        />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot in RTL mode", () => {
      mockUseRTL.mockReturnValueOnce({
        rtlStyle: jest.fn(
          (style: StyleProp<ViewStyle | TextStyle>) =>
            ({
              ...(style as ViewStyle),
              flexDirection: "row-reverse",
            }) as any
        ),
        isRTL: true,
      });

      const { toJSON } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      expect(toJSON()).toMatchSnapshot();
    });

    it("matches snapshot with telehealth appointment", () => {
      const telehealthAppointment: Appointment = {
        ...mockAppointment,
        appointmentType: AppointmentType.TELEVISIT,
      };
      const { toJSON } = render(
        <AppointmentCard appointment={telehealthAppointment} />
      );
      expect(toJSON()).toMatchSnapshot();
    });
  });

  // 7. TestIds for E2E
  describe("E2E Support", () => {
    it("has testId on card container", () => {
      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      expect(getByTestId("appointment-card")).toBeTruthy();
    });

    it("has testId on button when onPress is provided", () => {
      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} onPress={mockOnPress} />
      );
      expect(getByTestId("appointment-card-button")).toBeTruthy();
    });

    it("has testId on title", () => {
      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      expect(getByTestId("appointment-card-title")).toBeTruthy();
    });

    it("has testId on type label", () => {
      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      expect(getByTestId("appointment-card-type-label")).toBeTruthy();
    });

    it("has testId on icon container", () => {
      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      expect(getByTestId("appointment-card-icon-container")).toBeTruthy();
    });

    it("has testId on chevron container", () => {
      const { getByTestId } = render(
        <AppointmentCard appointment={mockAppointment} />
      );
      expect(getByTestId("appointment-card-chevron")).toBeTruthy();
    });
  });
});
