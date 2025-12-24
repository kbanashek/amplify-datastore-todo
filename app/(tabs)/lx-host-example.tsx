import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LXHostExample } from "../../packages/task-system/LX Integration Resources/LXHostExample";
import { GlobalHeader, NavigationMenu } from "@orion/task-system";

/**
 * In-app harness screen to test LXHostExample without re-configuring Amplify/DataStore.
 *
 * app/_layout.tsx already:
 * - imports amplify-init-sync (Amplify.configure)
 * - bootstraps DataStore
 *
 * So this screen runs LXHostExample in "already configured" mode and only imports fixture.
 */
export default function LXHostExampleScreen(): React.ReactElement {
  const [showMenu, setShowMenu] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlobalHeader
        title="LX Host Example"
        showMenuButton={true}
        onMenuPress={() => setShowMenu(true)}
      />

      <View style={styles.moduleContainer}>
        <LXHostExample
          configureAmplify={false}
          startDataStore={false}
          importFixture={true}
          embedded={true}
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
  moduleContainer: {
    flex: 1,
    padding: 20,
  },
});
