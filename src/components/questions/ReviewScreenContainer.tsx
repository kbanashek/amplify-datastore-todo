import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { ReviewScreen } from "./ReviewScreen";
import { ParsedActivityData } from "../../utils/activityParser";

interface ReviewScreenContainerProps {
  activityData: ParsedActivityData;
  answers: Record<string, any>;
  isSubmitting: boolean;
  onBackToQuestions: () => void;
  onSubmit: () => void;
}

export const ReviewScreenContainer: React.FC<ReviewScreenContainerProps> = ({
  activityData,
  answers,
  isSubmitting,
  onBackToQuestions,
  onSubmit,
}) => {
  return (
    <View style={styles.reviewContainer}>
      <ReviewScreen screens={activityData.screens} answers={answers} />
      <View style={styles.reviewButtons}>
        <TouchableOpacity
          style={styles.reviewButton}
          onPress={onBackToQuestions}
        >
          <Text style={styles.reviewButtonText}>Edit Answers</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.reviewButton, styles.submitButton]}
          onPress={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  reviewContainer: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  reviewButtons: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    padding: 20,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#dfe4ea",
    gap: 12,
  },
  reviewButton: {
    flex: 1,
    backgroundColor: "#ecf0f1",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  reviewButtonText: {
    color: "#57606f",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#3498db",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 0,
    marginBottom: 0,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

