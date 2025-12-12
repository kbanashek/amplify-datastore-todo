// Appointment type definitions based on the JSON structure

export enum AppointmentType {
  TELEVISIT = "TELEVISIT",
  ONSITE = "ONSITE",
}

export enum AppointmentStatus {
  SCHEDULED = "SCHEDULED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
  IN_PROGRESS = "IN_PROGRESS",
}

export interface Appointment {
  appointmentId: string;
  eventId: string;
  patientId: string;
  siteId: string;
  title: string;
  description?: string | null;
  appointmentType: AppointmentType;
  status: AppointmentStatus;
  startAt: string; // ISO 8601 date string
  endAt: string; // ISO 8601 date string
  instructions?: string | null;
  telehealthMeetingId?: string | null;
  data?: string | null; // JSON string
  isDeleted: number; // 0 or 1
  rescheduled: number; // 0 or 1
  createdAt: string;
  updatedAt: string;
  version: number;
  __typename: string;
}

export interface ClinicAppointments {
  items: Appointment[];
}

export interface ClinicPatientAppointments {
  clinicAppointments: ClinicAppointments;
}

export interface AppointmentData {
  clinicPatientAppointments: ClinicPatientAppointments;
  siteTimezoneId: string;
}

// Grouped appointment structure (similar to tasks)
export interface GroupedAppointment {
  date: string; // YYYY-MM-DD
  dateLabel: string; // "Today", "Tomorrow", "Dec 12, 2025"
  appointments: Appointment[];
}

