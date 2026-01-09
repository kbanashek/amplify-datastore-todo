import { NetworkStatus, SyncState, useAmplify } from "@orion/task-system";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const getRelativeTimeString = (date: Date | null): string => {
  if (!date) return "Never";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);

  if (diffSec < 60) return "Just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  return `${Math.floor(diffSec / 86400)}d ago`;
};

export const SyncStatusBanner: React.FC = () => {
  const {
    networkStatus,
    syncState,
    conflictCount,
    lastSyncedAt,
    pendingSyncCount,
  } = useAmplify();

  const isError = syncState === SyncState.Error;
  const isSynced = syncState === SyncState.Synced;
  const isOffline = networkStatus === NetworkStatus.Offline;
  const hasQueue = pendingSyncCount > 0;

  const statusText = isError ? "Sync error" : isSynced ? "Synced" : "Syncing";
  const relativeTime = getRelativeTimeString(lastSyncedAt);

  return (
    <View
      style={[
        styles.container,
        isError && styles.containerError,
        isSynced && styles.containerSynced,
        isOffline && styles.containerOffline,
      ]}
      testID="sync-status-banner"
    >
      <Text style={styles.title} testID="sync-status-title">
        Sync Status
      </Text>
      <Text style={styles.value} testID="sync-status-value">
        {statusText} • {networkStatus}
        {conflictCount > 0 ? ` • Conflicts: ${conflictCount}` : ""}
      </Text>

      {/* Show queue count if items are pending (priority over timestamp) */}
      {hasQueue && (
        <Text style={styles.queueCount} testID="pending-sync-count">
          📤 {pendingSyncCount} item{pendingSyncCount !== 1 ? "s" : ""} waiting
          to sync
        </Text>
      )}

      {/* Show timestamp if no queue and we have a last sync time */}
      {!hasQueue && lastSyncedAt && (
        <Text style={styles.timestamp} testID="last-synced-timestamp">
          Last synced: {relativeTime}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#f1f2f6",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#dfe4ea",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  containerSynced: {
    backgroundColor: "#eafaf1",
    borderColor: "#b8e6c8",
  },
  containerOffline: {
    backgroundColor: "#fff7e6",
    borderColor: "#ffd8a8",
  },
  containerError: {
    backgroundColor: "#ffecec",
    borderColor: "#ffb3b3",
  },
  title: {
    fontSize: 12,
    fontWeight: "700",
    color: "#2f3542",
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    color: "#2f3542",
  },
  timestamp: {
    fontSize: 11,
    color: "#747d8c",
    marginTop: 4,
    fontStyle: "italic",
  },
  queueCount: {
    fontSize: 11,
    color: "#f39c12",
    marginTop: 4,
    fontWeight: "600",
  },
});
