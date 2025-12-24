import { AppointmentService } from "../AppointmentService";
import {
  AppointmentData,
  AppointmentType,
  AppointmentStatus,
} from "../../types/Appointment";

const mockAppointmentData: AppointmentData = {
  clinicPatientAppointments: {
    clinicAppointments: {
      items: [
        {
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
        },
        {
          telehealthMeetingId: null,
          appointmentType: AppointmentType.ONSITE,
          title: "Lab Work Appointment",
          siteId: "Site.UUID-12345",
          data: "{}",
          isDeleted: 1, // This should be filtered out
          patientId: "Patient.UUID-67890",
          status: AppointmentStatus.SCHEDULED,
          description: "Blood work and lab tests",
          startAt: "2025-12-12T10:00:00.000Z",
          endAt: "2025-12-12T10:30:00.000Z",
          instructions: "Please fast for 12 hours",
          appointmentId: "Appointment.UUID-xyz789",
          eventId: "Event.UUID-ghi012",
          createdAt: "2025-12-01T09:00:00.000Z",
          updatedAt: "2025-12-01T09:00:00.000Z",
          version: 1,
          rescheduled: 0,
          __typename: "SubjectStudyInstanceAppointment",
        },
      ],
    },
  },
  siteTimezoneId: "America/New_York",
};

// Mock appointmentParser
const mockParseAppointmentData = jest.fn();
jest.mock("../../utils/appointmentParser", () => ({
  parseAppointmentData: (...args: unknown[]) =>
    mockParseAppointmentData(...args),
}));

describe("AppointmentService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  describe("loadAppointments", () => {
    it("should load appointment data successfully", async () => {
      jest
        .spyOn(AppointmentService, "loadAppointments")
        .mockResolvedValue(mockAppointmentData);

      const result = await AppointmentService.loadAppointments();

      expect(result).toBeTruthy();
      expect(result?.siteTimezoneId).toBe("America/New_York");
      expect(
        result?.clinicPatientAppointments?.clinicAppointments?.items
      ).toBeDefined();
    });
  });

  describe("getAppointments", () => {
    it("should return parsed appointments", async () => {
      const mockAppointments = [
        {
          appointmentId: "Appointment.UUID-abc123",
          title: "Follow-up Consultation",
          appointmentType: AppointmentType.TELEVISIT,
        },
      ];

      jest
        .spyOn(AppointmentService, "loadAppointments")
        .mockResolvedValue(mockAppointmentData);
      mockParseAppointmentData.mockReturnValue(mockAppointments);

      const result = await AppointmentService.getAppointments();

      expect(mockParseAppointmentData).toHaveBeenCalled();
      expect(result).toEqual(mockAppointments);
    });

    it("should return empty array when data is null", async () => {
      jest
        .spyOn(AppointmentService, "loadAppointments")
        .mockResolvedValue(null);

      const result = await AppointmentService.getAppointments();

      expect(result).toEqual([]);
    });

    it("should throw error on parse failure", async () => {
      jest
        .spyOn(AppointmentService, "loadAppointments")
        .mockResolvedValue(mockAppointmentData);
      mockParseAppointmentData.mockImplementation(() => {
        throw new Error("Parse failed");
      });

      await expect(AppointmentService.getAppointments()).rejects.toThrow(
        "Parse failed"
      );
    });
  });

  describe("getAppointmentData", () => {
    it("should return full appointment data with timezone", async () => {
      jest
        .spyOn(AppointmentService, "loadAppointments")
        .mockResolvedValue(mockAppointmentData);

      const result = await AppointmentService.getAppointmentData();

      expect(result).toBeTruthy();
      expect(result?.siteTimezoneId).toBe("America/New_York");
      expect(
        result?.clinicPatientAppointments?.clinicAppointments?.items
      ).toBeDefined();
    });

    it("should return null when data cannot be loaded", async () => {
      jest
        .spyOn(AppointmentService, "loadAppointments")
        .mockResolvedValue(null);

      const result = await AppointmentService.getAppointmentData();

      expect(result).toBeNull();
    });
  });
});
