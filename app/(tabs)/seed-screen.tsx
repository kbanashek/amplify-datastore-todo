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
import { AppointmentService } from "../../src/services/AppointmentService";
import { TaskService } from "../../src/services/TaskService";

export default function SeedScreen() {
  const [isSeeding, setIsSeeding] = useState(false);
  const [isSeedingAppointments, setIsSeedingAppointments] = useState(false);
  const [isSeedingCoordinated, setIsSeedingCoordinated] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [isClearingAppointments, setIsClearingAppointments] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);
  const [appointmentSeedResult, setAppointmentSeedResult] = useState<any>(null);
  const [coordinatedSeedResult, setCoordinatedSeedResult] = useState<any>(null);
  const insets = useSafeAreaInsets();

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
            } catch (error: any) {
              console.error("❌ [SeedScreen] Error deleting tasks:", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
              });
              Alert.alert("Error", error?.message || "Failed to delete tasks");
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
            } catch (error: any) {
              console.error("❌ [SeedScreen] Error clearing appointments:", {
                error: error instanceof Error ? error.message : String(error),
                stack: error instanceof Error ? error.stack : undefined,
              });
              Alert.alert(
                "Error",
                error?.message || "Failed to clear appointments"
              );
            } finally {
              setIsClearingAppointments(false);
            }
          },
        },
      ]
    );
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
          sampleDates:
            appointmentData.clinicPatientAppointments.clinicAppointments.items
              .slice(0, 3)
              .map((apt: any) => ({ title: apt.title, startAt: apt.startAt })),
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
    } catch (error: any) {
      console.error("❌ [SeedScreen] Appointment seed error:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      Alert.alert("Error", error?.message || "Failed to seed appointments");
    } finally {
      setIsSeedingAppointments(false);
    }
  };

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
        activityIds: result.activities.map((a: any) => a.id),
        taskIds: result.tasks.map((t: any) => t.id),
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
    } catch (error: any) {
      console.error("❌ [SeedScreen] Seed error:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      Alert.alert("Error", error?.message || "Failed to seed data");
    } finally {
      setIsSeeding(false);
      console.log("🏁 [SeedScreen] Seed process finished", {
        isSeeding: false,
        hasResult: !!seedResult,
      });
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
    } catch (error: any) {
      console.error("❌ [SeedScreen] Coordinated seed error:", {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });
      Alert.alert("Error", error?.message || "Failed to seed coordinated data");
    } finally {
      setIsSeedingCoordinated(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <GlobalHeader title="Seed Data" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.section}>
          <TranslatedText text="What this does:" style={styles.sectionTitle} />
          <TranslatedText
            text="Creates sample Activities with question structures and Tasks that reference them. This allows you to test the question rendering functionality. You can also seed appointments for testing the appointment display on the dashboard."
            style={styles.sectionText}
          />
        </View>

        <View style={styles.section}>
          <TranslatedText text="Will create:" style={styles.sectionTitle} />
          <TranslatedText
            text="• 3 Activities with different question types"
            style={styles.listItem}
          />
          <TranslatedText
            text="• Tasks for today + 5 days (6 days total)"
            style={styles.listItem}
          />
          <TranslatedText
            text="• Mix of task types (SCHEDULED, TIMED, EPISODIC)"
            style={styles.listItem}
          />
          <TranslatedText
            text="• ~60% of tasks have questions (linked to activities)"
            style={styles.listItem}
          />
          <TranslatedText
            text="• ~40% are simple tasks (no questions)"
            style={styles.listItem}
          />
          <TranslatedText
            text="• Tasks spread throughout the day (8 AM - 8 PM)"
            style={styles.listItem}
          />
        </View>

        <TouchableOpacity
          style={[styles.clearButton, isClearing && styles.clearButtonDisabled]}
          onPress={handleClearAll}
          disabled={isClearing || isSeeding}
        >
          {isClearing ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <TranslatedText
              text="🗑️ Clear All Tasks"
              style={styles.clearButtonText}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.seedButton, isSeeding && styles.seedButtonDisabled]}
          onPress={handleSeed}
          disabled={isSeeding || isClearing}
        >
          {isSeeding ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <TranslatedText text="🌱 Seed Data" style={styles.seedButtonText} />
          )}
        </TouchableOpacity>

        {/* Coordinated Seeding Section */}
        <View style={styles.section}>
          <TranslatedText
            text="Appointments & Tasks Together:"
            style={styles.sectionTitle}
          />
          <TranslatedText
            text="Creates appointments and tasks together with relationships. Tasks are linked to appointments via eventId in the anchors field, scheduled relative to appointment dates, and can move with visit rescheduling. This prepares for visit-based task rescheduling functionality."
            style={styles.sectionText}
          />
        </View>

        <View style={styles.section}>
          <TranslatedText text="Will create:" style={styles.sectionTitle} />
          <TranslatedText
            text="• Activities (Health Survey, Pain Assessment, etc.)"
            style={styles.listItem}
          />
          <TranslatedText
            text="• Appointments for today, tomorrow, and next week"
            style={styles.listItem}
          />
          <TranslatedText
            text="• Tasks linked to appointments (pre-visit, visit-day, post-visit)"
            style={styles.listItem}
          />
          <TranslatedText
            text="• Standalone tasks (not linked to appointments)"
            style={styles.listItem}
          />
          <TranslatedText
            text="• Tasks scheduled relative to appointment dates using anchorDayOffset"
            style={styles.listItem}
          />
          <TranslatedText
            text="• Appointment-task relationships tracked for future rescheduling"
            style={styles.listItem}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.coordinatedSeedButton,
            isSeedingCoordinated && styles.seedButtonDisabled,
          ]}
          onPress={handleSeedCoordinated}
          disabled={
            isSeedingCoordinated ||
            isSeeding ||
            isSeedingAppointments ||
            isClearing ||
            isClearingAppointments
          }
        >
          {isSeedingCoordinated ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <TranslatedText
              text="🌱 Seed Appointments & Tasks Together"
              style={styles.seedButtonText}
            />
          )}
        </TouchableOpacity>

        {/* Appointments Section */}
        <View style={styles.section}>
          <TranslatedText text="Appointments:" style={styles.sectionTitle} />
          <TranslatedText
            text="Creates sample appointments (TELEVISIT and ONSITE) dynamically for today's date, tomorrow, and next week. Appointments are always created relative to the current date when you seed them, so they will appear on the dashboard for the correct day."
            style={styles.sectionText}
          />
        </View>

        <View style={styles.section}>
          <TranslatedText text="Will create:" style={styles.sectionTitle} />
          <TranslatedText
            text="• Appointments for today (created dynamically based on current date)"
            style={styles.listItem}
          />
          <TranslatedText
            text="• Appointments for tomorrow"
            style={styles.listItem}
          />
          <TranslatedText
            text="• Appointments for next week"
            style={styles.listItem}
          />
          <TranslatedText
            text="• Mix of TELEVISIT and ONSITE types"
            style={styles.listItem}
          />
          <TranslatedText
            text="• Various statuses (SCHEDULED, COMPLETED, CANCELLED)"
            style={styles.listItem}
          />
          <TranslatedText
            text="• Times throughout the day (9 AM, 2 PM, 4:30 PM for today)"
            style={styles.listItem}
          />
        </View>

        <TouchableOpacity
          style={[
            styles.clearButton,
            isClearingAppointments && styles.clearButtonDisabled,
          ]}
          onPress={handleClearAppointments}
          disabled={isClearingAppointments || isSeedingAppointments}
        >
          {isClearingAppointments ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <TranslatedText
              text="🗑️ Clear All Appointments"
              style={styles.clearButtonText}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.appointmentSeedButton,
            isSeedingAppointments && styles.seedButtonDisabled,
          ]}
          onPress={handleSeedAppointments}
          disabled={isSeedingAppointments || isClearingAppointments}
        >
          {isSeedingAppointments ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <TranslatedText
              text="📅 Seed Appointments"
              style={styles.seedButtonText}
            />
          )}
        </TouchableOpacity>

        {seedResult && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Task/Activity Seed Results:</Text>
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
                  {task.entityId})
                </Text>
              ))}
            </View>
          </View>
        )}

        {appointmentSeedResult && (
          <View style={styles.resultSection}>
            <Text style={styles.resultTitle}>Appointment Seed Results:</Text>
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
            <Text style={styles.resultTitle}>Coordinated Seed Results:</Text>
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#dfe4ea",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2f3542",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2f3542",
    marginBottom: 8,
  },
  sectionText: {
    fontSize: 14,
    color: "#57606f",
    lineHeight: 20,
  },
  listItem: {
    fontSize: 14,
    color: "#57606f",
    marginBottom: 4,
    paddingLeft: 8,
  },
  clearButton: {
    backgroundColor: "#e74c3c",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  clearButtonDisabled: {
    opacity: 0.6,
  },
  clearButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  seedButton: {
    backgroundColor: "#3498db",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  appointmentSeedButton: {
    backgroundColor: "#9b59b6",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  coordinatedSeedButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 24,
  },
  seedButtonDisabled: {
    opacity: 0.6,
  },
  seedButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  resultSection: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dfe4ea",
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
  },
});
