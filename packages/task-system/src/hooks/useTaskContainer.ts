import { useNavigation } from "@react-navigation/native";
import { useEffect, useMemo } from "react";
import { Alert } from "react-native";
import { navigationService } from "@services/NavigationService";
import { Appointment } from "@task-types/Appointment";
import { Task } from "@task-types/Task";
import { groupAppointmentsByDate } from "@utils/appointmentParser";
import { getServiceLogger } from "@utils/serviceLogger";
import { extractActivityIdFromTask } from "@utils/taskUtils";
import { useAppointmentList } from "@hooks/useAppointmentList";
import { useGroupedTasks } from "@hooks/useGroupedTasks";
import { useTaskList } from "@hooks/useTaskList";

const logger = getServiceLogger("useTaskContainer");

/**
 * Return type for the useTaskContainer hook.
 */
export interface UseTaskContainerReturn {
  /** Tasks grouped by day and time */
  groupedTasks: ReturnType<typeof useGroupedTasks>;
  /** Whether data is still loading */
  loading: boolean;
  /** Error message, or null */
  error: string | null;
  /** Deletes a task by ID */
  handleDeleteTask: (id: string) => Promise<void>;
  /** Today's appointments */
  todayAppointments: Appointment[];
  /** Timezone ID for appointment display */
  appointmentTimezoneId?: string;
  /** Handler for task press events (navigates to questions) */
  handleTaskPress: (task: Task) => void;
  /** Handler for appointment press events (navigates to details) */
  handleAppointmentPress: (appointment: Appointment) => void;
}

/**
 * React hook that aggregates task and appointment data for the main container view.
 *
 * Combines useTaskList, useGroupedTasks, and useAppointmentList hooks to provide
 * a unified data source for the task dashboard. Handles navigation to task
 * questions and appointment details.
 *
 * @returns Object containing grouped tasks, appointments, and navigation handlers
 *
 * @example
 * ```tsx
 * const {
 *   groupedTasks,
 *   todayAppointments,
 *   handleTaskPress,
 *   handleAppointmentPress,
 *   loading,
 * } = useTaskContainer();
 *
 * if (loading) return <LoadingSpinner />;
 *
 * return (
 *   <TasksView
 *     groupedTasks={groupedTasks}
 *     appointments={todayAppointments}
 *     onTaskPress={handleTaskPress}
 *     onAppointmentPress={handleAppointmentPress}
 *   />
 * );
 * ```
 */
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
    // Extract activity ID from task (handles both entityId and actions field)
    const activityId = extractActivityIdFromTask(task);

    if (!activityId) {
      Alert.alert(
        "No Questions Available",
        "This task does not have an associated activity. Tasks need an entityId or actions field that links to an Activity to display questions.\n\nPlease use the seed data feature or create a task with a valid Activity reference.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    try {
      if (navigation?.navigate) {
        navigation.navigate("TaskQuestions", {
          taskId: task.id,
          entityId: activityId,
        });
        return;
      }
    } catch (error) {
      logger.warn("navigation.navigate failed", error);
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
