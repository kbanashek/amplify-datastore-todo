import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useAmplify } from "@orion/task-system";

export const NetworkStatusIndicator = () => {
  const { networkStatus, syncState } = useAmplify();

  const getStatusColor = () => {
    if (networkStatus === "Offline") return "#ff6b6b"; // Red for offline
    if (syncState === "Syncing") return "#feca57"; // Yellow for syncing
    if (syncState === "Synced") return "#1dd1a1"; // Green for synced
    if (syncState === "Error") return "#ff6b6b"; // Red for error
    return "#a5b1c2"; // Gray for unknown
  };

  const getStatusText = () => {
    if (networkStatus === "Offline") return "Offline";
    if (syncState === "Syncing") return "Syncing...";
    if (syncState === "Synced") return "Online & Synced";
    if (syncState === "Error") return "Sync Error";
    return "Connecting...";
  };

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
      <Text style={styles.text}>{getStatusText()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#f5f6fa",
    borderRadius: 20,
  },
  indicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2f3542",
  },
});
