import { TranslatedText } from "@components/TranslatedText";
import { AppColors } from "@constants/AppColors";
import { AppFonts } from "@constants/AppFonts";
import { useTaskTranslation } from "@translations/index";
import React from "react";
import { Button, StyleSheet, Text, View } from "react-native";

/**
 * Simple test component to verify translation system works
 */
export const TranslationTest: React.FC = () => {
  const { currentLanguage, setLanguage, i18n, t } = useTaskTranslation();

  return (
    <View style={styles.container} testID="translation-test">
      <Text style={styles.title} testID="translation-test-title">
        Translation Test
      </Text>

      <Text style={styles.info} testID="translation-test-current-language">
        Current Language: {currentLanguage}
      </Text>
      <Text style={styles.info} testID="translation-test-i18n-language">
        i18n.language: {i18n.language}
      </Text>

      <View style={styles.section} testID="translation-test-t-function-section">
        <Text style={styles.label} testID="translation-test-t-function-label">
          Using t() function:
        </Text>
        <Text style={styles.result} testID="translation-test-t-begin">
          {t("task.begin", { fallback: "BEGIN" })}
        </Text>
        <Text style={styles.result} testID="translation-test-t-resume">
          {t("task.resume", { fallback: "RESUME" })}
        </Text>
        <Text style={styles.result} testID="translation-test-t-common-ok">
          {t("common.ok", { fallback: "OK" })}
        </Text>
      </View>

      <View
        style={styles.section}
        testID="translation-test-translated-text-component-section"
      >
        <Text
          style={styles.label}
          testID="translation-test-translated-text-component-label"
        >
          Using TranslatedText component:
        </Text>
        <TranslatedText
          text="BEGIN"
          testID="translation-test-translated-begin"
        />
        <TranslatedText
          text="RESUME"
          testID="translation-test-translated-resume"
        />
        <TranslatedText text="OK" testID="translation-test-translated-ok" />
        <TranslatedText
          text="Episodic Task 01 (All required)"
          testID="translation-test-translated-episodic-task"
        />
      </View>

      <View style={styles.buttonRow} testID="translation-test-language-buttons">
        <Button
          title="English"
          onPress={() => setLanguage("en")}
          testID="translation-test-button-en"
        />
        <Button
          title="Spanish"
          onPress={() => setLanguage("es")}
          testID="translation-test-button-es"
        />
        <Button
          title="French"
          onPress={() => setLanguage("fr")}
          testID="translation-test-button-fr"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: AppColors.white,
  },
  title: {
    ...AppFonts.heading,
    marginBottom: 20,
  },
  info: {
    ...AppFonts.body,
    marginBottom: 10,
  },
  section: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: AppColors.ltGray,
    borderRadius: 5,
  },
  label: {
    ...AppFonts.button,
    marginBottom: 10,
  },
  result: {
    ...AppFonts.small,
    marginVertical: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
});
