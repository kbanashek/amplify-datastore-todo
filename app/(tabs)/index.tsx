import { IconSymbol } from "@/components/ui/IconSymbol";
import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
import { TasksGroupedView } from "../../src/components/TasksGroupedView";
import { useGroupedTasks } from "../../src/hooks/useGroupedTasks";
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
  const router = useRouter();

  // Group tasks by day, then by time (or no time)
  const groupedTasks = useGroupedTasks(tasks);

  const handleTaskPress = (task: any) => {
    console.log("📋 [TasksScreen] Task pressed", {
      taskId: task.id,
      taskTitle: task.title,
      entityId: task.entityId,
      hasEntityId: !!task.entityId,
    });

    if (!task.entityId) {
      console.warn(
        "⚠️ [TasksScreen] Task missing entityId, cannot navigate to questions",
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

    console.log("🧭 [TasksScreen] Navigating to questions screen", {
      taskId: task.id,
      entityId: task.entityId,
    });

    router.push({
      pathname: "/(tabs)/questions",
      params: { taskId: task.id, entityId: task.entityId },
    });
  };

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
        <TasksGroupedView
          groupedTasks={groupedTasks}
          loading={loading}
          error={error}
          onTaskPress={handleTaskPress}
          onDelete={handleDeleteTask}
        />
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
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 12,
  },
});
