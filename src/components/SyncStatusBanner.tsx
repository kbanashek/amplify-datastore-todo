import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { NetworkStatus, SyncState, useAmplify } from "@orion/task-system";

export const SyncStatusBanner: React.FC = () => {
  const { networkStatus, syncState, conflictCount } = useAmplify();

  const isError = syncState === SyncState.Error;
  const isSynced = syncState === SyncState.Synced;
  const isOffline = networkStatus === NetworkStatus.Offline;

  const statusText = isError ? "Sync error" : isSynced ? "Synced" : "Syncing";

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
});
