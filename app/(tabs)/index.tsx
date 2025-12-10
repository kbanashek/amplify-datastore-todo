import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NavigationMenu } from "../../src/components/NavigationMenu";
import { NetworkStatusIndicator } from "../../src/components/NetworkStatusIndicator";
import { TaskCard } from "../../src/components/TaskCard";
import { useTaskForm } from "../../src/hooks/useTaskForm";
import { useTaskList } from "../../src/hooks/useTaskList";
import { TaskStatus, TaskType } from "../../src/types/Task";

export default function TasksScreen() {
  const { tasks, loading, error, handleDeleteTask } = useTaskList();
  const [showForm, setShowForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();

  // Group tasks by day, then by time (or no time)
  const groupedTasks = React.useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Include all tasks (no filtering by expiration time - show all tasks)
    // Tasks are grouped by their due date, so past tasks will still appear
    const allTasks = tasks.filter((task) => {
      // Include tasks without expire time
      if (!task.expireTimeInMillSec) return true;

      // Include tasks that are due today or in the future (by date, not exact time)
      const taskDate = new Date(task.expireTimeInMillSec);
      const taskDay = new Date(
        taskDate.getFullYear(),
        taskDate.getMonth(),
        taskDate.getDate()
      );

      // Show tasks from today onwards (don't filter out past times on today)
      return taskDay >= today;
    });

    // Separate tasks with and without due times
    const tasksWithTime = allTasks.filter((task) => task.expireTimeInMillSec);
    const tasksWithoutTime = allTasks.filter(
      (task) => !task.expireTimeInMillSec
    );

    // Group by day (date only, no time)
    const byDay: { [dayKey: string]: typeof tasks } = {};
    tasksWithTime.forEach((task) => {
      if (!task.expireTimeInMillSec) return;
      const taskDate = new Date(task.expireTimeInMillSec);
      const dayKey = `${taskDate.getFullYear()}-${taskDate.getMonth()}-${taskDate.getDate()}`;
      if (!byDay[dayKey]) {
        byDay[dayKey] = [];
      }
      byDay[dayKey].push(task);
    });

    // Add tasks without time to "Today"
    if (tasksWithoutTime.length > 0) {
      const today = new Date();
      const todayKey = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
      if (!byDay[todayKey]) {
        byDay[todayKey] = [];
      }
      byDay[todayKey].unshift(...tasksWithoutTime);
    }

    // Process each day
    const result: {
      dayLabel: string;
      dayDate: string;
      tasksWithoutTime: typeof tasks;
      timeGroups: { time: string; tasks: typeof tasks }[];
    }[] = [];

    // Sort days: Today first, then Tomorrow, then by date
    const sortedDayKeys = Object.keys(byDay).sort((a, b) => {
      const dayA = byDay[a];
      const dayB = byDay[b];

      // Get dates for comparison
      let dateA: Date, dateB: Date;
      const withTimeA = dayA.filter((task) => task.expireTimeInMillSec);
      const withTimeB = dayB.filter((task) => task.expireTimeInMillSec);

      if (withTimeA.length > 0) {
        dateA = new Date(withTimeA[0].expireTimeInMillSec!);
      } else {
        dateA = new Date();
      }

      if (withTimeB.length > 0) {
        dateB = new Date(withTimeB[0].expireTimeInMillSec!);
      } else {
        dateB = new Date();
      }

      const today = new Date();
      const todayStart = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
      );
      const dayAStart = new Date(
        dateA.getFullYear(),
        dateA.getMonth(),
        dateA.getDate()
      );
      const dayBStart = new Date(
        dateB.getFullYear(),
        dateB.getMonth(),
        dateB.getDate()
      );

      const diffA = Math.floor(
        (dayAStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)
      );
      const diffB = Math.floor(
        (dayBStart.getTime() - todayStart.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Today always first
      if (diffA === 0) return -1;
      if (diffB === 0) return 1;

      // Tomorrow second
      if (diffA === 1) return -1;
      if (diffB === 1) return 1;

      // Then sort by date
      return diffA - diffB;
    });

    sortedDayKeys.forEach((dayKey) => {
      const dayTasks = byDay[dayKey];

      // Separate tasks with and without time for this day
      const withTime = dayTasks.filter((task) => task.expireTimeInMillSec);
      const withoutTime = dayTasks.filter((task) => !task.expireTimeInMillSec);

      // Get date from first task with time, or use today for tasks without time
      let firstTaskDate: Date;
      if (withTime.length > 0) {
        firstTaskDate = new Date(withTime[0].expireTimeInMillSec!);
      } else {
        firstTaskDate = new Date();
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const taskDay = new Date(
        firstTaskDate.getFullYear(),
        firstTaskDate.getMonth(),
        firstTaskDate.getDate()
      );
      const diffDays = Math.floor(
        (taskDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Format date for display
      const dayDate = firstTaskDate.toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
      });

      // Use "Today" or "Tomorrow" for labels, actual date for others
      let dayLabel: string;
      if (diffDays === 0) {
        dayLabel = "Today";
      } else if (diffDays === 1) {
        dayLabel = "Tomorrow";
      } else {
        dayLabel = dayDate; // Use actual date for future dates
      }

      // Group by time within the day
      const byTime: { [timeKey: string]: typeof tasks } = {};
      withTime.forEach((task) => {
        if (!task.expireTimeInMillSec) return;
        const taskDate = new Date(task.expireTimeInMillSec);
        const hours = taskDate.getHours();
        const minutes = taskDate.getMinutes();
        const timeKey = `${hours.toString().padStart(2, "0")}:${minutes
          .toString()
          .padStart(2, "0")}`;
        if (!byTime[timeKey]) {
          byTime[timeKey] = [];
        }
        byTime[timeKey].push(task);
      });

      // Sort time groups and format time
      const timeGroups = Object.keys(byTime)
        .sort()
        .map((timeKey) => {
          const [hours, minutes] = timeKey.split(":").map(Number);
          const timeDate = new Date();
          timeDate.setHours(hours, minutes);
          const timeStr = timeDate.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          });
          return {
            time: timeStr,
            tasks: byTime[timeKey],
          };
        });

      result.push({
        dayLabel,
        dayDate,
        tasksWithoutTime: withoutTime,
        timeGroups,
      });
    });

    return result;
  }, [tasks]);

  const {
    title,
    setTitle,
    description,
    setDescription,
    taskType,
    setTaskType,
    status,
    setStatus,
    dueDate,
    setDueDate,
    dueTime,
    setDueTime,
    isSubmitting,
    error: formError,
    handleSubmit,
    reset,
  } = useTaskForm({
    onTaskCreated: () => {
      reset();
      setShowForm(false);
    },
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>LX App Sync POC</Text>
          <TouchableOpacity
            onPress={() => setShowMenu(true)}
            style={styles.menuButton}
          >
            <IconSymbol
              name="line.3.horizontal"
              size={24}
              color={colors.text}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.headerBottom}>
          <NetworkStatusIndicator />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* CREATE TASK SECTION */}
        <View style={styles.createSection}>
          {!showForm ? (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.createButtonText}>+ Create New Task</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Create Task</Text>

              {formError && <Text style={styles.errorText}>{formError}</Text>}

              <TextInput
                style={styles.input}
                placeholder="Task title *"
                value={title}
                onChangeText={setTitle}
                editable={!isSubmitting}
                autoFocus
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Description (optional)"
                value={description}
                onChangeText={setDescription}
                editable={!isSubmitting}
                multiline
                numberOfLines={3}
              />

              <Text style={styles.label}>Task Type *</Text>
              <View style={styles.radioGroup}>
                {Object.values(TaskType).map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.radioButton,
                      taskType === type && styles.radioButtonSelected,
                    ]}
                    onPress={() => setTaskType(type)}
                    disabled={isSubmitting}
                  >
                    <Text
                      style={[
                        styles.radioButtonText,
                        taskType === type && styles.radioButtonTextSelected,
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Status *</Text>
              <View style={styles.radioGroup}>
                {Object.values(TaskStatus).map((stat) => (
                  <TouchableOpacity
                    key={stat}
                    style={[
                      styles.radioButton,
                      status === stat && styles.radioButtonSelected,
                    ]}
                    onPress={() => setStatus(stat)}
                    disabled={isSubmitting}
                  >
                    <Text
                      style={[
                        styles.radioButtonText,
                        status === stat && styles.radioButtonTextSelected,
                      ]}
                    >
                      {stat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Due Date *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD"
                value={dueDate}
                onChangeText={setDueDate}
                editable={!isSubmitting}
                keyboardType="default"
              />

              <Text style={styles.label}>Due Time *</Text>
              <TextInput
                style={styles.input}
                placeholder="HH:MM (24-hour format)"
                value={dueTime}
                onChangeText={setDueTime}
                editable={!isSubmitting}
                keyboardType="default"
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowForm(false);
                    reset();
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmit}
                  disabled={isSubmitting || !title.trim()}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Create</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* TASKS GROUPED BY DAY AND TIME */}
        {groupedTasks.length > 0 ? (
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
                    onDelete={handleDeleteTask}
                  />
                ))}
                {/* Tasks grouped by time */}
                {dayGroup.timeGroups.map((timeGroup) => (
                  <View key={timeGroup.time} style={styles.timeGroup}>
                    <Text style={styles.dueByHeader}>
                      DUE BY {timeGroup.time}
                    </Text>
                    {timeGroup.tasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        simple={false}
                        onDelete={handleDeleteTask}
                      />
                    ))}
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#3498db" />
            <Text style={styles.loadingText}>Loading tasks...</Text>
          </View>
        ) : error ? (
          <View style={styles.centerContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : (
          <View style={styles.centerContainer}>
            <Text style={styles.emptyText}>
              No tasks yet. Create one above!
            </Text>
          </View>
        )}
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
  createSection: {
    marginBottom: 28,
  },
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
  createButton: {
    backgroundColor: "#3498db",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dfe4ea",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2f3542",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dfe4ea",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    color: "#2f3542",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ecf0f1",
  },
  cancelButtonText: {
    color: "#57606f",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#3498db",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  listSection: {
    marginTop: 8,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2f3542",
    marginBottom: 16,
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
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2f3542",
    marginBottom: 8,
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  radioButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dfe4ea",
    backgroundColor: "#f8f9fa",
  },
  radioButtonSelected: {
    backgroundColor: "#3498db",
    borderColor: "#3498db",
  },
  radioButtonText: {
    fontSize: 14,
    color: "#57606f",
    fontWeight: "500",
  },
  radioButtonTextSelected: {
    color: "#fff",
    fontWeight: "600",
  },
});
