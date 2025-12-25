import { TranslatedText } from "@components/TranslatedText";
import { IconSymbol } from "@components/ui/IconSymbol";
import { AppColors } from "@constants/AppColors";
import { TaskService } from "@services/TaskService";
import { Task, TaskStatus } from "@task-types/Task";
import { useTaskTranslation } from "@translations/index";
import { getServiceLogger } from "@utils/serviceLogger";
import { getTaskIcon } from "@utils/taskIcon";
import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const logger = getServiceLogger("TaskCard");

interface TaskCardProps {
  task: Task;
  onPress?: (task: Task) => void;
  onDelete?: (id: string) => void;
  simple?: boolean; // If true, show simple card without BEGIN button
}

/**
 * A card component for displaying task information.
 *
 * @param task - The task to display
 * @param onPress - Optional callback function when the card is pressed
 * @param onDelete - Optional callback function when the delete button is pressed
 * @param simple - Whether to show a simple card without the BEGIN button
 * @returns A themed task card component with the provided task information
 */
export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onDelete,
  simple = false,
}: TaskCardProps) => {
  const { t } = useTaskTranslation();

  // Translate button text using new i18next API
  const isStarted =
    task.status === TaskStatus.STARTED || task.status === TaskStatus.INPROGRESS;
  const beginButtonText = t(isStarted ? "task.resume" : "task.begin");
  const completedText = t("task.completed");

  const icon = getTaskIcon(task);

  const handleBeginPress = useCallback(async () => {
    try {
      // If task is not started, update status to STARTED
      if (
        task.status !== TaskStatus.STARTED &&
        task.status !== TaskStatus.INPROGRESS
      ) {
        await TaskService.updateTask(task.id, {
          status: TaskStatus.STARTED,
        });
      }
      // Call the onPress callback if provided
      onPress?.(task);
    } catch (error) {
      logger.error("Error updating task status", error);
    }
  }, [task, onPress]);

  const handleCardPress = useCallback(async () => {
    const isCompleted = task.status === TaskStatus.COMPLETED;
    if (isCompleted) return;

    try {
      // If task is not started, update status to STARTED when card is clicked
      // This ensures the button text updates to "RESUME" when user returns to dashboard
      if (
        task.status !== TaskStatus.STARTED &&
        task.status !== TaskStatus.INPROGRESS
      ) {
        await TaskService.updateTask(task.id, {
          status: TaskStatus.STARTED,
        });
      }
      // Call the onPress callback
      onPress?.(task);
    } catch (error) {
      logger.error("Error updating task status on card press", error);
      // Still navigate even if status update fails
      onPress?.(task);
    }
  }, [task, onPress]);

  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isDisabled = isCompleted;

  return (
    <TouchableOpacity
      style={[styles.card, isDisabled && styles.cardDisabled]}
      onPress={handleCardPress}
      activeOpacity={isDisabled ? 1 : 0.7}
      disabled={isDisabled}
      testID="task-card"
      accessibilityRole="button"
      accessibilityLabel={task.title || t("task.untitled")}
    >
      <View style={styles.cardContent} testID="task-card-content">
        <View
          style={[styles.titleSection, simple && styles.titleSectionSimple]}
          testID="task-card-icon-container"
        >
          <View style={styles.titleRow}>
            <View style={styles.iconContainer}>
              <IconSymbol
                name={icon.name as any}
                size={24}
                color={icon.color}
              />
            </View>
            <TranslatedText
              text={task.title || t("task.untitled")}
              style={styles.title}
              numberOfLines={2}
              testID="task-card-title"
            />
          </View>
        </View>

        {!simple && (
          <View style={styles.actionRow} testID="task-card-action-row">
            {!isCompleted ? (
              <>
                <TouchableOpacity
                  style={styles.beginButton}
                  onPress={handleBeginPress}
                  activeOpacity={0.8}
                  testID="task-card-begin-button"
                  accessibilityRole="button"
                  accessibilityLabel={beginButtonText}
                >
                  <Text style={styles.beginButtonText}>{beginButtonText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.arrowButton}
                  onPress={() => onPress?.(task)}
                  activeOpacity={0.7}
                  testID="task-card-arrow-button"
                  accessibilityRole="button"
                  accessibilityLabel="Navigate to task"
                >
                  <IconSymbol
                    name="chevron.right"
                    size={20}
                    color={AppColors.darkGray}
                  />
                </TouchableOpacity>
              </>
            ) : (
              <View
                style={styles.completedBadge}
                testID="task-card-completed-badge"
              >
                <Text style={styles.completedText}>{completedText}</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColors.white,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: AppColors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  cardContent: {
    padding: 16,
  },
  titleSection: {
    marginBottom: 16,
  },
  titleSectionSimple: {
    marginBottom: 0,
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: AppColors.almostBlack,
    lineHeight: 26,
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  beginButton: {
    backgroundColor: AppColors.legacy.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 100,
    alignItems: "center",
  },
  beginButtonText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
  arrowButton: {
    padding: 8,
    marginLeft: 8,
  },
  deleteButton: {
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 12,
    padding: 8,
    backgroundColor: AppColors.legacy.danger,
    borderRadius: 4,
    alignItems: "center",
  },
  deleteButtonText: {
    color: AppColors.white,
    fontWeight: "bold",
    fontSize: 14,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  completedBadge: {
    backgroundColor: AppColors.successGreen,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 100,
    alignItems: "center",
  },
  completedText: {
    color: AppColors.white,
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
