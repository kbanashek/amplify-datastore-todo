import React from "react";
import { useTaskContainer } from "../hooks/useTaskContainer";
import { useActivityStartup } from "../hooks/useActivityStartup";
import { GroupedTasksView } from "./GroupedTasksView";

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

  return (
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
  );
};
