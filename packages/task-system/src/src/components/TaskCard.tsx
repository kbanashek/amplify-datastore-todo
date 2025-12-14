import { IconSymbol } from "./ui/IconSymbol";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTranslatedText } from "../hooks/useTranslatedText";
import { TaskService } from "../services/TaskService";
import { Task, TaskStatus, TaskType } from "../types/Task";

interface TaskCardProps {
  task: Task;
  onPress?: (task: Task) => void;
  onDelete?: (id: string) => void;
  simple?: boolean; // If true, show simple card without BEGIN button
}

// Get icon name and color based on task type and title
const getTaskIcon = (task: Task): { name: string; color: string } => {
  const title = (task.title || "").toLowerCase();

  // Check for specific keywords in title
  if (title.includes("medication") || title.includes("diary")) {
    return { name: "pills", color: "#3498db" };
  }
  if (title.includes("survey") || title.includes("health")) {
    return { name: "questionmark.circle", color: "#3498db" };
  }
  if (title.includes("quality") || title.includes("life")) {
    return { name: "list.clipboard", color: "#3498db" };
  }
  if (title.includes("recall") || title.includes("recognition")) {
    return { name: "bell", color: "#f39c12" };
  }
  if (
    title.includes("symptom") ||
    title.includes("pain") ||
    title.includes("neuropathic")
  ) {
    return { name: "questionmark.circle", color: "#3498db" };
  }

  // Default based on task type
  switch (task.taskType) {
    case TaskType.SCHEDULED:
      return { name: "calendar", color: "#3498db" };
    case TaskType.TIMED:
      return { name: "clock", color: "#3498db" };
    case TaskType.EPISODIC:
      return { name: "repeat", color: "#3498db" };
    default:
      return { name: "doc.text", color: "#3498db" };
  }
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onDelete,
  simple = false,
}) => {
  console.log("[TaskCard] RENDER:", {
    id: task.id,
    title: task.title,
    hasTitle: !!task.title,
    titleLength: task.title?.length || 0,
    status: task.status,
    statusString: TaskStatus[task.status as keyof typeof TaskStatus],
    isStarted: task.status === TaskStatus.STARTED,
    isInProgress: task.status === TaskStatus.INPROGRESS,
    isCompleted: task.status === TaskStatus.COMPLETED,
    simple,
  });

  // Translate task title
  const { translatedText: translatedTitle } = useTranslatedText(
    task.title || "Untitled Task"
  );

  // Translate button text
  const isStarted =
    task.status === TaskStatus.STARTED || task.status === TaskStatus.INPROGRESS;
  const { translatedText: beginButtonText } = useTranslatedText(
    isStarted ? "RESUME" : "BEGIN"
  );
  const { translatedText: completedText } = useTranslatedText("COMPLETED");
  const { translatedText: untitledText } = useTranslatedText("Untitled Task");

  const icon = getTaskIcon(task);

  const handleBeginPress = async () => {
    try {
      console.log("[TaskCard] BEGIN pressed, current status:", task.status);
      // If task is not started, update status to STARTED
      if (
        task.status !== TaskStatus.STARTED &&
        task.status !== TaskStatus.INPROGRESS
      ) {
        console.log("[TaskCard] Updating task status to STARTED");
        const updated = await TaskService.updateTask(task.id, {
          status: TaskStatus.STARTED,
        });
        console.log("[TaskCard] Task updated, new status:", updated?.status);
      }
      // Call the onPress callback if provided
      onPress?.(task);
    } catch (error) {
      console.error("[TaskCard] Error updating task status:", error);
    }
  };

  const isCompleted = task.status === TaskStatus.COMPLETED;
  const isDisabled = isCompleted;

  return (
    <TouchableOpacity
      style={[styles.card, isDisabled && styles.cardDisabled]}
      onPress={() => {
        if (!isDisabled) {
          onPress?.(task);
        }
      }}
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
                  <Text style={styles.beginButtonText}>{beginButtonText}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.arrowButton}
                  onPress={() => onPress?.(task)}
                  activeOpacity={0.7}
                >
                  <IconSymbol name="chevron.right" size={20} color="#57606f" />
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
};

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
