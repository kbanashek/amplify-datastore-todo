import React from "react";
import { useTaskContainer } from "@orion/task-system";
import { GroupedTasksView } from "./GroupedTasksView";

export const TaskContainer: React.FC = () => {
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
