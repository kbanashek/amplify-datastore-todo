import React, { useMemo } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  SectionList,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTaskList } from "../hooks/useTaskList";
import { Task, TaskFilters } from "../types/Task";
import { TaskCard } from "./TaskCard";

interface TaskListProps {
  filters?: TaskFilters;
  onTaskPress?: (task: Task) => void;
}

interface GroupedTasks {
  today: Task[];
  upcoming: Task[];
  past: Task[];
}

const groupTasksByDate = (tasks: Task[]): GroupedTasks => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart);
  todayEnd.setDate(todayEnd.getDate() + 1);

  const grouped: GroupedTasks = {
    today: [],
    upcoming: [],
    past: [],
  };

  tasks.forEach((task) => {
    // If no startTimeInMillSec, put in upcoming
    if (!task.startTimeInMillSec) {
      console.log(
        "[TaskList] Task without startTimeInMillSec:",
        task.id,
        task.title
      );
      grouped.upcoming.push(task);
      return;
    }

    const taskDate = new Date(task.startTimeInMillSec);
    console.log(
      "[TaskList] Task date:",
      task.id,
      "date:",
      taskDate,
      "todayStart:",
      todayStart,
      "todayEnd:",
      todayEnd
    );

    if (taskDate >= todayStart && taskDate < todayEnd) {
      grouped.today.push(task);
    } else if (taskDate >= todayEnd) {
      grouped.upcoming.push(task);
    } else {
      grouped.past.push(task);
    }
  });

  // Sort each group by start time
  const sortByStartTime = (a: Task, b: Task) => {
    const aTime = a.startTimeInMillSec || 0;
    const bTime = b.startTimeInMillSec || 0;
    return aTime - bTime;
  };

  grouped.today.sort(sortByStartTime);
  grouped.upcoming.sort(sortByStartTime);
  grouped.past.sort(sortByStartTime);

  return grouped;
};

