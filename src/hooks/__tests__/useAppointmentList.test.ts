import { renderHook, waitFor } from "@testing-library/react-native";
import { AppointmentService } from "../../services/AppointmentService";
import { Appointment, AppointmentData } from "../../types/Appointment";
import { useAppointmentList } from "../useAppointmentList";

// Mock AppointmentService
jest.mock("../../services/AppointmentService", () => ({
  AppointmentService: {
    getAppointmentData: jest.fn(),
    getAppointments: jest.fn(),
  },
}));

describe("useAppointmentList", () => {
  const mockAppointmentData: AppointmentData = {
    clinicPatientAppointments: {
      clinicAppointments: {
        items: [
          {
            telehealthMeetingId: "meeting-123",
            appointmentType: "TELEVISIT",
            title: "Follow-up Consultation",
            siteId: "Site.UUID-12345",
            data: "{}",
            isDeleted: 0,
            patientId: "Patient.UUID-67890",
            status: "SCHEDULED",
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
          },
        ],
      },
    },
    siteTimezoneId: "America/New_York",
  };

  const mockAppointments: Appointment[] = [
    {
      telehealthMeetingId: "meeting-123",
      appointmentType: "TELEVISIT",
      title: "Follow-up Consultation",
      siteId: "Site.UUID-12345",
      data: "{}",
      isDeleted: 0,
      patientId: "Patient.UUID-67890",
      status: "SCHEDULED",
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
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with loading state", () => {
    (AppointmentService.getAppointmentData as jest.Mock).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useAppointmentList());

    expect(result.current.loading).toBe(true);
    expect(result.current.appointments).toEqual([]);
    expect(result.current.appointmentData).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should load appointments successfully", async () => {
    (AppointmentService.getAppointmentData as jest.Mock).mockResolvedValue(
      mockAppointmentData
    );
    (AppointmentService.getAppointments as jest.Mock).mockResolvedValue(
      mockAppointments
    );

    const { result } = renderHook(() => useAppointmentList());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.appointments).toEqual(mockAppointments);
    expect(result.current.appointmentData).toEqual(mockAppointmentData);
    expect(result.current.error).toBeNull();
  });

  it("should handle error when loading fails", async () => {
    const error = new Error("Failed to load");
    (AppointmentService.getAppointmentData as jest.Mock).mockRejectedValue(
      error
    );

    const { result } = renderHook(() => useAppointmentList());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(
      "Failed to load appointments. Please try again."
    );
    expect(result.current.appointments).toEqual([]);
    expect(result.current.appointmentData).toBeNull();
  });

  it("should handle null appointment data", async () => {
    (AppointmentService.getAppointmentData as jest.Mock).mockResolvedValue(
      null
    );

    const { result } = renderHook(() => useAppointmentList());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.appointments).toEqual([]);
    expect(result.current.appointmentData).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should refresh appointments when refreshAppointments is called", async () => {
    (AppointmentService.getAppointmentData as jest.Mock).mockResolvedValue(
      mockAppointmentData
    );
    (AppointmentService.getAppointments as jest.Mock).mockResolvedValue(
      mockAppointments
    );

    const { result } = renderHook(() => useAppointmentList());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear mocks to verify refresh calls them again
    jest.clearAllMocks();
    (AppointmentService.getAppointmentData as jest.Mock).mockResolvedValue(
      mockAppointmentData
    );
    (AppointmentService.getAppointments as jest.Mock).mockResolvedValue(
      mockAppointments
    );

    await result.current.refreshAppointments();

    expect(AppointmentService.getAppointmentData).toHaveBeenCalled();
    expect(AppointmentService.getAppointments).toHaveBeenCalled();
  });
});
