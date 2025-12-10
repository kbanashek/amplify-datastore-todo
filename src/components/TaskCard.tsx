import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Task, TaskStatus, TaskType } from "../types/Task";

interface TaskCardProps {
  task: Task;
  onPress?: (task: Task) => void;
  onDelete?: (id: string) => void;
}

const getStatusColor = (status: TaskStatus): string => {
  switch (status) {
    case TaskStatus.OPEN:
      return "#95a5a6";
    case TaskStatus.VISIBLE:
      return "#3498db";
    case TaskStatus.STARTED:
      return "#f39c12";
    case TaskStatus.INPROGRESS:
      return "#9b59b6";
    case TaskStatus.COMPLETED:
      return "#27ae60";
    case TaskStatus.EXPIRED:
      return "#e74c3c";
    case TaskStatus.RECALLED:
      return "#34495e";
    default:
      return "#95a5a6";
  }
};

const getTaskTypeLabel = (type: TaskType): string => {
  switch (type) {
    case TaskType.SCHEDULED:
      return "SCHEDULED";
    case TaskType.TIMED:
      return "TIMED";
    case TaskType.EPISODIC:
      return "EPISODIC";
    default:
      return "UNKNOWN";
  }
};

const formatDate = (timestamp?: number | null): string => {
  if (!timestamp) return "No date";
  const date = new Date(timestamp);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  );
};

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onDelete,
}) => {
  console.log("[TaskCard] RENDER:", {
    id: task.id,
    title: task.title,
    hasTitle: !!task.title,
    titleLength: task.title?.length || 0,
    status: task.status,
  });

  const statusColor = getStatusColor(task.status);

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={() => onPress?.(task)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            <Text
              style={styles.title}
              numberOfLines={3}
              onLayout={(e) => {
                console.log("[TaskCard] Title layout:", {
                  id: task.id,
                  width: e.nativeEvent.layout.width,
                  height: e.nativeEvent.layout.height,
                  title: task.title,
                });
              }}
            >
              {task.title || "Untitled Task"}
            </Text>
            {task.description && (
              <Text style={styles.description} numberOfLines={2}>
                {task.description}
              </Text>
            )}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{task.status}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <View style={styles.typeBadge}>
            <Text style={styles.typeText}>
              {getTaskTypeLabel(task.taskType)}
            </Text>
          </View>
          {task.pk && (
            <Text style={styles.pkText} numberOfLines={1}>
              {task.pk}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.details}>
        {task.startTimeInMillSec && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Start:</Text>
            <Text style={styles.detailValue}>
              {formatDate(task.startTimeInMillSec)}
            </Text>
          </View>
        )}

        {task.expireTimeInMillSec && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Expires:</Text>
            <Text style={styles.detailValue}>
              {formatDate(task.expireTimeInMillSec)}
            </Text>
          </View>
        )}

        {task.pk && (
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>PK:</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {task.pk}
            </Text>
          </View>
        )}
      </View>

      {onDelete && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => onDelete(task.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    marginBottom: 8,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#1a1a1a",
    marginBottom: 6,
    lineHeight: 28,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "bold",
  },
  typeBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#ecf0f1",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginTop: 4,
  },
  typeText: {
    color: "#7f8c8d",
    fontSize: 10,
    fontWeight: "600",
  },
  description: {
    fontSize: 14,
    color: "#57606f",
    marginTop: 4,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  pkText: {
    fontSize: 11,
    color: "#95a5a6",
    fontFamily: "monospace",
    flex: 1,
  },
  details: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "#dfe4ea",
  },
  detailRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  detailLabel: {
    fontSize: 12,
    color: "#747d8c",
    fontWeight: "600",
    width: 70,
  },
  detailValue: {
    fontSize: 12,
    color: "#2f3542",
    flex: 1,
  },
  deleteButton: {
    marginTop: 12,
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
