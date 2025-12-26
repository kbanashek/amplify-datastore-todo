import { useTranslatedText } from "@hooks/useTranslatedText";
import React from "react";
import { StyleProp, StyleSheet, Text, View, ViewStyle } from "react-native";
import { AppFonts, FontSizes } from "@constants/AppFonts";

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
  style?: StyleProp<ViewStyle>;
}

/**
 * Reusable component for displaying field labels
 * Automatically translates label text and shows required indicator
 *
 * @param label - The label text to display
 * @param fontSize - The font size of the label (default: from AppFonts.label)
 * @param fontWeight - The font weight of the label (default: from AppFonts.label)
 * @param color - The color of the label (default: from AppFonts.label)
 * @param required - Whether the field is required (default: false)
 * @param style - Additional styles to apply to the container
 * @returns A themed field label component with the provided label and required indicator
 */
export const FieldLabel: React.FC<FieldLabelProps> = ({
  label,
  fontSize = FontSizes.sm,
  fontWeight = "500",
  color = AppFonts.label.color,
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
    ...AppFonts.label,
  },
  required: {
    color: AppColors.errorRed,
  },
});
