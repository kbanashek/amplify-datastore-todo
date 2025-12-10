import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Task } from "../types/Task";
import { TaskCard } from "./TaskCard";

interface GroupedTask {
  dayLabel: string;
  dayDate: string;
  tasksWithoutTime: Task[];
  timeGroups: { time: string; tasks: Task[] }[];
}

interface TasksGroupedViewProps {
  groupedTasks: GroupedTask[];
  loading: boolean;
  error: string | null;
  onTaskPress?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

export const TasksGroupedView: React.FC<TasksGroupedViewProps> = ({
  groupedTasks,
  loading,
  error,
  onTaskPress,
  onDelete,
}) => {
  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
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

  if (groupedTasks.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No tasks available.</Text>
      </View>
    );
  }

  return (
    <View style={styles.tasksSection}>
      {groupedTasks.map((dayGroup) => (
        <View key={dayGroup.dayLabel} style={styles.dayGroup}>
          <View style={styles.dayHeader}>
            <Text style={styles.dayLabel}>{dayGroup.dayLabel}</Text>
            {/* Only show date next to "Today" or "Tomorrow" */}
            {(dayGroup.dayLabel === "Today" ||
              dayGroup.dayLabel === "Tomorrow") && (
              <Text style={styles.dayDate}>{dayGroup.dayDate}</Text>
            )}
          </View>
          {/* Tasks without due time (simple cards) */}
          {dayGroup.tasksWithoutTime.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              simple={true}
              onPress={onTaskPress}
              onDelete={onDelete}
            />
          ))}
          {/* Tasks grouped by time */}
          {dayGroup.timeGroups.map((timeGroup) => (
            <View key={timeGroup.time} style={styles.timeGroup}>
              <Text style={styles.dueByHeader}>DUE BY {timeGroup.time}</Text>
              {timeGroup.tasks.map((task) => (
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
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  tasksSection: {
    marginBottom: 28,
  },
  dayGroup: {
    marginBottom: 32,
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
    color: "#3498db",
  },
  dayDate: {
    fontSize: 16,
    color: "#747d8c",
    fontWeight: "400",
  },
  timeGroup: {
    marginBottom: 16,
  },
  dueByHeader: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2f3542",
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
    color: "#e74c3c",
    fontSize: 14,
    textAlign: "center",
  },
  emptyText: {
    color: "#747d8c",
    fontSize: 16,
    textAlign: "center",
  },
});
