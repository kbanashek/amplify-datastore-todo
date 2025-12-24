import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { NetworkStatusIndicator } from "@components/NetworkStatusIndicator";

interface LoadingStateProps {
  taskId?: string;
  topInset: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  taskId,
  topInset,
}) => {
  return (
    <View
      testID="loading-state-container"
      style={[styles.container, { paddingTop: topInset }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {taskId ? "Answer Questions" : "Questions"}
        </Text>
        <NetworkStatusIndicator />
      </View>
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    </View>
  );
};

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
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#57606f",
    fontSize: 14,
  },
});
