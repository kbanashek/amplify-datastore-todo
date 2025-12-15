/**
 * Development screen to run seed script
 *
 * This screen provides a UI to seed the database with Activities and Tasks
 * for testing question rendering.
 */

import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { seedAppointmentData } from "../../scripts/seed-appointment-data";
import { seedCoordinatedData } from "../../scripts/seed-coordinated-data";
import { seedQuestionData } from "../../scripts/seed-question-data";
import { GlobalHeader } from "../../src/components/GlobalHeader";
import { TranslatedText } from "../../src/components/TranslatedText";
import {
  AppointmentService,
  TaskService,
  SeededDataCleanupService,
} from "@orion/task-system";
import { TestIds } from "../../src/constants/testIds";
import { useRouter } from "expo-router";
import { logWithDevice } from "../../src/utils/deviceLogger";
import { forceFullSync, clearCacheAndResync } from "../../src/utils/syncUtils";

export default function SeedScreen() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeedingAppointments, setIsSeedingAppointments] = useState(false);
  const [isSeedingCoordinated, setIsSeedingCoordinated] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isClearingAppointments, setIsClearingAppointments] = useState(false);
  const [isNuclearResetting, setIsNuclearResetting] = useState(false);
  const [isResettingAndReseeding, setIsResettingAndReseeding] = useState(false);
  const [isForceSyncing, setIsForceSyncing] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [appointmentSeedResult, setAppointmentSeedResult] = useState<any>(null);
  const [coordinatedSeedResult, setCoordinatedSeedResult] = useState<any>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // ============================================================================
  // DELETE OPERATIONS
  // ============================================================================

  const handleNuclearReset = async () => {
    console.log("☢️ [SeedScreen] Nuclear Reset button pressed");

    Alert.alert(
      "⚠️ Nuclear Reset - Delete All Task Data?",
      "This will permanently delete ALL task-related submitted data:\n\n" +
        "• All Tasks\n" +
        "• All Task Answers\n" +
        "• All Task Results\n" +
        "• All Task History\n" +
        "• All DataPoints\n" +
        "• All DataPoint Instances\n\n" +
        "This action cannot be undone and will remove all submitted data from AWS databases.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All Data",
          style: "destructive",
          onPress: async () => {
            setIsNuclearResetting(true);
            try {
              console.log("☢️ [SeedScreen] Starting nuclear reset...");
              const result = await TaskService.nuclearReset();
              console.log(
                "✅ [SeedScreen] Nuclear reset completed successfully",
                { result }
              );
              Alert.alert(
                "Success",
                `Nuclear reset completed!\n\n` +
                  `Deleted:\n` +
                  `• ${result.tasks} task${result.tasks !== 1 ? "s" : ""}\n` +
                  `• ${result.taskAnswers} task answer${
                    result.taskAnswers !== 1 ? "s" : ""
                  }\n` +
                  `• ${result.taskResults} task result${
                    result.taskResults !== 1 ? "s" : ""
                  }\n` +
                  `• ${result.taskHistories} task histor${
                    result.taskHistories !== 1 ? "ies" : "y"
                  }\n\n` +
                  `All task-related submitted data has been removed from AWS databases.`
              );
            } catch (error: unknown) {
              console.error("❌ [SeedScreen] Error during nuclear reset:", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
              });
              Alert.alert(
                "Error",
                error instanceof Error
                  ? error.message
                  : "Failed to perform nuclear reset"
              );
            } finally {
              setIsNuclearResetting(false);
            }
          },
        },
      ]
    );
  };

  const handleClearAll = async () => {
    console.log("🗑️ [SeedScreen] Clear All Tasks button pressed");

    Alert.alert(
      "Clear All Tasks?",
      "This will permanently delete all tasks from the database. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            setIsClearing(true);
            try {
              console.log("🗑️ [SeedScreen] Starting to delete all tasks...");
              const deletedCount = await TaskService.deleteAllTasks();
              console.log("✅ [SeedScreen] All tasks deleted successfully", {
                deletedCount,
              });
              Alert.alert(
                "Success",
                `Deleted ${deletedCount} task${
                  deletedCount !== 1 ? "s" : ""
                } from the database.`
              );
            } catch (error: unknown) {
              console.error("❌ [SeedScreen] Error deleting tasks:", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
              });
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              Alert.alert("Error", errorMessage || "Failed to delete tasks");
            } finally {
              setIsClearing(false);
            }
          },
        },
      ]
    );
  };

  const handleClearAppointments = async () => {
    console.log("🗑️ [SeedScreen] Clear All Appointments button pressed");

    Alert.alert(
      "Clear All Appointments?",
      "This will permanently delete all seeded appointments. This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete All",
          style: "destructive",
          onPress: async () => {
            setIsClearingAppointments(true);
            try {
              console.log(
                "🗑️ [SeedScreen] Starting to clear all appointments..."
              );
              await AppointmentService.clearAppointments();
              console.log(
                "✅ [SeedScreen] All appointments cleared successfully"
              );
              Alert.alert("Success", "All appointments have been cleared.");
            } catch (error: unknown) {
              console.error("❌ [SeedScreen] Error clearing appointments:", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
              });
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              Alert.alert(
                "Error",
                errorMessage || "Failed to clear appointments"
              );
            } finally {
              setIsClearingAppointments(false);
            }
          },
        },
      ]
    );
  };

  // ============================================================================
  // SEED OPERATIONS
  // ============================================================================

  const handleSeed = async () => {
    console.log("🌱 [SeedScreen] Seed button pressed");
    setIsSeeding(true);
    setSeedResult(null);

    try {
      console.log("🌱 [SeedScreen] Starting seed process...");
      const result = await seedQuestionData();
      console.log("✅ [SeedScreen] Seed process completed successfully", {
        activitiesCount: result.activities.length,
        tasksCount: result.tasks.length,
        tasksWithQuestions: result.tasks.filter((t: any) => t.entityId).length,
        tasksWithoutQuestions: result.tasks.filter((t: any) => !t.entityId)
          .length,
      });
      setSeedResult(result);
      Alert.alert(
        "Success",
        `Seeded ${result.activities.length} activities and ${result.tasks.length} tasks!\n\n` +
          `${
            result.tasks.filter((t: any) => t.entityId).length
          } tasks have questions.\n` +
          `${
            result.tasks.filter((t: any) => !t.entityId).length
          } tasks are simple (no questions).`
      );
    } catch (error: unknown) {
      console.error("❌ [SeedScreen] Seed error:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Alert.alert("Error", errorMessage || "Failed to seed data");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSeedCoordinated = async () => {
    console.log("🌱 [SeedScreen] Coordinated Seed button pressed");
    setIsSeedingCoordinated(true);
    setCoordinatedSeedResult(null);

    try {
      console.log("🌱 [SeedScreen] Starting coordinated seed process...");
      const result = await seedCoordinatedData();

      console.log(
        "✅ [SeedScreen] Coordinated seed process completed successfully",
        {
          appointmentsCount: result.summary.appointmentsCount,
          tasksCount: result.summary.tasksCount,
          linkedTasksCount: result.summary.linkedTasksCount,
          standaloneTasksCount: result.summary.standaloneTasksCount,
          activitiesCount: result.summary.activitiesCount,
          relationshipsCount: result.relationships.length,
        }
      );

      setCoordinatedSeedResult(result);

      Alert.alert(
        "Success",
        `Seeded ${result.summary.appointmentsCount} appointments and ${result.summary.tasksCount} tasks!\n\n` +
          `• ${result.summary.linkedTasksCount} tasks linked to appointments\n` +
          `• ${result.summary.standaloneTasksCount} standalone tasks\n` +
          `• ${result.summary.activitiesCount} activities\n` +
          `• ${result.relationships.length} appointment-task relationships\n\n` +
          `Tasks are scheduled relative to appointment dates and can move with visit rescheduling.`
      );
    } catch (error: unknown) {
      console.error("❌ [SeedScreen] Coordinated seed error:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Alert.alert("Error", errorMessage || "Failed to seed coordinated data");
    } finally {
      setIsSeedingCoordinated(false);
    }
  };

  const handleSeedAppointments = async () => {
    console.log("📅 [SeedScreen] Seed Appointments button pressed");
    setIsSeedingAppointments(true);

    try {
      console.log("📅 [SeedScreen] Starting appointment seed process...");
      const appointmentData = await seedAppointmentData();
      await AppointmentService.saveAppointments(appointmentData);

      const appointmentsCount =
        appointmentData.clinicPatientAppointments.clinicAppointments.items
          .length;
      const todayAppointments =
        appointmentData.clinicPatientAppointments.clinicAppointments.items.filter(
          (apt: any) => {
            const startDate = new Date(apt.startAt);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return startDate >= today && startDate < tomorrow;
          }
        ).length;

      console.log(
        "✅ [SeedScreen] Appointment seed process completed successfully",
        {
          appointmentsCount,
          todayAppointments,
          timezone: appointmentData.siteTimezoneId,
        }
      );

      setAppointmentSeedResult({
        appointments:
          appointmentData.clinicPatientAppointments.clinicAppointments.items,
        appointmentsCount,
        todayAppointments,
        timezone: appointmentData.siteTimezoneId,
      });

      Alert.alert(
        "Success",
        `Seeded ${appointmentsCount} appointments!\n\n` +
          `Today's appointments: ${todayAppointments}\n` +
          `Timezone: ${appointmentData.siteTimezoneId}\n\n` +
          `Please refresh the dashboard to see the appointments.`
      );
    } catch (error: unknown) {
      console.error("❌ [SeedScreen] Appointment seed error:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Alert.alert("Error", errorMessage || "Failed to seed appointments");
    } finally {
      setIsSeedingAppointments(false);
    }
  };

  const handleResetAndReseed = async () => {
    console.log("🔄 [SeedScreen] Reset & Reseed button pressed");
    setIsResettingAndReseeding(true);

    try {
      // Step 0: Verify initial task count
      console.log("🔄 [SeedScreen] Step 0: Verifying initial task count...");
      const initialTasks = await TaskService.getTasks();
      const initialTaskCount = initialTasks.length;
      console.log(`📊 [SeedScreen] Initial task count: ${initialTaskCount}`);

      // Step 1: Clear ALL seeded data (nuclear delete)
      // This deletes: tasks, taskAnswers, taskResults, taskHistories, activities,
      // questions, dataPoints, dataPointInstances, todos, and appointments
      console.log(
        "🔄 [SeedScreen] Step 1: Nuclear delete - Clearing ALL seeded data..."
      );
      const cleanupResult = await SeededDataCleanupService.clearAllSeededData();
      console.log("✅ [SeedScreen] Nuclear delete completed:", {
        tasksDeleted: cleanupResult.deleted.tasks,
        taskAnswersDeleted: cleanupResult.deleted.taskAnswers,
        taskResultsDeleted: cleanupResult.deleted.taskResults,
        taskHistoriesDeleted: cleanupResult.deleted.taskHistories,
        activitiesDeleted: cleanupResult.deleted.activities,
        questionsDeleted: cleanupResult.deleted.questions,
        dataPointsDeleted: cleanupResult.deleted.dataPoints,
        dataPointInstancesDeleted: cleanupResult.deleted.dataPointInstances,
        todosDeleted: cleanupResult.deleted.todos,
        appointmentsCleared: cleanupResult.clearedAppointments,
      });

      // Step 3: Verify deletions - check task count is zero
      console.log("🔄 [SeedScreen] Step 3: Verifying all tasks are deleted...");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Brief wait for local deletion
      const tasksAfterDelete = await TaskService.getTasks();
      const taskCountAfterDelete = tasksAfterDelete.length;
      console.log(
        `📊 [SeedScreen] Task count after deletion: ${taskCountAfterDelete}`
      );

      if (taskCountAfterDelete > 0) {
        console.warn(
          `⚠️ [SeedScreen] Warning: ${taskCountAfterDelete} tasks still remain after deletion. This may indicate sync delay.`
        );
      }

      // Step 4: Force full sync to ensure deletions propagate to all devices
      console.log(
        "🔄 [SeedScreen] Step 4: Forcing full sync to propagate deletions to all devices..."
      );
      try {
        await forceFullSync();
        console.log("✅ [SeedScreen] Full sync completed after deletions");
      } catch (syncError) {
        console.warn(
          "⚠️ [SeedScreen] Error during forced sync, continuing anyway:",
          syncError
        );
      }

      // Step 5: Wait additional time for deletions to sync across all devices
      console.log(
        "🔄 [SeedScreen] Step 5: Waiting 10 seconds for deletions to fully sync across all devices..."
      );
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Step 6: Verify sync - check task count again after sync wait
      console.log("🔄 [SeedScreen] Step 6: Verifying deletions have synced...");
      const tasksAfterSync = await TaskService.getTasks();
      const taskCountAfterSync = tasksAfterSync.length;
      console.log(
        `📊 [SeedScreen] Task count after sync wait: ${taskCountAfterSync}`
      );

      // Step 7: Reseed coordinated data
      console.log("🔄 [SeedScreen] Step 7: Reseeding coordinated data...");
      const result = await seedCoordinatedData();
      // result contains appointments array, need to convert to AppointmentData format
      const appointmentData: any = {
        clinicPatientAppointments: {
          clinicAppointments: {
            items: result.appointments,
          },
        },
        siteTimezoneId: "America/New_York", // Default timezone
      };
      await AppointmentService.saveAppointments(appointmentData);
      console.log("✅ [SeedScreen] Coordinated data reseeded:", {
        appointmentsCount: result.summary.appointmentsCount,
        tasksCount: result.summary.tasksCount,
        activitiesCount: result.summary.activitiesCount,
      });

      // Step 8: Verify reseeded data locally
      console.log("🔄 [SeedScreen] Step 8: Verifying reseeded data locally...");
      await new Promise(resolve => setTimeout(resolve, 2000)); // Brief wait for local creation
      const tasksAfterReseed = await TaskService.getTasks();
      const taskCountAfterReseed = tasksAfterReseed.length;
      console.log(
        `📊 [SeedScreen] Task count after reseed: ${taskCountAfterReseed} (expected: ${result.summary.tasksCount})`
      );

      if (taskCountAfterReseed !== result.summary.tasksCount) {
        console.warn(
          `⚠️ [SeedScreen] Warning: Task count mismatch. Expected ${result.summary.tasksCount}, got ${taskCountAfterReseed}. This may indicate sync delay.`
        );
      }

      // Step 9: Force full sync to ensure new data propagates to all devices
      console.log(
        "🔄 [SeedScreen] Step 9: Forcing full sync to propagate new data to all devices..."
      );
      try {
        await forceFullSync();
        console.log("✅ [SeedScreen] Full sync completed after reseeding");
      } catch (syncError) {
        console.warn(
          "⚠️ [SeedScreen] Error during forced sync, continuing anyway:",
          syncError
        );
      }

      // Step 10: Wait additional time for new data to sync across all devices
      console.log(
        "🔄 [SeedScreen] Step 10: Waiting 10 seconds for new data to fully sync across all devices..."
      );
      await new Promise(resolve => setTimeout(resolve, 10000));

      // Step 11: Final verification
      console.log(
        "🔄 [SeedScreen] Step 11: Final verification of synced data..."
      );
      const finalTasks = await TaskService.getTasks();
      const finalTaskCount = finalTasks.length;
      console.log(
        `📊 [SeedScreen] Final task count: ${finalTaskCount} (expected: ${result.summary.tasksCount})`
      );

      console.log("✅ [SeedScreen] Reset & Reseed completed successfully", {
        initialTaskCount,
        tasksDeleted: cleanupResult.deleted.tasks,
        taskAnswersDeleted: cleanupResult.deleted.taskAnswers,
        taskResultsDeleted: cleanupResult.deleted.taskResults,
        taskHistoriesDeleted: cleanupResult.deleted.taskHistories,
        activitiesDeleted: cleanupResult.deleted.activities,
        taskCountAfterDelete,
        taskCountAfterSync,
        taskCountAfterReseed,
        finalTaskCount,
        expectedTaskCount: result.summary.tasksCount,
        appointmentsCount: result.summary.appointmentsCount,
        activitiesCount: result.summary.activitiesCount,
      });

      const syncStatus =
        finalTaskCount === result.summary.tasksCount
          ? "✅ All platforms should be in sync!"
          : `⚠️ Task count mismatch. Check logs for sync status.`;

      Alert.alert(
        "Reset & Reseed Complete",
        `Reset & Reseed completed on this device!\n\n` +
          `Nuclear Delete Results:\n` +
          `• ${cleanupResult.deleted.tasks} tasks\n` +
          `• ${cleanupResult.deleted.taskAnswers} task answers\n` +
          `• ${cleanupResult.deleted.taskResults} task results\n` +
          `• ${cleanupResult.deleted.taskHistories} task histories\n` +
          `• ${cleanupResult.deleted.activities} activities\n` +
          `• ${cleanupResult.deleted.questions} questions\n` +
          `• ${cleanupResult.deleted.dataPoints} data points\n` +
          `• ${cleanupResult.deleted.dataPointInstances} data point instances\n` +
          `• Appointments cleared\n\n` +
          `Sync Verification:\n` +
          `• Initial tasks: ${initialTaskCount}\n` +
          `• After delete: ${taskCountAfterDelete}\n` +
          `• After sync wait: ${taskCountAfterSync}\n` +
          `• After reseed: ${taskCountAfterReseed}\n` +
          `• Final count: ${finalTaskCount}\n` +
          `• Expected: ${result.summary.tasksCount}\n\n` +
          `Reseeded:\n` +
          `• ${result.summary.appointmentsCount} appointments\n` +
          `• ${result.summary.tasksCount} tasks\n` +
          `• ${result.summary.activitiesCount} activities\n\n` +
          `${syncStatus}\n\n` +
          `⚠️ CRITICAL: Other devices need to sync!\n\n` +
          `To fix sync on other devices:\n` +
          `1. Open the app on iOS/Android/Web\n` +
          `2. Go to Seed Data screen\n` +
          `3. Press "🔄 Force Sync (Clear Cache & Resync)" button\n` +
          `4. Wait for sync to complete\n` +
          `5. Check task count matches: ${result.summary.tasksCount}\n\n` +
          `OR restart the app on each device to force sync.\n\n` +
          `All devices should show the same data after Force Sync.`
      );
    } catch (error: unknown) {
      console.error("❌ [SeedScreen] Reset & Reseed error:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      Alert.alert("Error", errorMessage || "Failed to reset and reseed");
    } finally {
      setIsResettingAndReseeding(false);
    }
  };

  const handleForceSync = async () => {
    console.log("🔄 [SeedScreen] Force Sync button pressed");
    setIsForceSyncing(true);

    try {
      Alert.alert(
        "Force Sync",
        "This will clear local cache and force a complete resync from the cloud.\n\n" +
          "⚠️ WARNING: Any unsynced local changes will be lost.\n\n" +
          "Use this when devices are showing different data.\n\n" +
          "Press OK to continue.",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              setIsForceSyncing(false);
            },
          },
          {
            text: "Force Sync",
            style: "destructive",
            onPress: async () => {
              try {
                console.log(
                  "🔄 [SeedScreen] Starting force sync (clear cache and resync)..."
                );
                await clearCacheAndResync();
                console.log("✅ [SeedScreen] Force sync completed");

                Alert.alert(
                  "Success",
                  "Force sync completed!\n\n" +
                    "Local cache cleared and data resynced from cloud.\n\n" +
                    "All devices should now show the same data after they sync."
                );
              } catch (error: unknown) {
                console.error("❌ [SeedScreen] Force sync error:", {
                  error: error instanceof Error ? error.message : String(error),
                  stack: error instanceof Error ? error.stack : undefined,
                });
                const errorMessage =
                  error instanceof Error ? error.message : String(error);
                Alert.alert("Error", errorMessage || "Failed to force sync");
              } finally {
                setIsForceSyncing(false);
              }
            },
          },
        ]
      );
    } catch (error: unknown) {
      console.error("❌ [SeedScreen] Force sync error:", {
        error: error instanceof Error ? error.message : String(error),
      });
      Alert.alert("Error", "Failed to start force sync");
      setIsForceSyncing(false);
    }
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderSection = (
    title: string,
    description: string,
    items: string[]
  ) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionText}>{description}</Text>
      {items.length > 0 && (
        <View style={styles.listContainer}>
          {items.map((item, index) => (
            <Text key={index} style={styles.listItem}>
              • {item}
            </Text>
          ))}
        </View>
      )}
    </View>
  );

  const renderButton = (
    label: string,
    onPress: () => void,
    isLoading: boolean,
    disabled: boolean,
    style: any,
    textStyle: any,
    testID?: string
  ) => (
    <TouchableOpacity
      style={[style, (isLoading || disabled) && styles.buttonDisabled]}
      onPress={onPress}
      disabled={isLoading || disabled}
      testID={testID}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color="#fff" />
      ) : (
        <Text style={textStyle}>{label}</Text>
      )}
    </TouchableOpacity>
  );

  const isAnyOperationRunning =
    isSeeding ||
    isSeedingAppointments ||
    isSeedingCoordinated ||
    isClearing ||
    isClearingAppointments ||
    isNuclearResetting ||
    isResettingAndReseeding ||
    isForceSyncing;

  return (
    <View
      style={[styles.container, { paddingTop: insets.top }]}
      testID={TestIds.seedScreenRoot}
    >
      <GlobalHeader title="Seed Data" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>📋 Seed Data Management</Text>
          <Text style={styles.introText}>
            Create test data, delete data, or fix sync issues. Each button
            clearly states what it does.
          </Text>
        </View>

        {/* ====================================================================== */}
        {/* QUICK ACTIONS - Most Common Operations */}
        {/* ====================================================================== */}
        <View style={styles.operationGroup}>
          <Text style={styles.groupTitle}>⚡ Quick Actions</Text>
          <Text style={styles.groupDescription}>
            Most common operations - click to see what each does
          </Text>

          {renderButton(
            "🔄 Delete Everything & Reseed (Recommended)",
            handleResetAndReseed,
            isResettingAndReseeding,
            isAnyOperationRunning,
            styles.primaryButton,
            styles.buttonText
          )}
          <Text style={styles.buttonHelpText}>
            Deletes ALL data, waits for sync, then creates fresh appointments +
            tasks. Use this to start fresh and sync all devices.
          </Text>

          {renderButton(
            "🌱 Create Appointments + Tasks",
            handleSeedCoordinated,
            isSeedingCoordinated,
            isAnyOperationRunning,
            styles.primaryButton,
            styles.buttonText,
            TestIds.seedScreenSeedCoordinatedButton
          )}
          <Text style={styles.buttonHelpText}>
            Creates appointments and tasks with relationships. Tasks are linked
            to appointments and scheduled relative to appointment dates.
          </Text>

          {renderButton(
            "🔄 Fix Sync Issues (Force Sync)",
            handleForceSync,
            isForceSyncing,
            isAnyOperationRunning,
            styles.syncButton,
            styles.buttonText
          )}
          <Text style={styles.buttonHelpText}>
            Clears local cache and resyncs from cloud. Use this on each device
            when they show different data. ⚠️ Any unsaved local changes will be
            lost.
          </Text>
        </View>

        {/* ====================================================================== */}
        {/* DELETE OPERATIONS */}
        {/* ====================================================================== */}
        <View style={styles.operationGroup}>
          <Text style={styles.groupTitle}>🗑️ Delete Data</Text>
          <Text style={styles.groupDescription}>
            Remove data from the database. ⚠️ These operations cannot be undone.
          </Text>

          {renderButton(
            "☢️ Delete ALL Task Data (Nuclear Reset)",
            handleNuclearReset,
            isNuclearResetting,
            isAnyOperationRunning,
            styles.dangerButton,
            styles.buttonText
          )}
          <Text style={styles.buttonHelpText}>
            Deletes: Tasks, Task Answers, Task Results, Task History,
            DataPoints, DataPoint Instances. Most comprehensive deletion.
          </Text>

          {renderButton(
            "🗑️ Delete Tasks Only",
            handleClearAll,
            isClearing,
            isAnyOperationRunning,
            styles.dangerButton,
            styles.buttonText
          )}
          <Text style={styles.buttonHelpText}>
            Deletes only Tasks. Task Answers, Results, and History remain.
          </Text>

          {renderButton(
            "🗑️ Delete Appointments Only",
            handleClearAppointments,
            isClearingAppointments,
            isAnyOperationRunning,
            styles.dangerButton,
            styles.buttonText
          )}
          <Text style={styles.buttonHelpText}>
            Deletes only Appointments. Tasks and other data remain.
          </Text>
        </View>

        {/* ====================================================================== */}
        {/* SEED OPERATIONS */}
        {/* ====================================================================== */}
        <View style={styles.operationGroup}>
          <Text style={styles.groupTitle}>🌱 Create Test Data</Text>
          <Text style={styles.groupDescription}>
            Create different types of test data for development and testing.
          </Text>

          {renderButton(
            "🌱 Create Tasks & Activities Only",
            handleSeed,
            isSeeding,
            isAnyOperationRunning,
            styles.seedButton,
            styles.buttonText
          )}
          <Text style={styles.buttonHelpText}>
            Creates Activities with questions and Tasks that reference them.
            Simple option for testing question rendering. Creates ~60 tasks over
            6 days.
          </Text>

          {renderButton(
            "📅 Create Appointments Only",
            handleSeedAppointments,
            isSeedingAppointments,
            isAnyOperationRunning,
            styles.seedButton,
            styles.buttonText
          )}
          <Text style={styles.buttonHelpText}>
            Creates sample appointments (TELEVISIT and ONSITE) for today,
            tomorrow, and next week. No tasks are created.
          </Text>
        </View>

        {/* ====================================================================== */}
        {/* RESULTS SECTION */}
        {/* ====================================================================== */}
        {seedResult && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>
              ✅ Task/Activity Seed Results
            </Text>
            <Text style={styles.resultText}>
              Activities: {seedResult.activities.length}
            </Text>
            <Text style={styles.resultText}>
              Tasks: {seedResult.tasks.length}
            </Text>
            <View style={styles.resultDetails}>
              <Text style={styles.resultSubtitle}>Activities:</Text>
              {seedResult.activities.map((activity: any, index: number) => (
                <Text key={activity.id} style={styles.resultItem}>
                  {index + 1}. {activity.title || activity.name} (ID:{" "}
                  {activity.id})
                </Text>
              ))}
              <Text style={styles.resultSubtitle}>Tasks:</Text>
              {seedResult.tasks.map((task: any, index: number) => (
                <Text key={task.id} style={styles.resultItem}>
                  {index + 1}. {task.title} (ID: {task.id}, EntityID:{" "}
                  {task.entityId || "none"})
                </Text>
              ))}
            </View>
          </View>
        )}

        {appointmentSeedResult && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>✅ Appointment Seed Results</Text>
            <Text style={styles.resultText}>
              Total Appointments: {appointmentSeedResult.appointmentsCount}
            </Text>
            <Text style={styles.resultText}>
              Today&apos;s Appointments:{" "}
              {appointmentSeedResult.todayAppointments}
            </Text>
            <Text style={styles.resultText}>
              Timezone: {appointmentSeedResult.timezone}
            </Text>
            <View style={styles.resultDetails}>
              <Text style={styles.resultSubtitle}>Appointments:</Text>
              {appointmentSeedResult.appointments.map(
                (appointment: any, index: number) => (
                  <Text
                    key={appointment.appointmentId}
                    style={styles.resultItem}
                  >
                    {index + 1}. {appointment.title} (ID:{" "}
                    {appointment.appointmentId}, Type:{" "}
                    {appointment.appointmentType}, Start:{" "}
                    {new Date(appointment.startAt).toLocaleString()})
                  </Text>
                )
              )}
            </View>
          </View>
        )}

        {coordinatedSeedResult && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>✅ Coordinated Seed Results</Text>
            <Text style={styles.resultText}>
              Appointments: {coordinatedSeedResult.summary.appointmentsCount}
            </Text>
            <Text style={styles.resultText}>
              Total Tasks: {coordinatedSeedResult.summary.tasksCount}
            </Text>
            <Text style={styles.resultText}>
              Linked Tasks: {coordinatedSeedResult.summary.linkedTasksCount}
            </Text>
            <Text style={styles.resultText}>
              Standalone Tasks:{" "}
              {coordinatedSeedResult.summary.standaloneTasksCount}
            </Text>
            <Text style={styles.resultText}>
              Activities: {coordinatedSeedResult.summary.activitiesCount}
            </Text>
            <Text style={styles.resultText}>
              Relationships: {coordinatedSeedResult.relationships.length}
            </Text>
            <View style={styles.resultDetails}>
              <Text style={styles.resultSubtitle}>Relationships:</Text>
              {coordinatedSeedResult.relationships.map(
                (rel: any, index: number) => (
                  <Text key={rel.appointmentId} style={styles.resultItem}>
                    {index + 1}. Appointment: {rel.appointmentId} (EventID:{" "}
                    {rel.eventId}) - {rel.linkedTaskIds.length} linked tasks
                  </Text>
                )
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  operationGroup: {
    marginBottom: 32,
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dfe4ea",
  },
  groupTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2f3542",
    marginBottom: 8,
  },
  groupDescription: {
    fontSize: 14,
    color: "#57606f",
    lineHeight: 20,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2f3542",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: "#57606f",
    lineHeight: 20,
    marginBottom: 12,
  },
  listContainer: {
    marginTop: 8,
  },
  listItem: {
    fontSize: 14,
    color: "#57606f",
    marginBottom: 6,
    paddingLeft: 8,
    lineHeight: 20,
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  nuclearButton: {
    backgroundColor: "#8b0000",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#ff0000",
  },
  seedButton: {
    backgroundColor: "#3498db",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  appointmentSeedButton: {
    backgroundColor: "#9b59b6",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  coordinatedSeedButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dfe4ea",
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2f3542",
    marginBottom: 12,
  },
  resultText: {
    fontSize: 14,
    color: "#57606f",
    marginBottom: 8,
    lineHeight: 20,
  },
  resultSubtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2f3542",
    marginTop: 12,
    marginBottom: 8,
  },
  resultDetails: {
    marginTop: 8,
  },
  resultItem: {
    fontSize: 12,
    color: "#747d8c",
    fontFamily: "monospace",
    marginBottom: 4,
    paddingLeft: 8,
    lineHeight: 18,
  },
  introSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dfe4ea",
    marginBottom: 24,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2f3542",
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: "#57606f",
    lineHeight: 20,
  },
  buttonHelpText: {
    fontSize: 13,
    color: "#57606f",
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 20,
    paddingLeft: 4,
    fontStyle: "italic",
  },
  primaryButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  dangerButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  syncButton: {
    backgroundColor: "#3498db",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
});
