/**
 * TaskForm component module.
 *
 * @module TaskForm
 */

import React from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useTaskForm } from "@hooks/useTaskForm";
import { useRTL } from "@hooks/useRTL";
import { Task, TaskStatus, TaskType } from "@task-types/Task";
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";

/**
 * Props for the TaskForm component
 */
interface TaskFormProps {
  onTaskCreated?: (task: Task) => void;
}

/**
 * TaskForm component.
 *
 * @param props - Component props
 * @returns Rendered TaskForm component
 */
export const TaskForm: React.FC<TaskFormProps> = ({ onTaskCreated }) => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    taskType,
    setTaskType,
    status,
    setStatus,
    pk,
    setPk,
    sk,
    setSk,
    isSubmitting,
    error,
    handleSubmit,
    reset,
  } = useTaskForm({ onTaskCreated });
  const { rtlStyle } = useRTL();

  return (
    <ScrollView
      style={styles.container}
      keyboardShouldPersistTaps="handled"
      testID="task-form"
    >
      <Text style={styles.title} testID="task-form-title">
        Create New Task for today
      </Text>

      {error && (
        <Text style={styles.errorText} testID="task-form-error">
          {error}
        </Text>
      )}

      <TextInput
        style={styles.input}
        placeholder="Task title *"
        value={title}
        onChangeText={setTitle}
        editable={!isSubmitting}
        autoFocus={false}
        autoCorrect={true}
        autoCapitalize="sentences"
        keyboardType="default"
        returnKeyType="next"
        testID="task-form-title-input"
        accessibilityLabel="Task title"
      />

      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Description (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={3}
        editable={!isSubmitting}
        autoFocus={false}
        autoCorrect={true}
        autoCapitalize="sentences"
        keyboardType="default"
        returnKeyType="done"
        textAlignVertical="top"
        testID="task-form-description-input"
        accessibilityLabel="Task description"
      />

      <Text style={styles.label} testID="task-form-type-label">
        Task Type *
      </Text>
      <View style={styles.radioGroup} testID="task-form-type-group">
        {Object.values(TaskType).map(type => (
          <TouchableOpacity
            key={type}
            style={[
              styles.radioButton,
              taskType === type && styles.radioButtonSelected,
            ]}
            onPress={() => setTaskType(type)}
            disabled={isSubmitting}
            testID={`task-form-type-${type}`}
            accessibilityRole="button"
            accessibilityLabel={`Select ${type} task type`}
            accessibilityState={{ selected: taskType === type }}
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

      <Text style={styles.label} testID="task-form-status-label">
        Status *
      </Text>
      <View style={styles.radioGroup} testID="task-form-status-group">
        {Object.values(TaskStatus).map(stat => (
          <TouchableOpacity
            key={stat}
            style={[
              styles.radioButton,
              status === stat && styles.radioButtonSelected,
            ]}
            onPress={() => setStatus(stat)}
            disabled={isSubmitting}
            testID={`task-form-status-${stat}`}
            accessibilityRole="button"
            accessibilityLabel={`Select ${stat} status`}
            accessibilityState={{ selected: status === stat }}
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

      <TextInput
        style={styles.input}
        placeholder="PK (Partition Key) *"
        value={pk}
        onChangeText={setPk}
        editable={!isSubmitting}
        autoCapitalize="none"
        autoCorrect={false}
        testID="task-form-pk-input"
        accessibilityLabel="Partition key"
      />

      <TextInput
        style={styles.input}
        placeholder="SK (Sort Key) *"
        value={sk}
        onChangeText={setSk}
        editable={!isSubmitting}
        autoCapitalize="none"
        autoCorrect={false}
        testID="task-form-sk-input"
        accessibilityLabel="Sort key"
      />

      <View
        style={[styles.buttonRow, rtlStyle(styles.buttonRow) as ViewStyle]}
        testID="task-form-buttons"
      >
        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={reset}
          disabled={isSubmitting}
          testID="task-form-reset-button"
          accessibilityRole="button"
          accessibilityLabel="Reset form"
        >
          <Text style={styles.secondaryButtonText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          testID="task-form-submit-button"
          accessibilityRole="button"
          accessibilityLabel="Create task"
        >
          {isSubmitting ? (
            <ActivityIndicator
              color={AppColors.white}
              size="small"
              testID="task-form-submit-loading"
            />
          ) : (
            <Text style={styles.buttonText}>Create Task</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: AppColors.white,
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    ...AppFonts.subheading,
    marginBottom: 16,
    color: AppColors.gray,
  },
  input: {
    borderWidth: 1,
    borderColor: AppColors.borderGray,
    borderRadius: 4,
    padding: 12,
    marginBottom: 12,
    ...AppFonts.body,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  label: {
    ...AppFonts.label,
    color: AppColors.gray,
    marginBottom: 8,
    marginTop: 4,
  },
  radioGroup: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    gap: 8,
  },
  radioButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: AppColors.borderGray,
    backgroundColor: AppColors.white,
    marginRight: 8,
    marginBottom: 8,
  },
  radioButtonSelected: {
    backgroundColor: AppColors.CIBlue,
    borderColor: AppColors.CIBlue,
  },
  radioButtonText: {
    ...AppFonts.caption,
    color: AppColors.darkGray,
  },
  radioButtonTextSelected: {
    color: AppColors.white,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    backgroundColor: AppColors.CIBlue,
    borderRadius: 4,
    padding: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButton: {
    backgroundColor: AppColors.iconGray,
  },
  disabledButton: {
    backgroundColor: AppColors.iconGray,
  },
  buttonText: {
    ...AppFonts.body,
    color: AppColors.white,
    fontWeight: "bold",
  },
  secondaryButtonText: {
    ...AppFonts.body,
    color: AppColors.white,
    fontWeight: "bold",
  },
  errorText: {
    ...AppFonts.small,
    color: AppColors.errorRed,
    marginBottom: 12,
  },
});
