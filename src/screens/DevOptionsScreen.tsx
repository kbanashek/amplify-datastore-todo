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
import { GlobalHeader } from "@orion/task-system";
import { TestIds } from "../constants/testIds";
import { useDevOptions } from "../hooks/useDevOptions";

/**
 * Dev Options Screen
 *
 * Provides dev tools for testing DataStore sync, seeding data, and managing app state.
 *
 * All operations now use timeout-protected DataStore.stop() to prevent infinite hangs.
 */

export const DevOptionsScreen: React.FC = () => {
  const insets = useSafeAreaInsets();

  const {
    isBusy,
    isImportingFixture,
    isDeleting,
    lastError,
    simpleImportFixture,
    deleteTasksOnly,
    deleteAppointmentsOnly,
    nuclearDeleteCloud,
  } = useDevOptions();

  const confirm = (title: string, message: string, onConfirm: () => void) => {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Continue", style: "destructive", onPress: onConfirm },
    ]);
  };

  const handleQuickImport = () => {
    confirm(
      "⚡️ Add Fixture Tasks",
      "This will add 10 test tasks + 2 activities to this device.\n\n✅ Does NOT use DataStore.stop() - won't cause state errors\n✅ Data will sync to cloud automatically\n\nOther devices will see the new tasks within 10 seconds.",
      () => {
        simpleImportFixture()
          .then(() => {
            Alert.alert(
              "✅ Done!",
              "10 tasks added! They should sync to other devices automatically."
            );
          })
          .catch(() => {
            // error is surfaced via lastError
          });
      }
    );
  };

  const handleDeleteTasks = () => {
    confirm(
      "Delete All Tasks",
      "This will delete ALL tasks from DynamoDB (cloud).\n\n⚠️ Affects all devices.\n⚠️ Cannot be undone.",
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
      "This will delete ALL appointments from DynamoDB (cloud).\n\n⚠️ Affects all devices.\n⚠️ Cannot be undone.",
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
      "This will delete:\n\n• All tasks\n• All activities\n• All appointments\n• All questions\n• All data points\n• All task answers\n• All task results\n• All task temp answers\n• All task history\n\nFrom DynamoDB (cloud).\n\n⚠️ THIS CANNOT BE UNDONE!\n⚠️ ALL DEVICES AFFECTED!",
      () => {
        nuclearDeleteCloud()
          .then(() => {
            Alert.alert(
              "✅ Done!",
              "Everything deleted from cloud. Restart the app to clear local data."
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
        {/* Info Box */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>
            ⚠️ DataStore.stop() and .clear() Are Broken
          </Text>
          <Text style={styles.infoText}>
            DataStore.stop() and DataStore.clear() cause race condition errors
            in this environment.
            {"\n\n"}
            <Text style={styles.bold}>Operations removed:</Text>
            {"\n"}• Force Sync (uses DataStore.stop/clear)
            {"\n"}• Nuclear Reset (uses DataStore.stop/clear)
            {"\n"}• Generate Fresh Fixture (uses DataStore.stop/clear)
            {"\n\n"}
            <Text style={styles.bold}>Only safe operations included:</Text>
            {"\n"}• Add Test Tasks (direct DataStore.save())
            {"\n"}• Delete operations (direct DataStore.delete())
            {"\n\n"}
            <Text style={styles.bold}>To fix sync issues:</Text>
            {"\n"}Delete and reinstall the app on the stuck device.
          </Text>
        </View>

        {/* Error Display */}
        {lastError ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>❌ Error</Text>
            <Text style={styles.errorText}>{lastError}</Text>
          </View>
        ) : null}

        {/* Safe Operations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✅ Safe Operations</Text>
          <Text style={styles.sectionSubtitle}>
            These operations do NOT use DataStore.stop() or .clear()
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={handleQuickImport}
            disabled={isBusy}
            testID={TestIds.devOptions.quickImport}
          >
            <Text style={styles.buttonText}>
              {isImportingFixture ? "⏳ Adding..." : "⚡️ Add 10 Test Tasks"}
            </Text>
            <Text style={styles.buttonSubtext}>
              Direct DataStore.save() - safe, no race conditions. Syncs to cloud
              automatically.
            </Text>
          </TouchableOpacity>
        </View>

        {/* Delete Operations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🗑️ Delete Operations</Text>
          <Text style={styles.sectionSubtitle}>
            Delete data from cloud - affects all devices
          </Text>

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleDeleteTasks}
            disabled={isBusy}
            testID={TestIds.devOptions.deleteTasks}
          >
            <Text style={styles.buttonText}>
              {isDeleting ? "⏳ Deleting..." : "🗑️ Delete All Tasks"}
            </Text>
            <Text style={styles.buttonSubtext}>
              Deletes all tasks from DynamoDB (all devices affected)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleDeleteAppointments}
            disabled={isBusy}
            testID={TestIds.devOptions.deleteAppointments}
          >
            <Text style={styles.buttonText}>
              {isDeleting ? "⏳ Deleting..." : "🗑️ Delete All Appointments"}
            </Text>
            <Text style={styles.buttonSubtext}>
              Deletes all appointments from DynamoDB (all devices affected)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.buttonDanger]}
            onPress={handleNuclearDelete}
            disabled={isBusy}
            testID={TestIds.devOptions.nuclearDelete}
          >
            <Text style={styles.buttonText}>
              {isDeleting ? "⏳ Deleting..." : "💣 Delete EVERYTHING"}
            </Text>
            <Text style={styles.buttonSubtext}>
              Deletes ALL data from DynamoDB. Cannot be undone!
            </Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionsTitle}>💡 Usage Instructions</Text>
          <Text style={styles.instructionsText}>
            <Text style={styles.bold}>To Add Test Data:{"\n"}</Text>
            1. Press &ldquo;Add 10 Test Tasks&rdquo; on ONE device
            {"\n"}
            2. Data syncs to cloud automatically
            {"\n"}
            3. Other devices pull data within 10 seconds (fullSyncInterval)
            {"\n\n"}
            <Text style={styles.bold}>If Device Won&rsquo;t Sync:{"\n"}</Text>
            1. Delete the app on the stuck device
            {"\n"}
            2. Reinstall (press &lsquo;i&rsquo; for iOS or &lsquo;a&rsquo; for
            Android in Expo terminal)
            {"\n"}
            3. Device will pull fresh data from cloud on restart
            {"\n\n"}
            <Text style={styles.bold}>To Clear All Data:{"\n"}</Text>
            1. Press &ldquo;Delete EVERYTHING&rdquo; button
            {"\n"}
            2. Restart all devices to clear local caches
            {"\n"}
            3. Add fresh test tasks
            {"\n\n"}
            <Text style={styles.bold}>Why Some Buttons Are Missing:{"\n"}</Text>
            DataStore.stop() and .clear() cause
            &ldquo;DataStoreStateError&rdquo; race conditions.
            {"\n"}
            Only operations that DON&rsquo;T use stop/clear are included.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F7FA",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  infoBox: {
    backgroundColor: "#E3F2FD",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#2196F3",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1976D2",
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#1565C0",
  },
  errorBox: {
    backgroundColor: "#FFEBEE",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EF5350",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#C62828",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#B71C1C",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E3A8A",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 16,
  },
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
  buttonPrimary: {
    backgroundColor: "#2196F3",
  },
  buttonSecondary: {
    backgroundColor: "#64748B",
  },
  buttonDanger: {
    backgroundColor: "#EF5350",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  buttonSubtext: {
    fontSize: 13,
    color: "#FFFFFF",
    opacity: 0.9,
  },
  instructionsBox: {
    backgroundColor: "#FFF9C4",
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#FBC02D",
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#F57F17",
    marginBottom: 8,
  },
  instructionsText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#F57C00",
  },
  bold: {
    fontWeight: "700",
  },
});
