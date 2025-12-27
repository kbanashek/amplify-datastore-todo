import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";

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
          testID="progress-fill"
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
    backgroundColor: AppColors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: AppColors.borderGray,
  },
  progressText: {
    ...AppFonts.caption,
    color: AppColors.darkGray,
    marginBottom: 8,
    textAlign: "center",
  },
  progressBar: {
    height: 4,
    backgroundColor: AppColors.ltGray,
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: AppColors.CIBlue,
    borderRadius: 2,
  },
});
