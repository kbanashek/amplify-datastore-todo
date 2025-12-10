import React from "react";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { ActivityConfig } from "../../types/ActivityConfig";

interface IntroductionScreenProps {
  activityConfig: ActivityConfig;
  onBegin: () => void;
}

export const IntroductionScreen: React.FC<IntroductionScreenProps> = ({
  activityConfig,
  onBegin,
}) => {
  return (
    <View style={styles.introContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.introContent}
      >
        <Text style={styles.introTitle}>
          {activityConfig.introductionScreen?.title || "Welcome"}
        </Text>
        <Text style={styles.introDescription}>
          {activityConfig.introductionScreen?.description ||
            "Please complete all questions."}
        </Text>
        <TouchableOpacity style={styles.beginButton} onPress={onBegin}>
          <Text style={styles.beginButtonText}>
            {activityConfig.introductionScreen?.buttonText || "Begin"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  introContainer: {
    flex: 1,
    backgroundColor: "#f5f6fa",
  },
  scrollView: {
    flex: 1,
  },
  introContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  introTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2f3542",
    marginBottom: 16,
    textAlign: "center",
  },
  introDescription: {
    fontSize: 16,
    color: "#57606f",
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
  },
  beginButton: {
    backgroundColor: "#3498db",
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
  },
  beginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

