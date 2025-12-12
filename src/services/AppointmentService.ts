import AsyncStorage from "@react-native-async-storage/async-storage";
import { Appointment, AppointmentData } from "../types/Appointment";
import { parseAppointmentData } from "../utils/appointmentParser";

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
        console.log(
          "[AppointmentService] Loading appointments from AsyncStorage",
          {
            dataLength: storedData.length,
            hasData: !!storedData,
          }
        );
        const parsed = JSON.parse(storedData) as AppointmentData;
        console.log("[AppointmentService] Parsed AsyncStorage data", {
          hasClinicPatientAppointments: !!parsed.clinicPatientAppointments,
          hasClinicAppointments:
            !!parsed.clinicPatientAppointments?.clinicAppointments,
          itemsCount:
            parsed.clinicPatientAppointments?.clinicAppointments?.items
              ?.length || 0,
          siteTimezoneId: parsed.siteTimezoneId,
          sampleItems:
            parsed.clinicPatientAppointments?.clinicAppointments?.items
              ?.slice(0, 2)
              .map((apt: any) => ({
                title: apt.title,
                startAt: apt.startAt,
                appointmentId: apt.appointmentId,
              })),
        });
        return parsed;
      }

      // Fallback to bundled JSON file
      console.log(
        "[AppointmentService] Loading appointments from bundled JSON"
      );
      const appointmentData: AppointmentData =
        typeof window === "undefined"
          ? require("../../appointments.json")
          : (await import("../../appointments.json")).default;
      console.log("[AppointmentService] Loaded bundled JSON", {
        itemsCount:
          appointmentData.clinicPatientAppointments?.clinicAppointments?.items
            ?.length || 0,
      });
      return appointmentData;
    } catch (error) {
      console.error("[AppointmentService] Error loading appointments:", error);
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
      console.log("[AppointmentService] Saving appointments to AsyncStorage", {
        count: data.clinicPatientAppointments.clinicAppointments.items.length,
        jsonLength: jsonString.length,
        siteTimezoneId: data.siteTimezoneId,
        sampleItems: data.clinicPatientAppointments.clinicAppointments.items
          .slice(0, 2)
          .map((apt) => ({
            title: apt.title,
            startAt: apt.startAt,
            appointmentId: apt.appointmentId,
          })),
      });

      await AsyncStorage.setItem(APPOINTMENTS_STORAGE_KEY, jsonString);

      // Verify it was saved
      const verify = await AsyncStorage.getItem(APPOINTMENTS_STORAGE_KEY);
      console.log("[AppointmentService] Verified save to AsyncStorage", {
        saved: !!verify,
        savedLength: verify?.length || 0,
      });
    } catch (error) {
      console.error("[AppointmentService] Error saving appointments:", error);
      throw error;
    }
  }

  /**
   * Clear all stored appointments
   */
  static async clearAppointments(): Promise<void> {
    try {
      await AsyncStorage.removeItem(APPOINTMENTS_STORAGE_KEY);
      console.log(
        "[AppointmentService] Cleared appointments from AsyncStorage"
      );
    } catch (error) {
      console.error("[AppointmentService] Error clearing appointments:", error);
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

      console.log("[AppointmentService] Filtering for today", {
        now: now.toISOString(),
        todayStart: todayStart.toISOString(),
        todayEnd: todayEnd.toISOString(),
        totalAppointments: allAppointments.length,
      });

      const filtered = allAppointments.filter((appointment) => {
        const startDate = new Date(appointment.startAt);

        // Normalize both dates to just the date part (ignore time) for comparison
        const appointmentDate = new Date(
          startDate.getFullYear(),
          startDate.getMonth(),
          startDate.getDate()
        );
        const todayDate = new Date(
          todayStart.getFullYear(),
          todayStart.getMonth(),
          todayStart.getDate()
        );

        // Check if the appointment date matches today's date
        const isToday = appointmentDate.getTime() === todayDate.getTime();

        console.log("[AppointmentService] Filtering appointment", {
          title: appointment.title,
          startAt: appointment.startAt,
          startDate: startDate.toISOString(),
          appointmentDate: appointmentDate.toISOString(),
          todayDate: todayDate.toISOString(),
          isToday,
        });

        return isToday;
      });

      console.log("[AppointmentService] Today filter results", {
        totalAppointments: allAppointments.length,
        todayAppointments: filtered.length,
        todayStart: todayStart.toISOString(),
        filteredAppointments: filtered.map((apt) => ({
          title: apt.title,
          startAt: apt.startAt,
          date: new Date(apt.startAt).toDateString(),
        })),
        allAppointments: allAppointments.slice(0, 5).map((apt) => ({
          title: apt.title,
          startAt: apt.startAt,
          date: new Date(apt.startAt).toDateString(),
          dateTime: new Date(apt.startAt).getTime(),
          todayStartTime: todayStart.getTime(),
        })),
      });

      return filtered;
    } catch (error) {
      console.error("[AppointmentService] Error fetching appointments:", error);
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
