import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTaskHistoryList } from "@orion/task-system";
import { TaskHistoryService } from "@orion/task-system";
import { NetworkStatusIndicator } from "../../src/components/NetworkStatusIndicator";

export default function TaskHistoryScreen() {
  const { taskHistories, loading, error, handleDeleteTaskHistory } =
    useTaskHistoryList();
  const [showForm, setShowForm] = useState(false);
  const [taskInstanceId, setTaskInstanceId] = useState("");
  const [status, setStatus] = useState("");
  const [statusBeforeExpired, setStatusBeforeExpired] = useState("");
  const [action, setAction] = useState("");
  const [details, setDetails] = useState("");
  const [pk, setPk] = useState(`TASKHISTORY-${Date.now()}`);
  const [sk, setSk] = useState(`SK-${Date.now()}`);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const insets = useSafeAreaInsets();

  const handleSubmit = async () => {
    if (!pk.trim() || !sk.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await TaskHistoryService.createTaskHistory({
        pk: pk.trim(),
        sk: sk.trim(),
        taskInstanceId: taskInstanceId.trim() || null,
        status: status.trim() || null,
        statusBeforeExpired: statusBeforeExpired.trim() || null,
        timestamp: new Date().toISOString(),
        action: action.trim() || null,
        details: details.trim() || null,
      });
      setTaskInstanceId("");
      setStatus("");
      setStatusBeforeExpired("");
      setAction("");
      setDetails("");
      setPk(`TASKHISTORY-${Date.now()}`);
      setSk(`SK-${Date.now()}`);
      setShowForm(false);
    } catch (err) {
      console.error("Error creating task history:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Task History</Text>
        <NetworkStatusIndicator />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.createSection}>
          {!showForm ? (
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => setShowForm(true)}
            >
              <Text style={styles.createButtonText}>
                + Create New History Entry
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.formTitle}>Create Task History</Text>

              <TextInput
                style={styles.input}
                placeholder="Task Instance ID (optional)"
                value={taskInstanceId}
                onChangeText={setTaskInstanceId}
                editable={!isSubmitting}
                autoFocus
              />

              <TextInput
                style={styles.input}
                placeholder="Status (optional)"
                value={status}
                onChangeText={setStatus}
                editable={!isSubmitting}
              />

              <TextInput
                style={styles.input}
                placeholder="Status Before Expired (optional)"
                value={statusBeforeExpired}
                onChangeText={setStatusBeforeExpired}
                editable={!isSubmitting}
              />

              <TextInput
                style={styles.input}
                placeholder="Action (optional)"
                value={action}
                onChangeText={setAction}
                editable={!isSubmitting}
              />

              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Details (JSON string, optional)"
                value={details}
                onChangeText={setDetails}
                editable={!isSubmitting}
                multiline
                numberOfLines={3}
              />

              <TextInput
                style={styles.input}
                placeholder="PK *"
                value={pk}
                onChangeText={setPk}
                editable={!isSubmitting}
              />

              <TextInput
                style={styles.input}
                placeholder="SK *"
                value={sk}
                onChangeText={setSk}
                editable={!isSubmitting}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setShowForm(false);
                    setTaskInstanceId("");
                    setStatus("");
                    setStatusBeforeExpired("");
                    setAction("");
                    setDetails("");
                  }}
                  disabled={isSubmitting}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.submitButton]}
                  onPress={handleSubmit}
                  disabled={isSubmitting || !pk.trim() || !sk.trim()}
                >
                  {isSubmitting ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.submitButtonText}>Create</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={styles.listSection}>
          <Text style={styles.listTitle}>
            Task History ({taskHistories.length})
          </Text>

          {loading && taskHistories.length === 0 ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#3498db" />
              <Text style={styles.loadingText}>Loading task history...</Text>
            </View>
          ) : error ? (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : taskHistories.length === 0 ? (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>
                No task history yet. Create one above!
              </Text>
            </View>
          ) : (
            taskHistories.map(th => (
              <View key={th.id} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.cardTitle}>
                      {th.taskInstanceId || "History Entry"}
                    </Text>
                    {th.status && (
                      <Text style={styles.cardSubtitle}>
                        Status: {th.status}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteTaskHistory(th.id)}
                    style={styles.deleteButton}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
                {th.action && (
                  <Text style={styles.cardMeta}>Action: {th.action}</Text>
                )}
                {th.timestamp && (
                  <Text style={styles.cardMeta}>Time: {th.timestamp}</Text>
                )}
                {th.statusBeforeExpired && (
                  <Text style={styles.cardMeta}>
                    Before Expired: {th.statusBeforeExpired}
                  </Text>
                )}
                {th.details && (
                  <Text style={styles.cardMeta}>
                    Details: {th.details.substring(0, 50)}...
                  </Text>
                )}
                <Text style={styles.cardMeta}>PK: {th.pk}</Text>
                <Text style={styles.cardMeta}>SK: {th.sk}</Text>
              </View>
            ))
          )}
        </View>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
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
    padding: 16,
  },
  createSection: {
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: "#3498db",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#dfe4ea",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2f3542",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#dfe4ea",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    color: "#2f3542",
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#ecf0f1",
  },
  cancelButtonText: {
    color: "#57606f",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#3498db",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  listSection: {
    marginTop: 8,
  },
  listTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2f3542",
    marginBottom: 16,
  },
  centerContainer: {
    padding: 32,
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#57606f",
    fontSize: 14,
  },
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    textAlign: "center",
  },
  emptyText: {
    color: "#747d8c",
    fontSize: 16,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2f3542",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#57606f",
    marginTop: 4,
  },
  cardMeta: {
    fontSize: 12,
    color: "#95a5a6",
    fontFamily: "monospace",
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: "#e74c3c",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  deleteButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
});
