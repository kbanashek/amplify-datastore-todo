import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTranslatedText } from "@hooks/useTranslatedText";

interface FieldLabelProps {
  label: string;
  fontSize?: number;
  fontWeight?:
    | "normal"
    | "bold"
    | "100"
    | "200"
    | "300"
    | "400"
    | "500"
    | "600"
    | "700"
    | "800"
    | "900";
  color?: string;
  required?: boolean;
  style?: any;
}

/**
 * Reusable component for displaying field labels
 * Automatically translates label text and shows required indicator
 */
export const FieldLabel: React.FC<FieldLabelProps> = ({
  label,
  fontSize = 14,
  fontWeight = "500",
  color = "#2f3542",
  required = false,
  style,
}) => {
  const { translatedText } = useTranslatedText(label);

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, { fontSize, fontWeight, color }]}>
        {translatedText || label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2f3542",
  },
  required: {
    color: "#e74c3c",
  },
});
