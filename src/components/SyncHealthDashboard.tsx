import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAmplifyState, NetworkStatus, SyncState } from "@orion/task-system";

/**
 * Sync Health Dashboard
 *
 * Displays real-time DataStore sync status for debugging.
 * Shows network status, sync state, pending mutations, conflicts, and last sync time.
 */
export const SyncHealthDashboard: React.FC = () => {
  const {
    isReady,
    networkStatus,
    syncState,
    conflictCount,
    lastSyncedAt,
    pendingSyncCount,
  } = useAmplifyState();

  const getStatusColor = (status: NetworkStatus | SyncState): string => {
    if (networkStatus === NetworkStatus.Offline) return "#FF9800"; // Orange
    if (syncState === SyncState.Error) return "#F44336"; // Red
    if (syncState === SyncState.Synced) return "#4CAF50"; // Green
    if (syncState === SyncState.Syncing) return "#2196F3"; // Blue
    return "#9E9E9E"; // Gray
  };

  const getStatusIcon = (): string => {
    if (networkStatus === NetworkStatus.Offline) return "📡";
    if (syncState === SyncState.Error) return "❌";
    if (syncState === SyncState.Synced) return "✅";
    if (syncState === SyncState.Syncing) return "🔄";
    return "⏳";
  };

  const formatLastSync = (): string => {
    if (!lastSyncedAt) return "Never";
    const now = new Date();
    const diff = now.getTime() - lastSyncedAt.getTime();
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  const statusColor = getStatusColor(networkStatus);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{getStatusIcon()} Sync Health</Text>
        {!isReady && (
          <Text style={styles.notReady}>Initializing...</Text>
        )}
      </View>

      <View style={styles.grid}>
        {/* Network Status */}
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Network</Text>
          <Text style={[styles.metricValue, { color: statusColor }]}>
            {networkStatus === NetworkStatus.Online ? "Online" : "Offline"}
          </Text>
        </View>

        {/* Sync State */}
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Sync State</Text>
          <Text style={[styles.metricValue, { color: statusColor }]}>
            {syncState}
          </Text>
        </View>

        {/* Pending Mutations */}
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Pending</Text>
          <Text style={[
            styles.metricValue,
            { color: pendingSyncCount > 0 ? "#FF9800" : "#4CAF50" }
          ]}>
            {pendingSyncCount}
          </Text>
        </View>

        {/* Conflicts */}
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Conflicts</Text>
          <Text style={[
            styles.metricValue,
            { color: conflictCount > 0 ? "#F44336" : "#4CAF50" }
          ]}>
            {conflictCount}
          </Text>
        </View>

        {/* Last Sync */}
        <View style={[styles.metric, styles.metricWide]}>
          <Text style={styles.metricLabel}>Last Sync</Text>
          <Text style={styles.metricValue}>
            {formatLastSync()}
          </Text>
        </View>
      </View>

      {/* Warnings */}
      {pendingSyncCount > 5 && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            ⚠️ {pendingSyncCount} pending mutations - sync may be slow
          </Text>
        </View>
      )}

      {conflictCount > 0 && (
        <View style={styles.error}>
          <Text style={styles.errorText}>
            ❌ {conflictCount} conflicts detected - data may be inconsistent
          </Text>
        </View>
      )}

      {networkStatus === NetworkStatus.Offline && (
        <View style={styles.warning}>
          <Text style={styles.warningText}>
            📡 Offline - changes will sync when online
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  notReady: {
    fontSize: 12,
    color: "#FF9800",
    fontStyle: "italic",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metric: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 12,
  },
  metricWide: {
    minWidth: "100%",
  },
  metricLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
    fontWeight: "600",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#333",
  },
  warning: {
    backgroundColor: "#fff9e6",
    borderWidth: 1,
    borderColor: "#ffe066",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  warningText: {
    fontSize: 13,
    color: "#b8860b",
    lineHeight: 18,
  },
  error: {
    backgroundColor: "#fee",
    borderWidth: 1,
    borderColor: "#fcc",
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  errorText: {
    fontSize: 13,
    color: "#c00",
    lineHeight: 18,
  },
});
