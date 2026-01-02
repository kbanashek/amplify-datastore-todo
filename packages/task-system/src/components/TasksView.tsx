/**
 * TasksView component module.
 *
 * @module TasksView
 */

import { TaskCard } from "@components/TaskCard";
import { AppColors } from "@constants/AppColors";
import { AppFonts } from "@constants/AppFonts";
import { useTaskList } from "@hooks/useTaskList";
import { Task, TaskFilters } from "@task-types/Task";
import { getServiceLogger } from "@utils/serviceLogger";
import React from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const logger = getServiceLogger("TasksView");

/**
 * Props for the TasksView component
 */
interface TasksViewProps {
  filters?: TaskFilters;
  onTaskPress?: (task: Task) => void;
}

/**
 * TasksView component.
 *
 * @param props - Component props
 * @returns Rendered TasksView component
 */
export const TasksView: React.FC<TasksViewProps> = ({
  filters,
  onTaskPress,
}) => {
  const { tasks, loading, error, handleDeleteTask, refreshTasks, isSynced } =
    useTaskList(filters);
  const [refreshing, setRefreshing] = React.useState(false);

  logger.debug("RENDER START", {
    tasksCount: tasks.length,
    tasks: tasks.map(t => ({ id: t.id, title: t.title, status: t.status })),
    loading,
    error,
  });

  // Group tasks by date
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const todayTasks: Task[] = [];
  const upcomingTasks: Task[] = [];
  const pastTasks: Task[] = [];

  tasks.forEach(task => {
    if (!task.startTimeInMillSec) {
      logger.debug("Task without startTimeInMillSec, adding to upcoming", {
        id: task.id,
        title: task.title,
      });
      upcomingTasks.push(task);
      return;
    }

    const taskDate = new Date(task.startTimeInMillSec);
    logger.debug("Task date", {
      id: task.id,
      date: taskDate.toISOString(),
    });

    if (taskDate >= todayStart && taskDate < todayEnd) {
      todayTasks.push(task);
    } else if (taskDate >= todayEnd) {
      upcomingTasks.push(task);
    } else {
      pastTasks.push(task);
    }
  });

  logger.debug("Grouped", {
    today: todayTasks.length,
    upcoming: upcomingTasks.length,
    past: pastTasks.length,
  });

  const onRefresh = async () => {
    logger.debug("Manual refresh triggered");
    setRefreshing(true);
    await refreshTasks();
    setRefreshing(false);
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container} testID="tasks-view-loading">
        <ActivityIndicator
          size="large"
          color={AppColors.CIBlue}
          testID="tasks-view-loading-spinner"
        />
        <Text style={styles.loadingText} testID="tasks-view-loading-text">
          Loading tasks...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container} testID="tasks-view-error">
        <Text style={styles.errorText} testID="tasks-view-error-text">
          {error}
        </Text>
        <Text style={styles.emptyText} testID="tasks-view-error-hint">
          Pull to refresh
        </Text>
      </View>
    );
  }

  logger.debug("ABOUT TO RETURN JSX", {
    todayTasksLength: todayTasks.length,
    upcomingTasksLength: upcomingTasks.length,
    pastTasksLength: pastTasks.length,
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[AppColors.CIBlue]}
        />
      }
      testID="tasks-view"
    >
      {isSynced && (
        <View style={styles.syncIndicator} testID="tasks-view-sync-indicator">
          <View style={styles.syncDot} />
          <Text style={styles.syncText}>Synced</Text>
        </View>
      )}

      {/* TODAY'S TASKS - VERY PROMINENT - ALWAYS VISIBLE */}
      {(() => {
        logger.debug("RENDERING TODAY SECTION");
        return (
          <View style={styles.todaySection} testID="tasks-view-today-section">
            <View
              style={styles.todaySectionHeader}
              testID="tasks-view-today-header"
            >
              <Text
                style={styles.todaySectionTitle}
                testID="tasks-view-today-title"
              >
                📅 TODAY&apos;S TASKS
              </Text>
              <View style={styles.todaySectionBadge}>
                <Text
                  style={styles.todaySectionCount}
                  testID="tasks-view-today-count"
                >
                  {todayTasks.length}
                </Text>
              </View>
            </View>
            {todayTasks.length === 0 ? (
              <Text
                style={styles.emptySectionText}
                testID="tasks-view-today-empty"
              >
                No tasks for today
              </Text>
            ) : (
              todayTasks.map(task => {
                logger.debug("Rendering TODAY task with TaskCard", {
                  id: task.id,
                  title: task.title,
                });
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onPress={onTaskPress}
                    onDelete={handleDeleteTask}
                  />
                );
              })
            )}
          </View>
        );
      })()}

      {/* UPCOMING TASKS */}
      {upcomingTasks.length > 0 && (
        <View style={styles.section} testID="tasks-view-upcoming-section">
          <View
            style={styles.sectionHeader}
            testID="tasks-view-upcoming-header"
          >
            <Text
              style={styles.sectionTitle}
              testID="tasks-view-upcoming-title"
            >
              Upcoming
            </Text>
            <Text
              style={styles.sectionCount}
              testID="tasks-view-upcoming-count"
            >
              ({upcomingTasks.length})
            </Text>
          </View>
          {upcomingTasks.map(task => {
            logger.debug("Rendering UPCOMING task with TaskCard", {
              id: task.id,
              title: task.title,
            });
            return (
              <TaskCard
                key={task.id}
                task={task}
                onPress={onTaskPress}
                onDelete={handleDeleteTask}
              />
            );
          })}
        </View>
      )}

      {/* PAST TASKS */}
      {pastTasks.length > 0 && (
        <View style={styles.section} testID="tasks-view-past-section">
          <View style={styles.sectionHeader} testID="tasks-view-past-header">
            <Text style={styles.sectionTitle} testID="tasks-view-past-title">
              Past
            </Text>
            <Text style={styles.sectionCount} testID="tasks-view-past-count">
              ({pastTasks.length})
            </Text>
          </View>
          {pastTasks.map(task => {
            logger.debug("Rendering PAST task with TaskCard", {
              id: task.id,
              title: task.title,
            });
            return (
              <TaskCard
                key={task.id}
                task={task}
                onPress={onTaskPress}
                onDelete={handleDeleteTask}
              />
            );
          })}
        </View>
      )}

      {tasks.length === 0 && !loading && (
        <View style={styles.emptyContainer} testID="tasks-view-empty">
          <Text style={styles.emptyText} testID="tasks-view-empty-text">
            No tasks yet. Create one!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.powderGray,
    // TEMPORARY: Bright background to verify component renders
    // backgroundColor: '#ff0000',
  },
  scrollContent: {
    padding: 16,
    paddingTop: 0,
  },
  syncIndicator: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  syncDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: AppColors.statusSynced,
    marginRight: 5,
  },
  syncText: {
    ...AppFonts.caption,
    color: AppColors.darkGray,
  },
  // TODAY'S TASKS SECTION - IMPOSSIBLE TO MISS
  todaySection: {
    marginBottom: 24,
  },
  todaySectionHeader: {
    backgroundColor: AppColors.CIBlue,
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 16,
    marginLeft: -16,
    marginRight: -16,
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: AppColors.CIBlue,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 4,
    borderColor: AppColors.headerBlue,
  },
  todaySectionTitle: {
    ...AppFonts.heading,
    color: AppColors.white,
    letterSpacing: 1,
    textShadowColor: AppColors.black,
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  todaySectionBadge: {
    backgroundColor: AppColors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 50,
    alignItems: "center",
  },
  todaySectionCount: {
    ...AppFonts.subheading,
    color: AppColors.CIBlue,
  },
  emptySectionText: {
    ...AppFonts.small,
    color: AppColors.iconGray,
    fontStyle: "italic",
    textAlign: "center",
    padding: 16,
  },
  // REGULAR SECTIONS
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: AppColors.borderGray,
  },
  sectionTitle: {
    ...AppFonts.subheading,
    color: AppColors.gray,
    marginRight: 8,
  },
  sectionCount: {
    ...AppFonts.body,
    color: AppColors.legacy.gray,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    minHeight: 200,
  },
  emptyText: {
    ...AppFonts.subheading,
    color: AppColors.legacy.gray,
    textAlign: "center",
  },
  loadingText: {
    ...AppFonts.body,
    color: AppColors.darkGray,
    textAlign: "center",
    padding: 32,
    marginTop: 16,
  },
  errorText: {
    ...AppFonts.body,
    color: AppColors.errorRed,
    textAlign: "center",
    padding: 32,
  },
});
