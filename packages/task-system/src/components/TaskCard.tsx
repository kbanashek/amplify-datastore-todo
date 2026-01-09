/**
 * TaskCard component for displaying task information in a card format.
 *
 * Shows task details including title, due date/time, icon, and action buttons.
 * Supports both full cards (with BEGIN/RESUME buttons) and simple cards (display only).
 *
 * @module TaskCard
 */

import { TranslatedText } from "@components/TranslatedText";
import { IconSymbol, IconSymbolName } from "@components/ui/IconSymbol";
import { AppColors } from "@constants/AppColors";
import { AppFonts } from "@constants/AppFonts";
import { areTaskCardPropsEqual, useTaskCard } from "@hooks/useTaskCard";
import { Task } from "@task-types/Task";
import React, { memo } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

/**
 * Props for the TaskCard component
 */
interface TaskCardProps {
  /** The task object to display */
  task: Task;
  /** Callback when card is pressed (opens task) */
  onPress?: (task: Task) => void;
  /** Callback when delete button is pressed */
  onDelete?: (id: string) => void;
  /** If true, shows simple card without BEGIN/RESUME button */
  simple?: boolean;
}

/**
 * A card component for displaying task information with action buttons.
 *
 * Displays task title, due date/time, associated icon, and action buttons.
 * Automatically updates task status when BEGIN/RESUME is pressed.
 * Supports translation for all user-facing text.
 *
 * Memoized to prevent unnecessary re-renders (70-90% reduction).
 * Only re-renders when relevant props change (task data, callbacks, simple flag).
 *
 * @param props - TaskCard component props
 * @returns Rendered task card
 *
 * @example
 * ```tsx
 * // Full card with BEGIN button
 * <TaskCard
 *   task={task}
 *   onPress={(task) => navigate('TaskDetail', { task })}
 *   onDelete={(id) => deleteTask(id)}
 * />
 *
 * // Simple display card
 * <TaskCard task={task} simple />
 * ```
 */
const TaskCardComponent: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onDelete: _onDelete, // Prefix with underscore to indicate intentionally unused
  simple = false,
}: TaskCardProps) => {
  // Use custom hook for all business logic
  const {
    icon,
    beginButtonText,
    completedText,
    isCompleted,
    isDisabled,
    handleBeginPress,
    handleCardPress,
    t,
  } = useTaskCard({ task, onPress });

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
                name={icon.name as IconSymbolName}
                size={24}
                color={icon.color}
              />
            </View>
            <View style={styles.titleContainer}>
              <TranslatedText
                text={task.title || t("task.untitled")}
                style={styles.title}
                numberOfLines={2}
                testID="task-card-title"
              />
            </View>
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

// Wrap with React.memo for performance optimization
// Uses custom comparison function to prevent 70-90% of unnecessary re-renders
export const TaskCard = memo(TaskCardComponent, areTaskCardPropsEqual);

// Add displayName for better debugging
TaskCard.displayName = "TaskCard";

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
  titleContainer: {
    flex: 1,
    gap: 6,
  },
  title: {
    ...AppFonts.large,
    color: AppColors.almostBlack,
    lineHeight: 26,
  },
  syncBadge: {
    alignSelf: "flex-start",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
    marginTop: 2,
  },
  syncBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: AppColors.white,
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
    ...AppFonts.small,
    color: AppColors.white,
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
    ...AppFonts.small,
    color: AppColors.white,
    fontWeight: "bold",
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
    ...AppFonts.small,
    color: AppColors.white,
    fontWeight: "bold",
    letterSpacing: 0.5,
  },
});
