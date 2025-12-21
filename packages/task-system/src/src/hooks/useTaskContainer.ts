import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo } from "react";
import { Alert } from "react-native";
import { navigationService } from "../services/NavigationService";
import { Appointment } from "../types/Appointment";
import { Task } from "../types/Task";
import { groupAppointmentsByDate } from "../utils/appointmentParser";
import { useAppointmentList } from "./useAppointmentList";
import { useGroupedTasks } from "./useGroupedTasks";
import { useTaskList } from "./useTaskList";

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
  const navigation = useNavigation<any>();

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

    try {
      if (navigation?.navigate) {
        navigation.navigate("TaskQuestions", {
          taskId: task.id,
          entityId: task.entityId,
        });
        return;
      }
    } catch (error) {
      console.warn("[useTaskContainer] navigation.navigate failed", error);
    }

    Alert.alert(
      "Navigation unavailable",
      "Task navigation requires React Navigation. Mount this UI inside TaskActivityModule (recommended) or provide a compatible navigation container."
    );
  };

  const handleAppointmentPress = (appointment: Appointment): void => {
    // Package handles ALL navigation logic independently
    // NavigationService tries all strategies automatically
    // Pass navigation object so it can try parent navigation (works with expo-router)
    navigationService.navigateToAppointmentDetails(
      appointment,
      appointmentTimezoneId,
      navigation
    );
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
