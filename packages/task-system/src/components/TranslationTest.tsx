import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useTaskTranslation } from "@translations/index";
import { TranslatedText } from "@components/TranslatedText";

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
        <Text style={styles.label}>Using t() function:</Text>
        <Text style={styles.result} testID="translation-test-begin">
          {t("task.begin", { fallback: "BEGIN" })}
        </Text>
        <Text style={styles.result} testID="translation-test-resume">
          {t("task.resume", { fallback: "RESUME" })}
        </Text>
        <Text style={styles.result} testID="translation-test-ok">
          {t("common.ok", { fallback: "OK" })}
        </Text>
      </View>

      <View style={styles.section} testID="translation-test-component-section">
        <Text style={styles.label}>Using TranslatedText component:</Text>
        <TranslatedText
          text="BEGIN"
          testID="translation-test-component-begin"
        />
        <TranslatedText
          text="RESUME"
          testID="translation-test-component-resume"
        />
        <TranslatedText text="OK" testID="translation-test-component-ok" />
        <TranslatedText
          text="Episodic Task 01 (All required)"
          testID="translation-test-component-episodic"
        />
      </View>

      <View style={styles.buttonRow} testID="translation-test-buttons">
        <View testID="translation-test-button-en">
          <Button title="English" onPress={() => setLanguage("en")} />
        </View>
        <View testID="translation-test-button-es">
          <Button title="Spanish" onPress={() => setLanguage("es")} />
        </View>
        <View testID="translation-test-button-fr">
          <Button title="French" onPress={() => setLanguage("fr")} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  info: {
    fontSize: 16,
    marginBottom: 10,
  },
  section: {
    marginVertical: 20,
    padding: 10,
    backgroundColor: "#f5f5f5",
    borderRadius: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  result: {
    fontSize: 14,
    marginVertical: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
});
