import { useMemo, useEffect } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useGroupedTasks } from "./useGroupedTasks";
import { useTaskList } from "./useTaskList";
import { useAppointmentList } from "./useAppointmentList";
import { groupAppointmentsByDate } from "../utils/appointmentParser";
import { Appointment } from "../types/Appointment";
import { Task } from "../types/Task";

export interface UseTaskContainerReturn {
  groupedTasks: ReturnType<typeof useGroupedTasks>;
  loading: boolean;
  error: string | null;
  handleDeleteTask: (id: string) => Promise<void>;
  todayAppointments: Appointment[];
  appointmentTimezoneId?: string;
  handleTaskPress: (task: Task) => void;
  handleAppointmentPress: (appointment: Appointment) => void;
}

export const useTaskContainer = (): UseTaskContainerReturn => {
  const router = useRouter();

  const { tasks, loading, error, handleDeleteTask } = useTaskList();
  const groupedTasks = useGroupedTasks(tasks);

  const { appointments, appointmentData, refreshAppointments } =
    useAppointmentList({
      todayOnly: true,
    });

  const groupedAppointments = useMemo(
    () =>
      groupAppointmentsByDate(appointments, appointmentData?.siteTimezoneId),
    [appointments, appointmentData]
  );

  const todayAppointments = useMemo(() => {
    const fromGroup = groupedAppointments.find(g => g.dateLabel === "Today");
    return fromGroup?.appointments || appointments;
  }, [appointments, groupedAppointments]);

  // Refresh appointments on mount (keeps behavior consistent with previous dashboard code)
  useEffect(() => {
    refreshAppointments().catch(() => {
      // error state is handled inside useAppointmentList
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appointmentTimezoneId = appointmentData?.siteTimezoneId;

  const handleTaskPress = (task: Task): void => {
    if (!task.entityId) {
      Alert.alert(
        "No Questions Available",
        "This task does not have an associated activity. Tasks need an entityId that links to an Activity to display questions.\n\nPlease use the seed data feature or create a task with a valid Activity reference.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    router.push({
      pathname: "/(tabs)/questions",
      params: { taskId: task.id, entityId: task.entityId },
    });
  };

  const handleAppointmentPress = (appointment: Appointment): void => {
    console.log("[useTaskContainer] Navigating to appointment details:", {
      appointmentId: appointment.appointmentId,
      title: appointment.title,
      hasTimezone: !!appointmentTimezoneId,
    });
    try {
      router.push({
        pathname: "/(tabs)/appointment-details",
        params: {
          appointment: JSON.stringify(appointment),
          timezoneId: appointmentTimezoneId || "",
        },
      });
    } catch (error) {
      console.error("[useTaskContainer] Navigation error:", error);
    }
  };

  return {
    groupedTasks,
    loading,
    error,
    handleDeleteTask,
    todayAppointments,
    appointmentTimezoneId,
    handleTaskPress,
    handleAppointmentPress,
  };
};
