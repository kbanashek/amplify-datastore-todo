/**
 * IntroductionScreen component module.
 *
 * @module IntroductionScreen
 */

import React from "react";
import { AppFonts } from "@constants/AppFonts";
import { AppColors } from "@constants/AppColors";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTranslatedText } from "@hooks/useTranslatedText";
import { ActivityConfig } from "@task-types/ActivityConfig";
import { Task, TaskStatus } from "@task-types/Task";

/**
 * Props for the IntroductionScreen component
 */
interface IntroductionScreenProps {
  activityConfig: ActivityConfig;
  onBegin: () => void;
  task?: Task | null;
}

/**
 * IntroductionScreen component.
 *
 * @param props - Component props
 * @returns Rendered IntroductionScreen component
 */
export const IntroductionScreen: React.FC<IntroductionScreenProps> = ({
  activityConfig,
  onBegin,
  task,
}) => {
  // Determine button text key based on task status
  const getButtonTextKey = (): string => {
    // If task is STARTED or INPROGRESS, show "RESUME"
    // Handle both enum and string comparisons
    if (task) {
      const status = task.status;
      if (
        status === TaskStatus.STARTED ||
        status === TaskStatus.INPROGRESS ||
        String(status) === String(TaskStatus.STARTED) ||
        String(status) === String(TaskStatus.INPROGRESS)
      ) {
        return "RESUME";
      }
    }
    // Otherwise use configured button text or default to "Begin"
    return activityConfig.introductionScreen?.buttonText || "Begin";
  };

  // Translate all text
  const titleText = activityConfig.introductionScreen?.title || "Welcome";
  const { translatedText: translatedTitle } = useTranslatedText(titleText);

  const descriptionText =
    activityConfig.introductionScreen?.description ||
    "Please complete all questions.";
  const { translatedText: translatedDescription } =
    useTranslatedText(descriptionText);

  const buttonTextKey = getButtonTextKey();
  const { translatedText: translatedButtonText } =
    useTranslatedText(buttonTextKey);

  return (
    <View style={styles.introContainer}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.introContent}
      >
        <Text style={styles.introTitle}>{translatedTitle}</Text>
        <Text style={styles.introDescription}>{translatedDescription}</Text>
        <TouchableOpacity style={styles.beginButton} onPress={onBegin}>
          <Text style={styles.beginButtonText}>{translatedButtonText}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  introContainer: {
    flex: 1,
    backgroundColor: AppColors.powderGray,
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
    ...AppFonts.heading,
    color: AppColors.gray,
    marginBottom: 16,
    textAlign: "center",
  },
  introDescription: {
    ...AppFonts.body,
    color: AppColors.darkGray,
    lineHeight: 24,
    textAlign: "center",
    marginBottom: 32,
  },
  beginButton: {
    backgroundColor: AppColors.CIBlue,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
    minWidth: 200,
    alignItems: "center",
  },
  beginButtonText: {
    ...AppFonts.subheading,
    color: AppColors.white,
  },
});
