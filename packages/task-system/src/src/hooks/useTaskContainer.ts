import { useEffect, useMemo } from "react";
import { Alert } from "react-native";
import { Appointment } from "../types/Appointment";
import { Task } from "../types/Task";
import { groupAppointmentsByDate } from "../utils/appointmentParser";
import { useAppointmentList } from "./useAppointmentList";
import { useGroupedTasks } from "./useGroupedTasks";
import { useTaskList } from "./useTaskList";

// Try to import navigation hooks - support both Expo Router and React Navigation
let useRouterHook: (() => any) | null = null;
let useNavigationHook: (() => any) | null = null;

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const expoRouter = require("expo-router");
  if (expoRouter?.useRouter) {
    useRouterHook = expoRouter.useRouter;
  }
} catch {
  // Expo Router not available
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const reactNavigation = require("@react-navigation/native");
  if (reactNavigation?.useNavigation) {
    useNavigationHook = reactNavigation.useNavigation;
  }
} catch {
  // React Navigation not available
}

// No-op hook function that always returns null
// This allows us to always call hooks unconditionally
const useNoOp = (): null => null;

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
  // Always call hooks unconditionally - use no-op if hook doesn't exist
  // This ensures hooks are always called in the same order
  const routerResult = (useRouterHook || useNoOp)();
  const navigationResult = (
    !routerResult && useNavigationHook ? useNavigationHook : useNoOp
  )();

  const router = routerResult || null;
  const navigation = navigationResult || null;

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

    if (router) {
      // Use Expo Router
      router.push({
        pathname: "/(tabs)/questions",
        params: { taskId: task.id, entityId: task.entityId },
      });
    } else if (navigation?.navigate) {
      // Use React Navigation
      navigation.navigate("TaskQuestions", {
        taskId: task.id,
        entityId: task.entityId,
      });
    }
  };

  const handleAppointmentPress = (appointment: Appointment): void => {
    if (router) {
      // Use Expo Router
      router.push({
        pathname: "/(tabs)/appointment-details",
        params: {
          appointment: JSON.stringify(appointment),
          timezoneId: appointmentTimezoneId || "",
        },
      });
    } else if (navigation?.navigate) {
      // Use React Navigation (for other apps using the package)
      try {
        navigation.navigate("TaskAppointmentDetails", {
          appointment: appointment,
          timezoneId: appointmentTimezoneId || "",
        });
      } catch {
        // ignore
      }
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
