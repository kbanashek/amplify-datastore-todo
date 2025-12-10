import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface ProgressIndicatorProps {
  currentPage: number;
  totalPages: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  currentPage,
  totalPages,
}) => {
  return (
    <View style={styles.progressContainer}>
      <Text style={styles.progressText}>
        Page {currentPage} of {totalPages}
      </Text>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${(currentPage / totalPages) * 100}%`,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#dfe4ea",
  },
  progressText: {
    fontSize: 14,
    color: "#57606f",
    marginBottom: 8,
    textAlign: "center",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#ecf0f1",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#3498db",
    borderRadius: 2,
  },
});

