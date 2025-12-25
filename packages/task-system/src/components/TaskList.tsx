import { TaskCard } from "@components/TaskCard";
import { useTaskList } from "@hooks/useTaskList";
import { Task, TaskFilters } from "@task-types/Task";
import { getServiceLogger } from "@utils/serviceLogger";
import { groupTasksByDate } from "@utils/taskGrouping";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";

const logger = getServiceLogger("TaskList");

interface TaskListProps {
  filters?: TaskFilters;
  onTaskPress?: (task: Task) => void;
}

/**
 * A list component for displaying tasks.
 *
 * @param filters - The filters to apply to the tasks
 * @param onTaskPress - Callback function when a task is pressed
 * @returns A list component with the provided configuration
 */
export const TaskList: React.FC<TaskListProps> = ({ filters, onTaskPress }) => {
  const { tasks, loading, error, isSynced, handleDeleteTask, refreshTasks } =
    useTaskList(filters);

  logger.debug("RENDER START", {
    tasksCount: tasks.length,
    loading,
    error,
    isSynced,
  });

  const groupedTasks = useMemo(() => {
    logger.debug("Grouping tasks by date");
    const grouped = groupTasksByDate(tasks);
    logger.debug("Grouped results", {
      today: grouped.today.length,
      upcoming: grouped.upcoming.length,
      past: grouped.past.length,
    });
    return grouped;
  }, [tasks]);

  const sections = useMemo(() => {
    logger.debug("Creating sections");
    const sections: { title: string; data: Task[]; highlight?: boolean }[] = [];

    // Always show Today's Tasks section first (even if empty, to make it prominent)
    // FORCE at least one empty item so SectionList renders the header
    const todayData =
      groupedTasks.today.length > 0
        ? groupedTasks.today
        : [
            {
              id: "placeholder-empty",
              title: "",
              status: "OPEN" as any,
              taskType: "SCHEDULED" as any,
              pk: "",
              sk: "",
            },
          ];

    const todaySection = {
      title: "Today's Tasks",
      data: todayData,
      highlight: true,
    };
    logger.debug("Adding Today section", {
      title: todaySection.title,
      dataCount: todaySection.data.length,
      highlight: todaySection.highlight,
      firstTask: todaySection.data[0]?.title || "none",
    });
    sections.push(todaySection);

    if (groupedTasks.upcoming.length > 0) {
      sections.push({ title: "Upcoming", data: groupedTasks.upcoming });
      logger.debug("Added Upcoming section", {
        count: groupedTasks.upcoming.length,
      });
    }

    if (groupedTasks.past.length > 0) {
      sections.push({ title: "Past", data: groupedTasks.past });
      logger.debug("Added Past section", { count: groupedTasks.past.length });
    }

    logger.debug("SECTIONS CREATED", {
      totalSections: sections.length,
      sections: sections.map((section, idx) => ({
        index: idx,
        title: section.title,
        count: section.data.length,
        highlight: section.highlight,
        hasData: section.data.length > 0,
      })),
    });
    return sections;
  }, [groupedTasks]);

  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string; data: Task[]; highlight?: boolean };
  }) => {
    logger.debug("renderSectionHeader called", {
      title: section.title,
      highlight: section.highlight,
      dataCount: section.data.length,
    });

    // Make "Today's Tasks" section VERY prominent
    if (section.highlight) {
      logger.debug("RENDERING HIGHLIGHTED SECTION (Today's Tasks)");
      return (
        <View
          style={styles.todaySectionHeader}
          testID={`task-list-section-header-${section.title}`}
        >
          <View style={styles.todaySectionContent}>
            <Text style={styles.todaySectionTitle}>📅 {section.title}</Text>
            <View style={styles.todaySectionBadge}>
              <Text style={styles.todaySectionCount}>
                {section.data.length}
              </Text>
            </View>
          </View>
        </View>
      );
    }

    // Regular section headers
    logger.debug("RENDERING REGULAR SECTION", { title: section.title });
    return (
      <View
        style={styles.sectionHeader}
        testID={`task-list-section-header-${section.title}`}
      >
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <View style={styles.sectionCountBadge}>
          <Text style={styles.sectionCount}>{section.data.length}</Text>
        </View>
      </View>
    );
  };

  const renderTask = ({ item }: { item: Task }) => {
    logger.debug("renderTask called", {
      id: item.id,
      title: item.title,
      status: item.status,
    });

    // Don't render placeholder items
    if (item.id === "placeholder-empty") {
      return null;
    }

    return (
      <TaskCard task={item} onPress={onTaskPress} onDelete={handleDeleteTask} />
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer} testID="task-list-empty-loading">
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.emptyText}>Loading tasks...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer} testID="task-list-empty-error">
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.emptyText}>Pull to refresh</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer} testID="task-list-empty">
        <Text style={styles.emptyText}>No tasks yet. Create one!</Text>
      </View>
    );
  };

  // Show loading state if loading and no tasks yet
  if (loading && tasks.length === 0) {
    return renderEmpty();
  }

  // Show error state if error exists
  if (error && tasks.length === 0) {
    return renderEmpty();
  }

  // Show empty state only if no tasks and not loading
  if (tasks.length === 0 && !loading && !error) {
    return renderEmpty();
  }

  // Debug: Always show tasks even if sections are empty
  logger.debug("RENDER DECISION", {
    sectionsCount: sections.length,
    tasksCount: tasks.length,
    loading,
    willRenderSectionList: sections.length > 0,
  });

  // Always show sections (Today's Tasks is always included, even if empty)
  if (sections.length === 0 && tasks.length > 0) {
    logger.warn("Have tasks but no sections! Using fallback", { tasks });
    // Show tasks anyway in a fallback section
    const fallbackSections = [
      { title: "Today's Tasks", data: tasks, highlight: true },
    ];
    return (
      <View style={styles.container}>
        <SectionList
          sections={fallbackSections}
          renderItem={renderTask}
          renderSectionHeader={renderSectionHeader}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  }

  logger.debug("RENDERING MAIN SECTIONLIST", {
    sections: sections.map(s => ({
      title: s.title,
      count: s.data.length,
      highlight: s.highlight,
    })),
  });

  return (
    <View style={styles.container} testID="task-list">
      {isSynced && (
        <View style={styles.syncIndicator} testID="task-list-sync-indicator">
          <View style={styles.syncDot} testID="task-list-sync-dot" />
          <Text style={styles.syncText} testID="task-list-sync-text">
            Synced
          </Text>
        </View>
      )}

      <SectionList
        testID="task-list-section-list"
        sections={sections}
        renderItem={renderTask}
        renderSectionHeader={info => {
          logger.debug("SectionList renderSectionHeader called", {
            section: info.section.title,
            highlight: info.section.highlight,
            sectionIndex: 0,
          });
          return renderSectionHeader(info);
        }}
        keyExtractor={item => item.id}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refreshTasks}
            colors={["#3498db"]}
          />
        }
        contentContainerStyle={styles.listContent}
        SectionSeparatorComponent={() => <View style={{ height: 8 }} />}
        ListHeaderComponent={null}
        stickySectionHeadersEnabled={false}
        onViewableItemsChanged={info => {
          logger.debug("Viewable items changed", {
            count: info.viewableItems.length,
          });
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#dfe4ea",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2f3542",
  },
  syncedBadge: {
    fontSize: 12,
    color: "#27ae60",
    fontWeight: "600",
  },
  syncIndicator: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
    backgroundColor: "#d4edda",
    borderBottomWidth: 1,
    borderBottomColor: "#c3e6cb",
  },
  syncDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#27ae60",
    marginRight: 8,
  },
  syncText: {
    fontSize: 12,
    color: "#155724",
    fontWeight: "600",
  },
  listContent: {
    padding: 16,
    paddingTop: 0, // Remove top padding so Today's section can be full width
  },
  // Today's Tasks Section - VERY PROMINENT
  todaySectionHeader: {
    backgroundColor: "#2196f3", // BRIGHT BLUE
    marginTop: 0,
    marginBottom: 16,
    marginLeft: -16, // Extend to edges
    marginRight: -16, // Extend to edges
    paddingVertical: 24, // BIGGER
    paddingHorizontal: 16,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    shadowColor: "#2196f3",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minHeight: 70, // FORCE minimum height
  },
  todaySectionContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  todaySectionTitle: {
    fontSize: 28, // EVEN BIGGER
    fontWeight: "900", // HEAVIEST
    color: "#ffffff", // PURE WHITE
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  todaySectionBadge: {
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    minWidth: 40,
    alignItems: "center",
  },
  todaySectionCount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2196f3",
  },
  // Regular section headers
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2f3542",
  },
  sectionCountBadge: {
    backgroundColor: "#ecf0f1",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 30,
    alignItems: "center",
  },
  sectionCount: {
    fontSize: 14,
    fontWeight: "bold",
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
    fontSize: 16,
    color: "#747d8c",
    textAlign: "center",
    marginTop: 16,
  },
  errorText: {
    fontSize: 14,
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 8,
  },
});
