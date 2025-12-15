import { useEffect, useState } from "react";
import { AppointmentService } from "@orion/task-system";
import { Appointment, AppointmentData } from "../types/Appointment";

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

  const loadAppointments = async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const data = await AppointmentService.getAppointmentData();
      if (data) {
        setAppointmentData(data);
        const parsed = await AppointmentService.getAppointments(todayOnly);
        setAppointments(parsed);
      } else {
        setAppointments([]);
        setAppointmentData(null);
      }
    } catch (err) {
      console.error("[useAppointmentList] Error loading appointments:", err);
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
