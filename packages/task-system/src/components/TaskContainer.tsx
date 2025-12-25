import { GroupedTasksView } from "@components/GroupedTasksView";
import { useActivityStartup } from "@hooks/useActivityStartup";
import { useTaskContainer } from "@hooks/useTaskContainer";
import React from "react";
import { View } from "react-native";

/**
 * A container component for displaying tasks and appointments.
 *
 * @returns A container component with the provided configuration
 */
export const TaskContainer: React.FC = () => {
  // Subscribe to activities on startup to log them
  useActivityStartup();

  const {
    groupedTasks,
    loading,
    error,
    handleDeleteTask,
    todayAppointments,
    appointmentTimezoneId,
    handleTaskPress,
    handleAppointmentPress,
  } = useTaskContainer();

  if (loading) {
    return (
      <View testID="task-container-loading">
        <GroupedTasksView
          groupedTasks={[]}
          loading={loading}
          error={error}
          onTaskPress={handleTaskPress}
          onDelete={handleDeleteTask}
          todayAppointments={todayAppointments}
          onAppointmentPress={handleAppointmentPress}
          appointmentTimezoneId={appointmentTimezoneId}
        />
      </View>
    );
  }

  if (error) {
    return (
      <View testID="task-container-error">
        <GroupedTasksView
          groupedTasks={[]}
          loading={loading}
          error={error}
          onTaskPress={handleTaskPress}
          onDelete={handleDeleteTask}
          todayAppointments={todayAppointments}
          onAppointmentPress={handleAppointmentPress}
          appointmentTimezoneId={appointmentTimezoneId}
        />
      </View>
    );
  }

  return (
    <View testID="task-container" style={{ flex: 1 }}>
      <GroupedTasksView
        groupedTasks={groupedTasks}
        loading={loading}
        error={error}
        onTaskPress={handleTaskPress}
        onDelete={handleDeleteTask}
        todayAppointments={todayAppointments}
        onAppointmentPress={handleAppointmentPress}
        appointmentTimezoneId={appointmentTimezoneId}
      />
    </View>
  );
};
