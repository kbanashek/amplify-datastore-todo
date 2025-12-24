import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NetworkStatusIndicator } from "@components/NetworkStatusIndicator";

interface ErrorStateProps {
  error: string;
  taskId?: string;
  topInset: number;
  onBack: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  taskId,
  topInset,
  onBack,
}) => {
  return (
    <View
      testID="error-state-container"
      style={[styles.container, { paddingTop: topInset }]}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Questions</Text>
        <NetworkStatusIndicator />
      </View>
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
        {error.includes("entityId") && (
          <View style={styles.errorInfoBox}>
            <Text style={styles.errorInfoTitle}>What does this mean?</Text>
            <Text style={styles.errorInfoText}>
              This task doesn&apos;t have an Activity linked to it. To view
              questions, the task needs an entityId that references an Activity
              with question data.
            </Text>
            <Text style={styles.errorInfoText}>
              You can use the &quot;Seed Data&quot; option from the menu to
              create sample Activities and Tasks with questions.
            </Text>
          </View>
        )}
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
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
  errorText: {
    color: "#e74c3c",
    fontSize: 14,
    textAlign: "center",
    marginBottom: 16,
  },
  errorInfoBox: {
    backgroundColor: "#fff3cd",
    borderWidth: 1,
    borderColor: "#ffc107",
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    width: "100%",
  },
  errorInfoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#856404",
    marginBottom: 8,
  },
  errorInfoText: {
    fontSize: 14,
    color: "#856404",
    lineHeight: 20,
    marginBottom: 8,
  },
  backButton: {
    backgroundColor: "#ecf0f1",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#57606f",
    fontSize: 14,
    fontWeight: "600",
  },
});
