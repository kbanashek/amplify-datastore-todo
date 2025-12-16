import { renderHook, waitFor, act } from "@testing-library/react-native";
import { Appointment, AppointmentData } from "../../types/Appointment";

// Mock AppointmentService from @orion/task-system - MUST be before hook import
jest.mock("@orion/task-system", () => ({
  AppointmentService: {
    getAppointmentData: jest.fn(),
    getAppointments: jest.fn(),
    clearAppointments: jest.fn(),
  },
}));

// Import the hook directly from source (like the package test does)
import { useAppointmentList } from "../../../packages/task-system/src/src/hooks/useAppointmentList";
import { AppointmentService } from "@orion/task-system";

// Get typed mocks
const mockGetAppointmentData =
  AppointmentService.getAppointmentData as jest.MockedFunction<
    typeof AppointmentService.getAppointmentData
  >;
const mockGetAppointments =
  AppointmentService.getAppointments as jest.MockedFunction<
    typeof AppointmentService.getAppointments
  >;

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
    mockGetAppointmentData.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    const { result } = renderHook(() => useAppointmentList());

    expect(result.current.loading).toBe(true);
    expect(result.current.appointments).toEqual([]);
    expect(result.current.appointmentData).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should load appointments successfully", async () => {
    mockGetAppointmentData.mockResolvedValue(mockAppointmentData);
    mockGetAppointments.mockResolvedValue(mockAppointments);

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
    mockGetAppointmentData.mockRejectedValue(error);

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
    mockGetAppointmentData.mockResolvedValue(null);

    const { result } = renderHook(() => useAppointmentList());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.appointments).toEqual([]);
    expect(result.current.appointmentData).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it("should refresh appointments when refreshAppointments is called", async () => {
    mockGetAppointmentData.mockResolvedValue(mockAppointmentData);
    mockGetAppointments.mockResolvedValue(mockAppointments);

    const { result } = renderHook(() => useAppointmentList());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear mocks to verify refresh calls them again
    jest.clearAllMocks();
    mockGetAppointmentData.mockResolvedValue(mockAppointmentData);
    mockGetAppointments.mockResolvedValue(mockAppointments);

    await act(async () => {
      await result.current.refreshAppointments();
    });

    expect(mockGetAppointmentData).toHaveBeenCalled();
    expect(mockGetAppointments).toHaveBeenCalled();
  });
});
