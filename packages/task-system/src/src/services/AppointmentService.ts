import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appointment, AppointmentData } from "../types/Appointment";
import { parseAppointmentData } from "../utils/appointmentParser";
import { logWithPlatform, logErrorWithPlatform } from "../utils/platformLogger";

const APPOINTMENTS_STORAGE_KEY = "@appointments_data";

/**
 * Service for loading and managing appointment data
 * Loads from JSON file following the same pattern as tasks
 */
export class AppointmentService {
  /**
   * Load appointment data from JSON file or AsyncStorage
   * In production, this would load from an API or DataStore
   */
  static async loadAppointments(): Promise<AppointmentData | null> {
    try {
      // First try to load from AsyncStorage (seeded data)
      const storedData = await AsyncStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      if (storedData) {
        const parsed = JSON.parse(storedData) as AppointmentData;
        const itemsCount =
          parsed.clinicPatientAppointments?.clinicAppointments?.items?.length ||
          0;
        logWithPlatform(
          "📅",
          "",
          "AppointmentService",
          `Loaded ${itemsCount} appointments from AsyncStorage`,
          { timezone: parsed.siteTimezoneId }
        );
        return parsed;
      }

      // Fallback to bundled JSON file
      const appointmentData: AppointmentData =
        typeof window === "undefined"
          ? require("../../appointments.json")
          : (await import("../../appointments.json")).default;
      const itemsCount =
        appointmentData.clinicPatientAppointments?.clinicAppointments?.items
          ?.length || 0;
      logWithPlatform(
        "📅",
        "",
        "AppointmentService",
        `Loaded ${itemsCount} appointments from bundled JSON`
      );
      return appointmentData;
    } catch (error) {
      logErrorWithPlatform(
        "",
        "AppointmentService",
        "Failed to load appointments",
        error
      );
      return null;
    }
  }

  /**
   * Save appointment data to AsyncStorage
   * Used by seed scripts to persist generated appointments
   */
  static async saveAppointments(data: AppointmentData): Promise<void> {
    try {
      const jsonString = JSON.stringify(data);
      const count =
        data.clinicPatientAppointments.clinicAppointments.items.length;
      console.log(
        `💾 [AppointmentService] Saving ${count} appointments to AsyncStorage`,
        { timezone: data.siteTimezoneId }
      );

      await AsyncStorage.setItem(APPOINTMENTS_STORAGE_KEY, jsonString);

      // Verify it was saved
      const verify = await AsyncStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      if (verify) {
        console.log(
          `✅ [AppointmentService] Verified ${count} appointments saved`
        );
      }
    } catch (error) {
      console.error(
        "❌ [AppointmentService] Failed to save appointments",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * Clear all stored appointments
   */
  static async clearAppointments(): Promise<void> {
    try {
      await AsyncStorage.removeItem(APPOINTMENTS_STORAGE_KEY);
      console.log("🗑️ [AppointmentService] Cleared appointments from storage");
    } catch (error) {
      console.error(
        "❌ [AppointmentService] Failed to clear appointments",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * Get all appointments
   * @param todayOnly - If true, only return appointments for today (default: false)
   * @returns {Promise<Appointment[]>} - Array of appointments
   */
  static async getAppointments(
    todayOnly: boolean = false
  ): Promise<Appointment[]> {
    try {
      const data = await this.loadAppointments();
      if (!data) {
        return [];
      }
      const allAppointments = parseAppointmentData(data);

      if (!todayOnly) {
        return allAppointments;
      }

      // Filter for today's appointments
      const now = new Date();
      const todayStart = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
      );
      todayStart.setHours(0, 0, 0, 0);
      const todayEnd = new Date(todayStart);
      todayEnd.setDate(todayEnd.getDate() + 1);

      const filtered = allAppointments.filter(appointment => {
        const startDate = new Date(appointment.startAt);

        // Get the date parts in local timezone for both dates
        const appointmentYear = startDate.getFullYear();
        const appointmentMonth = startDate.getMonth();
        const appointmentDay = startDate.getDate();

        const todayYear = todayStart.getFullYear();
        const todayMonth = todayStart.getMonth();
        const todayDay = todayStart.getDate();

        // Compare date parts directly (year, month, day)
        const isToday =
          appointmentYear === todayYear &&
          appointmentMonth === todayMonth &&
          appointmentDay === todayDay;

        return isToday;
      });

      console.log(
        `📅 [AppointmentService] Filtered ${filtered.length} of ${allAppointments.length} appointments for today`
      );

      // If no appointments match today but we have appointments, log a warning
      if (filtered.length === 0 && allAppointments.length > 0) {
        const todayStr = `${todayStart.getFullYear()}-${
          todayStart.getMonth() + 1
        }-${todayStart.getDate()}`;
        console.warn(
          `⚠️ [AppointmentService] No appointments found for today (${todayStr})`,
          { totalAvailable: allAppointments.length }
        );
      }

      return filtered;
    } catch (error) {
      console.error(
        "❌ [AppointmentService] Failed to fetch appointments",
        error instanceof Error ? error.message : String(error)
      );
      throw error;
    }
  }

  /**
   * Get appointment data with timezone
   * @returns {Promise<AppointmentData | null>} - Full appointment data including timezone
   */
  static async getAppointmentData(): Promise<AppointmentData | null> {
    return await this.loadAppointments();
  }
}
