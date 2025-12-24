import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ActivityConfig } from "@task-types/ActivityConfig";

interface CompletionScreenProps {
  activityConfig: ActivityConfig;
  onDone: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({
  activityConfig,
  onDone,
}) => {
  return (
    <View style={styles.completionContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.completionContent}
      >
        <Text style={styles.completionTitle}>
          {activityConfig.completionScreen?.title || "Thank You!"}
        </Text>
        <Text style={styles.completionDescription}>
          {activityConfig.completionScreen?.description ||
            "Your assessment has been submitted successfully."}
        </Text>
        <TouchableOpacity style={styles.completionButton} onPress={onDone}>
          <Text style={styles.completionButtonText}>Done</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  completionContainer: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  scrollView: {
    flex: 1,
  },
  completionContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  completionTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#27ae60",
    marginBottom: 16,
    textAlign: "center",
  },
  completionDescription: {
    fontSize: 16,
    color: "#57606f",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
  },
  completionButton: {
    backgroundColor: "#27ae60",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
  },
  completionButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
