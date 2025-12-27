import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NetworkStatusIndicator } from "@components/NetworkStatusIndicator";
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";

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
    color: AppColors.gray,
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  errorText: {
    ...AppFonts.small,
    color: AppColors.errorRed,
    textAlign: "center",
    marginBottom: 16,
  },
  errorInfoBox: {
    backgroundColor: AppColors.lightYellow,
    borderWidth: 1,
    borderColor: AppColors.legacy.warning,
    borderRadius: 8,
    padding: 16,
    marginTop: 20,
    marginBottom: 20,
    width: "100%",
  },
  errorInfoTitle: {
    ...AppFonts.bodyBold,
    color: AppColors.legacy.dark,
    marginBottom: 8,
  },
  errorInfoText: {
    ...AppFonts.small,
    color: AppColors.legacy.dark,
    lineHeight: 20,
    marginBottom: 8,
  },
  backButton: {
    backgroundColor: AppColors.legacy.lightGray,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  backButtonText: {
    ...AppFonts.label,
    color: "AppColors.darkGray",
  },
});
