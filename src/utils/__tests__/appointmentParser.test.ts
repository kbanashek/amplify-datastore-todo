import {
  parseAppointmentData,
  formatDateLabel,
  formatTime,
  groupAppointmentsByDate,
  getTimezoneAbbreviation,
} from "../appointmentParser";
import {
  AppointmentData,
  Appointment,
  AppointmentType,
  AppointmentStatus,
} from "../../types/Appointment";

describe("appointmentParser", () => {
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
            isDeleted: 1, // Should be filtered out
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

  describe("parseAppointmentData", () => {
    it("should parse appointment data correctly", () => {
      const result = parseAppointmentData(mockAppointmentData);

      expect(result).toHaveLength(1);
      expect(result[0].appointmentId).toBe("Appointment.UUID-abc123");
      expect(result[0].title).toBe("Follow-up Consultation");
    });

    it("should filter out deleted appointments", () => {
      const result = parseAppointmentData(mockAppointmentData);

      expect(result).toHaveLength(1);
      expect(
        result.find(a => a.appointmentId === "Appointment.UUID-xyz789")
      ).toBeUndefined();
    });

    it("should return empty array when data is null", () => {
      const result = parseAppointmentData(null as any);

      expect(result).toEqual([]);
    });

    it("should return empty array when items is missing", () => {
      const invalidData = {
        clinicPatientAppointments: {
          clinicAppointments: {},
        },
      } as any;

      const result = parseAppointmentData(invalidData);

      expect(result).toEqual([]);
    });

    it("should return empty array when items is not an array", () => {
      const invalidData = {
        clinicPatientAppointments: {
          clinicAppointments: {
            items: "not an array",
          },
        },
      } as any;

      const result = parseAppointmentData(invalidData);

      expect(result).toEqual([]);
    });
  });

  describe("formatDateLabel", () => {
    it("should return 'Today' for today's date", () => {
      const today = new Date();
      const result = formatDateLabel(today, today);

      expect(result).toBe("Today");
    });

    it("should return 'Tomorrow' for tomorrow's date", () => {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const result = formatDateLabel(tomorrow, today);

      expect(result).toBe("Tomorrow");
    });

    it("should return 'Day After Tomorrow' for day after tomorrow", () => {
      const today = new Date();
      const dayAfter = new Date(today);
      dayAfter.setDate(dayAfter.getDate() + 2);

      const result = formatDateLabel(dayAfter, today);

      expect(result).toBe("Day After Tomorrow");
    });

    it("should return formatted date for dates beyond day after tomorrow", () => {
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(futureDate.getDate() + 5);

      const result = formatDateLabel(futureDate, today);

      // Should be formatted as "Dec 17, 2025" (or similar)
      expect(result).toMatch(/\w{3} \d{1,2}, \d{4}/);
    });
  });

  describe("formatTime", () => {
    it("should format time in 12-hour format with periods", () => {
      const date = new Date("2025-12-12T14:00:00.000Z");
      const result = formatTime(date);

      // Should be in format "2:00 p. m." or similar
      expect(result).toMatch(/\d{1,2}:\d{2} [ap]\. m\./);
    });

    it("should format morning time correctly", () => {
      const date = new Date("2025-12-12T10:30:00.000Z");
      const result = formatTime(date);

      expect(result).toMatch(/a\. m\./);
    });

    it("should format afternoon time correctly", () => {
      // Use a time that's definitely afternoon (2 PM local time)
      const date = new Date();
      date.setHours(14, 0, 0, 0); // 2:00 PM
      const result = formatTime(date);

      expect(result).toMatch(/p\. m\./);
    });
  });

  describe("groupAppointmentsByDate", () => {
    const mockAppointments: Appointment[] = [
      {
        ...mockAppointmentData.clinicPatientAppointments.clinicAppointments
          .items[0],
        isDeleted: 0,
      } as Appointment,
      {
        telehealthMeetingId: null,
        appointmentType: AppointmentType.ONSITE,
        title: "Lab Work Appointment",
        siteId: "Site.UUID-12345",
        data: "{}",
        isDeleted: 0,
        patientId: "Patient.UUID-67890",
        status: AppointmentStatus.SCHEDULED,
        description: "Blood work and lab tests",
        startAt: "2025-12-13T10:00:00.000Z", // Different date
        endAt: "2025-12-13T10:30:00.000Z",
        instructions: "Please fast for 12 hours",
        appointmentId: "Appointment.UUID-xyz789",
        eventId: "Event.UUID-ghi012",
        createdAt: "2025-12-01T09:00:00.000Z",
        updatedAt: "2025-12-01T09:00:00.000Z",
        version: 1,
        rescheduled: 0,
        __typename: "SubjectStudyInstanceAppointment",
      },
      {
        ...mockAppointmentData.clinicPatientAppointments.clinicAppointments
          .items[0],
        appointmentId: "Appointment.UUID-def456",
        startAt: "2025-12-12T16:00:00.000Z", // Same date, different time
      } as Appointment,
    ];

    it("should group appointments by date", () => {
      const result = groupAppointmentsByDate(mockAppointments);

      expect(result).toHaveLength(2);
      expect(result[0].date).toBe("2025-12-12");
      expect(result[1].date).toBe("2025-12-13");
    });

    it("should sort appointments within each group by start time", () => {
      const result = groupAppointmentsByDate(mockAppointments);

      const day1Appointments = result.find(
        g => g.date === "2025-12-12"
      )?.appointments;
      expect(day1Appointments).toHaveLength(2);
      // First appointment should be earlier
      expect(new Date(day1Appointments![0].startAt).getTime()).toBeLessThan(
        new Date(day1Appointments![1].startAt).getTime()
      );
    });

    it("should sort groups by date", () => {
      const result = groupAppointmentsByDate(mockAppointments);

      expect(result[0].date).toBe("2025-12-12");
      expect(result[1].date).toBe("2025-12-13");
    });

    it("should include dateLabel for each group", () => {
      const result = groupAppointmentsByDate(mockAppointments);

      expect(result[0].dateLabel).toBeDefined();
      expect(result[1].dateLabel).toBeDefined();
    });

    it("should handle empty appointments array", () => {
      const result = groupAppointmentsByDate([]);

      expect(result).toEqual([]);
    });

    it("should use timezoneId when provided", () => {
      const result = groupAppointmentsByDate(
        mockAppointments,
        "America/New_York"
      );

      expect(result).toHaveLength(2);
      // Timezone is used internally for date calculations
      expect(result[0].date).toBeDefined();
    });
  });

  describe("getTimezoneAbbreviation", () => {
    it("should extract abbreviation from valid timezone ID", () => {
      expect(getTimezoneAbbreviation("America/New_York")).toBe("NYO");
      expect(getTimezoneAbbreviation("Europe/London")).toBe("LON");
      expect(getTimezoneAbbreviation("Asia/Tokyo")).toBe("TOK");
    });

    it("should return empty string for null or undefined", () => {
      expect(getTimezoneAbbreviation(null)).toBe("");
      expect(getTimezoneAbbreviation(undefined)).toBe("");
    });

    it("should return empty string for timezone ID without slash", () => {
      expect(getTimezoneAbbreviation("UTC")).toBe("");
      expect(getTimezoneAbbreviation("EST")).toBe("");
    });

    it("should handle timezone IDs with multiple slashes", () => {
      expect(getTimezoneAbbreviation("America/New_York/Zone")).toBe("ZON");
    });

    it("should handle short timezone segments", () => {
      expect(getTimezoneAbbreviation("America/LA")).toBe("LA");
      expect(getTimezoneAbbreviation("US/CA")).toBe("CA");
    });
  });
});
