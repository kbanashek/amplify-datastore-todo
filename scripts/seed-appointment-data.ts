/**
 * Seed script to create Appointment data
 *
 * This script creates sample appointments and returns them as AppointmentData
 *
 * Usage:
 * - Import and run in your app, or
 * - Run via a test/development screen
 *
 * Note: In React Native, this generates the data structure which can then be
 * stored using AppointmentService.saveAppointments()
 */

import {
  Appointment,
  AppointmentData,
  AppointmentType,
  AppointmentStatus,
} from "../src/types/Appointment";

// Logging helper
const log = (message: string, data?: any) => {
  console.log(`[SeedAppointmentScript] ${message}`, data || "");
};

// Helper to generate UUID-like IDs
function generateId(prefix: string): string {
  const random =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);
  return `${prefix}.${random}`;
}

// Helper to format date as ISO string
function formatDate(date: Date): string {
  return date.toISOString();
}

// Helper to add days to a date
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Helper to set time on a date
function setTime(date: Date, hours: number, minutes: number = 0): Date {
  const result = new Date(date);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

/**
 * Create a sample appointment
 */
function createAppointment(
  title: string,
  description: string,
  appointmentType: AppointmentType,
  status: AppointmentStatus,
  startDate: Date,
  durationMinutes: number = 60,
  instructions?: string,
  telehealthMeetingId?: string | null
): Appointment {
  const endDate = new Date(startDate);
  endDate.setMinutes(endDate.getMinutes() + durationMinutes);

  const now = new Date();

  return {
    appointmentId: generateId("Appointment"),
    eventId: generateId("Event"),
    patientId: generateId("Patient"),
    siteId: generateId("Site"),
    title,
    description,
    appointmentType,
    status,
    startAt: formatDate(startDate),
    endAt: formatDate(endDate),
    instructions: instructions || null,
    telehealthMeetingId: telehealthMeetingId || null,
    data: "{}",
    isDeleted: 0,
    rescheduled: 0,
    createdAt: formatDate(now),
    updatedAt: formatDate(now),
    version: 1,
    __typename: "SubjectStudyInstanceAppointment",
  };
}

/**
 * Generate appointments for multiple days
 *
 * IMPORTANT: This function creates appointments dynamically based on the current date.
 * Each time it's called, it uses the current date/time, so appointments will always
 * be created for "today" relative to when the seed function is executed.
 */
function generateAppointments(): Appointment[] {
  const appointments: Appointment[] = [];
  // Get current date - this is dynamic and will be different each time the function runs
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  console.log("[SeedAppointmentScript] Generating appointments", {
    today: today.toISOString(),
    todayDateString: today.toDateString(),
    note: "Appointments are created dynamically for the current date",
  });

  // Today's appointments - create with explicit today date
  const today9am = new Date(today);
  today9am.setHours(9, 0, 0, 0);

  const today2pm = new Date(today);
  today2pm.setHours(14, 0, 0, 0);

  const today430pm = new Date(today);
  today430pm.setHours(16, 30, 0, 0);

  console.log("[SeedAppointmentScript] Today appointment times", {
    today9am: today9am.toISOString(),
    today2pm: today2pm.toISOString(),
    today430pm: today430pm.toISOString(),
  });

  appointments.push(
    createAppointment(
      "Morning Check-up",
      "Regular health check-up with primary care physician",
      AppointmentType.ONSITE,
      AppointmentStatus.SCHEDULED,
      today9am,
      30,
      "Please bring your insurance card and ID",
      null
    ),
    createAppointment(
      "Telehealth Consultation",
      "Follow-up consultation via video call",
      AppointmentType.TELEVISIT,
      AppointmentStatus.SCHEDULED,
      today2pm,
      45,
      "Please join the meeting 5 minutes early",
      "meeting-telehealth-001"
    ),
    createAppointment(
      "Lab Work",
      "Blood work and routine lab tests",
      AppointmentType.ONSITE,
      AppointmentStatus.SCHEDULED,
      today430pm,
      30,
      "Please fast for 12 hours before the appointment",
      null
    )
  );

  // Tomorrow's appointments
  const tomorrow = addDays(today, 1);
  appointments.push(
    createAppointment(
      "Specialist Consultation",
      "Consultation with cardiologist",
      AppointmentType.ONSITE,
      AppointmentStatus.SCHEDULED,
      setTime(tomorrow, 10, 0),
      60,
      "Please bring all previous test results",
      null
    ),
    createAppointment(
      "Physical Therapy Session",
      "Physical therapy session for rehabilitation",
      AppointmentType.ONSITE,
      AppointmentStatus.SCHEDULED,
      setTime(tomorrow, 15, 0),
      60,
      "Wear comfortable clothing",
      null
    )
  );

  // Day after tomorrow
  const dayAfterTomorrow = addDays(today, 2);
  appointments.push(
    createAppointment(
      "Follow-up Telehealth",
      "Follow-up appointment via video call",
      AppointmentType.TELEVISIT,
      AppointmentStatus.SCHEDULED,
      setTime(dayAfterTomorrow, 11, 0),
      30,
      "Please have your medication list ready",
      "meeting-telehealth-002"
    )
  );

  // Next week appointments
  const nextWeek = addDays(today, 7);
  appointments.push(
    createAppointment(
      "Annual Physical Exam",
      "Comprehensive annual physical examination",
      AppointmentType.ONSITE,
      AppointmentStatus.SCHEDULED,
      setTime(nextWeek, 9, 0),
      90,
      "Please bring a list of all current medications",
      null
    ),
    createAppointment(
      "Mental Health Consultation",
      "Telehealth consultation with mental health specialist",
      AppointmentType.TELEVISIT,
      AppointmentStatus.SCHEDULED,
      setTime(nextWeek, 14, 0),
      60,
      "Please find a quiet, private space for the call",
      "meeting-telehealth-003"
    )
  );

  // Add some completed appointments (past dates)
  const yesterday = addDays(today, -1);
  appointments.push(
    createAppointment(
      "Completed Check-up",
      "Regular check-up that was completed",
      AppointmentType.ONSITE,
      AppointmentStatus.COMPLETED,
      setTime(yesterday, 10, 0),
      30,
      undefined,
      undefined
    )
  );

  // Add a cancelled appointment
  const lastWeek = addDays(today, -7);
  appointments.push(
    createAppointment(
      "Cancelled Appointment",
      "Appointment that was cancelled",
      AppointmentType.TELEVISIT,
      AppointmentStatus.CANCELLED,
      setTime(lastWeek, 15, 0),
      45,
      undefined,
      "meeting-cancelled-001"
    )
  );

  return appointments;
}

/**
 * Main seed function - creates appointments and writes to JSON file
 */
export async function seedAppointmentData(): Promise<AppointmentData> {
  try {
    log("Starting to seed appointment data...");

    const appointments = generateAppointments();

    const appointmentData: AppointmentData = {
      clinicPatientAppointments: {
        clinicAppointments: {
          items: appointments,
        },
      },
      siteTimezoneId: "America/New_York",
    };

    log("Seeding complete!", {
      appointmentsCount: appointments.length,
      todayAppointments: appointments.filter(apt => {
        const startDate = new Date(apt.startAt);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = addDays(today, 1);
        return startDate >= today && startDate < tomorrow;
      }).length,
      telehealthCount: appointments.filter(
        apt => apt.appointmentType === AppointmentType.TELEVISIT
      ).length,
      onsiteCount: appointments.filter(
        apt => apt.appointmentType === AppointmentType.ONSITE
      ).length,
    });

    return appointmentData;
  } catch (error) {
    log("ERROR: Seeding failed", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    console.error("[SeedAppointmentScript] Full error:", error);
    throw error;
  }
}

// Export for use in React Native
export default seedAppointmentData;
