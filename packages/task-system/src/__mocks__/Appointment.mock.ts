/**
 * Mock Appointment data factory for testing.
 *
 * Provides consistent Appointment object creation across all tests.
 */

import { Appointment, AppointmentType } from "@task-types/Appointment";

/**
 * Creates a mock Appointment with a fixed date to prevent snapshot drift.
 *
 * Uses a fixed date by default to ensure snapshots remain stable over time.
 *
 * @param id - Unique appointment identifier
 * @param title - Appointment title
 * @param startAt - Optional ISO date string (defaults to fixed date: 2025-01-15T10:00:00.000Z)
 * @returns A complete mock Appointment object
 *
 * @example
 * ```typescript
 * const appointment = createMockAppointment("appt-1", "Doctor Visit");
 * // Uses fixed date to prevent snapshot failures
 *
 * const customAppointment = createMockAppointment(
 *   "appt-2",
 *   "Meeting",
 *   "2025-02-01T14:00:00.000Z"
 * );
 * ```
 */
export const createMockAppointment = (
  id: string,
  title: string,
  startAt: string = "2025-01-15T10:00:00.000Z"
): Appointment =>
  ({
    appointmentId: id,
    title,
    startAt,
    appointmentType: AppointmentType.ONSITE,
    pk: `APPT-${id}`,
  }) as unknown as Appointment;
