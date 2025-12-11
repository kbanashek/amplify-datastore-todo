import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GlobalHeader } from "../../src/components/GlobalHeader";
import { NavigationMenu } from "../../src/components/NavigationMenu";
import { TasksGroupedView } from "../../src/components/TasksGroupedView";
import { useGroupedTasks } from "../../src/hooks/useGroupedTasks";
import { useTaskList } from "../../src/hooks/useTaskList";

export default function DashboardSimScreen() {
  const { tasks, loading, error, handleDeleteTask } = useTaskList();
  const groupedTasks = useGroupedTasks(tasks);
  const [showMenu, setShowMenu] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleTaskPress = (task: any) => {
    console.log("📋 [DashboardSim] Task pressed", {
      taskId: task.id,
      taskTitle: task.title,
      entityId: task.entityId,
      activityIndex: task.activityIndex,
      status: task.status,
      taskType: task.taskType,
      hasEntityId: !!task.entityId,
    });

    if (!task.entityId) {
      console.warn(
        "⚠️ [DashboardSim] Task missing entityId, cannot navigate to questions",
        {
          taskId: task.id,
          taskTitle: task.title,
        }
      );
      Alert.alert(
        "No Questions Available",
        "This task does not have an associated activity. Tasks need an entityId that links to an Activity to display questions.\n\nPlease use the seed data feature or create a task with a valid Activity reference.",
        [{ text: "OK", style: "default" }]
      );
      return;
    }

    console.log("🧭 [DashboardSim] Navigating to questions screen", {
      taskId: task.id,
      entityId: task.entityId,
    });

    router.push({
      pathname: "/(tabs)/questions",
      params: { taskId: task.id, entityId: task.entityId },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlobalHeader
        title="Dashboard SIM"
        showMenuButton={true}
        onMenuPress={() => {
          console.log("[DashboardSim] Menu button pressed");
          setShowMenu(true);
        }}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <TasksGroupedView
          groupedTasks={groupedTasks}
          loading={loading}
          error={error}
          onTaskPress={handleTaskPress}
          onDelete={handleDeleteTask}
        />
      </ScrollView>

      <NavigationMenu visible={showMenu} onClose={() => setShowMenu(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#dfe4ea",
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2f3542",
    flex: 1,
  },
  headerBottom: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
});
