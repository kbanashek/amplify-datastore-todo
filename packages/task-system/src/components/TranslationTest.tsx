import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";
import { useTaskTranslation } from "../translations";
import { TranslatedText } from "./TranslatedText";

/**
 * Simple test component to verify translation system works
 */
export const TranslationTest: React.FC = () => {
  const { currentLanguage, setLanguage, i18n, t } = useTaskTranslation();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Translation Test</Text>

      <Text style={styles.info}>Current Language: {currentLanguage}</Text>
      <Text style={styles.info}>i18n.language: {i18n.language}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>Using t() function:</Text>
        <Text style={styles.result}>
          {t("task.begin", { fallback: "BEGIN" })}
        </Text>
        <Text style={styles.result}>
          {t("task.resume", { fallback: "RESUME" })}
        </Text>
        <Text style={styles.result}>{t("common.ok", { fallback: "OK" })}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Using TranslatedText component:</Text>
        <TranslatedText text="BEGIN" />
        <TranslatedText text="RESUME" />
        <TranslatedText text="OK" />
        <TranslatedText text="Episodic Task 01 (All required)" />
      </View>

      <View style={styles.buttonRow}>
        <Button title="English" onPress={() => setLanguage("en")} />
        <Button title="Spanish" onPress={() => setLanguage("es")} />
        <Button title="French" onPress={() => setLanguage("fr")} />
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