export const TaskList: React.FC<TaskListProps> = ({ filters, onTaskPress }) => {
  const { tasks, loading, error, isSynced, handleDeleteTask, refreshTasks } =
    useTaskList(filters);

  console.log("========================================");
  console.log("[TaskList] RENDER START");
  console.log("[TaskList] Tasks received:", tasks.length);
  console.log("[TaskList] Loading:", loading);
  console.log("[TaskList] Error:", error);
  console.log("[TaskList] IsSynced:", isSynced);
  console.log("[TaskList] Tasks data:", JSON.stringify(tasks, null, 2));
  console.log("========================================");

  const groupedTasks = useMemo(() => {
    console.log("[TaskList] Grouping tasks by date...");
    const grouped = groupTasksByDate(tasks);
    console.log("[TaskList] Grouped results:", {
      today: grouped.today.length,
      upcoming: grouped.upcoming.length,
      past: grouped.past.length,
    });
    return grouped;
  }, [tasks]);

  const sections = useMemo(() => {
    console.log("[TaskList] Creating sections...");
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
    console.log("[TaskList] Adding Today section:", {
      title: todaySection.title,
      dataCount: todaySection.data.length,
      highlight: todaySection.highlight,
      firstTask: todaySection.data[0]?.title || "none",
    });
    sections.push(todaySection);

    if (groupedTasks.upcoming.length > 0) {
      sections.push({ title: "Upcoming", data: groupedTasks.upcoming });
      console.log(
        "[TaskList] Added Upcoming section:",
        groupedTasks.upcoming.length
      );
    }

    if (groupedTasks.past.length > 0) {
      sections.push({ title: "Past", data: groupedTasks.past });
      console.log("[TaskList] Added Past section:", groupedTasks.past.length);
    }

    console.log("[TaskList] ===== SECTIONS CREATED =====");
    console.log("[TaskList] Total sections:", sections.length);
    sections.forEach((section, idx) => {
      console.log(`[TaskList] Section ${idx}:`, {
        title: section.title,
        count: section.data.length,
        highlight: section.highlight,
        hasData: section.data.length > 0,
      });
    });
    console.log("[TaskList] ============================");
    return sections;
  }, [groupedTasks]);

  const renderSectionHeader = ({
    section,
  }: {
    section: { title: string; data: Task[]; highlight?: boolean };
  }) => {
    console.log("[TaskList] renderSectionHeader called:", {
      title: section.title,
      highlight: section.highlight,
      dataCount: section.data.length,
    });

    // Make "Today's Tasks" section VERY prominent
    if (section.highlight) {
      console.log("[TaskList] RENDERING HIGHLIGHTED SECTION (Today's Tasks)");
      console.log("[TaskList] Using todaySectionHeader style");
      return (
        <View
          style={styles.todaySectionHeader}
          onLayout={(e) => {
            console.log("[TaskList] Today section header LAYOUT:", {
              width: e.nativeEvent.layout.width,
              height: e.nativeEvent.layout.height,
              x: e.nativeEvent.layout.x,
              y: e.nativeEvent.layout.y,
            });
          }}
        >
          <View style={styles.todaySectionContent}>
            <Text
              style={styles.todaySectionTitle}
              onLayout={(e) => {
                console.log("[TaskList] Today section title LAYOUT:", {
                  width: e.nativeEvent.layout.width,
                  height: e.nativeEvent.layout.height,
                });
              }}
            >
              📅 {section.title}
            </Text>
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
    console.log("[TaskList] RENDERING REGULAR SECTION:", section.title);
    return (
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{section.title}</Text>
        <View style={styles.sectionCountBadge}>
          <Text style={styles.sectionCount}>{section.data.length}</Text>
        </View>
      </View>
    );
  };

  const renderTask = ({ item }: { item: Task }) => {
    console.log("[TaskList] renderTask called:", {
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
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.emptyText}>Loading tasks...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.emptyText}>Pull to refresh</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No tasks yet. Create one!</Text>
      </View>
    );
  };

  // Debug: Always show tasks even if sections are empty
  console.log("[TaskList] ===== RENDER DECISION =====");
  console.log("[TaskList] Sections count:", sections.length);
  console.log("[TaskList] Tasks count:", tasks.length);
  console.log("[TaskList] Loading:", loading);
  console.log("[TaskList] Will render SectionList:", sections.length > 0);
  console.log("[TaskList] ===========================");

  // Always show sections (Today's Tasks is always included, even if empty)
  if (sections.length === 0 && !loading && tasks.length > 0) {
    console.log(
      "[TaskList] WARNING: Have tasks but no sections! Using fallback"
    );
    // If we have tasks but no sections, something's wrong with grouping
    console.warn("[TaskList] WARNING: Have tasks but no sections!", tasks);
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
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  }

  // Show empty state only if no tasks and not loading
  if (sections.length === 0 && !loading && tasks.length === 0) {
    return renderEmpty();
  }

  console.log("[TaskList] RENDERING MAIN SECTIONLIST");
  console.log(
    "[TaskList] Sections to render:",
    sections.map((s) => ({
      title: s.title,
      count: s.data.length,
      highlight: s.highlight,
    }))
  );

  return (
    <View style={styles.container}>
      {isSynced && (
        <View style={styles.syncIndicator}>
          <View style={styles.syncDot} />
          <Text style={styles.syncText}>Synced</Text>
        </View>
      )}

      <SectionList
        sections={sections}
        renderItem={renderTask}
        renderSectionHeader={(info) => {
          console.log(
            "[TaskList] SectionList renderSectionHeader called with:",
            {
              section: info.section.title,
              highlight: info.section.highlight,
            }
          );
          return renderSectionHeader(info);
        }}
        keyExtractor={(item) => {
          console.log("[TaskList] keyExtractor called for:", item.id);
          return item.id;
        }}
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
        onViewableItemsChanged={(info) => {
          console.log(
            "[TaskList] Viewable items changed:",
            info.viewableItems.length
          );
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
