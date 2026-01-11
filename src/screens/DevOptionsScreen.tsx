import React from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { SyncStatusBanner } from "../components/SyncStatusBanner";
import { SyncHealthDashboard } from "../components/SyncHealthDashboard";
import { GlobalHeader } from "@orion/task-system";
import { TestIds } from "../constants/testIds";
import { useDevOptions } from "../hooks/useDevOptions";

/**
 * Dev Options Screen
 *
 * Clean, organized developer tools for testing and debugging.
 *
 * Sections:
 * - Sync Tools: Force DataStore resync without deleting app
 * - Data Tools: Add test data for testing
 * - Delete Tools: Remove data from cloud/devices
 */

export const DevOptionsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const {
    isBusy,
    isImportingFixture,
    isDeleting,
    isResyncing,
    lastError,
    simpleImportFixture,
    deleteTasksOnly,
    deleteAppointmentsOnly,
    nuclearDeleteCloud,
    forceDataStoreResync,
  } = useDevOptions();

  const confirm = (title: string, message: string, onConfirm: () => void) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Continue", style: "destructive", onPress: onConfirm },
    ]);
  };

  // Sync Tools
  const handleForceResync = () => {
    confirm(
      "🔄 Force DataStore Resync",
      "This will:\n\n• Clear local DataStore cache\n• Force fresh pull from AWS\n• Fix sync issues without deleting app\n\n⏱️ Takes ~10 seconds\n✅ Keeps your app data and settings",
      () => {
        forceDataStoreResync()
          .then(() => {
            Alert.alert(
              "✅ Resync Complete!",
              "DataStore cache cleared and resynced from cloud."
            );
          })
          .catch(() => {
            // error is surfaced via lastError
          });
      }
    );
  };

  // Data Tools
  const handleQuickImport = () => {
    confirm(
      "⚡️ Add Test Tasks",
      "This will add 10 test tasks + 2 activities.\n\n✅ Data syncs to cloud automatically\n✅ Other devices will see tasks within 5-10 seconds",
      () => {
        simpleImportFixture()
          .then(() => {
            Alert.alert("✅ Done!", "10 tasks added and syncing to cloud!");
          })
          .catch(() => {
            // error is surfaced via lastError
          });
      }
    );
  };

  // Delete Tools
  const handleDeleteTasks = () => {
    confirm(
      "Delete All Tasks",
      "Deletes ALL tasks from cloud.\n\n⚠️ Affects all devices\n⚠️ Cannot be undone",
      () => {
        deleteTasksOnly()
          .then(() => {
            Alert.alert("✅ Done!", "All tasks deleted from cloud.");
          })
          .catch(() => {});
      }
    );
  };

  const handleDeleteAppointments = () => {
    confirm(
      "Delete All Appointments",
      "Deletes ALL appointments from cloud.\n\n⚠️ Affects all devices\n⚠️ Cannot be undone",
      () => {
        deleteAppointmentsOnly()
          .then(() => {
            Alert.alert("✅ Done!", "All appointments deleted from cloud.");
          })
          .catch(() => {});
      }
    );
  };

  const handleNuclearDelete = () => {
    confirm(
      "💣 Delete Everything",
      "Deletes ALL data from cloud:\n• Tasks\n• Activities\n• Appointments\n• Questions\n• Answers\n• Data Points\n\n⚠️ CANNOT BE UNDONE!\n⚠️ ALL DEVICES AFFECTED!",
      () => {
        nuclearDeleteCloud()
          .then(() => {
            Alert.alert(
              "✅ Done!",
              "Everything deleted. Press 'Force Resync' to clear local data."
            );
          })
          .catch(() => {});
      }
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlobalHeader title="Dev Options" showBackButton={false} />
      <SyncStatusBanner />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        testID={TestIds.devOptions.scrollView}
      >
        {/* Sync Health Dashboard */}
        <SyncHealthDashboard />

        {/* Error Display */}
        {lastError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>❌ Error</Text>
            <Text style={styles.errorText}>{lastError}</Text>
          </View>
        ) : null}

        {/* Sync Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔄 Sync Tools</Text>
          <Text style={styles.sectionDescription}>
            Fix DataStore sync issues without deleting the app
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonSync]}
            onPress={handleForceResync}
            disabled={isBusy}
            testID={TestIds.devOptions.forceResync}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>
                {isResyncing ? "⏳ Resyncing..." : "🔄 Force DataStore Resync"}
              </Text>
              <Text style={styles.buttonDescription}>
                Clear local cache and pull fresh data from AWS
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Data Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 Data Tools</Text>
          <Text style={styles.sectionDescription}>
            Add test data for development and testing
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonData]}
            onPress={handleQuickImport}
            disabled={isBusy}
            testID={TestIds.devOptions.quickImport}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>
                {isImportingFixture ? "⏳ Adding..." : "⚡️ Add 10 Test Tasks"}
              </Text>
              <Text style={styles.buttonDescription}>
                Adds tasks + activities, syncs to cloud automatically
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Delete Tools */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗑️ Delete Tools</Text>
          <Text style={styles.sectionDescription}>
            Remove data from cloud (affects all devices)
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonDelete]}
            onPress={handleDeleteTasks}
            disabled={isBusy}
            testID={TestIds.devOptions.deleteTasks}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>
                {isDeleting ? "⏳ Deleting..." : "🗑️ Delete All Tasks"}
              </Text>
              <Text style={styles.buttonDescription}>
                Removes all tasks from cloud
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDelete]}
            onPress={handleDeleteAppointments}
            disabled={isBusy}
            testID={TestIds.devOptions.deleteAppointments}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>
                {isDeleting ? "⏳ Deleting..." : "🗑️ Delete All Appointments"}
              </Text>
              <Text style={styles.buttonDescription}>
                Removes all appointments from cloud
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleNuclearDelete}
            disabled={isBusy}
            testID={TestIds.devOptions.nuclearDelete}
          >
            <View style={styles.buttonContent}>
              <Text style={styles.buttonTitle}>
                {isDeleting ? "⏳ Deleting..." : "💣 Delete EVERYTHING"}
              </Text>
              <Text style={styles.buttonDescription}>
                Removes ALL data from cloud - cannot be undone!
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Tips */}
        <View style={styles.tipsBox}>
          <Text style={styles.tipsTitle}>💡 Quick Tips</Text>
          <Text style={styles.tipsText}>
            • <Text style={styles.bold}>Sync issues?</Text> Try &ldquo;Force
            DataStore Resync&rdquo; first
            {"\n"}• <Text style={styles.bold}>Test cross-device sync?</Text> Add
            tasks on one device, check others
            {"\n"}• <Text style={styles.bold}>Start fresh?</Text> Delete
            Everything → Force Resync
          </Text>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },

  // Error Display
  errorBox: {
    backgroundColor: "#fee",
    borderWidth: 1,
    borderColor: "#fcc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#c00",
    marginBottom: 6,
  },
  errorText: {
    fontSize: 14,
    color: "#900",
    lineHeight: 20,
  },

  // Sections
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
    lineHeight: 20,
  },

  // Buttons
  button: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonContent: {
    gap: 4,
  },
  buttonTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  buttonDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.9)",
    lineHeight: 18,
  },

  // Button Variants
  buttonSync: {
    backgroundColor: "#2196F3", // Blue
  },
  buttonData: {
    backgroundColor: "#4CAF50", // Green
  },
  buttonDelete: {
    backgroundColor: "#FF9800", // Orange
  },
  buttonDanger: {
    backgroundColor: "#F44336", // Red
  },

  // Tips Box
  tipsBox: {
    backgroundColor: "#fff9e6",
    borderWidth: 1,
    borderColor: "#ffe066",
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#b8860b",
    marginBottom: 8,
  },
  tipsText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 22,
  },
  bold: {
    fontWeight: "600",
    color: "#333",
  },
});
