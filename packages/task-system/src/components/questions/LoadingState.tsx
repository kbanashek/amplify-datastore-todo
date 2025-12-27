import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { NetworkStatusIndicator } from "@components/NetworkStatusIndicator";
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";

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
        <ActivityIndicator size="large" color={AppColors.CIBlue} />
        <Text style={styles.loadingText}>Loading questions...</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: AppColors.powderGray,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: AppColors.white,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderGray,
  },
  headerTitle: {
    ...AppFonts.heading,
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    ...AppFonts.small,
    marginTop: 12,
    color: AppColors.darkGray,
  },
});
