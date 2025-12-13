import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { GroupedTask } from "../hooks/useGroupedTasks";
import { AppColors } from "../constants/AppColors";
import { Appointment } from "../types/Appointment";
import { Task } from "../types/Task";
import { AppointmentCard } from "./AppointmentCard";
import { TaskCard } from "./TaskCard";
import { TranslatedText } from "./TranslatedText";
import { TestIds } from "../constants/testIds";

interface GroupedTasksViewProps {
  groupedTasks: GroupedTask[];
  loading: boolean;
  error: string | null;
  onTaskPress?: (task: Task) => void;
  onDelete?: (id: string) => void;
  hideDateHeader?: boolean; // If true, don't show the date header for today's tasks
  todayAppointments?: Appointment[]; // Appointments for today to display with tasks
  onAppointmentPress?: (appointment: Appointment) => void;
  appointmentTimezoneId?: string;
}

export const GroupedTasksView: React.FC<GroupedTasksViewProps> = ({
  groupedTasks,
  loading,
  error,
  onTaskPress,
  onDelete,
  hideDateHeader = false,
  todayAppointments = [],
  onAppointmentPress,
  appointmentTimezoneId,
}) => {
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={AppColors.CIBlue} />
        <TranslatedText text="Loading tasks..." style={styles.loadingText} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  // Show appointments for today even if there are no tasks
  const hasTodayGroup = groupedTasks.some(g => g.dayLabel === "Today");
  const shouldShowAppointments = todayAppointments.length > 0;

  console.log("[GroupedTasksView] Rendering", {
    groupedTasksCount: groupedTasks.length,
    hasTodayGroup,
    todayAppointmentsCount: todayAppointments.length,
    shouldShowAppointments,
    dayLabels: groupedTasks.map(g => g.dayLabel),
  });

  if (groupedTasks.length === 0 && !shouldShowAppointments) {
    return (
      <View style={styles.centerContainer}>
        <TranslatedText text="No tasks available." style={styles.emptyText} />
      </View>
    );
  }

  return (
    <View
      style={styles.tasksSection}
      testID={TestIds.dashboardTasksGroupedView}
      accessibilityLabel={TestIds.dashboardTasksGroupedView}
    >
      {/* Show appointments for today if they exist and there's no "Today" task group */}
      {shouldShowAppointments && !hasTodayGroup && (
        <View style={styles.dayGroup}>
          <View style={styles.dayHeader}>
            <TranslatedText text="Today" style={styles.dayLabel} />
            <Text style={styles.dayDate}>
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </Text>
          </View>
          <View style={styles.appointmentsContainer}>
            {todayAppointments.map(appointment => (
              <AppointmentCard
                key={appointment.appointmentId}
                appointment={appointment}
                onPress={onAppointmentPress}
                timezoneId={appointmentTimezoneId}
              />
            ))}
          </View>
        </View>
      )}

      {groupedTasks.map(dayGroup => {
        const isToday = dayGroup.dayLabel === "Today";
        const showAppointments = isToday && todayAppointments.length > 0;

        console.log(
          `[GroupedTasksView] Rendering dayGroup: ${dayGroup.dayLabel}`,
          {
            isToday,
            todayAppointmentsCount: todayAppointments.length,
            showAppointments,
            hasOnAppointmentPress: !!onAppointmentPress,
            hasTimezone: !!appointmentTimezoneId,
            todayAppointments: todayAppointments.map(apt => ({
              id: apt.appointmentId,
              title: apt.title,
              startAt: apt.startAt,
            })),
          }
        );

        return (
          <View key={dayGroup.dayLabel} style={styles.dayGroup}>
            {/* Date Header - hide if hideDateHeader is true and it's "Today" */}
            {!(hideDateHeader && dayGroup.dayLabel === "Today") && (
              <View style={styles.dayHeader}>
                <TranslatedText
                  text={dayGroup.dayLabel}
                  style={styles.dayLabel}
                />
                {/* Only show date next to "Today" or "Tomorrow" */}
                {(dayGroup.dayLabel === "Today" ||
                  dayGroup.dayLabel === "Tomorrow") && (
                  <Text style={styles.dayDate}>{dayGroup.dayDate}</Text>
                )}
              </View>
            )}

            {/* Appointments for Today - show first */}
            {showAppointments ? (
              <View style={styles.appointmentsContainer}>
                {todayAppointments.length === 0 ? (
                  <Text style={styles.errorText}>
                    No appointments to display (array is empty)
                  </Text>
                ) : (
                  todayAppointments.map(appointment => {
                    console.log(
                      `[GroupedTasksView] Rendering appointment card: ${appointment.title}`,
                      {
                        appointmentId: appointment.appointmentId,
                        startAt: appointment.startAt,
                        hasOnPress: !!onAppointmentPress,
                      }
                    );
                    return (
                      <AppointmentCard
                        key={appointment.appointmentId}
                        appointment={appointment}
                        onPress={onAppointmentPress}
                        timezoneId={appointmentTimezoneId}
                      />
                    );
                  })
                )}
              </View>
            ) : null}

            {/* Tasks without due time (simple cards) */}
            {dayGroup.tasksWithoutTime.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                simple={true}
                onPress={onTaskPress}
                onDelete={onDelete}
              />
            ))}

            {/* Tasks grouped by time */}
            {dayGroup.timeGroups.map(timeGroup => (
              <View key={timeGroup.time} style={styles.timeGroup}>
                <TranslatedText
                  text={`DUE BY ${timeGroup.time}`}
                  style={styles.dueByHeader}
                />
                {timeGroup.tasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    simple={false}
                    onPress={onTaskPress}
                    onDelete={onDelete}
                  />
                ))}
              </View>
            ))}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tasksSection: {
    marginBottom: 28,
  },
  dayGroup: {
    marginBottom: 4,
  },
  dayHeader: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 16,
    gap: 12,
  },
  dayLabel: {
    fontSize: 24,
    fontWeight: "bold",
    color: AppColors.CINavy,
  },
  dayDate: {
    fontSize: 16,
    color: AppColors.mediumDarkGray,
    fontWeight: "400",
  },
  timeGroup: {
    marginBottom: 16,
  },
  dueByHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: AppColors.CINavy,
    marginBottom: 12,
    textTransform: "uppercase",
  },
  centerContainer: {
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#57606f",
    fontSize: 14,
  },
  errorText: {
    color: AppColors.errorRed,
    fontSize: 14,
    textAlign: "center",
  },
  emptyText: {
    color: AppColors.mediumDarkGray,
    fontSize: 16,
    textAlign: "center",
  },
  appointmentsContainer: {
    marginBottom: 16,
  },
});
