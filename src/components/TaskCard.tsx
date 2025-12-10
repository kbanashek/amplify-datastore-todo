import { IconSymbol } from "@/components/ui/IconSymbol";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
    simple,
  });

  const icon = getTaskIcon(task);

  // Get status display info
  const getStatusInfo = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.COMPLETED:
        return { label: "COMPLETED", color: "#27ae60", bgColor: "#d5f4e6" };
      case TaskStatus.INPROGRESS:
        return { label: "IN PROGRESS", color: "#f39c12", bgColor: "#fef5e7" };
      case TaskStatus.STARTED:
        return { label: "STARTED", color: "#3498db", bgColor: "#ebf5fb" };
      default:
        return null;
    }
  };

  const statusInfo = getStatusInfo(task.status);

  const handleBeginPress = async () => {
    console.log("▶️ [TaskCard] BEGIN button pressed", {
      taskId: task.id,
      taskTitle: task.title,
      currentStatus: task.status,
      entityId: task.entityId,
    });

    try {
      // If task is not started, update status to STARTED
      if (
        task.status !== TaskStatus.STARTED &&
        task.status !== TaskStatus.INPROGRESS
      ) {
        console.log("🔄 [TaskCard] Updating task status to STARTED", {
          taskId: task.id,
          previousStatus: task.status,
        });
        await TaskService.updateTask(task.id, {
          status: TaskStatus.STARTED,
        });
        console.log("✅ [TaskCard] Task status updated successfully", {
          taskId: task.id,
          newStatus: TaskStatus.STARTED,
        });
      } else {
        console.log(
          "ℹ️ [TaskCard] Task already started/in progress, skipping status update",
          {
            taskId: task.id,
            status: task.status,
          }
        );
      }
      // Call the onPress callback if provided
      console.log("🧭 [TaskCard] Calling onPress callback", {
        taskId: task.id,
        hasCallback: !!onPress,
      });
      onPress?.(task);
    } catch (error) {
      console.error("❌ [TaskCard] Error updating task status:", {
        taskId: task.id,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
    }
  };

  const handleCardPress = () => {
    console.log("👆 [TaskCard] Card pressed", {
      taskId: task.id,
      taskTitle: task.title,
      entityId: task.entityId,
      hasCallback: !!onPress,
    });
    onPress?.(task);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handleCardPress}
      activeOpacity={0.7}
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
            <View style={styles.titleContainer}>
              <Text style={styles.title} numberOfLines={2}>
                {task.title || "Untitled Task"}
              </Text>
              {statusInfo && (
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusInfo.bgColor },
                  ]}
                >
                  <Text
                    style={[styles.statusText, { color: statusInfo.color }]}
                  >
                    {statusInfo.label}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {!simple && (
          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.beginButton}
              onPress={handleBeginPress}
              activeOpacity={0.8}
            >
              <Text style={styles.beginButtonText}>
                {task.status === TaskStatus.STARTED ||
                task.status === TaskStatus.INPROGRESS
                  ? "RESUME"
                  : "BEGIN"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.arrowButton}
              onPress={() => {
                console.log("➡️ [TaskCard] Arrow button pressed", {
                  taskId: task.id,
                  taskTitle: task.title,
                });
                onPress?.(task);
              }}
              activeOpacity={0.7}
            >
              <IconSymbol name="chevron.right" size={20} color="#57606f" />
            </TouchableOpacity>
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
  titleContainer: {
    flex: 1,
    flexDirection: "column",
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1a1a1a",
    lineHeight: 26,
  },
  statusBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.5,
    textTransform: "uppercase",
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
});
