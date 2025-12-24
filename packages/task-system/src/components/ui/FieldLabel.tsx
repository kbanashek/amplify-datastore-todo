import { useTranslatedText } from "@hooks/useTranslatedText";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

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
 *
 * @param label - The label text to display
 * @param fontSize - The font size of the label (default: 14)
 * @param fontWeight - The font weight of the label (default: 500)
 * @param color - The color of the label (default: #2f3542)
 * @param required - Whether the field is required (default: false)
 * @param style - Additional styles to apply to the container
 * @returns A themed field label component with the provided label and required indicator
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
