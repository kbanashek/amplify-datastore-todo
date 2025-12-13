import React from "react";
import { render } from "@testing-library/react-native";
import { AppointmentsGroupedView } from "../AppointmentsGroupedView";
import {
  GroupedAppointment,
  Appointment,
  AppointmentType,
  AppointmentStatus,
} from "../../types/Appointment";
import { AppointmentCard } from "../AppointmentCard";

// Mock AppointmentCard
jest.mock("../AppointmentCard", () => ({
  AppointmentCard: jest.fn(({ appointment, onPress }) => {
    const { View, Text, TouchableOpacity } = require("react-native");
    const Component = onPress ? TouchableOpacity : View;
    return (
      <Component testID={`appointment-${appointment.appointmentId}`}>
        <Text>{appointment.title}</Text>
      </Component>
    );
  }),
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

describe("AppointmentsGroupedView", () => {
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

  const mockGroupedAppointments: GroupedAppointment[] = [
    {
      date: "2025-12-12",
      dateLabel: "Today",
      appointments: [mockAppointment],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockTranslateText.mockImplementation(text => text);
  });

  it("renders loading state", () => {
    const { getByText } = render(
      <AppointmentsGroupedView groupedAppointments={[]} loading={true} />
    );

    expect(getByText("Loading appointments...")).toBeTruthy();
  });

  it("renders error state", () => {
    const errorMessage = "Failed to load appointments";
    const { getByText } = render(
      <AppointmentsGroupedView
        groupedAppointments={[]}
        loading={false}
        error={errorMessage}
      />
    );

    expect(getByText("Error loading appointments")).toBeTruthy();
    expect(getByText(errorMessage)).toBeTruthy();
  });

  it("renders empty state when no appointments", () => {
    const { getByText } = render(
      <AppointmentsGroupedView groupedAppointments={[]} loading={false} />
    );

    expect(getByText("No appointments scheduled")).toBeTruthy();
  });

  it("renders grouped appointments", () => {
    const { getByText, getByTestId } = render(
      <AppointmentsGroupedView
        groupedAppointments={mockGroupedAppointments}
        loading={false}
      />
    );

    expect(getByText("Today")).toBeTruthy();
    expect(getByText("Follow-up Consultation")).toBeTruthy();
    expect(getByTestId("appointment-Appointment.UUID-abc123")).toBeTruthy();
  });

  it("renders multiple appointment groups", () => {
    const multipleGroups: GroupedAppointment[] = [
      {
        date: "2025-12-12",
        dateLabel: "Today",
        appointments: [mockAppointment],
      },
      {
        date: "2025-12-13",
        dateLabel: "Tomorrow",
        appointments: [
          {
            ...mockAppointment,
            appointmentId: "Appointment.UUID-xyz789",
            title: "Lab Work",
          },
        ],
      },
    ];

    const { getByText, getByTestId } = render(
      <AppointmentsGroupedView
        groupedAppointments={multipleGroups}
        loading={false}
      />
    );

    expect(getByText("Today")).toBeTruthy();
    expect(getByText("Tomorrow")).toBeTruthy();
    expect(getByText("Follow-up Consultation")).toBeTruthy();
    expect(getByText("Lab Work")).toBeTruthy();
    expect(getByTestId("appointment-Appointment.UUID-abc123")).toBeTruthy();
    expect(getByTestId("appointment-Appointment.UUID-xyz789")).toBeTruthy();
  });

  it("calls onAppointmentPress when appointment is pressed", () => {
    const mockOnPress = jest.fn();
    render(
      <AppointmentsGroupedView
        groupedAppointments={mockGroupedAppointments}
        loading={false}
        onAppointmentPress={mockOnPress}
      />
    );

    // Since we're mocking AppointmentCard, we need to check it was called with onPress
    expect(AppointmentCard).toHaveBeenCalled();
    const callArgs = (AppointmentCard as jest.Mock).mock.calls[0][0];
    expect(callArgs.appointment).toEqual(mockAppointment);
    expect(callArgs.onPress).toBe(mockOnPress);
  });

  it("passes timezoneId to AppointmentCard", () => {
    const timezoneId = "America/New_York";
    render(
      <AppointmentsGroupedView
        groupedAppointments={mockGroupedAppointments}
        loading={false}
        timezoneId={timezoneId}
      />
    );

    expect(AppointmentCard).toHaveBeenCalled();
    const callArgs = (AppointmentCard as jest.Mock).mock.calls[0][0];
    expect(callArgs.appointment).toEqual(mockAppointment);
    expect(callArgs.timezoneId).toBe(timezoneId);
  });

  it("renders date header with formatted date", () => {
    const { getByText } = render(
      <AppointmentsGroupedView
        groupedAppointments={mockGroupedAppointments}
        loading={false}
      />
    );

    // Should render both date label and formatted date
    expect(getByText("Today")).toBeTruthy();
    // The formatted date should also be present
    expect(getByText(/December/)).toBeTruthy();
  });
});
