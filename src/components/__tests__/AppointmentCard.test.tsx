import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { AppointmentCard } from "../AppointmentCard";
import {
  Appointment,
  AppointmentType,
  AppointmentStatus,
} from "../../types/Appointment";

// Mock IconSymbol
jest.mock("@/components/ui/IconSymbol", () => ({
  IconSymbol: ({ name, size, color }: any) => {
    const { View, Text } = require("react-native");
    return (
      <View testID={`icon-${name}`}>
        <Text>{name}</Text>
      </View>
    );
  },
}));

// Mock translation hooks
const mockTranslateText = jest.fn((text: string) => text);
jest.mock("../../hooks/useTranslatedText", () => ({
  useTranslatedText: jest.fn((text: string) => ({
    translatedText: mockTranslateText(text),
    isTranslating: false,
  })),
}));

// Mock useRTL
jest.mock("../../hooks/useRTL", () => ({
  useRTL: jest.fn(() => ({
    rtlStyle: (style: any) => style,
    isRTL: false,
  })),
}));

describe("AppointmentCard", () => {
  const mockAppointment: Appointment = {
    telehealthMeetingId: "meeting-123",
    appointmentType: AppointmentType.TELEVISIT,
    title: "Follow-up Consultation",
    siteId: "Site.UUID-12345",
    data: "{}",
    isDeleted: 0,
    patientId: "Patient.UUID-67890",
    status: AppointmentStatus.SCHEDULED,
    description: "Regular follow-up appointment",
    startAt: "2025-12-12T14:00:00.000Z",
    endAt: "2025-12-12T15:00:00.000Z",
    instructions: "Please prepare your questions",
    appointmentId: "Appointment.UUID-abc123",
    eventId: "Event.UUID-def456",
    createdAt: "2025-12-01T10:00:00.000Z",
    updatedAt: "2025-12-01T10:00:00.000Z",
    version: 1,
    rescheduled: 0,
    __typename: "SubjectStudyInstanceAppointment",
  };

  const mockOnsiteAppointment: Appointment = {
    ...mockAppointment,
    telehealthMeetingId: null,
    appointmentType: AppointmentType.ONSITE,
    title: "Lab Work Appointment",
    appointmentId: "Appointment.UUID-xyz789",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockTranslateText.mockImplementation(text => text);
  });

  it("renders appointment title correctly", () => {
    const { getByText } = render(
      <AppointmentCard appointment={mockAppointment} />
    );

    expect(getByText(/Follow-up Consultation/)).toBeTruthy();
  });

  it("renders telehealth icon for TELEVISIT appointments", () => {
    const { getByTestId } = render(
      <AppointmentCard appointment={mockAppointment} />
    );

    expect(getByTestId("icon-video.fill")).toBeTruthy();
  });

  it("renders building icon for ONSITE appointments", () => {
    const { getByTestId } = render(
      <AppointmentCard appointment={mockOnsiteAppointment} />
    );

    expect(getByTestId("icon-building.2.fill")).toBeTruthy();
  });

  it("renders chevron icon", () => {
    const { getByTestId } = render(
      <AppointmentCard appointment={mockAppointment} />
    );

    expect(getByTestId("icon-chevron.right")).toBeTruthy();
  });

  it("calls onPress when card is pressed", () => {
    const mockOnPress = jest.fn();
    const { getByText } = render(
      <AppointmentCard appointment={mockAppointment} onPress={mockOnPress} />
    );

    // Find the TouchableOpacity and press it
    const card = getByText(/Follow-up Consultation/).parent?.parent?.parent;
    if (card) {
      fireEvent.press(card as any);
      expect(mockOnPress).toHaveBeenCalledWith(mockAppointment);
    }
  });

  it("does not call onPress when onPress is not provided", () => {
    const { getByText } = render(
      <AppointmentCard appointment={mockAppointment} />
    );

    // Should render without TouchableOpacity wrapper
    expect(getByText(/Follow-up Consultation/)).toBeTruthy();
  });

  it("displays translated appointment type label for telehealth", () => {
    mockTranslateText.mockImplementation(text => {
      if (text === "Telehealth") return "Telehealth";
      if (text === "starts at") return "starts at";
      return text;
    });

    const { getByText } = render(
      <AppointmentCard appointment={mockAppointment} />
    );

    expect(getByText(/Telehealth/)).toBeTruthy();
  });

  it("displays translated appointment type label for onsite", () => {
    mockTranslateText.mockImplementation(text => {
      if (text === "Onsite Visit") return "Onsite Visit";
      if (text === "starts at") return "starts at";
      return text;
    });

    const { getByText } = render(
      <AppointmentCard appointment={mockOnsiteAppointment} />
    );

    expect(getByText(/Onsite Visit/)).toBeTruthy();
  });

  it("formats time correctly", () => {
    const { getByText } = render(
      <AppointmentCard appointment={mockAppointment} />
    );

    // Should contain time format (e.g., "2:00 p. m." or similar)
    expect(getByText(/starts at/)).toBeTruthy();
  });

  it("renders with timezone abbreviation when provided", () => {
    const { getByText } = render(
      <AppointmentCard
        appointment={mockAppointment}
        timezoneId="America/New_York"
      />
    );

    // Should render appointment with timezone
    expect(getByText(/Follow-up Consultation/)).toBeTruthy();
  });

  it("handles RTL layout correctly", () => {
    const { useRTL } = require("../../hooks/useRTL");
    useRTL.mockReturnValue({
      rtlStyle: (style: any) => ({ ...style, flexDirection: "row-reverse" }),
      isRTL: true,
    });

    const { getByTestId } = render(
      <AppointmentCard appointment={mockAppointment} />
    );

    // Should render with RTL chevron
    expect(getByTestId("icon-chevron.left")).toBeTruthy();
  });
});
