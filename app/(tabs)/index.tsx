import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlobalHeader } from "../../src/components/GlobalHeader";
import { NavigationMenu } from "../../src/components/NavigationMenu";
import { TasksGroupedView } from "../../src/components/TasksGroupedView";
import { useAppointmentList } from "../../src/hooks/useAppointmentList";
import { useGroupedTasks } from "../../src/hooks/useGroupedTasks";
import { useTaskList } from "../../src/hooks/useTaskList";
import { groupAppointmentsByDate } from "../../src/utils/appointmentParser";

export default function DashboardScreen() {
  const { tasks, loading, error, handleDeleteTask } = useTaskList();
  const groupedTasks = useGroupedTasks(tasks);
  const {
    appointments,
    appointmentData,
    loading: appointmentsLoading,
    refreshAppointments,
  } = useAppointmentList({
    todayOnly: true,
  });
  const [showMenu, setShowMenu] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Group appointments by date (for future use if needed)
  const groupedAppointments = useMemo(
    () =>
      groupAppointmentsByDate(appointments, appointmentData?.siteTimezoneId),
    [appointments, appointmentData]
  );

  // Get today's appointments - since we're filtering with todayOnly: true,
  // all appointments in the array are for today
  const todayAppointments = useMemo(() => {
    // Since appointments are already filtered to todayOnly, we can use them directly
    // But also check the grouped structure as a fallback
    const fromGroup = groupedAppointments.find(g => g.dateLabel === "Today");
    const result = fromGroup?.appointments || appointments;

    console.log("[Dashboard] Computing todayAppointments", {
      appointmentsCount: appointments.length,
      groupedAppointmentsCount: groupedAppointments.length,
      fromGroupCount: fromGroup?.appointments.length || 0,
      resultCount: result.length,
      result: result.map(apt => ({
        title: apt.title,
        startAt: apt.startAt,
        date: new Date(apt.startAt).toDateString(),
      })),
    });

    return result;
  }, [appointments, groupedAppointments]);

  // Log appointments for debugging and refresh on focus
  useEffect(() => {
    console.log("[Dashboard] Appointments state:", {
      appointmentsCount: appointments.length,
      todayAppointmentsCount: todayAppointments.length,
      loading: appointmentsLoading,
      appointmentData: appointmentData
        ? {
            timezone: appointmentData.siteTimezoneId,
            totalItems:
              appointmentData.clinicPatientAppointments.clinicAppointments.items
                .length,
          }
        : null,
      appointments: appointments.map(apt => ({
        title: apt.title,
        startAt: apt.startAt,
        type: apt.appointmentType,
        date: new Date(apt.startAt).toDateString(),
      })),
      groupedAppointments: groupedAppointments.map(g => ({
        dateLabel: g.dateLabel,
        date: g.date,
        count: g.appointments.length,
      })),
    });
  }, [
    appointments,
    appointmentsLoading,
    appointmentData,
    todayAppointments,
    groupedAppointments,
  ]);

  // Refresh appointments when screen comes into focus
  useEffect(() => {
    const refresh = async () => {
      await refreshAppointments();
    };
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleTaskPress = (task: any) => {
    console.log("📋 [Dashboard] Task pressed", {
      taskId: task.id,
      taskTitle: task.title,
      entityId: task.entityId,
      activityIndex: task.activityIndex,
      status: task.status,
      taskType: task.taskType,
      hasEntityId: !!task.entityId,
    });

    if (!task.entityId) {
      console.warn(
        "⚠️ [Dashboard] Task missing entityId, cannot navigate to questions",
        {
          taskId: task.id,
          taskTitle: task.title,
        }
      );
      Alert.alert(
        "No Questions Available",
        "This task does not have an associated activity. Tasks need an entityId that links to an Activity to display questions.\n\nPlease use the seed data feature or create a task with a valid Activity reference.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    console.log("🧭 [Dashboard] Navigating to questions screen", {
      taskId: task.id,
      entityId: task.entityId,
    });

    router.push({
      pathname: "/(tabs)/questions",
      params: { taskId: task.id, entityId: task.entityId },
    });
  };

  const handleAppointmentPress = (appointment: any) => {
    console.log("📅 [Dashboard] Appointment pressed", {
      appointmentId: appointment.appointmentId,
      title: appointment.title,
    });

    router.push({
      pathname: "/(tabs)/appointment-details",
      params: {
        appointment: JSON.stringify(appointment),
        timezoneId: appointmentData?.siteTimezoneId || "",
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlobalHeader
        title="Dashboard"
        showMenuButton={true}
        onMenuPress={() => {
          console.log("[Dashboard] Menu button pressed");
          setShowMenu(true);
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Tasks Section - includes appointments for today */}
        <View style={styles.section}>
          <TasksGroupedView
            groupedTasks={groupedTasks}
            loading={loading}
            error={error}
            onTaskPress={handleTaskPress}
            onDelete={handleDeleteTask}
            todayAppointments={todayAppointments}
            onAppointmentPress={handleAppointmentPress}
            appointmentTimezoneId={appointmentData?.siteTimezoneId}
          />
        </View>
      </ScrollView>

      <NavigationMenu visible={showMenu} onClose={() => setShowMenu(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#dfe4ea",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2f3542",
    flex: 1,
  },
  headerBottom: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2f3542",
    marginBottom: 16,
  },
});
