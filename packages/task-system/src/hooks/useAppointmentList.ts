import { useEffect, useRef, useState } from "react";
import { AppointmentService } from "@services/AppointmentService";
import { Appointment, AppointmentData } from "@task-types/Appointment";
import { logErrorWithPlatform } from "@utils/logging/platformLogger";
import { dataSubscriptionLogger } from "@utils/logging/dataSubscriptionLogger";

interface UseAppointmentListReturn {
  appointments: Appointment[];
  appointmentData: AppointmentData | null;
  loading: boolean;
  error: string | null;
  refreshAppointments: () => Promise<void>;
}

interface UseAppointmentListOptions {
  todayOnly?: boolean;
}

/**
 * Hook for loading and managing appointment list
 * Follows the same pattern as useTaskList
 * @param options - Configuration options
 * @param options.todayOnly - If true, only load appointments for today (default: false)
 */
export const useAppointmentList = (
  options: UseAppointmentListOptions = {}
): UseAppointmentListReturn => {
  const { todayOnly = false } = options;
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [appointmentData, setAppointmentData] =
    useState<AppointmentData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const lastAppointmentCountRef = useRef<number>(-1);

  const loadAppointments = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const data = await AppointmentService.getAppointmentData();
      if (data) {
        setAppointmentData(data);
        const parsed = await AppointmentService.getAppointments(todayOnly);

        // Only log if count changed, using centralized logger to prevent duplicates
        if (parsed.length !== lastAppointmentCountRef.current) {
          dataSubscriptionLogger.logAppointments(
            parsed.length,
            todayOnly,
            data.siteTimezoneId,
            "useAppointmentList"
          );
          lastAppointmentCountRef.current = parsed.length;
        }

        setAppointments(parsed);
      } else {
        if (lastAppointmentCountRef.current !== 0) {
          dataSubscriptionLogger.logAppointments(
            0,
            todayOnly,
            undefined,
            "useAppointmentList"
          );
          lastAppointmentCountRef.current = 0;
        }
        setAppointments([]);
        setAppointmentData(null);
      }
    } catch (err) {
      logErrorWithPlatform(
        "",
        "useAppointmentList",
        "Failed to load appointments",
        err
      );
      setError("Failed to load appointments. Please try again.");
      setAppointments([]);
      setAppointmentData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, [todayOnly]);

  const refreshAppointments = async (): Promise<void> => {
    await loadAppointments();
  };

  return {
    appointments,
    appointmentData,
    loading,
    error,
    refreshAppointments,
  };
};
