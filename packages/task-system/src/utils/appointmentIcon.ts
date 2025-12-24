import { AppointmentType } from "@task-types/Appointment";

/**
 * Icon configuration for appointment display
 */
export interface AppointmentIconConfig {
  iconName: string;
  translationKey: string;
}

/**
 * Gets the appropriate icon and translation key for an appointment type.
 *
 * Determines the visual representation based on whether the appointment
 * is telehealth (virtual) or onsite (in-person).
 *
 * @param appointmentType - The type of appointment (TELEHEALTH or ONSITE)
 * @returns Object containing the icon name and translation key
 *
 * @example
 * ```typescript
 * const config = getAppointmentIconConfig(AppointmentType.TELEHEALTH);
 * // Returns: { iconName: "video.fill", translationKey: "appointment.telehealth" }
 *
 * const config = getAppointmentIconConfig(AppointmentType.ONSITE);
 * // Returns: { iconName: "building.2.fill", translationKey: "appointment.onsiteVisit" }
 * ```
 */
export const getAppointmentIconConfig = (
  appointmentType: AppointmentType
): AppointmentIconConfig => {
  const isTelehealth = appointmentType === AppointmentType.TELEVISIT;

  return {
    iconName: isTelehealth ? "video.fill" : "building.2.fill",
    translationKey: isTelehealth
      ? "appointment.telehealth"
      : "appointment.onsiteVisit",
  };
};
