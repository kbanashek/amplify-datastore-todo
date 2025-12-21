import React, { useCallback } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslatedText } from "../hooks/useTranslatedText";
import { TaskService } from "../services/TaskService";
import { Task, TaskStatus } from "../types/Task";
import { getServiceLogger } from "../utils/serviceLogger";
import { getTaskIcon } from "../utils/taskIcon";
import { IconSymbol } from "./ui/IconSymbol";

const logger = getServiceLogger("TaskCard");

interface TaskCardProps {
  task: Task;
  onPress?: (task: Task) => void;
  onDelete?: (id: string) => void;
  simple?: boolean; // If true, show simple card without BEGIN button
}

export const TaskCard: React.FC<TaskCardProps> = React.memo(
  ({ task, onPress, onDelete, simple = false }: TaskCardProps) => {
    // Translate task title
    const { translatedText: translatedTitle } = useTranslatedText(
      task.title || "Untitled Task"
    );

    // Translate button text
    const isStarted =
      task.status === TaskStatus.STARTED ||
      task.status === TaskStatus.INPROGRESS;
    const { translatedText: beginButtonText } = useTranslatedText(
      isStarted ? "RESUME" : "BEGIN"
    );
    const { translatedText: completedText } = useTranslatedText("COMPLETED");

    const icon = getTaskIcon(task);

    const handleBeginPress = useCallback(async () => {
      try {
        // If task is not started, update status to STARTED
        if (
          task.status !== TaskStatus.STARTED &&
          task.status !== TaskStatus.INPROGRESS
        ) {
          const updated = await TaskService.updateTask(task.id, {
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
      >
        <View style={styles.cardContent}>
          <View
            style={[styles.titleSection, simple && styles.titleSectionSimple]}
          >
            <View style={styles.titleRow}>
              <View style={styles.iconContainer}>
                <IconSymbol
                  name={icon.name as any}
                  size={24}
                  color={icon.color}
                />
              </View>
              <Text style={styles.title} numberOfLines={2}>
                {translatedTitle}
              </Text>
            </View>
          </View>

          {!simple && (
            <View style={styles.actionRow}>
              {!isCompleted ? (
                <>
                  <TouchableOpacity
                    style={styles.beginButton}
                    onPress={handleBeginPress}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.beginButtonText}>
                      {beginButtonText}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.arrowButton}
                    onPress={() => onPress?.(task)}
                    activeOpacity={0.7}
                  >
                    <IconSymbol
                      name="chevron.right"
                      size={20}
                      color="#57606f"
                    />
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedText}>{completedText}</Text>
                </View>
              )}
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }
);

TaskCard.displayName = "TaskCard";

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
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
    color: "#1a1a1a",
    lineHeight: 26,
    flex: 1,
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  beginButton: {
    backgroundColor: "#3498db",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 100,
    alignItems: "center",
  },
  beginButtonText: {
    color: "#fff",
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
    backgroundColor: "#e74c3c",
    borderRadius: 4,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  cardDisabled: {
    opacity: 0.6,
  },
  completedBadge: {
    backgroundColor: "#27ae60",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 100,
    alignItems: "center",
  },
  completedText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
