import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { Task, TaskStatus, TaskType } from "../types/Task";
import { useTaskList } from "../hooks/useTaskList";
import { getServiceLogger } from "../utils/serviceLogger";
import { TaskCard } from "./TaskCard";

import { TaskFilters } from "../types/Task";

const logger = getServiceLogger("TasksView");

interface TasksViewProps {
  filters?: TaskFilters;
  onTaskPress?: (task: Task) => void;
}

export const TasksView: React.FC<TasksViewProps> = ({
  filters,
  onTaskPress,
}) => {
  const { tasks, loading, error, handleDeleteTask, refreshTasks, isSynced } =
    useTaskList(filters);
  const [refreshing, setRefreshing] = React.useState(false);

  // ADD TEST TASK ON MOUNT IF NONE EXIST
  React.useEffect(() => {
    if (tasks.length === 0 && !loading) {
      logger.debug("NO TASKS - Adding test task");
      const testTask: Task = {
        id: "test-task-" + Date.now(),
        pk: "TEST-PK",
        sk: "TEST-SK",
        title: "TEST TASK - This should be visible!",
        description: "If you see this, TaskCard is rendering!",
        taskType: TaskType.SCHEDULED,
        status: TaskStatus.OPEN,
        startTimeInMillSec: Date.now(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const { TaskService } = require("../services/TaskService");
      TaskService.createTask(testTask).catch((err: unknown) => {
        logger.error("Error creating test task", err);
      });
    }
  }, [tasks.length, loading]);

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
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading tasks...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
        <Text style={styles.emptyText}>Pull to refresh</Text>
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
          colors={["#3498db"]}
        />
      }
    >
      {isSynced && (
        <View style={styles.syncIndicator}>
          <View style={styles.syncDot} />
          <Text style={styles.syncText}>Synced</Text>
        </View>
      )}

      {/* TODAY'S TASKS - VERY PROMINENT - ALWAYS VISIBLE */}
      {(() => {
        logger.debug("RENDERING TODAY SECTION");
        return (
          <View style={styles.todaySection}>
            <View style={styles.todaySectionHeader}>
              <Text style={styles.todaySectionTitle}>
                📅 TODAY&apos;S TASKS
              </Text>
              <View style={styles.todaySectionBadge}>
                <Text style={styles.todaySectionCount}>
                  {todayTasks.length}
                </Text>
              </View>
            </View>
            {todayTasks.length === 0 ? (
              <Text style={styles.emptySectionText}>No tasks for today</Text>
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Upcoming</Text>
            <Text style={styles.sectionCount}>({upcomingTasks.length})</Text>
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
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Past</Text>
            <Text style={styles.sectionCount}>({pastTasks.length})</Text>
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
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No tasks yet. Create one!</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
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
    backgroundColor: "#1dd1a1",
    marginRight: 5,
  },
  syncText: {
    fontSize: 12,
    color: "#57606f",
  },
  // TODAY'S TASKS SECTION - IMPOSSIBLE TO MISS
  todaySection: {
    marginBottom: 24,
  },
  todaySectionHeader: {
    backgroundColor: "#2196f3",
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
    shadowColor: "#2196f3",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 4,
    borderColor: "#1976d2",
  },
  todaySectionTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#ffffff",
    letterSpacing: 1,
    textShadowColor: "#000",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  todaySectionBadge: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 50,
    alignItems: "center",
  },
  todaySectionCount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2196f3",
  },
  emptySectionText: {
    fontSize: 14,
    color: "#95a5a6",
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
    borderBottomColor: "#dfe4ea",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2f3542",
    marginRight: 8,
  },
  sectionCount: {
    fontSize: 16,
    color: "#747d8c",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
    minHeight: 200,
  },
  emptyText: {
    fontSize: 18,
    color: "#747d8c",
    textAlign: "center",
  },
  loadingText: {
    fontSize: 16,
    color: "#57606f",
    textAlign: "center",
    padding: 32,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
    padding: 32,
  },
});
