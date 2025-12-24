import {
  GlobalHeader,
  NavigationMenu,
  TaskActivityModule,
} from "@orion/task-system";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLogger } from "../../src/hooks/useLogger";

export default function TaskDashboardScreen() {
  const logger = useLogger();
  const [showMenu, setShowMenu] = useState(false);
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const router = useRouter();
  const isFocused = useIsFocused();
  const [resetSignal, setResetSignal] = useState<number>(0);

  const menuItems = useMemo(
    () => [
      {
        key: "activities",
        name: "Activities",
        icon: "doc.text.fill",
        description: "View all activities/assessments",
        onPress: () => router.push("/(tabs)/activities"),
      },
      {
        key: "questions",
        name: "Questions",
        icon: "questionmark.circle.fill",
        description: "View all questions",
        onPress: () => router.push("/(tabs)/questions"),
      },
      {
        key: "task-answers",
        name: "Task Answers",
        icon: "checkmark.square.fill",
        description: "View task answer submissions",
        onPress: () => router.push("/(tabs)/task-answers"),
      },
      {
        key: "task-results",
        name: "Task Results",
        icon: "chart.bar.fill",
        description: "View task result data",
        onPress: () => router.push("/(tabs)/task-results"),
      },
      {
        key: "task-history",
        name: "Task History",
        icon: "clock.fill",
        description: "View task history logs",
        onPress: () => router.push("/(tabs)/task-history"),
      },
      {
        key: "datapoints",
        name: "Data Points",
        icon: "point.topleft.down.curvedto.point.bottomright.up.fill",
        description: "View data point instances",
        onPress: () => router.push("/(tabs)/datapoints"),
      },
      {
        key: "seed-screen",
        name: "Seed Data",
        icon: "leaf.fill",
        description: "Dev Options (fixture generation/import/reset)",
        onPress: () => router.push("/(tabs)/seed-screen"),
      },
    ],
    [router]
  );

  const bumpResetSignal = useCallback((): void => {
    setResetSignal(prev => prev + 1);
  }, []);

  // Re-tapping the Tasks tab should reset the module back to its dashboard.
  useEffect(() => {
    const navAny = navigation as any;
    const unsub = navAny?.addListener?.("tabPress", bumpResetSignal);
    return () => unsub?.();
  }, [bumpResetSignal, navigation]);

  // Switching away/back to the Tasks tab should also reset to the module dashboard.
  useEffect(() => {
    if (!isFocused) return;
    bumpResetSignal();
  }, [bumpResetSignal, isFocused]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlobalHeader
        title="Dashboard"
        showMenuButton={true}
        onMenuPress={() => {
          logger.debug("Menu button pressed", undefined, "TaskDashboardScreen");
          setShowMenu(true);
        }}
      />

      <View style={styles.moduleContainer}>
        {/* <SyncStatusBanner /> */}
        <TaskActivityModule
          disableSafeAreaTopInset={true}
          resetSignal={resetSignal}
        />
      </View>

      <NavigationMenu
        visible={showMenu}
        onClose={() => setShowMenu(false)}
        items={menuItems}
      />
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
  moduleContainer: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2f3542",
    marginBottom: 16,
  },
});
